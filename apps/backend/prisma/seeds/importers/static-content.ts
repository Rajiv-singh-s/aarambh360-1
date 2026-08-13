import {
  ContentSourceType,
  PrismaClient,
  PublishStatus,
} from '@prisma/client';
import type { ImportCounters, LegacyRtdbExport } from '../types';
import { createCounters } from '../types';
import { parseDecimal, slugify } from '../utils';

export async function importCutoffs(
  prisma: PrismaClient,
  examId: string,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const cutoffs = data.cutoffs;

  if (!cutoffs || typeof cutoffs !== 'object') {
    counters.warnings.push('cutoffs node missing from RTDB export');
    return counters;
  }

  for (const [yearText, categories] of Object.entries(cutoffs as Record<string, unknown>)) {
    const year = Number.parseInt(yearText, 10);
    if (!Number.isFinite(year)) {
      counters.skipped += 1;
      continue;
    }

    if (!categories || typeof categories !== 'object') {
      counters.skipped += 1;
      counters.warnings.push(`cutoffs/${yearText} is not an object`);
      continue;
    }

    for (const [category, values] of Object.entries(categories as Record<string, unknown>)) {
      counters.discovered += 1;

      if (!values || typeof values !== 'object') {
        counters.rejected += 1;
        counters.rejections.push(`cutoffs/${yearText}/${category}: invalid row`);
        continue;
      }

      const row = values as Record<string, unknown>;
      await prisma.cutOffRecord.upsert({
        where: {
          examId_year_category: {
            examId,
            year,
            category,
          },
        },
        create: {
          examId,
          year,
          category,
          prelimsCutoff: parseDecimal(row.Prelim),
          mainsCutoff: parseDecimal(row.Main),
          finalCutoff: parseDecimal(row.Final),
        },
        update: {
          prelimsCutoff: parseDecimal(row.Prelim),
          mainsCutoff: parseDecimal(row.Main),
          finalCutoff: parseDecimal(row.Final),
        },
      });
      counters.imported += 1;
    }
  }

  return counters;
}

export async function importNcertReferences(
  prisma: PrismaClient,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const ncertBooks = data.ncert_books;

  if (!ncertBooks || typeof ncertBooks !== 'object') {
    counters.warnings.push('ncert_books node missing from RTDB export');
    return counters;
  }

  let sortOrder = 0;
  for (const [className, subjects] of Object.entries(ncertBooks as Record<string, unknown>)) {
    const classMatch = className.match(/(\d+)/);
    const classNumber = classMatch ? Number.parseInt(classMatch[1], 10) : NaN;
    if (!Number.isFinite(classNumber)) {
      counters.warnings.push(`ncert_books/${className}: could not parse class number`);
      continue;
    }

    if (!subjects || typeof subjects !== 'object') {
      continue;
    }

    for (const [subjectName, pdfUrl] of Object.entries(subjects as Record<string, unknown>)) {
      counters.discovered += 1;
      if (typeof pdfUrl !== 'string' || !pdfUrl.trim()) {
        counters.rejected += 1;
        counters.rejections.push(`ncert_books/${className}/${subjectName}: missing pdf URL`);
        continue;
      }

      await prisma.ncertReference.upsert({
        where: {
          classNumber_subjectName: {
            classNumber,
            subjectName,
          },
        },
        create: {
          classNumber,
          subjectName,
          title: `${subjectName} — Class ${classNumber}`,
          pdfUrl: pdfUrl.trim(),
          sortOrder: sortOrder++,
        },
        update: {
          pdfUrl: pdfUrl.trim(),
          title: `${subjectName} — Class ${classNumber}`,
          isActive: true,
        },
      });
      counters.imported += 1;
    }
  }

  return counters;
}

export async function importStrategyMaterials(
  prisma: PrismaClient,
): Promise<ImportCounters> {
  const counters = createCounters();
  const { LEGACY_STRATEGY_SECTIONS } = await import('../legacy/strategy-content');

  let sortOrder = 0;
  for (const section of LEGACY_STRATEGY_SECTIONS) {
    counters.discovered += 1;
    const legacyKey = `strategy:${slugify(section.title)}`;
    const existing = await prisma.studyMaterial.findFirst({
      where: {
        title: section.title,
        materialType: section.materialType,
      },
    });

    const payload = {
      title: section.title,
      description: section.content.slice(0, 500),
      materialType: section.materialType,
      metadata: {
        legacyKey,
        legacySource: 'LEGACY_HARDCODED',
        content: section.content,
      },
      sourceType: ContentSourceType.EDITORIAL,
      publishStatus: PublishStatus.PUBLISHED,
      sortOrder: sortOrder++,
    };

    if (existing) {
      await prisma.studyMaterial.update({
        where: { id: existing.id },
        data: payload,
      });
      counters.updated += 1;
    } else {
      await prisma.studyMaterial.create({ data: payload });
      counters.imported += 1;
    }
  }

  return counters;
}
