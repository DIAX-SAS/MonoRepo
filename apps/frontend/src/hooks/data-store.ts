/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { config } from '@/config';
import { Filters } from '@/types/filters';
import { PIMMState, Variable } from '@repo-hub/internal';
import { useCallback, useRef, useState } from 'react';

// Definimos los tipos de datos

const useDataStore = () => {
  // Estado para renderizar la UI
  const [timestamps, setTimestamps] = useState<number[]>([]);

  // useRef para evitar renders innecesarios
  const dataMap = useRef<Map<number, PIMMState>>(new Map());
  const counterIndex = useRef<Map<string, Map<string, Set<number>>>>(new Map());
  const stateIndex = useRef<Map<string, Map<string | number, Set<number>>>>(
    new Map()
  );
  const [filters, setFilters] = useState<Filters>({
    initTime: Date.now(),
    endTime: Date.now(),
    accUnit: 'second',
    offset: false,
    live: false,
    states: [],
    selected: [],
  });

  const addData = useCallback(
    (timestamp: number, counters: Variable[], states: Variable[]) => {
      const entry: PIMMState = { timestamp, counters, states };
      dataMap.current.set(timestamp, entry);

      // Indexar counters
      counters.forEach(({ id, value }) => {
        if (!counterIndex.current.has(id))
          counterIndex.current.set(id, new Map());
        if (!counterIndex.current.get(id)!.has(value))
          counterIndex.current.get(id)!.set(value, new Set());
        counterIndex.current.get(id)!.get(value)!.add(timestamp);
      });

      // Indexar states
      states.forEach(({ id, value }) => {
        if (!stateIndex.current.has(id)) stateIndex.current.set(id, new Map());
        if (!stateIndex.current.get(id)!.has(value))
          stateIndex.current.get(id)!.set(value, new Set());
        stateIndex.current.get(id)!.get(value)!.add(timestamp);
      });

      // Actualizar estado para renderizar UI
      setTimestamps((prev) => [...prev, timestamp]);
      console.log(timestamp)

      if (filters.live) {
        setFilters((prevFilter) => ({
          ...prevFilter,
          initTime: timestamp - config.lapseLive,
          endTime: timestamp,
          states: [...prevFilter.states, ...getFilterableCategories([entry])],
        }));
      } else {
        setFilters((prevFilter) => ({
          ...prevFilter,
          states: [...prevFilter.states, ...getFilterableCategories([entry])],
        }));
      }

      const getFilterableCategories = (PIMMStates: PIMMState[]) => {
        const states = new Set<string>();
        const variableIdSet = new Set(config.stateKeys); // O(K) preprocessing

        PIMMStates.forEach((PIMMState) => {
          const statePIMMNumber = PIMMState.states.find(
            (variable) => variable.id === config.keyPIMMNumber
          )?.value;
          if (!statePIMMNumber) return;

          PIMMState.states.forEach((variable) => {
            if (variableIdSet.has(variable.id)) {
              // O(1) lookup
              states.add(`${statePIMMNumber}-${variable.id}-${variable.value}`);
            }
          });
        });

        return Array.from(states);
      };
    },
    []
  );

  const filterByCounter = useCallback(
    (counterId: string, value: string): PIMMState[] => {
      if (
        !counterIndex.current.has(counterId) ||
        !counterIndex.current.get(counterId)!.has(value)
      )
        return [];
      return [...counterIndex.current.get(counterId)!.get(value)!].map(
        (timestamp) => dataMap.current.get(timestamp)!
      );
    },
    []
  );
  const filterByStates = useCallback(
    (
      filters: { stateId: string; value: string | number | undefined }[]
    ): PIMMState[] => {
      if (filters.length === 0) return [];

      let filteredTimestamps: Set<number> | undefined;

      for (const { stateId, value } of filters) {
        if (value === undefined) {
          // If any filter has `undefined` value, return all PIMMStates
          return Array.from(dataMap.current.values());
        }

        const timestamps = stateIndex.current.get(stateId)?.get(value);
        if (!timestamps) return []; // If no timestamps exist for this filter, return empty

        if (filteredTimestamps === undefined) {
          filteredTimestamps = new Set(timestamps);
        } else {
          filteredTimestamps = new Set(
            [...filteredTimestamps].filter((ts) => timestamps.has(ts))
          );
        }

        if (filteredTimestamps.size === 0) return []; // If no common timestamps remain, return empty
      }

      return filteredTimestamps
        ? Array.from(filteredTimestamps).map((ts) => dataMap.current.get(ts)!)
        : [];
    },
    []
  );

  const cleanDataStore = () => {
    dataMap.current.clear();
    stateIndex.current.clear();
    counterIndex.current.clear();
    setTimestamps([]);
  };

  return {
    addData,
    filterByCounter,
    filterByStates,
    timestamps,
    dataMap,
    cleanDataStore,
    filters,
    setFilters,
  };
};

export default useDataStore;
