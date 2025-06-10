'use client';

import * as React from 'react';
import {
  PolarChart,
  TimeSeriesLineChart,
  FilterForm,
  CardFactor,
  Table,
  SectionMetric,
} from '../../components/graphs';
import {
  GraphData,
  PimmsStepUnit,
  type FEPIMM,
  type Filters,
  type Parameters,
  PIMM,
} from './dashboard.types';
import {
  Grid2,
  Grid,
  Card,
  CardHeader,
  CardContent,
  Box,
} from '../../components/core';
import mqtt from 'mqtt';
import {
  fetchCredentialsCore,
  fetchPIMMs,
} from '../../data-access/diax-back/diax-back';
import {
  connectToMQTTBroker,
  closeConnectionToMQTTBroker,
} from '../../data-access/mqtt-broker/mqtt-broker';

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
    step: PimmsStepUnit.SECOND,
  });

  const [PIMMs, setPIMMs] = React.useState<PIMM[]>([]);
  const [filteredPIMMs, setFilteredPIMMs] = React.useState<FEPIMM[]>([]);
  const [graphData, setGraphData] = React.useState<GraphData | undefined>();




  React.useEffect(() => {
    // paint graph
  }, [filteredPIMMs]);


  React.useEffect(() => {
    (async () => {
      const { calculateGraphData } = await import('./dashboard.functions');
      setGraphData(await calculateGraphData(filteredPIMMs));
    })();
  }, [filteredPIMMs]);


  React.useEffect(() => {
    const updatedFilteredPIMMs: FEPIMM[] = [];
    
    // renombrar casi todo
    const varMaps = {
      equipos: 'Numero Inyectora',
      operarios: 'Operario',
      ordenes: 'Orden',
      lotes: 'Lote',
      moldes: 'Molde',
      materiales: 'Material',
    }

    for (const pimm of PIMMs) {
      Object.keys(varMaps).forEach(filterVar =>{
          filters[filterVar as keyof typeof filters].forEach((value, key) => {
          if (value && pimm.states.some((state) => state.name === varMaps[filterVar as keyof typeof varMaps] && state.value === key))
          {
            const fepimm: FEPIMM = {
              ...pimm,
              
              // offset
              // derived
              buenas: 0,
              ineficiencias: 0,
              producidas: 0,
              maquina: 0,
            };

            updatedFilteredPIMMs.push(fepimm);
          }
        });  
      })
    }

    setFilteredPIMMs(updatedFilteredPIMMs);
  }, [PIMMs, filters]);

  React.useEffect(() => {
    const updatedFilters = {
      equipos: new Map(filters.equipos),
      operarios: new Map(filters.operarios),
      ordenes: new Map(filters.ordenes),
      lotes: new Map(filters.lotes),
      moldes: new Map(filters.moldes),
      materiales: new Map(filters.materiales),
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
        if (state.name === 'Operario') 
          filterSets.operarios.add(state.value);
        if (state.name === 'Molde') 
          filterSets.moldes.add(state.value);
        if (state.name === 'Material') 
          filterSets.materiales.add(state.value);
        if (state.name === 'Lote') 
          filterSets.lotes.add(state.value);
        if (state.name === 'Numero Inyectora') 
          filterSets.equipos.add(state.value);
        if (state.name === 'Orden') 
          filterSets.ordenes.add(state.value);
      }
    }

    filterSets.equipos.forEach(equipo => {
      if (!updatedFilters.equipos.has(equipo as string))
        updatedFilters.equipos.set(equipo as string, true);
    });

    setFilters(updatedFilters);
  }, [PIMMs]);

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

    const lastDate = parameters.startDate;
    for (
      let currDate = parameters.startDate;
      currDate <= parameters.endDate;
      currDate += 6 * 60 * 1000
    ) {
      fetchPIMMs({
        initTime: lastDate,
        endTime: currDate,
        stepUnit: parameters.step,
        lastID: null,
      }).then(async (data) => {
        setPIMMs((prevPIMMs) => [...prevPIMMs, ...data.pimms]);
      });
    }

    (async () => {
      if (parameters.live) {
        connectToMQTTBroker('PIMMStateTopic', (topic, payload) => {
          const pimmData = JSON.parse(payload.toString());
          setPIMMs((prevPIMMs) => {
            return [...prevPIMMs, pimmData];
          });
        });
      } else {      
        closeConnectionToMQTTBroker('PIMMStateTopic');
      }
    })();
  }, [parameters]);

  return (
    <Grid2 container spacing={3}>
      {/* Settings Section */}
      <Grid2 size={{ xs: 12, sm: 12 }}>
        <Card sx={{ p: 2, mb: 3 }}>
          <CardHeader
            title="Configuración"
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
        {/* Indicadores Section */}
        <Card sx={{ p: 2, mb: 3 }}>
          <CardHeader
            title="Indicadores"
            sx={{ borderBottom: '1px solid #ddd' }}
          />
          <CardContent>
            <Grid
              container
              direction="row"
              sx={{
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Grid sx={{ xs: 6, md: 6 }}>
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
              </Grid>
              <Grid sx={{ xs: 6, md: 6 }}>
                <PolarChart
                  data={graphData?.indicadores.charts?.PolarChart?.data}
                />
              </Grid>
              <Grid>
                <TimeSeriesLineChart
                  series={graphData?.indicadores.charts?.SeriesLineChart?.data}
                  labelY="OEE(%)"
                />
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        {/* Montaje Section */}
        <Card>
          <CardHeader title="Montaje" sx={{ borderBottom: '1px solid #ddd' }} />
          <CardContent>
            <Table data={graphData?.montaje.charts?.Table?.data} />
          </CardContent>
        </Card>
      </Grid2>

      <Grid container spacing={3} columns={{ xs: 4, sm: 8, md: 12 }}>
        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
          <SectionMetric
            title="Disponibilidad"
            data={{
              linechart: graphData?.disponibilidad.charts?.SeriesLineChart,
              piechart: graphData?.disponibilidad.charts?.MultiLayerPieChart,
              unit: 'minutos',
            }}
          />
        </Grid>

        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
          <SectionMetric
            title="Calidad"
            data={{
              linechart: graphData?.calidad.charts?.SeriesLineChart,
              piechart: graphData?.calidad.charts?.MultiLayerPieChart,
              unit: 'unidades',
            }}
          />
        </Grid>
        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
          <SectionMetric
            title="Rendimiento"
            data={{
              linechart: graphData?.rendimiento.charts?.SeriesLineChart,
              piechart: graphData?.rendimiento.charts?.MultiLayerPieChart,
              unit: 'inyecciones',
            }}
          />
        </Grid>
        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
          <SectionMetric
            title="Energía"
            data={{
              linechart: graphData?.energia.charts?.SeriesLineChart,
              piechart: graphData?.energia.charts?.MultiLayerPieChart,
              barchart: graphData?.energia.charts?.StackedBarChart,
              unit: 'kW',
            }}
          />
        </Grid>
        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
          <SectionMetric
            title="Material"
            options={['PIMM', 'Molde']}
            data={{
              linechart: [
                graphData?.material.charts?.SeriesLineChart,
                graphData?.molde.charts?.SeriesLineChart,
              ],
              piechart: [
                graphData?.material.charts?.MultiLayerPieChart,
                graphData?.molde.charts?.MultiLayerPieChart,
              ],
              unit: 'gramos',
            }}
          />
        </Grid>
        <Grid size={{ xs: 2, sm: 4, md: 4 }}>
          <SectionMetric
            title="Ciclos"
            data={{
              linechart: graphData?.ciclos.charts?.SeriesLineChart,
              piechart: graphData?.ciclos.charts?.MultiLayerPieChart,
              unit: 'segundos',
            }}
          />
        </Grid>
        <Grid></Grid>
      </Grid>
    </Grid2>
  );
}
