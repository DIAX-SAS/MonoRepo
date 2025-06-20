'use client';

import * as React from 'react';
import Header from '../../components/sections/header';
import Configuration from '../../components/sections/configuracion';
import Indicadores from '../../components/sections/indicadores';
import Calidad from '../../components/sections/calidad';
import Disponibilidad from '../../components/sections/disponibilidad';
import Rendimiento from '../../components/sections/rendimiento';
import Ciclos from '../../components/sections/ciclos';
import Montaje from '../../components/sections/montaje';
import Material from '../../components/sections/material';
import Energia from '../../components/sections/energia';
import {
  GraphData,
  PimmsStepUnit,
  type FEPIMM,
  type Filters,
  type Parameters,
  PIMM,
} from './dashboard.types';
import { fetchPIMMs } from '../../data-access/diax-back/diax-back';
import {
  connectToMQTTBroker,
  closeConnectionToMQTTBroker,
} from '../../data-access/mqtt-broker/mqtt-broker';

import styles from './styles.module.scss';
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
    live: true,
    startDate: new Date().getTime(),
    endDate: new Date().getTime(),
    step: PimmsStepUnit.SECOND,
  });

  const [PIMMs, setPIMMs] = React.useState<PIMM[]>([]);
  const [filteredPIMMs, setFilteredPIMMs] = React.useState<FEPIMM[]>([]);
  const [graphData, setGraphData] = React.useState<GraphData | undefined>();

  React.useEffect(() => {
    (async () => {
      const { calculateGraphData } = await import('./dashboard.functions');
      setGraphData(await calculateGraphData(filteredPIMMs));
    })();
  }, [filteredPIMMs]);

  React.useEffect(() => {
    const updatedFilteredPIMMs: FEPIMM[] = [];
    const getCounterValue = (FEPIMM: FEPIMM | PIMM, counterName: string) =>
      Number(FEPIMM.counters.find((c) => c.name === counterName)?.value) || 0;

    // renombrar casi todo
    const varMaps = {
      equipos: 'Numero Inyectora',
      operarios: 'Operario',
      ordenes: 'Orden',
      lotes: 'Lote',
      moldes: 'Molde',
      materiales: 'Material',
    };
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

    function applyOffsets(pimms: PIMM[]): PIMM[] {
      const isOffset =
        pimms.length > 1 &&
        new Date(pimms[0].timestamp).getSeconds() ===
          new Date(pimms[pimms.length - 1].timestamp).getSeconds();

      if (!isOffset) return pimms;

      const offsets: Record<string, Record<string, number>> = {};

      return pimms.map((pimm, i) => {
        const stateNumber = pimm.states.find(
          (s) => s.name === config.keyPIMMNumber
        )?.value;
        if (!stateNumber) return pimm;

        const updatedCounters = pimm.counters.map((counter) => {
          if (!config.offsetKeys.includes(counter.name)) return counter;

          const value = Number(counter.value || 0);
          const prev = offsets[stateNumber]?.[counter.name] ?? value;
          const updatedOffset = value < prev ? prev : value;

          offsets[stateNumber] = {
            ...offsets[stateNumber],
            [counter.name]: updatedOffset,
          };

          return {
            ...counter,
            value: value < prev ? String(updatedOffset - value) : counter.value,
          };
        });

        return {
          ...pimm,
          counters: updatedCounters,
        };
      });
    }

    function computeDerived(
      pimm: PIMM,
      firstTimestamp: number,
      lastTimestamp: number
    ): FEPIMM {
      const duration = (lastTimestamp - firstTimestamp) / (60 * 1000); // minutos

      return {
        ...pimm,
        buenas:
          getCounterValue(pimm, 'Contador Unidades') -
          getCounterValue(pimm, 'Unidades Defecto Inicio Turno') -
          getCounterValue(pimm, 'Unidades No Conformes'),
        ineficiencias:
          (getCounterValue(pimm, 'Minutos Motor Encendido') * 60) /
            getCounterValue(pimm, 'Segundos Ciclo Estandar') -
          getCounterValue(pimm, 'Contador Inyecciones'),
        maquina:
          getCounterValue(pimm, 'Segundos Ultimo Ciclo Total') -
          getCounterValue(pimm, 'Segundos Ultimo Ciclo Puerta'),
        producidas: Math.abs(
          duration -
            (getCounterValue(pimm, 'Minutos No Programada') +
              getCounterValue(pimm, 'Minutos Mantto Maquina') +
              getCounterValue(pimm, 'Minutos Mantto Molde') +
              getCounterValue(pimm, 'Minutos Sin Operario') +
              getCounterValue(pimm, 'Minutos Por Material') +
              getCounterValue(pimm, 'Minutos Calidad') +
              getCounterValue(pimm, 'Minutos Montaje'))
        ),
      };
    }

    for (const pimm of PIMMs) {
      Object.keys(varMaps).forEach((filterVar) => {
        filters[filterVar as keyof typeof filters].forEach((value, key) => {
          if (
            value &&
            pimm.states.some(
              (state) =>
                state.name === varMaps[filterVar as keyof typeof varMaps] &&
                state.value === key
            )
          ) {
            const fepimm: FEPIMM = {
              ...pimm,
              buenas: 0,
              ineficiencias: 0,
              producidas: 0,
              maquina: 0,
            };

            updatedFilteredPIMMs.push(fepimm);
          }
        });
      });
    }

    const withOffsets = applyOffsets(updatedFilteredPIMMs);

    const first = withOffsets.at(0)?.timestamp ?? 0;
    const last = withOffsets.at(-1)?.timestamp ?? 0;

    setFilteredPIMMs(
      withOffsets.map((pimm) => computeDerived(pimm, first, last))
    );
  }, [PIMMs, filters]);

  React.useEffect(() => {
    setFilters((prevFilters) => {
      const updatedFilters = {
        equipos: new Map(prevFilters.equipos),
        operarios: new Map(prevFilters.operarios),
        ordenes: new Map(prevFilters.ordenes),
        lotes: new Map(prevFilters.lotes),
        moldes: new Map(prevFilters.moldes),
        materiales: new Map(prevFilters.materiales),
      };

      const filterSets = {
        equipos: new Set(),
        operarios: new Set(),
        ordenes: new Set(),
        lotes: new Set(),
        moldes: new Set(),
        materiales: new Set(),
      };

      for (const pimm of PIMMs) {
        for (const state of pimm.states) {
          if (state.name === 'Operario') filterSets.operarios.add(state.value);
          if (state.name === 'Molde') filterSets.moldes.add(state.value);
          if (state.name === 'Material') filterSets.materiales.add(state.value);
          if (state.name === 'Lote') filterSets.lotes.add(state.value);
          if (state.name === 'Numero Inyectora')
            filterSets.equipos.add(state.value);
          if (state.name === 'Orden') filterSets.ordenes.add(state.value);
        }
      }

      filterSets.equipos.forEach((equipo) => {
        if (!updatedFilters.equipos.has(equipo as string))
          updatedFilters.equipos.set(equipo as string, true);
      });

      filterSets.operarios.forEach((operario) => {
        if (!updatedFilters.operarios.has(operario as string))
          updatedFilters.operarios.set(operario as string, true);
      });
      filterSets.ordenes.forEach((orden) => {
        if (!updatedFilters.ordenes.has(orden as string))
          updatedFilters.ordenes.set(orden as string, true);
      });
      filterSets.lotes.forEach((lote) => {
        if (!updatedFilters.lotes.has(lote as string))
          updatedFilters.lotes.set(lote as string, true);
      });
      filterSets.moldes.forEach((molde) => {
        if (!updatedFilters.moldes.has(molde as string))
          updatedFilters.moldes.set(molde as string, true);
      });
      filterSets.materiales.forEach((material) => {
        if (!updatedFilters.materiales.has(material as string))
          updatedFilters.materiales.set(material as string, true);
      });

      return updatedFilters;
    });
  }, [PIMMs]);

  React.useEffect(() => {
    if (parameters.live) {
      setParameters((prevParameters) => ({
        ...prevParameters,
        startDate: new Date().getTime() - 120 * 60 * 1000, // 2 hours ago,
        endDate: new Date().getTime(),
      }));
    }
  }, [parameters.live]);

  React.useEffect(() => {
    setPIMMs([]);
    setFilters({
      equipos: new Map<string, boolean>(),
      operarios: new Map<string, boolean>(),
      ordenes: new Map<string, boolean>(),
      lotes: new Map<string, boolean>(),
      moldes: new Map<string, boolean>(),
      materiales: new Map<string, boolean>(),
    });

    fetchPIMMs({
      initTime: parameters.startDate,
      endTime: parameters.endDate,
      stepUnit: parameters.step,
      lastID: null,
    }).then((response) => {
      setPIMMs((prevPIMMs) => {
        const newPIMMs = [...prevPIMMs, ...response.pimms].sort(
          (a, b) => a.timestamp - b.timestamp
        );
        return newPIMMs;
      });
    });

    if (parameters.live) {
      connectToMQTTBroker('PIMMStateTopic', (topic, payload) => {
        const pimmData = JSON.parse(payload.toString());
        setPIMMs((prevPIMMs) => {
          return [...prevPIMMs, pimmData].sort(
            (a, b) => a.timestamp - b.timestamp
          );
        });
      });
    } else {
      closeConnectionToMQTTBroker('PIMMStateTopic');
    }
  }, [parameters]);

  return (
    <div className={`${styles.noselect} ${styles.dashboard}`}>
      <Header />
      <Configuration
        filters={filters}
        setFilters={setFilters}
        parameters={parameters}
        setParameters={setParameters}
      />
      <Indicadores data={graphData?.indicadores} />
      <div className={styles.subdashboard}>
        <Calidad data={graphData?.calidad} />
        <Disponibilidad data={graphData?.disponibilidad} />
        <Rendimiento data={graphData?.rendimiento} />
        <Energia data={graphData?.energia} />
        <div>
          <Ciclos data={graphData?.ciclos} />
          <Montaje data={graphData?.montaje} />
        </div>
        <Material data={[graphData?.material, graphData?.molde]} />
      </div>
    </div>
  );
}
