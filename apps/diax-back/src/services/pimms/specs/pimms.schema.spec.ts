import { schemaDefinition, schemaSettings } from '../pimm.schema';

describe('schemaDefinition', () => {
  it('should define PLCNumber as a Number type and hashKey (partition key)', () => {
    expect(schemaDefinition.PLCNumber).toEqual({
      type: Number,
      hashKey: true,
    });
  });

  it('should define timestamp as a Number type and rangeKey (sort key)', () => {
    expect(schemaDefinition.timestamp).toEqual({
      type: Number,
      rangeKey: true,
    });
  });

  it('should define payload as an Object type', () => {
    expect(schemaDefinition.payload).toEqual({
      type: Object,
    });
  });
});

describe('schemaSettings', () => {
  it('should have saveUnknown set to true', () => {
    expect(schemaSettings.saveUnknown).toBe(true);
  });

  it('should have timestamps set to true', () => {
    expect(schemaSettings.timestamps).not.toBe(false);
  });
});