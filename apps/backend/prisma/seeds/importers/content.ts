import {
  ContentSourceType,
  Difficulty,
  GsPaper,
  PrismaClient,
  PublishStatus,
  QuestionType,
} from '@prisma/client';
import type { ImportCounters, LegacyMcqQuestion, LegacyRtdbExport } from '../types';
import { createCounters, RESERVED_ROOT_KEYS } from '../types';
import {
  hashQuestionText,
  legacyMetadata,
  normalizeOptions,
  normalizeWhitespace,
  resolveCorrectOptionLabel,
  slugify,
} from '../utils';

async function upsertSubject(
  prisma: PrismaClient,
  examId: string,
  subjectKey: string,
  subjectName: string,
  sortOrder: number,
): Promise<string> {
  const code = slugify(subjectKey);
  const subject = await prisma.subject.upsert({
    where: { examId_code: { examId, code } },
    create: {
      examId,
      code,
      name: subjectName,
      sortOrder,
      publishStatus: PublishStatus.PUBLISHED,
    },
    update: {
      name: subjectName,
      publishStatus: PublishStatus.PUBLISHED,
    },
  });
  return subject.id;
}

async function upsertClassTopic(
  prisma: PrismaClient,
  subjectId: string,
  classKey: string,
): Promise<string> {
  const slug = `class-${slugify(classKey)}`;
  const existing = await prisma.topic.findUnique({
    where: { subjectId_slug: { subjectId, slug } },
  });
  if (existing) {
    return existing.id;
  }
  return (
    await prisma.topic.create({
      data: {
        subjectId,
        slug,
        name: `Class ${classKey}`,
        sortOrder: Number.parseInt(classKey, 10) || 0,
        publishStatus: PublishStatus.PUBLISHED,
      },
    })
  ).id;
}

async function importQuestionRecord(
  prisma: PrismaClient,
  params: {
    examId: string;
    topicId: string;
    legacyKey: string;
    legacyPath: string;
    question: LegacyMcqQuestion;
    dedupeSet: Set<string>;
  },
  counters: ImportCounters,
): Promise<void> {
  counters.discovered += 1;

  const text = normalizeWhitespace(params.question.question ?? '');
  if (!text) {
    counters.rejected += 1;
    counters.rejections.push(`${params.legacyPath}: missing question text`);
    return;
  }

  const options = normalizeOptions(params.question.options);
  if (options.length < 2) {
    counters.rejected += 1;
    counters.rejections.push(`${params.legacyPath}: fewer than 2 options`);
    return;
  }

  const correctLabel = resolveCorrectOptionLabel(options, params.question.answer);
  if (!correctLabel) {
    counters.rejected += 1;
    counters.rejections.push(`${params.legacyPath}: could not resolve correct answer`);
    return;
  }

  const dedupeKey = `${params.topicId}:${hashQuestionText(text)}`;
  if (params.dedupeSet.has(dedupeKey)) {
    counters.duplicate += 1;
    return;
  }
  params.dedupeSet.add(dedupeKey);

  const existing = await prisma.question.findFirst({
    where: {
      metadata: {
        path: ['legacyKey'],
        equals: params.legacyKey,
      },
    },
    include: { options: true },
  });

  if (existing) {
    await prisma.question.update({
      where: { id: existing.id },
      data: {
        text,
        explanation: params.question.explanation ?? null,
        publishStatus: PublishStatus.PUBLISHED,
        topicMappings: {
          deleteMany: {},
          create: [{ topicId: params.topicId }]
        }
      },
    });
    counters.updated += 1;
    return;
  }

  await prisma.question.create({
    data: {
      examId: params.examId,
      type: QuestionType.MCQ_SINGLE,
      text,
      difficulty: Difficulty.MEDIUM,
      explanation: params.question.explanation ?? null,
      sourceType: ContentSourceType.LEGACY_RTDB,
      publishStatus: PublishStatus.PUBLISHED,
      metadata: legacyMetadata(params.legacyKey, params.legacyPath),
      topicMappings: {
        create: [{ topicId: params.topicId }],
      },
      options: {
        create: options.map((option, index) => ({
          label: option.label,
          text: option.text,
          isCorrect: option.label === correctLabel,
          sortOrder: index,
        })),
      },
    },
  });
  counters.imported += 1;
}

