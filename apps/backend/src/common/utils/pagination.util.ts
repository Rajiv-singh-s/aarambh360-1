import type { PaginationMeta } from '@aarambh360/types';
import { DEFAULT_LIMIT, DEFAULT_PAGE, MAX_LIMIT } from '../dto/pagination-query.dto';

export function normalizePagination(page?: number, limit?: number): { page: number; limit: number; skip: number } {
  const safePage = page && page > 0 ? page : DEFAULT_PAGE;
  const safeLimit = limit && limit > 0 ? Math.min(limit, MAX_LIMIT) : DEFAULT_LIMIT;
  return {
    page: safePage,
    limit: safeLimit,
    skip: (safePage - 1) * safeLimit,
  };
}

export function buildPaginationMeta(page: number, limit: number, totalItems: number): PaginationMeta {
  const totalPages = totalItems === 0 ? 0 : Math.ceil(totalItems / limit);
  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
}

export function normalizeExamCode(code: string): string {
  return code.trim().toUpperCase().replace(/-/g, '_');
}

export const PUBLISHED_CONTENT = {
  publishStatus: 'PUBLISHED' as const,
  deletedAt: null,
};

export const PUBLISHED_SUBJECT = {
  publishStatus: 'PUBLISHED' as const,
  deletedAt: null,
};
