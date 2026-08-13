import { Body, Controller, Delete, Get, Patch, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  RegisterDeviceTokenRequestDto,
  UpdateNotificationPreferencesRequestDto,
} from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { NotificationsService } from './notifications.service';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('register-token')
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @ApiOperation({ summary: 'Register FCM device token for push notifications' })
  async registerToken(
    @CurrentUser() user: { id: string },
    @Body() body: RegisterDeviceTokenRequestDto,
  ) {
    return { data: await this.notificationsService.registerToken(user.id, body) };
  }

  @Delete('register-token')
  @ApiOperation({ summary: 'Deactivate a device token on logout' })
  async deactivateToken(
    @CurrentUser() user: { id: string },
    @Body() body: RegisterDeviceTokenRequestDto,
  ) {
    await this.notificationsService.deactivateToken(user.id, body.token);
    return { data: { ok: true } };
  }

  @Get('preferences')
  @ApiOperation({ summary: 'Get notification preferences' })
  async getPreferences(@CurrentUser() user: { id: string }) {
    return { data: await this.notificationsService.getPreferences(user.id) };
  }

  @Patch('preferences')
  @ApiOperation({ summary: 'Update notification preferences' })
  async updatePreferences(
    @CurrentUser() user: { id: string },
    @Body() body: UpdateNotificationPreferencesRequestDto,
  ) {
    return { data: await this.notificationsService.updatePreferences(user.id, body) };
  }

  @Get('history')
  @ApiOperation({ summary: 'List recent notification delivery logs' })
  async listHistory(@CurrentUser() user: { id: string }, @Query('limit') limit?: string) {
    const parsed = Math.min(Math.max(limit ? Number(limit) : 20, 1), 50);
    return { data: await this.notificationsService.listHistory(user.id, parsed) };
  }
}
