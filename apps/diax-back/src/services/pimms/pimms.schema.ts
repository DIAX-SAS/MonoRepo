import { Schema } from 'dynamoose';


export const PimmVariableDTOSchema = new Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    value: { type: [Number , Boolean , String], required: true },
    valueType: { type: String, required: true },
  },
  {
    saveUnknown: true,
    timestamps: false,
  }
);

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
      type: Number
    },
    counters: {
      type: Array,
      schema: [PimmVariableDTOSchema],
    },
    states: {
      type: Array,
      schema: [PimmVariableDTOSchema],
    },
  },
  {
    saveUnknown: true,
    timestamps: true,
  }
);
