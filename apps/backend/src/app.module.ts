import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { CacheModule } from '@nestjs/cache-manager';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AuthModule } from './auth/auth.module';
import { AdminModule } from './admin/admin.module';
import { BookmarksModule } from './bookmarks/bookmarks.module';
import { ReportsModule } from './reports/reports.module';
import { DailyChallengeModule } from './daily-challenge/daily-challenge.module';
import { AppConfigModule } from './config/app-config.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ContentModule } from './content/content.module';
import { ExamModule } from './exam/exam.module';
import { LearnModule } from './learn/learn.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProgressModule } from './progress/progress.module';
import { QuizModule } from './quiz/quiz.module';
import { MainsModule } from './mains/mains.module';
import { RagModule } from './rag/rag.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdsModule } from './ads/ads.module';
import { NotificationsModule } from './notifications/notifications.module';
import { SubscriptionsModule } from './subscriptions/subscriptions.module';
import { StorageModule } from './storage/storage.module';
import { SyllabusModule } from './syllabus/syllabus.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    AppConfigModule,
    CacheModule.register({ isGlobal: true, ttl: 300_000 }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
    ]),
    PrismaModule,
    AuthModule,
    UsersModule,
    ExamModule,
    LearnModule,
    SyllabusModule,
    ContentModule,
    QuizModule,
    ProgressModule,
    BookmarksModule,
    ReportsModule,
    DailyChallengeModule,
    AdminModule,
    StorageModule,
    MainsModule,
    RagModule,
    SubscriptionsModule,
    NotificationsModule,
    AnalyticsModule,
    AdsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
