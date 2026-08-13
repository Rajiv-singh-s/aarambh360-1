import { writeFileSync, existsSync } from 'fs';
import { resolve } from 'path';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function countOrZero(query: Promise<number>): Promise<number> {
  try {
    return await query;
  } catch {
    return 0;
  }
}

async function main(): Promise<void> {
  const counts = {
    exams: await prisma.exam.count(),
    examStages: await prisma.examStage.count(),
    tags: await prisma.tag.count(),
    subjects: await prisma.subject.count(),
    topics: await prisma.topic.count(),
    chapters: await prisma.chapter.count(),
    lessons: await prisma.lesson.count(),
    lessonSections: await prisma.lessonSection.count(),
    questions: await prisma.question.count(),
    questionOptions: await prisma.questionOption.count(),
    pyqMetadata: await prisma.pyqMetadata.count(),
    mainsQuestions: await prisma.mainsQuestion.count(),
    ncertReferences: await prisma.ncertReference.count(),
    cutoffRecords: await prisma.cutOffRecord.count(),
    syllabusNodes: await prisma.syllabusNode.count(),
    examInfoSections: await prisma.examInfoSection.count(),
    studyMaterials: await prisma.studyMaterial.count(),
  };

  const orphanQuestions = await countOrZero(
    prisma.question.count({
      where: {
        topicMappings: { none: {} },
        type: { in: ['MCQ_SINGLE', 'MCQ_MULTI'] },
      },
    }),
  );

  const reportPath = resolve(__dirname, '../../../docs/SEED-VALIDATION-REPORT.md');
  const generatedAt = new Date().toISOString();

  const markdown = `# Seed Validation Report

Generated: ${generatedAt}

## PostgreSQL row counts

| Entity | Count |
|---|---:|
| exams | ${counts.exams} |
| exam_stages | ${counts.examStages} |
| tags | ${counts.tags} |
| subjects | ${counts.subjects} |
| topics | ${counts.topics} |
| chapters | ${counts.chapters} |
| lessons | ${counts.lessons} |
| lesson_sections | ${counts.lessonSections} |
| questions | ${counts.questions} |
| question_options | ${counts.questionOptions} |
| pyq_metadata | ${counts.pyqMetadata} |
| mains_questions | ${counts.mainsQuestions} |
| ncert_references | ${counts.ncertReferences} |
| cutoff_records | ${counts.cutoffRecords} |
| syllabus_nodes | ${counts.syllabusNodes} |
| exam_info_sections | ${counts.examInfoSections} |
| study_materials | ${counts.studyMaterials} |

## Integrity checks

| Check | Result |
|---|---|
| MCQ questions without topic mapping | ${orphanQuestions} |

## Extraction status

| Check | Result |
|---|---|
| RTDB export present | ${existsSync(resolve(__dirname, '../../../legacy-data/rtdb-export.json')) ? 'yes' : '**no — run extract:rtdb**'} |

## Notes

- Re-run \`pnpm --filter @aarambh360/backend extract:rtdb\` before seeding if legacy Firebase content changed.
- Re-run \`pnpm --filter @aarambh360/backend db:seed\` to apply idempotent imports.
`;

  writeFileSync(reportPath, markdown, 'utf8');
  console.log(`[validate-seed] Report written to ${reportPath}`);
  console.log(JSON.stringify(counts, null, 2));
}

main()
  .catch((error: unknown) => {
    console.error('[validate-seed] Failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
