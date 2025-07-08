import { LineSeries, CategoryPolar, ChartNode, Category } from '../../components/graphs';

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

export interface ReduceMolde {
  acc_cav1: number;
  acc_cav2: number;
  acc_cav3: number;
  acc_cav4: number;
  acc_cav5: number;
  acc_cav6: number;
  acc_gramosgeneral: number;
}

export interface ReducePIMMs {
  acc_buenas: number;
  acc_noConformes: number;
  acc_defectoInicioTurno: number;
  acc_inyecciones: number;
  acc_ineficiencias: number;
  acc_producidas: number;
  acc_montaje: number;
  acc_calidad: number;
  acc_material: number;
  acc_abandono: number;
  acc_molde: number;
  acc_maquina: number;
  acc_noProg: number;
  acc_motor: number;
  acc_timestamp: number;
}

export type GraphCategory =
  | 'indicadores'
  | 'calidad'
  | 'disponibilidad'
  | 'rendimiento'
  | 'montaje'
  | 'energia'
  | 'material'
  | 'molde'
  | 'ciclos';

export type ChartDataByType = {
  MultiLine: LineSeries[];
  Polar: CategoryPolar[];
  MultiPie: ChartNode;
  StackedBar: Category[];
  OEE: {
    availability: number;
    performance: number;
    quality: number;
    efficiency: number;
  }
  Mounting: FEPIMM[];
};

export type GraphData = {
  [category in GraphCategory]: {
    [chart in keyof ChartDataByType]?: ChartDataByType[chart];
  };
};


export type ResponseToken = {
  token: {
    sessionToken: string
  }
}