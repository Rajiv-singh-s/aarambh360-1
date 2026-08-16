import { Controller, Post, Body, Req, UseGuards } from '@nestjs/common';
import { AiMentorService } from './ai-mentor.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('ai-mentor')
@Controller('ai-mentor')
export class AiMentorController {
  constructor(private readonly aiMentorService: AiMentorService) {}

  @Post('chat')
  @ApiOperation({ summary: 'Chat with the AI Mentor' })
  // @UseGuards(AuthGuard) // Disabled temporarily for easy local testing if Auth is tricky, or enable if Auth is required.
  async chat(@Body() body: { messages: any[]; mode: string }) {
    return this.aiMentorService.chat(body.messages, body.mode);
  }
}
