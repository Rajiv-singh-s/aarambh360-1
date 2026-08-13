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
    });

    return bookmarks.map((bookmark) => ({
      id: bookmark.id,
      targetType: bookmark.targetType,
      targetId: bookmark.questionId ?? bookmark.lessonId ?? '',
      notes: bookmark.notes,
      createdAt: bookmark.createdAt.toISOString(),
    }));
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
