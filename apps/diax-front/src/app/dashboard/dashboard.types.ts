export enum PimmsStepUnit {
  SECOND = "second",
  MINUTE = "minute",
  HOUR = "hour"
}

export type Parameters = {
  live: boolean;
  startDate: number;
  endDate: number;
  step: PimmsStepUnit;
};

export type Filters = {
  equipos: Map<string, boolean>;
  operarios: Map<string, boolean>;
  ordenes: Map<string, boolean>;
  lotes: Map<string, boolean>;
  moldes: Map<string, boolean>;
  materiales: Map<string, boolean>;
};

export interface PimmVariable {
  id: string,
  name: string,
  value: string,
  valueType: string;
}
export interface PIMM {
  plcId: number;
  timestamp: number;
  counters: PimmVariable[];
  states: PimmVariable[];
}
export interface FEPIMM extends PIMM {
  buenas: number;
  ineficiencias: number;
  producidas: number;
  maquina: number;
}
export interface ResponsePimms {
  lastID: number | null;
  pimms: PIMM[];
  totalProcessed: number;
}


export interface FilterPimmsDto {
  initTime: number;
  endTime: number;
  stepUnit: PimmsStepUnit;
  lastID?: number | null;
}