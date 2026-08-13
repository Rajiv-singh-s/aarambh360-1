import { Injectable, Logger } from '@nestjs/common';
import type { OcrExtractInput, OcrProvider } from './ocr.provider';

@Injectable()
export class DevOcrProvider implements OcrProvider {
  readonly name = 'dev-stub';

  private readonly logger = new Logger(DevOcrProvider.name);

  async extractText(input: OcrExtractInput): Promise<string> {
    this.logger.debug(`Dev OCR for page ${input.pageIndex + 1}: ${input.imageUrl}`);
    return `[Page ${input.pageIndex + 1}] Extracted answer text from uploaded image.`;
  }
}

@Injectable()
export class OpenAiVisionOcrProvider implements OcrProvider {
  readonly name = 'openai-gpt-4o-mini';

  private readonly logger = new Logger(OpenAiVisionOcrProvider.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async extractText(input: OcrExtractInput): Promise<string> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const imageResponse = await fetch(input.imageUrl);
    if (!imageResponse.ok) {
      throw new Error(`Unable to fetch image for OCR (${imageResponse.status})`);
    }

    const contentType = imageResponse.headers.get('content-type') ?? 'image/jpeg';
    const buffer = Buffer.from(await imageResponse.arrayBuffer());
    const dataUrl = `data:${contentType};base64,${buffer.toString('base64')}`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all handwritten and printed text exactly. Preserve paragraph breaks.',
              },
              { type: 'image_url', image_url: { url: dataUrl } },
            ],
          },
        ],
        max_tokens: 4096,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`OpenAI OCR failed: ${body}`);
      throw new Error('OCR provider request failed');
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('OCR provider returned empty text');
    }
    return text;
  }
}

export function createOcrProvider(): OcrProvider {
  if (process.env.OPENAI_API_KEY) {
    return new OpenAiVisionOcrProvider();
  }
  return new DevOcrProvider();
}
