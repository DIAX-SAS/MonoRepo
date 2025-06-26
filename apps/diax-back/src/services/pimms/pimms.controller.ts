import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { PimmsService } from './pimms.service';
import { Authentication } from '@nestjs-cognito/auth';
import {
  GetPimmsResponseDTO,
  PimmsFilterDto,
  IotCredentialsDto, 
} from './pimms.interface'; 
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('PIMMS')
@ApiBearerAuth()
@Controller('pimms')
@Authentication()
@ApiResponse({
  status: 401,
  description: 'Unauthorized — missing or invalid token',
  schema: {
    example: {
      statusCode: 401,
      message: 'Authentication failed',
    },
  },
})
export class PIMMSController {
  constructor(private readonly PimmsService: PimmsService) {}

  @Post('')
  @ApiOperation({ summary: 'Get PIMMS data based on filters' })
  @ApiBody({ type: PimmsFilterDto })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved filtered PIMMS data',
    type: GetPimmsResponseDTO,
  })
  getPIMMS(
    @Body() pimmsFilterDto: PimmsFilterDto
  ): Promise<GetPimmsResponseDTO> {
    return this.PimmsService.getPIMMS(pimmsFilterDto);
  }

  @Get('iot/credentials')
  @ApiOperation({ summary: 'Get IoT credentials for PIMMS' })
  @ApiResponse({
    status: 200,
    description: 'Successfully retrieved IoT credentials',
    type: IotCredentialsDto,
  })
  getPimmsIotCredentials(): Promise<IotCredentialsDto> {
    return this.PimmsService.getPimmsIotCredentials();
  }

  @Get('email')
  @ApiOperation({ summary: 'Sends report OEE of each employee.' })
  @ApiResponse({ status: 200, description: 'Successfully sent report.' })
  sendPimmReport(@Query('address') address: string) {
    return this.PimmsService.sendPimmReport(address);
  }
}
