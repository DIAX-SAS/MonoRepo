import { PIMMState } from '@repo-hub/internal';

export type Parameters = {
  live: boolean;
  startDate: number;
  endDate: number;
  step: 'second' | 'minute' | 'hour';
};

export type Filters = {
  equipos: Map<string, boolean>;
  operarios: Map<string, boolean>;
  ordenes: Map<string, boolean>;
  lotes: Map<string, boolean>;
  moldes: Map<string, boolean>;
  materiales: Map<string, boolean>;
};

export interface FEPIMM extends PIMMState {
  buenas: number;
  ineficiencias: number;
  producidas: number;
  maquina: number;
}
