import { validate, validateOrReject } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PimmsFilterDto, GetPimmsDTO, PimmsStepUnit } from '../pimms.dto';

describe('FiltersDto', () => {
  it('should validate a valid FiltersDto object', async () => {
    const filtersData = {
      initTime: 1633072800,
      endTime: 1633076400,
      accUnit: PimmsStepUnit.SECOND,
      lastID: 123,
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if initTime is not a number', async () => {
    const filtersData = {
      initTime: 'not a number',
      endTime: 1633076400,
      accUnit: PimmsStepUnit.SECOND,
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints.isNumber).toBeDefined();
  });

  it('should fail validation if accUnit is not a valid enum value', async () => {
    const filtersData = {
      initTime: 1633072800,
      endTime: 1633076400,
      accUnit: 'invalid',
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints.isEnum).toBeDefined();
  });

  it('should pass validation if lastID is optional and not provided', async () => {
    const filtersData = {
      initTime: 1633072800,
      endTime: 1633076400,
      accUnit: PimmsStepUnit.SECOND,
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBe(0);
  });
});

describe('InfoSettingsDto', () => {
  it('should validate a valid InfoSettingsDto object', async () => {
    const infoSettingsData = {
      filters: {
        initTime: 1633072800,
        endTime: 1633076400,
        accUnit: PimmsStepUnit.SECOND,
      },
    };

    const infoSettingsDto = plainToInstance(GetPimmsDTO, infoSettingsData);
    const errors = await validate(infoSettingsDto);
    expect(errors.length).toBe(0);
  });

  it('should fail validation if filters is not a valid FiltersDto object', async () => {
    const infoSettingsData = {
      filters: {
        initTime: 'not a number',
        endTime: 1633076400,
        accUnit: PimmsStepUnit.SECOND,
      },
    };

    const infoSettingsDto = plainToInstance(GetPimmsDTO, infoSettingsData);
    await expect(validateOrReject(infoSettingsDto)).rejects.toBeDefined();
  });
});