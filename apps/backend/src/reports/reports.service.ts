import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateReportRequestDto, ReportDto } from '@aarambh360/types';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, payload: CreateReportRequestDto): Promise<ReportDto> {
    const question = await this.prisma.question.findUnique({
      where: { id: payload.questionId },
    });
    
    if (!question) {
      throw new NotFoundException(`Question not found: ${payload.questionId}`);
    }

    const report = await this.prisma.questionReport.create({
      data: {
        userId,
        questionId: payload.questionId,
        reason: payload.reason,
      },
    });

    return {
      id: report.id,
      questionId: report.questionId,
      reason: report.reason,
      status: report.status as any,
      adminNotes: report.adminNotes,
      createdAt: report.createdAt.toISOString(),
    };
  }

  async list(userId: string): Promise<ReportDto[]> {
    const reports = await this.prisma.questionReport.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        question: {
          include: {
            options: true,
          },
        },
      },
    });

    return reports.map((report) => {
      let mappedQuestion: ReportDto['question'] = undefined;
      
      if (report.question) {
        const correctOption = report.question.options.find(o => o.isCorrect);
        mappedQuestion = {
          id: report.question.id,
          type: report.question.type as any,
          text: report.question.text,
          difficulty: report.question.difficulty as any,
          options: report.question.options.map(o => ({
            id: o.id,
            label: o.label,
            text: o.text,
            sortOrder: o.sortOrder,
          })),
          explanation: report.question.explanation,
          correctOptionId: correctOption?.id,
        };
      }

      return {
        id: report.id,
        questionId: report.questionId,
        reason: report.reason,
        status: report.status as any,
        adminNotes: report.adminNotes,
        createdAt: report.createdAt.toISOString(),
        question: mappedQuestion,
      };
    });
  }
}
