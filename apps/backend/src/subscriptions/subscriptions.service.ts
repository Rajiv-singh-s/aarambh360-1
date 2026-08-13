import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { BillingProvider, SubscriptionStatus } from '@prisma/client';
import type {
  CreateSubscriptionRequestDto,
  CreateSubscriptionResponseDto,
  PlanDto,
  SubscriptionSummaryDto,
} from '@aarambh360/types';
import { PLAN_CODES } from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';
import { EntitlementService } from './entitlement.service';
import {
  PAYMENT_PROVIDER,
  type PaymentProvider,
  mapRazorpayStatus,
} from './payment.provider';
import { Inject } from '@nestjs/common';

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly entitlementService: EntitlementService,
    @Inject(PAYMENT_PROVIDER) private readonly paymentProvider: PaymentProvider,
  ) {}

  async listPlans(): Promise<PlanDto[]> {
    const plans = await this.prisma.plan.findMany({
      where: { isActive: true },
      include: {
        features: { include: { feature: true } },
      },
      orderBy: { sortOrder: 'asc' },
    });

    return plans.map((plan) => ({
      id: plan.id,
      code: plan.code as PlanDto['code'],
      name: plan.name,
      description: plan.description,
      priceInPaise: plan.priceInPaise,
      billingPeriod: plan.billingPeriod,
      features: plan.features.map((entry) => ({
        code: entry.feature.code as PlanDto['features'][number]['code'],
        name: entry.feature.name,
        quota: entry.quota,
        unlimited: entry.unlimited,
      })),
    }));
  }

  async getMySubscription(userId: string): Promise<SubscriptionSummaryDto | null> {
    await this.entitlementService.ensureFreePlanEntitlements(userId);
    const subscription = await this.prisma.subscription.findFirst({
      where: { userId },
      include: { plan: true },
      orderBy: { startedAt: 'desc' },
    });
    if (!subscription) {
      return null;
    }

    return {
      id: subscription.id,
      planCode: subscription.plan.code as SubscriptionSummaryDto['planCode'],
      planName: subscription.plan.name,
      status: subscription.status,
      startedAt: subscription.startedAt.toISOString(),
      expiresAt: subscription.expiresAt?.toISOString() ?? null,
      cancelledAt: subscription.cancelledAt?.toISOString() ?? null,
    };
  }

  async createSubscription(
    userId: string,
    payload: CreateSubscriptionRequestDto,
  ): Promise<CreateSubscriptionResponseDto> {
    if (payload.planCode === PLAN_CODES.FREE) {
      throw new BadRequestException('Free plan is assigned automatically');
    }

    const plan = await this.prisma.plan.findFirst({
      where: { code: payload.planCode, isActive: true },
    });
    if (!plan) {
      throw new NotFoundException('Plan not found');
    }

    // Idempotency check: return identical active subscription created within last 60 seconds
    const sixtySecondsAgo = new Date(Date.now() - 60000);
    const existingSubscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        plan: { code: payload.planCode },
        status: SubscriptionStatus.ACTIVE,
        createdAt: { gte: sixtySecondsAgo },
      },
      include: { plan: true },
    });

    if (existingSubscription) {
      const isDev = this.paymentProvider.name === 'dev-manual';
      return {
        subscriptionId: existingSubscription.id,
        planCode: payload.planCode,
        status: existingSubscription.status,
        providerSubscriptionId: existingSubscription.providerSubId,
        checkoutUrl: null,
        razorpayKeyId: null,
        message: isDev ? 'Dev mode: subscription activated without payment' : undefined,
      };
    }

    await this.prisma.subscription.updateMany({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
    });

    const providerResult = await this.paymentProvider.createSubscription({
      userId,
      planCode: payload.planCode,
      planName: plan.name,
      amountInPaise: plan.priceInPaise,
      billingPeriod: plan.billingPeriod,
    });

    const isDev = this.paymentProvider.name === 'dev-manual';
    const subscription = await this.prisma.subscription.create({
      data: {
        userId,
        planId: plan.id,
        status: isDev ? SubscriptionStatus.ACTIVE : SubscriptionStatus.TRIAL,
        billingProvider: isDev ? BillingProvider.MANUAL : BillingProvider.RAZORPAY,
        providerSubId: providerResult.providerSubscriptionId,
        expiresAt: this.calculateExpiry(plan.billingPeriod),
      },
    });

    await this.entitlementService.syncEntitlementsFromActiveSubscription(userId);

    return {
      subscriptionId: subscription.id,
      planCode: payload.planCode,
      status: subscription.status,
      checkoutUrl: providerResult.checkoutUrl,
      razorpayKeyId: providerResult.keyId,
      providerSubscriptionId: providerResult.providerSubscriptionId,
      message: isDev ? 'Dev mode: subscription activated without payment' : undefined,
    };
  }

  async cancelSubscription(userId: string): Promise<SubscriptionSummaryDto> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      },
      include: { plan: true },
      orderBy: { startedAt: 'desc' },
    });
    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    if (subscription.plan.code === PLAN_CODES.FREE) {
      throw new BadRequestException('Free plan cannot be cancelled');
    }

    const updated = await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status: SubscriptionStatus.CANCELLED,
        cancelledAt: new Date(),
      },
      include: { plan: true },
    });

    await this.entitlementService.ensureFreePlanEntitlements(userId);

    return {
      id: updated.id,
      planCode: updated.plan.code as SubscriptionSummaryDto['planCode'],
      planName: updated.plan.name,
      status: updated.status,
      startedAt: updated.startedAt.toISOString(),
      expiresAt: updated.expiresAt?.toISOString() ?? null,
      cancelledAt: updated.cancelledAt?.toISOString() ?? null,
    };
  }

  // Webhook signature verification requires the exact raw request bytes (not re-serialized JSON).
  async handleWebhook(rawBody: string, signature: string | undefined): Promise<void> {
    if (!signature || !this.paymentProvider.verifyWebhookSignature(rawBody, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    const payload = JSON.parse(rawBody) as {
      event?: string;
      payload?: { subscription?: { entity?: { id?: string; notes?: Record<string, string> } } };
    };
    const event = payload.event ?? '';
    const providerSubId = payload.payload?.subscription?.entity?.id;
    if (!providerSubId) {
      this.logger.warn('Webhook missing subscription id');
      return;
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: { providerSubId },
      include: { plan: true },
    });
    if (!subscription) {
      this.logger.warn(`Webhook subscription not found: ${providerSubId}`);
      return;
    }

    const status = mapRazorpayStatus(event);
    await this.prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        status,
        cancelledAt: status === SubscriptionStatus.CANCELLED ? new Date() : undefined,
        expiresAt:
          status === SubscriptionStatus.EXPIRED
            ? new Date()
            : this.calculateExpiry(subscription.plan.billingPeriod),
      },
    });

    if (status === SubscriptionStatus.ACTIVE) {
      await this.entitlementService.syncEntitlementsFromActiveSubscription(subscription.userId);
    } else if (
      status === SubscriptionStatus.CANCELLED ||
      status === SubscriptionStatus.EXPIRED
    ) {
      await this.entitlementService.ensureFreePlanEntitlements(subscription.userId);
    }
  }

  private calculateExpiry(billingPeriod: string): Date {
    const expires = new Date();
    if (billingPeriod === 'monthly') {
      expires.setMonth(expires.getMonth() + 1);
    } else if (billingPeriod === 'yearly') {
      expires.setFullYear(expires.getFullYear() + 1);
    } else {
      expires.setDate(expires.getDate() + 7);
    }
    return expires;
  }
}
