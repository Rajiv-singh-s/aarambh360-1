import { Injectable, Logger } from '@nestjs/common';
import type { EmbeddingProvider } from './embedding.provider';

@Injectable()
export class HashEmbeddingProvider implements EmbeddingProvider {
  readonly model = 'hash-embedding-v1';
  readonly dimensions = 1536;

  embed(text: string): Promise<number[]> {
    return Promise.resolve(this.hashToVector(text));
  }

  embedBatch(texts: string[]): Promise<number[][]> {
    return Promise.resolve(texts.map((text) => this.hashToVector(text)));
  }

  private hashToVector(text: string): number[] {
    const vector = new Array<number>(this.dimensions).fill(0);
    for (let index = 0; index < text.length; index += 1) {
      vector[index % this.dimensions]! += text.charCodeAt(index) / 255;
    }
    const norm = Math.sqrt(vector.reduce((sum, value) => sum + value * value, 0)) || 1;
    return vector.map((value) => Number((value / norm).toFixed(6)));
  }
}

@Injectable()
export class OpenAiEmbeddingProvider implements EmbeddingProvider {
  readonly model = 'text-embedding-3-small';
  readonly dimensions = 1536;

  private readonly logger = new Logger(OpenAiEmbeddingProvider.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async embed(text: string): Promise<number[]> {
    const [vector] = await this.embedBatch([text]);
    return vector;
  }

  async embedBatch(texts: string[]): Promise<number[][]> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: this.model,
        input: texts,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Embedding request failed: ${body}`);
      throw new Error('Embedding provider request failed');
    }

    const payload = (await response.json()) as {
      data?: Array<{ embedding: number[] }>;
    };
    return payload.data?.map((row) => row.embedding) ?? [];
  }
}

export function createEmbeddingProvider(): EmbeddingProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAiEmbeddingProvider();
  }
  return new HashEmbeddingProvider();
}
