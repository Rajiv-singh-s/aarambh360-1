import { FEATURE_CODES, PLAN_CODES } from '@aarambh360/types';
import { EntitlementService } from './entitlement.service';
import { PrismaService } from '../prisma/prisma.service';

describe('EntitlementService', () => {
  let service: EntitlementService;
  let prisma: Record<string, any>;

  beforeEach(() => {
    prisma = {
      plan: { findUnique: jest.fn() },
      subscription: { findFirst: jest.fn(), create: jest.fn(), updateMany: jest.fn() },
      feature: { findUnique: jest.fn() },
      userEntitlement: { upsert: jest.fn(), findUnique: jest.fn() },
      usageRecord: { findUnique: jest.fn(), upsert: jest.fn() },
    };
    service = new EntitlementService(prisma as unknown as PrismaService);
  });

  it('denies feature when entitlement is missing', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      plan: { code: PLAN_CODES.FREE, billingPeriod: 'weekly', features: [] },
      expiresAt: null,
    });
    prisma.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: FEATURE_CODES.MAINS_EVAL });
    prisma.userEntitlement.findUnique.mockResolvedValue(null);

    const result = await service.checkUsage('user-1', FEATURE_CODES.MAINS_EVAL);
    expect(result.allowed).toBe(false);
  });

  it('allows unlimited premium evaluation', async () => {
    prisma.subscription.findFirst.mockResolvedValue({
      plan: { code: PLAN_CODES.PREMIUM, billingPeriod: 'monthly', features: [] },
      expiresAt: null,
    });
    prisma.feature.findUnique.mockResolvedValue({ id: 'feat-1', code: FEATURE_CODES.MAINS_EVAL });
    prisma.userEntitlement.findUnique.mockResolvedValue({
      unlimited: true,
      quotaRemaining: null,
      expiresAt: null,
    });

    const result = await service.checkUsage('user-1', FEATURE_CODES.MAINS_EVAL);
    expect(result.allowed).toBe(true);
    expect(result.unlimited).toBe(true);
  });
});
