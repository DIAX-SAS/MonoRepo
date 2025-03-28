import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from '../app.controller';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
   
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [AppController],      
    }).compile();

    appController = moduleRef.get<AppController>(AppController);
    
  });

  it('should be defined', () => {
    expect(appController).toBeDefined();
  });

  describe('getObjects', () => {
    it('should return "Hello DIAX!"', () => {
      expect(appController.getObjects()).toEqual( 'Hello DIAX!' );
    });
  });

  describe('getVersion', () => {
    it('should return a version string in the format x.y.z', () => {
      const version = appController.getVersion().version;
      expect(version).toMatch(/^\d+\.\d+\.\d+$/);
    });
  });
});
