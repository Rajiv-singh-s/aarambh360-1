import { apiDelete, apiGet, apiPatch, apiPost } from './apiClient';
import type {
  NotificationLogDto,
  NotificationPreferencesDto,
  RegisterDeviceTokenRequestDto,
  UpdateNotificationPreferencesRequestDto,
} from '@aarambh360/types';

export async function registerDeviceToken(payload: RegisterDeviceTokenRequestDto) {
  return apiPost('/notifications/register-token', payload);
}

export async function deactivateDeviceToken(payload: RegisterDeviceTokenRequestDto) {
  return apiDelete<{ ok: boolean }>('/notifications/register-token', payload);
}

export async function getNotificationPreferences(): Promise<NotificationPreferencesDto> {
  return apiGet<NotificationPreferencesDto>('/notifications/preferences');
}

export async function updateNotificationPreferences(
  payload: UpdateNotificationPreferencesRequestDto,
): Promise<NotificationPreferencesDto> {
  return apiPatch<NotificationPreferencesDto>('/notifications/preferences', payload);
}

export async function listNotificationHistory(limit = 20): Promise<NotificationLogDto[]> {
  return apiGet<NotificationLogDto[]>(`/notifications/history?limit=${limit}`);
}

export async function registerDevNotificationToken(platform: 'ios' | 'android' = 'android') {
  const token = `dev-token-${platform}-${Date.now()}`;
  await registerDeviceToken({
    token,
    platform,
  });
  return token;
}

