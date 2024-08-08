import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
const pjson = require('../package.json');

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  healthCheck(): any {
    return {
      name: pjson.name,
      version: pjson.version
    }
  }
}
