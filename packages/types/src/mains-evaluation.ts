export interface MainsEvaluationDimensionDto {
  name: string;
  score: number;
  maxScore: number;
  feedback: string;
}

export interface MainsEvaluationSourceDto {
  chunkId: string;
  title: string;
  documentType: string;
  score: number;
}

export interface MainsEvaluationFeedbackDto {
  totalMarks: number;
  maxMarks: number;
  relevanceScore: number;
  dimensions: MainsEvaluationDimensionDto[];
  strengths: string[];
  weaknesses: string[];
  missingPoints: string[];
  suggestions: string[];
  conclusion: string;
  sources: MainsEvaluationSourceDto[];
}

export interface MainsEvaluationDto {
  id: string;
  submissionId: string;
  answerId: string;
  score: number;
  maxScore: number;
  relevanceScore: number | null;
  feedback: MainsEvaluationFeedbackDto;
  evaluatedAt: string;
  model: string;
  rubricVersion: string;
}

export interface EvaluateMainsSubmissionRequestDto {
  answerText?: string;
  force?: boolean;
}

export interface MainsSubmissionSummaryDto {
  id: string;
  mainsQuestionId: string;
  status: string;
  submittedAt: string | null;
  score: number | null;
  maxScore: number | null;
  hasEvaluation: boolean;
}
