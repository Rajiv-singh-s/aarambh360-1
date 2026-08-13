import { Body, Controller, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import type { ConfirmUploadRequestDto, UploadUrlRequestDto } from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { StorageService } from './storage.service';

@ApiTags('storage')
@ApiBearerAuth()
@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('upload-url')
  @ApiOperation({ summary: 'Generate pre-signed upload URL for R2' })
  async uploadUrl(
    @CurrentUser() user: { id: string },
    @Body() body: UploadUrlRequestDto,
  ) {
    return { data: await this.storageService.generateUploadUrl(user.id, body) };
  }

  @Post('confirm')
  @ApiOperation({ summary: 'Confirm upload and persist asset URL' })
  async confirm(@CurrentUser() user: { id: string }, @Body() body: ConfirmUploadRequestDto) {
    return { data: await this.storageService.confirmUpload(user.id, body) };
  }
}
