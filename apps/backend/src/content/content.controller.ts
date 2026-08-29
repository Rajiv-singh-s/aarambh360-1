import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  ApiDataResponse,
  MainsQuestionDetailDto,
  MainsQuestionSummaryDto,
  NcertReferenceDto,
  PaginatedResponse,
  PyqDetailDto,
  PyqSummaryDto,
  QuestionDetailDto,
  QuestionSummaryDto,
  StudyMaterialDetailDto,
  StudyMaterialSummaryDto,
} from '@aarambh360/types';
import {
  MainsQueryDto,
  NcertQueryDto,
  PyqQueryDto,
  QuestionsQueryDto,
  StudyMaterialsQueryDto,
} from '../common/dto/content-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { ContentService } from './content.service';

@ApiTags('content')
@Public()
@Controller()
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Get('questions')
  @ApiOperation({ summary: 'List published MCQ questions (answers excluded)' })
  async listQuestions(@Query() query: QuestionsQueryDto): Promise<PaginatedResponse<QuestionSummaryDto>> {
    const result = await this.contentService.listQuestions(query);
    return { data: result.data, meta: result.meta };
  }

  @Get('questions/:id')
  @ApiOperation({ summary: 'Get question detail (correct option not exposed)' })
  async getQuestion(@Param('id') id: string): Promise<ApiDataResponse<QuestionDetailDto>> {
    return { data: await this.contentService.getQuestion(id) };
  }

  @Get('pyq')
  @ApiOperation({ summary: 'List published PYQs' })
  async listPyqs(@Query() query: PyqQueryDto): Promise<PaginatedResponse<PyqSummaryDto>> {
    const result = await this.contentService.listPyqs(query);
    return { data: result.data, meta: result.meta };
  }

  @Get('pyq/:id')
  @ApiOperation({ summary: 'Get PYQ detail' })
  async getPyq(@Param('id') id: string): Promise<ApiDataResponse<PyqDetailDto>> {
    return { data: await this.contentService.getPyq(id) };
  }

  @Get('ncert')
  @ApiOperation({ summary: 'List NCERT references' })
  async listNcert(@Query() query: NcertQueryDto): Promise<PaginatedResponse<NcertReferenceDto>> {
    const result = await this.contentService.listNcert(query);
    return { data: result.data, meta: result.meta };
  }

  @Get('study-materials')
  @ApiOperation({ summary: 'List published study materials' })
  async listStudyMaterials(
    @Query() query: StudyMaterialsQueryDto,
  ): Promise<PaginatedResponse<StudyMaterialSummaryDto>> {
    const result = await this.contentService.listStudyMaterials(query);
    return { data: result.data, meta: result.meta };
  }

  @Get('study-materials/:id')
  @ApiOperation({ summary: 'Get study material detail' })
  async getStudyMaterial(@Param('id') id: string): Promise<ApiDataResponse<StudyMaterialDetailDto>> {
    return { data: await this.contentService.getStudyMaterial(id) };
  }

  @Get('mains')
  @ApiOperation({ summary: 'List published Mains questions (read-only)' })
  async listMains(@Query() query: MainsQueryDto): Promise<PaginatedResponse<MainsQuestionSummaryDto>> {
    const result = await this.contentService.listMainsQuestions(query);
    return { data: result.data, meta: result.meta };
  }

  @Get('mains/questions/:id')
  @ApiOperation({ summary: 'Get Mains question detail' })
  async getMains(@Param('id') id: string): Promise<ApiDataResponse<MainsQuestionDetailDto>> {
    return { data: await this.contentService.getMainsQuestion(id) };
  }

  @Get('content/current-affairs')
  @ApiOperation({ summary: 'List current affairs' })
  async listCurrentAffairs() {
    return { data: [] };
  }
}
