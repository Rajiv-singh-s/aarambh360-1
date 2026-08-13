import { Injectable } from '@nestjs/common';

export interface ChunkInput {
  content: string;
  metadata?: Record<string, unknown>;
}

export interface GeneratedChunk extends ChunkInput {
  chunkIndex: number;
  tokenCount: number;
}

const CHUNK_SIZE = 2000;
const CHUNK_OVERLAP = 200;

@Injectable()
export class ChunkingService {
  chunkDocument(content: string, metadata?: Record<string, unknown>): GeneratedChunk[] {
    const normalized = content.replace(/\r\n/g, '\n').trim();
    if (!normalized) {
      return [];
    }

    if (normalized.length <= CHUNK_SIZE) {
      return [
        {
          chunkIndex: 0,
          content: normalized,
          tokenCount: this.estimateTokens(normalized),
          metadata,
        },
      ];
    }

    const chunks: GeneratedChunk[] = [];
    let start = 0;
    let chunkIndex = 0;

    while (start < normalized.length) {
      const end = Math.min(start + CHUNK_SIZE, normalized.length);
      const slice = normalized.slice(start, end).trim();
      if (slice.length > 0) {
        chunks.push({
          chunkIndex,
          content: slice,
          tokenCount: this.estimateTokens(slice),
          metadata,
        });
        chunkIndex += 1;
      }
      if (end >= normalized.length) {
        break;
      }
      start = Math.max(end - CHUNK_OVERLAP, start + 1);
    }

    return chunks;
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.split(/\s+/).filter(Boolean).length * 1.3);
  }
}
