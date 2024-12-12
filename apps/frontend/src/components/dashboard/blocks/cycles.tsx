'use client';

import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { SelectPicker } from 'rsuite';
import dynamic from 'next/dynamic';
import { CycleProps } from '@/types/data';
const LineChartComponent = dynamic(() => import("../charts/line-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
const PieChartComponent = dynamic(() => import("../charts/pie-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});


export default function Cycles({ data }: CycleProps): React.JSX.Element {
  const [selectedIndex, setSelectedIndex] = React.useState<number | null>(0); 

  const options = data.map((_, index) => ({
    label: `Machine ${Number(_.idMachine)}`,
    value: index,
  }));

  const handleSelectChange = (value: number| null, event: React.SyntheticEvent<Element, Event>) => {   
    setSelectedIndex(value);
  };  

  return (
    <Card>
      <CardHeader title="Cycles" />
      <CardContent>
        <div style={{ marginBottom: '1rem', minWidth: '150px' }}>
          <SelectPicker
            data={options}
            value={selectedIndex}
            onChange={handleSelectChange}
            placeholder="Select Machine"
            style={{ width: 200 }}
            cleanable={false}
          />
        </div>
        {
        
        data[Number(selectedIndex)] && (
          <>
            <LineChartComponent data={data[Number(selectedIndex)].charts.line_chart} />
            <PieChartComponent data={data[Number(selectedIndex)].charts.pie_chart} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
