export const RTDB_EXPORT_RELATIVE_PATH = 'legacy-data/rtdb-export.json';

export const RESERVED_ROOT_KEYS = new Set([
  'notes',
  'ncert_books',
  'Syllabus',
  'Exam info',
  'cutoffs',
  'pyq',
  'mains',
]);

export interface LegacyMcqQuestion {
  question?: string;
  options?: string[] | Record<string, string>;
  answer?: string;
  explanation?: string;
}

export interface LegacyRtdbExport {
  [key: string]: unknown;
}

export interface ImportCounters {
  discovered: number;
  imported: number;
  updated: number;
  skipped: number;
  rejected: number;
  duplicate: number;
  warnings: string[];
  rejections: string[];
}

export function createCounters(): ImportCounters {
  return {
    discovered: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    rejected: 0,
    duplicate: 0,
    warnings: [],
    rejections: [],
  };
}

export function mergeCounters(target: ImportCounters, source: ImportCounters): void {
  target.discovered += source.discovered;
  target.imported += source.imported;
  target.updated += source.updated;
  target.skipped += source.skipped;
  target.rejected += source.rejected;
  target.duplicate += source.duplicate;
  target.warnings.push(...source.warnings);
  target.rejections.push(...source.rejections);
}
