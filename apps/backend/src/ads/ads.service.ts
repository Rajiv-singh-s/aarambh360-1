import { Injectable } from '@nestjs/common';
import type { AdConfigDto } from '@aarambh360/types';
import { EntitlementService } from '../subscriptions/entitlement.service';

@Injectable()
export class AdsService {
  constructor(private readonly entitlementService: EntitlementService) {}

  async getConfig(userId: string): Promise<AdConfigDto> {
    const entitlements = await this.entitlementService.getEntitlements(userId);
    const testMode = (process.env.ADMOB_TEST_MODE ?? 'true') === 'true';
    const bannerUnitId =
      process.env.ADMOB_BANNER_UNIT_ID ??
      (testMode ? 'ca-app-pub-3940256099942544/6300978111' : null);
    const interstitialUnitId =
      process.env.ADMOB_INTERSTITIAL_UNIT_ID ??
      (testMode ? 'ca-app-pub-3940256099942544/1033173712' : null);

    const removeAds = entitlements.removeAds;
    const adsEnabled = !removeAds && Boolean(bannerUnitId || interstitialUnitId);

    return {
      adsEnabled,
      removeAds,
      provider: adsEnabled ? 'admob' : 'none',
      bannerUnitId: adsEnabled ? bannerUnitId : null,
      interstitialUnitId: adsEnabled ? interstitialUnitId : null,
      testMode,
      placements: [
        {
          id: 'home_banner',
          name: 'Home Banner',
          enabled: adsEnabled,
          format: 'banner',
        },
        {
          id: 'quiz_interstitial',
          name: 'Quiz Interstitial',
          enabled: adsEnabled && Boolean(interstitialUnitId),
          format: 'interstitial',
        },
      ],
    };
  }
}
