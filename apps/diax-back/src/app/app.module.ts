import { Module } from '@nestjs/common';
import { AppController } from './app.controller';

import { ConfigModule } from '@nestjs/config';
import { AuthModule } from '@backend/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '@backend/auth/jwt-auth.guard';
import { PIMMModule } from '@backend/pimm/pimm.module';
@Module({
  imports: [ConfigModule.forRoot({
    isGlobal: true,
    envFilePath:".env"
  }),AuthModule,PIMMModule],
  controllers: [AppController],
  providers: [{
    provide: APP_GUARD,
    useClass: JwtAuthGuard,
  }],
})
export class AppModule {}
