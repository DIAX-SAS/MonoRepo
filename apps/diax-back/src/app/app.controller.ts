import {
  Controller,
  Get, 
} from '@nestjs/common';
@Controller('')
export class AppController {
  @Get('')
  getObjects() {
    return "Hello DIAX!";
  }
}
