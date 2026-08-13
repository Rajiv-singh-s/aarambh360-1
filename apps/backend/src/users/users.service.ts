import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import type {
  AuthMeResponseDto,
  DeleteAccountResponseDto,
} from '@aarambh360/types';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { FirebaseAdminService } from '../auth/firebase-admin.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  async updateProfile(userId: string, dto: UpdateProfileDto): Promise<AuthMeResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: { profile: true },
    });

    if (!user?.profile) {
      throw new NotFoundException('User profile not found');
    }

    await this.prisma.profile.update({
      where: { userId },
      data: {
        name: dto.name,
        gender: dto.gender,
        avatarUrl: dto.avatarUrl,
        targetYear: dto.targetYear,
        preparationLevel: dto.preparationLevel,
        dailyStudyMinutes: dto.dailyStudyMinutes,
        bio: dto.bio,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
      },
    });

    if (dto.profileCompleted !== undefined) {
      await this.prisma.user.update({
        where: { id: userId },
        data: { profileCompleted: dto.profileCompleted },
      });
    }

    return this.authService.getAuthProfile(userId);
  }

  async deleteAccount(userId: string, firebaseUid: string): Promise<DeleteAccountResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const deletedAt = new Date();

    await this.prisma.user.update({
      where: { id: userId },
      data: { deletedAt },
    });

    if (this.firebaseAdmin.isConfigured()) {
      try {
        await this.firebaseAdmin.deleteUser(firebaseUid);
      } catch (error) {
        this.logger.warn(
          `PostgreSQL user soft-deleted but Firebase Auth deletion failed for uid=${firebaseUid}`,
          error,
        );
      }
    } else {
      this.logger.warn(
        'Firebase Admin not configured — Firebase Auth account was not deleted server-side',
      );
    }

    return {
      message: 'Account deleted successfully',
      deletedAt: deletedAt.toISOString(),
    };
  }

  async assertActiveUser(userId: string): Promise<void> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      select: { id: true },
    });

    if (!user) {
      throw new UnauthorizedException('Account is unavailable');
    }
  }
}
