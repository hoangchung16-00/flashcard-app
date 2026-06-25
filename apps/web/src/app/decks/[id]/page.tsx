'use client';

import { useParams } from 'next/navigation';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import {
  createCardLocal,
  deleteCardLocal,
  updateCardLocal,
} from '@/lib/store';

export default function DeckDetailPage() {
  const params = useParams();
  const deckId = params.id as string;
  const [front, setFront] = useState('');
  const [back, setBack] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFront, setEditFront] = useState('');
  const [editBack, setEditBack] = useState('');

  const deck = useLiveQuery(() => db.decks.get(deckId));
  const cards = useLiveQuery(() =>
    db.cards
      .where('deckId')
      .equals(deckId)
      .filter((c) => !c.deletedAt)
      .reverse()
      .sortBy('createdAt'),
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!front.trim() || !back.trim()) return;
    await createCardLocal(deckId, front.trim(), back.trim());
    setFront('');
    setBack('');
  }

  async function handleUpdate(id: string) {
    await updateCardLocal(id, { front: editFront, back: editBack });
    setEditingId(null);
  }

  if (!deck) {
    return <p className="text-slate-500">Đang tải...</p>;
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">{deck.title}</h1>
      {deck.description && (
        <p className="mb-6 text-slate-600">{deck.description}</p>
      )}

      <form
        onSubmit={handleCreate}
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold">Thêm thẻ mới</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Mặt trước (câu hỏi)"
            value={front}
            onChange={(e) => setFront(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Mặt sau (đáp án)"
            value={back}
            onChange={(e) => setBack(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700"
          >
            Thêm thẻ
          </button>
        </div>
      </form>

      <div className="space-y-3">
        <h2 className="text-lg font-semibold">
          Thẻ ({(cards ?? []).length})
        </h2>
        {(cards ?? []).map((card) => (
          <div
            key={card.id}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            {editingId === card.id ? (
              <div className="space-y-2">
                <input
                  value={editFront}
                  onChange={(e) => setEditFront(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <input
                  value={editBack}
                  onChange={(e) => setEditBack(e.target.value)}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2"
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => void handleUpdate(card.id)}
                    className="rounded-lg bg-brand-600 px-3 py-1 text-sm text-white"
                  >
                    Lưu
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="rounded-lg px-3 py-1 text-sm text-slate-600"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-slate-900">{card.front}</p>
                  <p className="text-sm text-slate-500">{card.back}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingId(card.id);
                      setEditFront(card.front);
                      setEditBack(card.back);
                    }}
                    className="text-sm text-brand-600 hover:underline"
                  >
                    Sửa
                  </button>
                  <button
                    onClick={() => void deleteCardLocal(card.id)}
                    className="text-sm text-red-600 hover:underline"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
