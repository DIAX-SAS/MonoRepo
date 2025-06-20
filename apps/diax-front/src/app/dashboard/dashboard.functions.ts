import {
  GraphData,
  PIMM,
  ReducePIMMs,
  type FEPIMM,
} from './dashboard.types';

const getCounterValue = (FEPIMM: FEPIMM | PIMM, counterName: string) =>
  Number(FEPIMM.counters.find((c) => c.name === counterName)?.value) || 0;
const getStateValue = (FEPIMM: FEPIMM | PIMM, counterName: string) =>
  Number(FEPIMM.states.find((c) => c.name === counterName)?.value) || 0;

export const calculateGraphData = async (filteredPIMMs: FEPIMM[]) => {
  const groupedByPLC: Record<number, FEPIMM[]> = {};

  const initReducePIMMs = (): ReducePIMMs => ({
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
    acc_timestamp: 0
  });

  for (const fepimm of filteredPIMMs) {
    if (!groupedByPLC[fepimm.plcId]) {
      groupedByPLC[fepimm.plcId] = [];
    }
    groupedByPLC[fepimm.plcId].push(fepimm);
  }

  const timestamps = filteredPIMMs.map((f) => f.timestamp);
  const minTimestamp = Math.min(...timestamps);
  const maxTimestamp = Math.max(...timestamps);
  const timeOverall = (maxTimestamp - minTimestamp) / 1000; // en minutos



  // Indicadores
  type OEE = {
    performance: number;
    availability: number;
    quality: number;
    efficiency: number;
  };

  type OEEMetrics = {
    acc_inyecciones: number;
    acc_ineficiencias: number;
    acc_noProg: number;
    acc_maquina: number;
    acc_molde: number;
    acc_abandono: number;
    acc_material: number;
    acc_calidad: number;
    acc_montaje: number;
    acc_buenas: number;
    acc_defectoInicioTurno: number;
    acc_noConformes: number;
    acc_timestamp: number;
  };

  const initOEEMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>,
    index?: number
  ): OEEMetrics => {
    return Object.entries(groupedByPLC)
      .map(([plcId, fepimms]) => {
        if (!index || index > fepimms.length - 1) index = fepimms.length - 1;
        const lastFEPIMM = fepimms[index];
        return {
          acc_inyecciones: getCounterValue(lastFEPIMM, 'Contador Inyecciones'),
          acc_ineficiencias: lastFEPIMM.ineficiencias,
          acc_noProg: getCounterValue(lastFEPIMM, 'Minutos No Programada'),
          acc_maquina: getCounterValue(lastFEPIMM, 'Minutos Mantto Maquina'),
          acc_molde: getCounterValue(lastFEPIMM, 'Minutos Mantto Molde'),
          acc_abandono: getCounterValue(lastFEPIMM, 'Minutos Sin Operario'),
          acc_material: getCounterValue(lastFEPIMM, 'Minutos Por Material'),
          acc_calidad: getCounterValue(lastFEPIMM, 'Minutos Calidad'),
          acc_montaje: getCounterValue(lastFEPIMM, 'Minutos Montaje'),
          acc_buenas: lastFEPIMM.buenas,
          acc_defectoInicioTurno: getCounterValue(
            lastFEPIMM,
            'Unidades Defecto Inicio Turno'
          ),
          acc_noConformes: getCounterValue(lastFEPIMM, 'Unidades No Conformes'),
          acc_timestamp: lastFEPIMM.timestamp,
        };
      })
      .reduce((acc, curr) => {
        acc.acc_inyecciones += curr.acc_inyecciones;
        acc.acc_ineficiencias += curr.acc_ineficiencias;
        acc.acc_noProg += curr.acc_noProg;
        acc.acc_maquina += curr.acc_maquina;
        acc.acc_molde += curr.acc_molde;
        acc.acc_abandono += curr.acc_abandono;
        acc.acc_material += curr.acc_material;
        acc.acc_calidad += curr.acc_calidad;
        acc.acc_montaje += curr.acc_montaje;
        acc.acc_buenas += curr.acc_buenas;
        acc.acc_defectoInicioTurno += curr.acc_defectoInicioTurno;
        acc.acc_noConformes += curr.acc_noConformes;
        acc.acc_timestamp += curr.acc_timestamp;
        return acc;
      }, initReducePIMMs());
  };

  const amountPLCs = Object.keys(groupedByPLC).length;
  const timeTotal = timeOverall * amountPLCs;

  const createGrapStructure = (): GraphData => ({
    indicadores: {},
    calidad: {},
    disponibilidad: {},
    rendimiento: {},
    montaje: {},
    energia: {},
    material: {},
    molde: {},
    ciclos: {},
  });

  const graphData: GraphData = createGrapStructure();

  let maxFEPIMMsAmount = 0;
  Object.values(groupedByPLC).forEach((FEPIMMs) => {
    if (FEPIMMs.length > maxFEPIMMsAmount) {
      maxFEPIMMsAmount = FEPIMMs.length;
    }
  });

  let OEE: OEE = {
    performance: 0,
    availability: 0,
    quality: 0,
    efficiency: 0,
  };

  graphData.calidad.MultiLine = [];

  const performanceData = []
  const availabilityData = []
  const qualityData = []
  const efficiencyData = []

  for (let i = 0; i < maxFEPIMMsAmount; i++) {
    const OEEMetrics: OEEMetrics = initOEEMetrics(groupedByPLC, i);

    let totalOperationalTime = timeTotal - OEEMetrics.acc_noProg;
    const totalLosses =
      OEEMetrics.acc_maquina +
      OEEMetrics.acc_molde +
      OEEMetrics.acc_abandono +
      OEEMetrics.acc_material +
      OEEMetrics.acc_calidad +
      OEEMetrics.acc_montaje;

    if(totalOperationalTime <= totalLosses){
      totalOperationalTime = 2 * 60 * 60 - OEEMetrics.acc_noProg;
    }

    // Aseguramos que no haya división por cero
    const safeDivide = (numerator: number, denominator: number) =>
      denominator === 0 ? 0 : numerator / denominator;

    const performance =
      Math.round(
        safeDivide(
          OEEMetrics.acc_inyecciones,
          OEEMetrics.acc_inyecciones + OEEMetrics.acc_ineficiencias
        ) * 1000
      ) / 10;

    const availability =
      Math.round(
        safeDivide(totalOperationalTime - totalLosses, totalOperationalTime) *
          1000
      ) / 10;

      console.log("availability:", availability," TotalOperationTime:", totalOperationalTime, " TotalLosses:", totalLosses)

    const quality =
      Math.round(
        safeDivide(
          OEEMetrics.acc_buenas,
          OEEMetrics.acc_buenas +
            OEEMetrics.acc_defectoInicioTurno +
            OEEMetrics.acc_noConformes
        ) * 1000
      ) / 10;

    const efficiency = Number((
      (availability / 100) *
      (performance / 100) *
      (quality / 100) *
      100
    ).toFixed(1));

    OEE = {
      performance,
      availability,
      quality,
      efficiency,
    };

    performanceData.push({
      value: performance,
      timestamp: OEEMetrics.acc_timestamp / amountPLCs,
    });
    availabilityData.push({
      value: availability,
      timestamp: OEEMetrics.acc_timestamp / amountPLCs,
    });
    qualityData.push({
      value: quality,
      timestamp: OEEMetrics.acc_timestamp / amountPLCs,
    });

    efficiencyData.push({
      value: efficiency,
      timestamp: OEEMetrics.acc_timestamp / amountPLCs,
    });
  }

  graphData.indicadores.MultiLine = [
    { name: 'Rendimiento', data: performanceData },
    { name: 'Availability', data: availabilityData },
    { name: 'Quality', data: qualityData },
    { name: 'Efficiency', data: efficiencyData },
  ];

  graphData.indicadores.OEE = OEE;

  graphData.indicadores.Polar = [
    { category: 'Rendimiento', value: OEE.performance },
    { category: 'Disponibilidad', value: OEE.availability },
    { category: 'Calidad', value: OEE.quality },
  ];

  // Calidad
  type QualityMetrics = Discrimination & {
    buenas: number;
    malas: {
      arranque: number;
      rechazo: number;
    };
  };

  const initQualityMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): QualityMetrics[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const selectedFEPIMM = fepimms[fepimms.length - 1]; // Get the last FEPIMM for each PLC
      return {
        buenas: selectedFEPIMM.buenas,
        malas: {
          arranque: getCounterValue(
            selectedFEPIMM,
            'Unidades Defecto Inicio Turno'
          ),
          rechazo: getCounterValue(selectedFEPIMM, 'Unidades No Conformes'),
        },
        plcId: selectedFEPIMM.plcId,
        timestamp: selectedFEPIMM.timestamp,
      };
    });
  };

  const qualityMetricsAll: QualityMetrics[] = initQualityMetrics(groupedByPLC);

  graphData.calidad.MultiPie = {
    name: 'Producción',
    children: [
      {
        name: 'Buenas',
        children: qualityMetricsAll.map((qualityMetrics) => ({
          name: 'PIMM ' + String(qualityMetrics.plcId),
          value: qualityMetrics.buenas,
        })),
      },
      {
        name: 'Malas',
        children: [
          {
            name: 'Arranque',
            children: qualityMetricsAll.map((qualityMetrics) => ({
              name: 'PIMM ' + String(qualityMetrics.plcId),
              value: qualityMetrics.malas.arranque,
            })),
          },
          {
            name: 'Rechazo',
            children: qualityMetricsAll.map((qualityMetrics) => ({
              name: 'PIMM ' + String(qualityMetrics.plcId),
              value: qualityMetrics.malas.rechazo,
            })),
          },
        ],
      },
    ],
  };

  graphData.calidad.MultiLine = [];

  Object.entries(groupedByPLC).forEach(([plcId, fepimms]) => {
    graphData.calidad.MultiLine?.push({
      name: 'Buenas PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: fepimm.buenas,
      })),
    });

    graphData.calidad.MultiLine?.push({
      name: 'Arranque PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Unidades Defecto Inicio Turno'),
      })),
    });

    graphData.calidad.MultiLine?.push({
      name: 'Rechazo PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Unidades No Conformes'),
      })),
    });
  });

  // Rendimiento
  type PerformanceMetrics = Discrimination & {
    producido: number;
    ineficiencias: number;
    plcId: number;
  };

  const initPerformanceMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): PerformanceMetrics[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const lastFepimm = fepimms[fepimms.length - 1];
      return {
        producido: lastFepimm.producidas,
        ineficiencias: lastFepimm.ineficiencias,
        plcId: lastFepimm.plcId,
        timestamp: lastFepimm.timestamp,
      };
    });
  };

  const performanceMetricsAll: PerformanceMetrics[] =
    initPerformanceMetrics(groupedByPLC);
  graphData.rendimiento.MultiPie = {
    name: 'Capacidad',
    children: [
      {
        name: 'Producido',
        children: performanceMetricsAll.map((performanceMetrics) => ({
          name: 'PIMM ' + String(performanceMetrics.plcId),
          value: performanceMetrics.producido,
        })),
      },
      {
        name: 'Ineficiencias',
        children: performanceMetricsAll.map((performanceMetrics) => ({
          name: 'PIMM ' + String(performanceMetrics.plcId),
          value: performanceMetrics.ineficiencias,
        })),
      },
    ],
  };

  graphData.rendimiento.MultiLine = [];

  Object.entries(groupedByPLC).forEach(([plcId, fepimms]) => {
    graphData.rendimiento.MultiLine?.push({
      name: 'Producido PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: fepimm.producidas,
      })),
    });

    graphData.rendimiento.MultiLine?.push({
      name: 'Ineficiencias PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: fepimm.ineficiencias,
      })),
    });
  });
  // Disponibilidad
  type AvailabilityMetrics = Discrimination & {
    productivo: number;
    paradas: {
      maquina: number;
      sinOperario: number;
      calidad: number;
      montaje: number;
      molde: number;
      material: number;
    };
  };

  const initAvailabilityMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): AvailabilityMetrics[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const lastFepimm = fepimms[fepimms.length - 1];
      return {
        productivo: getCounterValue(lastFepimm, 'Minutos Motor Encendido'),
        paradas: {
          maquina: getCounterValue(lastFepimm, 'Minutos Mantto Maquina'),
          sinOperario: getCounterValue(lastFepimm, 'Minutos Sin Operario'),
          calidad: getCounterValue(lastFepimm, 'Minutos Calidad'),
          montaje: getCounterValue(lastFepimm, 'Minutos Montaje'),
          molde: getCounterValue(lastFepimm, 'Minutos Mantto Molde'),
          material: getCounterValue(lastFepimm, 'Minutos Por Material'),
        },
        timestamp: lastFepimm.timestamp,
        plcId: lastFepimm.plcId,
      };
    });
  };

  const availabilityMetricsAll: AvailabilityMetrics[] =
    initAvailabilityMetrics(groupedByPLC);
  graphData.disponibilidad.MultiPie = {
    name: 'Disponible',
    children: [
      {
        name: 'Productivo',
        children: availabilityMetricsAll.map((availabilityMetrics) => ({
          name: 'PIMM ' + String(availabilityMetrics.plcId),
          value: availabilityMetrics.productivo,
        })),
      },
      {
        name: 'Paradas',
        children: [
          {
            name: 'Maquina',
            children: availabilityMetricsAll.map((availabilityMetrics) => ({
              name: 'PIMM ' + String(availabilityMetrics.plcId),
              value: availabilityMetrics.paradas.maquina,
            })),
          },
          {
            name: 'SinOperario',
            children: availabilityMetricsAll.map((availabilityMetrics) => ({
              name: 'PIMM ' + String(availabilityMetrics.plcId),
              value: availabilityMetrics.paradas.sinOperario,
            })),
          },
          {
            name: 'Calidad',
            children: availabilityMetricsAll.map((availabilityMetrics) => ({
              name: 'PIMM ' + String(availabilityMetrics.plcId),
              value: availabilityMetrics.paradas.calidad,
            })),
          },
          {
            name: 'Montaje',
            children: availabilityMetricsAll.map((availabilityMetrics) => ({
              name: 'PIMM ' + String(availabilityMetrics.plcId),
              value: availabilityMetrics.paradas.montaje,
            })),
          },
          {
            name: 'Molde',
            children: availabilityMetricsAll.map((availabilityMetrics) => ({
              name: 'PIMM ' + String(availabilityMetrics.plcId),
              value: availabilityMetrics.paradas.molde,
            })),
          },
          {
            name: 'Material',
            children: availabilityMetricsAll.map((availabilityMetrics) => ({
              name: 'PIMM ' + String(availabilityMetrics.plcId),
              value: availabilityMetrics.paradas.material,
            })),
          },
        ],
      },
    ],
  };

  graphData.disponibilidad.MultiLine = [];

  Object.entries(groupedByPLC).forEach(([plcId, fepimms]) => {
    graphData.disponibilidad.MultiLine?.push({
      name: 'Productivo PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Motor Encendido'),
      })),
    });

    graphData.disponibilidad.MultiLine?.push({
      name: 'Maquina PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Mantto Maquina'),
      })),
    });

    graphData.disponibilidad.MultiLine?.push({
      name: 'SinOperario PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Sin Operario'),
      })),
    });

    graphData.disponibilidad.MultiLine?.push({
      name: 'Calidad PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Calidad'),
      })),
    });

    graphData.disponibilidad.MultiLine?.push({
      name: 'Montaje PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Montaje'),
      })),
    });

    graphData.disponibilidad.MultiLine?.push({
      name: 'Molde PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Mantto Molde'),
      })),
    });

    graphData.disponibilidad.MultiLine?.push({
      name: 'Material PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Por Material'),
      })),
    });
  });

  // Energia
  type EnergyMetrics = Discrimination & {
    motor: number;
    maquina: number;
    plcId: number;
  };

  const initEnergyMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): EnergyMetrics[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const lastFepimm = fepimms[fepimms.length - 1];
      return {
        motor: getCounterValue(lastFepimm, 'KW Motor'),
        maquina: getCounterValue(lastFepimm, 'KW Total Maquina'),
        plcId: lastFepimm.plcId,
        timestamp: lastFepimm.timestamp,
      };
    });
  };

  const energyMetricsAll: EnergyMetrics[] = initEnergyMetrics(groupedByPLC);

  graphData.energia.StackedBar = energyMetricsAll.map((energyMetrics) => ({
    category: 'PIMM ' + String(energyMetrics.plcId),
    motor: energyMetrics.motor,
    maquina: energyMetrics.maquina,
  }));

  graphData.energia.MultiLine = [];

  Object.entries(groupedByPLC).forEach(([plcId, fepimms]) => {
    graphData.energia.MultiLine?.push({
      name: 'Motor PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'KW Motor'),
      })),
    });

    graphData.energia.MultiLine?.push({
      name: 'Maquina PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'KW Total Maquina'),
      })),
    });
  });

  // Montaje

  const initMountingMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): FEPIMM[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const lastFepimm = fepimms[fepimms.length - 1];
      return {
        ...lastFepimm,
      };
    });
  };

  const mountingMetricsAll: FEPIMM[] = initMountingMetrics(groupedByPLC);
  graphData.montaje.Mounting = mountingMetricsAll;

  // Material
  type MaterialMetrics = Discrimination & {
    cavidades: {
      cav1: number;
      cav2: number;
      cav3: number;
      cav4: number;
      cav5: number;
      cav6: number;
      gramosGeneral: number;
    };
  };

  const initMaterialMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): MaterialMetrics[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const lastFepimm = fepimms[fepimms.length - 1];
      return {
        plcId: lastFepimm.plcId,
        cavidades: {
          cav1: getCounterValue(lastFepimm, 'Gramos Cavidad 1'),
          cav2: getCounterValue(lastFepimm, 'Gramos Cavidad 2'),
          cav3: getCounterValue(lastFepimm, 'Gramos Cavidad 3'),
          cav4: getCounterValue(lastFepimm, 'Gramos Cavidad 4'),
          cav5: getCounterValue(lastFepimm, 'Gramos Cavidad 5'),
          cav6: getCounterValue(lastFepimm, 'Gramos Cavidad 6'),
          gramosGeneral: getCounterValue(lastFepimm, 'Gramos Inyeccion'),
        },
        timestamp: lastFepimm.timestamp,
      };
    });
  };

  const materialMetricsAll: MaterialMetrics[] =
    initMaterialMetrics(groupedByPLC);
  graphData.material.MultiPie = {
    name: 'Total',
    children: materialMetricsAll.map((materialMetrics) => ({
      name: `PIMM ${materialMetrics.plcId}`,
      children: [
        { name: 'Cavidad 1', value: materialMetrics.cavidades.cav1 },
        { name: 'Cavidad 2', value: materialMetrics.cavidades.cav2 },
        { name: 'Cavidad 3', value: materialMetrics.cavidades.cav3 },
        { name: 'Cavidad 4', value: materialMetrics.cavidades.cav4 },
        { name: 'Cavidad 5', value: materialMetrics.cavidades.cav5 },
        { name: 'Cavidad 6', value: materialMetrics.cavidades.cav6 },
      ],
    })),
  };

  graphData.material.MultiLine = [];

  Object.entries(groupedByPLC).forEach(([plcId, fepimms]) => {
    graphData.material.MultiLine?.push({
      name: 'Cavidad 1 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 1'),
      })),
    });

    graphData.material.MultiLine?.push({
      name: 'Cavidad 2 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 2'),
      })),
    });

    graphData.material.MultiLine?.push({
      name: 'Cavidad 3 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 3'),
      })),
    });

    graphData.material.MultiLine?.push({
      name: 'Cavidad 4 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 4'),
      })),
    });

    graphData.material.MultiLine?.push({
      name: 'Cavidad 5 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 5'),
      })),
    });

    graphData.material.MultiLine?.push({
      name: 'Cavidad 6 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 6'),
      })),
    });
  });

  // Molde

  const initMoldMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): MaterialMetrics[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const lastFepimm = fepimms[fepimms.length - 1];
      const moldeId = getStateValue(lastFepimm, 'Molde');
      return {
        molde: moldeId,
        cavidades: {
          cav1: getCounterValue(lastFepimm, 'Gramos Cavidad 1'),
          cav2: getCounterValue(lastFepimm, 'Gramos Cavidad 2'),
          cav3: getCounterValue(lastFepimm, 'Gramos Cavidad 3'),
          cav4: getCounterValue(lastFepimm, 'Gramos Cavidad 4'),
          cav5: getCounterValue(lastFepimm, 'Gramos Cavidad 5'),
          cav6: getCounterValue(lastFepimm, 'Gramos Cavidad 6'),
          gramosGeneral: getCounterValue(lastFepimm, 'Gramos Inyeccion'),
        },
        timestamp: lastFepimm.timestamp,
      };
    });
  };
  const moldMetricsAll: MaterialMetrics[] = initMoldMetrics(groupedByPLC);
  graphData.molde.MultiPie = {
    name: 'Total',
    children: moldMetricsAll.map((materialMetrics) => ({
      name: `Molde ${materialMetrics.molde}`,
      children: [
        { name: 'Cavidad 1', value: materialMetrics.cavidades.cav1 },
        { name: 'Cavidad 2', value: materialMetrics.cavidades.cav2 },
        { name: 'Cavidad 3', value: materialMetrics.cavidades.cav3 },
        { name: 'Cavidad 4', value: materialMetrics.cavidades.cav4 },
        { name: 'Cavidad 5', value: materialMetrics.cavidades.cav5 },
        { name: 'Cavidad 6', value: materialMetrics.cavidades.cav6 },
      ],
    })),
  };

  graphData.molde.MultiLine = [];

  Object.entries(groupedByPLC).forEach(([plcId, fepimms]) => {
    graphData.molde.MultiLine?.push({
      name: 'Cavidad 1 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 1'),
      })),
    });

    graphData.molde.MultiLine?.push({
      name: 'Cavidad 2 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 2'),
      })),
    });

    graphData.molde.MultiLine?.push({
      name: 'Cavidad 3 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 3'),
      })),
    });

    graphData.molde.MultiLine?.push({
      name: 'Cavidad 4 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 4'),
      })),
    });

    graphData.molde.MultiLine?.push({
      name: 'Cavidad 5 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 5'),
      })),
    });

    graphData.molde.MultiLine?.push({
      name: 'Cavidad 6 PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Gramos Cavidad 6'),
      })),
    });
  });
  // Ciclos
  type CycleMetrics = Discrimination & {
    plcId: number;
    maquina: number;
    puerta: number;
  };

  const initCycleMetrics = (
    groupedByPLC: Record<number, FEPIMM[]>
  ): CycleMetrics[] => {
    return Object.keys(groupedByPLC).map((plcId) => {
      const fepimms = groupedByPLC[Number(plcId)];
      const lastFepimm = fepimms[fepimms.length - 1];
      return {
        plcId: lastFepimm.plcId,
        maquina: getCounterValue(lastFepimm, 'Minutos Motor Encendido'),
        puerta: getCounterValue(lastFepimm, 'Minutos Fin Produccion'),
        timestamp: lastFepimm.timestamp,
      };
    });
  };

  const cycleMetricsAll: CycleMetrics[] = initCycleMetrics(groupedByPLC);

  graphData.ciclos.MultiPie = {
    name: 'Total',
    children: cycleMetricsAll.map((cycleMetrics) => ({
      name: `PIMM ${cycleMetrics.plcId}`,
      children: [
        { name: 'Maquina', value: cycleMetrics.maquina },
        { name: 'Puerta', value: cycleMetrics.puerta },
      ],
    })),
  };

  graphData.ciclos.MultiLine = [];

  Object.entries(groupedByPLC).forEach(([plcId, fepimms]) => {
    graphData.ciclos.MultiLine?.push({
      name: 'Maquina PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Motor Encendido'),
      })),
    });

    graphData.ciclos.MultiLine?.push({
      name: 'Puerta PIMM ' + plcId,
      data: fepimms.map((fepimm) => ({
        timestamp: fepimm.timestamp,
        value: getCounterValue(fepimm, 'Minutos Fin Produccion'),
      })),
    });
  });

  //

  type Discrimination = (
    | { plcId: number; molde?: never }
    | { molde: number; plcId?: never }
  ) & {
    timestamp: number;
  };

  return graphData;
};
