import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  ApiDataResponse,
  LessonDetailDto,
  LessonSummaryDto,
  PaginatedResponse,
  TopicSummaryDto,
  TopicWithProgressDto,
} from '@aarambh360/types';
import { LessonsQueryDto } from '../common/dto/content-query.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { LearnService } from './learn.service';

@ApiTags('learn')
@Controller()
export class LearnController {
  constructor(private readonly learnService: LearnService) {}

  @Get('subjects/:id/topics')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'List topics for a subject with optional progress (auth required)' })
  async listTopicsBySubject(
    @Param('id') subjectId: string,
    @CurrentUser() user: { id: string },
  ): Promise<ApiDataResponse<TopicWithProgressDto[]>> {
    return { data: await this.learnService.listTopicsBySubject(subjectId, user.id) };
  }

  @Public()
  @Get('topics/:id')
  @ApiOperation({ summary: 'Get topic detail' })
  async getTopic(@Param('id') id: string): Promise<ApiDataResponse<TopicSummaryDto>> {
    return { data: await this.learnService.getTopic(id) };
  }

  @Public()
  @Get('topics/:id/lessons')
  @ApiOperation({ summary: 'List published lessons for a topic' })
  async listLessons(
    @Param('id') topicId: string,
    @Query() query: LessonsQueryDto,
  ): Promise<PaginatedResponse<LessonSummaryDto>> {
    const result = await this.learnService.listLessonsByTopic(topicId, query.page, query.limit);
    return { data: result.data, meta: result.meta };
  }

  @Public()
  @Get('lessons/:id')
  @ApiOperation({ summary: 'Get lesson with sections' })
  async getLesson(@Param('id') id: string): Promise<ApiDataResponse<LessonDetailDto>> {
    return { data: await this.learnService.getLesson(id) };
  }
}
