import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { TrackLearningEventRequestDto } from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AnalyticsService } from './analytics.service';

@ApiTags('analytics')
@ApiBearerAuth()
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('events')
  @Throttle({ default: { limit: 60, ttl: 60000 } })
  @ApiOperation({ summary: 'Track a learning activity event' })
  async trackEvent(
    @CurrentUser() user: { id: string },
    @Body() body: TrackLearningEventRequestDto,
  ) {
    return { data: await this.analyticsService.trackEvent(user.id, body) };
  }

  @Get('me/profile')
  @ApiOperation({ summary: 'Get learning analytics profile with weak/strong areas' })
  async getProfile(@CurrentUser() user: { id: string }) {
    return { data: await this.analyticsService.getProfile(user.id) };
  }

  @Get('me/recommendations')
  @ApiOperation({ summary: 'Get personalized study recommendations' })
  async getRecommendations(@CurrentUser() user: { id: string }) {
    return { data: await this.analyticsService.getRecommendations(user.id) };
  }

  @Get('me/events')
  @ApiOperation({ summary: 'List recent learning events' })
  async getRecentEvents(@CurrentUser() user: { id: string }, @Query('limit') limit?: string) {
    const safeLimit = Math.min(Math.max(limit ? Number(limit) : 20, 1), 100);
    return { data: await this.analyticsService.getRecentEvents(user.id, safeLimit) };
  }
}
