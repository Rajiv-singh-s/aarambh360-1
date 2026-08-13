import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing';
import type { DecodedIdToken } from 'firebase-admin/auth';
import { IS_PUBLIC_KEY } from '../common/constants';
import { AuthService } from './auth.service';
import { FirebaseAuthGuard } from './firebase-auth.guard';

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;
  let authService: {
    extractBearerToken: jest.Mock;
    verifyToken: jest.Mock;
    validateAndLoadUser: jest.Mock;
  };
  let reflector: Reflector;

  beforeEach(async () => {
    authService = {
      extractBearerToken: jest.fn(),
      verifyToken: jest.fn(),
      validateAndLoadUser: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FirebaseAuthGuard,
        { provide: AuthService, useValue: authService },
        Reflector,
      ],
    }).compile();

    guard = module.get(FirebaseAuthGuard);
    reflector = module.get(Reflector);
  });

  const createContext = (authorization?: string): ExecutionContext =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization },
          user: undefined,
        }),
      }),
      getHandler: () => ({}),
      getClass: () => ({}),
    }) as ExecutionContext;

  it('allows public routes without a token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(true);

    await expect(guard.canActivate(createContext())).resolves.toBe(true);
    expect(authService.extractBearerToken).not.toHaveBeenCalled();
  });

  it('rejects protected routes without bearer token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    await expect(guard.canActivate(createContext())).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('attaches authenticated user context on valid token', async () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(false);

    const decoded = { uid: 'firebase-uid-1' } as DecodedIdToken;
    const request: {
      headers: { authorization: string };
      user?: { id: string };
    } = {
      headers: { authorization: 'Bearer token' },
    };

    authService.extractBearerToken.mockReturnValue('token');
    authService.verifyToken.mockResolvedValue(decoded);
    authService.validateAndLoadUser.mockResolvedValue({
      id: 'user-1',
      firebaseUid: 'firebase-uid-1',
      email: 'aspirant@example.com',
      phone: null,
      role: 'USER',
      profileCompleted: false,
    });

    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
      getHandler: () => ({}),
      getClass: () => ({}),
    } as ExecutionContext;

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(request.user?.id).toBe('user-1');
    expect(reflector.getAllAndOverride).toHaveBeenCalledWith(IS_PUBLIC_KEY, expect.any(Array));
  });
});
