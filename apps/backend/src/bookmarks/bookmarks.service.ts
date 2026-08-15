import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { BookmarkTargetType } from '@prisma/client';
import type { BookmarkDto, CreateBookmarkRequestDto } from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BookmarksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string): Promise<BookmarkDto[]> {
    const bookmarks = await this.prisma.bookmark.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    });

    return bookmarks.map((bookmark) => {
      let mappedQuestion: BookmarkDto['question'] = undefined;
      
      if (bookmark.question) {
        const correctOption = bookmark.question.options.find(o => o.isCorrect);
        mappedQuestion = {
          id: bookmark.question.id,
          type: bookmark.question.type as any,
          text: bookmark.question.text,
          difficulty: bookmark.question.difficulty as any,
          options: bookmark.question.options.map(o => ({
            id: o.id,
            label: o.label,
            text: o.text,
            sortOrder: o.sortOrder,
          })),
          explanation: bookmark.question.explanation,
          correctOptionId: correctOption?.id,
        };
      }

      return {
        id: bookmark.id,
        targetType: bookmark.targetType,
        targetId: bookmark.questionId ?? bookmark.lessonId ?? '',
        notes: bookmark.notes,
        createdAt: bookmark.createdAt.toISOString(),
        question: mappedQuestion,
      };
    });
  }

  async create(userId: string, payload: CreateBookmarkRequestDto): Promise<BookmarkDto> {
    const data = this.mapTarget(payload.targetType, payload.targetId);
    const existing = await this.prisma.bookmark.findFirst({
      where: { userId, ...data },
    });
    if (existing) {
      throw new ConflictException('Bookmark already exists');
    }

    const bookmark = await this.prisma.bookmark.create({
      data: {
        userId,
        targetType: payload.targetType as BookmarkTargetType,
        notes: payload.notes ?? null,
        ...data,
      },
    });

    return {
      id: bookmark.id,
      targetType: bookmark.targetType,
      targetId: payload.targetId,
      notes: bookmark.notes,
      createdAt: bookmark.createdAt.toISOString(),
    };
  }

  async remove(userId: string, bookmarkId: string): Promise<void> {
    const bookmark = await this.prisma.bookmark.findFirst({
      where: { id: bookmarkId, userId },
    });
    if (!bookmark) {
      throw new NotFoundException(`Bookmark not found: ${bookmarkId}`);
    }
    await this.prisma.bookmark.delete({ where: { id: bookmarkId } });
  }

  private mapTarget(targetType: CreateBookmarkRequestDto['targetType'], targetId: string) {
    if (targetType === 'QUESTION') {
      return { questionId: targetId, lessonId: null };
    }
    if (targetType === 'LESSON') {
      return { lessonId: targetId, questionId: null };
    }
    throw new ConflictException('Unsupported bookmark target type');
  }
}
