import { Injectable } from '@nestjs/common';
import { RagDocumentType } from '@prisma/client';
import type { RagIndexStatsDto, RagSearchRequestDto, RagSearchResultDto } from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';
import { EMBEDDING_PROVIDER, type EmbeddingProvider } from './embedding/embedding.provider';
import { Inject } from '@nestjs/common';

type RawSearchRow = {
  chunk_id: string;
  document_id: string;
  document_type: RagDocumentType;
  title: string;
  content: string;
  metadata: Record<string, unknown> | null;
  source_ref: string | null;
  distance: number;
};

@Injectable()
export class RagService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(EMBEDDING_PROVIDER) private readonly embeddingProvider: EmbeddingProvider,
  ) {}

  async search(payload: RagSearchRequestDto): Promise<RagSearchResultDto[]> {
    const topK = Math.min(Math.max(payload.topK ?? 5, 1), 20);
    const queryVector = await this.embeddingProvider.embed(payload.query);
    const vectorLiteral = `[${queryVector.join(',')}]`;

    const rows = await this.prisma.$queryRawUnsafe<RawSearchRow[]>(
      `
      SELECT
        c.id AS chunk_id,
        d.id AS document_id,
        d.document_type,
        d.title,
        c.content,
        c.metadata,
        d.source_ref,
        (e.embedding <=> $1::vector) AS distance
      FROM rag_embeddings e
      INNER JOIN rag_chunks c ON c.id = e.chunk_id
      INNER JOIN rag_documents d ON d.id = c.document_id
      WHERE d.is_active = true
        AND ($2::text IS NULL OR d.metadata->>'gsPaper' = $2)
        AND ($3::text IS NULL OR d.metadata->>'subjectId' = $3)
        AND ($4::text IS NULL OR d.document_type::text = $4)
      ORDER BY distance ASC
      LIMIT $5
      `,
      vectorLiteral,
      payload.gsPaper ?? null,
      payload.subjectId ?? null,
      payload.documentType ?? null,
      topK,
    );

    return rows.map((row) => ({
      chunkId: row.chunk_id,
      documentId: row.document_id,
      documentType: row.document_type,
      title: row.title,
      content: row.content,
      score: Number((1 - row.distance).toFixed(4)),
      metadata: row.metadata,
      sourceRef: row.source_ref,
    }));
  }

  async getIndexStats(): Promise<RagIndexStatsDto> {
    const [documents, chunks, embeddings, grouped] = await Promise.all([
      this.prisma.ragDocument.count({ where: { isActive: true } }),
      this.prisma.ragChunk.count(),
      this.prisma.ragEmbedding.count(),
      this.prisma.ragDocument.groupBy({
        by: ['documentType'],
        where: { isActive: true },
        _count: { _all: true },
      }),
    ]);

    const byDocumentType = grouped.reduce<Record<string, number>>((acc, row) => {
      acc[row.documentType] = row._count._all;
      return acc;
    }, {});

    return { documents, chunks, embeddings, byDocumentType };
  }
}
