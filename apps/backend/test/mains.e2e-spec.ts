import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Mains OCR API (integration)', () => {
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
          if (decoded.uid === 'mains-user-a') {
            return {
              id: testUsers.userA,
              firebaseUid: 'mains-e2e-user-a',
              email: 'mains-a@test.com',
              phone: null,
              role: 'USER',
              profileCompleted: true,
            };
          }
          return {
            id: testUsers.userB,
            firebaseUid: 'mains-e2e-user-b',
            email: 'mains-b@test.com',
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
      where: { firebaseUid: { in: ['mains-e2e-user-a', 'mains-e2e-user-b'] } },
    });

    const userA = await prisma.user.create({
      data: { firebaseUid: 'mains-e2e-user-a', email: 'mains-a@test.com', role: 'USER' },
    });
    const userB = await prisma.user.create({
      data: { firebaseUid: 'mains-e2e-user-b', email: 'mains-b@test.com', role: 'USER' },
    });
    testUsers.userA = userA.id;
    testUsers.userB = userB.id;
  });

  afterAll(async () => {
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

  it('requires auth to create submission', async () => {
    await request(app.getHttpServer())
      .post('/mains/submissions')
      .send({ mainsQuestionId: 'missing', imageUrl: 'https://example.com/a.png' })
      .expect(401);
  });

  it('processes owned submission through OCR lifecycle', async () => {
    const question = await prisma.mainsQuestion.findFirst({
      where: { publishStatus: 'PUBLISHED', deletedAt: null },
      select: { id: true },
    });
    expect(question).toBeTruthy();

    const imageUrl = `https://assets.aarambh360.local/mains_answer/${testUsers.userA}/sample.png?dev-upload=1`;
    const created = await request(app.getHttpServer())
      .post('/mains/submissions')
      .set('Authorization', 'Bearer mains-user-a')
      .send({ mainsQuestionId: question!.id, imageUrl })
      .expect(201);

    const submissionId = created.body.data.id;
    expect(created.body.data.status).toBe('SUBMITTED');

    let finalStatus = created.body.data.status;
    for (let attempt = 0; attempt < 20; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, 200));
      const polled = await request(app.getHttpServer())
        .get(`/mains/submissions/${submissionId}`)
        .set('Authorization', 'Bearer mains-user-a')
        .expect(200);
      finalStatus = polled.body.data.status;
      if (finalStatus === 'EVALUATED' || finalStatus === 'FAILED') {
        expect(polled.body.data.answer?.extractedText).toBeTruthy();
        break;
      }
    }

    expect(finalStatus).toBe('EVALUATED');

    await request(app.getHttpServer())
      .get(`/mains/submissions/${submissionId}`)
      .set('Authorization', 'Bearer mains-user-b')
      .expect(404);
  });
});
