import { Schema } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

export type PimmVariableDTO = {
  id: string;
  name: string;
  value: string;
  valueType: string;
};

export interface PIMMDocument extends Item {
  plcId: number;
  timestamp: number;
  counters: PimmVariableDTO[];
  states: PimmVariableDTO[];
  payload: Record<string, any>; // TODO: create a correct type
}

export const PIMMSchema = new Schema(
  {
    plcId: {
      type: Number,
      hashKey: true,
    },
    timestamp: {
      type: Number,
      rangeKey: true, // TODO: Try to index
    },
    counters: {
      type: Array,
      schema: [Object],
    },
    states: {
      type: Array,
      schema: [Object],
    },
    payload: {
      type: Object,
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);
