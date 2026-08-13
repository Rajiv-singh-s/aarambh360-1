import { BadRequestException } from '@nestjs/common';
import { StorageService } from './storage.service';

describe('StorageService', () => {
  let service: StorageService;

  beforeEach(() => {
    delete process.env.R2_ENDPOINT;
    delete process.env.R2_ACCESS_KEY_ID;
    delete process.env.R2_SECRET_ACCESS_KEY;
    service = new StorageService();
  });

  it('returns dev upload URL when R2 is not configured', async () => {
    const result = await service.generateUploadUrl('user-1', {
      purpose: 'AVATAR',
      contentType: 'image/jpeg',
    });
    expect(result.key).toContain('avatar/user-1/');
    expect(result.uploadUrl).toContain('dev-upload=1');
  });

  it('rejects non-image uploads for avatar purpose', async () => {
    await expect(
      service.generateUploadUrl('user-1', {
        purpose: 'AVATAR',
        contentType: 'application/pdf',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('confirms upload when key belongs to user', async () => {
    const upload = await service.generateUploadUrl('user-1', {
      purpose: 'MAINS_ANSWER',
      contentType: 'image/png',
    });
    const confirmed = await service.confirmUpload('user-1', {
      key: upload.key,
      publicUrl: upload.publicUrl,
      purpose: 'MAINS_ANSWER',
    });
    expect(confirmed.confirmed).toBe(true);
  });

  it('rejects confirm when key prefix mismatches user', async () => {
    await expect(
      service.confirmUpload('user-1', {
        key: 'avatar/user-2/file.png',
        publicUrl: 'https://example.com/file.png',
        purpose: 'AVATAR',
      }),
    ).rejects.toThrow(BadRequestException);
  });
});
