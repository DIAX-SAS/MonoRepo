import { Parameters, Filters, FEPIMM } from '../../../app/dashboard/dashboard.types';

describe('Type Definitions and FEPIMM Interface', () => {
  it('should correctly define Parameters type', () => {
    const parameters: Parameters = {
      live: true,
      startDate: 1633072800000,
      endDate: 1633159200000,
      step: 'hour',
    };

    expect(parameters.live).toBe(true);
    expect(parameters.startDate).toBe(1633072800000);
    expect(parameters.endDate).toBe(1633159200000);
    expect(parameters.step).toBe('hour');
  });

  it('should correctly define Filters type', () => {
    const filters: Filters = {
      equipos: new Map([['equipo1', true]]),
      operarios: new Map([['operario1', true]]),
      ordenes: new Map([['orden1', true]]),
      lotes: new Map([['lote1', true]]),
      moldes: new Map([['molde1', true]]),
      materiales: new Map([['material1', true]]),
    };

    expect(filters.equipos.get('equipo1')).toBe(true);
    expect(filters.operarios.get('operario1')).toBe(true);
    expect(filters.ordenes.get('orden1')).toBe(true);
    expect(filters.lotes.get('lote1')).toBe(true);
    expect(filters.moldes.get('molde1')).toBe(true);
    expect(filters.materiales.get('material1')).toBe(true);
  });

  it('should correctly extend PIMM with FEPIMM interface', () => {
    const fePimm: FEPIMM = {
      buenas: 100,
      ineficiencias: 10,
      producidas: 110,
      maquina: 1,
    };

    expect(fePimm.buenas).toBe(100);
    expect(fePimm.ineficiencias).toBe(10);
    expect(fePimm.producidas).toBe(110);
    expect(fePimm.maquina).toBe(1);
  });
});