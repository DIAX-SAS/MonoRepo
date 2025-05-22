import * as React from 'react';
import { Card, CardHeader, CardContent, Box, Typography } from '@mui/material';
import MultiLayerPieChart from './MultiLayerPieChart';
import TimeSeriesLineChart from './LineChart';
import SelectPicker from 'rsuite/esm/SelectPicker';
import type { Graphs } from '../../app/dashboard/dashboard.types';
import StackedBarChart from './StackedBarChart';
import Grid from '@mui/material/Grid2';

export interface Data {
  linechart:
    | Graphs['SeriesLineChart'][]
    | Graphs['SeriesLineChart']
    | undefined;
  piechart?:
    | Graphs['MultiLayerPieChart'][]
    | Graphs['MultiLayerPieChart']
    | undefined;
  barchart?:
    | Graphs['StackedBarChart'][]
    | Graphs['StackedBarChart']
    | undefined;
  unit: string;
}

export function SectionMetric({
  title,
  data,
  options = [],
}: {
  title: string;
  data: Data;
  options?: string[];
}): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = React.useState<number>(0);

  // Normalize to arrays
  const linechartArray = Array.isArray(data.linechart)
    ? data.linechart
    : data.linechart
    ? [data.linechart]
    : [];

  const piechartArray = Array.isArray(data.piechart)
    ? data.piechart
    : data.piechart
    ? [data.piechart]
    : [];

  const barchartArray = Array.isArray(data.barchart)
    ? data.barchart
    : data.barchart
    ? [data.barchart]
    : [];

  const pickerOptions = options.map((opt, index) => ({
    label: opt,
    value: index,
  }));

  const selectedLineChart = linechartArray[selectedIndex];
  const selectedPieChart = piechartArray[selectedIndex];
  const selectedBarChart = barchartArray[selectedIndex];

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <CardHeader title={title} sx={{ borderBottom: '1px solid #ddd' }} />
      <CardContent>
        <Grid container spacing={2} mb={2}     direction="row"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          {pickerOptions.length > 0 && linechartArray.length > 1 && (
            <Grid>
              <Box mb={2}>
                <SelectPicker
                  data={pickerOptions}
                  value={selectedIndex}
                  style={{ minWidth: '150px' }}
                  onChange={(value) => setSelectedIndex(value ?? 0)}
                  cleanable={false}
                  placeholder="Selecciona una opción"
                />
              </Box>
            </Grid>
          )}

          {selectedPieChart && (
            <Grid>
              <MultiLayerPieChart
                data={selectedPieChart.data}
                unit={data.unit}
              />
            </Grid>
          )}
          {selectedBarChart && (
            <Grid>
              <StackedBarChart
                keys={['motor', 'maquina']}
                data={selectedBarChart.data}
                labelY={data.unit}
              />
            </Grid>
          )}

          {selectedLineChart && (
            <Grid>
              <TimeSeriesLineChart
                series={selectedLineChart.data}
                labelY={data.unit}
              />
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
