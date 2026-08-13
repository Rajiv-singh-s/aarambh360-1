import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { SubscriptionStatus } from '@prisma/client';
import type {
  FeatureUsageDto,
  UsageCheckResultDto,
  UserEntitlementsDto,
} from '@aarambh360/types';
import { FEATURE_CODES, PLAN_CODES, type FeatureCode } from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';

type PeriodWindow = { start: Date; end: Date };

@Injectable()
export class EntitlementService {
  private readonly logger = new Logger(EntitlementService.name);

  constructor(private readonly prisma: PrismaService) {}

  async ensureFreePlanEntitlements(userId: string): Promise<void> {
    const freePlan = await this.prisma.plan.findUnique({ where: { code: PLAN_CODES.FREE } });
    if (!freePlan) {
      return;
    }

    const active = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      },
    });
    if (active) {
      return;
    }

    await this.prisma.subscription.create({
      data: {
        userId,
        planId: freePlan.id,
        status: SubscriptionStatus.ACTIVE,
        billingProvider: 'MANUAL',
      },
    });
    await this.syncEntitlementsFromActiveSubscription(userId);
  }

  async syncEntitlementsFromActiveSubscription(userId: string): Promise<void> {
    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      },
      include: {
        plan: {
          include: {
            features: { include: { feature: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!subscription) {
      await this.ensureFreePlanEntitlements(userId);
      return;
    }

    for (const planFeature of subscription.plan.features) {
      await this.prisma.userEntitlement.upsert({
        where: {
          userId_featureId: {
            userId,
            featureId: planFeature.featureId,
          },
        },
        create: {
          userId,
          featureId: planFeature.featureId,
          quotaRemaining: planFeature.unlimited ? null : planFeature.quota,
          unlimited: planFeature.unlimited,
          expiresAt: subscription.expiresAt,
        },
        update: {
          quotaRemaining: planFeature.unlimited ? null : planFeature.quota,
          unlimited: planFeature.unlimited,
          expiresAt: subscription.expiresAt,
        },
      });
    }
  }

  async getEntitlements(userId: string): Promise<UserEntitlementsDto> {
    await this.ensureFreePlanEntitlements(userId);
    await this.syncEntitlementsFromActiveSubscription(userId);

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      },
      include: {
        plan: {
          include: {
            features: { include: { feature: true } },
          },
        },
      },
      orderBy: { startedAt: 'desc' },
    });

    if (!subscription) {
      throw new NotFoundException('Active subscription not found');
    }

    const features: FeatureUsageDto[] = [];
    for (const planFeature of subscription.plan.features) {
      const usage = await this.getUsageCount(userId, planFeature.feature.code, subscription.plan.billingPeriod);
      const limit = planFeature.unlimited ? null : planFeature.quota;
      const remaining =
        planFeature.unlimited || limit == null ? null : Math.max(0, limit - usage);

      features.push({
        code: planFeature.feature.code as FeatureCode,
        used: usage,
        limit,
        unlimited: planFeature.unlimited,
        remaining,
      });
    }

    const removeAds = await this.hasEntitlement(userId, FEATURE_CODES.REMOVE_ADS);

    return {
      planCode: subscription.plan.code as UserEntitlementsDto['planCode'],
      planName: subscription.plan.name,
      subscriptionStatus: subscription.status,
      expiresAt: subscription.expiresAt?.toISOString() ?? null,
      features,
      removeAds,
    };
  }

  async hasEntitlement(userId: string, featureCode: FeatureCode): Promise<boolean> {
    const check = await this.checkUsage(userId, featureCode);
    return check.allowed;
  }

  async checkUsage(userId: string, featureCode: FeatureCode): Promise<UsageCheckResultDto> {
    await this.ensureFreePlanEntitlements(userId);

    const feature = await this.prisma.feature.findUnique({ where: { code: featureCode } });
    if (!feature) {
      return {
        allowed: false,
        featureCode,
        used: 0,
        limit: 0,
        unlimited: false,
        remaining: 0,
        reason: 'Feature not configured',
      };
    }

    const entitlement = await this.prisma.userEntitlement.findUnique({
      where: { userId_featureId: { userId, featureId: feature.id } },
    });

    if (!entitlement) {
      return {
        allowed: false,
        featureCode,
        used: 0,
        limit: 0,
        unlimited: false,
        remaining: 0,
        reason: 'Feature not included in plan',
      };
    }

    if (entitlement.expiresAt && entitlement.expiresAt < new Date()) {
      return {
        allowed: false,
        featureCode,
        used: 0,
        limit: 0,
        unlimited: false,
        remaining: 0,
        reason: 'Entitlement expired',
      };
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      },
      include: { plan: true },
      orderBy: { startedAt: 'desc' },
    });
    const billingPeriod = subscription?.plan.billingPeriod ?? 'weekly';

    if (entitlement.unlimited) {
      return {
        allowed: true,
        featureCode,
        used: 0,
        limit: null,
        unlimited: true,
        remaining: null,
      };
    }

    const used = await this.getUsageCount(userId, featureCode, billingPeriod);
    const limit = entitlement.quotaRemaining ?? 0;
    const remaining = Math.max(0, limit - used);

    return {
      allowed: remaining > 0,
      featureCode,
      used,
      limit,
      unlimited: false,
      remaining,
      reason: remaining > 0 ? undefined : 'Quota exceeded',
    };
  }

  async consumeUsage(userId: string, featureCode: FeatureCode): Promise<UsageCheckResultDto> {
    const check = await this.checkUsage(userId, featureCode);
    if (!check.allowed || check.unlimited) {
      return check;
    }

    const feature = await this.prisma.feature.findUnique({ where: { code: featureCode } });
    if (!feature) {
      throw new NotFoundException('Feature not found');
    }

    const subscription = await this.prisma.subscription.findFirst({
      where: {
        userId,
        status: { in: [SubscriptionStatus.ACTIVE, SubscriptionStatus.TRIAL, SubscriptionStatus.PAST_DUE] },
      },
      include: { plan: true },
      orderBy: { startedAt: 'desc' },
    });
    const window = this.getPeriodWindow(subscription?.plan.billingPeriod ?? 'weekly');

    await this.prisma.usageRecord.upsert({
      where: {
        userId_featureId_periodStart: {
          userId,
          featureId: feature.id,
          periodStart: window.start,
        },
      },
      create: {
        userId,
        featureId: feature.id,
        count: 1,
        periodStart: window.start,
        periodEnd: window.end,
      },
      update: {
        count: { increment: 1 },
      },
    });

    return this.checkUsage(userId, featureCode);
  }

  private async getUsageCount(userId: string, featureCode: string, billingPeriod: string): Promise<number> {
    const feature = await this.prisma.feature.findUnique({ where: { code: featureCode } });
    if (!feature) {
      return 0;
    }

    const window = this.getPeriodWindow(billingPeriod);
    const record = await this.prisma.usageRecord.findUnique({
      where: {
        userId_featureId_periodStart: {
          userId,
          featureId: feature.id,
          periodStart: window.start,
        },
      },
    });
    return record?.count ?? 0;
  }

  private getPeriodWindow(billingPeriod: string): PeriodWindow {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    if (billingPeriod === 'monthly') {
      start.setDate(1);
      const end = new Date(start);
      end.setMonth(end.getMonth() + 1);
      end.setDate(0);
      return { start, end };
    }

    if (billingPeriod === 'yearly') {
      start.setMonth(0, 1);
      const end = new Date(start);
      end.setFullYear(end.getFullYear() + 1);
      end.setDate(0);
      return { start, end };
    }

    const day = start.getDay();
    const diff = day === 0 ? 6 : day - 1;
    start.setDate(start.getDate() - diff);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    return { start, end };
  }
}

@Injectable()
export class UsageService {
  constructor(private readonly entitlementService: EntitlementService) {}

  check(userId: string, featureCode: FeatureCode) {
    return this.entitlementService.checkUsage(userId, featureCode);
  }

  consume(userId: string, featureCode: FeatureCode) {
    return this.entitlementService.consumeUsage(userId, featureCode);
  }
}
