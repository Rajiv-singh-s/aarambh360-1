import { Injectable, NotFoundException } from '@nestjs/common';
import { AuditAction, PublishStatus } from '@prisma/client';
import type {
  AdminChapterInputDto,
  AdminDashboardStatsDto,
  AdminLessonInputDto,
  AdminMainsQuestionInputDto,
  AdminQuestionInputDto,
  AdminSubjectInputDto,
  AdminTopicInputDto,
} from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboardStats(): Promise<AdminDashboardStatsDto> {
    const [subjects, topics, lessons, questions, mainsQuestions, pendingReview] =
      await Promise.all([
        this.prisma.subject.count({ where: { deletedAt: null } }),
        this.prisma.topic.count({ where: { deletedAt: null } }),
        this.prisma.lesson.count({ where: { deletedAt: null } }),
        this.prisma.question.count({ where: { deletedAt: null } }),
        this.prisma.mainsQuestion.count({ where: { deletedAt: null } }),
        this.prisma.question.count({ where: { publishStatus: PublishStatus.REVIEW } }),
      ]);

    return { subjects, topics, lessons, questions, mainsQuestions, pendingReview };
  }

  async listSubjects() {
    return this.prisma.subject.findMany({
      where: { deletedAt: null },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        examId: true,
        code: true,
        name: true,
        publishStatus: true,
        sortOrder: true,
      },
    });
  }

  async listTopics(subjectId?: string) {
    return this.prisma.topic.findMany({
      where: { deletedAt: null, ...(subjectId ? { subjectId } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      select: {
        id: true,
        subjectId: true,
        name: true,
        slug: true,
        publishStatus: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
  }

  async listChapters(subjectId?: string) {
    return this.prisma.chapter.findMany({
      where: { deletedAt: null, ...(subjectId ? { subjectId } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        subjectId: true,
        title: true,
        slug: true,
        publishStatus: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
  }

  async listLessons(chapterId?: string) {
    return this.prisma.lesson.findMany({
      where: { deletedAt: null, ...(chapterId ? { chapterId } : {}) },
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      select: {
        id: true,
        chapterId: true,
        title: true,
        slug: true,
        publishStatus: true,
        sortOrder: true,
        updatedAt: true,
      },
    });
  }

  async listPendingQuestions(limit = 20) {
    return this.prisma.question.findMany({
      where: { deletedAt: null, publishStatus: PublishStatus.REVIEW },
      orderBy: { updatedAt: 'desc' },
      take: limit,
      select: {
        id: true,
        text: true,
        publishStatus: true,
        updatedAt: true,
      },
    });
  }

  async createSubject(actorId: string, payload: AdminSubjectInputDto) {
    const subject = await this.prisma.subject.create({
      data: {
        examId: payload.examId,
        code: payload.code,
        name: payload.name,
        description: payload.description ?? null,
        sortOrder: payload.sortOrder ?? 0,
        publishStatus: payload.publishStatus ?? PublishStatus.DRAFT,
      },
    });
    await this.recordAudit(actorId, AuditAction.CREATE, 'Subject', subject.id, null, subject);
    return subject;
  }

  async updateSubject(actorId: string, id: string, payload: Partial<AdminSubjectInputDto>) {
    const before = await this.prisma.subject.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Subject not found');

    const subject = await this.prisma.subject.update({
      where: { id },
      data: {
        name: payload.name,
        description: payload.description,
        sortOrder: payload.sortOrder,
        publishStatus: payload.publishStatus,
      },
    });
    await this.recordAudit(actorId, AuditAction.UPDATE, 'Subject', id, before, subject);
    await this.recordRevision(actorId, 'Subject', id, subject);
    return subject;
  }

  async submitSubjectForReview(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Subject', id, PublishStatus.REVIEW, AuditAction.UPDATE);
  }

  async publishSubject(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Subject', id, PublishStatus.PUBLISHED, AuditAction.PUBLISH);
  }

  async createTopic(actorId: string, payload: AdminTopicInputDto) {
    const topic = await this.prisma.topic.create({
      data: {
        subjectId: payload.subjectId,
        name: payload.name,
        slug: payload.slug,
        description: payload.description ?? null,
        sortOrder: payload.sortOrder ?? 0,
        publishStatus: payload.publishStatus ?? PublishStatus.DRAFT,
      },
    });
    await this.recordAudit(actorId, AuditAction.CREATE, 'Topic', topic.id, null, topic);
    return topic;
  }

  async updateTopic(actorId: string, id: string, payload: Partial<AdminTopicInputDto>) {
    const before = await this.prisma.topic.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Topic not found');

    const topic = await this.prisma.topic.update({
      where: { id },
      data: {
        name: payload.name,
        slug: payload.slug,
        description: payload.description,
        sortOrder: payload.sortOrder,
        publishStatus: payload.publishStatus,
      },
    });
    await this.recordAudit(actorId, AuditAction.UPDATE, 'Topic', id, before, topic);
    await this.recordRevision(actorId, 'Topic', id, topic);
    return topic;
  }

  async submitTopicForReview(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Topic', id, PublishStatus.REVIEW, AuditAction.UPDATE);
  }

  async publishTopic(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Topic', id, PublishStatus.PUBLISHED, AuditAction.PUBLISH);
  }

  async createChapter(actorId: string, payload: AdminChapterInputDto) {
    const chapter = await this.prisma.chapter.create({
      data: {
        subjectId: payload.subjectId,
        title: payload.title,
        slug: payload.slug,
        introduction: payload.introduction ?? null,
        sortOrder: payload.sortOrder ?? 0,
        publishStatus: payload.publishStatus ?? PublishStatus.DRAFT,
      },
    });
    await this.recordAudit(actorId, AuditAction.CREATE, 'Chapter', chapter.id, null, chapter);
    return chapter;
  }

  async createLesson(actorId: string, payload: AdminLessonInputDto) {
    const lesson = await this.prisma.lesson.create({
      data: {
        chapterId: payload.chapterId,
        title: payload.title,
        slug: payload.slug,
        summary: payload.summary ?? null,
        content: payload.content ?? null,
        sortOrder: payload.sortOrder ?? 0,
        publishStatus: payload.publishStatus ?? PublishStatus.DRAFT,
      },
    });
    await this.recordAudit(actorId, AuditAction.CREATE, 'Lesson', lesson.id, null, lesson);
    return lesson;
  }

  async updateLesson(actorId: string, id: string, payload: Partial<AdminLessonInputDto>) {
    const before = await this.prisma.lesson.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Lesson not found');

    const lesson = await this.prisma.lesson.update({
      where: { id },
      data: {
        title: payload.title,
        slug: payload.slug,
        summary: payload.summary,
        content: payload.content,
        sortOrder: payload.sortOrder,
        publishStatus: payload.publishStatus,
      },
    });
    await this.recordAudit(actorId, AuditAction.UPDATE, 'Lesson', id, before, lesson);
    await this.recordRevision(actorId, 'Lesson', id, lesson);
    return lesson;
  }

  async submitLessonForReview(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Lesson', id, PublishStatus.REVIEW, AuditAction.UPDATE);
  }

  async publishLesson(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Lesson', id, PublishStatus.PUBLISHED, AuditAction.PUBLISH);
  }

  async createQuestion(actorId: string, payload: AdminQuestionInputDto) {
    const question = await this.prisma.question.create({
      data: {
        examId: payload.examId ?? null,
        type: payload.type as never,
        text: payload.text,
        difficulty: (payload.difficulty as never) ?? 'MEDIUM',
        explanation: payload.explanation ?? null,
        publishStatus: payload.publishStatus ?? PublishStatus.DRAFT,
        topicMappings: { create: [{ topicId: payload.topicId }] },
        options: {
          create: payload.options.map((option, index) => ({
            label: option.label,
            text: option.text,
            isCorrect: option.isCorrect,
            sortOrder: index,
          })),
        },
      },
      include: { options: true },
    });
    await this.recordAudit(actorId, AuditAction.CREATE, 'Question', question.id, null, question);
    return question;
  }

  async submitQuestionForReview(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Question', id, PublishStatus.REVIEW, AuditAction.UPDATE);
  }

  async publishQuestion(actorId: string, id: string) {
    return this.transitionPublishStatus(actorId, 'Question', id, PublishStatus.PUBLISHED, AuditAction.PUBLISH);
  }

  async createMains(actorId: string, payload: AdminMainsQuestionInputDto) {
    const mains = await this.prisma.mainsQuestion.create({
      data: {
        examId: payload.examId ?? null,
        subjectId: payload.subjectId ?? null,
        text: payload.text,
        gsPaper: payload.gsPaper as never,
        maxMarks: payload.maxMarks,
        modelAnswer: payload.modelAnswer ?? null,
        publishStatus: payload.publishStatus ?? PublishStatus.DRAFT,
      },
    });
    await this.recordAudit(actorId, AuditAction.CREATE, 'MainsQuestion', mains.id, null, mains);
    return mains;
  }

  async updateMains(actorId: string, id: string, payload: Partial<AdminMainsQuestionInputDto>) {
    const before = await this.prisma.mainsQuestion.findUnique({ where: { id } });
    if (!before) throw new NotFoundException('Mains question not found');

    const mains = await this.prisma.mainsQuestion.update({
      where: { id },
      data: {
        text: payload.text,
        gsPaper: payload.gsPaper as never,
        maxMarks: payload.maxMarks,
        modelAnswer: payload.modelAnswer,
        publishStatus: payload.publishStatus,
      },
    });
    await this.recordAudit(actorId, AuditAction.UPDATE, 'MainsQuestion', id, before, mains);
    await this.recordRevision(actorId, 'MainsQuestion', id, mains);
    return mains;
  }

  async submitMainsForReview(actorId: string, id: string) {
    return this.transitionPublishStatus(
      actorId,
      'MainsQuestion',
      id,
      PublishStatus.REVIEW,
      AuditAction.UPDATE,
    );
  }

  async publishMains(actorId: string, id: string) {
    return this.transitionPublishStatus(
      actorId,
      'MainsQuestion',
      id,
      PublishStatus.PUBLISHED,
      AuditAction.PUBLISH,
    );
  }

  async listAuditLog(limit = 50) {
    const logs = await this.prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: limit,
      select: {
        id: true,
        action: true,
        entityType: true,
        entityId: true,
        actorId: true,
        createdAt: true,
      },
    });

    return logs.map((entry) => ({
      id: entry.id,
      action: entry.action,
      entityType: entry.entityType,
      entityId: entry.entityId,
      userId: entry.actorId,
      createdAt: entry.createdAt.toISOString(),
    }));
  }

  private async transitionPublishStatus(
    actorId: string,
    entityType: 'Subject' | 'Topic' | 'Lesson' | 'Question' | 'MainsQuestion',
    id: string,
    publishStatus: PublishStatus,
    action: AuditAction,
  ) {
    switch (entityType) {
      case 'Subject': {
        const before = await this.prisma.subject.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Subject not found');
        const after = await this.prisma.subject.update({ where: { id }, data: { publishStatus } });
        await this.recordAudit(actorId, action, entityType, id, before, after);
        await this.recordRevision(actorId, entityType, id, after);
        return after;
      }
      case 'Topic': {
        const before = await this.prisma.topic.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Topic not found');
        const after = await this.prisma.topic.update({ where: { id }, data: { publishStatus } });
        await this.recordAudit(actorId, action, entityType, id, before, after);
        await this.recordRevision(actorId, entityType, id, after);
        return after;
      }
      case 'Lesson': {
        const before = await this.prisma.lesson.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Lesson not found');
        const after = await this.prisma.lesson.update({ where: { id }, data: { publishStatus } });
        await this.recordAudit(actorId, action, entityType, id, before, after);
        await this.recordRevision(actorId, entityType, id, after);
        return after;
      }
      case 'Question': {
        const before = await this.prisma.question.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('Question not found');
        const after = await this.prisma.question.update({ where: { id }, data: { publishStatus } });
        await this.recordAudit(actorId, action, entityType, id, before, after);
        await this.recordRevision(actorId, entityType, id, after);
        return after;
      }
      case 'MainsQuestion': {
        const before = await this.prisma.mainsQuestion.findUnique({ where: { id } });
        if (!before) throw new NotFoundException('MainsQuestion not found');
        const after = await this.prisma.mainsQuestion.update({ where: { id }, data: { publishStatus } });
        await this.recordAudit(actorId, action, entityType, id, before, after);
        await this.recordRevision(actorId, entityType, id, after);
        return after;
      }
      default:
        throw new NotFoundException(`Unsupported entity type: ${entityType}`);
    }
  }

  private async recordAudit(
    actorId: string,
    action: AuditAction,
    entityType: string,
    entityId: string,
    before: unknown,
    after: unknown,
  ) {
    await this.prisma.auditLog.create({
      data: {
        actorId,
        action,
        entityType,
        entityId,
        before: before as never,
        after: after as never,
      },
    });
  }

  private async recordRevision(actorId: string, entityType: string, entityId: string, snapshot: unknown) {
    const latest = await this.prisma.contentRevision.findFirst({
      where: { entityType, entityId },
      orderBy: { version: 'desc' },
    });
    await this.prisma.contentRevision.create({
      data: {
        entityType,
        entityId,
        version: (latest?.version ?? 0) + 1,
        snapshot: snapshot as never,
        authorId: actorId,
      },
    });
  }
}
