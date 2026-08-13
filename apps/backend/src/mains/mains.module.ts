import { Module } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { RagModule } from '../rag/rag.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { AI_PROVIDER } from './ai/ai.provider';
import { createAiProvider } from './ai/ai.providers';
import { EvaluationService } from './evaluation/evaluation.service';
import { MainsController } from './mains.controller';
import { MainsService } from './mains.service';
import { OcrService } from './ocr/ocr.service';
import { OCR_PROVIDER } from './ocr/ocr.provider';
import { createOcrProvider } from './ocr/ocr.providers';

@Module({
  imports: [RagModule, SubscriptionsModule, NotificationsModule, AnalyticsModule],
  controllers: [MainsController],
  providers: [
    MainsService,
    EvaluationService,
    OcrService,
    {
      provide: OCR_PROVIDER,
      useFactory: () => createOcrProvider(),
    },
    {
      provide: AI_PROVIDER,
      useFactory: () => createAiProvider(),
    },
  ],
  exports: [MainsService, EvaluationService, OcrService],
})
export class MainsModule {}
