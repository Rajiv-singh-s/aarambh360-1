import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { seedSubscriptionPlans } from '../prisma/seeds/subscription-plans';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Mains Evaluation API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUsers = { userA: '', userB: '' };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue({
        extractBearerToken: (authorization?: string) =>
          authorization?.startsWith('Bearer ') ? authorization.slice(7) : null,
        verifyToken: async (token: string) => ({ uid: token }),
        validateAndLoadUser: async (decoded: { uid: string }) => {
          if (decoded.uid === 'eval-user-a') {
            return {
              id: testUsers.userA,
              firebaseUid: 'eval-e2e-user-a',
              email: 'eval-a@test.com',
              phone: null,
              role: 'USER',
              profileCompleted: true,
            };
          }
          return {
            id: testUsers.userB,
            firebaseUid: 'eval-e2e-user-b',
            email: 'eval-b@test.com',
            phone: null,
            role: 'USER',
            profileCompleted: true,
          };
        },
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true, transform: true }),
    );
    app.useGlobalFilters(new GlobalExceptionFilter());
    await app.init();

    prisma = app.get(PrismaService);
    await prisma.user.deleteMany({
      where: { firebaseUid: { in: ['eval-e2e-user-a', 'eval-e2e-user-b'] } },
    });

    const userA = await prisma.user.create({
      data: { firebaseUid: 'eval-e2e-user-a', email: 'eval-a@test.com', role: 'USER' },
    });
    const userB = await prisma.user.create({
      data: { firebaseUid: 'eval-e2e-user-b', email: 'eval-b@test.com', role: 'USER' },
    });
    testUsers.userA = userA.id;
    testUsers.userB = userB.id;
    await seedSubscriptionPlans(prisma);
  });

  beforeEach(async () => {
    await prisma.usageRecord.deleteMany({
      where: { user: { firebaseUid: { in: ['eval-e2e-user-a', 'eval-e2e-user-b'] } } },
    });
  });

  afterAll(async () => {
    await prisma.mainsEvaluation.deleteMany({
      where: { submission: { userId: { in: [testUsers.userA, testUsers.userB] } } },
    });
    await prisma.mainsAnswer.deleteMany({
      where: { submission: { userId: { in: [testUsers.userA, testUsers.userB] } } },
    });
    await prisma.mainsSubmission.deleteMany({
      where: { userId: { in: [testUsers.userA, testUsers.userB] } },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUsers.userA, testUsers.userB] } },
    });
    await app.close();
  });

  async function createEvaluatedSubmission(userToken: string, userId: string) {
    const question = await prisma.mainsQuestion.findFirst({
      where: { publishStatus: 'PUBLISHED', deletedAt: null },
      select: { id: true },
    });
    expect(question).toBeTruthy();

    const imageUrl = `https://assets.aarambh360.local/mains_answer/${userId}/sample.png?dev-upload=1`;
    const created = await request(app.getHttpServer())
      .post('/mains/submissions')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ mainsQuestionId: question!.id, imageUrl })
      .expect(201);

    const submissionId = created.body.data.id;

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const polled = await request(app.getHttpServer())
        .get(`/mains/submissions/${submissionId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);
      if (polled.body.data.status === 'EVALUATED') {
        return submissionId;
      }
    }

    throw new Error('OCR did not complete in time');
  }

  it('evaluates submission and returns structured rubric', async () => {
    const submissionId = await createEvaluatedSubmission('eval-user-a', testUsers.userA);

    await request(app.getHttpServer())
      .post(`/mains/submissions/${submissionId}/evaluate`)
      .set('Authorization', 'Bearer eval-user-a')
      .send({})
      .expect(201);

    let evaluationFound = false;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const polled = await request(app.getHttpServer())
        .get(`/mains/submissions/${submissionId}`)
        .set('Authorization', 'Bearer eval-user-a')
        .expect(200);

      if (polled.body.data.evaluation) {
        evaluationFound = true;
        expect(polled.body.data.evaluation.feedback.dimensions.length).toBeGreaterThan(0);
        expect(polled.body.data.evaluation.feedback.strengths.length).toBeGreaterThan(0);
        break;
      }
      if (polled.body.data.evalError) {
        throw new Error(polled.body.data.evalError);
      }
    }

    expect(evaluationFound).toBe(true);

    const evaluation = await request(app.getHttpServer())
      .get(`/mains/submissions/${submissionId}/evaluation`)
      .set('Authorization', 'Bearer eval-user-a')
      .expect(200);

    expect(evaluation.body.data.score).toBeGreaterThanOrEqual(0);

    await request(app.getHttpServer())
      .get(`/mains/submissions/${submissionId}/evaluation`)
      .set('Authorization', 'Bearer eval-user-b')
      .expect(404);
  });

  it('lists submissions for the authenticated user', async () => {
    const list = await request(app.getHttpServer())
      .get('/mains/submissions')
      .set('Authorization', 'Bearer eval-user-a')
      .expect(200);

    expect(Array.isArray(list.body.data)).toBe(true);
  });

  it('is idempotent when evaluation already exists', async () => {
    const submissionId = await createEvaluatedSubmission('eval-user-a', testUsers.userA);

    await request(app.getHttpServer())
      .post(`/mains/submissions/${submissionId}/evaluate`)
      .set('Authorization', 'Bearer eval-user-a')
      .send({})
      .expect(201);

    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const polled = await request(app.getHttpServer())
        .get(`/mains/submissions/${submissionId}`)
        .set('Authorization', 'Bearer eval-user-a')
        .expect(200);
      if (polled.body.data.evaluation) {
        break;
      }
    }

    const second = await request(app.getHttpServer())
      .post(`/mains/submissions/${submissionId}/evaluate`)
      .set('Authorization', 'Bearer eval-user-a')
      .send({})
      .expect(201);

    expect(second.body.data.evaluation).toBeTruthy();
  });
});
