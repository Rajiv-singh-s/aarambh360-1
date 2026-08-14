import type { AuthMeResponseDto, LoginResponseDto } from '@aarambh360/types';
import { apiClient } from './apiClient';

export async function loginWithFirebaseToken(token: string): Promise<LoginResponseDto> {
  const response = await apiClient.post<LoginResponseDto>('/auth/login', undefined, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function fetchAuthProfile(): Promise<AuthMeResponseDto> {
  const response = await apiClient.get<AuthMeResponseDto>('/auth/me');
  return response.data;
}
