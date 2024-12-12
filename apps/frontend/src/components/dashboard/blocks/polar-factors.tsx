'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import PolarChartComponent from '../charts/polar-chart';
import { Polar } from '@/types/data';


export function PolarFactors({ data }: Polar): React.JSX.Element {
  return (
    <Card>
      <CardHeader title="Polar chart" />
      <CardContent>
        <PolarChartComponent data={data} />
      </CardContent>
    </Card>
  );
}
