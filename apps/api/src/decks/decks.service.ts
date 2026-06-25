import { Injectable, NotFoundException } from '@nestjs/common';
import type { Deck } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import type { CreateDeckDto, UpdateDeckDto } from './dto/deck.dto';

@Injectable()
export class DecksService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string): Promise<Deck[]> {
    return this.prisma.deck.findMany({
      where: { userId, deletedAt: null },
      orderBy: { updatedAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string): Promise<Deck> {
    const deck = await this.prisma.deck.findFirst({
      where: { id, userId, deletedAt: null },
    });
    if (!deck) {
      throw new NotFoundException('Deck not found');
    }
    return deck;
  }

  async create(userId: string, dto: CreateDeckDto): Promise<Deck> {
    return this.prisma.deck.create({
      data: {
        userId,
        title: dto.title,
        description: dto.description ?? null,
      },
    });
  }

  async update(
    userId: string,
    id: string,
    dto: UpdateDeckDto,
  ): Promise<Deck> {
    await this.findOne(userId, id);
    return this.prisma.deck.update({
      where: { id },
      data: {
        title: dto.title,
        description: dto.description,
      },
    });
  }

  async remove(userId: string, id: string): Promise<Deck> {
    await this.findOne(userId, id);
    return this.prisma.deck.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
  }
}
