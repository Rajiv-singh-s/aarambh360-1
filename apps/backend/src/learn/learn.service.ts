import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  LessonDetailDto,
  LessonSummaryDto,
  TopicSummaryDto,
  TopicWithProgressDto,
} from '@aarambh360/types';
import {
  buildPaginationMeta,
  normalizePagination,
  PUBLISHED_CONTENT,
  PUBLISHED_SUBJECT,
} from '../common/utils/pagination.util';

@Injectable()
export class LearnService {
  constructor(private readonly prisma: PrismaService) {}

  async getTopic(id: string): Promise<TopicSummaryDto> {
    const topic = await this.prisma.topic.findFirst({
      where: {
        id,
        ...PUBLISHED_CONTENT,
        subject: PUBLISHED_SUBJECT,
      },
      select: {
        id: true,
        subjectId: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        parentId: true,
      },
    });

    if (!topic) {
      throw new NotFoundException(`Topic not found: ${id}`);
    }

    return topic;
  }

  async listTopicsBySubject(
    subjectId: string,
    userId?: string,
  ): Promise<TopicWithProgressDto[]> {
    await this.ensureSubjectExists(subjectId);

    const topics = await this.prisma.topic.findMany({
      where: {
        subjectId,
        ...PUBLISHED_CONTENT,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        subjectId: true,
        name: true,
        slug: true,
        description: true,
        sortOrder: true,
        parentId: true,
      },
    });

    let progressByTopic = new Map<string, { masteryPercent: number; updatedAt: Date }>();
    if (userId) {
      const progressRows = await this.prisma.topicProgress.findMany({
        where: {
          userId,
          topicId: { in: topics.map((topic) => topic.id) },
        },
        select: {
          topicId: true,
          masteryPercent: true,
          updatedAt: true,
        },
      });
      progressByTopic = new Map(
        progressRows.map((row) => [row.topicId, { masteryPercent: row.masteryPercent, updatedAt: row.updatedAt }]),
      );
    }

    return topics.map((topic) => {
      const progress = progressByTopic.get(topic.id);
      return {
        ...topic,
        progress: progress
          ? {
              topicId: topic.id,
              completionPercent: progress.masteryPercent,
              lastStudiedAt: progress.updatedAt.toISOString(),
            }
          : null,
      };
    });
  }

  async listLessonsByTopic(
    topicId: string,
    page?: number,
    limit?: number,
  ): Promise<{ data: LessonSummaryDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    await this.getTopic(topicId);
    const pagination = normalizePagination(page, limit);

    const chapterIds = await this.prisma.chapter.findMany({
      where: {
        subject: {
          topics: { some: { id: topicId } },
        },
        ...PUBLISHED_CONTENT,
      },
      select: { id: true },
    });

    const where = {
      chapterId: { in: chapterIds.map((chapter) => chapter.id) },
      ...PUBLISHED_CONTENT,
    };

    const [lessons, totalItems] = await Promise.all([
      this.prisma.lesson.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          chapterId: true,
          title: true,
          slug: true,
          summary: true,
          sortOrder: true,
        },
      }),
      this.prisma.lesson.count({ where }),
    ]);

    return {
      data: lessons,
      meta: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }

  async getLesson(id: string): Promise<LessonDetailDto> {
    const lesson = await this.prisma.lesson.findFirst({
      where: {
        id,
        ...PUBLISHED_CONTENT,
        chapter: PUBLISHED_CONTENT,
      },
      include: {
        sections: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            title: true,
            content: true,
            sortOrder: true,
          },
        },
      },
    });

    if (!lesson) {
      throw new NotFoundException(`Lesson not found: ${id}`);
    }

    return {
      id: lesson.id,
      chapterId: lesson.chapterId,
      title: lesson.title,
      slug: lesson.slug,
      summary: lesson.summary,
      sortOrder: lesson.sortOrder,
      content: lesson.content,
      sections: lesson.sections,
    };
  }

  private async ensureSubjectExists(subjectId: string): Promise<void> {
    const subject = await this.prisma.subject.findFirst({
      where: { id: subjectId, ...PUBLISHED_SUBJECT },
      select: { id: true },
    });
    if (!subject) {
      throw new NotFoundException(`Subject not found: ${subjectId}`);
    }
  }
}
