import { BadRequestException } from '@nestjs/common';
import { parseAndValidateEvaluationResponse } from './evaluation.validator';

describe('parseAndValidateEvaluationResponse', () => {
  it('accepts valid structured evaluation JSON', () => {
    const result = parseAndValidateEvaluationResponse(
      JSON.stringify({
        totalMarks: 7,
        relevanceScore: 80,
        dimensions: [
          { name: 'Introduction', score: 1, maxScore: 2, feedback: 'Good start' },
          { name: 'Content', score: 3, maxScore: 4, feedback: 'Solid content' },
        ],
        strengths: ['Clear writing'],
        improvements: ['More analysis'],
        missingPoints: ['Case law'],
        conclusion: 'Well attempted answer.',
      }),
      10,
    );

    expect(result.totalMarks).toBe(7);
    expect(result.strengths).toContain('Clear writing');
    expect(result.suggestions).toContain('More analysis');
  });

  it('rejects malformed JSON', () => {
    expect(() => parseAndValidateEvaluationResponse('{invalid', 10)).toThrow(BadRequestException);
  });

  it('rejects out-of-range total marks', () => {
    expect(() =>
      parseAndValidateEvaluationResponse(
        JSON.stringify({
          totalMarks: 20,
          relevanceScore: 50,
          dimensions: [{ name: 'Content', score: 1, maxScore: 2, feedback: 'ok' }],
          strengths: ['a'],
          improvements: ['b'],
          missingPoints: ['c'],
          conclusion: 'done',
        }),
        10,
      ),
    ).toThrow(BadRequestException);
  });
});
