import { Schema } from 'dynamoose';
import { PIMMState } from '@repo-hub/internal';
import {Item} from "dynamoose/dist/Item";

// ✅ Define an interface extending Document for correct typing
export interface PIMMDocument extends Item {
  PLCNumber: number;
  timestamp: number;
  payload: PIMMState;
}

// ✅ Define the Schema using nestjs-dynamoose
export const PIMMSchema = new Schema({
  PLCNumber: {
    type: Number,
    hashKey: true, // Partition key
  },
  timestamp: {
    type: Number,
    rangeKey: true, // Sort key
  },
  payload: {
    type: Object, // Required if you have nested JSON data
  },
});
