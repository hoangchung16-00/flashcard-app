'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { createDeckLocal, deleteDeckLocal } from '@/lib/store';

export default function DecksPage() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const decks = useLiveQuery(() =>
    db.decks.filter((d) => !d.deletedAt).reverse().sortBy('updatedAt'),
  );

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    setIsCreating(true);
    await createDeckLocal(title.trim(), description.trim() || undefined);
    setTitle('');
    setDescription('');
    setIsCreating(false);
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-3xl font-bold text-slate-900">Bộ thẻ</h1>

      <form
        onSubmit={handleCreate}
        className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <h2 className="mb-4 text-lg font-semibold">Tạo bộ thẻ mới</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Tên bộ thẻ"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
            maxLength={100}
          />
          <textarea
            placeholder="Mô tả (tuỳ chọn)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-4 py-2 focus:border-brand-500 focus:outline-none"
            rows={2}
          />
          <button
            type="submit"
            disabled={isCreating || !title.trim()}
            className="rounded-lg bg-brand-600 px-4 py-2 font-medium text-white hover:bg-brand-700 disabled:opacity-50"
          >
            Tạo bộ thẻ
          </button>
        </div>
      </form>

      <div className="space-y-3">
        {(decks ?? []).length === 0 && (
          <p className="text-center text-slate-500">Chưa có bộ thẻ nào.</p>
        )}
        {(decks ?? []).map((deck) => (
          <div
            key={deck.id}
            className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div>
              <Link
                href={`/decks/${deck.id}`}
                className="text-lg font-semibold text-slate-900 hover:text-brand-600"
              >
                {deck.title}
              </Link>
              {deck.description && (
                <p className="text-sm text-slate-500">{deck.description}</p>
              )}
            </div>
            <button
              onClick={() => void deleteDeckLocal(deck.id)}
              className="rounded-lg px-3 py-1 text-sm text-red-600 hover:bg-red-50"
            >
              Xóa
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
