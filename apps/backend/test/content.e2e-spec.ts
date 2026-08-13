import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { GlobalExceptionFilter } from '../src/common/filters/global-exception.filter';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Content API (integration)', () => {
  let app: INestApplication;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

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
  });

  afterAll(async () => {
    await app.close();
  });

  it('GET /exams returns seeded UPSC exam', async () => {
    const response = await request(app.getHttpServer()).get('/exams').expect(200);
    expect(response.body.data).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ code: 'UPSC_CSE', name: expect.any(String) }),
      ]),
    );
  });

  it('GET /exams/UPSC_CSE includes stages', async () => {
    const response = await request(app.getHttpServer()).get('/exams/UPSC_CSE').expect(200);
    expect(response.body.data.stages.length).toBeGreaterThanOrEqual(3);
  });

  it('GET /syllabus/UPSC_CSE/tree returns nested nodes', async () => {
    const response = await request(app.getHttpServer()).get('/syllabus/UPSC_CSE/tree').expect(200);
    expect(response.body.data.length).toBeGreaterThan(0);
    expect(response.body.data[0]).toHaveProperty('children');
  });

  it('GET /questions paginates MCQ results', async () => {
    const response = await request(app.getHttpServer())
      .get('/questions?page=1&limit=10')
      .expect(200);
    expect(response.body.data.length).toBeLessThanOrEqual(10);
    expect(response.body.meta.totalItems).toBeGreaterThan(1000);
    expect(response.body.meta.page).toBe(1);
  });

  it('GET /questions rejects invalid enum filter', async () => {
    await request(app.getHttpServer()).get('/questions?difficulty=INVALID').expect(400);
  });

  it('GET /questions/:id does not expose isCorrect on options', async () => {
    const list = await request(app.getHttpServer()).get('/questions?limit=1').expect(200);
    const questionId = list.body.data[0].id;
    const detail = await request(app.getHttpServer()).get(`/questions/${questionId}`).expect(200);
    expect(detail.body.data.options.length).toBeGreaterThan(0);
    expect(detail.body.data.options[0]).not.toHaveProperty('isCorrect');
  });

  it('GET /pyq returns seeded PYQs', async () => {
    const response = await request(app.getHttpServer()).get('/pyq?year=2025').expect(200);
    expect(response.body.meta.totalItems).toBeGreaterThan(0);
  });

  it('GET /cutoffs/UPSC_CSE returns paginated records', async () => {
    const response = await request(app.getHttpServer()).get('/cutoffs/UPSC_CSE?limit=5').expect(200);
    expect(response.body.data.length).toBeLessThanOrEqual(5);
    expect(response.body.meta.totalItems).toBeGreaterThan(0);
  });

  it('GET /exam-info/UPSC_CSE returns sections', async () => {
    const response = await request(app.getHttpServer()).get('/exam-info/UPSC_CSE').expect(200);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('GET /study-materials returns strategy content', async () => {
    const response = await request(app.getHttpServer()).get('/study-materials').expect(200);
    expect(response.body.meta.totalItems).toBeGreaterThanOrEqual(6);
  });

  it('GET /mains returns seeded mains questions', async () => {
    const response = await request(app.getHttpServer()).get('/mains').expect(200);
    expect(response.body.meta.totalItems).toBeGreaterThan(0);
  });

  it('GET /subjects/:id/topics requires auth', async () => {
    const subject = await prisma.subject.findFirst({
      where: { publishStatus: 'PUBLISHED' },
      select: { id: true },
    });
    expect(subject).toBeTruthy();
    await request(app.getHttpServer()).get(`/subjects/${subject!.id}/topics`).expect(401);
  });

  it('GET /exams/UNKNOWN returns 404', async () => {
    await request(app.getHttpServer()).get('/exams/UNKNOWN_EXAM').expect(404);
  });
});
