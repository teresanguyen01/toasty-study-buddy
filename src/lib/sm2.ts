export interface SM2Data {
  easeFactor: number;
  interval: number;
  repetitions: number;
  nextReview: Date;
}

export interface ReviewResult {
  quality: number; // 0-5 scale
  sm2: SM2Data;
}

/**
 * SM-2 Spaced Repetition Algorithm (Anki-style)
 * Quality: 1-4 scale where:
 * 1: Again (Complete blackout)
 * 2: Hard (Incorrect response; where the correct one seemed easy to recall)
 * 3: Good (Correct response recalled with some difficulty)
 * 4: Easy (Perfect response with no hesitation)
 */
export function calculateSM2(currentSM2: SM2Data, quality: number): SM2Data {
  const { easeFactor, interval, repetitions } = currentSM2;

  // Calculate new ease factor (adjusted for 1-4 scale)
  let newEaseFactor =
    easeFactor + (0.1 - (4 - quality) * (0.08 + (4 - quality) * 0.02));
  newEaseFactor = Math.max(1.3, newEaseFactor);

  // Calculate new interval
  let newInterval: number;
  let newRepetitions: number;

  if (quality < 3) {
    // Failed (Again or Hard) - reset to 0
    newInterval = 0;
    newRepetitions = 0;
  } else {
    newRepetitions = repetitions + 1;

    if (newRepetitions === 1) {
      newInterval = 1;
    } else if (newRepetitions === 2) {
      newInterval = 6;
    } else {
      newInterval = Math.round(interval * newEaseFactor);
    }
  }

  // Calculate next review date
  const nextReview = new Date();
  nextReview.setDate(nextReview.getDate() + newInterval);

  return {
    easeFactor: newEaseFactor,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReview,
  };
}

/**
 * Get cards due for review
 */
export function getDueCards(cards: Array<{ sm2: SM2Data; _id: string }>) {
  const now = new Date();
  return cards.filter((card) => card.sm2.nextReview <= now);
}

/**
 * Get study statistics
 */
export function getStudyStats(cards: Array<{ sm2: SM2Data }>) {
  const now = new Date();
  const dueCards = cards.filter((card) => card.sm2.nextReview <= now);
  const totalCards = cards.length;
  const studiedCards = cards.filter((card) => card.sm2.repetitions > 0).length;

  return {
    dueCards: dueCards.length,
    totalCards,
    studiedCards,
    completionRate: totalCards > 0 ? (studiedCards / totalCards) * 100 : 0,
  };
}
