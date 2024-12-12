import React from 'react';
import Plot from 'react-plotly.js';

import { Data, PieChartData, PieChartProps } from '@/types/data';

function PieChart({ data }: PieChartProps) {
  function transformData(data: Data): PieChartData {
    let labels: string[] = [];
    let parents: string[] = [];
    let values: number[] = [];

    function dynamic(data: Data, parent: string) {
      let contador = 0;

      Object.keys(data).forEach((key) => {
        if (typeof data[key] === 'object' && data[key] !== null) {
          let moment = dynamic(data[key], key);
          values.push(moment);
          labels.push(key);
          contador += moment;
        } else {
          values.push(data[key]);
          labels.push(key);
          contador += data[key];
        }

        parents.push(parent);
      });

      return contador;
    }

    dynamic(data, '');

    return {
      labels: labels,
      parents: parents,
      values: values,
    };
  }
  const pie = transformData(data);
  return (
    <Plot
      data={[
        {
          type: 'sunburst',
          labels: pie.labels,
          parents: pie.parents,
          values: pie.values,
          branchvalues: 'total',
        },
      ]}
      layout={{   
        width: 400,  // Establece el ancho del gráfico
        height: 400, // Establece la altura del gráfico
      }}
      useResizeHandler={true}
      style={{width: "100%", height: "100%"}}
    />
  );
}

export default PieChart;
