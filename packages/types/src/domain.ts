/**
 * Shared domain enums aligned with the canonical Prisma schema (Step 3).
 * Keep in sync with apps/backend/prisma/schema.prisma
 */

export type UserRole = 'USER' | 'EDITOR' | 'MODERATOR' | 'ADMIN';

export type PreparationLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';

export type ExamStageType = 'PRELIMS' | 'MAINS' | 'INTERVIEW';

export type GsPaper = 'GS1' | 'GS2' | 'GS3' | 'GS4' | 'CSAT' | 'ESSAY' | 'GENERAL';

export type QuestionType =
  | 'MCQ_SINGLE'
  | 'MCQ_MULTI'
  | 'ASSERTION_REASON'
  | 'PYQ_PRELIMS'
  | 'PYQ_MAINS'
  | 'MAINS_DESCRIPTIVE';

export type Difficulty = 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';

export type PublishStatus = 'DRAFT' | 'REVIEW' | 'PUBLISHED' | 'ARCHIVED';

export type ContentSourceType =
  | 'NCERT'
  | 'PYQ'
  | 'EDITORIAL'
  | 'LEGACY_RTDB'
  | 'LEGACY_FIRESTORE'
  | 'USER_GENERATED';

export type QuizType = 'PRACTICE' | 'MOCK' | 'MICRO' | 'PYQ' | 'CUSTOM';

export type QuizAttemptStatus = 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED' | 'TIMED_OUT';

export type MainsSubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'EVALUATING' | 'EVALUATED' | 'FAILED';

export type SubscriptionStatus = 'TRIAL' | 'ACTIVE' | 'PAST_DUE' | 'CANCELLED' | 'EXPIRED';

export type BillingProvider = 'RAZORPAY' | 'GOOGLE_PLAY' | 'APPLE_APP_STORE' | 'MANUAL';

export type StreakType = 'MCQ' | 'STUDY' | 'MAINS' | 'COMBINED';

export type StudyActivityType =
  | 'LESSON'
  | 'QUIZ'
  | 'MAINS'
  | 'CURRENT_AFFAIRS'
  | 'REVISION'
  | 'PYQ';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'ARCHIVE' | 'RESTORE';

export type ReportStatus = 'OPEN' | 'REVIEWING' | 'RESOLVED' | 'DISMISSED';

export type BookmarkTargetType = 'QUESTION' | 'LESSON' | 'ARTICLE' | 'MAINS_QUESTION';

export type RagDocumentType =
  | 'NCERT'
  | 'MODEL_ANSWER'
  | 'SYLLABUS'
  | 'EDITORIAL'
  | 'PYQ_ANSWER'
  | 'RUBRIC';

/**
 * Lightweight domain identifiers used across API contracts before full DTOs exist.
 */
export interface DomainEntityRef {
  id: string;
}

export interface TimestampedEntity extends DomainEntityRef {
  createdAt: string;
  updatedAt: string;
}

export interface SoftDeletableEntity extends TimestampedEntity {
  deletedAt?: string | null;
}

export interface UserSummary extends TimestampedEntity {
  firebaseUid: string;
  email?: string | null;
  phone?: string | null;
  role: UserRole;
  profileCompleted: boolean;
}

export interface ProfileSummary extends TimestampedEntity {
  userId: string;
  name: string;
  targetYear?: number | null;
  preparationLevel?: PreparationLevel | null;
  dailyStudyMinutes?: number | null;
}

export interface QuestionSummary extends SoftDeletableEntity {
  type: QuestionType;
  text: string;
  difficulty: Difficulty;
  publishStatus: PublishStatus;
}

export interface QuizAttemptSummary extends DomainEntityRef {
  userId: string;
  quizId: string;
  status: QuizAttemptStatus;
  score: number;
  accuracy: number;
  startedAt: string;
  completedAt?: string | null;
}

export interface MainsSubmissionSummary extends TimestampedEntity {
  userId: string;
  mainsQuestionId: string;
  status: MainsSubmissionStatus;
  submittedAt?: string | null;
}

export interface SubscriptionSummary extends TimestampedEntity {
  userId: string;
  planId: string;
  status: SubscriptionStatus;
  billingProvider?: BillingProvider | null;
  expiresAt?: string | null;
}
