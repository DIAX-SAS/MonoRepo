import { Test, TestingModule } from '@nestjs/testing';
import { PIMMController } from '../../../services/pimms/pimms.controller';
import { PIMMService } from '../../../services/pimms/pimms.service';
import { InfoSettingsDto } from '../../../services/pimms/pimms.dto';

// Mock the PIMMService
const mockPIMMService = {
  getPIMMS: jest.fn(),
  getPIMMSCredentials: jest.fn(),
};

// Mock the Authentication decorator
jest.mock('@nestjs-cognito/auth', () => ({
  Authentication: () => jest.fn(),
}));

describe('PIMMController', () => {
  let controller: PIMMController;
  let service: PIMMService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PIMMController],
      providers: [
        {
          provide: PIMMService,
          useValue: mockPIMMService,
        },
      ],
    }).compile();

    controller = module.get<PIMMController>(PIMMController);
    service = module.get<PIMMService>(PIMMService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getPIMMS', () => {
    it('should call PIMMService.getPIMMS with the correct parameters', async () => {
      const infoSettings: InfoSettingsDto = {
        filters: {
          initTime: 70000000,
          endTime: 70000001,
          accUnit: 'second',
        },
      };

      const expectedResult = {
        timestamp: 70000000,
        PLCNumber: 3,
        payload: {
          PLCNumber: 3,
          timestamp: 70000000,
          counters: [],
          states: [],
        },
      };

      mockPIMMService.getPIMMS.mockResolvedValue(expectedResult);

      const result = await controller.getPIMMS(infoSettings);

      expect(service.getPIMMS).toHaveBeenCalledWith(infoSettings);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('getPIMMSCredentials', () => {
    it('should call PIMMService.getPIMMSCredentials', async () => {
      const expectedResult = {
        token:
          '7192164a1615db76fbb014fdd766b339607e9bd3cde5d85dd7be97a9cdaf99aa',
      };
      mockPIMMService.getPIMMSCredentials.mockResolvedValue(expectedResult);
      const result = await controller.getPIMMSCredentials();
      expect(service.getPIMMSCredentials).toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });
  });
});
