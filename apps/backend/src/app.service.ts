import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from './prisma/prisma.service';

@Injectable()
export class AppService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  getRoot(): { name: string; version: string; status: string } {
    return {
      name: 'Aarambh360 API',
      version: '1.0.0',
      status: 'online',
    };
  }

  async getHealth(): Promise<{
    status: string;
    timestamp: string;
    database: 'ok' | 'unreachable' | 'not_configured';
    firebase: 'configured' | 'not_configured';
  }> {
    const timestamp = new Date().toISOString();
    const database = await this.getDatabaseStatus();
    const firebase = this.isFirebaseConfigured() ? 'configured' : 'not_configured';

    return { status: 'ok', timestamp, database, firebase };
  }

  async getReadiness(): Promise<{
    status: 'ready' | 'degraded';
    timestamp: string;
    checks: Record<string, 'ok' | 'down' | 'not_configured'>;
  }> {
    const timestamp = new Date().toISOString();
    const database = await this.getDatabaseStatus();
    const firebase = this.isFirebaseConfigured() ? 'ok' : 'not_configured';

    const checks = {
      database,
      firebase,
    } as Record<string, 'ok' | 'down' | 'not_configured'>;

    const status =
      database === 'ok' && firebase === 'ok' ? 'ready' : 'degraded';

    return { status, timestamp, checks };
  }

  private isFirebaseConfigured(): boolean {
    return Boolean(
      this.configService.get<string>('FIREBASE_SERVICE_ACCOUNT') ||
        (this.configService.get<string>('FIREBASE_PROJECT_ID') &&
          this.configService.get<string>('FIREBASE_CLIENT_EMAIL') &&
          this.configService.get<string>('FIREBASE_PRIVATE_KEY')),
    );
  }

  private async getDatabaseStatus(): Promise<'ok' | 'unreachable' | 'not_configured'> {
    if (!process.env.DATABASE_URL) {
      return 'not_configured';
    }

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'ok';
    } catch {
      return 'unreachable';
    }
  }
}
