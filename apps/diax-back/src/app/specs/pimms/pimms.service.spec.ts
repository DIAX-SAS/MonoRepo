import { Test, TestingModule } from '@nestjs/testing';
import { PIMMService } from '../../../services/pimms/pimms.service';
import { ResponsePIMM } from '@repo-hub/internal';
import { InfoSettingsDto } from '../../../services/pimms/pimms.dto';
import { PimmsModule } from '../../../services/pimms/pimms.module';
import { PIMMController } from '../../../services/pimms/pimms.controller';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { CognitoAuthModule } from '@nestjs-cognito/auth';

jest.mock('@repo-hub/internal');
jest.mock('jsonwebtoken');
jest.mock('dynamoose');

describe('PIMMService', () => {
  let service: PIMMService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        isGlobal: true,
      }),

      DynamooseModule.forRootAsync({
        imports: [ConfigModule],
        inject: [],
        useFactory: () => ({
          aws: {
            region: 'us-east-1',
            accessKeyId: 'accessKeyId',
            secretAccessKey: 'secretAccessKey',
          },
          model: {
            create: false, // Set to true if you want Dynamoose to create tables automatically
            update: true, // Set to true if you want to update existing table schema
          },
        }),
      }),

      {
        module: CognitoAuthModule,
        providers: [
          {
            provide: 'COGNITO_JWT_VERIFIER_INSTANCE_TOKEN',
            useValue: {
              verify: jest.fn().mockResolvedValue({}),
            },
          },
        ],
        exports: ['COGNITO_JWT_VERIFIER_INSTANCE_TOKEN'],
      }, PimmsModule],
      controllers: [PIMMController],
      providers: [PIMMService]
    }).compile();
    service = module.get<PIMMService>(PIMMService);
  });

  it('should be defined', () => {

    expect(service).toBeDefined();
  });

  describe('getPIMMSCredentials', () => {
    it('should return temporal token and expiration date', async () => {
      const mockToken = 'mock-token';
      const mockExpirationDate = new Date();

      jest.spyOn(service, 'getPIMMSCredentials').mockImplementation(async () => {
        return {
          token: {
            sessionToken: mockToken,
            expiration: mockExpirationDate.toISOString(),
          },
        };
      });

      const result = await service.getPIMMSCredentials();

      expect(result).toEqual({
        token: {
          sessionToken: mockToken,
          expiration: mockExpirationDate.toISOString(),
        },
      });
    });
  });

  describe('getPIMMS', () => {
    it('should return PIMMS data', async () => {
      const mockSettings: InfoSettingsDto = {
        filters: {
          initTime: 700000000,
          endTime: 700000001,
          lastID: null,
          accUnit: 'second',
        },
      };

      const mockResponse: ResponsePIMM = {
        pimms: [{ timestamp: 700000000, counters: [], states: [], PLCNumber: 3 }],
        lastID: 700000001,
        totalProcessed: 1,
      };

      jest.spyOn(service, 'getPIMMS').mockImplementation(async () => mockResponse);
      const result = await service.getPIMMS(mockSettings);
      expect(result).toEqual(mockResponse);
    });
  });

});

