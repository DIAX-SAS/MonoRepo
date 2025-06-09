import {
  Controller,
  Get,
} from '@nestjs/common';
import * as fs from 'fs';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('App')
@Controller('')
export class AppController {
  private readonly appVersion: string;

  constructor() {
    const packageJson = fs.readFileSync('./package.json', 'utf8');
    this.appVersion = JSON.parse(packageJson).version;
  }

  @Get('')
  @ApiOperation({ summary: 'Welcome endpoint' })
  @ApiResponse({
    status: 200,
    description: 'Returns a welcome message from Diax',
    schema: {
      example: 'Hello DIAX!',
    },
  })
  getObjects(): string {
    return 'Hello DIAX!';
  }

  @Get('/version')
  @ApiOperation({ summary: 'Get API version' })
  @ApiResponse({
    status: 200,
    description: 'Returns the current API version from package.json',
    schema: {
      example: { version: '1.0.0' },
    },
  })
  getVersion(): { version: string } {
    return { version: this.appVersion };
  }
}
