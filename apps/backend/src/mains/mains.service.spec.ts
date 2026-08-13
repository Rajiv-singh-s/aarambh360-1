import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { MainsService } from './mains.service';
import { PrismaService } from '../prisma/prisma.service';
import { EvaluationService } from './evaluation/evaluation.service';
import { OcrService } from './ocr/ocr.service';

describe('MainsService', () => {
  let service: MainsService;
  let prisma: Record<string, any>;
  let ocrService: { enqueue: jest.Mock };
  let evaluationService: { toSubmissionDto: jest.Mock };

  beforeEach(() => {
    prisma = {
      mainsQuestion: { findFirst: jest.fn() },
      mainsSubmission: {
        count: jest.fn(),
        create: jest.fn(),
        findFirst: jest.fn(),
        findMany: jest.fn(),
        update: jest.fn(),
      },
    };
    ocrService = { enqueue: jest.fn() };
    evaluationService = {
      toSubmissionDto: jest.fn((submission) => ({
        id: submission.id,
        mainsQuestionId: submission.mainsQuestionId,
        status: submission.status,
        submittedAt: submission.submittedAt?.toISOString?.() ?? null,
        ocrRetryCount: submission.ocrRetryCount ?? 0,
        ocrError: submission.ocrError ?? null,
        evalRetryCount: submission.evalRetryCount ?? 0,
        evalError: submission.evalError ?? null,
        answer: submission.answers?.[0] ?? null,
        evaluation: null,
      })),
    };
    service = new MainsService(
      prisma as unknown as PrismaService,
      ocrService as unknown as OcrService,
      evaluationService as unknown as EvaluationService,
    );
  });

  it('rejects submission when question is missing', async () => {
    prisma.mainsSubmission.count.mockResolvedValue(0);
    prisma.mainsQuestion.findFirst.mockResolvedValue(null);

    await expect(
      service.createSubmission('user-1', {
        mainsQuestionId: 'missing',
        imageUrl: 'https://assets.aarambh360.local/mains_answer/user-1/file.png?dev-upload=1',
      }),
    ).rejects.toThrow(NotFoundException);
  });

  it('rejects foreign storage keys', async () => {
    prisma.mainsSubmission.count.mockResolvedValue(0);
    prisma.mainsQuestion.findFirst.mockResolvedValue({ id: 'q-1' });

    await expect(
      service.createSubmission('user-1', {
        mainsQuestionId: 'q-1',
        storageKeys: ['mains_answer/user-2/file.png'],
      }),
    ).rejects.toThrow(ForbiddenException);
  });

  it('creates submission and enqueues OCR', async () => {
    prisma.mainsSubmission.count.mockResolvedValue(0);
    prisma.mainsQuestion.findFirst.mockResolvedValue({ id: 'q-1' });
    prisma.mainsSubmission.create.mockResolvedValue({
      id: 'sub-1',
      mainsQuestionId: 'q-1',
      status: 'SUBMITTED',
      submittedAt: new Date(),
      ocrRetryCount: 0,
      ocrError: null,
      evalRetryCount: 0,
      evalError: null,
      answers: [
        {
          id: 'ans-1',
          version: 1,
          extractedText: null,
          wordCount: 0,
          imageUrl: 'https://assets.aarambh360.local/mains_answer/user-1/a.png?dev-upload=1',
          imageUrls: ['https://assets.aarambh360.local/mains_answer/user-1/a.png?dev-upload=1'],
        },
      ],
      evaluations: [],
      mainsQuestion: { maxMarks: 10 },
    });

    const result = await service.createSubmission('user-1', {
      mainsQuestionId: 'q-1',
      storageKeys: ['mains_answer/user-1/a.png'],
    });

    expect(result.id).toBe('sub-1');
    expect(ocrService.enqueue).toHaveBeenCalledWith('sub-1');
  });
});
