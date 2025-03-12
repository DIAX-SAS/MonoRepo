import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { AppController } from '../app.controller';
import { CognitoAuthModule } from '@nestjs-cognito/auth';

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
              region: "us-east-1",
              accessKeyId: "accessKeyId",
              secretAccessKey: "secretAccessKey",
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
        },
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
