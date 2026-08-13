import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  CutOffRecordDto,
  ExamDetailDto,
  ExamInfoSectionDto,
  ExamSummaryDto,
  SubjectSummaryDto,
} from '@aarambh360/types';
import {
  buildPaginationMeta,
  normalizeExamCode,
  normalizePagination,
  PUBLISHED_SUBJECT,
} from '../common/utils/pagination.util';

@Injectable()
export class ExamService {
  constructor(private readonly prisma: PrismaService) {}

  async listExams(): Promise<ExamSummaryDto[]> {
    const exams = await this.prisma.exam.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
      select: {
        id: true,
        code: true,
        name: true,
        description: true,
        isActive: true,
      },
    });
    return exams;
  }

  async getExamByCode(code: string): Promise<ExamDetailDto> {
    const exam = await this.prisma.exam.findUnique({
      where: { code: normalizeExamCode(code) },
      include: {
        stages: { orderBy: { sortOrder: 'asc' } },
      },
    });

    if (!exam || !exam.isActive) {
      throw new NotFoundException(`Exam not found: ${code}`);
    }

    return {
      id: exam.id,
      code: exam.code,
      name: exam.name,
      description: exam.description,
      isActive: exam.isActive,
      stages: exam.stages.map((stage) => ({
        id: stage.id,
        stageType: stage.stageType,
        name: stage.name,
        description: stage.description,
        sortOrder: stage.sortOrder,
      })),
    };
  }

  async listSubjectsByExamCode(code: string): Promise<SubjectSummaryDto[]> {
    const exam = await this.resolveExam(code);
    const subjects = await this.prisma.subject.findMany({
      where: {
        examId: exam.id,
        ...PUBLISHED_SUBJECT,
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        examId: true,
        code: true,
        name: true,
        gsPaper: true,
        iconUrl: true,
        description: true,
        sortOrder: true,
      },
    });
    return subjects;
  }

  async listExamInfoSections(examCode: string): Promise<ExamInfoSectionDto[]> {
    const exam = await this.resolveExam(examCode);
    const sections = await this.prisma.examInfoSection.findMany({
      where: {
        examId: exam.id,
        publishStatus: 'PUBLISHED',
      },
      orderBy: { sortOrder: 'asc' },
      select: {
        id: true,
        sectionKey: true,
        title: true,
        content: true,
        sortOrder: true,
      },
    });
    return sections;
  }

  async listCutoffs(
    examCode: string,
    page?: number,
    limit?: number,
    year?: number,
  ): Promise<{ data: CutOffRecordDto[]; meta: ReturnType<typeof buildPaginationMeta> }> {
    const exam = await this.resolveExam(examCode);
    const pagination = normalizePagination(page, limit);
    const where = {
      examId: exam.id,
      ...(year ? { year } : {}),
    };

    const [records, totalItems] = await Promise.all([
      this.prisma.cutOffRecord.findMany({
        where,
        orderBy: [{ year: 'desc' }, { category: 'asc' }],
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          year: true,
          category: true,
          prelimsCutoff: true,
          mainsCutoff: true,
          finalCutoff: true,
        },
      }),
      this.prisma.cutOffRecord.count({ where }),
    ]);

    return {
      data: records.map((record) => ({
        id: record.id,
        year: record.year,
        category: record.category,
        prelimsCutoff: record.prelimsCutoff ? Number(record.prelimsCutoff) : null,
        mainsCutoff: record.mainsCutoff ? Number(record.mainsCutoff) : null,
        finalCutoff: record.finalCutoff ? Number(record.finalCutoff) : null,
      })),
      meta: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }

  async resolveExam(code: string): Promise<{ id: string; code: string }> {
    const exam = await this.prisma.exam.findUnique({
      where: { code: normalizeExamCode(code) },
      select: { id: true, code: true, isActive: true },
    });
    if (!exam || !exam.isActive) {
      throw new NotFoundException(`Exam not found: ${code}`);
    }
    return exam;
  }
}
