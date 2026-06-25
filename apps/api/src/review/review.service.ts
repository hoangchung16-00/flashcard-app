import { Injectable, NotFoundException } from '@nestjs/common';
import { calculateSm2, type Rating } from '@flashcard/shared';
import type { Card, ReviewLog } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { StreakService } from '../streak/streak.service';

@Injectable()
export class ReviewService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: StreakService,
  ) {}

  async getDueCards(
    userId: string,
    page = 1,
    limit = 50,
  ): Promise<{ cards: Card[]; total: number }> {
    const now = new Date();
    const where = {
      deletedAt: null,
      nextReview: { lte: now },
      deck: { userId, deletedAt: null },
    };

    const [cards, total] = await Promise.all([
      this.prisma.card.findMany({
        where,
        include: { deck: true },
        orderBy: { nextReview: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.card.count({ where }),
    ]);

    return { cards, total };
  }

  async getDueCount(userId: string): Promise<number> {
    const now = new Date();
    return this.prisma.card.count({
      where: {
        deletedAt: null,
        nextReview: { lte: now },
        deck: { userId, deletedAt: null },
      },
    });
  }

  async rateCard(
    userId: string,
    cardId: string,
    rating: Rating,
  ): Promise<{ card: Card; log: ReviewLog }> {
    const card = await this.prisma.card.findFirst({
      where: {
        id: cardId,
        deletedAt: null,
        deck: { userId, deletedAt: null },
      },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    const sm2 = calculateSm2(
      rating,
      card.repetitions,
      card.interval,
      card.easinessFactor,
    );

    const [updatedCard, log] = await this.prisma.$transaction([
      this.prisma.card.update({
        where: { id: cardId },
        data: {
          repetitions: sm2.repetitions,
          interval: sm2.interval,
          easinessFactor: sm2.easinessFactor,
          nextReview: sm2.nextReview,
        },
      }),
      this.prisma.reviewLog.create({
        data: { userId, cardId, rating },
      }),
    ]);

    await this.streakService.recordStudyDay(userId);

    return { card: updatedCard, log };
  }
}
