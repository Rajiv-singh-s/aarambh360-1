/**
 * Application environment modes supported across the monorepo.
 */
export type AppEnvironment = 'development' | 'staging' | 'production' | 'test';

export * from './domain';
export * from './auth';
export * from './content';
export * from './quiz';
export * from './admin';
export * from './storage';
export * from './mains';
export * from './mains-evaluation';
export * from './rag';
export * from './notifications';
export * from './analytics';
export * from './subscriptions';
export * from './ads';

/**
 * Standard API health response contract.
 */
export interface ApiHealthResponse {
  status: 'ok' | 'degraded' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  environment?: AppEnvironment;
  service?: string;
  checks?: Record<string, 'ok' | 'down' | 'unreachable'>;
}

/**
 * Standard API error response format.
 */
export interface ApiErrorResponse {
  statusCode: number;
  message: string | string[];
  error: string;
  timestamp: string;
  path?: string;
}

/**
 * Pagination metadata contract.
 */
export interface PaginationMeta {
  page: number;
  limit: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

/**
 * Generic paginated response wrapper.
 */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}
