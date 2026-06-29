import type { Rating } from './types';
export interface Sm2Result {
    repetitions: number;
    interval: number;
    easinessFactor: number;
    nextReview: Date;
}
export declare function calculateSm2(q: Rating, repetitions: number, interval: number, easinessFactor: number, now?: Date): Sm2Result;
//# sourceMappingURL=sm2.d.ts.map