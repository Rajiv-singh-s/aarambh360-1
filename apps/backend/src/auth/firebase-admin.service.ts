import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import type { App } from 'firebase-admin/app';
import type { DecodedIdToken } from 'firebase-admin/auth';

export interface FirebaseTokenVerifier {
  verifyIdToken(idToken: string): Promise<DecodedIdToken>;
  deleteUser(uid: string): Promise<void>;
  isConfigured(): boolean;
}

@Injectable()
export class FirebaseAdminService implements OnModuleInit, FirebaseTokenVerifier {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app: App | null = null;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit(): void {
    this.initialize();
  }

  private initialize(): void {
    if (admin.apps.length > 0) {
      this.app = admin.apps[0]!;
      this.logger.log('Firebase Admin reusing existing app instance');
      return;
    }

    const serviceAccountJson = this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT');
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');

    try {
      if (serviceAccountJson) {
        const serviceAccount = JSON.parse(serviceAccountJson) as admin.ServiceAccount;
        this.app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          projectId: serviceAccount.projectId ?? projectId,
        });
        this.logger.log('Firebase Admin initialized from FIREBASE_SERVICE_ACCOUNT');
        return;
      }

      if (projectId) {
        const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
        const privateKey = this.configService
          .get<string>('FIREBASE_PRIVATE_KEY')
          ?.replace(/\\n/g, '\n');

        if (clientEmail && privateKey) {
          this.app = admin.initializeApp({
            credential: admin.credential.cert({
              projectId,
              clientEmail,
              privateKey,
            }),
            projectId,
          });
          this.logger.log('Firebase Admin initialized from individual env vars');
          return;
        }
      }

      this.logger.warn(
        'Firebase Admin not configured — set FIREBASE_SERVICE_ACCOUNT or FIREBASE_PROJECT_ID + credentials',
      );
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin', error);
    }
  }

  isConfigured(): boolean {
    return this.app !== null;
  }

  async verifyIdToken(idToken: string): Promise<DecodedIdToken> {
    if (!this.app) {
      throw new Error('Firebase Admin is not configured');
    }
    return admin.auth(this.app).verifyIdToken(idToken, true);
  }

  async deleteUser(uid: string): Promise<void> {
    if (!this.app) {
      throw new Error('Firebase Admin is not configured');
    }
    await admin.auth(this.app).deleteUser(uid);
  }
}
