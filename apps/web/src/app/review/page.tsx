'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Rating } from '@flashcard/shared';
import { FlipCard } from '@/components/FlipCard';
import { getDueCards, type LocalCard } from '@/lib/db';
import { rateCardLocal } from '@/lib/store';

export default function ReviewPage() {
  const [cards, setCards] = useState<LocalCard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewed, setReviewed] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const loadCards = useCallback(async () => {
    setIsLoading(true);
    const due = await getDueCards();
    setCards(due);
    setCurrentIndex(0);
    setReviewed(0);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    void loadCards();
  }, [loadCards]);

  async function handleRate(rating: Rating) {
    const card = cards[currentIndex];
    if (!card) return;

    await rateCardLocal(card.id, rating);
    setReviewed((r) => r + 1);

    if (currentIndex < cards.length - 1) {
      setCurrentIndex((i) => i + 1);
    } else {
      await loadCards();
    }
  }

  if (isLoading) {
    return <p className="text-center text-slate-500">Đang tải thẻ...</p>;
  }

  if (cards.length === 0) {
    return (
      <div className="mx-auto max-w-lg text-center">
        <h1 className="mb-4 text-3xl font-bold text-slate-900">
          Không có thẻ cần ôn
        </h1>
        <p className="text-slate-600">
          Tuyệt vời! Bạn đã hoàn thành tất cả thẻ hôm nay.
        </p>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const total = cards.length;

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="mb-2 text-3xl font-bold text-slate-900">Ôn tập</h1>
        <div className="flex items-center gap-4">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-brand-500 transition-all"
              style={{ width: `${(reviewed / total) * 100}%` }}
            />
          </div>
          <span className="text-sm text-slate-600">
            {reviewed} / {total}
          </span>
        </div>
      </div>

      {currentCard && (
        <FlipCard key={currentCard.id} card={currentCard} onRate={handleRate} />
      )}
    </div>
  );
}
