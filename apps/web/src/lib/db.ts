import Dexie, { type EntityTable } from 'dexie';
import type { Rating, SyncStatus } from '@flashcard/shared';

export interface LocalDeck {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

export interface LocalCard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  repetitions: number;
  interval: number;
  easinessFactor: number;
  nextReview: string;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  syncStatus: SyncStatus;
}

export interface PendingRating {
  id: string;
  cardId: string;
  rating: Rating;
  reviewedAt: string;
  syncStatus: SyncStatus;
}

export interface SyncMeta {
  id: string;
  lastSyncedAt: string | null;
}

class FlashcardDB extends Dexie {
  decks!: EntityTable<LocalDeck, 'id'>;
  cards!: EntityTable<LocalCard, 'id'>;
  pendingRatings!: EntityTable<PendingRating, 'id'>;
  syncMeta!: EntityTable<SyncMeta, 'id'>;

  constructor() {
    super('flashcard-db');
    this.version(1).stores({
      decks: 'id, userId, updatedAt, syncStatus',
      cards: 'id, deckId, nextReview, updatedAt, syncStatus',
      pendingRatings: 'id, cardId, syncStatus',
      syncMeta: 'id',
    });
  }
}

export const db = new FlashcardDB();

export async function getDueCards(): Promise<LocalCard[]> {
  const now = new Date().toISOString();
  return db.cards
    .filter((c) => !c.deletedAt && c.nextReview <= now)
    .toArray();
}

export async function getDueCount(): Promise<number> {
  const cards = await getDueCards();
  return cards.length;
}
