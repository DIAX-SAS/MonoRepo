import { Test, TestingModule } from '@nestjs/testing';
import { PIMMService } from '../pimms.service';
import { ResponsePIMM } from '@repo-hub/internal';
import { InfoSettingsDto } from '../pimms.dto';
import { PimmsModule } from '../pimms.module';
import { PIMMController } from '../pimms.controller';
import { ConfigModule } from '@nestjs/config';

jest.mock('@repo-hub/internal');
jest.mock('jsonwebtoken');
jest.mock('dynamoose');
jest.mock('@nestjs-cognito/auth', () => ({
  Authentication: () => jest.fn(),
}));
describe('PIMMService', () => {
  let service: PIMMService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        isGlobal: true,
      }), PimmsModule],
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

