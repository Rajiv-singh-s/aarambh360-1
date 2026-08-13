import { Body, Controller, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type {
  AdminChapterInputDto,
  AdminLessonInputDto,
  AdminMainsQuestionInputDto,
  AdminQuestionInputDto,
  AdminSubjectInputDto,
  AdminTopicInputDto,
} from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { AdminService } from './admin.service';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(RolesGuard)
@Roles('EDITOR', 'MODERATOR', 'ADMIN')
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Admin dashboard stats' })
  async dashboard() {
    return { data: await this.adminService.getDashboardStats() };
  }

  @Get('subjects')
  async listSubjects() {
    return { data: await this.adminService.listSubjects() };
  }

  @Post('subjects')
  async createSubject(
    @CurrentUser() user: { id: string },
    @Body() body: AdminSubjectInputDto,
  ) {
    return { data: await this.adminService.createSubject(user.id, body) };
  }

  @Patch('subjects/:id')
  async updateSubject(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: Partial<AdminSubjectInputDto>,
  ) {
    return { data: await this.adminService.updateSubject(user.id, id, body) };
  }

  @Post('subjects/:id/review')
  async submitSubjectForReview(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.submitSubjectForReview(user.id, id) };
  }

  @Post('subjects/:id/publish')
  async publishSubject(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.publishSubject(user.id, id) };
  }

  @Get('topics')
  async listTopics(@Query('subjectId') subjectId?: string) {
    return { data: await this.adminService.listTopics(subjectId) };
  }

  @Post('topics')
  async createTopic(@CurrentUser() user: { id: string }, @Body() body: AdminTopicInputDto) {
    return { data: await this.adminService.createTopic(user.id, body) };
  }

  @Patch('topics/:id')
  async updateTopic(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: Partial<AdminTopicInputDto>,
  ) {
    return { data: await this.adminService.updateTopic(user.id, id, body) };
  }

  @Post('topics/:id/review')
  async submitTopicForReview(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.submitTopicForReview(user.id, id) };
  }

  @Post('topics/:id/publish')
  async publishTopic(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.publishTopic(user.id, id) };
  }

  @Get('chapters')
  async listChapters(@Query('subjectId') subjectId?: string) {
    return { data: await this.adminService.listChapters(subjectId) };
  }

  @Post('chapters')
  async createChapter(@CurrentUser() user: { id: string }, @Body() body: AdminChapterInputDto) {
    return { data: await this.adminService.createChapter(user.id, body) };
  }

  @Get('lessons')
  async listLessons(@Query('chapterId') chapterId?: string) {
    return { data: await this.adminService.listLessons(chapterId) };
  }

  @Post('lessons')
  async createLesson(@CurrentUser() user: { id: string }, @Body() body: AdminLessonInputDto) {
    return { data: await this.adminService.createLesson(user.id, body) };
  }

  @Patch('lessons/:id')
  async updateLesson(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: Partial<AdminLessonInputDto>,
  ) {
    return { data: await this.adminService.updateLesson(user.id, id, body) };
  }

  @Post('lessons/:id/review')
  async submitLessonForReview(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.submitLessonForReview(user.id, id) };
  }

  @Post('lessons/:id/publish')
  async publishLesson(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.publishLesson(user.id, id) };
  }

  @Get('questions/pending')
  async listPendingQuestions(@Query('limit') limit?: string) {
    return { data: await this.adminService.listPendingQuestions(limit ? Number(limit) : 20) };
  }

  @Post('questions')
  async createQuestion(
    @CurrentUser() user: { id: string },
    @Body() body: AdminQuestionInputDto,
  ) {
    return { data: await this.adminService.createQuestion(user.id, body) };
  }

  @Post('questions/:id/review')
  async submitQuestionForReview(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.submitQuestionForReview(user.id, id) };
  }

  @Post('questions/:id/publish')
  async publishQuestion(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.publishQuestion(user.id, id) };
  }

  @Post('mains')
  async createMains(@CurrentUser() user: { id: string }, @Body() body: AdminMainsQuestionInputDto) {
    return { data: await this.adminService.createMains(user.id, body) };
  }

  @Patch('mains/:id')
  async updateMains(
    @CurrentUser() user: { id: string },
    @Param('id') id: string,
    @Body() body: Partial<AdminMainsQuestionInputDto>,
  ) {
    return { data: await this.adminService.updateMains(user.id, id, body) };
  }

  @Post('mains/:id/review')
  async submitMainsForReview(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.submitMainsForReview(user.id, id) };
  }

  @Post('mains/:id/publish')
  async publishMains(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    return { data: await this.adminService.publishMains(user.id, id) };
  }

  @Get('audit-log')
  async auditLog() {
    return { data: await this.adminService.listAuditLog() };
  }
}
