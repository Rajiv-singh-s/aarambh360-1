import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { seedSubscriptionPlans } from '../prisma/seeds/subscription-plans';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Steps 14-17 integration', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let userId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({
        extractBearerToken: (authorization?: string) =>
          authorization?.startsWith('Bearer ') ? authorization.slice(7) : null,
        verifyToken: async (token: string) => ({ uid: token }),
        validateAndLoadUser: async (decoded: { uid: string }) => ({
          id: userId,
          firebaseUid: 'steps14-user',
          email: 'steps14@test.com',
          phone: null,
          role: 'USER',
          profileCompleted: true,
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({ where: { firebaseUid: 'steps14-user' } });
    const user = await prisma.user.create({
      data: { firebaseUid: 'steps14-user', email: 'steps14@test.com', role: 'USER' },
    });
    userId = user.id;
    await seedSubscriptionPlans(prisma);
  });

  afterAll(async () => {
    await prisma.notificationLog.deleteMany({ where: { userId } });
    await prisma.deviceToken.deleteMany({ where: { userId } });
    await prisma.learningEvent.deleteMany({ where: { userId } });
    await prisma.usageRecord.deleteMany({ where: { userId } });
    await prisma.userEntitlement.deleteMany({ where: { userId } });
    await prisma.subscription.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
    await app.close();
  });

  it('registers notification token and reads preferences', async () => {
    await request(app.getHttpServer())
      .post('/notifications/register-token')
      .set('Authorization', 'Bearer steps14-user')
      .send({ token: 'fcm-token-1', platform: 'android' })
      .expect(201);

    const prefs = await request(app.getHttpServer())
      .get('/notifications/preferences')
      .set('Authorization', 'Bearer steps14-user')
      .expect(200);

    expect(prefs.body.data.pushNotifications).toBe(true);
  });

  it('tracks analytics events and returns profile', async () => {
    await request(app.getHttpServer())
      .post('/analytics/events')
      .set('Authorization', 'Bearer steps14-user')
      .send({ eventType: 'APP_OPEN' })
      .expect(201);

    const profile = await request(app.getHttpServer())
      .get('/analytics/me/profile')
      .set('Authorization', 'Bearer steps14-user')
      .expect(200);

    expect(profile.body.data.recentActivityCount).toBeGreaterThan(0);
  });

  it('returns free entitlements and ad config with ads enabled', async () => {
    const entitlements = await request(app.getHttpServer())
      .get('/subscriptions/me/entitlements')
      .set('Authorization', 'Bearer steps14-user')
      .expect(200);

    expect(entitlements.body.data.planCode).toBe('FREE');
    expect(entitlements.body.data.removeAds).toBe(false);

    const ads = await request(app.getHttpServer())
      .get('/ads/config')
      .set('Authorization', 'Bearer steps14-user')
      .expect(200);

    expect(ads.body.data.adsEnabled).toBe(true);
  });

  it('activates premium in dev mode and disables ads', async () => {
    await request(app.getHttpServer())
      .post('/subscriptions/create')
      .set('Authorization', 'Bearer steps14-user')
      .send({ planCode: 'PREMIUM' })
      .expect(201);

    const ads = await request(app.getHttpServer())
      .get('/ads/config')
      .set('Authorization', 'Bearer steps14-user')
      .expect(200);

    expect(ads.body.data.removeAds).toBe(true);
    expect(ads.body.data.adsEnabled).toBe(false);
  });
});
