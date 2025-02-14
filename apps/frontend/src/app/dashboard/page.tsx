/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import FilterForm from '@/components/dashboard/filters/filter-form';
import { config } from '@/config';
import {
  fetchCredentialsCore,
  fetchData,
} from '@/connections/backend-connections';
import { Filters } from '@/types/filters';
import { Card, CardContent, CardHeader } from '@mui/material';
import Grid from '@mui/material/Unstable_Grid2';
import { Box } from '@mui/system';
import { PIMMState } from '@repo-hub/internal';
import mqtt from 'mqtt';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { unstable_batchedUpdates } from 'react-dom';
import { useAuth } from 'react-oidc-context';

export default function Page(): React.JSX.Element {
  const [filters, setFilters] = useState<Filters>({
    initTime: Date.now(),
    endTime: Date.now(),
    accUnit: 'second',
    offset: false,
    live: false,
    states: [],
    selected: [],
  });
  const [isConnected, setIsConnected] = useState(false);
  const [originalData, setOriginalData] = useState<PIMMState[]>([]);
  const isPaginating = React.useRef(false);
  const auth = useAuth();
  const clientMQTT = React.useRef<mqtt.MqttClient | undefined>();
  const offsets = React.useRef<
    Record<
      string,
      Record<
        string,
        { start: number; end: number; value: number; previousValue: number }
      >
    >
  >({});
  const filterIdStateKeyMap = React.useMemo(() => config.stateKeys, []);

  const applyFilters = useCallback(
    (offset: boolean, selected: string[], PIMMStates: PIMMState[]) => {
      if (selected.length === 0) return PIMMStates;

      const filteredPIMMStates: PIMMState[] = []; // Use Array instead of Set
      const selectionMap = new Map<string, Map<string, string | null>>(); // O(M) space

      // Convert selected into a map for O(1) lookups
      for (const value of selected) {
        const [filterPIMMNumber, filterStateKey, filterStateValue] =
          value.split('-');
        if (!selectionMap.has(filterPIMMNumber)) {
          selectionMap.set(filterPIMMNumber, new Map());
        }
        if (filterStateKey) {
          if (filterStateKey) {
            selectionMap
              .get(filterPIMMNumber)
              ?.set(filterStateKey, filterStateValue ?? null);
          }
        }
      }

      if (offset) {
        // Apply offset logic
        for (let i = 0; i < PIMMStates.length; i++) {
          const PIMMState = PIMMStates[i];
          const statePIMMNumber = PIMMState.states.find(
            (variable) => variable.id === config.keyPIMMNumber
          )?.value; // INDEX
          if (!statePIMMNumber) continue;

          if (!offsets.current[statePIMMNumber]) {
            offsets.current[statePIMMNumber] = {};
          }

          for (const offsetKey of config.offsetKeys) {
            const counter = PIMMState.counters.find((c) => c.id === offsetKey); // INDEX
            const counterValue = counter ? Number(counter.value) : 0;

            if (!offsets.current[statePIMMNumber][offsetKey]) {
              offsets.current[statePIMMNumber][offsetKey] = {
                start: 0,
                end: 0,
                value: 0,
                previousValue: 0,
              };
            }

            const offsetEntry = offsets.current[statePIMMNumber][offsetKey];

            if (i === 0 && offsetEntry.start > 0) {
              offsetEntry.start = counterValue;
              if (counter) counter.value = '0';
            }

            if (counterValue < offsetEntry.previousValue) {
              offsetEntry.end = offsetEntry.previousValue;
              offsetEntry.value += offsetEntry.end - offsetEntry.start;
              offsetEntry.start = 0;
              if (counter) counter.value = String(offsetEntry.value);
            }

            offsetEntry.previousValue = counterValue;
          }
        }
      }

      // Apply selection filter efficiently
      for (const PIMMState of PIMMStates) {
        const statePIMMNumber = PIMMState.states.find(
          (variable) => variable.id === config.keyPIMMNumber
        )?.value; // INDEX

        if (!statePIMMNumber || !selectionMap.has(statePIMMNumber)) continue;

        const stateFilters = selectionMap.get(statePIMMNumber);
        if (!stateFilters) continue;
        let match = stateFilters.size === 0; // If no specific filters, allow the whole PIMMState

        for (const variable of PIMMState.states) {
          if (stateFilters.has(variable.name)) {
            const filterValue = stateFilters.get(variable.name);
            if (!filterValue || variable.value === filterValue) {
              match = true;
              break; // No need to check further
            }
          }
        }

        if (match) filteredPIMMStates.push(PIMMState);
      }

      return filteredPIMMStates;
    },
    [filterIdStateKeyMap]
  );

  const getFilterableCategories = useCallback((PIMMStates: PIMMState[]) => {
    const states = new Set<string>();
    const variableIdSet = new Set(config.stateKeys); // O(K) preprocessing

    PIMMStates.forEach((PIMMState) => {
      const statePIMMNumber = PIMMState.states.find(
        (variable) => variable.id === config.keyPIMMNumber
      )?.value;
      if (!statePIMMNumber) return;

      PIMMState.states.forEach((variable) => {
        if (variableIdSet.has(variable.id)) {
          // O(1) lookup
          states.add(`${statePIMMNumber}-${variable.name}-${variable.value}`);
        }
      });
    });

    return Array.from(states);
  }, []);

  const connectToIoT = useCallback(async (token: string) => {
    const response = await fetchCredentialsCore(token);
    const { sessionToken, expiration } = response.token;

    console.log('Conectando a AWS IoT...');
    const url = config.socketURL;
    const client = mqtt.connect(url, {
      username: 'the_username',
      password: sessionToken,
      clientId: `clientId-${Date.now()}-${Math.random()
        .toString(16)
        .substring(2)}`,
      protocolId: 'MQTT',
      protocolVersion: 5,
      clean: true,
      reconnectPeriod: 0,
      connectTimeout: 5000,
      keepalive: 30,
    });

    client.on('connect', () => {
      console.log('Conectado a AWS IoT!');
      setIsConnected(true);
      client.subscribe('PIMMStateTopic', (err) => {
        if (err) {
          console.error('Error al suscribirse:', err);
        } else {
          console.log('Suscrito a PIMMStateTopic');
        }
      });
    });

    client.on('message', (topic, message) => {
      const data = JSON.parse(message.toString());
      unstable_batchedUpdates(() => {
        setFilters((prevFilter) => ({
          ...prevFilter,
          initTime: data.timestamp - config.lapseLive,
          endTime: data.timestamp,
          states: [...prevFilter.states, ...getFilterableCategories([data])],
        }));
        setOriginalData((prev) => [...prev.slice(1), data]);
      });
    });

    client.on('error', (err) => {
      console.error('Error en la conexión MQTT:', err);
    });

    client.on('close', () => {
      console.log('Conexión MQTT cerrada');
      setIsConnected(false);
    });

    return client;
  }, []);

  const paginateRequest = useCallback(
    async (
      filters: {
        initTime: number;
        endTime: number;
        accUnit: 'second' | 'minute' | 'hour';
      },
      token: string
    ) => {
      isPaginating.current = true;
      setOriginalData([]);
      offsets.current = {};

      let lastID: number | null = null;
      const length = config.paginationLength;
      let hasMore = true;

      while (hasMore) {
        const response = await fetchData(
          {
            filters: {
              initTime: filters.initTime,
              endTime: filters.endTime,
              accUnit: filters.accUnit,
              lastID,
              length,
            },
          },
          token
        );

        lastID = response.lastID;
        hasMore = response.hasMore;
        unstable_batchedUpdates(() => {
          setFilters((prevFilter) => ({
            ...prevFilter,
            states: [
              ...prevFilter.states,
              ...getFilterableCategories([...response.pimmStates]),
            ],
          }));
          setOriginalData((prev) => [...prev, ...response.pimmStates]);
        });
      }

      isPaginating.current = false;
    },
    []
  );

  useEffect(() => {
    const fetchData = async () => {
      if (filters.live) return;
      if (!auth.user) return;

      if (isPaginating.current) return;
      await paginateRequest(
        {
          initTime: filters.initTime,
          endTime: filters.endTime,
          accUnit: filters.accUnit,
        },
        auth.user.access_token
      );
    };

    fetchData();
  }, [
    filters.accUnit,
    filters.endTime,
    filters.initTime,
    filters.live,
    filters.offset,
  ]);

  useEffect(() => {
    if (clientMQTT.current && clientMQTT.current.connected && !filters.live) {
      clientMQTT.current.end();
      clientMQTT.current.removeAllListeners();
      return;
    }
    const fetchData = async () => {
      if (!filters.live) return;
      if (!auth.user) return;

      await paginateRequest(
        {
          initTime: new Date().getTime() - config.lapseLive,
          endTime: new Date().getTime(),
          accUnit: filters.accUnit,
        },
        auth.user.access_token
      );

      clientMQTT.current = await connectToIoT(auth.user.access_token);

      return () => {
        if (clientMQTT.current && clientMQTT.current.connected) {
          clientMQTT.current.end();
          clientMQTT.current.removeAllListeners();
        }
      };
    };

    fetchData();
  }, [filters.accUnit, filters.live, filters.offset]);

  return (
    <Grid container spacing={3}>
      <Grid lg={12} sm={12} xs={12}>
        <Card>
          <CardHeader title="Settings" />
          <CardContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <FilterForm filters={filters} setFilters={setFilters} />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid lg={12} sm={12} xs={12}>
        <Card>
          <CardHeader title="Information" />
          <CardContent>
            <pre>
              {' '}
              {JSON.stringify(
                applyFilters(filters.offset, filters.selected, [
                  ...originalData,
                ]),
                null,
                2
              )}
            </pre>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
