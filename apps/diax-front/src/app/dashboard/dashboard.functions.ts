import { RefObject } from 'react';
import { AccumulatedData, GraphData, GroupedFEPIMM, PIMM, ReduceGroupedPIMMs, ReduceMolde, type FEPIMM, type Filters, type Parameters } from './dashboard.types';

const config = {
    offsetKeys: [
        'Minutos Motor Encendido',
        'Contador Inyecciones',
        'Contador Unidades',
        'KW Motor',
        'KW Total Maquina',
        'Minutos Mantto Maquina',
        'Minutos Mantto Molde',
        'Minutos Montaje',
        'Minutos Sin Operario',
        'Minutos No Programada',
        'Minutos Fin Produccion',
        'Minutos Por Material',
        'Minutos Calidad',
        'Minutos Fin Turno',
        'Unidades Defecto Inicio Turno',
        'Unidades No Conformes',
    ],
    keyPIMMNumber: 'Numero Inyectora',
};

const MS_CONVERSION: { [key in Parameters['step']]: number } = {
    second: 1000,
    minute: 1000 * 60,
    hour: 1000 * 60 * 60,
};

const getCounterValue = (FEPIMM: FEPIMM | PIMM, counterName: string) =>
    Number(FEPIMM.counters.find((c) => c.name === counterName)?.value) || 0;
const getStateValue = (FEPIMM: FEPIMM | PIMM, counterName: string) =>
    Number(FEPIMM.states.find((c) => c.name === counterName)?.value) || 0;

