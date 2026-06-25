import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SearchService {
  constructor(private readonly prisma: PrismaService) {}

  async search(userId: string, query: string) {
    const keyword = query.trim();
    if (!keyword) {
      return { decks: [], cards: [] };
    }

    const [decks, cards] = await Promise.all([
      this.prisma.deck.findMany({
        where: {
          userId,
          deletedAt: null,
          OR: [
            { title: { contains: keyword, mode: 'insensitive' } },
            { description: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        take: 20,
      }),
      this.prisma.card.findMany({
        where: {
          deletedAt: null,
          deck: { userId, deletedAt: null },
          OR: [
            { front: { contains: keyword, mode: 'insensitive' } },
            { back: { contains: keyword, mode: 'insensitive' } },
          ],
        },
        include: { deck: true },
        take: 20,
      }),
    ]);

    return { decks, cards };
  }
}
