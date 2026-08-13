import { createHash } from 'crypto';

export function slugify(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function hashQuestionText(text: string): string {
  return createHash('sha256').update(normalizeWhitespace(text).toLowerCase()).digest('hex');
}

export interface NormalizedOption {
  label: string;
  text: string;
}

export function normalizeOptions(
  options: string[] | Record<string, string> | undefined,
): NormalizedOption[] {
  if (!options) {
    return [];
  }

  if (Array.isArray(options)) {
    return options.map((text, index) => ({
      label: String.fromCharCode(65 + index),
      text: String(text),
    }));
  }

  return Object.entries(options).map(([label, text]) => ({
    label: String(label),
    text: String(text),
  }));
}

export function isOptionCorrect(option: NormalizedOption, answerRaw: string): boolean {
  const answer = (answerRaw ?? '').trim().toLowerCase();
  if (!answer) {
    return false;
  }

  const key = option.label.trim().toLowerCase();
  const text = option.text.trim().toLowerCase();

  if (key === answer) {
    return true;
  }
  if (text === answer) {
    return true;
  }

  const strippedAnswer = answer.replace(/^[a-z0-9.\)\-:\s]+/i, '').trim();
  if (strippedAnswer && text === strippedAnswer) {
    return true;
  }

  const labelPrefix = `${key}.`;
  return answer.startsWith(labelPrefix) && answer.slice(labelPrefix.length).trim() === text;
}

export function resolveCorrectOptionLabel(
  options: NormalizedOption[],
  answerRaw: string | undefined,
): string | null {
  if (!answerRaw?.trim()) {
    return null;
  }

  const match = options.find((option) => isOptionCorrect(option, answerRaw));
  return match?.label ?? null;
}

export function parseDecimal(value: unknown): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }
  const text = String(value).trim();
  if (!text || text.toLowerCase() === 'not published' || text === '-') {
    return null;
  }
  const parsed = Number.parseFloat(text.replace(/[^\d.]/g, ''));
  return Number.isFinite(parsed) ? parsed : null;
}

export function legacyMetadata(
  legacyKey: string,
  legacyPath: string,
  extra?: Record<string, string | number | boolean | null>,
): Record<string, string | number | boolean | null> {
  return {
    legacyKey,
    legacyPath,
    legacySource: 'LEGACY_RTDB',
    ...extra,
  };
}
