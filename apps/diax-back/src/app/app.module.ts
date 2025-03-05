import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@backend/services/account/account.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@backend/services/account/jwt-auth.guard';
import { PIMMModule } from '@backend/services/pimms/pimms.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CognitoAuthModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        jwtVerifier: {
          userPoolId: configService.get<string>('COGNITO_USER_POOL_ID'),
          clientId: configService.get<string>('COGNITO_CLIENT_ID'),
          tokenUse: 'id',
        },
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
        retryAttempts: 2,
        connectionFactory: (connection) => {
          connection.on('connected', () => console.log('MongoDB Connected Successfully'));
          connection.on('error', (err: string) => console.error('MongoDB Connection Error:', err));
          return connection;
        },
      }),
    }),
    AccountModule,
    PimmsModule,
  ],
  controllers: [AppController],
})
export class AppModule {}