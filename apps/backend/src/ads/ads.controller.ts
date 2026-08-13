import { Controller, Get } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdsService } from './ads.service';

@ApiTags('ads')
@ApiBearerAuth()
@Controller('ads')
export class AdsController {
  constructor(private readonly adsService: AdsService) {}

  @Get('config')
  @ApiOperation({ summary: 'Get ad configuration based on entitlements' })
  async getConfig(@CurrentUser() user: { id: string }) {
    return { data: await this.adsService.getConfig(user.id) };
  }
}
