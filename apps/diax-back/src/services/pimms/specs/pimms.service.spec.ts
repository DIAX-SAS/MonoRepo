import "reflect-metadata";
import { Test, TestingModule } from '@nestjs/testing';
import { PimmsService } from '../pimms.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';

const moduleMocker = new ModuleMocker(global);
import { ConfigService } from "@nestjs/config";
import { PimmsFilterDto, GetPimmsResponseDTO, PimmsStepUnit } from "../pimms.interface";

describe('PIMMService', () => {
  let service: PimmsService;
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({   
      providers: [{
        provide: "PIMMModel",
        useValue: jest.fn()
      },{
        provide: "PIMMMinuteModel",
        useValue: jest.fn()
      },{
        provide: "PIMMHourModel",
        useValue: jest.fn()
      },
      PimmsService]
    })
    .useMocker((token) => {   
      if (typeof token === 'function') {
        const mockMetadata = moduleMocker.getMetadata(
          token,
        ) as MockFunctionMetadata<typeof ConfigService,"function">;       

        const Mock = moduleMocker.generateFromMetadata(mockMetadata);
        return new Mock();
      }
    })
    .compile();
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
          stepUnit: PimmsStepUnit.SECOND,        
      };

      const mockResponse: GetPimmsResponseDTO = {
        pimms: [{ timestamp: 700000000, counters: [], states: [], plcId: 3 }],
        lastID: 700000001,
        totalProcessed: 1,
      };

      jest.spyOn(service, 'getPIMMS').mockImplementation(async () => mockResponse);
      const result = await service.getPIMMS(mockSettings);
      expect(result).toEqual(mockResponse);
    });
  });

});

