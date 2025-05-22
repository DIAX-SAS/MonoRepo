'use client';

import FilterForm from '../../components/filters/filter-form';
import CardFactor from '../../components/graphs/CardFactor';
import TimeSeriesLineChart from '../../components/graphs/LineChart';
import MultiLayerPieChart from '../../components/graphs/MultiLayerPieChart';
import PolarChart from '../../components/graphs/PolarChart';
import StackedBarChart from '../../components/graphs/StackedBarChart';
import Table from '../../components/graphs/Table';
import {
  AccessToken,
  GraphData,
  PimmsStepUnit,
  type FEPIMM,
  type Filters,
  type Parameters,
} from './dashboard.types';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import Grid2 from '@mui/material/Grid2';
import Box from '@mui/material/Box';
import { PIMM } from './dashboard.types';
import mqtt from 'mqtt';
import * as React from 'react';
import { useAuthSession } from '../../hooks/useAuthSession';

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

  const { session } = useAuthSession();
  const [PIMMs, setPIMMs] = React.useState<PIMM[]>([]);
  const [filteredPIMMs, setFilteredPIMMs] = React.useState<FEPIMM[]>([]);
  const [graphData, setGraphData] = React.useState<GraphData | undefined>();

  const MQTTRef = React.useRef<mqtt.MqttClient | undefined>(undefined);

  const accessTokenRef = React.useRef<AccessToken>({
    accessToken: session?.accessToken,
  });
  const stepRef = React.useRef<Parameters['step']>(parameters.step);

  React.useEffect(() => {
    accessTokenRef.current = { accessToken: session?.accessToken };
  }, [session]);

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
    (async () => {
      const { fetchPIMMs } = await import('./dashboard.functions');
      fetchPIMMs(parameters, setPIMMs, setFilters, accessTokenRef);
    })();

    (async () => {
      const { connectToIoT, closeConnection } = await import(
        './dashboard.functions'
      );
      if (parameters.live) {
        connectToIoT(MQTTRef, accessTokenRef, setPIMMs);
      } else {
        closeConnection(MQTTRef);
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
      </Grid2>

      <Grid2 size={{ xs: 12, sm: 12 }}>
        {/* Calidad Section */}
        <Card sx={{ p: 2, mb: 3 }}>
          <CardHeader title="Calidad" sx={{ borderBottom: '1px solid #ddd' }} />
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
          <CardHeader
            title="Disponibilidad"
            sx={{ borderBottom: '1px solid #ddd' }}
          />
          <CardContent>
            <MultiLayerPieChart
              data={graphData?.disponibilidad?.charts?.MultiLayerPieChart?.data}
            />
            <TimeSeriesLineChart
              series={graphData?.disponibilidad.charts?.SeriesLineChart?.data}
              labelY="Piezas (Unidades)"
            />
          </CardContent>
        </Card>

        {/* Rendimiento Section */}
        <Card sx={{ p: 2, mb: 3 }}>
          <CardHeader
            title="Rendimiento"
            sx={{ borderBottom: '1px solid #ddd' }}
          />
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
          <CardHeader title="Energía" sx={{ borderBottom: '1px solid #ddd' }} />
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
          <CardHeader
            title="Material"
            sx={{ borderBottom: '1px solid #ddd' }}
          />
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
          <CardHeader title="Molde" sx={{ borderBottom: '1px solid #ddd' }} />
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
          <CardHeader
            title="Ciclos por PIMM"
            sx={{ borderBottom: '1px solid #ddd' }}
          />
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
      </Grid2>
    </Grid2>
  );
}
