import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AppController } from '../app.controller';
import { CognitoAuthModule } from '@nestjs-cognito/auth';
import { PimmsModule } from '../../services/pimms/pimms.module';

describe('AppModule', () => {
  let moduleRef: TestingModule;

  beforeEach(async () => {
    moduleRef = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
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
            }
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
        },
        PimmsModule,
      ],
      controllers: [AppController],
    }).compile();
  });

  it('should be defined', () => {
    expect(moduleRef).toBeDefined();
  });

  it('should have AppController', () => {
    const controller = moduleRef.get<AppController>(AppController);
    expect(controller).toBeDefined();
  });

  it('should import required modules', () => {
    expect(moduleRef.get(ConfigModule)).toBeDefined();
    expect(moduleRef.get(DynamooseModule)).toBeDefined();
  });
});
