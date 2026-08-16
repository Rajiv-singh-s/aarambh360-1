import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DailyChallengePaperType, SubmitDailyChallengeRequestDto, DailyChallengeDto, DailyChallengeAttemptDto, DailyChallengeLeaderboardResponseDto } from '@aarambh360/types';

@Injectable()
export class DailyChallengeService {
  constructor(private prisma: PrismaService) {}

  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  async getTodayChallenges(userId: string): Promise<{ data: DailyChallengeDto[] }> {
    const today = this.getTodayDateString();
    let challenges = await this.prisma.dailyChallenge.findMany({
      where: { date: today, isActive: true },
      include: {
        prelimsQuestions: { include: { question: { include: { options: true } } } },
        mainsQuestion: { include: { mainsQuestion: true } },
      },
    });

    if (challenges.length === 0) {
      challenges = (await this.generateTodayChallenges(today)) as any;
    }

    const challengeIds = challenges.map(c => c.id);
    const userAttempts = await this.prisma.dailyChallengeAttempt.findMany({
      where: {
        userId,
        challengeId: { in: challengeIds }
      }
    });

    const attemptedChallengeIds = new Set(userAttempts.map(a => a.challengeId));

    const mapped = challenges.map(c => this.mapChallengeToDto(c, attemptedChallengeIds.has(c.id)));
    return { data: mapped };
  }

  private async generateTodayChallenges(date: string) {
    const p1Questions = await this.prisma.question.findMany({ where: { type: 'MCQ_SINGLE', publishStatus: 'PUBLISHED' }, take: 50 });
    const p2Questions = await this.prisma.question.findMany({ where: { type: 'MCQ_MULTI', publishStatus: 'PUBLISHED' }, take: 50 });
    const mainsQ = await this.prisma.mainsQuestion.findFirst({ where: { publishStatus: 'PUBLISHED' } });

    const created = [];

    if (p1Questions.length > 0) {
      created.push(await this.prisma.dailyChallenge.create({
        data: {
          date, paperType: 'PRELIMS_1', timeLimitMinutes: 25, totalQuestions: p1Questions.length,
          prelimsQuestions: { create: p1Questions.map((q, i) => ({ questionId: q.id, sortOrder: i })) }
        },
        include: { prelimsQuestions: { include: { question: { include: { options: true } } } }, mainsQuestion: true }
      }));
    }

    if (p2Questions.length > 0) {
      created.push(await this.prisma.dailyChallenge.create({
        data: {
          date, paperType: 'PRELIMS_2', timeLimitMinutes: 25, totalQuestions: p2Questions.length,
          prelimsQuestions: { create: p2Questions.map((q, i) => ({ questionId: q.id, sortOrder: i })) }
        },
        include: { prelimsQuestions: { include: { question: { include: { options: true } } } }, mainsQuestion: true }
      }));
    }

    if (mainsQ) {
      created.push(await this.prisma.dailyChallenge.create({
        data: {
          date, paperType: 'MAINS', timeLimitMinutes: 20, totalQuestions: 1,
          mainsQuestion: { create: { mainsQuestionId: mainsQ.id } }
        },
        include: { prelimsQuestions: { include: { question: { include: { options: true } } } }, mainsQuestion: { include: { mainsQuestion: true } } }
      }));
    }

    return created;
  }

  private mapChallengeToDto(challenge: any, isAttempted: boolean = false): DailyChallengeDto {
    return {
      id: challenge.id,
      date: challenge.date,
      paperType: challenge.paperType as DailyChallengePaperType,
      timeLimitMinutes: challenge.timeLimitMinutes,
      totalQuestions: challenge.totalQuestions,
      isActive: challenge.isActive,
      isAttempted,
      questions: challenge.prelimsQuestions?.map((pq: any) => ({
        id: pq.question.id,
        text: pq.question.text,
        type: pq.question.type,
        options: pq.question.options.map((o: any) => ({
          id: o.id, text: o.text, label: o.label
        })),
        explanation: pq.question.explanation
      })),
      mainsQuestion: challenge.mainsQuestion && challenge.mainsQuestion.mainsQuestion ? {
        id: challenge.mainsQuestion.mainsQuestion.id,
        text: challenge.mainsQuestion.mainsQuestion.text,
        gsPaper: challenge.mainsQuestion.mainsQuestion.gsPaper,
        maxMarks: challenge.mainsQuestion.mainsQuestion.maxMarks,
      } : undefined
    };
  }

