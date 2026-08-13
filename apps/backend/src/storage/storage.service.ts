import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { randomUUID } from 'crypto';
import type {
  ConfirmUploadRequestDto,
  ConfirmUploadResponseDto,
  UploadUrlRequestDto,
  UploadUrlResponseDto,
} from '@aarambh360/types';

const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_PDF_BYTES = 50 * 1024 * 1024;
const UPLOAD_TTL_SECONDS = 900;

@Injectable()
export class StorageService {
  private readonly bucket = process.env.R2_BUCKET ?? 'aarambh360-assets';
  private readonly publicBaseUrl =
    process.env.R2_PUBLIC_BASE_URL ?? 'https://assets.aarambh360.local';
  private readonly endpoint = process.env.R2_ENDPOINT;
  private readonly accessKeyId = process.env.R2_ACCESS_KEY_ID;
  private readonly secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  private readonly enabled = Boolean(
    this.endpoint && this.accessKeyId && this.secretAccessKey && this.bucket,
  );
  private readonly client = this.enabled
    ? new S3Client({
        region: 'auto',
        endpoint: this.endpoint,
        credentials: {
          accessKeyId: this.accessKeyId!,
          secretAccessKey: this.secretAccessKey!,
        },
      })
    : null;

  async generateUploadUrl(
    userId: string,
    payload: UploadUrlRequestDto,
  ): Promise<UploadUrlResponseDto> {
    this.validateContentType(payload.contentType, payload.purpose, (payload as any).fileSize);

    const ext = payload.fileName?.split('.').pop() ?? this.defaultExtension(payload.contentType);
    const key = `${payload.purpose.toLowerCase()}/${userId}/${randomUUID()}.${ext}`;
    const publicUrl = `${this.publicBaseUrl}/${key}`;

    if (!this.client) {
      return {
        uploadUrl: `${publicUrl}?dev-upload=1`,
        publicUrl,
        key,
        expiresInSeconds: UPLOAD_TTL_SECONDS,
      };
    }

    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: payload.contentType,
    });

    const uploadUrl = await getSignedUrl(this.client, command, {
      expiresIn: UPLOAD_TTL_SECONDS,
    });

    return { uploadUrl, publicUrl, key, expiresInSeconds: UPLOAD_TTL_SECONDS };
  }

  async confirmUpload(
    userId: string,
    payload: ConfirmUploadRequestDto,
  ): Promise<ConfirmUploadResponseDto> {
    if (payload.key.includes('..') || payload.key.startsWith('/')) {
      throw new BadRequestException('Invalid key');
    }

    if (!payload.key.startsWith(`${payload.purpose.toLowerCase()}/${userId}/`)) {
      throw new BadRequestException('Upload key does not belong to current user');
    }

    return {
      key: payload.key,
      publicUrl: payload.publicUrl,
      confirmed: true,
    };
  }

  private validateContentType(
    contentType: string,
    purpose: UploadUrlRequestDto['purpose'],
    fileSize?: number,
  ) {
    if (purpose === 'NCERT_PDF' && contentType !== 'application/pdf') {
      throw new BadRequestException('NCERT uploads must be PDF');
    }
    if (purpose !== 'NCERT_PDF' && !contentType.startsWith('image/')) {
      throw new BadRequestException('Only image uploads are allowed for this purpose');
    }
    const maxSize = purpose === 'NCERT_PDF' ? MAX_PDF_BYTES : MAX_IMAGE_BYTES;
    if (fileSize !== undefined && fileSize > maxSize) {
      throw new BadRequestException(`File size exceeds limit of ${maxSize} bytes`);
    }
    // TODO: enforce client-declared file size once fileSize is added to UploadUrlRequestDto.
  }

  private defaultExtension(contentType: string): string {
    if (contentType === 'application/pdf') return 'pdf';
    if (contentType === 'image/png') return 'png';
    return 'jpg';
  }
}
