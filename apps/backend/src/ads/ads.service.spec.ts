import { AdsService } from './ads.service';
import { EntitlementService } from '../subscriptions/entitlement.service';

describe('AdsService', () => {
  it('disables ads for premium users with REMOVE_ADS entitlement', async () => {
    const entitlementService = {
      getEntitlements: jest.fn().mockResolvedValue({
        removeAds: true,
        planCode: 'PREMIUM',
      }),
    } as unknown as EntitlementService;

    const service = new AdsService(entitlementService);
    const config = await service.getConfig('user-1');

    expect(config.adsEnabled).toBe(false);
    expect(config.removeAds).toBe(true);
  });

  it('enables ads for free users', async () => {
    const entitlementService = {
      getEntitlements: jest.fn().mockResolvedValue({
        removeAds: false,
        planCode: 'FREE',
      }),
    } as unknown as EntitlementService;

    const service = new AdsService(entitlementService);
    const config = await service.getConfig('user-1');

    expect(config.adsEnabled).toBe(true);
    expect(config.removeAds).toBe(false);
  });
});
