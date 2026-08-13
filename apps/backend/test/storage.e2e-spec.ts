import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { AuthService } from '../src/auth/auth.service';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Storage API (integration)', () => {
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
          if (decoded.uid === 'storage-user-a') {
            return {
              id: testUsers.userA,
              firebaseUid: 'storage-e2e-user-a',
              email: 'storage-a@test.com',
              phone: null,
              role: 'USER',
              profileCompleted: true,
            };
          }
          return {
            id: testUsers.userB,
            firebaseUid: 'storage-e2e-user-b',
            email: 'storage-b@test.com',
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
      where: { firebaseUid: { in: ['storage-e2e-user-a', 'storage-e2e-user-b'] } },
    });

    const userA = await prisma.user.create({
      data: { firebaseUid: 'storage-e2e-user-a', email: 'storage-a@test.com', role: 'USER' },
    });
    const userB = await prisma.user.create({
      data: { firebaseUid: 'storage-e2e-user-b', email: 'storage-b@test.com', role: 'USER' },
    });
    testUsers.userA = userA.id;
    testUsers.userB = userB.id;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { id: { in: [testUsers.userA, testUsers.userB] } },
    });
    await app.close();
  });

  it('requires auth for upload URL generation', async () => {
    await request(app.getHttpServer())
      .post('/storage/upload-url')
      .send({ purpose: 'AVATAR', contentType: 'image/jpeg' })
      .expect(401);
  });

  it('generates dev upload URL and confirms owned upload', async () => {
    const uploadResponse = await request(app.getHttpServer())
      .post('/storage/upload-url')
      .set('Authorization', 'Bearer storage-user-a')
      .send({ purpose: 'MAINS_ANSWER', contentType: 'image/png', fileName: 'answer.png' })
      .expect(201);

    expect(uploadResponse.body.data.key).toContain(`mains_answer/${testUsers.userA}/`);
    expect(uploadResponse.body.data.uploadUrl).toContain('dev-upload=1');

    const confirmResponse = await request(app.getHttpServer())
      .post('/storage/confirm')
      .set('Authorization', 'Bearer storage-user-a')
      .send({
        key: uploadResponse.body.data.key,
        publicUrl: uploadResponse.body.data.publicUrl,
        purpose: 'MAINS_ANSWER',
      })
      .expect(201);

    expect(confirmResponse.body.data.confirmed).toBe(true);
  });

  it('rejects confirming another user key prefix', async () => {
    await request(app.getHttpServer())
      .post('/storage/confirm')
      .set('Authorization', 'Bearer storage-user-b')
      .send({
        key: `avatar/${testUsers.userA}/forged.png`,
        publicUrl: 'https://example.com/forged.png',
        purpose: 'AVATAR',
      })
      .expect(400);
  });

  it('rejects invalid avatar content type', async () => {
    await request(app.getHttpServer())
      .post('/storage/upload-url')
      .set('Authorization', 'Bearer storage-user-a')
      .send({ purpose: 'AVATAR', contentType: 'application/pdf' })
      .expect(400);
  });
});
