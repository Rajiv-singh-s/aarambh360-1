export const FEATURE_CODES = {
  MAINS_EVAL: 'MAINS_EVAL',
  REMOVE_ADS: 'REMOVE_ADS',
} as const;

export type FeatureCode = (typeof FEATURE_CODES)[keyof typeof FEATURE_CODES];

export const PLAN_CODES = {
  FREE: 'FREE',
  PLUS: 'PLUS',
  PREMIUM: 'PREMIUM',
} as const;

export type PlanCode = (typeof PLAN_CODES)[keyof typeof PLAN_CODES];

export interface PlanFeatureDto {
  code: FeatureCode;
  name: string;
  quota: number | null;
  unlimited: boolean;
}

export interface PlanDto {
  id: string;
  code: PlanCode;
  name: string;
  description: string | null;
  priceInPaise: number;
  billingPeriod: string;
  features: PlanFeatureDto[];
}

export interface FeatureUsageDto {
  code: FeatureCode;
  used: number;
  limit: number | null;
  unlimited: boolean;
  remaining: number | null;
}

export interface UserEntitlementsDto {
  planCode: PlanCode;
  planName: string;
  subscriptionStatus: string;
  expiresAt: string | null;
  features: FeatureUsageDto[];
  removeAds: boolean;
}

export interface CreateSubscriptionRequestDto {
  planCode: PlanCode;
}

export interface CreateSubscriptionResponseDto {
  subscriptionId: string;
  planCode: PlanCode;
  status: string;
  checkoutUrl: string | null;
  razorpayKeyId: string | null;
  providerSubscriptionId: string | null;
  message?: string;
}

export interface SubscriptionSummaryDto {
  id: string;
  planCode: PlanCode;
  planName: string;
  status: string;
  startedAt: string;
  expiresAt: string | null;
  cancelledAt: string | null;
}

export interface UsageCheckResultDto {
  allowed: boolean;
  featureCode: FeatureCode;
  used: number;
  limit: number | null;
  unlimited: boolean;
  remaining: number | null;
  reason?: string;
}
