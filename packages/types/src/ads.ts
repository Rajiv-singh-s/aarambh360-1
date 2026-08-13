export interface AdPlacementDto {
  id: string;
  name: string;
  enabled: boolean;
  format: 'banner' | 'interstitial';
}

export interface AdConfigDto {
  adsEnabled: boolean;
  removeAds: boolean;
  provider: 'admob' | 'none';
  bannerUnitId: string | null;
  interstitialUnitId: string | null;
  testMode: boolean;
  placements: AdPlacementDto[];
}
