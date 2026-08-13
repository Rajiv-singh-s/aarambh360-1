import { BadRequestException } from '@nestjs/common';
import type { MainsEvaluationFeedbackDto } from '@aarambh360/types';
import { buildDimensionMaxScores } from './prompts/upsc-rubric';

type RawEvaluation = {
  totalMarks?: unknown;
  relevanceScore?: unknown;
  dimensions?: unknown;
  strengths?: unknown;
  improvements?: unknown;
  missingPoints?: unknown;
  conclusion?: unknown;
};

function asStringArray(value: unknown, field: string): string[] {
  if (!Array.isArray(value)) {
    throw new BadRequestException(`Evaluation response missing ${field}`);
  }
  return value.map((item, index) => {
    if (typeof item !== 'string' || !item.trim()) {
      throw new BadRequestException(`Evaluation response ${field}[${index}] must be a non-empty string`);
    }
    return item.trim();
  });
}

export function parseAndValidateEvaluationResponse(
  rawText: string,
  maxMarks: number,
): MainsEvaluationFeedbackDto {
  let parsed: RawEvaluation;
  try {
    parsed = JSON.parse(rawText) as RawEvaluation;
  } catch {
    throw new BadRequestException('Evaluation response is not valid JSON');
  }

  if (typeof parsed.totalMarks !== 'number' || Number.isNaN(parsed.totalMarks)) {
    throw new BadRequestException('Evaluation response missing totalMarks');
  }
  if (parsed.totalMarks < 0 || parsed.totalMarks > maxMarks) {
    throw new BadRequestException('Evaluation totalMarks out of range');
  }

  const relevanceScore =
    typeof parsed.relevanceScore === 'number' && !Number.isNaN(parsed.relevanceScore)
      ? Math.min(100, Math.max(0, parsed.relevanceScore))
      : 0;

  if (!Array.isArray(parsed.dimensions) || parsed.dimensions.length === 0) {
    throw new BadRequestException('Evaluation response missing dimensions');
  }

  const expected = buildDimensionMaxScores(maxMarks);
  const dimensionCount = parsed.dimensions.length;
  const dimensions = parsed.dimensions.map((dimension, index) => {
    if (!dimension || typeof dimension !== 'object') {
      throw new BadRequestException(`Invalid dimension at index ${index}`);
    }
    const entry = dimension as Record<string, unknown>;
    const name = typeof entry.name === 'string' ? entry.name.trim() : expected[index]?.name ?? `Dimension ${index + 1}`;
    const maxScore =
      typeof entry.maxScore === 'number' && !Number.isNaN(entry.maxScore)
        ? entry.maxScore
        : expected[index]?.maxScore ?? Math.round(maxMarks / dimensionCount);
    const score = typeof entry.score === 'number' && !Number.isNaN(entry.score) ? entry.score : 0;
    const feedback = typeof entry.feedback === 'string' ? entry.feedback.trim() : '';

    if (score < 0 || score > maxScore) {
      throw new BadRequestException(`Dimension score out of range for ${name}`);
    }
    if (!feedback) {
      throw new BadRequestException(`Dimension feedback missing for ${name}`);
    }

    return { name, score, maxScore, feedback };
  });

  const strengths = asStringArray(parsed.strengths, 'strengths');
  const improvements = asStringArray(parsed.improvements, 'improvements');
  const missingPoints = asStringArray(parsed.missingPoints, 'missingPoints');
  const conclusion =
    typeof parsed.conclusion === 'string' && parsed.conclusion.trim()
      ? parsed.conclusion.trim()
      : (() => {
          throw new BadRequestException('Evaluation response missing conclusion');
        })();

  return {
    totalMarks: Number(parsed.totalMarks.toFixed(2)),
    maxMarks,
    relevanceScore: Number(relevanceScore.toFixed(2)),
    dimensions,
    strengths,
    weaknesses: improvements.slice(0, Math.min(3, improvements.length)),
    missingPoints,
    suggestions: improvements,
    conclusion,
    sources: [],
  };
}

export function attachEvaluationSources(
  feedback: MainsEvaluationFeedbackDto,
  sources: MainsEvaluationFeedbackDto['sources'],
): MainsEvaluationFeedbackDto {
  return { ...feedback, sources };
}
