export type LearningEventTypeDto =
  | 'QUIZ_COMPLETED'
  | 'MAINS_SUBMITTED'
  | 'MAINS_EVALUATED'
  | 'LESSON_READ'
  | 'STUDY_SESSION'
  | 'APP_OPEN';

export interface TrackLearningEventRequestDto {
  eventType: LearningEventTypeDto;
  entityType?: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

export interface SubjectPerformanceDto {
  subjectId: string;
  subjectName: string;
  attempted: number;
  correct: number;
  accuracy: number;
}

export interface LearningAnalyticsProfileDto {
  totalQuestionsAnswered: number;
  totalCorrect: number;
  accuracy: number;
  strongAreas: SubjectPerformanceDto[];
  weakAreas: SubjectPerformanceDto[];
  recentActivityCount: number;
  mainsSubmissions: number;
  mainsEvaluations: number;
}

export interface RecommendationDto {
  type: 'TOPIC' | 'QUIZ' | 'MAINS' | 'REVISION';
  title: string;
  reason: string;
  subjectId?: string;
  topicId?: string;
}

export interface LearningRecommendationsDto {
  recommendations: RecommendationDto[];
}
