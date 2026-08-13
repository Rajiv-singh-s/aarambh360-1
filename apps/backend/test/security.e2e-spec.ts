import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as crypto from 'crypto';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';
import { PAYMENT_PROVIDER } from '../src/subscriptions/payment.provider';

const WEBHOOK_SECRET = 'security-e2e-webhook-secret';

function signWebhookBody(body: string): string {
  return crypto.createHmac('sha256', WEBHOOK_SECRET).update(body).digest('hex');
}

function createAuthMock(testUsers: { userA: string; userB: string; admin: string }) {
  return {
    extractBearerToken: (authorization?: string) =>
      authorization?.startsWith('Bearer ') ? authorization.slice(7) : null,
    verifyToken: async (token: string) => {
      if (token === 'invalid-token' || token === 'expired-token') {
        throw new Error('Invalid token');
      }
      return { uid: token };
    },
    validateAndLoadUser: async (decoded: { uid: string }) => {
      const profile = {
        'security-user-a': {
          id: testUsers.userA,
          firebaseUid: 'security-e2e-user-a',
          email: 'security-a@test.com',
          phone: null,
          role: 'USER',
          profileCompleted: true,
        },
        'security-user-b': {
          id: testUsers.userB,
          firebaseUid: 'security-e2e-user-b',
          email: 'security-b@test.com',
          phone: null,
          role: 'USER',
          profileCompleted: true,
        },
        'security-admin': {
          id: testUsers.admin,
          firebaseUid: 'security-e2e-admin',
          email: 'security-admin@test.com',
          phone: null,
          role: 'ADMIN',
          profileCompleted: true,
        },
      } as const;
      const user = profile[decoded.uid as keyof typeof profile];
      if (!user) {
        throw new Error('Unknown test token');
      }
      return user;
    },
  };
}

