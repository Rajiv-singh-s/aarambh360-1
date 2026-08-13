import { Injectable, NotFoundException } from '@nestjs/common';
import { Difficulty, GsPaper, Prisma, QuestionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type {
  MainsQuestionDetailDto,
  MainsQuestionSummaryDto,
  NcertReferenceDto,
  PyqDetailDto,
  PyqSummaryDto,
  QuestionDetailDto,
  QuestionSummaryDto,
  StudyMaterialDetailDto,
  StudyMaterialSummaryDto,
} from '@aarambh360/types';
import {
  buildPaginationMeta,
  normalizePagination,
  PUBLISHED_CONTENT,
} from '../common/utils/pagination.util';

@Injectable()
export class ContentService {
  constructor(private readonly prisma: PrismaService) {}

  async listQuestions(params: {
    page?: number;
    limit?: number;
    examId?: string;
    subjectId?: string;
    topicId?: string;
    difficulty?: Difficulty;
    type?: QuestionType;
    year?: number;
  }): Promise<{ data: QuestionSummaryDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const pagination = normalizePagination(params.page, params.limit);
    const where: Prisma.QuestionWhereInput = {
      ...PUBLISHED_CONTENT,
      type: params.type ?? { in: ['MCQ_SINGLE', 'MCQ_MULTI', 'ASSERTION_REASON'] },
      ...(params.examId ? { examId: params.examId } : {}),
      ...(params.difficulty ? { difficulty: params.difficulty } : {}),
      ...(params.year ? { sourceYear: params.year } : {}),
      ...(params.topicId
        ? { topicMappings: { some: { topicId: params.topicId } } }
        : params.subjectId
          ? {
              topicMappings: {
                some: { topic: { subjectId: params.subjectId, ...PUBLISHED_CONTENT } },
              },
            }
          : {}),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.question.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          type: true,
          text: true,
          difficulty: true,
          sourceYear: true,
          publishStatus: true,
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data: rows,
      meta: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }

  async getQuestion(id: string): Promise<QuestionDetailDto> {
    const question = await this.prisma.question.findFirst({
      where: {
        id,
        ...PUBLISHED_CONTENT,
      },
      include: {
        options: {
          orderBy: { sortOrder: 'asc' },
          select: {
            id: true,
            label: true,
            text: true,
            sortOrder: true,
          },
        },
        topicMappings: { select: { topicId: true } },
      },
    });

    if (!question) {
      throw new NotFoundException(`Question not found: ${id}`);
    }

    return {
      id: question.id,
      type: question.type,
      text: question.text,
      difficulty: question.difficulty,
      sourceYear: question.sourceYear,
      publishStatus: question.publishStatus,
      explanation: question.explanation,
      options: question.options,
      topicIds: question.topicMappings.map((mapping) => mapping.topicId),
    };
  }

  async listPyqs(params: {
    page?: number;
    limit?: number;
    year?: number;
    paper?: GsPaper;
  }): Promise<{ data: PyqSummaryDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const pagination = normalizePagination(params.page, params.limit);
    const where: Prisma.QuestionWhereInput = {
      ...PUBLISHED_CONTENT,
      pyqMetadata: {
        is: {
          ...(params.year ? { examYear: params.year } : {}),
          ...(params.paper ? { paper: params.paper } : {}),
        },
      },
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.question.findMany({
        where,
        orderBy: [{ sourceYear: 'desc' }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          type: true,
          text: true,
          difficulty: true,
          sourceYear: true,
          publishStatus: true,
          pyqMetadata: {
            select: {
              examYear: true,
              paper: true,
              questionNumber: true,
              marks: true,
            },
          },
        },
      }),
      this.prisma.question.count({ where }),
    ]);

    return {
      data: rows
        .filter((row) => row.pyqMetadata)
        .map((row) => ({
          id: row.id,
          type: row.type,
          text: row.text,
          difficulty: row.difficulty,
          sourceYear: row.sourceYear,
          publishStatus: row.publishStatus,
          examYear: row.pyqMetadata!.examYear,
          paper: row.pyqMetadata!.paper,
          questionNumber: row.pyqMetadata!.questionNumber,
          marks: row.pyqMetadata!.marks ? Number(row.pyqMetadata!.marks) : null,
        })),
      meta: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }

  async getPyq(id: string): Promise<PyqDetailDto> {
    const question = await this.prisma.question.findFirst({
      where: {
        id,
        ...PUBLISHED_CONTENT,
        pyqMetadata: { isNot: null },
      },
      include: { pyqMetadata: true },
    });

    if (!question?.pyqMetadata) {
      throw new NotFoundException(`PYQ not found: ${id}`);
    }

    return {
      id: question.id,
      type: question.type,
      text: question.text,
      difficulty: question.difficulty,
      sourceYear: question.sourceYear,
      publishStatus: question.publishStatus,
      explanation: question.explanation,
      examYear: question.pyqMetadata.examYear,
      paper: question.pyqMetadata.paper,
      questionNumber: question.pyqMetadata.questionNumber,
      marks: question.pyqMetadata.marks ? Number(question.pyqMetadata.marks) : null,
      wordLimit: question.pyqMetadata.wordLimit,
    };
  }

  async listNcert(params: {
    page?: number;
    limit?: number;
    classNumber?: number;
    subjectName?: string;
  }): Promise<{ data: NcertReferenceDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const pagination = normalizePagination(params.page, params.limit);
    const where = {
      isActive: true,
      ...(params.classNumber ? { classNumber: params.classNumber } : {}),
      ...(params.subjectName
        ? { subjectName: { contains: params.subjectName, mode: 'insensitive' as const } }
        : {}),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.ncertReference.findMany({
        where,
        orderBy: [{ classNumber: 'asc' }, { sortOrder: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          classNumber: true,
          subjectName: true,
          title: true,
          pdfUrl: true,
          sortOrder: true,
        },
      }),
      this.prisma.ncertReference.count({ where }),
    ]);

    return {
      data: rows,
      meta: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }

  async listStudyMaterials(params: {
    page?: number;
    limit?: number;
    materialType?: string;
  }): Promise<{ data: StudyMaterialSummaryDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const pagination = normalizePagination(params.page, params.limit);
    const where = {
      ...PUBLISHED_CONTENT,
      ...(params.materialType ? { materialType: params.materialType } : {}),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.studyMaterial.findMany({
        where,
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          title: true,
          description: true,
          materialType: true,
          sortOrder: true,
        },
      }),
      this.prisma.studyMaterial.count({ where }),
    ]);

    return { data: rows, meta: buildPaginationMeta(pagination.page, pagination.limit, totalItems) };
  }

  async getStudyMaterial(id: string): Promise<StudyMaterialDetailDto> {
    const material = await this.prisma.studyMaterial.findFirst({
      where: { id, ...PUBLISHED_CONTENT },
      select: {
        id: true,
        title: true,
        description: true,
        materialType: true,
        sortOrder: true,
        url: true,
        metadata: true,
      },
    });

    if (!material) {
      throw new NotFoundException(`Study material not found: ${id}`);
    }

    const metadata = material.metadata as Record<string, unknown> | null;
    const content = typeof metadata?.content === 'string' ? metadata.content : null;

    return {
      id: material.id,
      title: material.title,
      description: material.description,
      materialType: material.materialType,
      sortOrder: material.sortOrder,
      url: material.url,
      content,
    };
  }

  async listMainsQuestions(params: {
    page?: number;
    limit?: number;
    paper?: GsPaper;
    year?: number;
  }): Promise<{ data: MainsQuestionSummaryDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const pagination = normalizePagination(params.page, params.limit);
    const where: Prisma.MainsQuestionWhereInput = {
      ...PUBLISHED_CONTENT,
      ...(params.paper ? { gsPaper: params.paper } : {}),
      ...(params.year
        ? {
            publishedDate: {
              gte: new Date(params.year, 0, 1),
              lt: new Date(params.year + 1, 0, 1),
            },
          }
        : {}),
    };

    const [rows, totalItems] = await Promise.all([
      this.prisma.mainsQuestion.findMany({
        where,
        orderBy: [{ publishedDate: 'desc' }, { createdAt: 'desc' }],
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          text: true,
          gsPaper: true,
          maxMarks: true,
          publishedDate: true,
        },
      }),
      this.prisma.mainsQuestion.count({ where }),
    ]);

    return {
      data: rows.map((row) => ({
        id: row.id,
        text: row.text,
        gsPaper: row.gsPaper,
        maxMarks: row.maxMarks,
        publishedDate: row.publishedDate?.toISOString().slice(0, 10) ?? null,
      })),
      meta: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }

  async getMainsQuestion(id: string): Promise<MainsQuestionDetailDto> {
    const question = await this.prisma.mainsQuestion.findFirst({
      where: { id, ...PUBLISHED_CONTENT },
      select: {
        id: true,
        text: true,
        gsPaper: true,
        maxMarks: true,
        publishedDate: true,
        subjectId: true,
        metadata: true,
      },
    });

    if (!question) {
      throw new NotFoundException(`Mains question not found: ${id}`);
    }

    return {
      id: question.id,
      text: question.text,
      gsPaper: question.gsPaper,
      maxMarks: question.maxMarks,
      publishedDate: question.publishedDate?.toISOString().slice(0, 10) ?? null,
      subjectId: question.subjectId,
      metadata: (question.metadata as Record<string, string | number | boolean | null> | null) ?? null,
    };
  }
}
