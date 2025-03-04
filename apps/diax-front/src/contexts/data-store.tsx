/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { time } from 'console';
import { config } from '@/config';
import { Filters } from '@/types/filters';
import { PIMMState, Variable } from '@repo-hub/internal';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useRef,
  useState,
} from 'react';

interface DataStoreContextProps {
  addData: (
    timestamp: number,
    counters: Variable[],
    states: Variable[],
    onMessage?: boolean
  ) => void;
  cleanDataStore: () => void;
  filters: Filters;
  setFilters: React.Dispatch<React.SetStateAction<Filters>>;
  applyFiltersMap: (filters: Filters) => PIMMState[];
}

const DataStoreContext = createContext<DataStoreContextProps | undefined>(
  undefined
);

export const DataStoreProvider = ({ children }: { children: ReactNode }) => {
  const offsets = React.useRef<
    Record<
      string,
      Record<
        string,
        { start: number; end: number; value: number; previousValue: number }
      >
    >
  >({});
  const filterIdStateKeyMap = React.useMemo(() => config.stateKeys, []);

  const [filters, setFilters] = useState<Filters>({
    initTime: Date.now(),
    endTime: Date.now(),
    accUnit: 'second',
    offset: false,
    live: false,
    states: new Set(),
    selected: [],
  });

  const dataMap = useRef<Map<number, PIMMState>>(new Map<number, PIMMState>());
  const [timestamps, setTimestamps] = useState<number[]>([]);
  const dataKeys = useRef<Map<string, Set<number>>>(new Map());

  const addData = useCallback(
    (
      timestamp: number,
      counters: Variable[],
      states: Variable[],
      onMessage?: boolean
    ) => {
      const entry: PIMMState = { timestamp, counters, states };
      const PIMMNumber = states.find(
        (variable) => variable.id === config.keyPIMMNumber
      )?.value;

      if (!dataMap.current.has(timestamp)) {
        dataMap.current.set(timestamp, entry);
      }

      const newStates = new Set<string>(filters.states);
      let newTimestamps: number[] = [];

      states.forEach((variable) => {
        const key = `${PIMMNumber}-${variable.id}-${variable.value}`;

        // Use existing set instead of creating a new one
        const keySet = dataKeys.current.get(key) || new Set();
        keySet.add(timestamp);
        dataKeys.current.set(key, keySet);

        newStates.add(key);
      });

      setTimestamps((prevTimestamps) => {
        newTimestamps = [...prevTimestamps, timestamp];

        if (onMessage && newTimestamps.length > 1) {
          const oldestTimestamp = newTimestamps.shift()!;
          const oldestObject = dataMap.current.get(oldestTimestamp);

          if (oldestObject) {
            const PIMMNumberOld = oldestObject.states.find(
              (v) => v.id === config.keyPIMMNumber
            )?.value;

            oldestObject.states.forEach((variable) => {
              const keyOld = `${PIMMNumberOld}-${variable.id}-${variable.value}`;
              dataKeys.current.get(keyOld)?.delete(oldestTimestamp);
            });
          }

          dataMap.current.delete(oldestTimestamp);
        }

        return newTimestamps;
      });

      setFilters((prevFilter) => ({
        ...prevFilter,
        initTime: onMessage
          ? timestamp - config.lapseLive
          : prevFilter.initTime,
        endTime: onMessage ? timestamp : prevFilter.endTime,
        states: newStates,
      }));
    },
    [filters.states] // Add dependencies
  );

  const cleanDataStore = () => {
    dataMap.current.clear();
    dataKeys.current.clear();
    setTimestamps([]);
  };

  const applyFiltersMap = useCallback(
    (filters: Filters) => {
     
      const newStates = Array.from(filters.states).filter((state) =>
        filters.selected.some((prefix) => state.startsWith(prefix))
      );
      const filteredPIMMStates = Array.from(dataKeys.current)
        .flatMap(([key, timestamps], index) => {
          if (newStates.length === 0) return Array.from(timestamps);
          if (newStates.includes(key)) return Array.from(timestamps);
          return [];
        })
        .map((timestamp) => dataMap.current.get(timestamp))
        .filter((state): state is PIMMState => state !== undefined);

      if (filters.offset) {
        filteredPIMMStates.forEach((PIMMState, i) => {
          // Convert states & counters into Maps for O(1) lookups
          const stateMap = new Map(PIMMState.states.map((s) => [s.id, s]));
          const counterMap = new Map(PIMMState.counters.map((c) => [c.id, c]));

          // Get PIMM Number (from indexed stateMap)
          const statePIMMNumber = stateMap.get(config.keyPIMMNumber)?.value;
          if (!statePIMMNumber) return;

          if (!offsets.current[statePIMMNumber]) {
            offsets.current[statePIMMNumber] = {};
          }

          for (const offsetKey of config.offsetKeys) {
            // O(1) lookup instead of O(C) find()
            const counter = counterMap.get(offsetKey);
            const counterValue = counter ? Number(counter.value) : 0;

            if (!offsets.current[statePIMMNumber][offsetKey]) {
              offsets.current[statePIMMNumber][offsetKey] = {
                start: 0,
                end: 0,
                value: 0,
                previousValue: 0,
              };
            }

            const offsetEntry = offsets.current[statePIMMNumber][offsetKey];

            if (i === 0 && offsetEntry.start > 0) {
              offsetEntry.start = counterValue;
              if (counter) counter.value = '0';
            }

            if (counterValue < offsetEntry.previousValue) {
              offsetEntry.end = offsetEntry.previousValue;
              offsetEntry.value += offsetEntry.end - offsetEntry.start;
              offsetEntry.start = 0;
              if (counter) counter.value = String(offsetEntry.value);
            }

            offsetEntry.previousValue = counterValue;
          }
        });
      }
      return filteredPIMMStates;
    },
    [dataMap, filters.offset, filters.selected]
  );

  return (
    <DataStoreContext.Provider
      value={{
        addData,
        cleanDataStore,
        filters,
        setFilters,
        applyFiltersMap,
      }}
    >
      {children}
    </DataStoreContext.Provider>
  );
};

export const useDataStore = () => {
  const context = useContext(DataStoreContext);
  if (!context) {
    throw new Error('useDataStore must be used within a DataStoreProvider');
  }
  return context;
};
