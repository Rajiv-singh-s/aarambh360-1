import {
  hashQuestionText,
  isOptionCorrect,
  normalizeOptions,
  normalizeWhitespace,
  parseDecimal,
  resolveCorrectOptionLabel,
  slugify,
} from './index';

describe('seed utils', () => {
  describe('slugify', () => {
    it('normalizes subject keys', () => {
      expect(slugify('Indian Polity')).toBe('indian-polity');
    });
  });

  describe('normalizeOptions', () => {
    it('maps array options to A/B/C/D labels', () => {
      expect(normalizeOptions(['One', 'Two'])).toEqual([
        { label: 'A', text: 'One' },
        { label: 'B', text: 'Two' },
      ]);
    });

    it('preserves record option labels', () => {
      expect(normalizeOptions({ A: 'Alpha', B: 'Beta' })).toEqual([
        { label: 'A', text: 'Alpha' },
        { label: 'B', text: 'Beta' },
      ]);
    });
  });

  describe('resolveCorrectOptionLabel', () => {
    const options = normalizeOptions(['Alpha', 'Beta', 'Gamma', 'Delta']);

    it('matches letter answers', () => {
      expect(resolveCorrectOptionLabel(options, 'B')).toBe('B');
    });

    it('matches option text answers', () => {
      expect(resolveCorrectOptionLabel(options, 'Gamma')).toBe('C');
    });
  });

  describe('isOptionCorrect', () => {
    it('handles prefixed answer strings', () => {
      const option = { label: 'C', text: 'Fundamental Rights' };
      expect(isOptionCorrect(option, 'C. Fundamental Rights')).toBe(true);
    });
  });

  describe('hashQuestionText', () => {
    it('is stable for whitespace differences', () => {
      const a = hashQuestionText('What   is   Article 21?');
      const b = hashQuestionText('what is article 21?');
      expect(a).toBe(b);
    });
  });

  describe('parseDecimal', () => {
    it('parses numeric strings and rejects placeholders', () => {
      expect(parseDecimal('105.34')).toBe(105.34);
      expect(parseDecimal('not published')).toBeNull();
      expect(parseDecimal('-')).toBeNull();
    });
  });

  describe('normalizeWhitespace', () => {
    it('collapses repeated spaces', () => {
      expect(normalizeWhitespace('  hello   world  ')).toBe('hello world');
    });
  });
});
