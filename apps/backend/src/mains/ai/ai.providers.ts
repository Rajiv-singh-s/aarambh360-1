import { Injectable, Logger } from '@nestjs/common';
import type { AiGenerateInput, AiGenerateResult, AiProvider } from './ai.provider';

const DEFAULT_TIMEOUT_MS = 60_000;

async function fetchWithTimeout(
  url: string,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timer);
  }
}

@Injectable()
export class DevAiProvider implements AiProvider {
  readonly name = 'dev-stub';

  private readonly logger = new Logger(DevAiProvider.name);

  async generateStructured(input: AiGenerateInput): Promise<AiGenerateResult> {
    this.logger.debug('Dev AI evaluation stub invoked');
    const maxMarksMatch = input.userPrompt.match(/Maximum marks:\s*(\d+)/i);
    const maxMarks = maxMarksMatch ? Number(maxMarksMatch[1]) : 10;
    const totalMarks = Math.min(maxMarks, Math.max(1, Math.round(maxMarks * 0.62)));

    const payload = {
      totalMarks,
      relevanceScore: 72,
      dimensions: [
        {
          name: 'Introduction',
          score: Math.round(totalMarks * 0.12),
          maxScore: Math.round(maxMarks * 0.15),
          feedback: 'The introduction identifies the theme but could state a clearer thesis.',
        },
        {
          name: 'Content',
          score: Math.round(totalMarks * 0.28),
          maxScore: Math.round(maxMarks * 0.35),
          feedback: 'Core points are present; add more syllabus-aligned facts and examples.',
        },
        {
          name: 'Analysis',
          score: Math.round(totalMarks * 0.12),
          maxScore: Math.round(maxMarks * 0.2),
          feedback: 'Analysis is descriptive; compare perspectives and implications more deeply.',
        },
        {
          name: 'Structure',
          score: Math.round(totalMarks * 0.06),
          maxScore: Math.round(maxMarks * 0.15),
          feedback: 'Use clearer sub-headings and smoother transitions between sections.',
        },
        {
          name: 'Conclusion',
          score: Math.round(totalMarks * 0.04),
          maxScore: Math.round(maxMarks * 0.15),
          feedback: 'Conclude with a balanced, forward-looking summary tied to the question.',
        },
      ],
      strengths: ['Addresses the main demand of the question', 'Uses relevant terminology'],
      improvements: ['Deepen analytical layers with cause-effect links', 'Support claims with data or reports'],
      missingPoints: ['Constitutional/statutory angle where applicable', 'Contemporary policy linkage'],
      conclusion:
        'A workable answer that needs sharper analysis, richer evidence, and a stronger conclusion to reach top-band marks.',
    };

    return {
      text: JSON.stringify(payload),
      model: 'dev-stub',
      provider: this.name,
      usage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
    };
  }
}

@Injectable()
export class OpenAiEvaluationProvider implements AiProvider {
  readonly name = 'openai-gpt-4o-mini';

  private readonly logger = new Logger(OpenAiEvaluationProvider.name);
  private readonly apiKey = process.env.OPENAI_API_KEY;

  async generateStructured(input: AiGenerateInput): Promise<AiGenerateResult> {
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const response = await fetchWithTimeout(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: input.systemPrompt },
            { role: 'user', content: input.userPrompt },
          ],
          temperature: input.temperature ?? 0.2,
          max_tokens: input.maxTokens ?? 4096,
          response_format: { type: 'json_object' },
        }),
      },
      timeoutMs,
    );

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`OpenAI evaluation failed: ${body}`);
      throw new Error('AI provider request failed');
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
      usage?: { prompt_tokens?: number; completion_tokens?: number; total_tokens?: number };
    };
    const text = payload.choices?.[0]?.message?.content?.trim();
    if (!text) {
      throw new Error('AI provider returned empty response');
    }

    return {
      text,
      model: 'gpt-4o-mini',
      provider: this.name,
      usage: {
        promptTokens: payload.usage?.prompt_tokens,
        completionTokens: payload.usage?.completion_tokens,
        totalTokens: payload.usage?.total_tokens,
      },
    };
  }
}

@Injectable()
export class GeminiEvaluationProvider implements AiProvider {
  readonly name = 'gemini-1.5-flash';

  private readonly logger = new Logger(GeminiEvaluationProvider.name);
  private readonly apiKey = process.env.GEMINI_API_KEY;

  async generateStructured(input: AiGenerateInput): Promise<AiGenerateResult> {
    if (!this.apiKey) {
      throw new Error('GEMINI_API_KEY is not configured');
    }

    const timeoutMs = input.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    const model = process.env.GEMINI_MODEL ?? 'gemini-1.5-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.apiKey}`;

    const response = await fetchWithTimeout(
      url,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: input.systemPrompt }] },
          contents: [{ role: 'user', parts: [{ text: input.userPrompt }] }],
          generationConfig: {
            temperature: input.temperature ?? 0.2,
            maxOutputTokens: input.maxTokens ?? 4096,
            responseMimeType: 'application/json',
          },
        }),
      },
      timeoutMs,
    );

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Gemini evaluation failed: ${body}`);
      throw new Error('AI provider request failed');
    }

    const payload = (await response.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      usageMetadata?: {
        promptTokenCount?: number;
        candidatesTokenCount?: number;
        totalTokenCount?: number;
      };
    };

    const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (!text) {
      throw new Error('AI provider returned empty response');
    }

    return {
      text,
      model,
      provider: this.name,
      usage: {
        promptTokens: payload.usageMetadata?.promptTokenCount,
        completionTokens: payload.usageMetadata?.candidatesTokenCount,
        totalTokens: payload.usageMetadata?.totalTokenCount,
      },
    };
  }
}

export function createAiProvider(): AiProvider {
  const configured = (process.env.AI_PROVIDER ?? 'dev').toLowerCase();

  if (configured === 'gemini' && process.env.GEMINI_API_KEY) {
    return new GeminiEvaluationProvider();
  }
  if (configured === 'openai' && process.env.OPENAI_API_KEY) {
    return new OpenAiEvaluationProvider();
  }
  if (process.env.GEMINI_API_KEY && configured !== 'openai' && configured !== 'dev') {
    return new GeminiEvaluationProvider();
  }
  if (process.env.OPENAI_API_KEY && configured === 'openai') {
    return new OpenAiEvaluationProvider();
  }
  return new DevAiProvider();
}
