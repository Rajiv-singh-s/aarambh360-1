export interface AiGenerateInput {
  systemPrompt: string;
  userPrompt: string;
  maxTokens?: number;
  temperature?: number;
  timeoutMs?: number;
}

export interface AiGenerateResult {
  text: string;
  model: string;
  provider: string;
  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };
}

export interface AiProvider {
  readonly name: string;
  generateStructured(input: AiGenerateInput): Promise<AiGenerateResult>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
