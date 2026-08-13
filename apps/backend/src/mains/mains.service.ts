import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { MainsSubmissionStatus, PublishStatus } from '@prisma/client';
import type {
  CreateMainsSubmissionRequestDto,
  MainsSubmissionDto,
  MainsSubmissionSummaryDto,
} from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';
import { EvaluationService } from './evaluation/evaluation.service';
import { OcrService } from './ocr/ocr.service';

const MAX_OCR_REQUESTS_PER_HOUR = 10;
const ALLOWED_IMAGE_PREFIXES = ['mains_answer/', 'avatar/', 'lesson_asset/'];

@Injectable()
export class MainsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ocrService: OcrService,
    private readonly evaluationService: EvaluationService,
  ) {}

  async createSubmission(userId: string, payload: CreateMainsSubmissionRequestDto): Promise<MainsSubmissionDto> {
    await this.assertRateLimit(userId);

    const question = await this.prisma.mainsQuestion.findFirst({
      where: {
        id: payload.mainsQuestionId,
        publishStatus: PublishStatus.PUBLISHED,
        deletedAt: null,
      },
      select: { id: true },
    });
    if (!question) {
      throw new NotFoundException('Mains question not found');
    }

    const imageUrls = this.resolveSubmissionUrls(userId, payload);
    if (imageUrls.length === 0) {
      throw new BadRequestException('At least one image URL or storage key is required');
    }

    const submission = await this.prisma.mainsSubmission.create({
      data: {
        userId,
        mainsQuestionId: payload.mainsQuestionId,
        status: MainsSubmissionStatus.SUBMITTED,
        submittedAt: new Date(),
        answers: {
          create: {
            imageUrl: imageUrls[0],
            imageUrls,
          },
        },
      },
      include: {
        answers: { where: { isActive: true } },
        evaluations: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
        mainsQuestion: { select: { maxMarks: true } },
      },
    });

    this.ocrService.enqueue(submission.id);
    return this.evaluationService.toSubmissionDto(submission);
  }

  async listSubmissions(userId: string, limit = 20): Promise<MainsSubmissionSummaryDto[]> {
    const capped = Math.min(Math.max(limit, 1), 50);
    const rows = await this.prisma.mainsSubmission.findMany({
      where: { userId },
      orderBy: { submittedAt: 'desc' },
      take: capped,
      include: {
        evaluations: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
        mainsQuestion: { select: { maxMarks: true } },
      },
    });

    return rows.map((row) => {
      const evaluation = row.evaluations[0];
      return {
        id: row.id,
        mainsQuestionId: row.mainsQuestionId,
        status: row.status,
        submittedAt: row.submittedAt?.toISOString() ?? null,
        score: evaluation ? Number(evaluation.score) : null,
        maxScore: evaluation ? Number(evaluation.maxScore) : row.mainsQuestion.maxMarks,
        hasEvaluation: Boolean(evaluation),
      };
    });
  }

  async getSubmission(userId: string, submissionId: string): Promise<MainsSubmissionDto> {
    const submission = await this.prisma.mainsSubmission.findFirst({
      where: { id: submissionId, userId },
      include: {
        answers: { where: { isActive: true } },
        evaluations: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
        mainsQuestion: { select: { maxMarks: true } },
      },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    return this.evaluationService.toSubmissionDto(submission);
  }

  async retrySubmission(userId: string, submissionId: string): Promise<MainsSubmissionDto> {
    const submission = await this.prisma.mainsSubmission.findFirst({
      where: { id: submissionId, userId },
      include: {
        answers: { where: { isActive: true } },
        evaluations: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
        mainsQuestion: { select: { maxMarks: true } },
      },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    if (submission.status !== MainsSubmissionStatus.FAILED) {
      throw new BadRequestException('Only failed submissions can be retried');
    }
    if (submission.ocrRetryCount >= 3) {
      throw new BadRequestException('Maximum OCR retries reached');
    }

    await this.assertRateLimit(userId);

    const updated = await this.prisma.mainsSubmission.update({
      where: { id: submissionId },
      data: {
        status: MainsSubmissionStatus.SUBMITTED,
        ocrError: null,
        submittedAt: new Date(),
      },
      include: {
        answers: { where: { isActive: true } },
        evaluations: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
        mainsQuestion: { select: { maxMarks: true } },
      },
    });

    this.ocrService.enqueue(submissionId);
    return this.evaluationService.toSubmissionDto(updated);
  }

  private async assertRateLimit(userId: string) {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.prisma.mainsSubmission.count({
      where: {
        userId,
        submittedAt: { gte: since },
        status: { not: MainsSubmissionStatus.DRAFT },
      },
    });
    if (count >= MAX_OCR_REQUESTS_PER_HOUR) {
      throw new HttpException('OCR rate limit exceeded (10 submissions per hour)', HttpStatus.TOO_MANY_REQUESTS);
    }
  }

  private resolveSubmissionUrls(userId: string, payload: CreateMainsSubmissionRequestDto): string[] {
    const publicBase = process.env.R2_PUBLIC_BASE_URL ?? 'https://assets.aarambh360.local';
    const urls: string[] = [];

    if (payload.storageKeys?.length) {
      for (const key of payload.storageKeys) {
        this.assertOwnedStorageKey(userId, key);
        urls.push(`${publicBase}/${key}`);
      }
    }

    if (payload.imageUrls?.length) {
      for (const url of payload.imageUrls) {
        this.assertOwnedImageUrl(userId, url);
        urls.push(url);
      }
    }

    if (payload.imageUrl) {
      this.assertOwnedImageUrl(userId, payload.imageUrl);
      urls.push(payload.imageUrl);
    }

    return [...new Set(urls)];
  }

  private assertOwnedStorageKey(userId: string, key: string) {
    const allowed = ALLOWED_IMAGE_PREFIXES.some((prefix) => key.startsWith(`${prefix}${userId}/`));
    if (!allowed) {
      throw new ForbiddenException('Storage key does not belong to current user');
    }
  }

  private assertOwnedImageUrl(userId: string, url: string) {
    if (url.includes('dev-upload=1')) {
      const allowed = ALLOWED_IMAGE_PREFIXES.some((prefix) => url.includes(`/${prefix}${userId}/`));
      if (!allowed) {
        throw new ForbiddenException('Image URL does not belong to current user');
      }
      return;
    }

    const allowed = ALLOWED_IMAGE_PREFIXES.some((prefix) => url.includes(`/${prefix}${userId}/`));
    if (!allowed) {
      throw new ForbiddenException('Image URL does not belong to current user');
    }
  }
}
