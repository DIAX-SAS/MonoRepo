"use client";
import { LineChartProps } from '@/types/data';
import React from 'react';
import Plot, { PlotParams } from 'react-plotly.js';

export default function LineChartTest({ data }: LineChartProps): React.JSX.Element {
  
  const plotData: PlotParams['data'] = Object.entries(data.lines).map(([lineName, line], index) => ({
    x: data.xaxis, // Eje X
    y: line.ydata, // Datos del eje Y
    type: 'scatter' as const, 
    mode: 'lines+markers',
    name: lineName, 
    line: {
      color: `hsl(${(index * 60)}, 70%, 50%)`, 
    },
    marker: {
      size: 8,
    },
  }));

  return (
    <Plot
      data={plotData}
      layout={{
        title: '',
        xaxis: {
          title: 'Time',
          tickformat: '%H:%M', 
          type: 'date',
        },
        yaxis: {
          title: 'Value',
        },
        margin: { t: 50, l: 0, r: 0, b: 50 },
        hovermode: 'closest', 
        showlegend: true, 
      }}
      useResizeHandler={true}
      style={{ width: '100%', height: '400px' }}
    />
  );
}
