import { getIstActivityDate } from './quiz.utils';

describe('getIstActivityDate', () => {
  it('normalizes to IST calendar day in UTC midnight form', () => {
    const date = getIstActivityDate(new Date('2026-08-12T20:30:00.000Z'));
    expect(date.toISOString()).toBe('2026-08-13T00:00:00.000Z');
  });

  it('handles midnight IST boundary', () => {
    const date = getIstActivityDate(new Date('2026-08-12T18:29:59.000Z'));
    expect(date.toISOString()).toBe('2026-08-12T00:00:00.000Z');
  });
});
