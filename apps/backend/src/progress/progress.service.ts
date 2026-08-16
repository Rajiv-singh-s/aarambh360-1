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

    return streaks.map((streak) => {
      let dateStr = null;
      if (streak.lastActivityDate) {
        const d = streak.lastActivityDate;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        dateStr = `${year}-${month}-${day}`;
      }
      return {
        streakType: streak.streakType,
        currentCount: streak.currentCount,
        longestCount: streak.longestCount,
        lastActivityDate: dateStr,
      };
    });
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

    const quizzes = await this.prisma.quizAttempt.findMany({
      where: { userId, status: 'COMPLETED' },
      select: { id: true, completedAt: true },
    });
    const totalQuizzesTaken = quizzes.length;

    const activityDatesSet = new Set<string>();
    quizzes.forEach((q) => {
      if (q.completedAt) {
        const d = q.completedAt;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        activityDatesSet.add(`${year}-${month}-${day}`);
      }
    });

    const dailyActivities = await this.prisma.dailyActivity.findMany({
      where: { userId },
      select: { activityDate: true }
    });
    
    dailyActivities.forEach((da) => {
      if (da.activityDate) {
        const d = da.activityDate;
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        activityDatesSet.add(`${year}-${month}-${day}`);
      }
    });

    const userStreak = await this.prisma.userStreak.findFirst({
      where: { userId, streakType: 'MCQ' },
      select: { longestCount: true },
    });

    return {
      totalQuizzesTaken,
      totalQuestionsAnswered,
      totalCorrect,
      accuracy: Math.round(accuracy * 100) / 100,
      subjectBreakdown: Array.from(subjectMap.values()),
      activityDates: Array.from(activityDatesSet),
      longestStreak: userStreak?.longestCount ?? 0,
    };
  }

  async getMistakes(userId: string) {
    const mistakes = await this.prisma.mistake.findMany({
      where: { userId, resolvedAt: null },
      include: {
        question: {
          select: {
            text: true,
            explanation: true,
            options: {
              select: { id: true, text: true, isCorrect: true },
              orderBy: { sortOrder: 'asc' },
            },
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
      options: mistake.question.options,
      explanation: mistake.question.explanation,
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
