"use client";
import React from 'react';
import Plot from 'react-plotly.js';
import { type PolarChartComponentProps } from '@/types/data';

export default function PolarChartComponent({ data }: PolarChartComponentProps): React.JSX.Element {
 
  const chartData = [
    { category: 'Availability', value: data.availability },
    { category: 'Performance', value: data.performance },
    { category: 'Quality', value: data.quality },
  ];

  const categories = chartData.map(item => item.category);
  const values = chartData.map(item => item.value);

  const chartLayout = {
    polar: {
      radialaxis: {
        visible: true,
        range: [0, 100],
      },
    },
    showlegend: true,
    title: '',
  };

  return (
    <Plot
      data={[
        {
          type: 'scatterpolar',
          r: values,
          theta: categories,
          fill: 'toself',
          name: 'Efficiency',
          marker: { color: '#8884d8' },
        },
      ]}
      layout={chartLayout}
      style={{ width: '100%', height: '400px' }}
    />
  );
}
