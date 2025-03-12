import {
  Controller,
  Post,
  Body,
  Get
} from '@nestjs/common';
import { PIMMService } from './pimms.service';
import { InfoSettingsDto } from './pimms.dto';
import { Authentication } from '@nestjs-cognito/auth';

@Controller('pimms')

@Authentication()
export class PIMMController {
  constructor(private readonly PIMMService: PIMMService) { }

  @Post('')
  getPIMMS(@Body() infoSettings: InfoSettingsDto) {
    return this.PIMMService.getPIMMS(infoSettings);
  }

  @Get('/credentials')
  getPIMMSCredentials() {
    return this.PIMMService.getPIMMSCredentials();   
  }
}

