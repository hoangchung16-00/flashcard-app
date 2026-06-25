import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import type {
  RegisterDeviceDto,
  UpdateNotificationSettingsDto,
} from './dto/device.dto';

@Injectable()
export class DevicesService {
  constructor(private readonly prisma: PrismaService) {}

  async registerToken(userId: string, dto: RegisterDeviceDto) {
    return this.prisma.deviceToken.upsert({
      where: { token: dto.token },
      create: {
        userId,
        token: dto.token,
        platform: dto.platform ?? 'web',
      },
      update: { userId, platform: dto.platform ?? 'web' },
    });
  }

  async getSettings(userId: string) {
    let settings = await this.prisma.notificationSettings.findUnique({
      where: { userId },
    });
    if (!settings) {
      settings = await this.prisma.notificationSettings.create({
        data: { userId },
      });
    }
    return settings;
  }

  async updateSettings(userId: string, dto: UpdateNotificationSettingsDto) {
    return this.prisma.notificationSettings.upsert({
      where: { userId },
      create: {
        userId,
        enabled: dto.enabled ?? true,
        reminderHour: dto.reminderHour ?? 20,
        reminderMinute: dto.reminderMinute ?? 0,
        timezone: dto.timezone ?? 'Asia/Ho_Chi_Minh',
      },
      update: {
        enabled: dto.enabled,
        reminderHour: dto.reminderHour,
        reminderMinute: dto.reminderMinute,
        timezone: dto.timezone,
      },
    });
  }
}
