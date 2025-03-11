/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import FilterForm from '@/components/filters/filter-form';
import CardFactor from '@/components/graphs/CardFactor';
import TimeSeriesLineChart from '@/components/graphs/LineChart';
import MultiLayerPieChart from '@/components/graphs/MultiLayerPieChart';
import PolarChart from '@/components/graphs/PolarChart';
import StackedBarChart from '@/components/graphs/StackedBarChart';
import Table from '@/components/graphs/Table';
import { config } from '@/config';
import {
  fetchCredentialsCore,
  fetchData,
} from '@/data-access/diax-back/diax-back';
import { type FEPIMM, type Filters, type Parameters } from './dashboard.types';
import { Card, CardContent, CardHeader } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { Box } from '@mui/system';
import { InfoSettings, PIMM } from '@repo-hub/internal';
import mqtt from 'mqtt';
import { ValueOf } from 'next/dist/shared/lib/constants';
import * as React from 'react';
import { JSONTree } from 'react-json-tree';
import { useAuth } from 'react-oidc-context';

export default function Page(): React.JSX.Element {
  const [filters, setFilters] = React.useState<Filters>({
    equipos: new Map<string, boolean>(),
    operarios: new Map<string, boolean>(),
    ordenes: new Map<string, boolean>(),
    lotes: new Map<string, boolean>(),
    moldes: new Map<string, boolean>(),
    materiales: new Map<string, boolean>(),
  });

  const [parameters, setParameters] = React.useState<Parameters>({
    live: false,
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
    step: 'second',
  });

  const auth = useAuth();

  const [PIMMs, setPIMMs] = React.useState<PIMM[]>([]);
  const [filteredPIMMs, setFilteredPIMMs] = React.useState<FEPIMM[]>([]);

  const MQTT = React.useRef<mqtt.MqttClient | undefined>(undefined);

  const MS_CONVERSION: { [key in 'second' | 'minute' | 'hour']: number } = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
  };

  type Molde = {
    [key: string]: {
      acc_cav1: number;
      acc_cav2: number;
      acc_cav3: number;
      acc_cav4: number;
      acc_cav5: number;
      acc_cav6: number;
      acc_gramosgeneral: number;
    };
  };

  interface GroupedFEPIMM {
    items: FEPIMM[];
    timestamp: number;
    overall: { [key: string]: number };
  }

  React.useEffect(() => {
    setFilteredPIMMs(applyFilters(parameters, filters, PIMMs));
  }, [PIMMs, filters]);

  React.useEffect(() => {
    fetchPIMMs(parameters);
    if (parameters.live) {
      connectToIoT();
    } else {
      MQTT.current?.removeAllListeners();
      MQTT.current?.end();
    }
  }, [parameters]);

  const applyFilters: (
    parameters: Parameters,
    filters: Filters,
    PIMMs: PIMM[]
  ) => FEPIMM[] = (
    parameters: Parameters,
    filters: Filters,
    PIMMs: PIMM[]
  ): FEPIMM[] => {
    //Offset

    if (PIMMs.length == 0) return [];
    const FEPIMMs: FEPIMM[] = [];
    const offsets: Record<
      string,
      Record<
        string,
        { start: number; end: number; value: number; previousValue: number }
      >
    > = {};

    const diffDate = PIMMs[PIMMs.length - 1].timestamp - PIMMs[0].timestamp;
    const allFiltersFalse = Object.values(filters).every((filterMap) =>
      Array.from(filterMap.values()).every((value) => value === false)
    );

    PIMMs.forEach((PIMM: PIMM, i: number) => {
      //CHANGE TO  for const pim in pimms, foreach

      const stateMap = new Map(PIMM.states.map((s) => [s.name, s]));
      const counterMap = new Map(PIMM.counters.map((c) => [c.name, c]));
      let shouldContinue = allFiltersFalse;
      if (filters.equipos.get(String(stateMap.get('Numero Inyectora')?.value)))
        shouldContinue = true;
      if (filters.lotes.get(String(stateMap.get('Lote')?.value)))
        shouldContinue = true;
      if (filters.materiales.get(String(stateMap.get('Material')?.value)))
        shouldContinue = true;
      if (filters.moldes.get(String(stateMap.get('Molde')?.value)))
        shouldContinue = true;
      if (filters.operarios.get(String(stateMap.get('Operario')?.value)))
        shouldContinue = true;
      if (filters.ordenes.get(String(stateMap.get('Orden')?.value)))
        shouldContinue = true;

      if (shouldContinue) {
        if (parameters.endDate != parameters.startDate) {
          const statePIMMNumber = stateMap.get(config.keyPIMMNumber)?.value;
          if (!statePIMMNumber) return;

          if (!offsets[statePIMMNumber]) {
            offsets[statePIMMNumber] = {};
          }

          for (const offsetKey of config.offsetKeys) {
            const counter = counterMap.get(offsetKey);
            const counterValue = counter ? Number(counter.value) : 0;

            if (!offsets[statePIMMNumber][offsetKey]) {
              offsets[statePIMMNumber][offsetKey] = {
                start: 0,
                end: 0,
                value: 0,
                previousValue: 0,
              };
            }

            const offsetEntry = offsets[statePIMMNumber][offsetKey];

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

        FEPIMMs.push({
          ...PIMM,
          buenas:
            Number(counterMap.get('Contador Unidades')?.value) -
            Number(counterMap.get('Unidades Defecto Inicio Turno')?.value) -
            Number(counterMap.get('Unidades No Conformes')?.value),
          ineficiencias:
            (Number(counterMap.get('Minutos Motor Encendido')?.value) * 60) /
              Number(counterMap.get('Segundos Ciclo Estandar')?.value) -
            Number(counterMap.get('Contador Inyecciones')?.value),
          producidas:
            diffDate / MS_CONVERSION[parameters.step] -
            Number(counterMap.get('Minutos No Programada')?.value) -
            (Number(counterMap.get('Minutos Mantto Maquina')?.value) +
              Number(counterMap.get('Minutos Mantto Molde')?.value) +
              Number(counterMap.get('Minutos Sin Operario')?.value) +
              Number(counterMap.get('Minutos Por Material')?.value) +
              Number(counterMap.get('Minutos Calidad')?.value) +
              Number(counterMap.get('Minutos Montaje')?.value)),
          maquina:
            Number(counterMap.get('Segundos Ultimo Ciclo Total')?.value) -
            Number(counterMap.get('Segundos Ultimo Ciclo Puerta')?.value),
        });
      }
    });

    return FEPIMMs;
  };

  const fetchPIMMs = async (parameters: Parameters) => {
    function generateTimestamps(
      startTimestamp: number,
      endTimestamp: number,
      intervalInMLSeconds: number
    ) {
      const timestamps = [];
      for (
        let current = startTimestamp;
        current <= endTimestamp;
        current += intervalInMLSeconds
      ) {
        timestamps.push(current);
      }
      return timestamps;
    }

    // Calculate number of pages and start keys
    setPIMMs([]);
    setFilters({
      equipos: new Map<string, boolean>(),
      operarios: new Map<string, boolean>(),
      ordenes: new Map<string, boolean>(),
      lotes: new Map<string, boolean>(),
      moldes: new Map<string, boolean>(),
      materiales: new Map<string, boolean>(),
    });
    const partitions = generateTimestamps(
      parameters.startDate,
      parameters.endDate,
      6 * 60 * 1000
    );
    let beforePartition = parameters.startDate;
    partitions.map(async (partition) => {
      const partitionParameters: InfoSettings = {
        filters: {
          initTime: beforePartition,
          endTime: partition,
          accUnit: parameters.step,
          lastID: null,
        },
      };
      beforePartition = partition;
      const data = await fetchData(
        partitionParameters,
        auth.user?.access_token
      );

      setPIMMs((prevState) => {
        const newPIMMS = [...prevState, ...data.pimms];
        return newPIMMS.sort((a, b) => a.timestamp - b.timestamp);
      });
      setFilters((prevFilters) => {
        const updatedFilters = {
          operarios: new Map(prevFilters.operarios),
          moldes: new Map(prevFilters.moldes),
          materiales: new Map(prevFilters.materiales),
          lotes: new Map(prevFilters.lotes),
          equipos: new Map(prevFilters.equipos),
          ordenes: new Map(prevFilters.ordenes),
        };

        for (const pimm of data.pimms) {
          const stateMap = new Map(pimm.states.map((s) => [s.name, s]));

          const setIfDefined = (map: Map<string, boolean>, key: string) => {
            const value = String(stateMap.get(key)?.value);
            if (value !== undefined) map.set(value, false);
          };

          setIfDefined(updatedFilters.operarios, 'Operario');
          setIfDefined(updatedFilters.moldes, 'Molde');
          setIfDefined(updatedFilters.materiales, 'Material');
          setIfDefined(updatedFilters.lotes, 'Lote');
          setIfDefined(updatedFilters.equipos, 'Numero Inyectora');
          setIfDefined(updatedFilters.ordenes, 'Orden');
        }

        return updatedFilters;
      });
    });
  };

  const connectToIoT = React.useCallback(async () => {
    if (MQTT.current && MQTT.current.connected) return MQTT.current;
    const token = auth.user?.access_token ?? '';
    const response = await fetchCredentialsCore(token);
    const { sessionToken, expiration } = response.token;

    console.log('Conectando a AWS IoT...');
    const url = config.socketURL;
    MQTT.current = mqtt.connect(url, {
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

    const client = MQTT.current;

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
      setPIMMs((prev) => {
        const newData = [...prev, data];
        newData.shift();
        return newData;
      });
    });

    client.on('error', (err) => {
      console.error('Error en la conexión MQTT:', err);
    });

    client.on('close', () => {
      console.log('Conexión MQTT cerrada');
    });
  }, [auth.user]);

  const groupByUnitTime = (
    data: FEPIMM[],
    ms_agrupation: number
  ): GroupedFEPIMM[] => {
    const acc = Object.values(
      data.reduce(
        (
          acc: {
            [key: number]: { timestamp: number; items: FEPIMM[]; overall: any };
          },
          item
        ) => {
          // Convert timestamp to grouping unit
          const timestampKey = Math.floor(item.timestamp / ms_agrupation);

          // Initialize group if not present
          if (!acc[timestampKey]) {
            acc[timestampKey] = {
              timestamp: timestampKey,
              items: [],
              overall: {},
            };
          }

          // Add item to the corresponding group
          acc[timestampKey].items.push(item);

          return acc;
        },
        {}
      )
    );

    acc.forEach((grouped) => {
      // Reduce function to accumulate data
      const inyecciones = grouped.items.reduce(
        (acc, item: FEPIMM) => {
          const stateMap = new Map(item.states.map((s) => [s.name, s]));
          const counterMap = new Map(item.counters.map((c) => [c.name, c]));
          const moldes: Molde = {};

          if (!moldes[String(stateMap.get('Molde')?.value)]) {
            moldes[String(stateMap.get('Molde')?.value)] = {
              acc_cav1: 0,
              acc_cav2: 0,
              acc_cav3: 0,
              acc_cav4: 0,
              acc_cav5: 0,
              acc_cav6: 0,
              acc_gramosgeneral: 0,
            };
          }
          moldes[String(stateMap.get('Molde')?.value)].acc_cav1 +=
            Number(counterMap.get('Gramos Cavidad 1')?.value) || 0;
          moldes[String(stateMap.get('Molde')?.value)].acc_cav2 +=
            Number(counterMap.get('Gramos Cavidad 2')?.value) || 0;
          moldes[String(stateMap.get('Molde')?.value)].acc_cav3 +=
            Number(counterMap.get('Gramos Cavidad 3')?.value) || 0;
          moldes[String(stateMap.get('Molde')?.value)].acc_cav4 +=
            Number(counterMap.get('Gramos Cavidad 4')?.value) || 0;
          moldes[String(stateMap.get('Molde')?.value)].acc_cav5 +=
            Number(counterMap.get('Gramos Cavidad 5')?.value) || 0;
          moldes[String(stateMap.get('Molde')?.value)].acc_cav6 +=
            Number(counterMap.get('Gramos Cavidad 6')?.value) || 0;
          moldes[String(stateMap.get('Molde')?.value)].acc_gramosgeneral +=
            Number(counterMap.get('Gramos Inyeccion')?.value) || 0;

          return {
            acc_buenas: acc.acc_buenas + (item.buenas || 0),
            acc_noConformes:
              acc.acc_noConformes +
              (Number(counterMap.get('Unidades No Conformes')?.value) || 0),
            acc_defectoInicioTurno:
              acc.acc_defectoInicioTurno +
              (Number(counterMap.get('Unidades Defecto Inicio Turno')?.value) || 0),
            acc_Inyecciones:
              acc.acc_Inyecciones +
              (Number(counterMap.get('Contador Inyecciones')?.value) || 0),
            acc_Ineficiencias:
              acc.acc_Ineficiencias + (Number(item.ineficiencias) || 0),
            acc_producidas: acc.acc_producidas + (item.producidas || 0),
            acc_montaje:
              acc.acc_montaje + (Number(counterMap.get('Minutos Montaje')?.value) || 0),
            acc_calidad:
              acc.acc_calidad + (Number(counterMap.get('Minutos Calidad')?.value) || 0),
            acc_material:
              acc.acc_material + (Number(counterMap.get('Minutos Por Material')?.value) || 0),
            acc_abandono:
              acc.acc_abandono + (Number(counterMap.get('Minutos Sin Operario')?.value) || 0),
            acc_molde:
              acc.acc_molde + (Number(counterMap.get('Minutos Mantto Molde')?.value) || 0),
            acc_maquina:
              acc.acc_maquina + (Number(counterMap.get('Minutos Mantto Maquina')?.value) || 0),
            acc_noprog:
              acc.acc_noprog + (Number(counterMap.get('Minutos No Programada')?.value) || 0),
            acc_motor:
              acc.acc_motor + (Number(counterMap.get('KW Motor')?.value) || 0),
            moldes: {
              ...acc.moldes,
              ...(moldes || {}),
            },
          };
        },
        {
          acc_buenas: 0,
          acc_noConformes: 0,
          acc_defectoInicioTurno: 0,
          acc_Inyecciones: 0,
          acc_Ineficiencias: 0,
          acc_producidas: 0,
          acc_montaje: 0,
          acc_calidad: 0,
          acc_material: 0,
          acc_abandono: 0,
          acc_molde: 0,
          acc_maquina: 0,
          acc_noprog: 0,
          acc_motor: 0,
          moldes: {},
        }
      );

      grouped.overall = inyecciones;
    });

    return acc;
  };

  // Ejem
  const groupedFEPIMMs = groupByUnitTime(
    filteredPIMMs,
    MS_CONVERSION[parameters.step]
  );

  const lastGroupPLC = groupedFEPIMMs[groupedFEPIMMs.length - 1];

  function calculateOEE(groupedFEPIMM: GroupedFEPIMM) {
    let [performance, availability, quality, efficiency] = [0, 0, 0, 0];
    if (groupedFEPIMM && groupedFEPIMM.items.length === 0) {
      return {
        performance: performance,
        availability: availability,
        quality: quality,
        efficiency: efficiency,
      };
    }

    const accProducidas = groupedFEPIMM?.overall.acc_producidas ?? 0;
    const accInyecciones = groupedFEPIMM?.overall.acc_Inyecciones ?? 0;
    const accIneficiencias = groupedFEPIMM?.overall.acc_Ineficiencias ?? 0;
    const accBuenas = groupedFEPIMM?.overall.acc_buenas ?? 0;
    const accDefectoInicioTurno =
      groupedFEPIMM?.overall.acc_defectoInicioTurno ?? 0;
    const accNoConformes = groupedFEPIMM?.overall.acc_noConformes ?? 0;
    const accNoProg = groupedFEPIMM?.overall.acc_noProg ?? 0;
    const accMaquina = groupedFEPIMM?.overall.acc_maquina ?? 0;
    const accMolde = groupedFEPIMM?.overall.acc_molde ?? 0;
    const accAbandono = groupedFEPIMM?.overall.acc_abandono ?? 0;
    const accMaterial = groupedFEPIMM?.overall.acc_material ?? 0;
    const accCalidad = groupedFEPIMM?.overall.acc_calidad ?? 0;
    const accMontaje = groupedFEPIMM?.overall.acc_montaje ?? 0;
    const timeTotal =
      Math.round(
        (filteredPIMMs[filteredPIMMs.length - 1]?.timestamp -
          filteredPIMMs[0]?.timestamp) /
          MS_CONVERSION[parameters.step]
      ) * groupedFEPIMM?.items.length || 0;
    let totalOperationalTime = timeTotal - accNoProg;
    let totalLosses =
      accMaquina +
      accMolde +
      accAbandono +
      accMaterial +
      accCalidad +
      accMontaje;

    availability =
      (totalOperationalTime - totalLosses) / (totalOperationalTime || 1);
    performance = accInyecciones / (accIneficiencias + accInyecciones || 1);
    quality =
      accBuenas / (accBuenas + accDefectoInicioTurno + accNoConformes || 1);

    // Redondeo final
    performance = Math.round(performance * 1000) / 10;
    availability = Math.round(availability * 1000) / 10;
    quality = Math.round(quality * 1000) / 10;
    efficiency = (availability / 100) * (performance / 100) * (quality / 100);
    efficiency = Math.round(efficiency * 1000) / 10;

    return {
      performance: performance,
      availability: availability,
      quality: quality,
      efficiency: efficiency,
    };
  }

  const { performance, availability, quality, efficiency } =
    calculateOEE(lastGroupPLC);

  return (
    <Grid container spacing={3}>
      <Grid size={{ lg: 12, sm: 12, xs: 12 }}>
        <Card>
          <CardHeader title="Settings" />
          <CardContent>
            <Box display="flex" flexDirection="column" gap={2}>
              <FilterForm
                filters={filters}
                setFilters={setFilters}
                parameters={parameters}
                setParameters={setParameters}
              />
            </Box>
          </CardContent>
        </Card>
      </Grid>
      <Grid size={{ lg: 12, sm: 12, xs: 12 }}>
        <Card>
          <CardHeader title="Information" />
          <CardContent>
            <JSONTree data={filteredPIMMs} theme="monokai" />

            {
              //Indicadores
            }
            <CardFactor
              value={performance}
              sx={{ width: '600ppx', height: '600ppx' }}
              title="Rendimiento"
            ></CardFactor>
            <CardFactor
              value={availability}
              sx={{ width: '600ppx', height: '600ppx' }}
              title="Disponibilidad"
            ></CardFactor>
            <CardFactor
              value={quality}
              sx={{ width: '600ppx', height: '600ppx' }}
              title="Calidad"
            ></CardFactor>
            <CardFactor
              value={efficiency}
              sx={{ width: '600ppx', height: '600ppx' }}
              title="Eficiencia"
            ></CardFactor>
            <PolarChart
              data={[
                { category: 'Rendimiento', value: Number(performance ?? 0) },
                {
                  category: 'Disponibilidad',
                  value: Number(availability ?? 0),
                },
                { category: 'Calidad', value: Number(quality ?? 0) },
              ]}
            ></PolarChart>

            <TimeSeriesLineChart
              series={[
                {
                  name: 'Rendimiento',
                  data: groupedFEPIMMs.map((groupedFEPIMM) => {
                    const { performance } = calculateOEE(groupedFEPIMM);
                    return {
                      timestamp: groupedFEPIMM.timestamp,
                      value: performance,
                    };
                  }),
                },
                {
                  name: 'Disponibilidad',
                  data: groupedFEPIMMs.map((groupedFEPIMM) => {
                    const { availability } = calculateOEE(groupedFEPIMM);
                    return {
                      timestamp: groupedFEPIMM.timestamp,
                      value: availability,
                    };
                  }),
                },
                {
                  name: 'Calidad',
                  data: groupedFEPIMMs.map((groupedFEPIMM) => {
                    const { quality } = calculateOEE(groupedFEPIMM);
                    return {
                      timestamp: groupedFEPIMM.timestamp,
                      value: quality,
                    };
                  }),
                },
                {
                  name: 'Eficiencia',
                  data: groupedFEPIMMs.map((groupedFEPIMM) => {
                    const { efficiency } = calculateOEE(groupedFEPIMM);
                    return {
                      timestamp: groupedFEPIMM.timestamp,
                      value: efficiency,
                    };
                  }),
                },
              ]}
              labelY="OEE(%)"
            />

            {
              //Calidad
            }
            <MultiLayerPieChart
              data={{
                name: 'Producción',
                children: [
                  {
                    name: 'Buenas',
                    children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                      name: 'PIMM ' + String(FEPIMM.PLCNumber),
                      value: FEPIMM.buenas,
                    })),
                  },
                  {
                    name: 'Malas',
                    children: [
                      {
                        name: 'Arranque',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Unidades No Conformes'
                              )?.value
                            ) || 0, // Ensure valid ID
                        })),
                      },
                      {
                        name: 'Rechazo',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Unidades Defecto Inicio Turno'
                              )?.value
                            ) || 0, // Ensure valid ID
                        })),
                      },
                    ],
                  },
                ],
              }}
            />

            <TimeSeriesLineChart
              series={[
                {
                  name: 'Buenas',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_buenas,
                  })),
                },
                {
                  name: 'Malas',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value:
                      FEPIMM.overall.acc_defectoInicioTurno +
                      FEPIMM.overall.acc_noConformes,
                  })),
                },
                {
                  name: 'Arranque',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_noConformes,
                  })),
                },
                {
                  name: 'Rechazo',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_defectoInicioTurno,
                  })),
                },
              ]}
              labelY="Piezas (Unidades)"
            ></TimeSeriesLineChart>
            {
              //Disponibilidad
            }
            <MultiLayerPieChart
              data={{
                name: 'Disponible',
                children: [
                  {
                    name: 'Productivo',
                    children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                      name: 'PIMM ' + String(FEPIMM.PLCNumber),
                      value: lastGroupPLC.overall.acc_producidas,
                    })),
                  },
                  {
                    name: 'Paradas',
                    children: [
                      {
                        name: 'Maquina',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Minutos Mantto Maquina'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'SinOperario',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Minutos Sin Operario'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'Calidad',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Minutos Calidad'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'Montaje',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Minutos Montaje'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'Molde',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Minutos Mantto Molde'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'Material',
                        children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) => counter.name === 'Minutos Por Material'
                              )?.value
                            ) || 0,
                        })),
                      },
                    ],
                  },
                ],
              }}
            />

            <TimeSeriesLineChart
              labelY="Piezas (Unidades)"
              series={[
                {
                  name: 'Productivo',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_producidas,
                  })),
                },
                {
                  name: 'Maquina',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_maquina,
                  })),
                },
                {
                  name: 'SinOperario',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_abandono,
                  })),
                },
                {
                  name: 'Calidad',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_calidad,
                  })),
                },
                {
                  name: 'Montaje',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_montaje,
                  })),
                },
                {
                  name: 'Molde',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_molde,
                  })),
                },
                {
                  name: 'Material',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_material,
                  })),
                },
              ]}
            ></TimeSeriesLineChart>
            {
              //Rendimiento
            }
            <MultiLayerPieChart
              data={{
                name: 'Capacidad',
                children: [
                  {
                    name: 'Producido',
                    children: lastGroupPLC?.items.map((FEPIMM: FEPIMM) => ({
                      name: 'PIMM ' + String(FEPIMM.PLCNumber),
                      value:
                        Number(
                          FEPIMM.counters.find(
                            (counter) => counter.name === 'Contador Inyecciones'
                          )?.value
                        ) || 0, // Ensure valid ID
                    })),
                  },
                  {
                    name: 'Ineficiencias',
                    children: lastGroupPLC?.items.map((FEPIMM) => ({
                      name: 'PIMM ' + String(FEPIMM.PLCNumber),
                      value: Number(FEPIMM.ineficiencias) || 0, // Ensure valid ID
                    })),
                  },
                ],
              }}
            />

            <TimeSeriesLineChart
              labelY="Piezas (Unidades)"
              series={[
                {
                  name: 'Producido',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_Inyecciones,
                  })),
                },
                {
                  name: 'Ineficiencias',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_Ineficiencias,
                  })),
                },
              ]}
            ></TimeSeriesLineChart>
            {
              //Montaje
            }
            <Table data={lastGroupPLC?.items}></Table>
            {
              //Energía
            }
            <StackedBarChart
              labelY="Energía (kWh)"
              data={lastGroupPLC?.items.map((FEPIMM, index) => ({
                category: 'PIMM ' + FEPIMM.PLCNumber,
                motor:
                  Number(
                    FEPIMM.counters.find((counter) => counter.name === 'KW Motor')
                      ?.value
                  ) || 0,
                maquina:
                  Number(
                    FEPIMM.counters.find((counter) => counter.name === 'KW Total Maquina')
                      ?.value
                  ) || 0,
              }))}
              keys={['motor', 'maquina']}
            />

            <TimeSeriesLineChart
              labelY="Energía (kWh)"
              series={[
                {
                  name: 'Motor',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_motor,
                  })),
                },
                {
                  name: 'Maquina',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_maquina,
                  })),
                },
              ]}
            ></TimeSeriesLineChart>
            {
              //Material
            }
            <MultiLayerPieChart
              data={{
                name: 'Total',
                children: lastGroupPLC?.items.map((FEPIMM) => ({
                  name: `PIMM ${FEPIMM.PLCNumber}`,
                  children: FEPIMM.counters
                    .filter((counter) =>
                      counter.name?.toLowerCase().includes('cavidad')
                    ) // Ensure `name` is defined
                    .map((counter) => ({
                      name: counter.name,
                      value: Number(counter.value) || 0, // Prevent NaN issues
                    })),
                })),
              }}
            />
            <TimeSeriesLineChart
              labelY="Material (g)"
              series={Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  groupedFEPIMM.items.forEach((FEPIMM) => {
                    if (!acc[FEPIMM.PLCNumber]) {
                      acc[FEPIMM.PLCNumber] = [];
                    }

                    const counter = FEPIMM.counters.find(
                      (counter) => counter.name === 'Gramos Inyeccion'
                    );
                    const value = counter ? Number(counter.value) : 0;

                    acc[FEPIMM.PLCNumber].push({
                      timestamp: FEPIMM.timestamp,
                      value: value,
                    });
                  });

                  return acc;
                }, {} as { [key: number]: { timestamp: number; value: number }[] })
              ).map(([PLCNumber, data]) => ({
                name: `PIMM ${PLCNumber}`,
                color: 'red',
                data: data.sort((a, b) => a.timestamp - b.timestamp), // Ordenar por timestamp
              }))}
            />

            {
              //Molde
            }
            <MultiLayerPieChart
              data={{
                name: 'Total',
                children: Object.entries(
                  lastGroupPLC?.overall.moldes || {}
                ).map(([molde, cavidades]) => ({
                  name: molde,
                  children: Object.entries(cavidades || {})
                    .filter(([key]) => key !== 'acc_gramosgeneral') // Excluir 'acc_gramosgeneral'
                    .map(([cavidad, value]) => ({
                      name: cavidad,
                      value: Number(value) || 0, // Asegurar valores numéricos
                    })),
                })),
              }}
            />

            <TimeSeriesLineChart
              labelY="Material (g)"
              series={Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  Object.entries(groupedFEPIMM.overall.moldes).forEach(
                    ([molde, cavidades]) => {
                      const cavidadesTyped = cavidades as ValueOf<Molde>;
                      if (!acc[molde]) {
                        acc[molde] = [];
                      }

                      acc[molde].push({
                        timestamp: groupedFEPIMM.timestamp,
                        value: cavidadesTyped.acc_gramosgeneral ?? 0,
                      });
                    }
                  );

                  return acc;
                }, {} as { [key: string]: { timestamp: number; value: number }[] })
              ).map(([molde, data]) => ({
                name: `Molde ${molde}`, // Cambio para reflejar moldes en vez de PIMM
                color: 'red',
                data: data.sort((a, b) => a.timestamp - b.timestamp),
              }))}
            />

            {
              //Ciclos por PIMM
            }
            <MultiLayerPieChart
              data={{
                name: 'Ciclos',
                children: lastGroupPLC?.items.map((FEPIMM) => {
                  const puerta =
                    Number(
                      FEPIMM.counters.find((counter) => counter.name === 'Segundos Ultimo Ciclo Puerta')
                        ?.value
                    ) || 0;

                  return {
                    name: `PIMM ${FEPIMM.PLCNumber}`,
                    children: FEPIMM.counters
                      .filter(
                        (counter) =>
                          counter.name === 'Segundos Ultimo Ciclo Total' || counter.name === 'Segundos Ultimo Ciclo Puerta'
                      )
                      .map((counter) => ({
                        name: counter.name === 'Segundos Ultimo Ciclo Total' ? 'Maquina' : 'Puerta',
                        value:
                          counter.name === 'Segundos Ultimo Ciclo Total'
                            ? Number(counter.value) - puerta
                            : Number(counter.value),
                      })),
                  };
                }),
              }}
            />
            <TimeSeriesLineChart
              labelY="Maquina (Ciclos)"
              series={Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  groupedFEPIMM.items.forEach((FEPIMM) => {
                    if (!acc[FEPIMM.PLCNumber]) {
                      acc[FEPIMM.PLCNumber] = [];
                    }

                    const value = groupedFEPIMM.items.reduce((acc, item) => {
                      const counterMap = new Map(
                        item.counters.map((c) => [c.name, c])
                      );
                      return (
                        acc +
                        Number(counterMap.get('Segundos Ultimo Ciclo Total')?.value) -
                        Number(counterMap.get('Segundos Ultimo Ciclo Puerta')?.value)
                      );
                    }, 0);

                    acc[FEPIMM.PLCNumber].push({
                      timestamp: FEPIMM.timestamp,
                      value: value,
                    });
                  });

                  return acc;
                }, {} as { [key: number]: { timestamp: number; value: number }[] })
              ).map(([PLCNumber, data]) => ({
                name: `PIMM ${PLCNumber}`,
                color: 'red',
                data: data.sort((a, b) => a.timestamp - b.timestamp), // Ordenar por timestamp
              }))}
            />
            <TimeSeriesLineChart
              labelY="Puerta (Ciclos)"
              series={Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  groupedFEPIMM.items.forEach((FEPIMM) => {
                    if (!acc[FEPIMM.PLCNumber]) {
                      acc[FEPIMM.PLCNumber] = [];
                    }
                    const value = groupedFEPIMM.items.reduce((acc, item) => {
                      const counterMap = new Map(
                        item.counters.map((c) => [c.name, c])
                      );
                      return acc + Number(counterMap.get('Segundos Ultimo Ciclo Puerta')?.value);
                    }, 0);

                    acc[FEPIMM.PLCNumber].push({
                      timestamp: FEPIMM.timestamp,
                      value: value,
                    });
                  });

                  return acc;
                }, {} as { [key: number]: { timestamp: number; value: number }[] })
              ).map(([PLCNumber, data]) => ({
                name: `PIMM ${PLCNumber}`,
                color: 'red',
                data: data.sort((a, b) => a.timestamp - b.timestamp), // Ordenar por timestamp
              }))}
            />
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