export const calculateGraphData = async (filteredPIMMs: FEPIMM[], stepRef: RefObject<Parameters['step']>) => {
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
                        return {
                            acc_buenas: acc.acc_buenas + (FEPIMM.buenas || 0),
                            acc_noConformes:
                                acc.acc_noConformes +
                                getCounterValue(FEPIMM, 'Unidades No Conformes'),
                            acc_defectoInicioTurno:
                                acc.acc_defectoInicioTurno +
                                getCounterValue(FEPIMM, 'Unidades Defecto Inicio Turno'),
                            acc_inyecciones:
                                acc.acc_inyecciones +
                                getCounterValue(FEPIMM, 'Contador Inyecciones'),
                            acc_ineficiencias:
                                acc.acc_ineficiencias + FEPIMM.ineficiencias,
                            acc_producidas: acc.acc_producidas + FEPIMM.producidas,
                            acc_montaje:
                                acc.acc_montaje +
                                getCounterValue(FEPIMM, 'Minutos Montaje'),
                            acc_calidad:
                                acc.acc_calidad +
                                getCounterValue(FEPIMM, 'Minutos Calidad'),
                            acc_material:
                                acc.acc_material +
                                getCounterValue(FEPIMM, 'Minutos Por Material'),
                            acc_abandono:
                                acc.acc_abandono +
                                getCounterValue(FEPIMM, 'Minutos Sin Operario'),
                            acc_molde:
                                acc.acc_molde +
                                getCounterValue(FEPIMM, 'Minutos Mantto Molde'),
                            acc_maquina:
                                acc.acc_maquina +
                                getCounterValue(FEPIMM, 'Minutos Mantto Maquina'),
                            acc_noProg:
                                acc.acc_noProg +
                                getCounterValue(FEPIMM, 'Minutos No Programada'),
                            acc_motor:
                                acc.acc_motor +
                                getCounterValue(FEPIMM, 'KW Motor'),
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
                        moldes[String(stateMap.get('Molde')?.value)].acc_cav1 += getCounterValue(FEPIMM, 'Gramos Cavidad 1');
                        moldes[String(stateMap.get('Molde')?.value)].acc_cav2 += getCounterValue(FEPIMM, 'Gramos Cavidad 2');
                        moldes[String(stateMap.get('Molde')?.value)].acc_cav3 += getCounterValue(FEPIMM, 'Gramos Cavidad 3');
                        moldes[String(stateMap.get('Molde')?.value)].acc_cav4 += getCounterValue(FEPIMM, 'Gramos Cavidad 4');
                        moldes[String(stateMap.get('Molde')?.value)].acc_cav5 += getCounterValue(FEPIMM, 'Gramos Cavidad 5');
                        moldes[String(stateMap.get('Molde')?.value)].acc_cav6 += getCounterValue(FEPIMM, 'Gramos Cavidad 6');
                        moldes[String(stateMap.get('Molde')?.value)].acc_gramosgeneral += getCounterValue(FEPIMM, 'Gramos Inyeccion');

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

    const groupedFEPIMMs = reduceGroupedFEPIMMs(groupByUnitTime(
        filteredPIMMs,
        MS_CONVERSION[stepRef.current]
    ));

    const lastGroupPLC = groupedFEPIMMs[groupedFEPIMMs.length - 1];

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
                                    name: 'PIMM ' + String(FEPIMM.plcId),
                                    value: FEPIMM.buenas,
                                })),
                            },
                            {
                                name: 'Malas',
                                children: [
                                    {
                                        name: 'Arranque',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Unidades No Conformes'),
                                        })),
                                    },
                                    {
                                        name: 'Rechazo',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Unidades Defecto Inicio Turno'),
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
                                    name: 'PIMM ' + String(FEPIMM.plcId),
                                    value: FEPIMM.producidas,
                                })),
                            },
                            {
                                name: 'Paradas',
                                children: [
                                    {
                                        name: 'Maquina',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Minutos Mantto Maquina'),
                                        })),
                                    },
                                    {
                                        name: 'SinOperario',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Minutos Sin Operario'),
                                        })),
                                    },
                                    {
                                        name: 'Calidad',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Minutos Calidad'),
                                        })),
                                    },
                                    {
                                        name: 'Montaje',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Minutos Montaje'),
                                        })),
                                    },
                                    {
                                        name: 'Molde',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Minutos Mantto Molde'),
                                        })),
                                    },
                                    {
                                        name: 'Material',
                                        children: lastGroupPLC?.FEPIMMs.map((FEPIMM: FEPIMM) => ({
                                            name: 'PIMM ' + String(FEPIMM.plcId),
                                            value: getCounterValue(FEPIMM, 'Minutos Por Material'),
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
                                    name: 'PIMM ' + String(FEPIMM.plcId),
                                    value: getCounterValue(FEPIMM, 'Gramos Inyeccion'),
                                })),
                            },
                            {
                                name: 'Ineficiencias',
                                children: lastGroupPLC?.FEPIMMs.map((FEPIMM) => ({
                                    name: 'PIMM ' + String(FEPIMM.plcId),
                                    value: FEPIMM.ineficiencias
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
                        category: 'PIMM ' + FEPIMM.plcId,
                        motor: getCounterValue(FEPIMM, 'KW Motor'),
                        maquina: getCounterValue(FEPIMM, 'KW Total Maquina'),
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
                            name: `PIMM ${FEPIMM.plcId}`,
                            children: FEPIMM.counters
                                .filter((counter) =>
                                    counter.name?.toLowerCase().includes('cavidad')
                                )
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
                                if (!acc[FEPIMM.plcId]) {
                                    acc[FEPIMM.plcId] = [];
                                }
                                const value = getCounterValue(FEPIMM, "Gramos Inyeccion");
                                acc[FEPIMM.plcId].push({
                                    timestamp: FEPIMM.timestamp,
                                    value: value,
                                });
                            });

                            return acc;
                        }, {} as { [key: number]: { timestamp: number; value: number }[] })
                    ).map(([plcId, data]) => ({
                        name: `PIMM ${plcId}`,
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
                            const puerta = getCounterValue(FEPIMM, 'Segundos Ultimo Ciclo Puerta');

                            return {
                                name: `PIMM ${FEPIMM.plcId}`,
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
                                if (!acc[FEPIMM.plcId]) {
                                    acc[FEPIMM.plcId] = [];
                                }

                                const value = groupedFEPIMM.FEPIMMs.reduce((acc, FEPIMM) => {
                                    return (
                                        acc +
                                        Number(
                                            getCounterValue(FEPIMM, 'Segundos Ultimo Ciclo Total')
                                        ) -
                                        Number(
                                            getCounterValue(FEPIMM, 'Segundos Ultimo Ciclo Puerta')
                                        )
                                    );
                                }, 0);

                                acc[FEPIMM.plcId].push({
                                    timestamp: FEPIMM.timestamp,
                                    value: value,
                                });
                            });

                            return acc;
                        }, {} as { [key: number]: { timestamp: number; value: number }[] })
                    ).map(([plcId, data]) => ({
                        name: `PIMM ${plcId}`,
                        color: 'red',
                        data: data.sort((a, b) => a.timestamp - b.timestamp), // Ordenar por timestamp
                    })),
                    data2: Object.entries(
                        groupedFEPIMMs.reduce((acc, groupedFEPIMM) => {
                            groupedFEPIMM.FEPIMMs.forEach((FEPIMM) => {
                                if (!acc[FEPIMM.plcId]) {
                                    acc[FEPIMM.plcId] = [];
                                }
                                const value = groupedFEPIMM.FEPIMMs.reduce((acc, FEPIMM) => {
                                    return (
                                        acc +
                                        Number(
                                            getCounterValue(FEPIMM, 'Segundos Ultimo Ciclo Puerta')
                                        )
                                    );
                                }, 0);

                                acc[FEPIMM.plcId].push({
                                    timestamp: FEPIMM.timestamp,
                                    value: value,
                                });
                            });

                            return acc;
                        }, {} as { [key: number]: { timestamp: number; value: number }[] })
                    ).map(([plcId, data]) => ({
                        name: `PIMM ${plcId}`,
                        color: 'red',
                        data: data.sort((a, b) => a.timestamp - b.timestamp), // Ordenar por timestamp
                    })),
                },
            },
        },
    };
    return calculatedGraphData;
};

