import type { AuthMeResponseDto, UpdateProfileRequestDto } from '@aarambh360/types';
import { apiClient } from './apiClient';

export async function updateProfile(payload: UpdateProfileRequestDto): Promise<AuthMeResponseDto> {
  const response = await apiClient.patch<AuthMeResponseDto>('/users/me', payload);
  return response.data;
}
