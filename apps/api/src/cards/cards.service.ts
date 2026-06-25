import { Injectable, NotFoundException } from '@nestjs/common';
import type { Card } from '@prisma/client';
import { DecksService } from '../decks/decks.service';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateCardDto, UpdateCardDto } from './dto/card.dto';

@Injectable()
export class CardsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly decksService: DecksService,
  ) {}

  async findAll(userId: string, deckId: string): Promise<Card[]> {
    await this.decksService.findOne(userId, deckId);
    return this.prisma.card.findMany({
      where: { deckId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, deckId: string, id: string): Promise<Card> {
    await this.decksService.findOne(userId, deckId);
    const card = await this.prisma.card.findFirst({
      where: { id, deckId, deletedAt: null },
    });
    if (!card) {
      throw new NotFoundException('Card not found');
    }
    return card;
  }

  async create(
    userId: string,
    deckId: string,
    dto: CreateCardDto,
  ): Promise<Card> {
    await this.decksService.findOne(userId, deckId);
    return this.prisma.card.create({
      data: {
        deckId,
        front: dto.front,
        back: dto.back,
      },
    });
  }

  async update(
    userId: string,
    deckId: string,
    id: string,
    dto: UpdateCardDto,
  ): Promise<Card> {
    await this.findOne(userId, deckId, id);
    return this.prisma.card.update({
      where: { id },
      data: {
        front: dto.front,
        back: dto.back,
      },
    });
  }

  async remove(userId: string, deckId: string, id: string): Promise<Card> {
    await this.findOne(userId, deckId, id);
    return this.prisma.card.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
