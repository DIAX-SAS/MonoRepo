import { Schema } from 'dynamoose';
import { PIMM } from '@repo-hub/internal';
import { Item } from 'dynamoose/dist/Item';

export interface PIMMDocument extends PIMM, Item {}
export const schemaDefinition = {
  PLCNumber: {
    type: Number,
    hashKey: true, // Partition key
  },
  timestamp: {
    type: Number,
    rangeKey: true, // Sort key
  },
  payload: {
    type: Object,
  },
};
export const schemaSettings = { saveUnknown: true, timestamps: true };
export const PIMMSchema = new Schema(schemaDefinition, schemaSettings);
