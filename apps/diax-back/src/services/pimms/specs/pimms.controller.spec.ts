import { Test, TestingModule } from '@nestjs/testing';
import { PIMMSController } from '../pimms.controller';
import { PimmsService } from '../pimms.service';
import { PimmsFilterDto } from '../pimms.dto';
import { GetPimmsDTO } from '../pimms.schema';

const mockPIMMService = {
  getPIMMS: jest.fn(),
  getPimmsIotCredentials: jest.fn(),
};

jest.mock('@nestjs-cognito/auth', () => ({
  Authentication: () => jest.fn(),
}));

describe('PIMMController', () => {
  let controller: PIMMSController;
  let service: PimmsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PIMMSController],
      providers: [
        {
          provide: PimmsService,
          useValue: mockPIMMService,
        },
      ],
    }).compile();

    controller = module.get<PIMMSController>(PIMMSController);
    service = module.get<PimmsService>(PimmsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPIMMS', () => {
    it('should call PIMMService.getPIMMS with the correct parameters', async () => {
      const infoSettings: PimmsFilterDto = {      
          initTime: 70000000,
          endTime: 70000001,
          stepUnit: 'second',
      };

      const expectedResult: GetPimmsDTO = {       
          plcId: 3,
          timestamp: 70000000,
          counters: [],
          states: [],
      };

      mockPIMMService.getPIMMS.mockResolvedValue(expectedResult);

      const result = await controller.getPIMMS(infoSettings);

      expect(service.getPIMMS).toHaveBeenCalledWith(infoSettings);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPIMMSCredentials', () => {
    it('should call PIMMService.getPimmsIotCredentials', async () => {
      const expectedResult = {
        token:
          '7192164a1615db76fbb014fdd766b339607e9bd3cde5d85dd7be97a9cdaf99aa',
          expiration:"mock-date"
      };
      mockPIMMService.getPimmsIotCredentials.mockResolvedValue(expectedResult);
      const result = await controller.getPimmsIotCredentials();
      expect(service.getPimmsIotCredentials).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});
