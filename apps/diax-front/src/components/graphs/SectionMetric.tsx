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
} from '../graphs';
import type { ChartDataByType } from '../../app/dashboard/dashboard.types';

export interface Data {
  linechart?: ChartDataByType['MultiLine'] | (ChartDataByType['MultiLine']| undefined) [];
  piechart?: ChartDataByType['MultiPie'] | (ChartDataByType['MultiPie'] | undefined)[];
  barchart?: ChartDataByType['StackedBar'] | ChartDataByType['StackedBar'][];
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
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const normalize = <T,>(input?: T | (T | undefined)[]): T[] =>
    input
      ? Array.isArray(input)
        ? input.filter((item): item is T => item !== undefined)
        : [input]
      : [];

  const linecharts = normalize<ChartDataByType['MultiLine']>(data.linechart);
  const piecharts = normalize<ChartDataByType['MultiPie']>(data.piechart);
  const barcharts = normalize<ChartDataByType['StackedBar']>(data.barchart);

  const pickerOptions = options.map((opt, index) => ({
    label: opt,
    value: index,
  }));

  const selectedLineChart = linecharts[selectedIndex];
  const selectedPieChart = piecharts[selectedIndex];
  const selectedBarChart = barcharts[selectedIndex];

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
          {pickerOptions.length > 0 && linecharts.length > 1 && (
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
              <Grid>
                <CollapsibleList data={selectedPieChart} unit={data.unit} />
              </Grid>
            </>
          )}

          {selectedBarChart && (
            <Grid>
              <StackedBarChart
                keys={['motor', 'maquina']}
                data={selectedBarChart}
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
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
