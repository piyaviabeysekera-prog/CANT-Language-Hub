import { db } from '../../data/db';

export interface SkillLevels {
  tones: { level: number; progress: number; max: number };
  reading: { level: number; progress: number; max: number };
  listening: { level: number; progress: number; max: number };
  speaking: { level: number; progress: number; max: number };
  vocabulary: { level: number; progress: number; max: number };
}

/**
 * Derives true competency levels from empirical study data:
 * - Vocabulary: Based on number of cards with stability > 3 days (1 level per 15 retained words)
 * - Listening: Total accurate listening reviews (1 level per 25 correct reviews)
 * - Tones: Total accurate tone discrimination reviews (1 level per 20 correct reviews)
 * - Reading: Total accurate reading reviews (1 level per 25 correct reviews)
 * - Speaking: Cumulative active spoken rehearsal time (1 level per 45 minutes banked)
 */
export async function computeSkillLevels(): Promise<SkillLevels> {
  const cards = await db.cards.toArray();
  const reviews = await db.reviews.toArray();
  const sessions = await db.sessions.toArray();

  // 1. Vocabulary: Stable words
  const stableCards = cards.filter((c) => c.fsrs.stability >= 3.0);
  const vocabPoints = stableCards.length;
  const vocabLevel = Math.max(1, Math.floor(vocabPoints / 15) + 1);
  const vocabProgress = vocabPoints % 15;

  // 2. Listening: Grade >= 3 on listening cards
  const listeningPoints = reviews.filter((r) => r.cardType === 'listening' && r.grade >= 3).length;
  const listeningLevel = Math.max(1, Math.floor(listeningPoints / 25) + 1);
  const listeningProgress = listeningPoints % 25;

  // 3. Tones: Grade >= 3 on tone cards
  const tonePoints = reviews.filter((r) => r.cardType === 'tone' && r.grade >= 3).length;
  const toneLevel = Math.max(1, Math.floor(tonePoints / 20) + 1);
  const toneProgress = tonePoints % 20;

  // 4. Reading: Grade >= 3 on reading cards
  const readingPoints = reviews.filter((r) => r.cardType === 'reading' && r.grade >= 3).length;
  const readingLevel = Math.max(1, Math.floor(readingPoints / 25) + 1);
  const readingProgress = readingPoints % 25;

  // 5. Speaking: Total active practice minutes
  const totalActiveMs = sessions.reduce((acc, s) => acc + (s.activeMs || 0), 0);
  const activeMinutes = Math.floor(totalActiveMs / 60000);
  const speakingLevel = Math.max(1, Math.floor(activeMinutes / 45) + 1);
  const speakingProgress = activeMinutes % 45;

  return {
    tones: { level: Math.min(10, toneLevel), progress: toneProgress, max: 20 },
    reading: { level: Math.min(10, readingLevel), progress: readingProgress, max: 25 },
    listening: { level: Math.min(10, listeningLevel), progress: listeningProgress, max: 25 },
    speaking: { level: Math.min(10, speakingLevel), progress: speakingProgress, max: 45 },
    vocabulary: { level: Math.min(10, vocabLevel), progress: vocabProgress, max: 15 },
  };
}
