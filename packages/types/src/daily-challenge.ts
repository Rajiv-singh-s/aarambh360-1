import { QuizQuestionDto } from "./quiz";
import { MainsQuestionSummaryDto } from "./content";

export type DailyChallengePaperType = "PRELIMS_1" | "PRELIMS_2" | "MAINS";

export interface DailyChallengeDto {
  id: string;
  date: string; // YYYY-MM-DD
  paperType: DailyChallengePaperType;
  timeLimitMinutes: number;
  totalQuestions: number;
  questions?: QuizQuestionDto[]; // For prelims
  mainsQuestion?: MainsQuestionSummaryDto; // For mains
  isActive: boolean;
  isAttempted?: boolean;
}

export interface DailyChallengeAttemptDto {
  id: string;
  challengeId: string;
  userId: string;
  paperType: DailyChallengePaperType;
  score: number;
  accuracy: number;
  consumedTimeSeconds: number;
  completedAt: string;
}

export interface SubmitDailyChallengeRequestDto {
  challengeId: string;
  paperType: DailyChallengePaperType;
  consumedTimeSeconds: number;
  // For Prelims
  answers?: Array<{
    questionId: string;
    selectedOptionId: string;
  }>;
  // For Mains
  mainsAnswerText?: string;
}

export interface DailyChallengeLeaderboardEntryDto {
  userId: string;
  name: string;
  avatarUrl: string | null;
  rank: number;
  score: number;
  accuracy: number;
  timeTakenSeconds: number;
  isCurrentUser: boolean;
}

export interface DailyChallengeLeaderboardResponseDto {
  paperType: DailyChallengePaperType;
  period: "DAILY" | "WEEKLY" | "MONTHLY";
  entries: DailyChallengeLeaderboardEntryDto[];
}
