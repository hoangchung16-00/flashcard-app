import { v4 as uuidv4 } from 'uuid';
import { calculateSm2, type Rating } from '@flashcard/shared';
import { apiFetch, getAccessToken, isOnline } from './api';
import { db, type LocalCard, type LocalDeck } from './db';

export async function createDeckLocal(
  title: string,
  description?: string,
): Promise<LocalDeck> {
  const now = new Date().toISOString();
  const deck: LocalDeck = {
    id: uuidv4(),
    userId: 'local',
    title,
    description: description ?? null,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: 'pending',
  };
  await db.decks.add(deck);
  await queueSync();
  return deck;
}

export async function updateDeckLocal(
  id: string,
  data: Partial<Pick<LocalDeck, 'title' | 'description'>>,
): Promise<void> {
  await db.decks.update(id, {
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  });
  await queueSync();
}

export async function deleteDeckLocal(id: string): Promise<void> {
  await db.decks.update(id, {
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  });
  await queueSync();
}

export async function createCardLocal(
  deckId: string,
  front: string,
  back: string,
): Promise<LocalCard> {
  const now = new Date().toISOString();
  const card: LocalCard = {
    id: uuidv4(),
    deckId,
    front,
    back,
    repetitions: 0,
    interval: 0,
    easinessFactor: 2.5,
    nextReview: now,
    createdAt: now,
    updatedAt: now,
    deletedAt: null,
    syncStatus: 'pending',
  };
  await db.cards.add(card);
  await queueSync();
  return card;
}

export async function updateCardLocal(
  id: string,
  data: Partial<Pick<LocalCard, 'front' | 'back'>>,
): Promise<void> {
  await db.cards.update(id, {
    ...data,
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  });
  await queueSync();
}

export async function deleteCardLocal(id: string): Promise<void> {
  await db.cards.update(id, {
    deletedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  });
  await queueSync();
}

export async function rateCardLocal(
  cardId: string,
  rating: Rating,
): Promise<void> {
  const card = await db.cards.get(cardId);
  if (!card) return;

  const sm2 = calculateSm2(
    rating,
    card.repetitions,
    card.interval,
    card.easinessFactor,
  );

  await db.cards.update(cardId, {
    repetitions: sm2.repetitions,
    interval: sm2.interval,
    easinessFactor: sm2.easinessFactor,
    nextReview: sm2.nextReview.toISOString(),
    updatedAt: new Date().toISOString(),
    syncStatus: 'pending',
  });

  await db.pendingRatings.add({
    id: uuidv4(),
    cardId,
    rating,
    reviewedAt: new Date().toISOString(),
    syncStatus: 'pending',
  });

  if (isOnline() && getAccessToken()) {
    await syncToServer();
  }
}

let syncTimeout: ReturnType<typeof setTimeout> | null = null;

export function queueSync(): void {
  if (syncTimeout) clearTimeout(syncTimeout);
  syncTimeout = setTimeout(() => {
    void syncToServer();
  }, 1000);
}

/** Gộp deck trùng tên (sau guest login + server seed) */
async function dedupeDecksByTitle(): Promise<void> {
  const allDecks = await db.decks.filter((d) => !d.deletedAt).toArray();
  const titleGroups = new Map<string, LocalDeck[]>();

  for (const deck of allDecks) {
    const key = deck.title.toLowerCase().trim();
    const group = titleGroups.get(key) ?? [];
    group.push(deck);
    titleGroups.set(key, group);
  }

  const now = new Date().toISOString();

  for (const group of titleGroups.values()) {
    if (group.length <= 1) continue;

    const scored = await Promise.all(
      group.map(async (deck) => {
        const cardCount = await db.cards
          .where('deckId')
          .equals(deck.id)
          .filter((c) => !c.deletedAt)
          .count();
        return { deck, cardCount };
      }),
    );

    scored.sort((a, b) => {
      if (a.deck.syncStatus === 'synced' && b.deck.syncStatus !== 'synced') {
        return -1;
      }
      if (b.deck.syncStatus === 'synced' && a.deck.syncStatus !== 'synced') {
        return 1;
      }
      return b.cardCount - a.cardCount;
    });

    for (let i = 1; i < scored.length; i++) {
      const removeId = scored[i].deck.id;
      await db.cards
        .where('deckId')
        .equals(removeId)
        .modify({ deletedAt: now, updatedAt: now });
      await db.decks.update(removeId, {
        deletedAt: now,
        updatedAt: now,
      });
    }
  }
}

export async function syncToServer(): Promise<void> {
  if (!isOnline() || !getAccessToken()) return;

  const meta = (await db.syncMeta.get('main')) ?? {
    id: 'main',
    lastSyncedAt: null,
  };

  const pendingDecks = await db.decks
    .where('syncStatus')
    .equals('pending')
    .toArray();
  const pendingCards = await db.cards
    .where('syncStatus')
    .equals('pending')
    .toArray();
  const pendingRatings = await db.pendingRatings
    .where('syncStatus')
    .equals('pending')
    .toArray();

  const pushRes = await apiFetch<{ syncedAt: string }>('/sync/push', {
    method: 'POST',
    body: JSON.stringify({
      decks: pendingDecks,
      cards: pendingCards,
      ratings: pendingRatings.map((r) => ({
        cardId: r.cardId,
        rating: r.rating,
        reviewedAt: r.reviewedAt,
      })),
      clientUpdatedAt: new Date().toISOString(),
    }),
  });

  if (pushRes.success) {
    await Promise.all([
      ...pendingDecks.map((d) => db.decks.update(d.id, { syncStatus: 'synced' })),
      ...pendingCards.map((c) => db.cards.update(c.id, { syncStatus: 'synced' })),
      ...pendingRatings.map((r) =>
        db.pendingRatings.update(r.id, { syncStatus: 'synced' }),
      ),
    ]);
  }

  const pullRes = await apiFetch<{
    decks: LocalDeck[];
    cards: LocalCard[];
    syncedAt: string;
  }>(`/sync/pull?since=${meta.lastSyncedAt ?? ''}`);

  if (pullRes.success) {
    for (const deck of pullRes.data.decks) {
      const existing = await db.decks.get(deck.id);
      if (!existing || new Date(deck.updatedAt) > new Date(existing.updatedAt)) {
        await db.decks.put({ ...deck, syncStatus: 'synced' });
      }
    }
    for (const card of pullRes.data.cards) {
      const existing = await db.cards.get(card.id);
      if (!existing || new Date(card.updatedAt) > new Date(existing.updatedAt)) {
        await db.cards.put({ ...card, syncStatus: 'synced' });
      }
    }
    await db.syncMeta.put({
      id: 'main',
      lastSyncedAt: pullRes.data.syncedAt,
    });
    await dedupeDecksByTitle();
  }
}

if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    void syncToServer();
  });
}
