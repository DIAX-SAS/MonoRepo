export type InfoSettings = {
  filters: {
    initTime: Date;
    endTime: Date;
    accUnit: 'second' | 'minute' | 'hour';
    lastId?: string;
  };
};

export type PIMMState = {
  timestamp: string;
  counters: Variable[];
  states: Variable[];
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
