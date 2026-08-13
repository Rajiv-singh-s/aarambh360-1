import {
  BadRequestException,
  ForbiddenException,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { MainsSubmissionStatus, Prisma } from '@prisma/client';
import type {
  EvaluateMainsSubmissionRequestDto,
  MainsEvaluationDto,
  MainsEvaluationFeedbackDto,
  MainsSubmissionDto,
} from '@aarambh360/types';
import { FEATURE_CODES } from '@aarambh360/types';
import { AnalyticsService } from '../../analytics/analytics.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RagService } from '../../rag/rag.service';
import { UsageService } from '../../subscriptions/entitlement.service';
import { AI_PROVIDER, type AiProvider } from '../ai/ai.provider';
import {
  attachEvaluationSources,
  parseAndValidateEvaluationResponse,
} from './evaluation.validator';
import {
  UPSC_RUBRIC_VERSION,
  buildEvaluationSystemPrompt,
  buildEvaluationUserPrompt,
} from './prompts/upsc-rubric';

const MAX_EVAL_REQUESTS_PER_HOUR = 10;
const MAX_JSON_RETRIES = 2;
const RAG_TOP_K = 5;
const MAX_ANSWER_CHARS = 12_000;
const MAX_RAG_CHUNK_CHARS = 1_200;

@Injectable()
export class EvaluationService {
  private readonly logger = new Logger(EvaluationService.name);
  private readonly processing = new Set<string>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly ragService: RagService,
    private readonly usageService: UsageService,
    private readonly notificationsService: NotificationsService,
    private readonly analyticsService: AnalyticsService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AiProvider,
  ) {}

  enqueue(submissionId: string, userId: string, payload: EvaluateMainsSubmissionRequestDto) {
    setImmediate(() => {
      this.processEvaluation(submissionId, userId, payload).catch((error) => {
        this.logger.error(
          `Evaluation job failed for ${submissionId}`,
          error instanceof Error ? error.stack : undefined,
        );
      });
    });
  }

  async requestEvaluation(
    userId: string,
    submissionId: string,
    payload: EvaluateMainsSubmissionRequestDto = {},
  ): Promise<MainsSubmissionDto> {
    const submission = await this.loadOwnedSubmission(userId, submissionId);
    this.assertEvaluable(submission);

    const existing = submission.evaluations[0];
    if (existing && !payload.force) {
      return this.toSubmissionDto(submission, existing);
    }

    if (this.processing.has(submissionId)) {
      return this.toSubmissionDto(submission, existing ?? null);
    }

    if (!existing || payload.force) {
      const usage = await this.usageService.check(userId, FEATURE_CODES.MAINS_EVAL);
      if (!usage.allowed) {
        throw new ForbiddenException(usage.reason ?? 'Mains evaluation quota exceeded');
      }
    }

    await this.assertEvaluationRateLimit(userId);

    if (payload.answerText?.trim()) {
      const answer = submission.answers[0];
      if (!answer) {
        throw new BadRequestException('Answer record missing');
      }
      const normalized = payload.answerText.trim().slice(0, MAX_ANSWER_CHARS);
      await this.prisma.mainsAnswer.update({
        where: { id: answer.id },
        data: {
          extractedText: normalized,
          wordCount: normalized.split(/\s+/).filter(Boolean).length,
        },
      });
      submission.answers[0] = { ...answer, extractedText: normalized };
    }

    if (payload.force && existing) {
      await this.prisma.mainsEvaluation.delete({ where: { id: existing.id } });
      submission.evaluations = [];
    }

    await this.prisma.mainsSubmission.update({
      where: { id: submissionId },
      data: { evalError: null },
    });

    this.enqueue(submissionId, userId, payload);
    return this.toSubmissionDto(submission, null);
  }

  async getEvaluation(userId: string, submissionId: string): Promise<MainsEvaluationDto> {
    const submission = await this.loadOwnedSubmission(userId, submissionId);
    const evaluation = submission.evaluations[0];
    if (!evaluation) {
      throw new NotFoundException('Evaluation not found');
    }
    return this.toEvaluationDto(evaluation, submission.mainsQuestion.maxMarks);
  }

  async processEvaluation(
    submissionId: string,
    userId: string,
    _payload: EvaluateMainsSubmissionRequestDto,
  ): Promise<void> {
    if (this.processing.has(submissionId)) {
      return;
    }

    this.processing.add(submissionId);

    try {
      const submission = await this.prisma.mainsSubmission.findFirst({
        where: { id: submissionId, userId },
        include: {
          answers: { where: { isActive: true }, orderBy: { version: 'asc' } },
          evaluations: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
          mainsQuestion: {
            select: {
              text: true,
              maxMarks: true,
              gsPaper: true,
              subjectId: true,
              modelAnswer: true,
              rubricJson: true,
            },
          },
        },
      });

      if (!submission) {
        return;
      }

      if (submission.evaluations[0]) {
        return;
      }

      this.assertEvaluable(submission);
      const answer = submission.answers[0];
      if (!answer?.extractedText?.trim()) {
        await this.markEvalFailed(submissionId, submission.evalRetryCount, 'Answer text is required');
        return;
      }

      const answerText = answer.extractedText.trim().slice(0, MAX_ANSWER_CHARS);
      const question = submission.mainsQuestion;
      const ragQuery = `${question.text}\n\n${answerText.slice(0, 500)}`;

      const ragResults = await this.ragService.search({
        query: ragQuery,
        topK: RAG_TOP_K,
        gsPaper: question.gsPaper,
        subjectId: question.subjectId ?? undefined,
      });

      const ragChunks = ragResults.map((result) => ({
        title: result.title,
        content: result.content.slice(0, MAX_RAG_CHUNK_CHARS),
        documentType: result.documentType,
        sourceRef: result.sourceRef,
      }));

      let feedback: MainsEvaluationFeedbackDto | null = null;
      let aiMeta: Record<string, unknown> = {};
      let lastError = 'Evaluation response validation failed';

      for (let attempt = 0; attempt <= MAX_JSON_RETRIES; attempt += 1) {
        try {
          const aiResult = await this.aiProvider.generateStructured({
            systemPrompt: buildEvaluationSystemPrompt(),
            userPrompt: buildEvaluationUserPrompt({
              questionText: question.text,
              maxMarks: question.maxMarks,
              gsPaper: question.gsPaper,
              subjectId: question.subjectId,
              modelAnswer: question.modelAnswer,
              rubricJson: question.rubricJson,
              answerText,
              ragChunks,
              strict: attempt > 0,
            }),
            maxTokens: 4096,
            temperature: attempt > 0 ? 0.1 : 0.2,
            timeoutMs: 60_000,
          });

          feedback = parseAndValidateEvaluationResponse(aiResult.text, question.maxMarks);
          feedback = attachEvaluationSources(
            feedback,
            ragResults.map((result) => ({
              chunkId: result.chunkId,
              title: result.title,
              documentType: result.documentType,
              score: result.score,
            })),
          );
          aiMeta = {
            provider: aiResult.provider,
            model: aiResult.model,
            usage: aiResult.usage ?? null,
            rubricVersion: UPSC_RUBRIC_VERSION,
            ragChunkCount: ragResults.length,
          };
          break;
        } catch (error) {
          lastError = error instanceof Error ? error.message : 'Evaluation failed';
          this.logger.warn(`Evaluation attempt ${attempt + 1} failed for ${submissionId}: ${lastError}`);
        }
      }

      if (!feedback) {
        const nextRetry = submission.evalRetryCount + 1;
        await this.markEvalFailed(submissionId, nextRetry, lastError);
        return;
      }

      await this.prisma.$transaction([
        this.prisma.mainsEvaluation.create({
          data: {
            submissionId,
            answerId: answer.id,
            score: feedback.totalMarks,
            maxScore: question.maxMarks,
            relevanceScore: feedback.relevanceScore,
            feedbackJson: feedback as unknown as Prisma.InputJsonValue,
            evaluationMeta: aiMeta as Prisma.InputJsonValue,
          },
        }),
        this.prisma.mainsSubmission.update({
          where: { id: submissionId },
          data: {
            status: MainsSubmissionStatus.EVALUATED,
            evalError: null,
          },
        }),
      ]);

      await this.usageService.consume(submission.userId, FEATURE_CODES.MAINS_EVAL);
      await this.notificationsService.notifyMainsEvaluationComplete(
        submission.userId,
        submissionId,
        feedback.totalMarks,
        question.maxMarks,
      );
      await this.analyticsService.trackEvent(submission.userId, {
        eventType: 'MAINS_EVALUATED',
        entityType: 'mains_submission',
        entityId: submissionId,
        metadata: { score: feedback.totalMarks, maxMarks: question.maxMarks },
      });
    } finally {
      this.processing.delete(submissionId);
    }
  }

  private async loadOwnedSubmission(userId: string, submissionId: string) {
    const submission = await this.prisma.mainsSubmission.findFirst({
      where: { id: submissionId, userId },
      include: {
        answers: { where: { isActive: true }, orderBy: { version: 'asc' } },
        evaluations: { orderBy: { evaluatedAt: 'desc' }, take: 1 },
        mainsQuestion: { select: { maxMarks: true } },
      },
    });
    if (!submission) {
      throw new NotFoundException('Submission not found');
    }
    return submission;
  }

  private assertEvaluable(submission: {
    status: MainsSubmissionStatus;
    answers: Array<{ extractedText: string | null }>;
  }) {
    if (submission.status !== MainsSubmissionStatus.EVALUATED) {
      throw new BadRequestException('Submission must complete OCR before evaluation');
    }
    if (!submission.answers[0]?.extractedText?.trim()) {
      throw new BadRequestException('OCR text is required before evaluation');
    }
  }

  private async assertEvaluationRateLimit(userId: string) {
    const since = new Date(Date.now() - 60 * 60 * 1000);
    const count = await this.prisma.mainsEvaluation.count({
      where: {
        submission: { userId },
        evaluatedAt: { gte: since },
      },
    });
    if (count >= MAX_EVAL_REQUESTS_PER_HOUR) {
      throw new HttpException(
        'Evaluation rate limit exceeded (10 evaluations per hour)',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  private async markEvalFailed(submissionId: string, retryCount: number, message: string) {
    await this.prisma.mainsSubmission.update({
      where: { id: submissionId },
      data: {
        evalRetryCount: retryCount,
        evalError: message.slice(0, 500),
      },
    });
  }

  toEvaluationDto(
    evaluation: {
      id: string;
      submissionId: string;
      answerId: string;
      score: { toNumber?: () => number } | number;
      maxScore: { toNumber?: () => number } | number;
      relevanceScore: { toNumber?: () => number } | number | null;
      feedbackJson: unknown;
      evaluationMeta: unknown;
      evaluatedAt: Date;
    },
    fallbackMaxMarks: number,
  ): MainsEvaluationDto {
    const feedback = evaluation.feedbackJson as MainsEvaluationFeedbackDto;
    const meta = (evaluation.evaluationMeta ?? {}) as Record<string, unknown>;
    return {
      id: evaluation.id,
      submissionId: evaluation.submissionId,
      answerId: evaluation.answerId,
      score: this.toNumber(evaluation.score),
      maxScore: this.toNumber(evaluation.maxScore, fallbackMaxMarks),
      relevanceScore:
        evaluation.relevanceScore == null ? null : this.toNumber(evaluation.relevanceScore),
      feedback,
      evaluatedAt: evaluation.evaluatedAt.toISOString(),
      model: typeof meta.model === 'string' ? meta.model : 'unknown',
      rubricVersion:
        typeof meta.rubricVersion === 'string' ? meta.rubricVersion : UPSC_RUBRIC_VERSION,
    };
  }

  toSubmissionDto(
    submission: {
      id: string;
      mainsQuestionId: string;
      status: MainsSubmissionStatus;
      submittedAt: Date | null;
      ocrRetryCount: number;
      ocrError: string | null;
      evalRetryCount: number;
      evalError: string | null;
      answers: Array<{
        id: string;
        version: number;
        extractedText: string | null;
        wordCount: number;
        imageUrl: string | null;
        imageUrls: unknown;
      }>;
      evaluations: Array<{
        id: string;
        submissionId: string;
        answerId: string;
        score: { toNumber?: () => number } | number;
        maxScore: { toNumber?: () => number } | number;
        relevanceScore: { toNumber?: () => number } | number | null;
        feedbackJson: unknown;
        evaluationMeta: unknown;
        evaluatedAt: Date;
      }>;
      mainsQuestion?: { maxMarks: number };
    },
    evaluationOverride?: {
      id: string;
      submissionId: string;
      answerId: string;
      score: { toNumber?: () => number } | number;
      maxScore: { toNumber?: () => number } | number;
      relevanceScore: { toNumber?: () => number } | number | null;
      feedbackJson: unknown;
      evaluationMeta: unknown;
      evaluatedAt: Date;
    } | null,
  ): MainsSubmissionDto {
    const answer = submission.answers[0] ?? null;
    const evaluationRecord = evaluationOverride ?? submission.evaluations[0] ?? null;
    const maxMarks = submission.mainsQuestion?.maxMarks ?? this.toNumber(evaluationRecord?.maxScore, 10);

    return {
      id: submission.id,
      mainsQuestionId: submission.mainsQuestionId,
      status: submission.status,
      submittedAt: submission.submittedAt?.toISOString() ?? null,
      ocrRetryCount: submission.ocrRetryCount,
      ocrError: submission.ocrError,
      evalRetryCount: submission.evalRetryCount,
      evalError: submission.evalError,
      answer: answer
        ? {
            id: answer.id,
            version: answer.version,
            extractedText: answer.extractedText,
            wordCount: answer.wordCount,
            imageUrl: answer.imageUrl,
            imageUrls: Array.isArray(answer.imageUrls)
              ? answer.imageUrls.filter((value): value is string => typeof value === 'string')
              : answer.imageUrl
                ? [answer.imageUrl]
                : [],
          }
        : null,
      evaluation: evaluationRecord
        ? this.toEvaluationDto(evaluationRecord, maxMarks)
        : null,
    };
  }

  private toNumber(value: { toNumber?: () => number } | number | undefined, fallback = 0): number {
    if (value == null) {
      return fallback;
    }
    if (typeof value === 'number') {
      return value;
    }
    if (typeof value.toNumber === 'function') {
      return value.toNumber();
    }
    return fallback;
  }
}
