import { GetPimmsDTO } from "../pimms.interface";

describe('GetPimmsDTO', () => {
  it('should create a valid GetPimmsDTO instance', () => {
    const testPimms: GetPimmsDTO = {
      timestamp: 1700000000,
      counters: [
        { id: '1', name: 'Counter1', value: '100', valueType: 'number' },
      ],
      states: [
        { id: '2', name: 'State1', value: 'on', valueType: 'string' },
      ],
      plcId: 123,
    };

    expect(testPimms).toHaveProperty('timestamp', 1700000000);
    expect(testPimms.counters[0].id).toBe('1');
    expect(testPimms.plcId).toBe(123);
  });
});
