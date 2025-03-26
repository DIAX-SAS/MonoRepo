import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { DynamoDB } from '@aws-sdk/client-dynamodb';
import { AppController } from './app.controller';
import { PimmsModule } from '../services/pimms/pimms.module';
import { CognitoAuthModule } from '@nestjs-cognito/auth';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {        
        return {
          jwtVerifier: {
            userPoolId: configService.get<string>('COGNITO_USER_POOL_ID'),
            clientId: configService.get<string>('COGNITO_CLIENT_ID'),
            tokenUse: null,
          },
        };
      },
    }),
    DynamooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        aws: {
          region: configService.get<string>('AWS_REGION'),
          accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
          secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
        },
        model: {
          create: false, // Set to true to create tables automatically
          update: true, // Set to true to update table schema
        },
        ddb: new DynamoDB({
          region: configService.get<string>('AWS_REGION'),
          credentials: {
            accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID', ''),
            secretAccessKey: configService.get<string>(
              'AWS_SECRET_ACCESS_KEY',
              ''
            ),
          },
        }),
      }),
    }),
    PimmsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
