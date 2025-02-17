/* eslint-disable react-hooks/exhaustive-deps */
'use client';
import FilterForm from '@/components/dashboard/filters/filter-form';
import { config } from '@/config';
import {
  fetchCredentialsCore,
  fetchData,
} from '@/connections/backend-connections';
import { useDataStore } from '@/contexts/data-store';
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

  const [isConnected, setIsConnected] = useState(false);

  const {
    addData,
    filterByStates,
    dataMap,
    cleanDataStore,
    filters,
  } = useDataStore();
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

  const applyFiltersMap = useCallback(
    (offset: boolean, selected: string[]) => {
      const PIMMStates = new Map(dataMap.current);
      if (selected.length === 0) return Array.from(PIMMStates);

      const options = selected.flatMap((value) => {
        const [filterPIMMNumber, filterStateKey, filterStateValue] =
          value.split('-');
        return [
          {
            stateId: filterStateKey,
            value: filterStateValue,
          },
          { stateId: config.keyPIMMNumber, value: Number(filterPIMMNumber) },
        ];
      });

      const filteredPIMMStates: PIMMState[] = filterByStates(options);
      if (offset) {
        filteredPIMMStates.forEach((PIMMState, i) => {
          // Convert states & counters into Maps for O(1) lookups
          const stateMap = new Map(PIMMState.states.map((s) => [s.id, s]));
          const counterMap = new Map(PIMMState.counters.map((c) => [c.id, c]));

          // Get PIMM Number (from indexed stateMap)
          const statePIMMNumber = stateMap.get(config.keyPIMMNumber)?.value;
          if (!statePIMMNumber) return;

          if (!offsets.current[statePIMMNumber]) {
            offsets.current[statePIMMNumber] = {};
          }

          for (const offsetKey of config.offsetKeys) {
            // O(1) lookup instead of O(C) find()
            const counter = counterMap.get(offsetKey);
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
        });
      }
      return filteredPIMMStates;
    },
    [filterIdStateKeyMap]
  );

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
       
        addData(data.timestamp, data.counters, data.states);
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
      cleanDataStore();
      offsets.current = {};

      let lastID: number | null = null;
      const length = config.paginationLength;
      let hasMore = true;
      let counterObjects = 0;

      while (hasMore && counterObjects <= config.maxObjects) {
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
        counterObjects += response.pimmStates.length;
        unstable_batchedUpdates(() => {
        
          response.pimmStates.forEach((PIMMState) => {
            addData(PIMMState.timestamp, PIMMState.counters, PIMMState.states);
          });
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
  }, [filters.accUnit, filters.live]);

  return (
    <Grid container spacing={3}>
      <Grid lg={12} sm={12} xs={12}>
        <Card>
          <CardHeader title="Settings" />
          <CardContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <FilterForm />
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
                applyFiltersMap(filters.offset, filters.selected)
              )}{' '}
            </pre>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
