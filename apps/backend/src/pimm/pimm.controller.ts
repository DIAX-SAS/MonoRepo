import {
  Controller,
  Post,
  Body, 
} from '@nestjs/common';
import { PlcService } from './pimm.service';
import { InfoSettings} from '@repo-hub/internal';


@Controller('PIMMStates')
export class PlcController {
  constructor(private readonly plcService: PlcService) {}

  @Post('')
  getObjects(@Body() body: InfoSettings) {
    return this.plcService.GetObjects(body);
  }

}
