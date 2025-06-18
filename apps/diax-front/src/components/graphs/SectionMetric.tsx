import * as React from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  Grid,
  Box,
  SelectPicker,
  CollapsibleList,
} from '../core';
import {
  MultiLayerPieChart,
  StackedBarChart,
  TimeSeriesLineChart,
  type ChartNode,
  LineSeries,
} from '../graphs';
import type { ChartDataByType } from '../../app/dashboard/dashboard.types';

export interface Data {
  linechart?:
    | ChartDataByType['MultiLine']
    | (ChartDataByType['MultiLine'] | undefined)[];
  piechart?:
    | ChartDataByType['MultiPie']
    | (ChartDataByType['MultiPie'] | undefined)[];
  barchart?: ChartDataByType['StackedBar'] | undefined;
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

  const pickerOptions = options.map((opt, index) => ({
    label: opt,
    value: index,
  }));

  let selectedLineChart;
  if (options.length > 0 && Array.isArray(data.linechart)) {
    selectedLineChart = data.linechart[selectedIndex] as LineSeries[];
  } else {
    selectedLineChart = data.linechart as LineSeries[];
  }

  let selectedPieChart;
  if (options.length > 0 && Array.isArray(data.piechart)) {
    selectedPieChart = data.piechart[selectedIndex] as ChartNode;
  } else {
    selectedPieChart = data.piechart as ChartNode;
  }

  return (
    <Card sx={{ p: 2, mb: 3 }}>
      <CardHeader title={title} sx={{ borderBottom: '1px solid #ddd' }} />
      <CardContent>
        <Grid
          container
          spacing={2}
          mb={2}
          justifyContent="center"
          alignItems="center"
        >
          {pickerOptions.length > 0 && (
            <Grid>
              <Box mb={2}>
                <SelectPicker
                  data={pickerOptions}
                  value={selectedIndex}
                  style={{ minWidth: 150 }}
                  onChange={(val) => setSelectedIndex(val ?? 0)}
                  cleanable={false}
                  placeholder="Selecciona una opción"
                />
              </Box>
            </Grid>
          )}

          {selectedPieChart && (
            <>
              <Grid>
                <MultiLayerPieChart data={selectedPieChart} unit={data.unit} />
              </Grid>
            </>
          )}

          {data.barchart && (
            <Grid>
              <StackedBarChart
                keys={['motor', 'maquina']}
                data={data.barchart}
                labelY={data.unit}
              />
            </Grid>
          )}

          {selectedLineChart && (
            <Grid>
              <TimeSeriesLineChart
                series={selectedLineChart}
                labelY={data.unit}
              />
              <Grid>
                <CollapsibleList data={selectedPieChart} unit={data.unit} />
              </Grid>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
