# Subscriptions Architecture (Step 16)

## Overview

Server-enforced freemium model with plans, entitlements, usage tracking, and Razorpay-ready payment abstraction.

## Canonical contract

`EntitlementService` is the single source of truth:

- `getEntitlements(userId)`
- `hasEntitlement(userId, featureCode)`
- `checkUsage(userId, featureCode)`
- `consumeUsage(userId, featureCode)`

## Plans (seeded)

| Plan | Mains Eval | Ads |
|------|------------|-----|
| FREE | 1/week | Yes |
| PLUS | 5/month | Yes |
| PREMIUM | Unlimited | No (`REMOVE_ADS`) |

## Feature codes

- `MAINS_EVAL` — AI evaluation quota
- `REMOVE_ADS` — ad-free entitlement

## APIs

| Method | Path | Description |
|--------|------|-------------|
| GET | `/subscriptions/plans` | Public plan catalog |
| GET | `/subscriptions/me` | Current subscription |
| GET | `/subscriptions/me/entitlements` | Entitlements + usage |
| POST | `/subscriptions/create` | Upgrade (dev mode activates instantly) |
| POST | `/subscriptions/cancel` | Cancel paid plan → Free |
| POST | `/subscriptions/webhook` | Razorpay webhook (signature verified) |

## Step 13 integration

`EvaluationService` checks `MAINS_EVAL` quota before evaluation and consumes usage on success. Hourly abuse limit (10/hour) retained as secondary guard.

## Security

- Never trusts client `isPremium` flags
- Webhook signature verification when `RAZORPAY_WEBHOOK_SECRET` set
- Dev provider only for local/test without Razorpay keys

## Seed command

```bash
pnpm --filter @aarambh360/backend seed:subscriptions
```
