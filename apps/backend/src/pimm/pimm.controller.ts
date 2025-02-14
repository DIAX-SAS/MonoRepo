import {
  Controller,
  Post,
  Body,
  Get
} from '@nestjs/common';
import { PIMMService } from './pimm.service';
import { InfoSettingsDto } from '@backend/dto/info-settings.dto';


@Controller('pimm_states')
export class PIMMController {
  constructor(private readonly PIMMService: PIMMService) { }

  @Post('s3')
  postPIMMStatesToS3(@Body() body: InfoSettingsDto) {
    return this.PIMMService.getPIMMStatesFromS3(body);
  }
  @Post('dynamo_db')
  postPIMMStatesToDynamoDB(@Body() body: InfoSettingsDto) {
    return this.PIMMService.getPIMMStatesFromDynamoDB(body);
  }

  @Get('iot_credentials')
  async getCredentialsCore() {
    return {
      token: await this.PIMMService.generateTemporalToken()
    };
  }
}


