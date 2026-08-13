import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { RagSearchRequestDto } from '@aarambh360/types';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { IngestionService } from './ingestion.service';
import { RagService } from './rag.service';

@ApiTags('rag')
@ApiBearerAuth()
@Controller('rag')
export class RagController {
  constructor(
    private readonly ragService: RagService,
    private readonly ingestionService: IngestionService,
  ) {}

  @Post('search')
  @UseGuards(RolesGuard)
  @Roles('EDITOR', 'MODERATOR', 'ADMIN')
  @ApiOperation({ summary: 'Semantic search over indexed content' })
  async search(@Body() body: RagSearchRequestDto) {
    return { data: await this.ragService.search(body) };
  }

  @Get('stats')
  @UseGuards(RolesGuard)
  @Roles('EDITOR', 'MODERATOR', 'ADMIN')
  @ApiOperation({ summary: 'RAG index statistics' })
  async stats() {
    return { data: await this.ragService.getIndexStats() };
  }

  @Post('ingest')
  @UseGuards(RolesGuard)
  @Roles('EDITOR', 'MODERATOR', 'ADMIN')
  @ApiOperation({ summary: 'Run full published-content ingestion' })
  async ingest() {
    return { data: await this.ingestionService.ingestAllPublishedContent() };
  }
}
