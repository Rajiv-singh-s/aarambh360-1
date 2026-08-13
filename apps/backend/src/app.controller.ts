import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { Public } from './common/decorators/public.decorator';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Public()
  @Get()
  getRoot(): { name: string; version: string; status: string } {
    return this.appService.getRoot();
  }

  @Public()
  @Get('health')
  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    database: 'ok' | 'unreachable' | 'not_configured';
    firebase: 'configured' | 'not_configured';
  }> {
    return this.appService.getHealth();
  }

  @Public()
  @Get('health/ready')
  async getReadiness(): Promise<{
    status: 'ready' | 'degraded';
    timestamp: string;
    checks: Record<string, 'ok' | 'down' | 'not_configured'>;
  }> {
    return this.appService.getReadiness();
  }
}
