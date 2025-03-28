import {
  Controller,
  Post,
  Body,
  Get
} from '@nestjs/common';
import { PimmsService } from './pimms.service';
import { Authentication } from '@nestjs-cognito/auth';
import { GetPimmsResponseDTO, PimmsFilterDto } from './pimms.interface';

@Controller('pimms')
@Authentication()
export class PIMMSController {
  constructor(private readonly PimmsService: PimmsService) { }

  @Post('')
  getPIMMS(@Body() pimmsFilterDto: PimmsFilterDto): Promise<GetPimmsResponseDTO> {
    return this.PimmsService.getPIMMS(pimmsFilterDto);
  }

  @Get('iot/credentials')
  getPimmsIotCredentials() {
    return this.PimmsService.getPimmsIotCredentials();   
  }
}
