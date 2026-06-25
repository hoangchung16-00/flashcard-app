'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db, getDueCount } from '@/lib/db';

export default function DashboardPage() {
  const [dueCount, setDueCount] = useState(0);
  const deckCount = useLiveQuery(() => db.decks.filter((d) => !d.deletedAt).count());

  useEffect(() => {
    void getDueCount().then(setDueCount);
  }, []);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-2 text-3xl font-bold text-slate-900">Dashboard</h1>
      <p className="mb-8 text-slate-600">
        Chào mừng! Học thông minh với thuật toán Spaced Repetition SM-2.
      </p>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Bộ thẻ</p>
          <p className="text-3xl font-bold text-slate-900">{deckCount ?? 0}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Thẻ cần ôn hôm nay</p>
          <p className="text-3xl font-bold text-brand-600">{dueCount}</p>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">Trạng thái</p>
          <p className="text-lg font-semibold text-green-600">Sẵn sàng học</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-4">
        <Link
          href="/review"
          className="rounded-xl bg-brand-600 px-6 py-3 font-medium text-white hover:bg-brand-700"
        >
          Bắt đầu ôn tập
        </Link>
        <Link
          href="/decks"
          className="rounded-xl border border-slate-300 px-6 py-3 font-medium text-slate-700 hover:bg-slate-50"
        >
          Quản lý bộ thẻ
        </Link>
      </div>
    </div>
  );
}
