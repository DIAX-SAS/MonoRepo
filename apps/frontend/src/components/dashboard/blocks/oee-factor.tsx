'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import dynamic from 'next/dynamic';
const LineChartComponent = dynamic(() => import("../charts/line-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
const PieChartComponent = dynamic(() => import("../charts/pie-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
import { DataStructure } from '@/types/data';

export default function Oee({ title, charts }: DataStructure): React.JSX.Element {
  return (
    <Card>
      <CardHeader title={title} />
      <CardContent>
        <PieChartComponent data={charts.pie_chart} />
        <LineChartComponent data={charts.line_chart} />
      </CardContent>
    </Card>
  );
}
