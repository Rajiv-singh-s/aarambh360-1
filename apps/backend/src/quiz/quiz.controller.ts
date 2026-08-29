import { Controller, Get, Param, Post, Body } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  ApiDataResponse,
  CompleteQuizSessionResponseDto,
  QuizSessionDto,
  StartQuizSessionRequestDto,
  SubmitQuizAnswerRequestDto,
  SubmitQuizAnswerResponseDto,
} from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { QuizService } from './quiz.service';

@ApiTags('quiz')
@ApiBearerAuth()
@Controller('quiz')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Get('test-series')
  @ApiOperation({ summary: 'Get list of test series' })
  async getTestSeries() {
    return { data: [] };
  }

  @Get('active')
  @ApiOperation({ summary: 'Get active quizzes' })
  async getActiveQuizzes() {
    return { data: [] };
  }

  @Post('sessions')
  @ApiOperation({ summary: 'Start a quiz session for a topic' })
  async startSession(
    @CurrentUser() user: { id: string },
    @Body() body: StartQuizSessionRequestDto,
  ): Promise<ApiDataResponse<QuizSessionDto>> {
    return {
      data: await this.quizService.startSession(user.id, body.topicId, body.count ?? 10),
    };
  }

  @Post(':id/answers')
  @ApiOperation({ summary: 'Submit an answer for a quiz session question' })
  async submitAnswer(
    @CurrentUser() user: { id: string },
    @Param('id') sessionId: string,
    @Body() body: SubmitQuizAnswerRequestDto,
  ): Promise<ApiDataResponse<SubmitQuizAnswerResponseDto>> {
    return { data: await this.quizService.submitAnswer(user.id, sessionId, body) };
  }

  @Post(':id/complete')
  @ApiOperation({ summary: 'Complete a quiz session and compute score/streak' })
  async completeSession(
    @CurrentUser() user: { id: string },
    @Param('id') sessionId: string,
  ): Promise<ApiDataResponse<CompleteQuizSessionResponseDto>> {
    return { data: await this.quizService.completeSession(user.id, sessionId) };
  }
}
