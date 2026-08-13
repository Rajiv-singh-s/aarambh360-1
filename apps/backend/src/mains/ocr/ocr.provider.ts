export interface OcrExtractInput {
  imageUrl: string;
  pageIndex: number;
}

export interface OcrProvider {
  readonly name: string;
  extractText(input: OcrExtractInput): Promise<string>;
}

export const OCR_PROVIDER = Symbol('OCR_PROVIDER');
