import { Controller, Get, Post, Body, Query, UseGuards } from '@nestjs/common';
import { DailyChallengeService } from './daily-challenge.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { SubmitDailyChallengeRequestDto, DailyChallengePaperType } from '@aarambh360/types';

@Controller('daily-challenges')
@UseGuards(FirebaseAuthGuard)
export class DailyChallengeController {
  constructor(private readonly service: DailyChallengeService) {}

  @Get('today')
  getTodayChallenges(@CurrentUser() user: any) {
    return this.service.getTodayChallenges(user.id);
  }

  @Post('submit')
  submitChallenge(@CurrentUser() user: any, @Body() payload: SubmitDailyChallengeRequestDto) {
    return this.service.submitChallenge(user.id, payload);
  }

  @Get('leaderboard')
  getLeaderboard(
    @Query('paperType') paperType: DailyChallengePaperType,
    @Query('period') period: string
  ) {
    return this.service.getLeaderboard(paperType, period || 'DAILY');
  }
}
