import { Injectable, Logger } from '@nestjs/common';
import { PublishStatus, RagDocumentType } from '@prisma/client';
import type { RagIngestStatsDto } from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';
import { ChunkingService } from './chunking.service';
import { EMBEDDING_PROVIDER, type EmbeddingProvider } from './embedding/embedding.provider';
import { Inject } from '@nestjs/common';

@Injectable()
export class IngestionService {
  private readonly logger = new Logger(IngestionService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly chunkingService: ChunkingService,
    @Inject(EMBEDDING_PROVIDER) private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async ingestAllPublishedContent(): Promise<RagIngestStatsDto> {
    const stats: RagIngestStatsDto = {
      documentsProcessed: 0,
      chunksCreated: 0,
      embeddingsCreated: 0,
      skipped: 0,
    };

    const lessons = await this.prisma.lesson.findMany({
      where: { publishStatus: PublishStatus.PUBLISHED, deletedAt: null, content: { not: null } },
      include: { chapter: { include: { subject: true } } },
    });

    for (const lesson of lessons) {
      if (!lesson.content?.trim()) {
        stats.skipped += 1;
        continue;
      }
      await this.ingestDocument({
        documentType: RagDocumentType.NCERT,
        title: lesson.title,
        sourceRef: lesson.id,
        metadata: {
          subjectId: lesson.chapter.subjectId,
          gsPaper: lesson.chapter.subject.gsPaper,
          publishStatus: lesson.publishStatus,
          slug: lesson.slug,
        },
        content: lesson.content,
      });
      stats.documentsProcessed += 1;
    }

    const mainsQuestions = await this.prisma.mainsQuestion.findMany({
      where: {
        publishStatus: PublishStatus.PUBLISHED,
        deletedAt: null,
        modelAnswer: { not: null },
      },
      include: { subject: true },
    });

    for (const question of mainsQuestions) {
      if (!question.modelAnswer?.trim()) {
        stats.skipped += 1;
        continue;
      }
      await this.ingestDocument({
        documentType: RagDocumentType.MODEL_ANSWER,
        title: question.text.slice(0, 120),
        sourceRef: question.id,
        metadata: {
          subjectId: question.subjectId,
          gsPaper: question.gsPaper,
          publishStatus: question.publishStatus,
        },
        content: question.modelAnswer,
      });
      stats.documentsProcessed += 1;
    }

    const syllabusNodes = await this.prisma.syllabusNode.findMany({
      where: { publishStatus: PublishStatus.PUBLISHED, description: { not: null } },
    });

    for (const node of syllabusNodes) {
      if (!node.description?.trim()) {
        stats.skipped += 1;
        continue;
      }
      await this.ingestDocument({
        documentType: RagDocumentType.SYLLABUS,
        title: node.title,
        sourceRef: node.id,
        metadata: {
          examId: node.examId,
          topicId: node.topicId,
          publishStatus: node.publishStatus,
        },
        content: node.description,
      });
      stats.documentsProcessed += 1;
    }

    const chunkCount = await this.prisma.ragChunk.count();
    const embeddingCount = await this.prisma.ragEmbedding.count();
    stats.chunksCreated = chunkCount;
    stats.embeddingsCreated = embeddingCount;
    return stats;
  }

  async ingestLessonById(lessonId: string): Promise<void> {
    const lesson = await this.prisma.lesson.findFirst({
      where: { id: lessonId, publishStatus: PublishStatus.PUBLISHED, deletedAt: null },
      include: { chapter: { include: { subject: true } } },
    });
    if (!lesson?.content?.trim()) {
      return;
    }

    await this.ingestDocument({
      documentType: RagDocumentType.NCERT,
      title: lesson.title,
      sourceRef: lesson.id,
      metadata: {
        subjectId: lesson.chapter.subjectId,
        gsPaper: lesson.chapter.subject.gsPaper,
        publishStatus: lesson.publishStatus,
      },
      content: lesson.content,
    });
  }

  private async ingestDocument(input: {
    documentType: RagDocumentType;
    title: string;
    sourceRef: string;
    metadata?: Record<string, unknown>;
    content: string;
  }) {
    const existing = await this.prisma.ragDocument.findFirst({
      where: { sourceRef: input.sourceRef, documentType: input.documentType },
      select: { id: true },
    });

    const document = existing
      ? await this.prisma.ragDocument.update({
          where: { id: existing.id },
          data: {
            title: input.title,
            metadata: input.metadata as never,
            isActive: true,
          },
        })
      : await this.prisma.ragDocument.create({
          data: {
            documentType: input.documentType,
            title: input.title,
            sourceRef: input.sourceRef,
            metadata: input.metadata as never,
            isActive: true,
          },
        });

    await this.prisma.ragChunk.deleteMany({ where: { documentId: document.id } });

    const chunks = this.chunkingService.chunkDocument(input.content, input.metadata);
    if (chunks.length === 0) {
      return;
    }

    const vectors = await this.embeddingProvider.embedBatch(chunks.map((chunk) => chunk.content));

    for (let index = 0; index < chunks.length; index += 1) {
      const chunk = chunks[index]!;
      const createdChunk = await this.prisma.ragChunk.create({
        data: {
          documentId: document.id,
          chunkIndex: chunk.chunkIndex,
          content: chunk.content,
          tokenCount: chunk.tokenCount,
          metadata: chunk.metadata as never,
        },
      });

      await this.storeEmbedding(createdChunk.id, vectors[index]!);
    }
  }

  private async storeEmbedding(chunkId: string, vector: number[]) {
    const vectorLiteral = `[${vector.join(',')}]`;
    await this.prisma.$executeRawUnsafe(
      `
      INSERT INTO rag_embeddings (id, chunk_id, model, dimensions, embedding, created_at)
      VALUES (gen_random_uuid(), $1::uuid, $2, $3, $4::vector, NOW())
      ON CONFLICT (chunk_id)
      DO UPDATE SET
        model = EXCLUDED.model,
        dimensions = EXCLUDED.dimensions,
        embedding = EXCLUDED.embedding,
        created_at = NOW()
      `,
      chunkId,
      this.embeddingProvider.model,
      this.embeddingProvider.dimensions,
      vectorLiteral,
    );
  }
}
