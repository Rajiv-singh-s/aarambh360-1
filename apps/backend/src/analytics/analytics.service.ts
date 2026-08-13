import { Injectable } from '@nestjs/common';
import { LearningEventType, Prisma } from '@prisma/client';
import type {
  LearningAnalyticsProfileDto,
  LearningRecommendationsDto,
  TrackLearningEventRequestDto,
} from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';
import { ProgressService } from '../progress/progress.service';

@Injectable()
export class AnalyticsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly progressService: ProgressService,
  ) {}

  async trackEvent(userId: string, payload: TrackLearningEventRequestDto) {
    const event = await this.prisma.learningEvent.create({
      data: {
        userId,
        eventType: payload.eventType as LearningEventType,
        entityType: payload.entityType,
        entityId: payload.entityId,
        metadata: (payload.metadata ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });

    return {
      id: event.id,
      eventType: event.eventType,
      createdAt: event.createdAt.toISOString(),
    };
  }

  async getProfile(userId: string): Promise<LearningAnalyticsProfileDto> {
    const stats = await this.progressService.getStats(userId);
    const recentActivityCount = await this.prisma.learningEvent.count({
      where: {
        userId,
        createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
      },
    });
    const mainsSubmissions = await this.prisma.mainsSubmission.count({ where: { userId } });
    const mainsEvaluations = await this.prisma.mainsEvaluation.count({
      where: { submission: { userId } },
    });

    const subjectBreakdown = stats.subjectBreakdown.map((entry) => ({
      subjectId: entry.subjectId,
      subjectName: entry.subjectName,
      attempted: entry.attempted,
      correct: entry.correct,
      accuracy: entry.attempted > 0 ? Math.round((entry.correct / entry.attempted) * 10000) / 100 : 0,
    }));

    const sorted = [...subjectBreakdown].sort((a, b) => b.accuracy - a.accuracy);
    const strongAreas = sorted.filter((entry) => entry.attempted >= 5 && entry.accuracy >= 70).slice(0, 3);
    const weakAreas = [...subjectBreakdown]
      .filter((entry) => entry.attempted >= 3 && entry.accuracy < 60)
      .sort((a, b) => a.accuracy - b.accuracy)
      .slice(0, 3);

    return {
      totalQuestionsAnswered: stats.totalQuestionsAnswered,
      totalCorrect: stats.totalCorrect,
      accuracy: stats.accuracy,
      strongAreas,
      weakAreas,
      recentActivityCount,
      mainsSubmissions,
      mainsEvaluations,
    };
  }

  async getRecommendations(userId: string): Promise<LearningRecommendationsDto> {
    const profile = await this.getProfile(userId);
    const recommendations: LearningRecommendationsDto['recommendations'] = [];

    if (profile.weakAreas.length > 0) {
      const weakest = profile.weakAreas[0]!;
      recommendations.push({
        type: 'QUIZ',
        title: `Practice ${weakest.subjectName}`,
        reason: `Accuracy is ${weakest.accuracy}% — targeted MCQ practice can help.`,
        subjectId: weakest.subjectId,
      });
    }

    if (profile.mainsSubmissions === 0) {
      recommendations.push({
        type: 'MAINS',
        title: 'Try your first Mains answer',
        reason: 'Daily Mains writing builds answer-writing muscle for UPSC.',
      });
    } else if (profile.mainsEvaluations < profile.mainsSubmissions) {
      recommendations.push({
        type: 'MAINS',
        title: 'Evaluate a pending Mains answer',
        reason: 'AI feedback helps identify structure and content gaps.',
      });
    }

    if (profile.recentActivityCount < 3) {
      recommendations.push({
        type: 'REVISION',
        title: 'Resume your study streak',
        reason: 'Consistent daily activity improves retention for Prelims and Mains.',
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'TOPIC',
        title: 'Explore a new syllabus topic',
        reason: 'Balanced coverage across GS papers is important for UPSC.',
      });
    }

    return { recommendations };
  }

  async getRecentEvents(userId: string, limit = 20) {
    const events = await this.prisma.learningEvent.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
    });
    return events.map((event) => ({
      id: event.id,
      eventType: event.eventType,
      entityType: event.entityType,
      entityId: event.entityId,
      createdAt: event.createdAt.toISOString(),
    }));
  }
}
