'use client';

import { useEffect, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { getDueCount } from '@/lib/db';

interface StreakData {
  currentStreak: number;
  longestStreak: number;
}

export function HeaderStats() {
  const [dueCount, setDueCount] = useState(0);
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    void loadStats();
    const interval = setInterval(() => void loadStats(), 30000);
    return () => clearInterval(interval);
  }, []);

  async function loadStats() {
    const count = await getDueCount();
    setDueCount(count);

    const res = await apiFetch<StreakData>('/streak');
    if (res.success) {
      setStreak(res.data);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
        🔥 {streak?.currentStreak ?? 0} ngày
      </span>
      <span className="rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-800">
        {dueCount} thẻ due
      </span>
    </div>
  );
}
