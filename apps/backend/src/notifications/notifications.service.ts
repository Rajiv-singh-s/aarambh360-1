import { Injectable, Logger } from '@nestjs/common';
import {
  NotificationDeliveryStatus,
  NotificationType,
  Prisma,
} from '@prisma/client';
import type {
  NotificationLogDto,
  NotificationPreferencesDto,
  RegisterDeviceTokenRequestDto,
  UpdateNotificationPreferencesRequestDto,
} from '@aarambh360/types';
import * as admin from 'firebase-admin';
import { FirebaseAdminService } from '../auth/firebase-admin.service';
import { PrismaService } from '../prisma/prisma.service';

export interface NotificationPayload {
  type: NotificationType;
  title: string;
  body: string;
  data?: Record<string, string>;
}

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly firebaseAdmin: FirebaseAdminService,
  ) {}

  async registerToken(userId: string, payload: RegisterDeviceTokenRequestDto) {
    const token = payload.token.trim();
    if (!token) {
      throw new Error('Token is required');
    }

    await this.prisma.deviceToken.updateMany({
      where: { token, userId: { not: userId } },
      data: { isActive: false },
    });

    const saved = await this.prisma.deviceToken.upsert({
      where: { token },
      create: {
        userId,
        token,
        platform: payload.platform,
        isActive: true,
      },
      update: {
        userId,
        platform: payload.platform,
        isActive: true,
      },
    });

    return {
      id: saved.id,
      platform: saved.platform,
      isActive: saved.isActive,
      createdAt: saved.createdAt.toISOString(),
    };
  }

  async deactivateToken(userId: string, token: string) {
    await this.prisma.deviceToken.updateMany({
      where: { userId, token },
      data: { isActive: false },
    });
  }

  async getPreferences(userId: string): Promise<NotificationPreferencesDto> {
    const prefs = await this.ensurePreferences(userId);
    return this.toPreferencesDto(prefs);
  }

  async updatePreferences(userId: string, payload: UpdateNotificationPreferencesRequestDto) {
    const prefs = await this.ensurePreferences(userId);
    const updated = await this.prisma.userPreference.update({
      where: { id: prefs.id },
      data: {
        pushNotifications: payload.pushNotifications ?? prefs.pushNotifications,
        streakReminders: payload.streakReminders ?? prefs.streakReminders,
        mainsEvalAlerts: payload.mainsEvalAlerts ?? prefs.mainsEvalAlerts,
        quizReminders: payload.quizReminders ?? prefs.quizReminders,
        currentAffairsAlerts: payload.currentAffairsAlerts ?? prefs.currentAffairsAlerts,
      },
    });
    return this.toPreferencesDto(updated);
  }

  async listHistory(userId: string, limit = 20): Promise<NotificationLogDto[]> {
    const rows = await this.prisma.notificationLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: Math.min(Math.max(limit, 1), 50),
    });
    return rows.map((row) => ({
      id: row.id,
      type: row.type,
      title: row.title,
      body: row.body,
      status: row.status,
      createdAt: row.createdAt.toISOString(),
    }));
  }

  async sendToUser(userId: string, payload: NotificationPayload): Promise<void> {
    const prefs = await this.ensurePreferences(userId);
    if (!this.shouldSend(payload.type, prefs)) {
      await this.logNotification(userId, payload, NotificationDeliveryStatus.SKIPPED);
      return;
    }

    const tokens = await this.prisma.deviceToken.findMany({
      where: { userId, isActive: true },
    });
    if (tokens.length === 0) {
      await this.logNotification(userId, payload, NotificationDeliveryStatus.SKIPPED, {
        reason: 'no_active_tokens',
      });
      return;
    }

    if (!this.firebaseAdmin.isConfigured()) {
      this.logger.debug(`Dev notification to ${userId}: ${payload.title}`);
      await this.logNotification(userId, payload, NotificationDeliveryStatus.SENT, {
        mode: 'dev-log',
      });
      return;
    }

    try {
      const messaging = admin.messaging();
      await messaging.sendEachForMulticast({
        tokens: tokens.map((entry) => entry.token),
        notification: { title: payload.title, body: payload.body },
        data: payload.data ?? {},
      });
      await this.logNotification(userId, payload, NotificationDeliveryStatus.SENT);
    } catch (error) {
      this.logger.warn(`FCM send failed for ${userId}`, error instanceof Error ? error.message : undefined);
      await this.logNotification(userId, payload, NotificationDeliveryStatus.FAILED, {
        error: error instanceof Error ? error.message : 'send_failed',
      });
    }
  }

  async notifyMainsEvaluationComplete(userId: string, submissionId: string, score: number, maxScore: number) {
    await this.sendToUser(userId, {
      type: NotificationType.MAINS_EVAL_COMPLETE,
      title: 'Mains evaluation ready',
      body: `Your answer scored ${score}/${maxScore}. Tap to review feedback.`,
      data: {
        type: NotificationType.MAINS_EVAL_COMPLETE,
        submissionId,
      },
    });
  }

  private shouldSend(type: NotificationType, prefs: {
    pushNotifications: boolean;
    streakReminders: boolean;
    mainsEvalAlerts: boolean;
    quizReminders: boolean;
  }) {
    if (!prefs.pushNotifications) {
      return false;
    }
    if (type === NotificationType.STREAK_REMINDER) {
      return prefs.streakReminders;
    }
    if (type === NotificationType.MAINS_EVAL_COMPLETE) {
      return prefs.mainsEvalAlerts;
    }
    if (type === NotificationType.QUIZ_REMINDER) {
      return prefs.quizReminders;
    }
    return true;
  }

  private async ensurePreferences(userId: string) {
    return this.prisma.userPreference.upsert({
      where: { userId },
      create: { userId },
      update: {},
    });
  }

  private async logNotification(
    userId: string,
    payload: NotificationPayload,
    status: NotificationDeliveryStatus,
    metadata?: Record<string, unknown>,
  ) {
    await this.prisma.notificationLog.create({
      data: {
        userId,
        type: payload.type,
        title: payload.title,
        body: payload.body,
        status,
        metadata: (metadata ?? payload.data ?? undefined) as Prisma.InputJsonValue | undefined,
      },
    });
  }

  private toPreferencesDto(prefs: {
    pushNotifications: boolean;
    streakReminders: boolean;
    mainsEvalAlerts: boolean;
    quizReminders: boolean;
    currentAffairsAlerts: boolean;
  }): NotificationPreferencesDto {
    return {
      pushNotifications: prefs.pushNotifications,
      streakReminders: prefs.streakReminders,
      mainsEvalAlerts: prefs.mainsEvalAlerts,
      quizReminders: prefs.quizReminders,
      currentAffairsAlerts: prefs.currentAffairsAlerts,
    };
  }
}
