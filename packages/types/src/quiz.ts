import type { Difficulty, QuestionType, QuizAttemptStatus } from './domain';

export interface QuizQuestionOptionDto {
  id: string;
  label: string;
  text: string;
  sortOrder: number;
}

export interface QuizQuestionDto {
  id: string;
  type: QuestionType;
  text: string;
  difficulty: Difficulty;
  options: QuizQuestionOptionDto[];
}

export interface StartQuizSessionRequestDto {
  topicId: string;
  count?: number;
}

export interface QuizSessionDto {
  sessionId: string;
  quizId: string;
  topicId: string;
  totalQuestions: number;
  status: QuizAttemptStatus;
  startedAt: string;
  questions: QuizQuestionDto[];
}

export interface SubmitQuizAnswerRequestDto {
  questionId: string;
  selectedOptionId: string;
  timeTakenSeconds?: number;
}

export interface SubmitQuizAnswerResponseDto {
  questionId: string;
  isCorrect: boolean;
  correctOptionId: string;
  explanation?: string | null;
}

export interface CompleteQuizSessionResponseDto {
  sessionId: string;
  correctCount: number;
  incorrectCount: number;
  totalQuestions: number;
  score: number;
  accuracy: number;
  timeTakenSeconds: number;
  completedAt: string;
}

export interface StreakDto {
  streakType: string;
  currentCount: number;
  longestCount: number;
  lastActivityDate: string | null;
}

export interface ProgressStatsDto {
  totalQuizzesTaken: number;
  totalQuestionsAnswered: number;
  totalCorrect: number;
  accuracy: number;
  subjectBreakdown: Array<{
    subjectId: string;
    subjectName: string;
    attempted: number;
    correct: number;
  }>;
}

export interface MistakeDto {
  id: string;
  questionId: string;
  questionText: string;
  topicId: string | null;
  incorrectCount: number;
  lastAttemptedAt: string;
}

export interface BookmarkDto {
  id: string;
  targetType: string;
  targetId: string;
  notes: string | null;
  createdAt: string;
}

export interface CreateBookmarkRequestDto {
  targetType: 'QUESTION' | 'LESSON' | 'MAINS_QUESTION';
  targetId: string;
  notes?: string;
}

export interface LeaderboardEntryDto {
  userId: string;
  displayName: string;
  score: number;
  rank: number;
}
