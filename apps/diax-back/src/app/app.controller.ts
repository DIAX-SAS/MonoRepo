import {
  Controller,
  Get, 
} from '@nestjs/common';
import * as fs from 'fs';

@Controller('')
export class AppController {
  private readonly appVersion: string;

  constructor() {
    const packageJson = fs.readFileSync('./package.json', 'utf8');
    this.appVersion = JSON.parse(packageJson).version;
  }

  @Get('')
  getObjects() {
    return "Hello DIAX!";
  }
  
  @Get('/version')
  getVersion() {
    return { version: this.appVersion };
  }
}
