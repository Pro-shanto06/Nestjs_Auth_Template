import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  nestjs() {
    return { message: 'Welcome to NestJs' };
  }
}
