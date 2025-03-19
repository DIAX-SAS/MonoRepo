import {
  type Filters,
  type Parameters,
} from '../../app/dashboard/dashboard.types';
import React from 'react';
import {
  Checkbox,
  CheckboxGroup,
  DateRangePicker,
  Panel,
  PanelGroup,
  SelectPicker,
} from 'rsuite';

type PropsFilter = {
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  parameters: Parameters;
  setParameters: React.Dispatch<React.SetStateAction<Parameters>>;
};
const accUnitOptions = [
  { label: 'Hour', value: 'hour' },
  { label: 'Minute', value: 'minute' },
  { label: 'Second', value: 'second' },
];

const FilterForm: React.FC<PropsFilter> = ({
  filters,
  setFilters,
  parameters,
  setParameters,
}) => {
  const handleChangeParameters = (
    key: keyof Parameters,
    value: Parameters[keyof Parameters]
  ) => {
    setParameters((prev) => ({ ...prev, [key]: value }));
  };

  // Handle checkbox toggle
  const handleCheckboxChange = (
    filterKey: keyof Filters,
    selectedValues: string[]
  ) => {
    setFilters((prevFilters) => {
      const newMap = new Map(prevFilters[filterKey]);
      newMap.forEach((_, key) => {
        newMap.set(key, selectedValues.includes(key));
      });
      return { ...prevFilters, [filterKey]: newMap };
    });
  };

  return (
    <>
      <DateRangePicker
        data-testid="dateRangePicker"
        format="dd MMM yyyy hh:mm:ss aa"
        showMeridiem
        onChange={(value) => {
          const [initTime, endTime] = value ?? [];
          handleChangeParameters(
            'startDate',
            initTime ? new Date(initTime).getTime() : new Date().getTime()
          );
          handleChangeParameters(
            'endDate',
            endTime ? new Date(endTime).getTime() : new Date().getTime()
          );
        }}
        readOnly={parameters.live}
        value={
          parameters.startDate && parameters.endDate
            ? [new Date(parameters.startDate), new Date(parameters.endDate)]
            : null
        }
      />

      <Checkbox
        data-testid="liveCheckbox"
        checked={parameters.live}
        onChange={(value, checked) => handleChangeParameters('live', checked)}
        aria-label="Live"
      >
        Live
      </Checkbox>

      <SelectPicker
        data-testid="accUnitPicker"
        data={accUnitOptions}
        value={parameters.step}
        onChange={(value) =>
          handleChangeParameters(
            'step',
            (value as Parameters['step']) || 'second'
          )
        }
        style={{ minWidth: '150px' }}
      />

      <PanelGroup accordion>
        {Object.entries(filters).map(([filterKey, filterMap]) => (
          <Panel
            key={filterKey}
            bordered
            header={<h6>{filterKey.toUpperCase()}</h6>}
          >
            <CheckboxGroup
              value={Array.from(filterMap.entries())
                .filter(([_, value]) => value)
                .map(([key]) => key)}
              onChange={(selectedValues) =>
                handleCheckboxChange(
                  filterKey as keyof Filters,
                  selectedValues as string[]
                )
              }
            >
              {Array.from(filterMap.keys()).map((key) => (
                <Checkbox key={filterKey + key} value={key}>
                  {key}
                </Checkbox>
              ))}
            </CheckboxGroup>
          </Panel>
        ))}
      </PanelGroup>
    </>
  );
};

export default React.memo(FilterForm);
