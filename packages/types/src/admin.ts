import type { PublishStatus } from './domain';

export interface AdminDashboardStatsDto {
  subjects: number;
  topics: number;
  lessons: number;
  questions: number;
  mainsQuestions: number;
  pendingReview: number;
}

export interface AdminSubjectInputDto {
  examId: string;
  code: string;
  name: string;
  description?: string;
  sortOrder?: number;
  publishStatus?: PublishStatus;
}

export interface AdminQuestionInputDto {
  examId?: string;
  topicId: string;
  type: string;
  text: string;
  difficulty?: string;
  explanation?: string;
  publishStatus?: PublishStatus;
  options: Array<{ label: string; text: string; isCorrect: boolean }>;
}

export interface AdminTopicInputDto {
  subjectId: string;
  name: string;
  slug: string;
  description?: string;
  sortOrder?: number;
  publishStatus?: PublishStatus;
}

export interface AdminChapterInputDto {
  subjectId: string;
  title: string;
  slug: string;
  introduction?: string;
  sortOrder?: number;
  publishStatus?: PublishStatus;
}

export interface AdminLessonInputDto {
  chapterId: string;
  title: string;
  slug: string;
  content?: string;
  summary?: string;
  sortOrder?: number;
  publishStatus?: PublishStatus;
}

export interface AdminMainsQuestionInputDto {
  examId?: string;
  subjectId?: string;
  text: string;
  gsPaper: string;
  maxMarks: number;
  modelAnswer?: string;
  publishStatus?: PublishStatus;
}

export interface AdminContentListItemDto {
  id: string;
  title: string;
  slug?: string;
  publishStatus: PublishStatus;
  updatedAt: string;
}

export interface AuditLogEntryDto {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string | null;
  createdAt: string;
}
