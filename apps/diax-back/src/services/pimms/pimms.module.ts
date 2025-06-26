import { Module } from '@nestjs/common';
import { PIMMSController } from './pimms.controller';
import { PimmsService } from './pimms.service';
import { DynamooseModule } from 'nestjs-dynamoose';
import { ConfigService } from '@nestjs/config';
import { PIMMSchema } from './pimms.schema';
import { EmailService } from '../email/email.service';

@Module({
  imports: [  
    DynamooseModule.forFeatureAsync([
      {
        name: 'PIMM',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: PIMMSchema,
            options: {
              tableName: configService.get<string>('BASE_TABLE_NAME'),
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'PIMMMinute',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: PIMMSchema,
            options: {
              tableName: configService.get<string>('MINUTE_TABLE_NAME'),
            },
          };
        },
        inject: [ConfigService],
      },
      {
        name: 'PIMMHour',
        useFactory: (_, configService: ConfigService) => {
          return {
            schema: PIMMSchema,
            options: {
              tableName: configService.get<string>('HOUR_TABLE_NAME'),
            },
          };
        },
        inject: [ConfigService],
      },
    ]),],
  controllers: [PIMMSController],
  providers: [PimmsService, EmailService],
  exports: [PimmsService],
})

export class PimmsModule { }
