import { MainsSubmissionStatus } from '@prisma/client';
import { OcrService } from './ocr.service';
import { PrismaService } from '../../prisma/prisma.service';
import type { OcrProvider } from './ocr.provider';

describe('OcrService', () => {
  let service: OcrService;
  let prisma: Record<string, any>;
  let provider: OcrProvider;

  beforeEach(() => {
    provider = {
      name: 'test-provider',
      extractText: jest.fn(async ({ pageIndex }) => `Page ${pageIndex + 1} text`),
    };
    prisma = {
      mainsSubmission: { findUnique: jest.fn(), update: jest.fn() },
      mainsAnswer: { update: jest.fn() },
      $transaction: jest.fn(async (ops) => Promise.all(ops)),
    };
    service = new OcrService(prisma as unknown as PrismaService, provider);
  });

  it('stores concatenated OCR text and marks submission evaluated', async () => {
    prisma.mainsSubmission.findUnique.mockResolvedValue({
      id: 'sub-1',
      status: MainsSubmissionStatus.SUBMITTED,
      ocrRetryCount: 0,
      answers: [
        {
          id: 'ans-1',
          imageUrl: 'https://example.com/a.png',
          imageUrls: ['https://example.com/a.png', 'https://example.com/b.png'],
        },
      ],
    });

    await service.processSubmission('sub-1');

    expect(provider.extractText).toHaveBeenCalledTimes(2);
    expect(prisma.mainsAnswer.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          extractedText: expect.stringContaining('Page 1 text'),
          wordCount: expect.any(Number),
        }),
      }),
    );
  });
});
