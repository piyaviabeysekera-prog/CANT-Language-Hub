import { fsrs, createEmptyCard, Rating, Card as FSRSCard } from 'ts-fsrs';
import { db, CardRecord, CardType } from './db';

const f = fsrs();

export function createNewCard(wordId: string, type: CardType): CardRecord {
  return {
    wordId,
    type,
    fsrs: createEmptyCard(),
  };
}

export function gradeCard(card: FSRSCard, grade: 1 | 2 | 3 | 4): FSRSCard {
  const ratingMap: Record<number, Rating> = {
    1: Rating.Again,
    2: Rating.Hard,
    3: Rating.Good,
    4: Rating.Easy,
  };

  const rating = ratingMap[grade];
  const now = new Date();
  const scheduled: any = f.repeat(card, now);
  return scheduled[rating].card;
}

export async function getDueCards(): Promise<CardRecord[]> {
  const now = new Date();
  const allCards = await db.cards.toArray();
  return allCards.filter((c) => new Date(c.fsrs.due) <= now);
}