export async function importMcqs(
  prisma: PrismaClient,
  examId: string,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const dedupeSet = new Set<string>();
  let subjectSort = 0;

  for (const [subjectKey, subjectNode] of Object.entries(data)) {
    if (RESERVED_ROOT_KEYS.has(subjectKey)) {
      continue;
    }
    if (!subjectNode || typeof subjectNode !== 'object') {
      continue;
    }

    const subjectRecord = subjectNode as Record<string, unknown>;
    if (!subjectRecord.subject || !subjectRecord.classwise) {
      continue;
    }

    const subjectName = String(subjectRecord.subject);
    const subjectId = await upsertSubject(
      prisma,
      examId,
      subjectKey,
      subjectName,
      subjectSort++,
    );

    const classwise = subjectRecord.classwise as Record<string, unknown>;
    for (const [classKey, classNode] of Object.entries(classwise)) {
      if (!classNode || typeof classNode !== 'object') {
        continue;
      }
      const questionsNode = (classNode as Record<string, unknown>).questions;
      if (!questionsNode) {
        continue;
      }

      const actualClassNumber = (classNode as Record<string, unknown>).class?.toString() || classKey;
      const topicId = await upsertClassTopic(prisma, subjectId, actualClassNumber);
      const questionsArray: LegacyMcqQuestion[] = Array.isArray(questionsNode)
        ? questionsNode
        : Object.values(questionsNode as Record<string, LegacyMcqQuestion>);

      for (let index = 0; index < questionsArray.length; index += 1) {
        const question = questionsArray[index];
        const legacyKey = `mcq:${subjectKey}:${classKey}:${index}`;
        const legacyPath = `/${subjectKey}/classwise/${classKey}/questions/${index}`;
        await importQuestionRecord(
          prisma,
          {
            examId,
            topicId,
            legacyKey,
            legacyPath,
            question,
            dedupeSet,
          },
          counters,
        );
      }
    }
  }

  return counters;
}

