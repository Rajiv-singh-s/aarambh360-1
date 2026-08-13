import { Injectable, Logger } from '@nestjs/common';
import { BillingProvider, SubscriptionStatus } from '@prisma/client';
import type { CreateSubscriptionResponseDto } from '@aarambh360/types';
import { PLAN_CODES, type PlanCode } from '@aarambh360/types';

export interface RazorpayCreateResult {
  providerSubscriptionId: string;
  checkoutUrl: string | null;
  keyId: string | null;
}

export interface PaymentProvider {
  readonly name: string;
  createSubscription(input: {
    userId: string;
    planCode: PlanCode;
    planName: string;
    amountInPaise: number;
    billingPeriod: string;
  }): Promise<RazorpayCreateResult>;
  verifyWebhookSignature(body: string, signature: string): boolean;
}

export const PAYMENT_PROVIDER = Symbol('PAYMENT_PROVIDER');

@Injectable()
export class DevPaymentProvider implements PaymentProvider {
  readonly name = 'dev-manual';

  private readonly logger = new Logger(DevPaymentProvider.name);

  async createSubscription(input: {
    userId: string;
    planCode: PlanCode;
    planName: string;
  }): Promise<RazorpayCreateResult> {
    this.logger.debug(`Dev subscription for ${input.userId} → ${input.planCode}`);
    return {
      providerSubscriptionId: `dev_sub_${input.userId}_${input.planCode}_${Date.now()}`,
      checkoutUrl: null,
      keyId: null,
    };
  }

  verifyWebhookSignature(): boolean {
    return true;
  }
}

@Injectable()
export class RazorpayPaymentProvider implements PaymentProvider {
  readonly name = 'razorpay';

  private readonly logger = new Logger(RazorpayPaymentProvider.name);
  private readonly keyId = process.env.RAZORPAY_KEY_ID;
  private readonly keySecret = process.env.RAZORPAY_KEY_SECRET;
  private readonly webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

  async createSubscription(input: {
    userId: string;
    planCode: PlanCode;
    planName: string;
    amountInPaise: number;
    billingPeriod: string;
  }): Promise<RazorpayCreateResult> {
    if (!this.keyId || !this.keySecret) {
      throw new Error('Razorpay is not configured');
    }

    const auth = Buffer.from(`${this.keyId}:${this.keySecret}`).toString('base64');
    const planId = process.env[`RAZORPAY_PLAN_${input.planCode}`];
    if (!planId) {
      throw new Error(`Razorpay plan not configured for ${input.planCode}`);
    }

    const response = await fetch('https://api.razorpay.com/v1/subscriptions', {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        plan_id: planId,
        total_count: input.billingPeriod === 'yearly' ? 1 : 12,
        customer_notify: 1,
        notes: { userId: input.userId, planCode: input.planCode },
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Razorpay subscription create failed: ${body}`);
      throw new Error('Payment provider request failed');
    }

    const payload = (await response.json()) as { id: string; short_url?: string };
    return {
      providerSubscriptionId: payload.id,
      checkoutUrl: payload.short_url ?? null,
      keyId: this.keyId,
    };
  }

  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.webhookSecret) {
      return false;
    }
    const crypto = require('crypto') as typeof import('crypto');
    const expected = crypto.createHmac('sha256', this.webhookSecret).update(body).digest('hex');
    if (expected.length !== signature.length) {
      return false;
    }
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  }
}

export function createPaymentProvider(): PaymentProvider {
  if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
    return new RazorpayPaymentProvider();
  }
  return new DevPaymentProvider();
}

export function getDefaultPlanCode(): PlanCode {
  return PLAN_CODES.FREE;
}

export function mapRazorpayStatus(event: string): SubscriptionStatus {
  switch (event) {
    case 'subscription.activated':
    case 'subscription.charged':
      return SubscriptionStatus.ACTIVE;
    case 'subscription.pending':
      return SubscriptionStatus.TRIAL;
    case 'subscription.halted':
      return SubscriptionStatus.PAST_DUE;
    case 'subscription.cancelled':
      return SubscriptionStatus.CANCELLED;
    case 'subscription.completed':
      return SubscriptionStatus.EXPIRED;
    default:
      return SubscriptionStatus.ACTIVE;
  }
}
