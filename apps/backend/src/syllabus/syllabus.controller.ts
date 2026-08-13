import { Controller, Get, Param } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ApiDataResponse, SyllabusTreeNodeDto } from '@aarambh360/types';
import { Public } from '../common/decorators/public.decorator';
import { SyllabusService } from './syllabus.service';

@ApiTags('syllabus')
@Public()
@Controller('syllabus')
export class SyllabusController {
  constructor(private readonly syllabusService: SyllabusService) {}

  @Get(':examCode/tree')
  @ApiOperation({ summary: 'Get nested syllabus tree for an exam' })
  async getTree(@Param('examCode') examCode: string): Promise<ApiDataResponse<SyllabusTreeNodeDto[]>> {
    return { data: await this.syllabusService.getSyllabusTree(examCode) };
  }
}