export async function importNotes(
  prisma: PrismaClient,
  examId: string,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const notes = data.notes;

  if (!notes || typeof notes !== 'object') {
    counters.warnings.push('notes node missing from RTDB export');
    return counters;
  }

  const dedupeSet = new Set<string>();

  for (const [subjectKey, chapters] of Object.entries(notes as Record<string, unknown>)) {
    if (!chapters || typeof chapters !== 'object') {
      continue;
    }

    const subjectId = await upsertSubject(prisma, examId, subjectKey, subjectKey, 0);

    for (const [chapterKey, chapterNode] of Object.entries(chapters as Record<string, unknown>)) {
      if (!chapterKey.toLowerCase().includes('chapter')) {
        counters.skipped += 1;
        continue;
      }
      if (!chapterNode || typeof chapterNode !== 'object') {
        counters.rejected += 1;
        continue;
      }

      counters.discovered += 1;
      const chapterData = chapterNode as Record<string, unknown>;
      const chapterTitle = String(chapterData.chapter_title ?? chapterKey);
      const chapterSlug = slugify(chapterKey);

      const chapter = await prisma.chapter.upsert({
        where: { subjectId_slug: { subjectId, slug: chapterSlug } },
        create: {
          subjectId,
          slug: chapterSlug,
          title: chapterTitle,
          introduction: typeof chapterData.introduction === 'string' ? chapterData.introduction : null,
          sortOrder: 0,
          publishStatus: PublishStatus.PUBLISHED,
          sourceType: ContentSourceType.LEGACY_RTDB,
        },
        update: {
          title: chapterTitle,
          publishStatus: PublishStatus.PUBLISHED,
        },
      });

      const lesson = await prisma.lesson.upsert({
        where: { chapterId_slug: { chapterId: chapter.id, slug: 'main' } },
        create: {
          chapterId: chapter.id,
          slug: 'main',
          title: chapterTitle,
          summary: typeof chapterData.summary === 'string' ? chapterData.summary : null,
          content: typeof chapterData.introduction === 'string' ? chapterData.introduction : null,
          publishStatus: PublishStatus.PUBLISHED,
          sourceType: ContentSourceType.LEGACY_RTDB,
          metadata: legacyMetadata(`notes:${subjectKey}:${chapterKey}`, `notes/${subjectKey}/${chapterKey}`),
        },
        update: {
          title: chapterTitle,
          summary: typeof chapterData.summary === 'string' ? chapterData.summary : null,
          publishStatus: PublishStatus.PUBLISHED,
        },
      });

      counters.imported += 1;

      const detailed = chapterData.detailed_explanation;
      if (detailed && typeof detailed === 'object') {
        let sectionOrder = 0;
        for (const [sectionKey, sectionValue] of Object.entries(
          detailed as Record<string, unknown>,
        )) {
          const content =
            typeof sectionValue === 'string'
              ? sectionValue
              : typeof (sectionValue as Record<string, unknown>)?.content === 'string'
                ? String((sectionValue as Record<string, unknown>).content)
                : null;
          if (!content) {
            continue;
          }

          const existingSection = await prisma.lessonSection.findFirst({
            where: { lessonId: lesson.id, sortOrder: sectionOrder },
          });

          if (existingSection) {
            await prisma.lessonSection.update({
              where: { id: existingSection.id },
              data: { title: sectionKey, content },
            });
          } else {
            await prisma.lessonSection.create({
              data: {
                lessonId: lesson.id,
                title: sectionKey,
                content,
                sortOrder: sectionOrder,
              },
            });
          }
          sectionOrder += 1;
        }
      }

      const mcqNode = chapterData.mcq as Record<string, unknown> | undefined;
      const embeddedMcqs = Array.isArray(mcqNode?.mcqs)
        ? (mcqNode?.mcqs as LegacyMcqQuestion[])
        : Array.isArray(mcqNode)
          ? (mcqNode as LegacyMcqQuestion[])
          : [];

      const topicId = await upsertClassTopic(prisma, subjectId, 'notes');
      for (const [index, question] of embeddedMcqs.entries()) {
        await importQuestionRecord(
          prisma,
          {
            examId,
            topicId,
            legacyKey: `notes-mcq:${subjectKey}:${chapterKey}:${index}`,
            legacyPath: `notes/${subjectKey}/${chapterKey}/mcq/${index}`,
            question,
            dedupeSet,
          },
          counters,
        );
      }
    }
  }

  return counters;
}

function parseGsPaper(value: unknown): GsPaper {
  const text = String(value ?? 'GENERAL').toUpperCase();
  if (text.includes('GS1')) return GsPaper.GS1;
  if (text.includes('GS2')) return GsPaper.GS2;
  if (text.includes('GS3')) return GsPaper.GS3;
  if (text.includes('GS4')) return GsPaper.GS4;
  if (text.includes('CSAT')) return GsPaper.CSAT;
  if (text.includes('ESSAY')) return GsPaper.ESSAY;
  return GsPaper.GENERAL;
}

