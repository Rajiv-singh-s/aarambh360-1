import { Module } from '@nestjs/common';
import { RolesGuard } from '../common/guards/roles.guard';
import { ChunkingService } from './chunking.service';
import { EMBEDDING_PROVIDER } from './embedding/embedding.provider';
import { createEmbeddingProvider } from './embedding/embedding.providers';
import { IngestionService } from './ingestion.service';
import { RagController } from './rag.controller';
import { RagService } from './rag.service';

@Module({
  controllers: [RagController],
  providers: [
    RagService,
    IngestionService,
    ChunkingService,
    RolesGuard,
    {
      provide: EMBEDDING_PROVIDER,
      useFactory: () => createEmbeddingProvider(),
    },
  ],
  exports: [RagService, IngestionService],
})
export class RagModule {}
