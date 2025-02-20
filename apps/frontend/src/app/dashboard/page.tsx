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
import mqtt from 'mqtt';
import * as React from 'react';
import { useCallback, useEffect } from 'react';
import { useAuth } from 'react-oidc-context';

export default function Page(): React.JSX.Element {
  const clientMQTT = React.useRef<mqtt.MqttClient | undefined>();
  const [isPaginating, setIsPaginating] = React.useState(false);
  const { addData, cleanDataStore, filters, applyFiltersMap } =
    useDataStore();
  const auth = useAuth();

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
      addData(data.timestamp, data.counters, data.states, true);
    });

    client.on('error', (err) => {
      console.error('Error en la conexión MQTT:', err);
    });

    client.on('close', () => {
      console.log('Conexión MQTT cerrada');
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
      setIsPaginating(true);
      cleanDataStore();
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

        response.pimmStates.forEach((PIMMState) => {
          addData(PIMMState.timestamp, PIMMState.counters, PIMMState.states);
        });
      }

      setIsPaginating(false);
    },
    []
  );

  //Offline data
  useEffect(() => {
    const fetchData = async () => {
      if (filters.live) return;
      if (!auth.user) return;

      if (isPaginating) return;
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
  ]);

  //Online data
  useEffect(() => {
    if (clientMQTT.current && clientMQTT.current.connected && !filters.live) {
      clientMQTT.current.end();
      clientMQTT.current.removeAllListeners();
      return;
    }
    const fetchData = async () => {
      if (!filters.live) return;
      if (!auth.user) return;

      if (!isPaginating)
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
              {!isPaginating ? <FilterForm /> : 'Loading ...'}
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid lg={12} sm={12} xs={12}>
        <Card>
          <CardHeader title="Information" />
          <CardContent>
            <pre>
              {!isPaginating
                ? JSON.stringify(
                   applyFiltersMap(filters),
                    null,
                    2
                  ).substring(0,1000)
                : 'Loading ...'}
            </pre>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
