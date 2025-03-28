import { Test, TestingModule } from '@nestjs/testing';
import { PimmsService } from '../pimms.service';
import { ModuleMocker, MockFunctionMetadata } from 'jest-mock';
import { ConfigService } from '@nestjs/config';

const moduleMocker = new ModuleMocker(global);

describe('PimmsModule', () => {
  let module: TestingModule;
  let service: PimmsService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [],
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
    }).useMocker((token) => {   
          if (typeof token === 'function') {
            const mockMetadata = moduleMocker.getMetadata(
              token,
            ) as MockFunctionMetadata<typeof ConfigService,"function">           
            const Mock = moduleMocker.generateFromMetadata(mockMetadata);
            return new Mock();
          }
        }).compile();

    service = module.get<PimmsService>(PimmsService);
  });

  afterAll(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should provide the PimmsService', () => {
    expect(service).toBeDefined();
    expect(service).toBeInstanceOf(PimmsService);
  });

});
