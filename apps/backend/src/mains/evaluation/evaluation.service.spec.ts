import { BadRequestException, NotFoundException } from '@nestjs/common';
import { EvaluationService } from './evaluation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RagService } from '../../rag/rag.service';
import type { AiProvider } from '../ai/ai.provider';

describe('EvaluationService', () => {
  let service: EvaluationService;
  let prisma: Record<string, any>;
  let ragService: { search: jest.Mock };
  let usageService: { check: jest.Mock; consume: jest.Mock };
  let notificationsService: { notifyMainsEvaluationComplete: jest.Mock };
  let analyticsService: { trackEvent: jest.Mock };
  let aiProvider: { generateStructured: jest.Mock; name: string };

  beforeEach(() => {
    prisma = {
      mainsSubmission: { findFirst: jest.fn(), update: jest.fn() },
      mainsAnswer: { update: jest.fn() },
      mainsEvaluation: { count: jest.fn(), create: jest.fn(), delete: jest.fn() },
      $transaction: jest.fn((ops: unknown[]) => Promise.all(ops)),
    };
    ragService = { search: jest.fn().mockResolvedValue([]) };
    usageService = {
      check: jest.fn().mockResolvedValue({ allowed: true, unlimited: false, remaining: 1 }),
      consume: jest.fn().mockResolvedValue({ allowed: true }),
    };
    notificationsService = { notifyMainsEvaluationComplete: jest.fn().mockResolvedValue(undefined) };
    analyticsService = { trackEvent: jest.fn().mockResolvedValue(undefined) };
    aiProvider = {
      name: 'dev-stub',
      generateStructured: jest.fn().mockResolvedValue({
        text: JSON.stringify({
          totalMarks: 6,
          relevanceScore: 70,
          dimensions: [
            { name: 'Introduction', score: 1, maxScore: 2, feedback: 'Clear opening.' },
            { name: 'Content', score: 2, maxScore: 4, feedback: 'Covers basics.' },
            { name: 'Analysis', score: 1, maxScore: 2, feedback: 'Needs depth.' },
            { name: 'Structure', score: 1, maxScore: 1, feedback: 'Organized.' },
            { name: 'Conclusion', score: 1, maxScore: 1, feedback: 'Adequate close.' },
          ],
          strengths: ['Relevant points'],
          improvements: ['Add examples'],
          missingPoints: ['Policy linkage'],
          conclusion: 'Promising draft with room to improve.',
        }),
        model: 'dev-stub',
        provider: 'dev-stub',
      }),
    };

    service = new EvaluationService(
      prisma as unknown as PrismaService,
      ragService as unknown as RagService,
      usageService as unknown as import('../../subscriptions/entitlement.service').UsageService,
      notificationsService as unknown as import('../../notifications/notifications.service').NotificationsService,
      analyticsService as unknown as import('../../analytics/analytics.service').AnalyticsService,
      aiProvider as unknown as AiProvider,
    );
  });

  it('rejects evaluation when OCR is incomplete', async () => {
    prisma.mainsSubmission.findFirst.mockResolvedValue({
      id: 'sub-1',
      status: 'SUBMITTED',
      evalRetryCount: 0,
      evalError: null,
      answers: [{ extractedText: 'answer text' }],
      evaluations: [],
      mainsQuestion: { maxMarks: 10 },
    });

    await expect(service.requestEvaluation('user-1', 'sub-1')).rejects.toThrow(BadRequestException);
  });

  it('returns existing evaluation without re-processing', async () => {
    const existing = {
      id: 'eval-1',
      submissionId: 'sub-1',
      answerId: 'ans-1',
      score: 6,
      maxScore: 10,
      relevanceScore: 70,
      feedbackJson: {
        totalMarks: 6,
        maxMarks: 10,
        relevanceScore: 70,
        dimensions: [],
        strengths: [],
        weaknesses: [],
        missingPoints: [],
        suggestions: [],
        conclusion: 'ok',
        sources: [],
      },
      evaluationMeta: { model: 'dev-stub', rubricVersion: 'upsc-v1' },
      evaluatedAt: new Date(),
    };

    prisma.mainsSubmission.findFirst.mockResolvedValue({
      id: 'sub-1',
      mainsQuestionId: 'q-1',
      status: 'EVALUATED',
      submittedAt: new Date(),
      ocrRetryCount: 0,
      ocrError: null,
      evalRetryCount: 0,
      evalError: null,
      answers: [
        {
          id: 'ans-1',
          version: 1,
          extractedText: 'answer text',
          wordCount: 2,
          imageUrl: null,
          imageUrls: [],
        },
      ],
      evaluations: [existing],
      mainsQuestion: { maxMarks: 10 },
    });

    const result = await service.requestEvaluation('user-1', 'sub-1');
    expect(result.evaluation?.id).toBe('eval-1');
    expect(aiProvider.generateStructured).not.toHaveBeenCalled();
  });

  it('processes evaluation and persists structured feedback', async () => {
    prisma.mainsSubmission.findFirst
      .mockResolvedValueOnce({
        id: 'sub-1',
        mainsQuestionId: 'q-1',
        status: 'EVALUATED',
        submittedAt: new Date(),
        ocrRetryCount: 0,
        ocrError: null,
        evalRetryCount: 0,
        evalError: null,
        answers: [
          {
            id: 'ans-1',
            version: 1,
            extractedText: 'answer text',
            wordCount: 2,
            imageUrl: null,
            imageUrls: [],
          },
        ],
        evaluations: [],
        mainsQuestion: { maxMarks: 10 },
      })
      .mockResolvedValueOnce({
        id: 'sub-1',
        userId: 'user-1',
        status: 'EVALUATED',
        evalRetryCount: 0,
        answers: [{ id: 'ans-1', extractedText: 'answer text' }],
        evaluations: [],
        mainsQuestion: {
          text: 'Discuss federalism',
          maxMarks: 10,
          gsPaper: 'GS2',
          subjectId: null,
          modelAnswer: null,
          rubricJson: null,
        },
      });

    prisma.mainsEvaluation.count.mockResolvedValue(0);
    prisma.mainsSubmission.update.mockResolvedValue({});
    prisma.mainsEvaluation.create.mockResolvedValue({});

    await service.requestEvaluation('user-1', 'sub-1');
    await service.processEvaluation('sub-1', 'user-1', {});

    expect(ragService.search).toHaveBeenCalled();
    expect(aiProvider.generateStructured).toHaveBeenCalled();
    expect(prisma.mainsEvaluation.create).toHaveBeenCalled();
  });

  it('throws when evaluation is missing on dedicated fetch', async () => {
    prisma.mainsSubmission.findFirst.mockResolvedValue({
      id: 'sub-1',
      status: 'EVALUATED',
      answers: [{ extractedText: 'text' }],
      evaluations: [],
      mainsQuestion: { maxMarks: 10 },
    });

    await expect(service.getEvaluation('user-1', 'sub-1')).rejects.toThrow(NotFoundException);
  });
});
