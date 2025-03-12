import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { DynamooseModule } from 'nestjs-dynamoose';
import { CognitoAuthModule } from '@nestjs-cognito/auth';
import { PimmsModule } from '../services/pimms/pimms.module';

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
          create: false, // Set to true if you want Dynamoose to create tables automatically
          update: true, // Set to true if you want to update existing table schema
        },
      }),
    }),   
    PimmsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
