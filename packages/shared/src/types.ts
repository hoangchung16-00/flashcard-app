export type Rating = 0 | 1 | 2 | 3;

export type SyncStatus = 'pending' | 'synced';

export interface User {
  id: string;
  email: string;
  createdAt: string;
}

export interface Deck {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface Card {
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
}

export interface Streak {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastStreakDate: string | null;
}

export interface ReviewLog {
  id: string;
  userId: string;
  cardId: string;
  rating: Rating;
  reviewedAt: string;
}

export interface BaseResponse<T> {
  success: true;
  data: T;
}

export interface ErrorResponse {
  success: false;
  message: string;
  httpCode: number;
}

export type ApiResponse<T> = BaseResponse<T> | ErrorResponse;

export const RATING_LABELS: Record<Rating, string> = {
  0: 'Quên',
  1: 'Khó',
  2: 'Bình thường',
  3: 'Dễ',
};
