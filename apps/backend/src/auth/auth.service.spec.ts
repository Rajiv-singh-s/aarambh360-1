import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { AuthService } from './auth.service';
import { FirebaseAdminService } from './firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prisma: {
    user: {
      findUnique: jest.Mock;
      findFirst: jest.Mock;
      create: jest.Mock;
      update: jest.Mock;
    };
  };
  let firebaseAdmin: {
    isConfigured: jest.Mock;
    verifyIdToken: jest.Mock;
  };

  const decodedToken = {
    uid: 'firebase-uid-1',
    email: 'aspirant@example.com',
    phone_number: '+919999999999',
  } as DecodedIdToken;

  beforeEach(async () => {
    prisma = {
      user: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
      },
    };

    firebaseAdmin = {
      isConfigured: jest.fn().mockReturnValue(true),
      verifyIdToken: jest.fn().mockResolvedValue(decodedToken),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: FirebaseAdminService, useValue: firebaseAdmin },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('extracts bearer token from authorization header', () => {
    expect(service.extractBearerToken('Bearer abc.def.ghi')).toBe('abc.def.ghi');
    expect(service.extractBearerToken(undefined)).toBeNull();
  });

  it('rejects deleted users during login', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      deletedAt: new Date(),
    });

    await expect(service.loginWithToken('valid-token')).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('creates a new user on first login', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue({
      id: 'user-1',
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
      role: 'USER',
      profileCompleted: false,
      createdAt: new Date('2026-08-12T00:00:00.000Z'),
      updatedAt: new Date('2026-08-12T00:00:00.000Z'),
      profile: {
        id: 'profile-1',
        userId: 'user-1',
        name: 'aspirant',
        dateOfBirth: null,
        gender: null,
        avatarUrl: null,
        targetYear: null,
        preparationLevel: null,
        dailyStudyMinutes: null,
        bio: null,
      },
      preferences: {
        theme: 'system',
        language: 'en',
        pushNotifications: true,
        emailNotifications: true,
        streakReminders: true,
        currentAffairsAlerts: true,
      },
      onboarding: {
        currentStep: 0,
        completed: false,
        completedAt: null,
      },
    });

    const result = await service.loginWithToken('valid-token');

    expect(prisma.user.create).toHaveBeenCalled();
    expect(result.user.firebaseUid).toBe(decodedToken.uid);
    expect(result.entitlements).toEqual([]);
  });

  it('blocks validateAndLoadUser for deleted accounts', async () => {
    prisma.user.findUnique.mockResolvedValue({
      id: 'user-1',
      firebaseUid: decodedToken.uid,
      email: decodedToken.email,
      phone: decodedToken.phone_number,
      role: 'USER',
      profileCompleted: false,
      deletedAt: new Date(),
    });

    await expect(service.validateAndLoadUser(decodedToken)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
