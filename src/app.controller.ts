import { AppService } from './app.service';
import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}
  @Get('/i18n')
  findI18n(): string {
    return this.appService.getI18n();
  }
}
