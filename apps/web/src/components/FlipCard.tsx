'use client';

import { useState } from 'react';
import { RATING_LABELS, type Rating } from '@flashcard/shared';
import type { LocalCard } from '@/lib/db';

interface FlipCardProps {
  card: LocalCard;
  onRate: (rating: Rating) => void;
}

const RATING_COLORS: Record<Rating, string> = {
  0: 'bg-red-500 hover:bg-red-600',
  1: 'bg-orange-500 hover:bg-orange-600',
  2: 'bg-blue-500 hover:bg-blue-600',
  3: 'bg-green-500 hover:bg-green-600',
};

export function FlipCard({ card, onRate }: FlipCardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div className="mx-auto w-full max-w-lg">
      <div
        className="relative h-64 cursor-pointer"
        style={{ perspective: '1000px' }}
        onClick={() => !isFlipped && setIsFlipped(true)}
      >
        <div
          className="relative h-full w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
          }}
        >
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl border border-slate-200 bg-white p-8 shadow-lg"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <p className="text-center text-2xl font-medium text-slate-800">
              {card.front}
            </p>
          </div>
          <div
            className="absolute inset-0 flex items-center justify-center rounded-2xl border border-brand-200 bg-brand-50 p-8 shadow-lg"
            style={{
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg)',
            }}
          >
            <p className="text-center text-2xl font-medium text-slate-800">
              {card.back}
            </p>
          </div>
        </div>
      </div>

      {!isFlipped ? (
        <button
          onClick={() => setIsFlipped(true)}
          className="mt-6 w-full rounded-xl bg-brand-600 py-3 font-medium text-white hover:bg-brand-700"
        >
          Xem đáp án
        </button>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([0, 1, 2, 3] as Rating[]).map((rating) => (
            <button
              key={rating}
              onClick={() => {
                onRate(rating);
                setIsFlipped(false);
              }}
              className={`rounded-xl py-3 text-sm font-medium text-white ${RATING_COLORS[rating]}`}
            >
              {RATING_LABELS[rating]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
