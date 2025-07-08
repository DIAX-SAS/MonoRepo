import "reflect-metadata";
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  ValidateNested,
  IsString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum PimmsStepUnit {
  SECOND = 'second',
  MINUTE = 'minute',
  HOUR = 'hour',
}

export class PimmVariableDTO {
  @ApiProperty({ example: 'counter1', description: 'Variable ID' })
  @IsString()
  id: string;

  @ApiProperty({ example: 'Motor Speed', description: 'Variable name' })
  @IsString()
  name: string;

  @ApiProperty({ example: '123.45', description: 'Value of the variable' })
  @IsString()
  value: string;

  @ApiProperty({ example: 'float', description: 'Type of the value (e.g., string, float)' })
  @IsString()
  valueType: string;
}
export class PimmsFilterDto {
  @ApiProperty({ example: 1748440150673, description: 'Start time in milliseconds since epoch' })
  @IsNumber()
  initTime: number;

  @ApiProperty({ example: 1748440150673, description: 'End time in milliseconds since epoch' })
  @IsNumber()
  endTime: number;

  @ApiProperty({ example: PimmsStepUnit.MINUTE, enum: PimmsStepUnit, description: 'Step unit for the data' })
  @IsEnum(PimmsStepUnit)
  stepUnit: PimmsStepUnit;

  @ApiProperty({ example: 1748440150673, required: false, description: 'Retake point in milliseconds since epoch' })
  @IsOptional()
  @IsNumber()
  lastID?: number | null;
}

export class GetPimmsDTO {
  @ApiProperty({ example: 1748440150673, description: 'Timestamp of the data point in ms' })
  @IsNumber()
  timestamp: number;

  @ApiProperty({ type: [PimmVariableDTO], description: 'List of counter variables' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PimmVariableDTO)
  counters: PimmVariableDTO[];

  @ApiProperty({ type: [PimmVariableDTO], description: 'List of state variables' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PimmVariableDTO)
  states: PimmVariableDTO[];

  @ApiProperty({ example: 101, description: 'PLC ID associated with this data' })
  @IsNumber()
  plcId: number;
}

export class GetPimmsResponseDTO {
  @ApiProperty({ example: 1748440150673, required: false, description: 'Last ID processed' })
  @IsOptional()
  @IsNumber()
  lastID: number | null;

  @ApiProperty({ type: [GetPimmsDTO], description: 'List of PIMMS data' })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GetPimmsDTO)
  pimms: GetPimmsDTO[];

  @ApiProperty({ example: 100, description: 'Total data points processed' })
  @IsNumber()
  totalProcessed: number;
}



export class PIMMDocumentKey {
  @ApiProperty({ example: 19521, description: 'Epoch day key used for partitioning or indexing' })
  @IsNumber()
  epochDay: number;
}
export class IotTokenDto {
  @ApiProperty({
    example: 'FQoGZXIvYXdzEKr//////////wEaDK...',
    description: 'Session token for IoT access',
  })
  sessionToken: string;

  @ApiProperty({
    example: '2025-06-01T18:00:00Z',
    description: 'Token expiration time in ISO format',
  })
  expiration: string;
}
export class IotCredentialsDto {
  @ApiProperty({
    type: () => IotTokenDto,
    description: 'AWS IoT temporary credentials',
  })
  token: IotTokenDto;
}