export async function importPyqs(
  prisma: PrismaClient,
  examId: string,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const pyqRoot = data.pyq as Record<string, unknown> | undefined;

  if (!pyqRoot) {
    counters.warnings.push('pyq node missing from RTDB export');
    return counters;
  }

  for (const [yearText, yearNode] of Object.entries(pyqRoot)) {
    const examYear = Number.parseInt(yearText, 10);
    if (!Number.isFinite(examYear) || !yearNode || typeof yearNode !== 'object') {
      continue;
    }

    const questionsNode = (yearNode as Record<string, unknown>).questions;
    if (!questionsNode || typeof questionsNode !== 'object') {
      continue;
    }

    for (const [questionId, questionNode] of Object.entries(
      questionsNode as Record<string, unknown>,
    )) {
      counters.discovered += 1;
      if (!questionNode || typeof questionNode !== 'object') {
        counters.rejected += 1;
        continue;
      }

      const row = questionNode as Record<string, unknown>;
      const text = normalizeWhitespace(String(row.question ?? ''));
      if (!text) {
        counters.rejected += 1;
        continue;
      }

      const legacyKey = `pyq:${examYear}:${questionId}`;
      const existing = await prisma.question.findFirst({
        where: { metadata: { path: ['legacyKey'], equals: legacyKey } },
      });

      const gsPaper = parseGsPaper(row.paper);
      const marks = row.marks ? Number(row.marks) : null;

      if (existing) {
        await prisma.pyqMetadata.upsert({
          where: { questionId: existing.id },
          create: {
            questionId: existing.id,
            examYear,
            paper: gsPaper,
            questionNumber: row.number ? Number(row.number) : null,
            wordLimit: typeof row.wordLimit === 'string' ? Number.parseInt(row.wordLimit, 10) || null : null,
            marks,
          },
          update: {
            examYear,
            paper: gsPaper,
            marks,
          },
        });
        counters.updated += 1;
        continue;
      }

      const created = await prisma.question.create({
        data: {
          examId,
          type: QuestionType.PYQ_MAINS,
          text,
          sourceType: ContentSourceType.LEGACY_RTDB,
          sourceYear: examYear,
          publishStatus: PublishStatus.PUBLISHED,
          metadata: legacyMetadata(legacyKey, `pyq/${examYear}/questions/${questionId}`),
        },
      });

      await prisma.pyqMetadata.create({
        data: {
          questionId: created.id,
          examYear,
          paper: gsPaper,
          questionNumber: row.number ? Number(row.number) : null,
          wordLimit: typeof row.wordLimit === 'string' ? Number.parseInt(row.wordLimit, 10) || null : null,
          marks,
        },
      });

      counters.imported += 1;
    }
  }

  return counters;
}

export async function importMainsQuestions(
  prisma: PrismaClient,
  examId: string,
  data: LegacyRtdbExport,
): Promise<ImportCounters> {
  const counters = createCounters();
  const mainsRoot = data.mains;

  if (!mainsRoot || typeof mainsRoot !== 'object') {
    counters.warnings.push('mains node missing from RTDB export');
    return counters;
  }

  for (const [yearText, months] of Object.entries(mainsRoot as Record<string, unknown>)) {
    if (!months || typeof months !== 'object') {
      continue;
    }

    for (const [monthText, days] of Object.entries(months as Record<string, unknown>)) {
      if (!days || typeof days !== 'object') {
        continue;
      }

      for (const [dayText, questionNode] of Object.entries(days as Record<string, unknown>)) {
        counters.discovered += 1;
        if (!questionNode || typeof questionNode !== 'object') {
          counters.rejected += 1;
          continue;
        }

        const row = questionNode as Record<string, unknown>;
        const text = normalizeWhitespace(String(row.question ?? ''));
        if (!text || text.toLowerCase().includes('no mains question')) {
          counters.skipped += 1;
          continue;
        }

        const legacyKey = `mains:${yearText}:${monthText}:${dayText}`;
        const publishedDate = new Date(
          Number.parseInt(yearText, 10),
          Number.parseInt(monthText, 10) - 1,
          Number.parseInt(dayText, 10),
        );

        const existing = await prisma.mainsQuestion.findFirst({
          where: { metadata: { path: ['legacyKey'], equals: legacyKey } },
        });

        const payload = {
          examId,
          text,
          gsPaper: parseGsPaper(row.paper),
          maxMarks: Number(row.marks ?? 10),
          publishedDate,
          publishStatus: PublishStatus.PUBLISHED,
          metadata: legacyMetadata(legacyKey, `mains/${yearText}/${monthText}/${dayText}`, {
            subject: row.subject != null ? String(row.subject) : null,
            totalAttempted: Number(row.total_attempted ?? 0),
          }),
        };

        if (existing) {
          await prisma.mainsQuestion.update({
            where: { id: existing.id },
            data: payload,
          });
          counters.updated += 1;
        } else {
          await prisma.mainsQuestion.create({ data: payload });
          counters.imported += 1;
        }
      }
    }
  }

  return counters;
}
