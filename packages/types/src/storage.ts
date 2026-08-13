export type StoragePurpose = 'MAINS_ANSWER' | 'AVATAR' | 'LESSON_ASSET' | 'NCERT_PDF';

export interface UploadUrlRequestDto {
  purpose: StoragePurpose;
  contentType: string;
  fileName?: string;
}

export interface UploadUrlResponseDto {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresInSeconds: number;
}

export interface ConfirmUploadRequestDto {
  key: string;
  publicUrl: string;
  purpose: StoragePurpose;
  targetId?: string;
}

export interface ConfirmUploadResponseDto {
  key: string;
  publicUrl: string;
  confirmed: boolean;
}