  async submitChallenge(userId: string, payload: SubmitDailyChallengeRequestDto): Promise<{ data: DailyChallengeAttemptDto }> {
    const challenge = await this.prisma.dailyChallenge.findUnique({
      where: { id: payload.challengeId },
      include: { prelimsQuestions: { include: { question: { include: { options: true } } } } }
    });

    if (!challenge) throw new NotFoundException('Challenge not found');

    let score = 0;
    let accuracy = 0;
    const maxTime = challenge.timeLimitMinutes * 60;
    const consumedTime = payload.consumedTimeSeconds;

    if (payload.paperType === 'PRELIMS_1' || payload.paperType === 'PRELIMS_2') {
      let correctCount = 0;
      let incorrectCount = 0;

      if (payload.answers) {
        for (const ans of payload.answers) {
          const qMap = challenge.prelimsQuestions.find(pq => pq.questionId === ans.questionId);
          if (qMap) {
            const correctOpt = qMap.question.options.find(o => o.isCorrect);
            if (correctOpt && correctOpt.id === ans.selectedOptionId) {
              correctCount++;
            } else {
              incorrectCount++;
            }
          }
        }
      }
      
      const scoreFromAnswers = (correctCount * 1) - (incorrectCount * 0.33);
      const timeBonus = Math.max(0, (maxTime - consumedTime) * 0.01);
      score = scoreFromAnswers + timeBonus;
      accuracy = payload.answers && payload.answers.length > 0 ? (correctCount / payload.answers.length) * 100 : 0;
    } else {
      score = 5;
      accuracy = 100;
    }

    const attempt = await this.prisma.dailyChallengeAttempt.upsert({
      where: { challengeId_userId: { challengeId: challenge.id, userId } },
      create: {
        challengeId: challenge.id,
        userId,
        paperType: payload.paperType,
        score,
        accuracy,
        consumedTimeSeconds: consumedTime,
        mainsAnswerText: payload.mainsAnswerText,
      },
      update: {
        score,
        accuracy,
        consumedTimeSeconds: consumedTime,
        mainsAnswerText: payload.mainsAnswerText,
        completedAt: new Date(),
      }
    });

    return {
      data: {
        id: attempt.id,
        challengeId: attempt.challengeId,
        userId: attempt.userId,
        paperType: attempt.paperType as DailyChallengePaperType,
        score: Number(attempt.score),
        accuracy: Number(attempt.accuracy),
        consumedTimeSeconds: attempt.consumedTimeSeconds,
        completedAt: attempt.completedAt.toISOString(),
      }
    };
  }

  async getLeaderboard(paperType: DailyChallengePaperType, period: string): Promise<{ data: DailyChallengeLeaderboardResponseDto }> {
    const attempts = await this.prisma.dailyChallengeAttempt.findMany({
      where: { paperType },
      orderBy: [ { score: 'desc' }, { consumedTimeSeconds: 'asc' } ],
      take: 100,
      include: { user: { include: { profile: true } } },
    });

    const entries = attempts.map((a, idx) => ({
      userId: a.userId,
      name: a.user.profile?.name || 'Anonymous',
      avatarUrl: a.user.profile?.avatarUrl || null,
      rank: idx + 1,
      score: Number(a.score),
      accuracy: Number(a.accuracy),
      timeTakenSeconds: a.consumedTimeSeconds,
      isCurrentUser: false,
    }));

    return {
      data: {
        paperType,
        period: period as any,
        entries,
      }
    };
  }
}
