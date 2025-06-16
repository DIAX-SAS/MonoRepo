import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { PimmsStepUnit, PimmsFilterDto } from '../pimms.interface';

describe('PimmsFilterDto', () => {
  it('should validate a valid PimmsFilterDto object', async () => {
    const filtersData = {
      initTime: 1633072800,
      endTime: 1633076400,
      stepUnit: PimmsStepUnit.SECOND,
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
      stepUnit: PimmsStepUnit.SECOND,
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints.isNumber).toBeDefined();
  });

  it('should fail validation if enTime is not a number', async () => {
    const filtersData = {
      initTime: 1633076400,
      endTime: "not a number",
      stepUnit: PimmsStepUnit.SECOND,
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints.isNumber).toBeDefined();
  });


  it('should fail validation if stepUnit is not a valid enum value', async () => {
    const filtersData = {
      initTime: 1633072800,
      endTime: 1633076400,
      stepUnit: 'invalid',
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBe(1);
    expect(errors[0].constraints.isEnum).toBeDefined();
  });

  it('should pass validation if lastID is optional and not provided', async () => {
    const filtersData = {
      initTime: 1633072800,
      endTime: 1633076400,
      stepUnit: PimmsStepUnit.SECOND,
    };

    const filtersDto = plainToInstance(PimmsFilterDto, filtersData);
    const errors = await validate(filtersDto);
    expect(errors.length).toBe(0);
  });
});
