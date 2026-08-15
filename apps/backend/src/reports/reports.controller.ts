import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import type { CreateReportRequestDto, ReportDto, AuthUserContext } from '@aarambh360/types';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('reports')
@UseGuards(FirebaseAuthGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthUserContext,
    @Body() payload: CreateReportRequestDto,
  ): Promise<ReportDto> {
    return this.reportsService.create(user.id, payload);
  }

  @Get()
  async list(@CurrentUser() user: AuthUserContext): Promise<ReportDto[]> {
    return this.reportsService.list(user.id);
  }
}

