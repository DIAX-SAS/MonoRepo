// src/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({     
        signOptions: {
          expiresIn: '1h', 
        },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [JwtAuthGuard],
  exports: [JwtAuthGuard],
})
export class AuthModule {}