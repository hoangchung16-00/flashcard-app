import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { SEED_DECKS } from '@flashcard/shared';

const prisma = new PrismaClient();

async function seedDemoUser(): Promise<void> {
  const email = 'demo@flashcard.app';
  const passwordHash = await bcrypt.hash('demo123', 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      passwordHash,
      streak: { create: {} },
      syncCursor: { create: {} },
      notificationSettings: { create: {} },
    },
  });

  const deckCount = await prisma.deck.count({
    where: { userId: user.id, deletedAt: null },
  });

  if (deckCount > 0) {
    console.log('Demo user already has decks, skipping seed.');
    return;
  }

  const now = new Date();

  for (const seedDeck of SEED_DECKS) {
    await prisma.deck.create({
      data: {
        userId: user.id,
        title: seedDeck.title,
        description: seedDeck.description,
        createdAt: now,
        updatedAt: now,
        cards: {
          create: seedDeck.cards.map((card) => {
            const nextReview = new Date();
            if (card.dueDaysAgo) {
              nextReview.setDate(nextReview.getDate() - card.dueDaysAgo);
            }
            return {
              front: card.front,
              back: card.back,
              nextReview,
              createdAt: now,
              updatedAt: now,
            };
          }),
        },
      },
    });
  }

  console.log(`Seeded demo user: ${email} / demo123`);
}

seedDemoUser()
  .catch((error: unknown) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
