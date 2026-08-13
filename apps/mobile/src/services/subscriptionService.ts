import { apiGet, apiPost } from './apiClient';
import type {
  CreateSubscriptionRequestDto,
  CreateSubscriptionResponseDto,
  PlanDto,
  SubscriptionSummaryDto,
  UserEntitlementsDto,
} from '@aarambh360/types';

export async function listPlans(): Promise<PlanDto[]> {
  return apiGet<PlanDto[]>('/subscriptions/plans');
}

export async function getMySubscription(): Promise<SubscriptionSummaryDto | null> {
  return apiGet<SubscriptionSummaryDto | null>('/subscriptions/me');
}

export async function getEntitlements(): Promise<UserEntitlementsDto> {
  return apiGet<UserEntitlementsDto>('/subscriptions/me/entitlements');
}

export async function createSubscription(
  payload: CreateSubscriptionRequestDto,
): Promise<CreateSubscriptionResponseDto> {
  return apiPost<CreateSubscriptionResponseDto>('/subscriptions/create', payload);
}

export async function cancelSubscription(): Promise<SubscriptionSummaryDto> {
  return apiPost<SubscriptionSummaryDto>('/subscriptions/cancel');
}
