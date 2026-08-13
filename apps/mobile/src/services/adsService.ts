import { apiGet } from './apiClient';
import type { AdConfigDto } from '@aarambh360/types';

let cachedConfig: AdConfigDto | null = null;

export async function getAdConfig(force = false): Promise<AdConfigDto> {
  if (cachedConfig && !force) {
    return cachedConfig;
  }
  cachedConfig = await apiGet<AdConfigDto>('/ads/config');
  return cachedConfig;
}

export function clearAdConfigCache() {
  cachedConfig = null;
}
