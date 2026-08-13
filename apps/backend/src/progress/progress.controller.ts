import { Controller, Get, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ProgressService } from './progress.service';

@ApiTags('progress')
@ApiBearerAuth()
@Controller()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('progress/streak')
  @ApiOperation({ summary: 'Get user streak data' })
  async getStreak(@CurrentUser() user: { id: string }) {
    return { data: await this.progressService.getStreak(user.id) };
  }

  @Get('progress/stats')
  @ApiOperation({ summary: 'Get user progress statistics' })
  async getStats(@CurrentUser() user: { id: string }) {
    return { data: await this.progressService.getStats(user.id) };
  }

  @Get('mistakes')
  @ApiOperation({ summary: 'Get mistakes revision bank' })
  async getMistakes(@CurrentUser() user: { id: string }) {
    return { data: await this.progressService.getMistakes(user.id) };
  }

  @Get('leaderboard/:subjectKey')
  @ApiOperation({ summary: 'Get subject leaderboard' })
  async getLeaderboard(@Param('subjectKey') subjectKey: string) {
    return { data: await this.progressService.getLeaderboard(subjectKey) };
  }
}
