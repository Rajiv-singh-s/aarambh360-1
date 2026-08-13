import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiDataResponse, CutOffRecordDto, ExamInfoSectionDto, PaginatedResponse } from '@aarambh360/types';
import { CutoffsQueryDto } from '../common/dto/content-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { ExamService } from './exam.service';

@ApiTags('exam-info')
@Public()
@Controller()
export class ExamInfoController {
  constructor(private readonly examService: ExamService) {}

  @Get('exam-info/:examCode')
  @ApiOperation({ summary: 'List exam information sections' })
  async listExamInfo(
    @Param('examCode') examCode: string,
  ): Promise<ApiDataResponse<ExamInfoSectionDto[]>> {
    return { data: await this.examService.listExamInfoSections(examCode) };
  }

  @Get('cutoffs/:examCode')
  @ApiOperation({ summary: 'List historical cutoff records' })
  async listCutoffs(
    @Param('examCode') examCode: string,
    @Query() query: CutoffsQueryDto,
  ): Promise<PaginatedResponse<CutOffRecordDto>> {
    const result = await this.examService.listCutoffs(
      examCode,
      query.page,
      query.limit,
      query.year,
    );
    return { data: result.data, meta: result.meta };
  }
}
