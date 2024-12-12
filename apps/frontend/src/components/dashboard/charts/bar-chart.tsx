"use client";
import React from 'react';
import Plot from 'react-plotly.js';
import { type BarChart as TypeBarChart } from '@/types/data';

export interface BarProps {
  data: TypeBarChart;
}

export default function BarChartComponent({ data }: BarProps): React.JSX.Element {
  return (
    <Plot
      data={[
        {
          x: data.labels, // Etiquetas en el eje X
          y: data.firstValues, // Valores para la primera barra
          type: 'bar',
          name: 'First Value', // Nombre de la leyenda
          marker: { color: '#8884d8' },
        },
        {
          x: data.labels, // Etiquetas en el eje X
          y: data.secondValues, // Valores para la segunda barra
          type: 'bar',
          name: 'Second Value', // Nombre de la leyenda
          marker: { color: '#82ca9d' },
        },
      ]}
      layout={{
        barmode: 'stack', // Modo de apilado
        title: '', // Título del gráfico
        xaxis: {
          title: 'Categories', // Título del eje X
        },
        yaxis: {
          title: 'Values', // Título del eje Y
        },
        margin: { t: 50, l: 50, r: 50, b: 50 },
        legend: {
          orientation: 'h', // Orientación horizontal para la leyenda
          x: 0.5,
          xanchor: 'center',
        },
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '400px' }}
    />
  );
}
