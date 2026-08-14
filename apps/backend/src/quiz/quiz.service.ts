import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, QuizAttemptStatus, QuizType, StreakType } from '@prisma/client';
import type {
  CompleteQuizSessionResponseDto,
  QuizSessionDto,
  SubmitQuizAnswerRequestDto,
  SubmitQuizAnswerResponseDto,
} from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';
import { getIstActivityDate } from './quiz.utils';

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  async startSession(
    userId: string,
    topicId: string,
    count = 10,
  ): Promise<QuizSessionDto> {
    const safeCount = Math.min(Math.max(count, 1), 50);
    const topic = await this.prisma.topic.findFirst({
      where: { id: topicId, publishStatus: 'PUBLISHED', deletedAt: null },
      select: { id: true, name: true, subject: { select: { examId: true } } },
    });
    if (!topic) {
      throw new NotFoundException(`Topic not found: ${topicId}`);
    }

    const pool = await this.prisma.question.findMany({
      where: {
        publishStatus: 'PUBLISHED',
        deletedAt: null,
        type: { in: ['MCQ_SINGLE', 'MCQ_MULTI', 'ASSERTION_REASON'] },
        topicMappings: { some: { topicId } },
      },
      include: {
        options: { orderBy: { sortOrder: 'asc' } },
      },
      take: safeCount * 5,
    });

    if (pool.length < safeCount) {
      throw new BadRequestException(
        `Not enough questions for topic (${pool.length} available, ${safeCount} requested)`,
      );
    }

    const shuffled = pool.sort(() => Math.random() - 0.5).slice(0, safeCount);

    const quiz = await this.prisma.quiz.create({
      data: {
        examId: topic.subject.examId,
        title: `Practice: ${topic.name}`,
        quizType: QuizType.PRACTICE,
        questionCount: safeCount,
        publishStatus: 'PUBLISHED',
        metadata: { topicId, userId, adhoc: true },
        questions: {
          create: shuffled.map((question, index) => ({
            questionId: question.id,
            sortOrder: index,
          })),
        },
      },
    });

    const attempt = await this.prisma.quizAttempt.create({
      data: {
        userId,
        quizId: quiz.id,
        status: QuizAttemptStatus.IN_PROGRESS,
        totalQuestions: safeCount,
        metadata: { topicId },
      },
    });

    return {
      sessionId: attempt.id,
      quizId: quiz.id,
      topicId,
      totalQuestions: safeCount,
      status: attempt.status,
      startedAt: attempt.startedAt.toISOString(),
      questions: shuffled.map((question) => ({
        id: question.id,
        type: question.type,
        text: question.text,
        difficulty: question.difficulty,
        options: question.options.map((option) => ({
          id: option.id,
          label: option.label,
          text: option.text,
          sortOrder: option.sortOrder,
        })),
      })),
    };
  }

  async submitAnswer(
    userId: string,
    sessionId: string,
    payload: SubmitQuizAnswerRequestDto,
  ): Promise<SubmitQuizAnswerResponseDto> {
    const attempt = await this.getOwnedAttempt(userId, sessionId);

    if (attempt.status !== QuizAttemptStatus.IN_PROGRESS) {
      throw new BadRequestException('Quiz session is not in progress');
    }

    const questionInSession = await this.prisma.quizQuestion.findFirst({
      where: { quizId: attempt.quizId, questionId: payload.questionId },
    });
    if (!questionInSession) {
      throw new BadRequestException('Question is not part of this session');
    }

    const selectedOption = await this.prisma.questionOption.findFirst({
      where: {
        id: payload.selectedOptionId,
        questionId: payload.questionId,
      },
    });
    if (!selectedOption) {
      throw new BadRequestException('Invalid option for question');
    }

    const isCorrect = selectedOption.isCorrect;

    await this.prisma.quizAttemptAnswer.upsert({
      where: {
        attemptId_questionId: {
          attemptId: sessionId,
          questionId: payload.questionId,
        },
      },
      create: {
        attemptId: sessionId,
        questionId: payload.questionId,
        selectedOptionId: payload.selectedOptionId,
        isCorrect,
        timeTakenSeconds: payload.timeTakenSeconds ?? null,
      },
      update: {
        selectedOptionId: payload.selectedOptionId,
        isCorrect,
        timeTakenSeconds: payload.timeTakenSeconds ?? null,
        answeredAt: new Date(),
      },
    });

    await this.prisma.questionAttempt.create({
      data: {
        userId,
        questionId: payload.questionId,
        selectedOptionId: payload.selectedOptionId,
        isCorrect,
        timeTakenSeconds: payload.timeTakenSeconds ?? null,
      },
    });

    if (!isCorrect) {
      await this.prisma.mistake.upsert({
        where: {
          userId_questionId: { userId, questionId: payload.questionId },
        },
        create: { userId, questionId: payload.questionId },
        update: { lastReviewedAt: new Date(), resolvedAt: null },
      });
    }

    const correctOption = await this.prisma.questionOption.findFirst({
      where: { questionId: payload.questionId, isCorrect: true },
    });

    const question = await this.prisma.question.findUnique({
      where: { id: payload.questionId },
      select: { explanation: true },
    });

    return {
      questionId: payload.questionId,
      isCorrect,
      correctOptionId: correctOption?.id ?? payload.selectedOptionId,
      explanation: question?.explanation ?? null,
    };
  }

  async completeSession(
    userId: string,
    sessionId: string,
  ): Promise<CompleteQuizSessionResponseDto> {
    const attempt = await this.getOwnedAttempt(userId, sessionId);

    if (attempt.status === QuizAttemptStatus.COMPLETED) {
      return this.buildCompleteResponse(attempt);
    }

    const answers = await this.prisma.quizAttemptAnswer.findMany({
      where: { attemptId: sessionId },
    });

    const correctCount = answers.filter((answer) => answer.isCorrect).length;
    const incorrectCount = answers.length - correctCount;
    const totalQuestions = attempt.totalQuestions;
    const accuracy = totalQuestions > 0 ? (correctCount / totalQuestions) * 100 : 0;
    const score = correctCount;
    const completedAt = new Date();
    const timeTakenSeconds = Math.round(
      (completedAt.getTime() - attempt.startedAt.getTime()) / 1000,
    );

    const topicId =
      typeof (attempt.metadata as Record<string, unknown> | null)?.topicId === 'string'
        ? String((attempt.metadata as Record<string, unknown>).topicId)
        : null;

    await this.prisma.$transaction(async (tx) => {
      await tx.quizAttempt.update({
        where: { id: sessionId },
        data: {
          status: QuizAttemptStatus.COMPLETED,
          correctCount,
          incorrectCount,
          score,
          accuracy,
          timeTakenSeconds,
          completedAt,
        },
      });

      const activityDate = getIstActivityDate(completedAt);
      await tx.dailyActivity.upsert({
        where: { userId_activityDate: { userId, activityDate } },
        create: {
          userId,
          activityDate,
          questionsAnswered: answers.length,
          minutesStudied: Math.max(1, Math.round(timeTakenSeconds / 60)),
        },
        update: {
          questionsAnswered: { increment: answers.length },
          minutesStudied: { increment: Math.max(1, Math.round(timeTakenSeconds / 60)) },
        },
      });

      const streak = await tx.userStreak.findUnique({
        where: { userId_streakType: { userId, streakType: StreakType.MCQ } },
      });

      const yesterday = getIstActivityDate(new Date(activityDate.getTime() - 86400000));
      let currentCount = 1;
      let streakExtendedToday = true;

      if (streak?.lastActivityDate) {
        const last = getIstActivityDate(streak.lastActivityDate);
        if (last.getTime() === activityDate.getTime()) {
          currentCount = streak.currentCount;
          streakExtendedToday = false; // Already extended today
        } else if (last.getTime() === yesterday.getTime()) {
          currentCount = streak.currentCount + 1;
        }
      }

      await tx.userStreak.upsert({
        where: { userId_streakType: { userId, streakType: StreakType.MCQ } },
        create: {
          userId,
          streakType: StreakType.MCQ,
          currentCount,
          longestCount: currentCount,
          lastActivityDate: activityDate,
        },
        update: {
          currentCount,
          longestCount: Math.max(streak?.longestCount ?? 0, currentCount),
          lastActivityDate: activityDate,
        },
      });

      if (topicId) {
        await tx.topicProgress.upsert({
          where: { userId_topicId: { userId, topicId } },
          create: {
            userId,
            topicId,
            masteryPercent: Math.round(accuracy),
            questionsAttempted: answers.length,
            questionsCorrect: correctCount,
          },
          update: {
            masteryPercent: Math.round(accuracy),
            questionsAttempted: { increment: answers.length },
            questionsCorrect: { increment: correctCount },
          },
        });
      }
    });

    const updated = await this.prisma.quizAttempt.findUniqueOrThrow({
      where: { id: sessionId },
    });
    return this.buildCompleteResponse(updated);
  }

  private async getOwnedAttempt(userId: string, sessionId: string) {
    const attempt = await this.prisma.quizAttempt.findFirst({
      where: { id: sessionId, userId },
    });
    if (!attempt) {
      throw new NotFoundException(`Quiz session not found: ${sessionId}`);
    }
    return attempt;
  }

  private buildCompleteResponse(
    attempt: {
      id: string;
      correctCount: number;
      incorrectCount: number;
      totalQuestions: number;
      score: Prisma.Decimal;
      accuracy: Prisma.Decimal;
      timeTakenSeconds: number | null;
      completedAt: Date | null;
    },
  ): CompleteQuizSessionResponseDto {
    return {
      sessionId: attempt.id,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      totalQuestions: attempt.totalQuestions,
      score: Number(attempt.score),
      accuracy: Number(attempt.accuracy),
      timeTakenSeconds: attempt.timeTakenSeconds ?? 0,
      completedAt: attempt.completedAt?.toISOString() ?? new Date().toISOString(),
    };
  }
}
