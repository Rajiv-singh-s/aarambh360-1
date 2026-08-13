import type { PreparationLevel, SubscriptionStatus, UserRole } from './domain';

/**
 * Authenticated user context attached to protected requests.
 */
export interface AuthUserContext {
  id: string;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  profileCompleted: boolean;
}

export interface UserPreferenceDto {
  theme: string;
  language: string;
  pushNotifications: boolean;
  emailNotifications: boolean;
  streakReminders: boolean;
  currentAffairsAlerts: boolean;
}

export interface OnboardingProgressDto {
  currentStep: number;
  completed: boolean;
  completedAt: string | null;
}

export interface UserProfileDto {
  id: string;
  userId: string;
  name: string;
  dateOfBirth: string | null;
  gender: string | null;
  avatarUrl: string | null;
  targetYear: number | null;
  preparationLevel: PreparationLevel | null;
  dailyStudyMinutes: number | null;
  bio: string | null;
}

export interface UserDto {
  id: string;
  firebaseUid: string;
  email: string | null;
  phone: string | null;
  role: UserRole;
  profileCompleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EntitlementStubDto {
  featureCode: string;
  quotaRemaining: number | null;
  unlimited: boolean;
  expiresAt: string | null;
}

export interface LoginResponseDto {
  user: UserDto;
  profile: UserProfileDto;
  preferences: UserPreferenceDto;
  onboarding: OnboardingProgressDto;
  entitlements: EntitlementStubDto[];
}

export interface AuthMeResponseDto extends LoginResponseDto {}

export interface UpdateProfileRequestDto {
  name?: string;
  dateOfBirth?: string;
  gender?: string;
  avatarUrl?: string;
  targetYear?: number;
  preparationLevel?: PreparationLevel;
  dailyStudyMinutes?: number;
  bio?: string;
  profileCompleted?: boolean;
}

export interface DeleteAccountResponseDto {
  message: string;
  deletedAt: string;
}
