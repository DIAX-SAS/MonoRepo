'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import dynamic from 'next/dynamic';
const BarChartComponent = dynamic(() => import("../charts/bar-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
const LineChartComponent = dynamic(() => import("../charts/line-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
import {EnergyProps } from '@/types/data';




export default function FiltersWithDateRangeAndSelect({ data }: EnergyProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader title="Energy" />
      <CardContent>
        <LineChartComponent data={data.charts.line_chart} />
        <BarChartComponent data={data.charts.bar_chart} />
      </CardContent>
    </Card>
  );
}
