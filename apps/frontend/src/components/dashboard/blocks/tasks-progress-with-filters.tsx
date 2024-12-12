'use client';

import { config } from '@/config';
import { fetchData } from '@/connections/backend-connections';
import { TasksProgress } from '@/types/data';
import { Alert } from '@mui/material';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardHeader from '@mui/material/CardHeader';
import { Box } from '@mui/system';
import * as React from 'react';
import { Checkbox, CheckboxProps, MultiCascader, VStack } from 'rsuite';
import DateRangeComponent from '../filters/date-range';
import { mockTreeData } from './mock';

export default function FiltersWithDateRangeAndSelect({
  data,
  setEntireObject,
}: TasksProgress): React.JSX.Element {
  const [dateRange, setDateRange] = React.useState<{
    startDate: string | null;
    endDate: string | null;
  }>({ startDate: null, endDate: null });

  const [isPulling, setIsPulling] = React.useState<boolean>(false);
  const [isWaiting, setIsWaiting] = React.useState<boolean>(false);

  const [checkboxes, setCheckboxes] = React.useState({
    live: false,
    offset: true,
    minutos: false,
  });

  const [selected, setSelected] = React.useState<string[]>([]);
  const [readOnly, setReadOnly] = React.useState(false);

  const wsRef = React.useRef<WebSocket | null>(null);

  const handleCheckboxChange = React.useCallback(
    (key: string, checked: CheckboxProps['checked']) => {
      if (key == 'live') setReadOnly(Boolean(checked));
      setCheckboxes((prev) => ({ ...prev, [key]: Boolean(checked) }));
    },
    []
  );

  const handleChange = React.useCallback((value: any) => {
    setSelected(value);
  }, []);

  const dataTransformed = React.useMemo(() => {
    function getRowData(layer: number, value: string) {
      // Split the value and convert it into an array of numbers
      const niveles: number[] = value.split('-').map(Number);

      // Extract the first, second, and third level values
      const keyFirstLevel = Object.keys(data)[niveles[0] - 1];
      const keySecondLevel = keyFirstLevel
        ? Object.keys(data[keyFirstLevel])[niveles[1] - 1]
        : undefined;
      const valuesAtThirdLevel = keySecondLevel
        ? data[keyFirstLevel][keySecondLevel]
        : undefined;
      const valueThirdLevel = valuesAtThirdLevel
        ? valuesAtThirdLevel[niveles[2] - 1]
        : undefined;

      // Determine the label based on available levels
      let label: string;
      if (valueThirdLevel !== undefined) {
        label = valueThirdLevel.toString();
      } else if (keySecondLevel && layer == 1) {
        label = keySecondLevel;
      } else if (keyFirstLevel && layer == 0) {
        label = keyFirstLevel;
      } else {
        label = 'Unknown';
      }

      return { label };
    }
    return mockTreeData({ getRowData });
  }, [data]);


  React.useEffect(() => {
    const fetchDataAsync = async (range: {
      startDate: string | null;
      endDate: string | null;
    }) => {
      try {
        setIsPulling(true);
        const response = await fetchData(range.startDate, range.endDate, {
          ...checkboxes,
          ...transformStateVariables(selected),
        });
        setIsPulling(false);
        const entireObject = await response.json();
        if (entireObject.void) {
          setEntireObject(null);
        } else {
          setEntireObject(JSON.stringify(entireObject));
        }
      } catch (error) {
        console.error('No data:', error);
      }
    };
    const setupWebSocket = () => {
      if (wsRef.current) {
        setIsWaiting(false);
        wsRef.current.close(); // Ensure previous WebSocket is closed
      }

      const ws = new WebSocket(config.socketURL);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsWaiting(true);
        console.log('WebSocket connection opened.');
      };

      ws.onmessage = async (message) => {
        try {
          const parsedData = JSON.parse(message.data);

          if (parsedData.action === 'notify') {
            // Actualiza el rango de fechas
            const now = new Date();
            const startOfDay = new Date(
              now.getFullYear(),
              now.getMonth(),
              now.getDate(),
              4
            ); // 4 AM today
            const newDateRange = {
              startDate: startOfDay.toISOString(),
              endDate: now.toISOString(),
            };

            setDateRange(newDateRange);

            await fetchDataAsync(newDateRange);
          }
        } catch (error) {
          console.error('Error handling WebSocket message:', error);
        }
      };

      ws.onclose = () => {
        setIsWaiting(false);
        console.log('WebSocket connection closed.');
      };
      ws.onerror = (error) => console.error('WebSocket error:', error);
    };

    const transformStateVariables = (options: string[]) => {
      interface Parameter {
        parent: number;
        value: number;
      }
      const filters: { [key: string]: Parameter[] } = {
        machine: [],
        worker: [],
        order: [],
        lot: [],
        mold: [],
        material: [],
      };

      options.forEach((option) => {
        // Split the value and convert it into an array of numbers
        const niveles: number[] = option.split('-').map(Number);

        // Extract the first, second, and third level values
        const keyFirstLevel = Object.keys(data)[niveles[0] - 1];
        const keySecondLevel = keyFirstLevel
          ? Object.keys(data[keyFirstLevel])[niveles[1] - 1]
          : undefined;
        const valuesAtThirdLevel = keySecondLevel
          ? data[keyFirstLevel][keySecondLevel]
          : undefined;
        const valueThirdLevel = valuesAtThirdLevel
          ? valuesAtThirdLevel[niveles[2] - 1]
          : undefined;

        //if they only select number of machine
        if (keySecondLevel === undefined && valueThirdLevel === undefined) {
          if (keyFirstLevel)
            filters.machine.push({
              parent: Number(keyFirstLevel),
              value: Number(keyFirstLevel),
            });
        }
        //if they only select state variable's value
        if (
          valueThirdLevel === undefined &&
          keySecondLevel !== undefined &&
          valuesAtThirdLevel !== undefined
        ) {
          valuesAtThirdLevel.forEach((value: any) => {
            filters[keySecondLevel]?.push({
              parent: Number(keyFirstLevel),
              value: Number(value),
            });
          });
        }
        //if they only select state variable
        if (keySecondLevel && valueThirdLevel !== undefined) {
          filters[keySecondLevel]?.push({
            parent: Number(keyFirstLevel),
            value: Number(valueThirdLevel),
          });
        }
      });

      return filters;
    };

    if (checkboxes.live) {
      setupWebSocket();
    }

    if (!checkboxes.live) {
      fetchDataAsync(dateRange);
    }

    return () => {
      if (wsRef.current) {
        wsRef.current.close(); // Cleanup on unmount or `live` toggle
        wsRef.current = null;
      }
    };
  }, [checkboxes, checkboxes.live, data, dateRange, selected, setEntireObject]);

  return (
    <Card>
      <CardHeader title="Settings" />
      <CardContent>
        {isWaiting && (
          <Alert severity="warning"> Waiting for changes ...</Alert>
        )}
        {isPulling && <Alert severity="info"> Pulling information ...</Alert>}
        <Box
          display="flex"
          flexDirection="column"
          justifyContent="center"
          alignItems="center"
          gap={2}
        >
          <DateRangeComponent
            dateRange={dateRange}
            readOnly={readOnly}
            setDateRange={setDateRange}
          />

          <Box display="flex" gap={1}>
            <Checkbox
              checked={checkboxes.live}
              onChange={(_, checked) => handleCheckboxChange('live', checked)}
            >
              Live
            </Checkbox>
            <Checkbox
              checked={checkboxes.offset}
              onChange={(_, checked) => handleCheckboxChange('offset', checked)}
            >
              Offset
            </Checkbox>
            <Checkbox
              checked={checkboxes.minutos}
              onChange={(_, checked) =>
                handleCheckboxChange('minutos', checked)
              }
            >
              Minutos
            </Checkbox>
          </Box>

          <VStack>
            <MultiCascader
              data={dataTransformed}
              style={{ width: 224 }}
              value={selected}
              onChange={handleChange}
            />
          </VStack>
        </Box>
      </CardContent>
    </Card>
  );
}
