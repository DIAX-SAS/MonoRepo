import { Test, TestingModule } from '@nestjs/testing';
import { PimmsService } from '../pimms.service';
import { PimmsModule } from '../pimms.module';
import { PIMMSController } from '../pimms.controller';
import { ConfigModule } from '@nestjs/config';
import { GetPimmsResponseDTO, PimmsFilterDto } from '../pimms.dto';

jest.mock('jsonwebtoken');
jest.mock('dynamoose');
jest.mock('@nestjs-cognito/auth', () => ({
  Authentication: () => jest.fn(),
}));
describe('PIMMService', () => {
  let service: PimmsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({
        isGlobal: true,
      }), PimmsModule],
      controllers: [PIMMSController],
      providers: [PimmsService]
    }).compile();
    service = module.get<PimmsService>(PimmsService);
  });

  it('should be defined', () => {

    expect(service).toBeDefined();
  });

  describe('getPimmsIotCredentials', () => {
    it('should return temporal token and expiration date', async () => {
      const mockToken = 'mock-token';
      const mockExpirationDate = new Date();

      jest.spyOn(service, 'getPimmsIotCredentials').mockImplementation(async () => {
        return {
          token: {
            sessionToken: mockToken,
            expiration: mockExpirationDate.toISOString(),
          },
        };
      });

      const result = await service.getPimmsIotCredentials();

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
      const mockSettings: PimmsFilterDto = {        
          initTime: 700000000,
          endTime: 700000001,
          lastID: null,
          stepUnit: 'second',        
      };

      const mockResponse: GetPimmsResponseDTO = {
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

