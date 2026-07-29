import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // Unauthenticated so an uptime monitor can ping it. Render free instances
  // sleep after ~15 minutes idle and the next visitor pays the cold start;
  // a scheduled ping here keeps the service warm.
  @Public()
  @Get('health')
  getHealth() {
    return { status: 'ok', uptime: Math.round(process.uptime()) };
  }
}
