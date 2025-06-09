import {
  type Filters,
  type Parameters,
} from '../../app/dashboard/dashboard.types';
import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  DateRangePicker,
  SelectPicker,
  ExpandMoreIcon,
  Typography,
} from '../core';

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
      <Grid
        container
        spacing={2}
        direction="row"
        sx={{
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Grid>
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
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Grid
            container
            spacing={10}
            direction="row"
            sx={{
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Grid>
              <FormControlLabel
                control={
                  <Checkbox
                    data-testid="liveCheckbox"
                    checked={parameters.live}
                    onChange={(e) =>
                      handleChangeParameters('live', e.target.checked)
                    }
                    aria-label="Live"
                  />
                }
                label="Live"
              />
            </Grid>
            <Grid>
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
            </Grid>
          </Grid>
        </Grid>
        <Grid size={{ xs: 12, md: 12 }}>
          <Box display="flex" gap={2} flexWrap="wrap">
            {Object.entries(filters).map(([filterKey, filterMap]) => (
              <Accordion
                key={filterKey}
                sx={{ minWidth: 200, flex: '1 1 30%' }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography variant="subtitle2">
                    {filterKey.toUpperCase()}
                  </Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <FormGroup>
                    {Array.from(filterMap.entries()).map(([key, value]) => (
                      <FormControlLabel
                        key={filterKey + key}
                        control={
                          <Checkbox
                            checked={value}
                            onChange={(e) =>
                              handleCheckboxChange(
                                filterKey as keyof Filters,
                                e.target.checked
                                  ? [...getSelected(filterMap), key]
                                  : getSelected(filterMap).filter(
                                      (v) => v !== key
                                    )
                              )
                            }
                          />
                        }
                        label={key}
                      />
                    ))}
                  </FormGroup>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>
        </Grid>
      </Grid>
    </>
  );
};

const getSelected = (map: Map<string, boolean>) =>
  Array.from(map.entries())
    .filter(([_, value]) => value)
    .map(([key]) => key);

export default React.memo(FilterForm);
