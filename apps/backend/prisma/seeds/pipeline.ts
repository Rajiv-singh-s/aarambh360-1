import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';
import type { ImportCounters, LegacyRtdbExport } from './types';
import { createCounters, mergeCounters, RTDB_EXPORT_RELATIVE_PATH } from './types';
import { seedReferenceExam, seedReferenceTags } from './reference';
import { importExamInfoSections, importSyllabusNodes } from './importers/exam-structure';
import {
  importCutoffs,
  importNcertReferences,
  importStrategyMaterials,
} from './importers/static-content';
import {
  importMcqs,
  importMainsQuestions,
  importNotes,
  importPyqs,
} from './importers/content';

export interface SeedPipelineReport {
  exportPath: string | null;
  exportLoaded: boolean;
  examId: string;
  totals: ImportCounters;
  byDomain: Record<string, ImportCounters>;
}

function resolveExportPath(): string | null {
  const envPath = process.env.LEGACY_RTD_EXPORT_PATH;
  if (envPath && existsSync(envPath)) {
    return envPath;
  }

  const repoRoot = resolve(__dirname, '../../../..');
  const defaultPath = resolve(repoRoot, RTDB_EXPORT_RELATIVE_PATH);
  return existsSync(defaultPath) ? defaultPath : null;
}

export function loadRtdbExport(exportPath: string): LegacyRtdbExport {
  const raw = readFileSync(exportPath, 'utf8');
  return JSON.parse(raw) as LegacyRtdbExport;
}

export async function runLegacySeedPipeline(
  prisma: PrismaClient,
): Promise<SeedPipelineReport> {
  const totals = createCounters();
  const byDomain: Record<string, ImportCounters> = {};
  const exportPath = resolveExportPath();

  console.log('[seed] Ensuring reference exam exists…');
  await seedReferenceTags(prisma);
  const examId = await seedReferenceExam(prisma);

  const strategyCounters = await importStrategyMaterials(prisma);
  byDomain.strategy = strategyCounters;
  mergeCounters(totals, strategyCounters);
  console.log(
    `[seed] Strategy materials: imported=${strategyCounters.imported}, updated=${strategyCounters.updated}`,
  );

  if (!exportPath) {
    totals.warnings.push(
      `RTDB export not found at ${RTDB_EXPORT_RELATIVE_PATH}. Run pnpm extract:rtdb after configuring FIREBASE_SERVICE_ACCOUNT.`,
    );
    console.warn('[seed] RTDB export missing — skipping legacy RTDB importers.');
    return {
      exportPath: null,
      exportLoaded: false,
      examId,
      totals,
      byDomain,
    };
  }

  console.log(`[seed] Loading RTDB export from ${exportPath}`);
  const data = loadRtdbExport(exportPath);

  const steps: Array<[string, () => Promise<ImportCounters>]> = [
    ['cutoffs', () => importCutoffs(prisma, examId, data)],
    ['ncert', () => importNcertReferences(prisma, data)],
    ['examInfo', () => importExamInfoSections(prisma, examId, data)],
    ['syllabus', () => importSyllabusNodes(prisma, examId, data)],
    ['mcqs', () => importMcqs(prisma, examId, data)],
    ['notes', () => importNotes(prisma, examId, data)],
    ['pyq', () => importPyqs(prisma, examId, data)],
    ['mains', () => importMainsQuestions(prisma, examId, data)],
  ];

  for (const [domain, importer] of steps) {
    const counters = await importer();
    byDomain[domain] = counters;
    mergeCounters(totals, counters);
    console.log(
      `[seed] ${domain}: discovered=${counters.discovered}, imported=${counters.imported}, updated=${counters.updated}, skipped=${counters.skipped}, rejected=${counters.rejected}, duplicate=${counters.duplicate}`,
    );
  }

  return {
    exportPath,
    exportLoaded: true,
    examId,
    totals,
    byDomain,
  };
}
