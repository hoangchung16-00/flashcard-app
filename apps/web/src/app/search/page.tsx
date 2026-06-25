'use client';

import Link from 'next/link';
import { useState } from 'react';
import { apiFetch, getAccessToken } from '@/lib/api';
import { db } from '@/lib/db';

interface SearchResult {
  decks: Array<{ id: string; title: string; description: string | null }>;
  cards: Array<{
    id: string;
    front: string;
    back: string;
    deckId: string;
    deck?: { title: string };
  }>;
}

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function searchLocal(keyword: string): Promise<SearchResult> {
    const lower = keyword.toLowerCase();
    const decks = await db.decks
      .filter(
        (d) =>
          !d.deletedAt &&
          (d.title.toLowerCase().includes(lower) ||
            (d.description?.toLowerCase().includes(lower) ?? false)),
      )
      .toArray();

    const allCards = await db.cards.filter((c) => !c.deletedAt).toArray();
    const deckMap = new Map(decks.map((d) => [d.id, d]));
    for (const d of await db.decks.filter((x) => !x.deletedAt).toArray()) {
      deckMap.set(d.id, d);
    }

    const cards = allCards
      .filter(
        (c) =>
          c.front.toLowerCase().includes(lower) ||
          c.back.toLowerCase().includes(lower),
      )
      .map((c) => ({
        id: c.id,
        front: c.front,
        back: c.back,
        deckId: c.deckId,
        deck: { title: deckMap.get(c.deckId)?.title ?? 'Unknown' },
      }));

    return { decks, cards };
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setIsSearching(true);

    if (getAccessToken()) {
      const res = await apiFetch<SearchResult>(
        `/search?q=${encodeURIComponent(query.trim())}`,
      );
      if (res.success) {
        setResults(res.data);
      }
    } else {
      setResults(await searchLocal(query.trim()));
    }
    setIsSearching(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Tìm kiếm</h1>

      <form onSubmit={handleSearch} className="mb-8 flex gap-3">
        <input
          type="text"
          placeholder="Tìm deck hoặc flashcard..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
        />
        <button
          type="submit"
          disabled={isSearching}
          className="rounded-lg bg-brand-600 px-6 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
        >
          Tìm
        </button>
      </form>

      {results && (
        <div className="space-y-8">
          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Bộ thẻ ({results.decks.length})
            </h2>
            {results.decks.length === 0 ? (
              <p className="text-slate-500">Không tìm thấy bộ thẻ.</p>
            ) : (
              <div className="space-y-2">
                {results.decks.map((deck) => (
                  <Link
                    key={deck.id}
                    href={`/decks/${deck.id}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300"
                  >
                    <p className="font-medium">{deck.title}</p>
                    {deck.description && (
                      <p className="text-sm text-slate-500">
                        {deck.description}
                      </p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">
              Thẻ ({results.cards.length})
            </h2>
            {results.cards.length === 0 ? (
              <p className="text-slate-500">Không tìm thấy thẻ.</p>
            ) : (
              <div className="space-y-2">
                {results.cards.map((card) => (
                  <Link
                    key={card.id}
                    href={`/decks/${card.deckId}`}
                    className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-300"
                  >
                    <p className="text-xs text-slate-400">
                      {card.deck?.title ?? 'Unknown'}
                    </p>
                    <p className="font-medium">{card.front}</p>
                    <p className="text-sm text-slate-500">{card.back}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
