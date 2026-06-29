import { Injectable } from '@nestjs/common';
import { SEED_DECKS } from '@flashcard/shared';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SeedService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Tạo bộ thẻ mẫu nếu user chưa có deck nào.
   * Dùng cùng ID cố định với local seed để tránh trùng khi guest đăng nhập.
   */
  async seedUserIfEmpty(userId: string): Promise<boolean> {
    const deckCount = await this.prisma.deck.count({
      where: { userId, deletedAt: null },
    });
    if (deckCount > 0) return false;

    const now = new Date();

    for (const seedDeck of SEED_DECKS) {
      const nextReviewFor = (dueDaysAgo = 0): Date => {
        const date = new Date();
        date.setDate(date.getDate() - dueDaysAgo);
        return date;
      };

      await this.prisma.deck.create({
        data: {
          id: seedDeck.id,
          userId,
          title: seedDeck.title,
          description: seedDeck.description,
          createdAt: now,
          updatedAt: now,
          cards: {
            create: seedDeck.cards.map((card) => ({
              id: card.id,
              front: card.front,
              back: card.back,
              nextReview: nextReviewFor(card.dueDaysAgo ?? 0),
              createdAt: now,
              updatedAt: now,
            })),
          },
        },
      });
    }

    return true;
  }
}
