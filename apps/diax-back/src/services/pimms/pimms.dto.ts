import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';

enum AccUnit {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
}
export class FiltersDto {
  @IsNumber()
  @Type(() => Number)
  initTime: number;

  @IsNumber()
  @Type(() => Number)
  endTime: number;

  @IsEnum(AccUnit, {
    message: `accUnit must be one of the following values: ${Object.values(
      AccUnit
    ).join(', ')}`,
  })
  accUnit: 'second' | 'minute' | 'hour';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lastID?: number | null;
}
export class InfoSettingsDto {
  @ValidateNested()
  @Type(() => FiltersDto)
  filters: FiltersDto;
}
