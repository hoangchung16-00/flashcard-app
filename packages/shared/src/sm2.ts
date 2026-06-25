import type { Rating } from './types';

export interface Sm2Result {
  repetitions: number;
  interval: number;
  easinessFactor: number;
  nextReview: Date;
}

const QUALITY_MAP: Record<Rating, number> = {
  0: 0,
  1: 2,
  2: 4,
  3: 5,
};

/**
 * SuperMemo-2 spaced repetition algorithm.
 * q: 0=Quên, 1=Khó, 2=Bình thường, 3=Dễ
 */
export function calculateSm2(
  q: Rating,
  repetitions: number,
  interval: number,
  easinessFactor: number,
  now: Date = new Date(),
): Sm2Result {
  const quality = QUALITY_MAP[q] ?? 5;
  let newRepetitions = repetitions;
  let newInterval = interval;
  let newEasinessFactor = easinessFactor;

  if (quality < 3) {
    newRepetitions = 0;
    newInterval = 1;
  } else {
    if (newRepetitions === 0) {
      newInterval = 1;
    } else if (newRepetitions === 1) {
      newInterval = 6;
    } else {
      newInterval = Math.round(newInterval * newEasinessFactor);
    }
    newRepetitions += 1;
  }

  newEasinessFactor =
    newEasinessFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
  if (newEasinessFactor < 1.3) {
    newEasinessFactor = 1.3;
  }

  const nextReview = new Date(now);
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    repetitions: newRepetitions,
    interval: newInterval,
    easinessFactor: Math.round(newEasinessFactor * 100) / 100,
    nextReview,
  };
}