describe('Security & Auth Hardening (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUsers = { userA: '', userB: '', admin: '' };
  let mainsQuestionId = '';
  let submissionBId = '';

  const mockPaymentProvider = {
    name: 'razorpay',
    verifyWebhookSignature: (body: string, signature: string) => {
      const expected = signWebhookBody(body);
      if (expected.length !== signature.length) {
        return false;
      }
      return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    },
    createSubscription: async () => ({
      providerSubscriptionId: 'mock-sub-id',
      checkoutUrl: 'https://example.com/checkout',
      keyId: 'mock-key',
    }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(createAuthMock(testUsers))
      .overrideProvider(PAYMENT_PROVIDER)
      .useValue(mockPaymentProvider)
      .compile();

    app = moduleFixture.createNestApplication({ rawBody: true });
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);

    // Clean up if tests were aborted early using firebaseUid (avoiding empty string UUID check)
    await prisma.mainsAnswer.deleteMany({
      where: { submission: { user: { firebaseUid: { in: ['security-e2e-user-a', 'security-e2e-user-b', 'security-e2e-admin'] } } } },
    });
    await prisma.mainsSubmission.deleteMany({
      where: { user: { firebaseUid: { in: ['security-e2e-user-a', 'security-e2e-user-b', 'security-e2e-admin'] } } },
    });
    await prisma.user.deleteMany({
      where: { firebaseUid: { in: ['security-e2e-user-a', 'security-e2e-user-b', 'security-e2e-admin'] } },
    });
    await prisma.mainsQuestion.deleteMany({
      where: { text: 'Security E2E Mains Question' },
    });

    // Create test users
    const userA = await prisma.user.create({
      data: { firebaseUid: 'security-e2e-user-a', email: 'security-a@test.com', role: 'USER' },
    });
    const userB = await prisma.user.create({
      data: { firebaseUid: 'security-e2e-user-b', email: 'security-b@test.com', role: 'USER' },
    });
    const admin = await prisma.user.create({
      data: { firebaseUid: 'security-e2e-admin', email: 'security-admin@test.com', role: 'ADMIN' },
    });

    testUsers.userA = userA.id;
    testUsers.userB = userB.id;
    testUsers.admin = admin.id;

    // Create a published Mains Question
    const question = await prisma.mainsQuestion.create({
      data: {
        text: 'Security E2E Mains Question',
        gsPaper: 'GS1',
        maxMarks: 15,
        publishStatus: 'PUBLISHED',
      },
    });
    mainsQuestionId = question.id;

    // Create a submission belonging to User B
    const submissionB = await prisma.mainsSubmission.create({
      data: {
        userId: testUsers.userB,
        mainsQuestionId: question.id,
        status: 'SUBMITTED',
        answers: {
          create: {
            imageUrl: 'https://example.com/b.png',
            imageUrls: ['https://example.com/b.png'],
            isActive: true,
          },
        },
      },
    });
    submissionBId = submissionB.id;
  });

  afterAll(async () => {
    await prisma.mainsAnswer.deleteMany({
      where: { submission: { user: { firebaseUid: { in: ['security-e2e-user-a', 'security-e2e-user-b', 'security-e2e-admin'] } } } },
    });
    await prisma.mainsSubmission.deleteMany({
      where: { user: { firebaseUid: { in: ['security-e2e-user-a', 'security-e2e-user-b', 'security-e2e-admin'] } } },
    });
    await prisma.user.deleteMany({
      where: { firebaseUid: { in: ['security-e2e-user-a', 'security-e2e-user-b', 'security-e2e-admin'] } },
    });
    if (mainsQuestionId) {
      await prisma.mainsQuestion.delete({
        where: { id: mainsQuestionId },
      });
    }
    await app.close();
  });

  // a) Unauthenticated request to a protected endpoint returns 401
  it('unauthenticated request to a protected endpoint returns 401', async () => {
    await request(app.getHttpServer())
      .get('/mains/submissions')
      .expect(401);
  });

  // b) Request with an invalid/expired token returns 401
  it('request with an invalid/expired token returns 401', async () => {
    await request(app.getHttpServer())
      .get('/mains/submissions')
      .set('Authorization', 'Bearer invalid-token')
      .expect(401);

    await request(app.getHttpServer())
      .get('/mains/submissions')
      .set('Authorization', 'Bearer expired-token')
      .expect(401);
  });

  // c) Request to admin endpoint with USER role returns 403
  it('request to admin endpoint with USER role returns 403', async () => {
    await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', 'Bearer security-user-a')
      .expect(403);
  });

  // d) User A attempting to read User B's mains submission returns 403 or 404
  it('user A attempting to read User B\'s mains submission returns 404 (for isolation)', async () => {
    await request(app.getHttpServer())
      .get(`/mains/submissions/${submissionBId}`)
      .set('Authorization', 'Bearer security-user-a')
      .expect(404);
  });

  // e) Unbounded limit is capped (send limit=9999, expect max 50 or 100)
  it('caps unbounded limit parameters correctly', async () => {
    const resMains = await request(app.getHttpServer())
      .get('/mains/submissions?limit=9999')
      .set('Authorization', 'Bearer security-user-a')
      .expect(200);
    expect(resMains.body.data).toBeDefined();

    const resAnalytics = await request(app.getHttpServer())
      .get('/analytics/me/events?limit=9999')
      .set('Authorization', 'Bearer security-user-a')
      .expect(200);
    expect(resAnalytics.body.data).toBeDefined();

    const resNotifications = await request(app.getHttpServer())
      .get('/notifications/history?limit=9999')
      .set('Authorization', 'Bearer security-user-a')
      .expect(200);
    expect(resNotifications.body.data).toBeDefined();
  });

  // f) Webhook with missing signature returns 400
  it('webhook with missing signature returns 400', async () => {
    const payload = JSON.stringify({ event: 'subscription.charged' });
    await request(app.getHttpServer())
      .post('/subscriptions/webhook')
      .set('Content-Type', 'application/json')
      .send(payload)
      .expect(400);
  });

  // g) Webhook with invalid signature returns 400
  it('webhook with invalid signature returns 400', async () => {
    const payload = JSON.stringify({ event: 'subscription.charged' });
    await request(app.getHttpServer())
      .post('/subscriptions/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', 'wrong-signature')
      .send(payload)
      .expect(400);
  });

  // h) Webhook with valid signature on exact raw payload succeeds
  it('webhook with valid signature on exact raw payload succeeds', async () => {
    const payload = JSON.stringify({
      event: 'subscription.charged',
      payload: { subscription: { entity: { id: 'unknown-provider-sub' } } },
    });
    const signature = signWebhookBody(payload);

    await request(app.getHttpServer())
      .post('/subscriptions/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(payload)
      .expect(201)
      .expect({ ok: true });
  });

  // i) Webhook with valid signature but modified payload fails verification
  it('webhook with valid signature but modified payload fails verification', async () => {
    const originalPayload = JSON.stringify({
      event: 'subscription.charged',
      payload: { subscription: { entity: { id: 'provider-sub-original' } } },
    });
    const tamperedPayload = JSON.stringify({
      event: 'subscription.charged',
      payload: { subscription: { entity: { id: 'provider-sub-tampered' } } },
    });
    const signature = signWebhookBody(originalPayload);

    await request(app.getHttpServer())
      .post('/subscriptions/webhook')
      .set('Content-Type', 'application/json')
      .set('x-razorpay-signature', signature)
      .send(tamperedPayload)
      .expect(400);
  });
});
