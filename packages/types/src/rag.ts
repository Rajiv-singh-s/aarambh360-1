import type { RagDocumentType } from './domain';

export interface RagSearchRequestDto {
  query: string;
  topK?: number;
  gsPaper?: string;
  subjectId?: string;
  documentType?: RagDocumentType;
}

export interface RagSearchResultDto {
  chunkId: string;
  documentId: string;
  documentType: RagDocumentType;
  title: string;
  content: string;
  score: number;
  metadata: Record<string, unknown> | null;
  sourceRef: string | null;
}

export interface RagIngestStatsDto {
  documentsProcessed: number;
  chunksCreated: number;
  embeddingsCreated: number;
  skipped: number;
}

export interface RagIndexStatsDto {
  documents: number;
  chunks: number;
  embeddings: number;
  byDocumentType: Record<string, number>;
}
