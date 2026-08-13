import { ContentSourceType, PrismaClient, PublishStatus } from '@prisma/client';
import type { ImportCounters, LegacyRtdbExport } from '../types';
import { createCounters } from '../types';
import { slugify } from '../utils';

function flattenExamInfoSections(
  prefix: string,
  value: unknown,
  sections: Array<{ sectionKey: string; title: string; content: string }>,
): void {
  if (value === null || value === undefined) {
    return;
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    sections.push({
      sectionKey: slugify(prefix),
      title: prefix.split('.').pop() ?? prefix,
      content: String(value),
    });
    return;
  }

  if (Array.isArray(value)) {
    sections.push({
      sectionKey: slugify(prefix),
      title: prefix.split('.').pop() ?? prefix,
      content: value.map((item) => JSON.stringify(item)).join('\n'),
    });
    return;
  }

  if (typeof value === 'object') {
    for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
      flattenExamInfoSections(prefix ? `${prefix}.${key}` : key, nested, sections);
    }
  }
}

export async function importExamInfoSections(
  prisma: PrismaClient,
  examId: string,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const examInfoRoot = data['Exam info'] as Record<string, unknown> | undefined;
  const examInfo = examInfoRoot?.upsc_cse_2026;

  if (!examInfo || typeof examInfo !== 'object') {
    counters.warnings.push('Exam info/upsc_cse_2026 missing from RTDB export');
    return counters;
  }

  const sections: Array<{ sectionKey: string; title: string; content: string }> = [];
  flattenExamInfoSections('overview', (examInfo as Record<string, unknown>).overview, sections);
  flattenExamInfoSections('key_dates', (examInfo as Record<string, unknown>).key_dates, sections);
  flattenExamInfoSections('eligibility', (examInfo as Record<string, unknown>).eligibility, sections);
  flattenExamInfoSections('exam_pattern', (examInfo as Record<string, unknown>).exam_pattern, sections);

  let sortOrder = 0;
  for (const section of sections) {
    counters.discovered += 1;
    if (!section.content.trim()) {
      counters.skipped += 1;
      continue;
    }

    await prisma.examInfoSection.upsert({
      where: {
        examId_sectionKey: {
          examId,
          sectionKey: section.sectionKey,
        },
      },
      create: {
        examId,
        sectionKey: section.sectionKey,
        title: section.title,
        content: section.content,
        sortOrder: sortOrder++,
        publishStatus: PublishStatus.PUBLISHED,
      },
      update: {
        title: section.title,
        content: section.content,
        publishStatus: PublishStatus.PUBLISHED,
      },
    });
    counters.imported += 1;
  }

  return counters;
}

export async function importSyllabusNodes(
  prisma: PrismaClient,
  examId: string,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const syllabusRoot = data.Syllabus as Record<string, unknown> | undefined;
  const syllabusTree = syllabusRoot?.UPSC_Exam;

  if (!syllabusTree || typeof syllabusTree !== 'object') {
    counters.warnings.push('Syllabus/UPSC_Exam missing from RTDB export');
    return counters;
  }

  async function walk(
    node: Record<string, unknown>,
    parentId: string | null,
    pathParts: string[],
    sortOrderStart: number,
  ): Promise<number> {
    let sortOrder = sortOrderStart;

    for (const [key, value] of Object.entries(node)) {
      counters.discovered += 1;
      const title = key.replace(/_/g, ' ').trim();
      const path = [...pathParts, key].join('/');

      const existing = await prisma.syllabusNode.findFirst({
        where: { examId, path },
      });

      let nodeId: string;
      if (existing) {
        await prisma.syllabusNode.update({
          where: { id: existing.id },
          data: {
            title,
            parentId,
            sortOrder,
            publishStatus: PublishStatus.PUBLISHED,
          },
        });
        nodeId = existing.id;
        counters.updated += 1;
      } else {
        const created = await prisma.syllabusNode.create({
          data: {
            examId,
            parentId,
            title,
            path,
            sortOrder,
            publishStatus: PublishStatus.PUBLISHED,
          },
        });
        nodeId = created.id;
        counters.imported += 1;
      }

      sortOrder += 1;

      if (value && typeof value === 'object' && !Array.isArray(value)) {
        sortOrder = await walk(value as Record<string, unknown>, nodeId, [...pathParts, key], sortOrder);
      } else if (typeof value === 'string') {
        await prisma.syllabusNode.update({
          where: { id: nodeId },
          data: { description: value },
        });
      }
    }

    return sortOrder;
  }

  await walk(syllabusTree as Record<string, unknown>, null, [], 0);
  return counters;
}
