import { Body, Controller, Get, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CreateSubscriptionRequestDto } from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';
import { EntitlementService } from './entitlement.service';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@Controller('subscriptions')
export class SubscriptionsController {
  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly entitlementService: EntitlementService,
  ) {}

  @Get('plans')
  @Public()
  @ApiOperation({ summary: 'List available subscription plans' })
  async listPlans() {
    return { data: await this.subscriptionsService.listPlans() };
  }

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user subscription summary' })
  async getMySubscription(@CurrentUser() user: { id: string }) {
    return { data: await this.subscriptionsService.getMySubscription(user.id) };
  }

  @Get('me/entitlements')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user entitlements and usage' })
  async getEntitlements(@CurrentUser() user: { id: string }) {
    return { data: await this.entitlementService.getEntitlements(user.id) };
  }

  @Post('create')
  @ApiBearerAuth()
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  @ApiOperation({ summary: 'Create or upgrade subscription' })
  async createSubscription(
    @CurrentUser() user: { id: string },
    @Body() body: CreateSubscriptionRequestDto,
  ) {
    return { data: await this.subscriptionsService.createSubscription(user.id, body) };
  }

  @Post('cancel')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel active paid subscription' })
  async cancelSubscription(@CurrentUser() user: { id: string }) {
    return { data: await this.subscriptionsService.cancelSubscription(user.id) };
  }
}
