import {
  BadRequestException,
  Controller,
  Headers,
  Post,
  Req,
} from '@nestjs/common';
import type { RawBodyRequest } from '@nestjs/common/interfaces';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Public } from '../common/decorators/public.decorator';
import { SubscriptionsService } from './subscriptions.service';

@ApiTags('subscriptions')
@Controller('subscriptions/webhook')
export class SubscriptionsWebhookController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Post()
  @Public()
  @ApiOperation({ summary: 'Razorpay subscription webhook' })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('x-razorpay-signature') signature?: string,
  ) {
    if (!req.rawBody || req.rawBody.length === 0) {
      throw new BadRequestException('Missing raw request body');
    }

    const rawBody = req.rawBody.toString('utf8');
    await this.subscriptionsService.handleWebhook(rawBody, signature);
    return { ok: true };
  }
}
