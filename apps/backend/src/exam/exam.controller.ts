import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiDataResponse, ExamDetailDto, ExamSummaryDto, SubjectSummaryDto } from '@aarambh360/types';
import { Public } from '../common/decorators/public.decorator';
import { ExamService } from './exam.service';

@ApiTags('exams')
@Public()
@Controller('exams')
export class ExamController {
  constructor(private readonly examService: ExamService) {}

  @Get()
  @ApiOperation({ summary: 'List active exams' })
  async listExams(): Promise<ApiDataResponse<ExamSummaryDto[]>> {
    return { data: await this.examService.listExams() };
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get exam detail with stages' })
  async getExam(@Param('code') code: string): Promise<ApiDataResponse<ExamDetailDto>> {
    return { data: await this.examService.getExamByCode(code) };
  }

  @Get(':code/subjects')
  @ApiOperation({ summary: 'List published subjects for an exam' })
  async listSubjects(@Param('code') code: string): Promise<ApiDataResponse<SubjectSummaryDto[]>> {
    return { data: await this.examService.listSubjectsByExamCode(code) };
  }
}
