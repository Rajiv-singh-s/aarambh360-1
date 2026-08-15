import { Module } from '@nestjs/common';
import { DailyChallengeController } from './daily-challenge.controller';
import { DailyChallengeService } from './daily-challenge.service';
import { PrismaModule } from '../prisma/prisma.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DailyChallengeController],
  providers: [DailyChallengeService],
})
export class DailyChallengeModule {}
