import "reflect-metadata";
import { IsArray, IsEnum, IsNumber, IsOptional, ValidateNested, IsString } from 'class-validator';

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
  stepUnit: PimmsStepUnit;

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

export class GetPimmsDTO {
  @IsNumber()
  timestamp: number;

  @IsArray()
  @ValidateNested({ each: true })
  counters: PimmVariableDTO[];

  @IsArray()
  @ValidateNested({ each: true })
  states: PimmVariableDTO[];

  @IsNumber()
  plcId: number;
}

export class PimmVariableDTO {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  value: string;

  @IsString()
  valueType: string;
};

export class PIMMDocumentKey {
  @IsNumber()
  epochDay: number;
}
