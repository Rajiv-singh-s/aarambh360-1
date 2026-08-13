import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { CreateBookmarkRequestDto } from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { BookmarksService } from './bookmarks.service';

@ApiTags('bookmarks')
@ApiBearerAuth()
@Controller('bookmarks')
export class BookmarksController {
  constructor(private readonly bookmarksService: BookmarksService) {}

  @Get()
  @ApiOperation({ summary: 'List user bookmarks' })
  async list(@CurrentUser() user: { id: string }) {
    return { data: await this.bookmarksService.list(user.id) };
  }

  @Post()
  @ApiOperation({ summary: 'Create a bookmark' })
  async create(@CurrentUser() user: { id: string }, @Body() body: CreateBookmarkRequestDto) {
    return { data: await this.bookmarksService.create(user.id, body) };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a bookmark' })
  async remove(@CurrentUser() user: { id: string }, @Param('id') id: string) {
    await this.bookmarksService.remove(user.id, id);
    return { data: { deleted: true } };
  }
}
