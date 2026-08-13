import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

function createAuthMock(testUsers: Record<string, string>) {
  return {
    extractBearerToken: (authorization?: string) =>
      authorization?.startsWith('Bearer ') ? authorization.slice(7) : null,
    verifyToken: async (token: string) => ({ uid: token }),
    validateAndLoadUser: async (decoded: { uid: string }) => {
      const profile = {
        'quiz-user-a': {
          id: testUsers.userA,
          firebaseUid: 'quiz-e2e-user-a',
          email: 'quiz-a@test.com',
          phone: null,
          role: 'USER',
          profileCompleted: true,
        },
        'quiz-user-b': {
          id: testUsers.userB,
          firebaseUid: 'quiz-e2e-user-b',
          email: 'quiz-b@test.com',
          phone: null,
          role: 'USER',
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

describe('Quiz & Progress API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUsers = { userA: '', userB: '' };
  let topicId = '';

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(AuthService)
      .useValue(createAuthMock(testUsers))
      .compile();

    app = moduleFixture.createNestApplication();
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

    await prisma.user.deleteMany({
      where: { firebaseUid: { in: ['quiz-e2e-user-a', 'quiz-e2e-user-b'] } },
    });

    const userA = await prisma.user.create({
      data: { firebaseUid: 'quiz-e2e-user-a', email: 'quiz-a@test.com', role: 'USER' },
    });
    const userB = await prisma.user.create({
      data: { firebaseUid: 'quiz-e2e-user-b', email: 'quiz-b@test.com', role: 'USER' },
    });
    testUsers.userA = userA.id;
    testUsers.userB = userB.id;

    const topics = await prisma.topic.findMany({
      where: { publishStatus: 'PUBLISHED', deletedAt: null },
      select: {
        id: true,
        _count: {
          select: {
            questionMappings: {
              where: { question: { publishStatus: 'PUBLISHED', deletedAt: null } },
            },
          },
        },
      },
      take: 20,
    });
    const topic = topics.find((row) => row._count.questionMappings >= 3);
    if (!topic) {
      throw new Error('Seeded database missing published topic with >= 3 questions');
    }
    topicId = topic.id;
  });

  afterAll(async () => {
    await prisma.quizAttemptAnswer.deleteMany({
      where: { attempt: { userId: { in: [testUsers.userA, testUsers.userB] } } },
    });
    await prisma.questionAttempt.deleteMany({
      where: { userId: { in: [testUsers.userA, testUsers.userB] } },
    });
    await prisma.mistake.deleteMany({
      where: { userId: { in: [testUsers.userA, testUsers.userB] } },
    });
    await prisma.quizAttempt.deleteMany({
      where: { userId: { in: [testUsers.userA, testUsers.userB] } },
    });
    await prisma.quiz.deleteMany({
      where: {
        metadata: { path: ['userId'], equals: testUsers.userA },
      },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUsers.userA, testUsers.userB] } },
    });
    await app.close();
  });

  it('requires auth for quiz session creation', async () => {
    await request(app.getHttpServer())
      .post('/quiz/sessions')
      .send({ topicId, count: 3 })
      .expect(401);
  });

  it('runs full quiz flow with server-side scoring and progress updates', async () => {
    const sessionResponse = await request(app.getHttpServer())
      .post('/quiz/sessions')
      .set('Authorization', 'Bearer quiz-user-a')
      .send({ topicId, count: 3 })
      .expect(201);

    const session = sessionResponse.body.data;
    expect(session.sessionId).toBeTruthy();
    expect(session.questions).toHaveLength(3);

    const firstQuestion = session.questions[0];
    const secondQuestion = session.questions[1];
    const firstCorrectOption = await prisma.questionOption.findFirst({
      where: { questionId: firstQuestion.id, isCorrect: true },
    });
    const secondWrongOption = await prisma.questionOption.findFirst({
      where: { questionId: secondQuestion.id, isCorrect: false },
    });
    expect(firstCorrectOption).toBeTruthy();
    expect(secondWrongOption).toBeTruthy();

    const correctAnswer = await request(app.getHttpServer())
      .post(`/quiz/sessions/${session.sessionId}/answers`)
      .set('Authorization', 'Bearer quiz-user-a')
      .send({
        questionId: firstQuestion.id,
        selectedOptionId: firstCorrectOption!.id,
        timeTakenSeconds: 12,
      })
      .expect(201);
    expect(correctAnswer.body.data.isCorrect).toBe(true);

    const wrongAnswer = await request(app.getHttpServer())
      .post(`/quiz/sessions/${session.sessionId}/answers`)
      .set('Authorization', 'Bearer quiz-user-a')
      .send({
        questionId: secondQuestion.id,
        selectedOptionId: secondWrongOption!.id,
        timeTakenSeconds: 8,
      })
      .expect(201);
    expect(wrongAnswer.body.data.isCorrect).toBe(false);

    const completeResponse = await request(app.getHttpServer())
      .post(`/quiz/sessions/${session.sessionId}/complete`)
      .set('Authorization', 'Bearer quiz-user-a')
      .expect(201);

    expect(completeResponse.body.data.correctCount).toBeGreaterThanOrEqual(1);
    expect(completeResponse.body.data.totalQuestions).toBe(3);
    expect(completeResponse.body.data.score).toBeDefined();

    const streak = await request(app.getHttpServer())
      .get('/progress/streak')
      .set('Authorization', 'Bearer quiz-user-a')
      .expect(200);
    expect(
      streak.body.data.some(
        (row: { streakType: string; currentCount: number }) =>
          row.streakType === 'MCQ' && row.currentCount >= 1,
      ),
    ).toBe(true);

    const stats = await request(app.getHttpServer())
      .get('/progress/stats')
      .set('Authorization', 'Bearer quiz-user-a')
      .expect(200);
    expect(stats.body.data.totalQuestionsAnswered).toBeGreaterThanOrEqual(2);

    const mistakes = await request(app.getHttpServer())
      .get('/mistakes')
      .set('Authorization', 'Bearer quiz-user-a')
      .expect(200);
    expect(mistakes.body.data.length).toBeGreaterThanOrEqual(1);
  });

  it('isolates quiz sessions between users', async () => {
    const sessionResponse = await request(app.getHttpServer())
      .post('/quiz/sessions')
      .set('Authorization', 'Bearer quiz-user-a')
      .send({ topicId, count: 2 })
      .expect(201);

    await request(app.getHttpServer())
      .post(`/quiz/sessions/${sessionResponse.body.data.sessionId}/complete`)
      .set('Authorization', 'Bearer quiz-user-b')
      .expect(404);
  });

  it('supports bookmark create/list/delete for authenticated user', async () => {
    const question = await prisma.question.findFirst({
      where: { publishStatus: 'PUBLISHED', deletedAt: null },
      select: { id: true },
    });
    expect(question).toBeTruthy();

    const created = await request(app.getHttpServer())
      .post('/bookmarks')
      .set('Authorization', 'Bearer quiz-user-a')
      .send({ targetType: 'QUESTION', targetId: question!.id, notes: 'Review later' })
      .expect(201);

    const list = await request(app.getHttpServer())
      .get('/bookmarks')
      .set('Authorization', 'Bearer quiz-user-a')
      .expect(200);
    expect(list.body.data.some((row: { id: string }) => row.id === created.body.data.id)).toBe(true);

    await request(app.getHttpServer())
      .delete(`/bookmarks/${created.body.data.id}`)
      .set('Authorization', 'Bearer quiz-user-a')
      .expect(200);
  });
});
