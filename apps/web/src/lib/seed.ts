import {
  SEED_DECKS,
  SEED_STORAGE_KEY,
} from '../../../../packages/shared/src/seed-data';
import { db, type LocalCard, type LocalDeck } from './db';

function daysAgoIso(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

function buildNextReview(dueDaysAgo = 0): string {
  return daysAgoIso(dueDaysAgo);
}

export async function seedLocalIfEmpty(): Promise<boolean> {
  if (typeof window === 'undefined') return false;

  if (localStorage.getItem(SEED_STORAGE_KEY) === 'true') {
    return false;
  }

  if (!SEED_DECKS?.length) {
    console.error('SEED_DECKS chưa được load — chạy: yarn workspace @flashcard/shared build');
    return false;
  }

  const existingCount = await db.decks.filter((d) => !d.deletedAt).count();
  if (existingCount > 0) {
    localStorage.setItem(SEED_STORAGE_KEY, 'true');
    return false;
  }

  const now = new Date().toISOString();

  const decks: LocalDeck[] = SEED_DECKS.map((deck) => ({
    id: deck.id,
    userId: 'local',
    title: deck.title,
    description: deck.description,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: 'pending' as const,
  }));

  const cards: LocalCard[] = SEED_DECKS.flatMap((deck) =>
    deck.cards.map((card) => ({
      id: card.id,
      deckId: deck.id,
      front: card.front,
      back: card.back,
      repetitions: 0,
      interval: 0,
      easinessFactor: 2.5,
      nextReview: buildNextReview(card.dueDaysAgo ?? 0),
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      syncStatus: 'pending' as const,
    })),
  );

  await db.transaction('rw', db.decks, db.cards, async () => {
    await db.decks.bulkAdd(decks);
    await db.cards.bulkAdd(cards);
  });

  localStorage.setItem(SEED_STORAGE_KEY, 'true');
  return true;
}
