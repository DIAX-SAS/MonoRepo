'use client';

import FilterForm from '../../components/filters/filter-form';
import CardFactor from '../../components/graphs/CardFactor';
import TimeSeriesLineChart, {
  LineSeries,
} from '../../components/graphs/LineChart';
import MultiLayerPieChart, {
  ChartNode,
} from '../../components/graphs/MultiLayerPieChart';
import PolarChart, { CategoryPolar } from '../../components/graphs/PolarChart';
import StackedBarChart, {
  Category,
} from '../../components/graphs/StackedBarChart';
import Table from '../../components/graphs/Table';
import { config } from '../../config';
import {
  fetchCredentialsCore,
  fetchData,
} from '../../data-access/diax-back/diax-back';
import { type FEPIMM, type Filters, type Parameters } from './dashboard.types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid2 from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { InfoSettings, PIMM } from '@repo-hub/internal';
import mqtt from 'mqtt';
import * as React from 'react';
import { JSONTree } from 'react-json-tree';
import { useAuthSession } from '../../hooks/useAuthSession';
const MS_CONVERSION: { [key in Parameters['step']]: number } = {
  second: 1000,
  minute: 1000 * 60,
  hour: 1000 * 60 * 60,
};
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

  const { session } = useAuthSession();
  const [PIMMs, setPIMMs] = React.useState<PIMM[]>([]);
  const [filteredPIMMs, setFilteredPIMMs] = React.useState<FEPIMM[]>([]);
  const [graphData, setGraphData] = React.useState<GraphData | undefined>();

  const MQTTRef = React.useRef<mqtt.MqttClient | undefined>(undefined);
  const accessTokenRef = React.useRef<{ accessToken: string | undefined }>({
    accessToken: session?.accessToken,
  });
  const stepRef = React.useRef<Parameters['step']>(parameters.step);

  interface ReduceMolde {
    acc_cav1: number;
    acc_cav2: number;
    acc_cav3: number;
    acc_cav4: number;
    acc_cav5: number;
    acc_cav6: number;
    acc_gramosgeneral: number;
  }

  interface ReduceGroupedPIMMs {
    acc_buenas: number;
    acc_noConformes: number;
    acc_defectoInicioTurno: number;
    acc_inyecciones: number;
    acc_ineficiencias: number;
    acc_producidas: number;
    acc_montaje: number;
    acc_calidad: number;
    acc_material: number;
    acc_abandono: number;
    acc_molde: number;
    acc_maquina: number;
    acc_noProg: number;
    acc_motor: number;
  }

  interface AccumulatedData extends ReduceGroupedPIMMs {
    moldes: Record<string, ReduceMolde>;
  };
  interface GroupedFEPIMM {
    FEPIMMs: FEPIMM[];
    timestamp: number;
    overall: AccumulatedData;
  }

  React.useEffect(() => {
    accessTokenRef.current = { accessToken: session?.accessToken };
  }, [session]);

  React.useEffect(() => {
    const calculateGraphData = async (filteredPIMMs: FEPIMM[]) => {
      const groupByUnitTime = (
        data: FEPIMM[],
        ms_agrupation: number
      ): GroupedFEPIMM[] => {
        const accGlobal = Object.values(
          data.reduce(
            (
              accGlobal: {
                [key: number]: {
                  timestamp: number;
                  FEPIMMs: FEPIMM[];
                  overall: AccumulatedData;
                };
              },
              FEPIMM
            ) => {
              // Convert timestamp to grouping unit
              const timestampKey = Math.floor(FEPIMM.timestamp / ms_agrupation);

              // Initialize group if not present
              if (!accGlobal[timestampKey]) {
                accGlobal[timestampKey] = {
                  timestamp: timestampKey,
                  FEPIMMs: [],
                  overall: {
                    acc_buenas: 0,
                    acc_noConformes: 0,
                    acc_defectoInicioTurno: 0,
                    acc_inyecciones: 0,
                    acc_ineficiencias: 0,
                    acc_producidas: 0,
                    acc_montaje: 0,
                    acc_calidad: 0,
                    acc_material: 0,
                    acc_abandono: 0,
                    acc_molde: 0,
                    acc_maquina: 0,
                    acc_noProg: 0,
                    acc_motor: 0,
                    moldes: {},
                  },
                };
              }

              // Add FEPIMM to the corresponding group
              accGlobal[timestampKey].FEPIMMs.push(FEPIMM);

              return accGlobal;
            },
            {}
          )
        );

        return accGlobal;
      };

      const reduceGroupedFEPIMMs = (accGlobal: GroupedFEPIMM[]) => {
        accGlobal.forEach((grouped) => {

          const reduceGroupedPIMMs = (grouped: GroupedFEPIMM): ReduceGroupedPIMMs => {
            const reduceGroupedPIMMs = grouped.FEPIMMs.reduce(
              (acc, FEPIMM: FEPIMM): ReduceGroupedPIMMs => {               
                const counterMap = new Map(FEPIMM.counters.map((c) => [c.name, c]));              
                return {
                  acc_buenas: acc.acc_buenas + (FEPIMM.buenas || 0),
                  acc_noConformes:
                    acc.acc_noConformes +
                    (Number(counterMap.get('Unidades No Conformes')?.value) || 0),
                  acc_defectoInicioTurno:
                    acc.acc_defectoInicioTurno +
                    (Number(
                      counterMap.get('Unidades Defecto Inicio Turno')?.value
                    ) || 0),
                  acc_inyecciones:
                    acc.acc_inyecciones +
                    (Number(counterMap.get('Contador Inyecciones')?.value) || 0),
                  acc_ineficiencias:
                    acc.acc_ineficiencias + (Number(FEPIMM.ineficiencias) || 0),
                  acc_producidas: acc.acc_producidas + (FEPIMM.producidas || 0),
                  acc_montaje:
                    acc.acc_montaje +
                    (Number(counterMap.get('Minutos Montaje')?.value) || 0),
                  acc_calidad:
                    acc.acc_calidad +
                    (Number(counterMap.get('Minutos Calidad')?.value) || 0),
                  acc_material:
                    acc.acc_material +
                    (Number(counterMap.get('Minutos Por Material')?.value) || 0),
                  acc_abandono:
                    acc.acc_abandono +
                    (Number(counterMap.get('Minutos Sin Operario')?.value) || 0),
                  acc_molde:
                    acc.acc_molde +
                    (Number(counterMap.get('Minutos Mantto Molde')?.value) || 0),
                  acc_maquina:
                    acc.acc_maquina +
                    (Number(counterMap.get('Minutos Mantto Maquina')?.value) ||
                      0),
                  acc_noProg:
                    acc.acc_noProg +
                    (Number(counterMap.get('Minutos No Programada')?.value) || 0),
                  acc_motor:
                    acc.acc_motor +
                    (Number(counterMap.get('KW Motor')?.value) || 0),                 
                };
              },
              {
                acc_buenas: 0,
                acc_noConformes: 0,
                acc_defectoInicioTurno: 0,
                acc_inyecciones: 0,
                acc_ineficiencias: 0,
                acc_producidas: 0,
                acc_montaje: 0,
                acc_calidad: 0,
                acc_material: 0,
                acc_abandono: 0,
                acc_molde: 0,
                acc_maquina: 0,
                acc_noProg: 0,
                acc_motor: 0,             
              }
            );

            return reduceGroupedPIMMs;
          }
          const reduceByMoldes = (grouped: GroupedFEPIMM): Record<string, ReduceMolde> => {
            const reduceByMoldes = grouped.FEPIMMs.reduce(
              (acc, FEPIMM: FEPIMM): Record<string, ReduceMolde> => {
                const stateMap = new Map(FEPIMM.states.map((s) => [s.name, s]));
                const counterMap = new Map(FEPIMM.counters.map((c) => [c.name, c]));
                const moldes: Record<string, ReduceMolde> = {};

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

                return { ...acc, ...moldes };
              },
              {

              }
            );

            return reduceByMoldes;
          }

          grouped.overall = { ...reduceGroupedPIMMs(grouped), moldes: reduceByMoldes(grouped) };
        });
        return accGlobal;
      }

      const groupedFEPIMMs = reduceGroupedFEPIMMs(groupByUnitTime(
        filteredPIMMs,
        MS_CONVERSION[stepRef.current]
      ));


      const lastGroupPLC = groupedFEPIMMs[groupedFEPIMMs.length - 1];

      const calculateOEE = (groupedFEPIMM: GroupedFEPIMM) => {
        let [performance, availability, quality, efficiency] = [0, 0, 0, 0];
        if (groupedFEPIMM && groupedFEPIMM.FEPIMMs.length === 0) {
          return {
            performance: performance,
            availability: availability,
            quality: quality,
            efficiency: efficiency,
          };
        }

        const accInyecciones = groupedFEPIMM?.overall.acc_inyecciones ?? 0;
        const accIneficiencias = groupedFEPIMM?.overall.acc_ineficiencias ?? 0;
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
            MS_CONVERSION[stepRef.current]
          ) * groupedFEPIMM?.FEPIMMs.length || 0;
        const totalOperationalTime = timeTotal - accNoProg;
        const totalLosses =
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
        efficiency =
          (availability / 100) * (performance / 100) * (quality / 100);
        efficiency = Math.round(efficiency * 1000) / 10;

        return {
          performance: performance,
          availability: availability,
          quality: quality,
          efficiency: efficiency,
        };
      };

      const { performance, availability, quality, efficiency } =
        calculateOEE(lastGroupPLC);

      const calculatedGraphData: GraphData = {
        indicadores: {
          data: {
            availability: availability,
            performance: performance,
            quality: quality,
            efficiency: efficiency,
          },
          charts: {
            SeriesLineChart: {
              data: [
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
              ],
            },
            PolarChart: {
              data: [
                {
                  category: 'Rendimiento',
                  value: performance,
                },
                {
                  category: 'Disponibilidad',
                  value: availability,
                },
                {
                  category: 'Calidad',
                  value: quality,
                },
              ],
            },
          },
        },
        calidad: {
          charts: {
            MultiLayerPieChart: {
              data: {
                name: 'Producción',
                children: [
                  {
                    name: 'Buenas',
                    children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                      name: 'PIMM ' + String(FEPIMM.PLCNumber),
                      value: FEPIMM.buenas,
                    })),
                  },
                  {
                    name: 'Malas',
                    children: [
                      {
                        name: 'Arranque',
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) =>
                                  counter.name === 'Unidades No Conformes'
                              )?.value
                            ) || 0, // Ensure valid ID
                        })),
                      },
                      {
                        name: 'Rechazo',
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) =>
                                  counter.name ===
                                  'Unidades Defecto Inicio Turno'
                              )?.value
                            ) || 0, // Ensure valid ID
                        })),
                      },
                    ],
                  },
                ],
              },
            },
            SeriesLineChart: {
              data: [
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
              ],
            },
          },
        },
        disponibilidad: {
          charts: {
            MultiLayerPieChart: {
              data: {
                name: 'Disponible',
                children: [
                  {
                    name: 'Productivo',
                    children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                      name: 'PIMM ' + String(FEPIMM.PLCNumber),
                      value: FEPIMM.producidas,
                    })),
                  },
                  {
                    name: 'Paradas',
                    children: [
                      {
                        name: 'Maquina',
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) =>
                                  counter.name === 'Minutos Mantto Maquina'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'SinOperario',
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) =>
                                  counter.name === 'Minutos Sin Operario'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'Calidad',
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
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
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
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
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) =>
                                  counter.name === 'Minutos Mantto Molde'
                              )?.value
                            ) || 0,
                        })),
                      },
                      {
                        name: 'Material',
                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                          name: 'PIMM ' + String(FEPIMM.PLCNumber),
                          value:
                            Number(
                              FEPIMM.counters.find(
                                (counter) =>
                                  counter.name === 'Minutos Por Material'
                              )?.value
                            ) || 0,
                        })),
                      },
                    ],
                  },
                ],
              },
            },
            SeriesLineChart: {
              data: [
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
              ],
            },
          },
        },
        rendimiento: {
          charts: {
            MultiLayerPieChart: {
              data: {
                name: 'Capacidad',
                children: [
                  {
                    name: 'Producido',
                    children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
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
                    children: lastGroupPLC?.FEPIMMs.map((FEPIMM) => ({
                      name: 'PIMM ' + String(FEPIMM.PLCNumber),
                      value: Number(FEPIMM.ineficiencias) || 0, // Ensure valid ID
                    })),
                  },
                ],
              },
            },
            SeriesLineChart: {
              data: [
                {
                  name: 'Producido',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_inyecciones,
                  })),
                },
                {
                  name: 'Ineficiencias',
                  data: groupedFEPIMMs.map((FEPIMM) => ({
                    timestamp: FEPIMM.timestamp,
                    value: FEPIMM.overall.acc_ineficiencias,
                  })),
                },
              ],
            },
          },
        },
        montaje: {
          charts: {
            Table: { data: lastGroupPLC?.FEPIMMs },
          },
        },
        energia: {
          charts: {
            StackedBarChart: {
              data: lastGroupPLC?.FEPIMMs.map((FEPIMM, index) => ({
                category: 'PIMM ' + FEPIMM.PLCNumber,
                motor:
                  Number(
                    FEPIMM.counters.find(
                      (counter) => counter.name === 'KW Motor'
                    )?.value
                  ) || 0,
                maquina:
                  Number(
                    FEPIMM.counters.find(
                      (counter) => counter.name === 'KW Total Maquina'
                    )?.value
                  ) || 0,
              })),
            },
            SeriesLineChart: {
              data: [
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
              ],
            },
          },
        },
        material: {
          charts: {
            MultiLayerPieChart: {
              data: {
                name: 'Total',
                children: lastGroupPLC?.FEPIMMs.map((FEPIMM) => ({
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
              },
            },
            SeriesLineChart: {
              data: Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  groupedFEPIMM.FEPIMMs.forEach((FEPIMM) => {
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
              })),
            },
          },
        },
        molde: {
          charts: {
            MultiLayerPieChart: {
              data: {
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
              },
            },
            SeriesLineChart: {
              data: Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  Object.entries(groupedFEPIMM.overall.moldes).forEach(
                    ([molde, ReduceMoldes]) => {
                      const cavidades = ReduceMoldes as ReduceMolde;
                      if (!acc[molde]) {
                        acc[molde] = [];
                      }

                      acc[molde].push({
                        timestamp: groupedFEPIMM.timestamp,
                        value: cavidades.acc_gramosgeneral ?? 0,
                      });
                    }
                  );

                  return acc;
                }, {} as { [key: string]: { timestamp: number; value: number }[] })
              ).map(([molde, data]) => ({
                name: `Molde ${molde}`, // Cambio para reflejar moldes en vez de PIMM
                color: 'red',
                data: data.sort((a, b) => a.timestamp - b.timestamp),
              })),
            },
          },
        },
        ciclos: {
          charts: {
            MultiLayerPieChart: {
              data: {
                name: 'Ciclos',
                children: lastGroupPLC?.FEPIMMs.map((FEPIMM) => {
                  const puerta =
                    Number(
                      FEPIMM.counters.find(
                        (counter) =>
                          counter.name === 'Segundos Ultimo Ciclo Puerta'
                      )?.value
                    ) || 0;

                  return {
                    name: `PIMM ${FEPIMM.PLCNumber}`,
                    children: FEPIMM.counters
                      .filter(
                        (counter) =>
                          counter.name === 'Segundos Ultimo Ciclo Total' ||
                          counter.name === 'Segundos Ultimo Ciclo Puerta'
                      )
                      .map((counter) => ({
                        name:
                          counter.name === 'Segundos Ultimo Ciclo Total'
                            ? 'Maquina'
                            : 'Puerta',
                        value:
                          counter.name === 'Segundos Ultimo Ciclo Total'
                            ? Number(counter.value) - puerta
                            : Number(counter.value),
                      })),
                  };
                }),
              },
            },
            SeriesLineChart: {
              data: Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  groupedFEPIMM.FEPIMMs.forEach((FEPIMM) => {
                    if (!acc[FEPIMM.PLCNumber]) {
                      acc[FEPIMM.PLCNumber] = [];
                    }

                    const value = groupedFEPIMM.FEPIMMs.reduce((acc, FEPIMM) => {
                      const counterMap = new Map(
                        FEPIMM.counters.map((c) => [c.name, c])
                      );
                      return (
                        acc +
                        Number(
                          counterMap.get('Segundos Ultimo Ciclo Total')?.value
                        ) -
                        Number(
                          counterMap.get('Segundos Ultimo Ciclo Puerta')?.value
                        )
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
              })),
              data2: Object.entries(
                groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                  groupedFEPIMM.FEPIMMs.forEach((FEPIMM) => {
                    if (!acc[FEPIMM.PLCNumber]) {
                      acc[FEPIMM.PLCNumber] = [];
                    }
                    const value = groupedFEPIMM.FEPIMMs.reduce((acc, FEPIMM) => {
                      const counterMap = new Map(
                        FEPIMM.counters.map((c) => [c.name, c])
                      );
                      return (
                        acc +
                        Number(
                          counterMap.get('Segundos Ultimo Ciclo Puerta')?.value
                        )
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
              })),
            },
          },
        },
      };
      return calculatedGraphData;
    };

    (async () => setGraphData(await calculateGraphData(filteredPIMMs)))();
  }, [filteredPIMMs]);

  React.useEffect(() => {
    const applyFilters = async (
      filters: Filters,
      PIMMs: PIMM[]
    ): Promise<FEPIMM[]> => {
      if (PIMMs.length == 0) return [];

      const filterPIMMsByState = (PIMMs: PIMM[], filters: Filters): PIMM[] => {
        const filteredPIMMsByState: PIMM[] = [];
        const allFiltersFalse = Object.values(filters).every((filterMap) =>
          Array.from(filterMap.values()).every((value) => value === false)
        );
        PIMMs.forEach((PIMM: PIMM, i: number) => {
          const stateMap = new Map(PIMM.states.map((s) => [s.name, s]));

          let shouldContinue = allFiltersFalse;
          if (
            filters.equipos.get(String(stateMap.get('Numero Inyectora')?.value))
          )
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
            filteredPIMMsByState.push(PIMM);
          }
        });
        return filteredPIMMsByState;
      };

      const offsetPIMMCounters = (PIMMs: PIMM[]): PIMM[] => {
        const isOffset =
          PIMMs?.length > 1 &&
          new Date(PIMMs.at(0)?.timestamp ?? 0).getSeconds() ===
          new Date(PIMMs.at(-1)?.timestamp ?? 0).getSeconds();

        if (!isOffset) return PIMMs;

        const offsets: Record<
          string,
          Record<
            string,
            { start: number; end: number; value: number; previousValue: number }
          >
        > = {};

        PIMMs.forEach((PIMM: PIMM, i: number) => {
          const stateMap = new Map(PIMM.states.map((s) => [s.name, s]));
          const counterMap = new Map(PIMM.counters.map((c) => [c.name, c]));
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
        });
        return PIMMs;
      };

      const computeDerivedCounterValues = (PIMMs: PIMM[]): FEPIMM[] => {
        const FEPIMMs: FEPIMM[] = [];
        PIMMs.forEach((PIMM: PIMM, i: number) => {
          const counterMap = new Map(PIMM.counters.map((c) => [c.name, c]));
          const diffDate =
            (PIMMs.at(-1)?.timestamp ?? 0) -
            (PIMMs.at(0)?.timestamp ?? 0);

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
            maquina:
              Number(counterMap.get('Segundos Ultimo Ciclo Total')?.value) -
              Number(counterMap.get('Segundos Ultimo Ciclo Puerta')?.value),
            producidas:
              diffDate / MS_CONVERSION[stepRef.current] -
              Number(counterMap.get('Minutos No Programada')?.value) -
              (Number(counterMap.get('Minutos Mantto Maquina')?.value) +
                Number(counterMap.get('Minutos Mantto Molde')?.value) +
                Number(counterMap.get('Minutos Sin Operario')?.value) +
                Number(counterMap.get('Minutos Por Material')?.value) +
                Number(counterMap.get('Minutos Calidad')?.value) +
                Number(counterMap.get('Minutos Montaje')?.value)),
          });
        });
        return FEPIMMs;
      };

      return computeDerivedCounterValues(
        offsetPIMMCounters(filterPIMMsByState(PIMMs, filters))
      );
    };

    (async () => {
      setFilteredPIMMs(await applyFilters(filters, PIMMs));
    })();
  }, [PIMMs, filters]);

  React.useEffect(() => {
    const connectToIoT = async () => {
      if (MQTTRef.current && MQTTRef.current.connected) return;
      const response = await fetchCredentialsCore(accessTokenRef.current);
      const { sessionToken } = response.token;

      console.log('Conectando a AWS IoT...');
      const url = config.socketURL;
      MQTTRef.current = mqtt.connect(url, {
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

      MQTTRef.current.on('connect', () => {
        MQTTRef.current?.subscribe('PIMMStateTopic', (err) => {
          if (err) {
            throw new Error(err.message);
          }
        });
      });

      MQTTRef.current.on('message', (topic, message) => {
        const data = JSON.parse(message.toString());
        setPIMMs((prev) => {
          const newData = [...prev, data];
          newData.shift();
          return newData;
        });
      });

      MQTTRef.current.on('error', (err) => {
        throw new Error(err.message);
      });
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
          accessTokenRef.current,
          partitionParameters
        );

        setPIMMs((prevState) => {
          const newPIMMS = [...prevState, ...data.pimms];
          return newPIMMS.sort((a, b) => a.timestamp - b.timestamp);
        });
        setFilters((prevFilters) => {
          const updatedFilters = {
            equipos: new Map(prevFilters.equipos),
            operarios: new Map(prevFilters.operarios),
            ordenes: new Map(prevFilters.ordenes),
            lotes: new Map(prevFilters.lotes),
            moldes: new Map(prevFilters.moldes),
            materiales: new Map(prevFilters.materiales),
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

    fetchPIMMs(parameters);

    if (parameters.live) {
      connectToIoT();
    } else {
      MQTTRef.current?.removeAllListeners();
      MQTTRef.current?.end();
    }
  }, [parameters]);

  type GraphCategory =
    | 'indicadores'
    | 'calidad'
    | 'disponibilidad'
    | 'rendimiento'
    | 'montaje'
    | 'energia'
    | 'material'
    | 'molde'
    | 'ciclos';

  type GraphData = Record<
    GraphCategory,
    {
      readonly data?: Record<string, number | undefined>;
      readonly charts?: Partial<Graphs>;
    }
  >;

  type Graphs = {
    readonly SeriesLineChart?: { data: LineSeries[]; data2?: LineSeries[] };
    readonly MultiLayerPieChart?: { data: ChartNode };
    readonly StackedBarChart?: { data: Category[] };
    readonly PolarChart?: { data: CategoryPolar[] };
    readonly Table?: { data: FEPIMM[] };
  };

  const theme = {
    scheme: 'monokai',
    author: 'wimer hazenberg (http://www.monokai.nl)',
    base00: '#272822',
    base01: '#383830',
    base02: '#49483e',
    base03: '#75715e',
    base04: '#a59f85',
    base05: '#f8f8f2',
    base06: '#f5f4f1',
    base07: '#f9f8f5',
    base08: '#f92672',
    base09: '#fd971f',
    base0A: '#f4bf75',
    base0B: '#a6e22e',
    base0C: '#a1efe4',
    base0D: '#66d9ef',
    base0E: '#ae81ff',
    base0F: '#cc6633',
  };

  return (
    <Grid2 container spacing={3}>
      {/* Settings Section */}
      <Grid2 size={{ xs: 12, sm: 12 }}>
        <Card sx={{ p: 2, mb: 3 }}>
          <CardHeader
            title="Settings"
            sx={{ borderBottom: '1px solid #ddd' }}
          />
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
      </Grid2>

      {/* Information Section */}
      <Grid2 size={{ xs: 12, sm: 12 }}>
        <Card sx={{ p: 2 }}>
          <CardHeader
            title="Information"
            sx={{ borderBottom: '1px solid #ddd' }}
          />
          <CardContent>
            <JSONTree data={filteredPIMMs} theme={theme} invertTheme={true} />

            {/* Indicadores Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Indicadores" />
              <CardContent>
                <Box
                  display="grid"
                  gridTemplateColumns={{ xs: '1fr', md: 'repeat(2, 1fr)' }}
                  gap={2}
                >
                  <CardFactor
                    value={graphData?.indicadores?.data?.performance}
                    title="Rendimiento"
                  />
                  <CardFactor
                    value={graphData?.indicadores?.data?.availability}
                    title="Disponibilidad"
                  />
                  <CardFactor
                    value={graphData?.indicadores?.data?.quality}
                    title="Calidad"
                  />
                  <CardFactor
                    value={graphData?.indicadores?.data?.efficiency}
                    title="Eficiencia"
                  />
                </Box>
                <PolarChart
                  data={graphData?.indicadores.charts?.PolarChart?.data}
                />
                <TimeSeriesLineChart
                  series={graphData?.indicadores.charts?.SeriesLineChart?.data}
                  labelY="OEE(%)"
                />
              </CardContent>
            </Card>

            {/* Calidad Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Calidad" />
              <CardContent>
                <MultiLayerPieChart
                  data={graphData?.calidad?.charts?.MultiLayerPieChart?.data}
                />
                <TimeSeriesLineChart
                  series={graphData?.calidad.charts?.SeriesLineChart?.data}
                  labelY="Piezas (Unidades)"
                />
              </CardContent>
            </Card>

            {/* Disponibilidad Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Disponibilidad" />
              <CardContent>
                <MultiLayerPieChart
                  data={
                    graphData?.disponibilidad?.charts?.MultiLayerPieChart?.data
                  }
                />
                <TimeSeriesLineChart
                  series={
                    graphData?.disponibilidad.charts?.SeriesLineChart?.data
                  }
                  labelY="Piezas (Unidades)"
                />
              </CardContent>
            </Card>

            {/* Rendimiento Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Rendimiento" />
              <CardContent>
                <MultiLayerPieChart
                  data={graphData?.rendimiento.charts?.MultiLayerPieChart?.data}
                />
                <TimeSeriesLineChart
                  series={graphData?.rendimiento?.charts?.SeriesLineChart?.data}
                  labelY="Piezas (Unidades)"
                />
              </CardContent>
            </Card>

            {/* Montaje Section */}
            <Table data={graphData?.montaje.charts?.Table?.data} />

            {/* Energía Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Energía" />
              <CardContent>
                <StackedBarChart
                  labelY="Energía (kWh)"
                  data={graphData?.energia.charts?.StackedBarChart?.data}
                  keys={['motor', 'maquina']}
                />
                <TimeSeriesLineChart
                  labelY="Energía (kWh)"
                  series={graphData?.energia.charts?.SeriesLineChart?.data}
                />
              </CardContent>
            </Card>

            {/* Material Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Material" />
              <CardContent>
                <MultiLayerPieChart
                  data={graphData?.material.charts?.MultiLayerPieChart?.data}
                />
                <TimeSeriesLineChart
                  labelY="Material (g)"
                  series={graphData?.material.charts?.SeriesLineChart?.data}
                />
              </CardContent>
            </Card>

            {/* Molde Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Molde" />
              <CardContent>
                <MultiLayerPieChart
                  data={graphData?.molde.charts?.MultiLayerPieChart?.data}
                />
                <TimeSeriesLineChart
                  labelY="Material (g)"
                  series={graphData?.molde.charts?.SeriesLineChart?.data}
                />
              </CardContent>
            </Card>

            {/* Ciclos por PIMM Section */}
            <Card sx={{ p: 2, mb: 3 }}>
              <CardHeader title="Ciclos por PIMM" />
              <CardContent>
                <MultiLayerPieChart
                  data={graphData?.ciclos.charts?.MultiLayerPieChart?.data}
                />
                <TimeSeriesLineChart
                  labelY="Maquina (Ciclos)"
                  series={graphData?.ciclos.charts?.SeriesLineChart?.data}
                />
                <TimeSeriesLineChart
                  labelY="Puerta (Ciclos)"
                  series={graphData?.ciclos.charts?.SeriesLineChart?.data2}
                />
              </CardContent>
            </Card>
          </CardContent>
        </Card>
      </Grid2>
    </Grid2>
  );
}
