export type NotificationTypeDto =
  | 'MAINS_EVAL_COMPLETE'
  | 'STREAK_REMINDER'
  | 'QUIZ_REMINDER'
  | 'GENERAL';

export interface RegisterDeviceTokenRequestDto {
  token: string;
  platform: 'ios' | 'android' | 'web';
}

export interface DeviceTokenDto {
  id: string;
  platform: string;
  isActive: boolean;
  createdAt: string;
}

export interface NotificationPreferencesDto {
  pushNotifications: boolean;
  streakReminders: boolean;
  mainsEvalAlerts: boolean;
  quizReminders: boolean;
  currentAffairsAlerts: boolean;
}

export interface UpdateNotificationPreferencesRequestDto {
  pushNotifications?: boolean;
  streakReminders?: boolean;
  mainsEvalAlerts?: boolean;
  quizReminders?: boolean;
  currentAffairsAlerts?: boolean;
}

export interface NotificationLogDto {
  id: string;
  type: NotificationTypeDto;
  title: string;
  body: string;
  status: 'SENT' | 'FAILED' | 'SKIPPED';
  createdAt: string;
}
