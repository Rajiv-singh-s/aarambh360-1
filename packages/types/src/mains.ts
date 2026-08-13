import type { MainsSubmissionStatus } from './domain';

export interface CreateMainsSubmissionRequestDto {
  mainsQuestionId: string;
  imageUrl?: string;
  imageUrls?: string[];
  storageKeys?: string[];
}

export interface MainsSubmissionAnswerDto {
  id: string;
  version: number;
  extractedText: string | null;
  wordCount: number;
  imageUrl: string | null;
  imageUrls: string[];
}

export interface MainsSubmissionDto {
  id: string;
  mainsQuestionId: string;
  status: MainsSubmissionStatus;
  submittedAt: string | null;
  ocrRetryCount: number;
  ocrError: string | null;
  evalRetryCount: number;
  evalError: string | null;
  answer: MainsSubmissionAnswerDto | null;
  evaluation?: import('./mains-evaluation').MainsEvaluationDto | null;
}
