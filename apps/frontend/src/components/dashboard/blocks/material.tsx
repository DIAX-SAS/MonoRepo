'use client';

import * as React from 'react';
import { SelectPicker } from 'rsuite';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { MaterialProps, type Material } from '@/types/data';
import dynamic from 'next/dynamic';
const LineChartComponent = dynamic(() => import("../charts/line-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
const PieChartComponent = dynamic(() => import("../charts/pie-chart"), { 
  ssr: false // Esto desactiva el rendering en el servidor
});
import { SyntheticEvent } from 'react';

export default function Material({ data }: MaterialProps): React.JSX.Element {
  const [selectedOption, setSelectedOption] = React.useState<'machine' | 'mold' | null>('machine');

  // Opciones para el SelectPicker
  const options: { label: string; value: "machine" | "mold" }[] = [
    { label: 'Machine', value: 'machine' },
    { label: 'Mold', value: 'mold' },
  ];

  const handleSelectChange = (value: "machine" | "mold" | null, event: SyntheticEvent<Element, Event>) => {
    setSelectedOption(value);
  };

  return (
    <Card>
      <CardHeader title="Material" />
      <CardContent>
        <div style={{ marginBottom: '1rem', minWidth: '150px' }}>
          <SelectPicker
            data={options}
            value={selectedOption}
            onChange={handleSelectChange}
            placeholder="Select Category"
            style={{ width: 200 }}
            cleanable={false}
          />
        </div>
        {selectedOption === 'machine' && (
          <>
            <PieChartComponent data={data.charts.machine.pie_chart} />
            <LineChartComponent data={data.charts.machine.line_chart} />
          </>
        )}
        {selectedOption === 'mold' && (
          <>
            <PieChartComponent data={data.charts.mold.pie_chart} />
            <LineChartComponent data={data.charts.mold.line_chart} />
          </>
        )}
      </CardContent>
    </Card>
  );
}
