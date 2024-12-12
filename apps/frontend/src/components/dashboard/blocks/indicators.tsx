'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import dynamic from 'next/dynamic';
const LineChartComponent = dynamic(() => import("../charts/line-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
const PolarChartComponent = dynamic(() => import("../charts/polar-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
import { type Indicators, IndicatorsST } from '@/types/data';
export default function Indicators({ data }: IndicatorsST): React.JSX.Element {

  return (
    <Card>
      <CardHeader title={data.title} />
      <CardContent>
        <PolarChartComponent data={data.polar_chart} />
        <LineChartComponent data={data.line_chart} />
      </CardContent>
    </Card>
  );
}
