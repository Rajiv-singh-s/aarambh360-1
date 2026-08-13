import { Controller, Get, Headers, Post, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { AuthMeResponseDto, LoginResponseDto } from '@aarambh360/types';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Headers('authorization') authorization?: string): Promise<LoginResponseDto> {
    const token = this.authService.extractBearerToken(authorization);
    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }
    return this.authService.loginWithToken(token);
  }

  @Get('me')
  async me(@CurrentUser() user: { id: string }): Promise<AuthMeResponseDto> {
    return this.authService.getAuthProfile(user.id);
  }
}
