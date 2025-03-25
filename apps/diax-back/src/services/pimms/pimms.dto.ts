import "reflect-metadata"
import { Type } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export enum PimmsStepUnit {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
}

export class PimmsFilterDto {
  @IsNumber()
  @Type(() => Number)
  initTime: number;

  @IsNumber()
  @Type(() => Number)
  endTime: number;

  @IsEnum(PimmsStepUnit)
  stepUnit: 'second' | 'minute' | 'hour';

  @IsOptional()
  @IsNumber()
  @Type(() => Number)
  lastID?: number | null;
}

// TODO: change to class and add type checks
export type GetPimmsResponseDTO = {
  lastID: number | null;
  pimms: PimmDTO[];
  totalProcessed: number;
};

