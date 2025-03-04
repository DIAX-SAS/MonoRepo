export type InfoSettings = {
  filters: {
    initTime: number;
    endTime: number;
    accUnit: 'second' | 'minute' | 'hour';
    lastID: number | null;
    length: number;
  };
};

export type PIMMState = {
  timestamp: number;
  counters: Variable[];
  states: Variable[];
  PLCNumber: number;
};

export type Variable = {
  id: string;
  name: string;
  value: string;
  valueType: string;
};

export type ResponsePIMM = {
  hasMore: boolean;
  lastID: number | null;
  pimmStates: PIMMState[];
};
