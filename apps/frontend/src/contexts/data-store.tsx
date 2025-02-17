/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { createContext, useContext, useCallback, useRef, useState, ReactNode } from 'react';
import { config } from '@/config';
import { Filters } from '@/types/filters';
import { PIMMState, Variable } from '@repo-hub/internal';

// 📌 Define context type
interface DataStoreContextProps {
  addData: (timestamp: number, counters: Variable[], states: Variable[]) => void;
  filterByCounter: (counterId: string, value: string) => PIMMState[];
  filterByStates: (filters: { stateId: string; value: string | number | undefined }[]) => PIMMState[];
  timestamps: number[];
  dataMap: React.MutableRefObject<Map<number, PIMMState>>;
  cleanDataStore: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
}

// 📌 Create context
const DataStoreContext = createContext<DataStoreContextProps | undefined>(undefined);

// 📌 Context Provider Component
export const DataStoreProvider = ({ children }: { children: ReactNode }) => {
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const dataMap = useRef<Map<number, PIMMState>>(new Map());
  const counterIndex = useRef<Map<string, Map<string, Set<number>>>>(new Map());
  const stateIndex = useRef<Map<string, Map<string | number, Set<number>>>>(new Map());
  
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

      // Index counters
      counters.forEach(({ id, value }) => {
        if (!counterIndex.current.has(id)) counterIndex.current.set(id, new Map());
        if (!counterIndex.current.get(id)!.has(value)) counterIndex.current.get(id)!.set(value, new Set());
        counterIndex.current.get(id)!.get(value)!.add(timestamp);
      });

      // Index states
      states.forEach(({ id, value }) => {
        if (!stateIndex.current.has(id)) stateIndex.current.set(id, new Map());
        if (!stateIndex.current.get(id)!.has(value)) stateIndex.current.get(id)!.set(value, new Set());
        stateIndex.current.get(id)!.get(value)!.add(timestamp);
      });

      setTimestamps((prev) => [...prev, timestamp]);

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
    },
    [filters.live]
  );

  const getFilterableCategories = (PIMMStates: PIMMState[]) => {
    const states = new Set<string>();
    const variableIdSet = new Set(config.stateKeys);

    PIMMStates.forEach((PIMMState) => {
      const statePIMMNumber = PIMMState.states.find((variable) => variable.id === config.keyPIMMNumber)?.value;
      if (!statePIMMNumber) return;

      PIMMState.states.forEach((variable) => {
        if (variableIdSet.has(variable.id)) {
          states.add(`${statePIMMNumber}-${variable.id}-${variable.value}`);
        }
      });
    });

    return Array.from(states);
  };

  const filterByCounter = useCallback(
    (counterId: string, value: string): PIMMState[] => {
      if (!counterIndex.current.has(counterId) || !counterIndex.current.get(counterId)!.has(value)) return [];
      return [...counterIndex.current.get(counterId)!.get(value)!].map((timestamp) => dataMap.current.get(timestamp)!);
    },
    []
  );

  const filterByStates = useCallback(
    (filters: { stateId: string; value: string | number | undefined }[]): PIMMState[] => {
      if (filters.length === 0) return [];

      let filteredTimestamps: Set<number> | undefined;

      for (const { stateId, value } of filters) {
        if (value === undefined) {
          return Array.from(dataMap.current.values()); // Return all PIMMStates if `value` is undefined
        }

        const timestamps = stateIndex.current.get(stateId)?.get(value);
        if (!timestamps) return [];

        if (filteredTimestamps === undefined) {
          filteredTimestamps = new Set(timestamps);
        } else {
          filteredTimestamps = new Set([...filteredTimestamps].filter((ts) => timestamps.has(ts)));
        }

        if (filteredTimestamps.size === 0) return [];
      }

      return filteredTimestamps ? Array.from(filteredTimestamps).map((ts) => dataMap.current.get(ts)!) : [];
    },
    []
  );

  const cleanDataStore = () => {
    dataMap.current.clear();
    stateIndex.current.clear();
    counterIndex.current.clear();
    setTimestamps([]);
  };

  return (
    <DataStoreContext.Provider
      value={{
        addData,
        filterByCounter,
        filterByStates,
        timestamps,
        dataMap,
        cleanDataStore,
        filters,
        setFilters,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  );
};

// 📌 Custom Hook for consuming the context
export const useDataStore = () => {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return context;
};
