import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  CreateMainsSubmissionRequestDto,
  EvaluateMainsSubmissionRequestDto,
} from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EvaluationService } from './evaluation/evaluation.service';
import { MainsService } from './mains.service';

@ApiTags('mains')
@ApiBearerAuth()
@Controller('mains/submissions')
export class MainsController {
  constructor(
    private readonly mainsService: MainsService,
    private readonly evaluationService: EvaluationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List current user Mains submissions with evaluation summary' })
  async listSubmissions(
    @CurrentUser() user: { id: string },
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = Math.min(Math.max(limit ? Number(limit) : 20, 1), 50);
    return { data: await this.mainsService.listSubmissions(user.id, parsedLimit) };
  }

  @Post()
  @ApiOperation({ summary: 'Create a Mains submission and enqueue OCR' })
  async createSubmission(
    @CurrentUser() user: { id: string },
    @Body() body: CreateMainsSubmissionRequestDto,
  ) {
    return { data: await this.mainsService.createSubmission(user.id, body) };
  }

  @Get(':id/evaluation')
  @ApiOperation({ summary: 'Get structured evaluation result for a submission' })
  async getEvaluation(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.evaluationService.getEvaluation(user.id, id) };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get submission status, OCR text, and evaluation if available' })
  async getSubmission(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.mainsService.getSubmission(user.id, id) };
  }

  @Post(':id/evaluate')
  @Throttle({ default: { limit: 10, ttl: 3600000 } })
  @ApiOperation({ summary: 'Trigger RAG-grounded AI evaluation for a submission' })
  async evaluateSubmission(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: EvaluateMainsSubmissionRequestDto,
  ) {
    return { data: await this.evaluationService.requestEvaluation(user.id, id, body ?? {}) };
  }

  @Post(':id/retry')
  @ApiOperation({ summary: 'Retry OCR for a failed submission' })
  async retrySubmission(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.mainsService.retrySubmission(user.id, id) };
  }
}
