# Ads Architecture (Step 17)

## Overview

Mobile ad layer gated exclusively by `EntitlementService` — never checks subscription tables directly.

## Flow

```
GET /subscriptions/me/entitlements → removeAds
GET /ads/config → adsEnabled, unit IDs, placements
Mobile AdBanner → hidden when removeAds=true
```

## Backend

- `AdsModule` — `GET /ads/config`
- Uses `EntitlementService.getEntitlements()` for `removeAds`

## Mobile

- `adsService.ts` — fetch/cache config
- `AdBanner.tsx` — placeholder banner for free users (AdMob test unit IDs in dev)
- `MainHomeScreen` — home banner placement

## Environment

```env
ADMOB_TEST_MODE=true
ADMOB_BANNER_UNIT_ID=
ADMOB_INTERSTITIAL_UNIT_ID=
```

## Limitations

- Native AdMob SDK integration deferred; placeholder UI respects entitlements
- Interstitial placements configured but not rendered in MVP
