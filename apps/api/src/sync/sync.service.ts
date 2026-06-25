import { Injectable } from '@nestjs/common';
import { calculateSm2, type Rating } from '@flashcard/shared';
import { PrismaService } from '../prisma/prisma.service';
import { StreakService } from '../streak/streak.service';
import type { SyncPushDto } from './dto/sync.dto';

@Injectable()
export class SyncService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly streakService: StreakService,
  ) {}

  async push(userId: string, dto: SyncPushDto): Promise<{ syncedAt: string }> {
    for (const deck of dto.decks) {
      const existing = await this.prisma.deck.findFirst({
        where: { id: deck.id, userId },
      });
      const updatedAt = new Date(deck.updatedAt);

      if (!existing) {
        await this.prisma.deck.create({
          data: {
            id: deck.id,
            userId,
            title: deck.title,
            description: deck.description ?? null,
            updatedAt,
            deletedAt: deck.deletedAt ? new Date(deck.deletedAt) : null,
          },
        });
      } else if (updatedAt > existing.updatedAt) {
        await this.prisma.deck.update({
          where: { id: deck.id },
          data: {
            title: deck.title,
            description: deck.description ?? null,
            updatedAt,
            deletedAt: deck.deletedAt ? new Date(deck.deletedAt) : null,
          },
        });
      }
    }

    for (const card of dto.cards) {
      const deck = await this.prisma.deck.findFirst({
        where: { id: card.deckId, userId },
      });
      if (!deck) continue;

      const existing = await this.prisma.card.findUnique({
        where: { id: card.id },
      });
      const updatedAt = new Date(card.updatedAt);

      if (!existing) {
        await this.prisma.card.create({
          data: {
            id: card.id,
            deckId: card.deckId,
            front: card.front,
            back: card.back,
            repetitions: card.repetitions,
            interval: card.interval,
            easinessFactor: card.easinessFactor ?? 2.5,
            nextReview: new Date(card.nextReview),
            updatedAt,
            deletedAt: card.deletedAt ? new Date(card.deletedAt) : null,
          },
        });
      } else if (updatedAt > existing.updatedAt) {
        await this.prisma.card.update({
          where: { id: card.id },
          data: {
            front: card.front,
            back: card.back,
            repetitions: card.repetitions,
            interval: card.interval,
            easinessFactor: card.easinessFactor ?? existing.easinessFactor,
            nextReview: new Date(card.nextReview),
            updatedAt,
            deletedAt: card.deletedAt ? new Date(card.deletedAt) : null,
          },
        });
      }
    }

    for (const rating of dto.ratings) {
      const card = await this.prisma.card.findFirst({
        where: {
          id: rating.cardId,
          deck: { userId },
        },
      });
      if (!card) continue;

      const reviewedAt = new Date(rating.reviewedAt);
      const existingLog = await this.prisma.reviewLog.findFirst({
        where: {
          userId,
          cardId: rating.cardId,
          reviewedAt,
        },
      });

      if (!existingLog) {
        const sm2 = calculateSm2(
          rating.rating as Rating,
          card.repetitions,
          card.interval,
          card.easinessFactor,
          reviewedAt,
        );

        await this.prisma.$transaction([
          this.prisma.card.update({
            where: { id: rating.cardId },
            data: {
              repetitions: sm2.repetitions,
              interval: sm2.interval,
              easinessFactor: sm2.easinessFactor,
              nextReview: sm2.nextReview,
            },
          }),
          this.prisma.reviewLog.create({
            data: {
              userId,
              cardId: rating.cardId,
              rating: rating.rating,
              reviewedAt,
            },
          }),
        ]);
      }
    }

    if (dto.ratings.length > 0) {
      await this.streakService.recordStudyDay(userId);
    }

    const syncedAt = new Date();
    await this.prisma.syncCursor.upsert({
      where: { userId },
      create: { userId, lastSyncedAt: syncedAt },
      update: { lastSyncedAt: syncedAt },
    });

    return { syncedAt: syncedAt.toISOString() };
  }

  async pull(userId: string, since?: string) {
    const sinceDate = since ? new Date(since) : new Date(0);

    const [decks, cards, streak] = await Promise.all([
      this.prisma.deck.findMany({
        where: {
          userId,
          updatedAt: { gt: sinceDate },
        },
      }),
      this.prisma.card.findMany({
        where: {
          deck: { userId },
          updatedAt: { gt: sinceDate },
        },
      }),
      this.prisma.streak.findUnique({ where: { userId } }),
    ]);

    return {
      decks,
      cards,
      streak,
      syncedAt: new Date().toISOString(),
    };
  }
}
