import { Injectable, UnauthorizedException } from '@nestjs/common';
import type { DecodedIdToken } from 'firebase-admin/auth';
import type {
  AuthMeResponseDto,
  AuthUserContext,
  LoginResponseDto,
} from '@aarambh360/types';
import { Prisma, User } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { FirebaseAdminService } from './firebase-admin.service';

type UserWithRelations = Prisma.UserGetPayload<{
  include: {
    profile: true;
    preferences: true;
    onboarding: true;
  };
}>;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  extractBearerToken(authorizationHeader?: string): string | null {
    if (!authorizationHeader?.startsWith('Bearer ')) {
      return null;
    }
    const token = authorizationHeader.slice('Bearer '.length).trim();
    return token.length > 0 ? token : null;
  }

  async verifyToken(idToken: string): Promise<DecodedIdToken> {
    try {
      return await this.firebaseAdmin.verifyIdToken(idToken);
    } catch (e) {
      console.error('Token verification failed:', e);
      throw new UnauthorizedException('Invalid or expired authentication token');
    }
  }

  async loginWithToken(idToken: string): Promise<LoginResponseDto> {
    const decoded = await this.verifyToken(idToken);
    const user = await this.upsertUserFromFirebase(decoded);
    return this.toAuthResponse(user);
  }

  async validateAndLoadUser(decoded: DecodedIdToken): Promise<AuthUserContext> {
    const user = await this.prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
    });

    if (!user || user.deletedAt) {
      throw new UnauthorizedException('Account is unavailable');
    }

    return this.toAuthUserContext(user);
  }

  async getAuthProfile(userId: string): Promise<AuthMeResponseDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId, deletedAt: null },
      include: {
        profile: true,
        preferences: true,
        onboarding: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Account is unavailable');
    }

    return this.toAuthResponse(user);
  }

  private async upsertUserFromFirebase(decoded: DecodedIdToken): Promise<UserWithRelations> {
    const existing = await this.prisma.user.findUnique({
      where: { firebaseUid: decoded.uid },
      include: { profile: true, preferences: true, onboarding: true },
    });

    if (existing?.deletedAt) {
      throw new UnauthorizedException('Account has been deleted');
    }

    const displayName =
      (decoded.name as string | undefined) ??
      decoded.email?.split('@')[0] ??
      'Aspirant';

    if (existing) {
      const updated = await this.prisma.user.update({
        where: { id: existing.id },
        data: {
          email: decoded.email ?? existing.email,
          phone: decoded.phone_number ?? existing.phone,
        },
        include: { profile: true, preferences: true, onboarding: true },
      });
      return updated;
    }

    return this.prisma.user.create({
      data: {
        firebaseUid: decoded.uid,
        email: decoded.email ?? null,
        phone: decoded.phone_number ?? null,
        profile: {
          create: {
            name: displayName,
          },
        },
        preferences: {
          create: {},
        },
        onboarding: {
          create: {},
        },
      },
      include: { profile: true, preferences: true, onboarding: true },
    });
  }

  private toAuthUserContext(user: User): AuthUserContext {
    return {
      id: user.id,
      firebaseUid: user.firebaseUid,
      email: user.email,
      phone: user.phone,
      role: user.role,
      profileCompleted: user.profileCompleted,
    };
  }

  private toAuthResponse(user: UserWithRelations): LoginResponseDto {
    if (!user.profile || !user.preferences || !user.onboarding) {
      throw new Error('User identity records are incomplete');
    }

    return {
      user: {
        id: user.id,
        firebaseUid: user.firebaseUid,
        email: user.email,
        phone: user.phone,
        role: user.role,
        profileCompleted: user.profileCompleted,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      profile: {
        id: user.profile.id,
        userId: user.profile.userId,
        name: user.profile.name,
        dateOfBirth: user.profile.dateOfBirth?.toISOString().slice(0, 10) ?? null,
        gender: user.profile.gender,
        avatarUrl: user.profile.avatarUrl,
        targetYear: user.profile.targetYear,
        preparationLevel: user.profile.preparationLevel,
        dailyStudyMinutes: user.profile.dailyStudyMinutes,
        bio: user.profile.bio,
      },
      preferences: {
        theme: user.preferences.theme,
        language: user.preferences.language,
        pushNotifications: user.preferences.pushNotifications,
        emailNotifications: user.preferences.emailNotifications,
        streakReminders: user.preferences.streakReminders,
        currentAffairsAlerts: user.preferences.currentAffairsAlerts,
      },
      onboarding: {
        currentStep: user.onboarding.currentStep,
        completed: user.onboarding.completed,
        completedAt: user.onboarding.completedAt?.toISOString() ?? null,
      },
      entitlements: [],
    };
  }
}
