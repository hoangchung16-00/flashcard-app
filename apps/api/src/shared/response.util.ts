import type { ApiResponse } from '@flashcard/shared';

export function successResponse<T>(data: T): ApiResponse<T> {
  return { success: true, data };
}

export function errorResponse(
  message: string,
  httpCode: number,
): ApiResponse<never> {
  return { success: false, message, httpCode };
}
