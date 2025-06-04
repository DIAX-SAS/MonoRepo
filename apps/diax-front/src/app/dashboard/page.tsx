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

  const MQTTRef = React.useRef<mqtt.MqttClient | undefined>(undefined);

  const stepRef = React.useRef<Parameters['step']>(parameters.step);

  React.useEffect(() => {
    (async () => {
      const { calculateGraphData } = await import('./dashboard.functions');
      setGraphData(await calculateGraphData(filteredPIMMs, stepRef));
    })();
  }, [filteredPIMMs]);

  React.useEffect(() => {
    (async () => {
      const { applyFilters } = await import('./dashboard.functions');
      setFilteredPIMMs(await applyFilters(filters, PIMMs, stepRef));
    })();
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

      for (const pimm of PIMMs) {
        const stateMap = new Map(pimm.states.map((s) => [s.name, s]));

        const setIfDefined = (map: Map<string, boolean>, key: string) => {
          const value = String(stateMap.get(key)?.value);
          if (value !== undefined && !map.has(value)) map.set(value, false);
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
        const pimms = await data.pimms;
        setPIMMs((prevPIMMs) => [...prevPIMMs, ...pimms]);
      });
    }

    (async () => {
      if (parameters.live) {
        const token = (await fetchCredentialsCore()).token.sessionToken;

        const client = mqtt.connect(process.env.NEXT_PUBLIC_SOCKET_URI || '', {
          username: 'the_username',
          password: token,
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

        MQTTRef.current = client;

        client.on('connect', () => {
          client.subscribe('PIMMStateTopic');
        });

        client.on('message', (topic, message) => {
          try {
            const data: PIMM = JSON.parse(message.toString());
            setPIMMs((prev) => [...prev, data]);
          } catch (e) {
            console.error('Failed to parse PIMM message:', e);
          }
        });

        client.on('error', (err) => {
          console.error('MQTT connection error:', err);
        });
      } else {      
          MQTTRef.current?.unsubscribe('PIMMStateTopic');
          MQTTRef.current?.end();
          MQTTRef.current = undefined;        
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
