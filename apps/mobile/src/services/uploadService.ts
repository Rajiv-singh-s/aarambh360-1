import type { ConfirmUploadResponseDto, UploadUrlResponseDto } from '@aarambh360/types';
import { apiPost } from './apiClient';

export async function requestUploadUrl(payload: {
  purpose: 'MAINS_ANSWER' | 'AVATAR' | 'LESSON_ASSET' | 'NCERT_PDF';
  contentType: string;
  fileName?: string;
}): Promise<UploadUrlResponseDto> {
  return apiPost<UploadUrlResponseDto>('/storage/upload-url', payload);
}

export async function confirmUpload(payload: {
  key: string;
  publicUrl: string;
  purpose: 'MAINS_ANSWER' | 'AVATAR' | 'LESSON_ASSET' | 'NCERT_PDF';
  targetId?: string;
}): Promise<ConfirmUploadResponseDto> {
  return apiPost<ConfirmUploadResponseDto>('/storage/confirm', payload);
}

export async function uploadBinaryToPresignedUrl(
  uploadUrl: string,
  uri: string,
  contentType: string,
): Promise<void> {
  const response = await fetch(uri);
  const blob = await response.blob();
  const putResponse = await fetch(uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: blob,
  });
  if (!putResponse.ok) {
    throw new Error(`Upload failed with status ${putResponse.status}`);
  }
}
