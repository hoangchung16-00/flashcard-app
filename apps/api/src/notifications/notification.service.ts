import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron, CronExpression } from '@nestjs/schedule';
import * as admin from 'firebase-admin';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationService implements OnModuleInit {
  private readonly logger = new Logger(NotificationService.name);
  private firebaseEnabled = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  onModuleInit(): void {
    const projectId = this.configService.get<string>('FIREBASE_PROJECT_ID');
    const clientEmail = this.configService.get<string>('FIREBASE_CLIENT_EMAIL');
    const privateKey = this.configService
      .get<string>('FIREBASE_PRIVATE_KEY')
      ?.replace(/\\n/g, '\n');

    if (projectId && clientEmail && privateKey) {
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      this.firebaseEnabled = true;
      this.logger.log('Firebase Admin initialized');
    } else {
      this.logger.warn(
        'Firebase not configured — push notifications disabled',
      );
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async sendReminderNotifications(): Promise<void> {
    const now = new Date();
    const currentHour = now.getUTCHours();
    const currentMinute = now.getUTCMinutes();

    const settings = await this.prisma.notificationSettings.findMany({
      where: { enabled: true },
      include: {
        user: {
          include: {
            streak: true,
            deviceTokens: true,
          },
        },
      },
    });

    const today = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );

    for (const setting of settings) {
      if (
        setting.reminderHour !== currentHour ||
        setting.reminderMinute !== currentMinute
      ) {
        continue;
      }

      const lastStudy = setting.user.streak?.lastStreakDate;
      if (lastStudy && lastStudy.getTime() >= today.getTime()) {
        continue;
      }

      const tokens = setting.user.deviceTokens.map((d) => d.token);
      if (tokens.length === 0) continue;

      await this.sendPush(
        tokens,
        'Nhắc nhở ôn bài',
        'Bạn chưa ôn bài hôm nay — giữ streak!',
      );
    }
  }

  private async sendPush(
    tokens: string[],
    title: string,
    body: string,
  ): Promise<void> {
    if (!this.firebaseEnabled) {
      this.logger.debug(`Would send push to ${tokens.length} devices: ${title}`);
      return;
    }

    try {
      await admin.messaging().sendEachForMulticast({
        tokens,
        notification: { title, body },
      });
    } catch (error) {
      this.logger.error('Failed to send push notification', error);
    }
  }
}
