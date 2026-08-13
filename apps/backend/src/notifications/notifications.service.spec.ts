import { NotificationsService } from './notifications.service';
import { FirebaseAdminService } from '../auth/firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let prisma: Record<string, any>;

  beforeEach(() => {
    prisma = {
      deviceToken: { updateMany: jest.fn(), upsert: jest.fn() },
      userPreference: { upsert: jest.fn(), update: jest.fn() },
      notificationLog: { create: jest.fn(), findMany: jest.fn() },
    };
    const firebaseAdmin = { isConfigured: jest.fn().mockReturnValue(false) } as unknown as FirebaseAdminService;
    service = new NotificationsService(prisma as unknown as PrismaService, firebaseAdmin);
  });

  it('registers device token for user', async () => {
    prisma.deviceToken.updateMany.mockResolvedValue({ count: 0 });
    prisma.deviceToken.upsert.mockResolvedValue({
      id: 'token-1',
      platform: 'android',
      isActive: true,
      createdAt: new Date(),
    });

    const result = await service.registerToken('user-1', {
      token: 'abc123',
      platform: 'android',
    });

    expect(result.id).toBe('token-1');
    expect(prisma.deviceToken.upsert).toHaveBeenCalled();
  });
});
