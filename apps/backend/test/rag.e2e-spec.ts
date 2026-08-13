import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('RAG API (integration)', () => {
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
          if (decoded.uid === 'rag-editor') {
            return {
              id: testUsers.editorId,
              firebaseUid: 'rag-e2e-editor',
              email: 'rag-editor@test.com',
              phone: null,
              role: 'EDITOR',
              profileCompleted: true,
            };
          }
          return {
            id: testUsers.regularId,
            firebaseUid: 'rag-e2e-user',
            email: 'rag-user@test.com',
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
      where: { firebaseUid: { in: ['rag-e2e-editor', 'rag-e2e-user'] } },
    });

    const editor = await prisma.user.create({
      data: { firebaseUid: 'rag-e2e-editor', email: 'rag-editor@test.com', role: 'EDITOR' },
    });
    const regular = await prisma.user.create({
      data: { firebaseUid: 'rag-e2e-user', email: 'rag-user@test.com', role: 'USER' },
    });
    testUsers.editorId = editor.id;
    testUsers.regularId = regular.id;
  });

  afterAll(async () => {
    await prisma.ragEmbedding.deleteMany({});
    await prisma.ragChunk.deleteMany({});
    await prisma.ragDocument.deleteMany({});
    await prisma.user.deleteMany({
      where: { id: { in: [testUsers.editorId, testUsers.regularId] } },
    });
    await app.close();
  });

  it('rejects non-editor ingest', async () => {
    await request(app.getHttpServer())
      .post('/rag/ingest')
      .set('Authorization', 'Bearer rag-user')
      .expect(403);
  });

  it('ingests published content and returns search results', async () => {
    const ingest = await request(app.getHttpServer())
      .post('/rag/ingest')
      .set('Authorization', 'Bearer rag-editor')
      .expect(201);

    expect(ingest.body.data.documentsProcessed).toBeGreaterThan(0);
    expect(ingest.body.data.embeddingsCreated).toBeGreaterThan(0);

    const search = await request(app.getHttpServer())
      .post('/rag/search')
      .set('Authorization', 'Bearer rag-editor')
      .send({ query: 'Constitution fundamental rights governance', topK: 3 })
      .expect(201);

    expect(search.body.data.length).toBeGreaterThan(0);
    expect(search.body.data[0]).toEqual(
      expect.objectContaining({
        chunkId: expect.any(String),
        content: expect.any(String),
        score: expect.any(Number),
      }),
    );
  });
});
