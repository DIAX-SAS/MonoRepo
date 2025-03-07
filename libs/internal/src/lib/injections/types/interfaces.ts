export type InfoSettings = {
  filters: {
    initTime: number;
    endTime: number;
    accUnit: 'second' | 'minute' | 'hour';
    lastID: number | null;
  };
};

export type PIMM = {
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
  lastID: number | null;
  pimms: PIMM[];
  totalProcessed: number;
};
