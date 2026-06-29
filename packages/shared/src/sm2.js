"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSm2 = calculateSm2;
const QUALITY_MAP = {
    0: 0,
    1: 2,
    2: 4,
    3: 5,
};
function calculateSm2(q, repetitions, interval, easinessFactor, now = new Date()) {
    const quality = QUALITY_MAP[q] ?? 5;
    let newRepetitions = repetitions;
    let newInterval = interval;
    let newEasinessFactor = easinessFactor;
    if (quality < 3) {
        newRepetitions = 0;
        newInterval = 1;
    }
    else {
        if (newRepetitions === 0) {
            newInterval = 1;
        }
        else if (newRepetitions === 1) {
            newInterval = 6;
        }
        else {
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
//# sourceMappingURL=sm2.js.map