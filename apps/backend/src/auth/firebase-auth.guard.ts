import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { AuthUserContext } from '@aarambh360/types';
import { IS_PUBLIC_KEY } from '../common/constants';
import { AuthService } from './auth.service';

export type AuthenticatedRequest = Request & {
  user?: AuthUserContext;
  firebaseToken?: string;
};

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly authService: AuthService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.authService.extractBearerToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException('Missing Bearer token');
    }

    try {
      const decoded = await this.authService.verifyToken(token);
      request.user = await this.authService.validateAndLoadUser(decoded);
      request.firebaseToken = token;
      return true;
    } catch (error) {
      throw new UnauthorizedException('Invalid or expired Bearer token');
    }
  }
}
