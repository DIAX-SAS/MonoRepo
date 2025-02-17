import {useDataStore} from '@/contexts/data-store';
import { type Filters } from '@/types/filters';
import React from 'react';
import { Checkbox, MultiCascader, SelectPicker } from 'rsuite';
import { DateRangePicker } from 'rsuite';


interface StateNode {
  label: string;
  value: string;
  children: StateNode[];
}
const accUnitOptions = [
  { label: 'Hour', value: 'hour' },
  { label: 'Minute', value: 'minute' },
  { label: 'Second', value: 'second' },
];

const FilterForm: React.FC = () => {
  const {
    filters,
    setFilters
  } = useDataStore();
  const handleChange = (key: keyof Filters, value: Filters[keyof Filters]) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const stateData = Object.values(
    filters.states.reduce((acc, value) => {
      const [PIMMNumber, stateKey, stateValue] = value.split('-');
  
      if (!acc[PIMMNumber]) {
        acc[PIMMNumber] = {
          label: `PIMM ${PIMMNumber}`,
          value: `${PIMMNumber}`,
          children: [],
        };
      }
  
      let stateNode = acc[PIMMNumber].children.find(
        (child: StateNode) => child.value === `${PIMMNumber}-${stateKey}`
      );
  
      if (!stateNode) {
        stateNode = {
          label: stateKey,
          value: `${PIMMNumber}-${stateKey}`,
          children: [],
        };
        acc[PIMMNumber].children.push(stateNode);
      }
  
      // Ensure stateValue is not duplicated
      if (!stateNode.children.some((child: StateNode) => child.value === `${PIMMNumber}-${stateKey}-${stateValue}`)) {
        stateNode.children.push({
          label: `Value ${stateValue}`,
          value: `${PIMMNumber}-${stateKey}-${stateValue}`,
          children: [],
        });
      }
  
      return acc;
    }, {} as Record<string, StateNode>)
  );
  

  return (
    <> 
      <DateRangePicker
        format="MM/dd/yyyy hh:mm aa"
        showMeridiem
        onChange={(value)=> {
          const [initTime, endTime] = value ?? [];
          handleChange('initTime', initTime ? (new Date(initTime)).getTime() : Date.now());
          handleChange('endTime', endTime ? (new Date(endTime)).getTime() : Date.now());
        }} 
        readOnly={filters.live}
        value={(filters.initTime && filters.endTime) ? [new Date(filters.initTime), new Date(filters.endTime)] : null}
      />

      <Checkbox
        checked={filters.live}
        onChange={(value,checked) => handleChange('live', checked)}
        aria-label="Live"
      >
        Live
      </Checkbox>

      <Checkbox
        checked={filters.offset}
        onChange={(value,checked) => handleChange('offset', checked)}
      >
        Offset
      </Checkbox>

      <SelectPicker
        data={accUnitOptions}
        value={filters.accUnit}
        onChange={(value) =>
          handleChange('accUnit', (value as Filters['accUnit']) || 'second')
        }
        style={{ minWidth: '150px' }}
      />

      <MultiCascader
        data={stateData}
        value={filters.selected}
        block={true}
        placeholder="Select States"
        onChange={(selectedArray) =>
          handleChange(
            'selected',
            selectedArray.filter((item): item is string => item !== null)
          )
        }
        style={{ width: '100%' }}
      />
    </>
  );
};

export default FilterForm;
