import { WordComparison, WordStatus } from '../types';

/**
 * Normalizes text for comparison by lowercasing and stripping punctuation,
 * while keeping internal apostrophes (e.g., "don't", "it's").
 */
export function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?"'’]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Splits text into individual words while preserving original display casing and punctuation
 */
export function tokenizeRawWords(text: string): string[] {
  if (!text || !text.trim()) return [];
  return text.trim().split(/\s+/);
}

/**
 * Cleans a word for comparison (lowercase and alphanumeric only)
 */
export function cleanWord(word: string): string {
  return word.toLowerCase().replace(/[^a-z0-9]/g, '');
}

/**
 * Levenshtein distance for word-level similarity fallback
 */
function wordSimilarity(w1: string, w2: string): number {
  const s1 = cleanWord(w1);
  const s2 = cleanWord(w2);
  if (s1 === s2) return 1.0;
  if (!s1.length || !s2.length) return 0.0;

  const matrix: number[][] = [];
  for (let i = 0; i <= s1.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= s2.length; j++) {
    matrix[0][j] = j;
  }
  for (let i = 1; i <= s1.length; i++) {
    for (let j = 1; j <= s2.length; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }
  const maxLen = Math.max(s1.length, s2.length);
  const dist = matrix[s1.length][s2.length];
  return Math.max(0, 1 - dist / maxLen);
}

/**
 * Word-level comparison between expected sentence and recognized sentence.
 * Returns aligned word tokens with status for the child UI.
 */
export function compareWords(expected: string, actual: string): WordComparison[] {
  const expectedTokens = tokenizeRawWords(expected);
  const actualTokens = tokenizeRawWords(actual);

  if (expectedTokens.length === 0) {
    return actualTokens.map((w, i) => ({
      id: `actual-${i}`,
      word: w,
      status: 'correct',
      note: '✓ Spoken',
    }));
  }

  // Two-pointer / dynamic alignment approach
  const result: WordComparison[] = [];
  const matchedActualIndices = new Set<number>();

  expectedTokens.forEach((expectedWord, expIdx) => {
    const cleanExp = cleanWord(expectedWord);
    let matchedIdx = -1;
    let bestSimilarity = 0;

    // First look in nearby window
    const searchRange = 3;
    const minSearch = Math.max(0, expIdx - searchRange);
    const maxSearch = Math.min(actualTokens.length, expIdx + searchRange + 1);

    for (let actIdx = minSearch; actIdx < maxSearch; actIdx++) {
      if (matchedActualIndices.has(actIdx)) continue;
      const sim = wordSimilarity(cleanExp, actualTokens[actIdx]);
      if (sim > bestSimilarity) {
        bestSimilarity = sim;
        matchedIdx = actIdx;
      }
    }

    // If not found in immediate window, search entire array
    if (bestSimilarity < 0.7) {
      for (let actIdx = 0; actIdx < actualTokens.length; actIdx++) {
        if (matchedActualIndices.has(actIdx)) continue;
        const sim = wordSimilarity(cleanExp, actualTokens[actIdx]);
        if (sim > bestSimilarity) {
          bestSimilarity = sim;
          matchedIdx = actIdx;
        }
      }
    }

    if (matchedIdx !== -1 && bestSimilarity >= 0.8) {
      matchedActualIndices.add(matchedIdx);
      const actWord = actualTokens[matchedIdx];
      const isExact = cleanExp === cleanWord(actWord);

      result.push({
        id: `exp-${expIdx}`,
        word: expectedWord,
        expectedWord,
        status: isExact ? 'correct' : 'mismatched',
        note: isExact
          ? '✓ Correct'
          : `Heard "${actWord}" instead of "${expectedWord}"`,
      });
    } else {
      result.push({
        id: `exp-${expIdx}`,
        word: expectedWord,
        expectedWord,
        status: 'missing',
        note: `Missed or unclear: "${expectedWord}"`,
      });
    }
  });

  return result;
}

/**
 * Calculates honest "Speech Recognition Match" percentage.
 * Suggested calculation:
 * - normalize case
 * - remove unnecessary punctuation
 * - tokenize words
 * - compare expected and recognized words
 * - calculate word-level similarity
 */
export function calculateMatchScore(expected: string, actual: string): number {
  const normExpected = normalizeText(expected);
  const normActual = normalizeText(actual);

  if (!normExpected) return 100;
  if (!normActual) return 0;

  if (normExpected === normActual) return 100;

  const expWords = normExpected.split(' ').filter(Boolean);
  const actWords = normActual.split(' ').filter(Boolean);

  if (expWords.length === 0) return 0;

  let totalMatchWeight = 0;
  const usedActual = new Set<number>();

  for (let i = 0; i < expWords.length; i++) {
    const target = expWords[i];
    let bestSim = 0;
    let bestIdx = -1;

    for (let j = 0; j < actWords.length; j++) {
      if (usedActual.has(j)) continue;
      const sim = wordSimilarity(target, actWords[j]);
      if (sim > bestSim) {
        bestSim = sim;
        bestIdx = j;
      }
    }

    if (bestIdx !== -1 && bestSim >= 0.6) {
      usedActual.add(bestIdx);
      totalMatchWeight += bestSim >= 0.85 ? 1 : bestSim;
    }
  }

  // Length penalty if recognized has huge hallucination or missing words
  const rawRatio = totalMatchWeight / expWords.length;
  const lengthRatio = Math.min(1, actWords.length / expWords.length);
  const score = Math.round(rawRatio * (0.85 + 0.15 * lengthRatio) * 100);

  return Math.min(100, Math.max(0, score));
}

export function getFeedbackMessage(score: number): { title: string; message: string; badge: string; color: string } {
  if (score >= 95) {
    return {
      title: '🎉 Excellent!',
      message: 'Great job! The system understood almost everything.',
      badge: '✓ Excellent match',
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    };
  }
  if (score >= 80) {
    return {
      title: '👏 Very good!',
      message: 'Nice work! Try saying the sentence once more.',
      badge: '✓ Mostly correct',
      color: 'text-teal-700 bg-teal-50 border-teal-200',
    };
  }
  if (score >= 60) {
    return {
      title: '🙂 Good try!',
      message: "You're getting there. Listen carefully and try again.",
      badge: '💡 Good effort',
      color: 'text-amber-700 bg-amber-50 border-amber-200',
    };
  }
  return {
    title: '💪 Keep practicing!',
    message: "Don't worry. Try speaking slowly and clearly.",
    badge: '🔄 Practice again',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  };
}
