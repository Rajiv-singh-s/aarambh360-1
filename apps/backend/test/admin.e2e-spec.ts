import { ExecutionContext, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Admin API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  const testUsers = { editorId: '', regularId: '' };

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
          if (decoded.uid === 'editor-token') {
            return {
              id: testUsers.editorId,
              firebaseUid: 'admin-e2e-editor',
              email: 'editor-e2e@test.com',
              phone: null,
              role: 'EDITOR',
              profileCompleted: true,
            };
          }
          return {
            id: testUsers.regularId,
            firebaseUid: 'admin-e2e-user',
            email: 'user-e2e@test.com',
            phone: null,
            role: 'USER',
            profileCompleted: true,
          };
        },
      })
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
      where: { firebaseUid: { in: ['admin-e2e-editor', 'admin-e2e-user'] } },
    });

    const editor = await prisma.user.create({
      data: {
        firebaseUid: 'admin-e2e-editor',
        email: 'editor-e2e@test.com',
        role: 'EDITOR',
      },
    });
    const regular = await prisma.user.create({
      data: {
        firebaseUid: 'admin-e2e-user',
        email: 'user-e2e@test.com',
        role: 'USER',
      },
    });
    testUsers.editorId = editor.id;
    testUsers.regularId = regular.id;
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: { actorId: { in: [testUsers.editorId, testUsers.regularId] } },
    });
    await prisma.contentRevision.deleteMany({
      where: { authorId: testUsers.editorId },
    });
    await prisma.user.deleteMany({
      where: { id: { in: [testUsers.editorId, testUsers.regularId] } },
    });
    await app.close();
  });

  it('rejects USER role on admin dashboard', async () => {
    await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', 'Bearer user-token')
      .expect(403);
  });

  it('allows EDITOR role on admin dashboard', async () => {
    const response = await request(app.getHttpServer())
      .get('/admin/dashboard')
      .set('Authorization', 'Bearer editor-token')
      .expect(200);

    expect(response.body.data).toEqual(
      expect.objectContaining({
        subjects: expect.any(Number),
        questions: expect.any(Number),
      }),
    );
  });

  it('editor can create and publish a topic', async () => {
    const subject = await prisma.subject.findFirst({
      where: { deletedAt: null },
      select: { id: true },
    });
    expect(subject).toBeTruthy();

    const slug = `admin-e2e-topic-${Date.now()}`;
    const created = await request(app.getHttpServer())
      .post('/admin/topics')
      .set('Authorization', 'Bearer editor-token')
      .send({
        subjectId: subject!.id,
        name: 'Admin E2E Topic',
        slug,
      })
      .expect(201);

    const topicId = created.body.data.id;

    await request(app.getHttpServer())
      .post(`/admin/topics/${topicId}/review`)
      .set('Authorization', 'Bearer editor-token')
      .expect(201);

    const published = await request(app.getHttpServer())
      .post(`/admin/topics/${topicId}/publish`)
      .set('Authorization', 'Bearer editor-token')
      .expect(201);

    expect(published.body.data.publishStatus).toBe('PUBLISHED');

    const auditEntry = await prisma.auditLog.findFirst({
      where: { entityId: topicId, action: 'PUBLISH' },
    });
    expect(auditEntry).toBeTruthy();

    const revision = await prisma.contentRevision.findFirst({
      where: { entityId: topicId, entityType: 'Topic' },
    });
    expect(revision).toBeTruthy();

    await prisma.auditLog.deleteMany({ where: { entityId: topicId } });
    await prisma.contentRevision.deleteMany({ where: { entityId: topicId } });
    await prisma.topic.delete({ where: { id: topicId } });
  });
});
