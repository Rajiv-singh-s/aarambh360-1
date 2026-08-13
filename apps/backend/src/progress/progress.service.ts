import { Injectable } from '@nestjs/common';
import { StreakType } from '@prisma/client';
import type { ProgressStatsDto, StreakDto } from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProgressService {
  constructor(private readonly prisma: PrismaService) {}

  async getStreak(userId: string): Promise<StreakDto[]> {
    const streaks = await this.prisma.userStreak.findMany({
      where: { userId },
      orderBy: { streakType: 'asc' },
    });

    return streaks.map((streak) => ({
      streakType: streak.streakType,
      currentCount: streak.currentCount,
      longestCount: streak.longestCount,
      lastActivityDate: streak.lastActivityDate?.toISOString().slice(0, 10) ?? null,
    }));
  }

  async getStats(userId: string): Promise<ProgressStatsDto> {
    const attempts = await this.prisma.questionAttempt.findMany({
      where: { userId },
      select: {
        isCorrect: true,
        question: {
          select: {
            topicMappings: {
              select: {
                topic: {
                  select: {
                    subjectId: true,
                    subject: { select: { id: true, name: true } },
                  },
                },
              },
            },
          },
        },
      },
    });

    const totalQuestionsAnswered = attempts.length;
    const totalCorrect = attempts.filter((attempt) => attempt.isCorrect).length;
    const accuracy =
      totalQuestionsAnswered > 0 ? (totalCorrect / totalQuestionsAnswered) * 100 : 0;

    const subjectMap = new Map<
      string,
      { subjectId: string; subjectName: string; attempted: number; correct: number }
    >();

    for (const attempt of attempts) {
      const mapping = attempt.question.topicMappings[0];
      if (!mapping) continue;
      const subjectId = mapping.topic.subject.id;
      const existing = subjectMap.get(subjectId) ?? {
        subjectId,
        subjectName: mapping.topic.subject.name,
        attempted: 0,
        correct: 0,
      };
      existing.attempted += 1;
      if (attempt.isCorrect) existing.correct += 1;
      subjectMap.set(subjectId, existing);
    }

    return {
      totalQuestionsAnswered,
      totalCorrect,
      accuracy: Math.round(accuracy * 100) / 100,
      subjectBreakdown: Array.from(subjectMap.values()),
    };
  }

  async getMistakes(userId: string) {
    const mistakes = await this.prisma.mistake.findMany({
      where: { userId, resolvedAt: null },
      include: {
        question: {
          select: {
            text: true,
            topicMappings: { select: { topicId: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return mistakes.map((mistake) => ({
      id: mistake.id,
      questionId: mistake.questionId,
      questionText: mistake.question.text,
      topicId: mistake.question.topicMappings[0]?.topicId ?? null,
      incorrectCount: mistake.reviewCount + 1,
      lastAttemptedAt: mistake.lastReviewedAt?.toISOString() ?? mistake.createdAt.toISOString(),
    }));
  }

  async getLeaderboard(subjectKey: string) {
    const subject = await this.prisma.subject.findFirst({
      where: { code: subjectKey },
      select: { id: true },
    });
    if (!subject) {
      return [];
    }

    const topicIds = await this.prisma.topic.findMany({
      where: { subjectId: subject.id, deletedAt: null },
      select: { id: true },
    });
    const topicIdSet = new Set(topicIds.map((topic) => topic.id));

    const attempts = await this.prisma.quizAttempt.findMany({
      where: { status: 'COMPLETED' },
      orderBy: [{ score: 'desc' }, { completedAt: 'desc' }],
      take: 100,
      include: {
        user: { select: { id: true, profile: { select: { name: true } } } },
      },
    });

    const filtered = attempts.filter((attempt) => {
      const topicId = (attempt.metadata as { topicId?: string } | null)?.topicId;
      return topicId ? topicIdSet.has(topicId) : false;
    });

    return filtered.slice(0, 10).map((attempt, index) => ({
      userId: attempt.userId,
      displayName: attempt.user.profile?.name ?? 'Aspirant',
      score: Number(attempt.score),
      rank: index + 1,
    }));
  }
}
