import { apiGet, apiPost } from './apiClient';
import type {
  LearningAnalyticsProfileDto,
  LearningRecommendationsDto,
  TrackLearningEventRequestDto,
} from '@aarambh360/types';

export async function trackLearningEvent(payload: TrackLearningEventRequestDto) {
  return apiPost('/analytics/events', payload);
}

export async function getLearningProfile(): Promise<LearningAnalyticsProfileDto> {
  return apiGet<LearningAnalyticsProfileDto>('/analytics/me/profile');
}

export async function getRecommendations(): Promise<LearningRecommendationsDto> {
  return apiGet<LearningRecommendationsDto>('/analytics/me/recommendations');
}
