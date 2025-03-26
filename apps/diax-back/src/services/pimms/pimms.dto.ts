import "reflect-metadata"
import { IsArray, IsEnum, IsNumber, IsOptional, ValidateNested } from 'class-validator';
import { GetPimmsDTO } from "./pimms.schema";

export enum PimmsStepUnit {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
}

export class PimmsFilterDto {
  @IsNumber()  
  initTime: number;

  @IsNumber()
  endTime: number;

  @IsEnum(PimmsStepUnit)
  stepUnit: 'second' | 'minute' | 'hour';

  @IsOptional()
  @IsNumber()
  lastID?: number | null;
}

export class GetPimmsResponseDTO {
  @IsOptional()
  @IsNumber()
  lastID: number | null;

  @IsArray()
  @ValidateNested({ each: true })
  pimms: GetPimmsDTO[];

  @IsNumber()
  totalProcessed: number;
}

