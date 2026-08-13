import { ExamStageType, PrismaClient } from '@prisma/client';

const GS_PAPER_TAGS = [
  { name: 'GS1', category: 'gs_paper' },
  { name: 'GS2', category: 'gs_paper' },
  { name: 'GS3', category: 'gs_paper' },
  { name: 'GS4', category: 'gs_paper' },
  { name: 'CSAT', category: 'gs_paper' },
  { name: 'Essay', category: 'gs_paper' },
] as const;

export async function seedReferenceTags(prisma: PrismaClient): Promise<void> {
  for (const tag of GS_PAPER_TAGS) {
    await prisma.tag.upsert({
      where: { name: tag.name },
      create: tag,
      update: { category: tag.category },
    });
  }
}

export async function seedReferenceExam(prisma: PrismaClient): Promise<string> {
  const exam = await prisma.exam.upsert({
    where: { code: 'UPSC_CSE' },
    create: {
      code: 'UPSC_CSE',
      name: 'UPSC Civil Services Examination',
      description:
        'Union Public Service Commission Civil Services Examination (Prelims, Mains, Interview).',
      isActive: true,
      stages: {
        create: [
          {
            stageType: ExamStageType.PRELIMS,
            name: 'Preliminary Examination',
            description: 'CSAT + GS Paper I screening stage',
            sortOrder: 1,
          },
          {
            stageType: ExamStageType.MAINS,
            name: 'Main Examination',
            description: 'Descriptive written examination (GS papers + optional)',
            sortOrder: 2,
          },
          {
            stageType: ExamStageType.INTERVIEW,
            name: 'Personality Test',
            description: 'Interview stage after Mains qualification',
            sortOrder: 3,
          },
        ],
      },
    },
    update: {
      name: 'UPSC Civil Services Examination',
      isActive: true,
    },
  });

  return exam.id;
}
