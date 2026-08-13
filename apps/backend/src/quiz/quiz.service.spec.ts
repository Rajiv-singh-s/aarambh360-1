import { BadRequestException, NotFoundException } from '@nestjs/common';
import { QuizAttemptStatus, QuizType, StreakType } from '@prisma/client';
import { QuizService } from './quiz.service';
import { PrismaService } from '../prisma/prisma.service';

describe('QuizService', () => {
  let service: QuizService;
  let prisma: Record<string, any>;

  beforeEach(() => {
    prisma = {
      topic: { findFirst: jest.fn() },
      question: { findMany: jest.fn(), findUnique: jest.fn() },
      quiz: { create: jest.fn() },
      quizAttempt: {
        create: jest.fn(),
        findFirst: jest.fn(),
        findUniqueOrThrow: jest.fn(),
        update: jest.fn(),
      },
      quizQuestion: { findFirst: jest.fn() },
      questionOption: { findFirst: jest.fn() },
      quizAttemptAnswer: { upsert: jest.fn(), findMany: jest.fn() },
      questionAttempt: { create: jest.fn() },
      mistake: { upsert: jest.fn() },
      userStreak: { findUnique: jest.fn(), upsert: jest.fn() },
      dailyActivity: { upsert: jest.fn() },
      topicProgress: { upsert: jest.fn() },
      $transaction: jest.fn(async (callback) => callback(prisma)),
    };

    service = new QuizService(prisma as unknown as PrismaService);
  });

  it('rejects startSession when topic is missing', async () => {
    prisma.topic.findFirst.mockResolvedValue(null);
    await expect(service.startSession('user-1', 'missing-topic')).rejects.toThrow(
      NotFoundException,
    );
  });

  it('creates session with shuffled questions', async () => {
    prisma.topic.findFirst.mockResolvedValue({
      id: 'topic-1',
      name: 'Polity',
      subject: { examId: 'exam-1' },
    });
    prisma.question.findMany.mockResolvedValue(
      Array.from({ length: 12 }, (_, index) => ({
        id: `q-${index}`,
        type: 'MCQ_SINGLE',
        text: `Question ${index}`,
        difficulty: 'MEDIUM',
        options: [{ id: `o-${index}`, label: 'A', text: 'Option', sortOrder: 0, isCorrect: true }],
      })),
    );
    prisma.quiz.create.mockResolvedValue({ id: 'quiz-1' });
    prisma.quizAttempt.create.mockResolvedValue({
      id: 'attempt-1',
      status: QuizAttemptStatus.IN_PROGRESS,
      startedAt: new Date('2026-08-13T00:00:00.000Z'),
    });

    const session = await service.startSession('user-1', 'topic-1', 10);

    expect(session.sessionId).toBe('attempt-1');
    expect(session.questions).toHaveLength(10);
    expect(prisma.quiz.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ quizType: QuizType.PRACTICE }),
      }),
    );
  });

  it('scores answer correctly and records mistake on wrong answer', async () => {
    prisma.quizAttempt.findFirst.mockResolvedValue({
      id: 'attempt-1',
      userId: 'user-1',
      quizId: 'quiz-1',
      status: QuizAttemptStatus.IN_PROGRESS,
      totalQuestions: 10,
      startedAt: new Date(),
      metadata: { topicId: 'topic-1' },
    });
    prisma.quizQuestion.findFirst.mockResolvedValue({ id: 'qq-1' });
    prisma.questionOption.findFirst
      .mockResolvedValueOnce({ id: 'opt-wrong', isCorrect: false })
      .mockResolvedValueOnce({ id: 'opt-correct', isCorrect: true });
    prisma.question.findUnique.mockResolvedValue({ explanation: 'Because...' });

    const result = await service.submitAnswer('user-1', 'attempt-1', {
      questionId: 'q-1',
      selectedOptionId: 'opt-wrong',
    });

    expect(result.isCorrect).toBe(false);
    expect(result.correctOptionId).toBe('opt-correct');
    expect(prisma.mistake.upsert).toHaveBeenCalled();
  });

  it('rejects submitAnswer when session is not in progress', async () => {
    prisma.quizAttempt.findFirst.mockResolvedValue({
      id: 'attempt-1',
      userId: 'user-1',
      quizId: 'quiz-1',
      status: QuizAttemptStatus.COMPLETED,
    });

    await expect(
      service.submitAnswer('user-1', 'attempt-1', {
        questionId: 'q-1',
        selectedOptionId: 'opt-1',
      }),
    ).rejects.toThrow(BadRequestException);
  });

  it('completes session and updates streak in transaction', async () => {
    const startedAt = new Date('2026-08-13T10:00:00.000Z');
    prisma.quizAttempt.findFirst.mockResolvedValue({
      id: 'attempt-1',
      userId: 'user-1',
      quizId: 'quiz-1',
      status: QuizAttemptStatus.IN_PROGRESS,
      totalQuestions: 2,
      correctCount: 0,
      incorrectCount: 0,
      score: 0,
      accuracy: 0,
      timeTakenSeconds: 0,
      startedAt,
      completedAt: null,
      metadata: { topicId: 'topic-1' },
    });
    prisma.quizAttemptAnswer.findMany.mockResolvedValue([
      { isCorrect: true },
      { isCorrect: false },
    ]);
    prisma.userStreak.findUnique.mockResolvedValue(null);
    prisma.quizAttempt.findUniqueOrThrow.mockResolvedValue({
      id: 'attempt-1',
      correctCount: 1,
      incorrectCount: 1,
      totalQuestions: 2,
      score: 1,
      accuracy: 50,
      timeTakenSeconds: 120,
      completedAt: new Date(),
    });

    const result = await service.completeSession('user-1', 'attempt-1');

    expect(result.correctCount).toBe(1);
    expect(result.incorrectCount).toBe(1);
    expect(result.score).toBe(1);
    expect(prisma.$transaction).toHaveBeenCalled();
    expect(prisma.userStreak.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { userId_streakType: { userId: 'user-1', streakType: StreakType.MCQ } },
      }),
    );
  });
});
