import { Module } from '@nestjs/common';
import { EntitlementService, UsageService } from './entitlement.service';
import { PAYMENT_PROVIDER, createPaymentProvider } from './payment.provider';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsWebhookController } from './subscriptions.webhook.controller';
import { SubscriptionsService } from './subscriptions.service';

@Module({
  controllers: [SubscriptionsController, SubscriptionsWebhookController],
  providers: [
    SubscriptionsService,
    EntitlementService,
    UsageService,
    {
      provide: PAYMENT_PROVIDER,
      useFactory: () => createPaymentProvider(),
    },
  ],
  exports: [EntitlementService, UsageService, SubscriptionsService],
})
export class SubscriptionsModule {}
