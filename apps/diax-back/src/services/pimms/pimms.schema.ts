import { Schema } from 'dynamoose';
import { Item } from 'dynamoose/dist/Item';

type PimmVariableDTO = {
  id: string;
  name: string;
  value: string;
  valueType: string;
};

export class GetPimmsDTO {
  timestamp: number;
  counters: PimmVariableDTO[];
  states: PimmVariableDTO[];
  PLCNumber: number;
}

export interface PIMMDocument extends Item {
  plcId: number;
  timestamp: number;
  counters: PimmVariableDTO[];
  states: PimmVariableDTO[];
}

export const PIMMSchema = new Schema(
  {
    epochDay:{
      type:Number,
      hashKey:true
    },  
    timestamp: {
      type: Number,      
      rangeKey: true,
    },
    plcId: {
      type: Number,
      index:{
        name:"LSIplcId",
        type:"local",       
        project:true
      }
    },
    counters: {
      type: Array,
      schema: [Object],
    },
    states: {
      type: Array,
      schema: [Object],
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);
