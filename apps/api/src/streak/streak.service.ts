import { Injectable } from '@nestjs/common';
import type { Streak } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class StreakService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  private streakKey(userId: string): string {
    return `streak:${userId}`;
  }

  async getStreak(userId: string): Promise<Streak> {
    const cached = await this.redis.get(this.streakKey(userId));
    if (cached) {
      return JSON.parse(cached) as Streak;
    }

    let streak = await this.prisma.streak.findUnique({ where: { userId } });
    if (!streak) {
      streak = await this.prisma.streak.create({ data: { userId } });
    }

    await this.cacheStreak(streak);
    return streak;
  }

  async recordStudyDay(userId: string): Promise<Streak> {
    const today = this.toDateOnly(new Date());
    let streak = await this.prisma.streak.findUnique({ where: { userId } });

    if (!streak) {
      streak = await this.prisma.streak.create({
        data: {
          userId,
          currentStreak: 1,
          longestStreak: 1,
          lastStreakDate: today,
        },
      });
      await this.cacheStreak(streak);
      return streak;
    }

    if (streak.lastStreakDate) {
      const lastDate = this.toDateOnly(streak.lastStreakDate);
      if (lastDate.getTime() === today.getTime()) {
        return streak;
      }

      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const newCurrent =
        lastDate.getTime() === yesterday.getTime()
          ? streak.currentStreak + 1
          : 1;

      streak = await this.prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: newCurrent,
          longestStreak: Math.max(streak.longestStreak, newCurrent),
          lastStreakDate: today,
        },
      });
    } else {
      streak = await this.prisma.streak.update({
        where: { userId },
        data: {
          currentStreak: 1,
          longestStreak: Math.max(streak.longestStreak, 1),
          lastStreakDate: today,
        },
      });
    }

    await this.cacheStreak(streak);
    return streak;
  }

  private async cacheStreak(streak: Streak): Promise<void> {
    await this.redis.set(
      this.streakKey(streak.userId),
      JSON.stringify(streak),
      3600,
    );
  }

  private toDateOnly(date: Date): Date {
    return new Date(
      Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
    );
  }
}
