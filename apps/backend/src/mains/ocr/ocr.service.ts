import { Injectable, Logger, Inject } from '@nestjs/common';
import { MainsSubmissionStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { OCR_PROVIDER, type OcrProvider } from './ocr.provider';

const MAX_OCR_RETRIES = 3;

@Injectable()
export class OcrService {
  private readonly logger = new Logger(OcrService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(OCR_PROVIDER) private readonly ocrProvider: OcrProvider,
  ) {}

  enqueue(submissionId: string) {
    setImmediate(() => {
      this.processSubmission(submissionId).catch((error) => {
        this.logger.error(`OCR job failed for ${submissionId}`, error instanceof Error ? error.stack : undefined);
      });
    });
  }

  async processSubmission(submissionId: string): Promise<void> {
    const submission = await this.prisma.mainsSubmission.findUnique({
      where: { id: submissionId },
      include: {
        answers: { where: { isActive: true }, orderBy: { version: 'asc' } },
      },
    });

    if (!submission) {
      return;
    }

    if (
      submission.status !== MainsSubmissionStatus.SUBMITTED &&
      submission.status !== MainsSubmissionStatus.FAILED
    ) {
      return;
    }

    const answer = submission.answers[0];
    if (!answer) {
      await this.markFailed(submissionId, submission.ocrRetryCount, 'Answer record missing');
      return;
    }

    const imageUrls = this.resolveImageUrls(answer.imageUrl, answer.imageUrls);

    await this.prisma.mainsSubmission.update({
      where: { id: submissionId },
      data: { status: MainsSubmissionStatus.EVALUATING, ocrError: null },
    });

    try {
      const pageTexts: string[] = [];
      for (let index = 0; index < imageUrls.length; index += 1) {
        const text = await this.ocrProvider.extractText({
          imageUrl: imageUrls[index]!,
          pageIndex: index,
        });
        pageTexts.push(text.trim());
      }

      const extractedText = pageTexts.join('\n\n');
      const wordCount = extractedText.split(/\s+/).filter(Boolean).length;

      await this.prisma.$transaction([
        this.prisma.mainsAnswer.update({
          where: { id: answer.id },
          data: { extractedText, wordCount },
        }),
        this.prisma.mainsSubmission.update({
          where: { id: submissionId },
          data: {
            status: MainsSubmissionStatus.EVALUATED,
            ocrError: null,
          },
        }),
      ]);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'OCR processing failed';
      const nextRetry = submission.ocrRetryCount + 1;
      if (nextRetry >= MAX_OCR_RETRIES) {
        await this.markFailed(submissionId, nextRetry, message);
      } else {
        await this.prisma.mainsSubmission.update({
          where: { id: submissionId },
          data: {
            status: MainsSubmissionStatus.SUBMITTED,
            ocrRetryCount: nextRetry,
            ocrError: message,
          },
        });
      }
    }
  }

  private resolveImageUrls(imageUrl: string | null, imageUrls: unknown): string[] {
    if (Array.isArray(imageUrls)) {
      return imageUrls.filter((value): value is string => typeof value === 'string' && value.length > 0);
    }
    return imageUrl ? [imageUrl] : [];
  }

  private async markFailed(submissionId: string, retryCount: number, message: string) {
    await this.prisma.mainsSubmission.update({
      where: { id: submissionId },
      data: {
        status: MainsSubmissionStatus.FAILED,
        ocrRetryCount: retryCount,
        ocrError: message,
      },
    });
  }
}
