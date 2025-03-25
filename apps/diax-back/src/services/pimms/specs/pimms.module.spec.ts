import { Test, TestingModule } from '@nestjs/testing';
import { PimmsModule } from '../pimms.module';
import { PIMMSController } from '../pimms.controller';
import { PimmsService } from '../pimms.service';
import { ConfigModule } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { CognitoAuthModule } from '@nestjs-cognito/auth';


describe('PimmsModule', () => {
    let module: TestingModule;

    beforeEach(async () => {
        // Create a testing module with PimmsModule
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
            controllers: [PIMMSController],
            providers: [PimmsService]
        }).compile();
    });

    it('should be defined', () => {
        expect(module).toBeDefined();
    });

    it('should have PIMMController', () => {
        const controller = module.get<PIMMSController>(PIMMSController);
        expect(controller).toBeDefined();
        expect(controller).toBeInstanceOf(PIMMSController);
    });

    it('should have PIMMService', () => {
        const service = module.get<PimmsService>(PimmsService);
        expect(service).toBeDefined();
        expect(service).toBeInstanceOf(PimmsService);
    });

    it('should export PIMMService', () => {
        expect(module.get(PimmsService)).toBeDefined();
    });
});