export const applyFilters = async (
    filters: Filters,
    PIMMs: PIMM[],
    stepRef: RefObject<Parameters['step']>
): Promise<FEPIMM[]> => {
    if (PIMMs.length == 0) return [];

    const filterPIMMsByState = (PIMMs: PIMM[], filters: Filters): PIMM[] => {
        const filteredPIMMsByState: PIMM[] = [];
        PIMMs.forEach((PIMM: PIMM, i: number) => {
            if (filterSet(PIMM, filters.lotes, "Lote") &&
                filterSet(PIMM, filters.materiales, "Material") &&
                filterSet(PIMM, filters.moldes, "Molde") &&
                filterSet(PIMM, filters.operarios, "Operario") &&
                filterSet(PIMM, filters.ordenes, "Orden") &&
                filterSet(PIMM, filters.equipos, "Numero Inyectora")) {

                filteredPIMMsByState.push(JSON.parse(JSON.stringify(PIMM)));
            }
        });
        const filterSet = (FEPIMM: FEPIMM | PIMM, map: Map<string, boolean>, name: string) => {
            if (map.size == 0) {
                return true;
            }
            return map.get(String(getStateValue(FEPIMM, name)))
        }
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
            const diffDate =
                (PIMMs.at(-1)?.timestamp ?? 0) -
                (PIMMs.at(0)?.timestamp ?? 0);

            FEPIMMs.push({
                ...PIMM,
                buenas:
                    getCounterValue(PIMM, 'Contador Unidades') -
                    getCounterValue(PIMM, 'Unidades Defecto Inicio Turno') -
                    getCounterValue(PIMM, 'Unidades No Conformes'),
                ineficiencias:
                    (getCounterValue(PIMM, 'Minutos Motor Encendido') * 60) /
                    getCounterValue(PIMM, 'Segundos Ciclo Estandar') -
                    getCounterValue(PIMM, 'Contador Inyecciones'),
                maquina:
                    getCounterValue(PIMM, 'Segundos Ultimo Ciclo Total') -
                    getCounterValue(PIMM, 'Segundos Ultimo Ciclo Puerta'),
                producidas:
                    diffDate / MS_CONVERSION[stepRef.current] -
                    getCounterValue(PIMM, 'Minutos No Programada') -
                    (getCounterValue(PIMM, 'Minutos Mantto Maquina') +
                        getCounterValue(PIMM, 'Minutos Mantto Molde') +
                        getCounterValue(PIMM, 'Minutos Sin Operario') +
                        getCounterValue(PIMM, 'Minutos Por Material') +
                        getCounterValue(PIMM, 'Minutos Calidad') +
                        getCounterValue(PIMM, 'Minutos Montaje')),
            });
        });
        return FEPIMMs;
    };

    return computeDerivedCounterValues(
        offsetPIMMCounters(filterPIMMsByState(PIMMs, filters))
    );
};




