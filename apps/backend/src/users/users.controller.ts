import { Body, Controller, Delete, Patch } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type {
  AuthMeResponseDto,
  AuthUserContext,
  DeleteAccountResponseDto,
} from '@aarambh360/types';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthUserContext,
    @Body() dto: UpdateProfileDto,
  ): Promise<AuthMeResponseDto> {
    return this.usersService.updateProfile(user.id, dto);
  }

  @Throttle({ default: { limit: 3, ttl: 60000 } })
  @Delete('me')
  async deleteMe(@CurrentUser() user: AuthUserContext): Promise<DeleteAccountResponseDto> {
    return this.usersService.deleteAccount(user.id, user.firebaseUid);
  }
}
