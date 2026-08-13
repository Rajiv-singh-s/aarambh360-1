import { NotFoundException } from '@nestjs/common';
import { PublishStatus } from '@prisma/client';
import { AdminService } from './admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AdminService', () => {
  let service: AdminService;
  let prisma: Record<string, any>;

  beforeEach(() => {
    prisma = {
      subject: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      topic: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      chapter: { findMany: jest.fn(), create: jest.fn() },
      lesson: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      question: { count: jest.fn(), findMany: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      mainsQuestion: { count: jest.fn(), findUnique: jest.fn(), create: jest.fn(), update: jest.fn() },
      auditLog: { findMany: jest.fn(), create: jest.fn() },
      contentRevision: { findFirst: jest.fn(), create: jest.fn() },
    };

    prisma.subject.count.mockResolvedValue(1);
    prisma.topic.count.mockResolvedValue(2);
    prisma.lesson.count.mockResolvedValue(3);
    prisma.question.count.mockResolvedValue(4);
    prisma.mainsQuestion.count.mockResolvedValue(5);
    prisma.contentRevision.findFirst.mockResolvedValue(null);

    service = new AdminService(prisma as unknown as PrismaService);
  });

  it('returns dashboard stats', async () => {
    const stats = await service.getDashboardStats();
    expect(stats).toEqual({
      subjects: 1,
      topics: 2,
      lessons: 3,
      questions: 4,
      mainsQuestions: 5,
      pendingReview: 4,
    });
  });

  it('creates topic and records audit log', async () => {
    prisma.topic.create.mockResolvedValue({ id: 'topic-1', name: 'Polity Basics' });
    await service.createTopic('editor-1', {
      subjectId: 'subject-1',
      name: 'Polity Basics',
      slug: 'polity-basics',
    });
    expect(prisma.auditLog.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          actorId: 'editor-1',
          entityType: 'Topic',
          entityId: 'topic-1',
        }),
      }),
    );
  });

  it('throws when publishing missing lesson', async () => {
    prisma.lesson.findUnique.mockResolvedValue(null);
    await expect(service.publishLesson('editor-1', 'missing')).rejects.toThrow(NotFoundException);
  });

  it('transitions lesson to published with revision snapshot', async () => {
    prisma.lesson.findUnique.mockResolvedValue({ id: 'lesson-1', publishStatus: PublishStatus.REVIEW });
    prisma.lesson.update.mockResolvedValue({ id: 'lesson-1', publishStatus: PublishStatus.PUBLISHED });

    const lesson = await service.publishLesson('editor-1', 'lesson-1');

    expect(lesson.publishStatus).toBe(PublishStatus.PUBLISHED);
    expect(prisma.contentRevision.create).toHaveBeenCalled();
  });
});
