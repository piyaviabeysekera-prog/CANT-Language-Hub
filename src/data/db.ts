import Dexie, { Table } from 'dexie';
import { Card as FSRSCard } from 'ts-fsrs';
import { ToneClass } from '../components/audio/ToneGlyph';

export interface Word {
  id: string;
  thai: string;
  roman: string;
  meaning: string;
  toneClass: ToneClass;
  tags: string[];
  example?: string;
  exampleMeaning?: string;
  audio?: string;
}

export type CardType = 'recognition' | 'listening' | 'reading' | 'tone';

export interface CardRecord {
  id?: number;
  wordId: string;
  type: CardType;
  fsrs: FSRSCard;
}

export interface ReviewRecord {
  id?: number;
  wordId: string;
  cardType: CardType;
  grade: number; // 1: Again, 2: Hard, 3: Good, 4: Easy
  at: Date;
  durationMs: number;
}

export interface SessionRecord {
  id?: number;
  startedAt: Date;
  endedAt: Date;
  activeMs: number;
  kind: 'practice' | 'review' | 'listening' | 'reading' | 'manual';
  wordIds: string[];
  manual?: boolean;
  note?: string;
}

export interface QuestRecord {
  id: string;
  title: string;
  category: 'street' | 'food' | 'gym' | 'charm' | 'transit';
  done: boolean;
  doneAt?: Date;
  note?: string;
}

export interface MilestoneRecord {
  hours: number;
  shownAt: Date;
}

export interface SettingRecord {
  key: string;
  value: any;
}

export class ThaiAudioLabDatabase extends Dexie {
  words!: Table<Word, string>;
  cards!: Table<CardRecord, number>;
  reviews!: Table<ReviewRecord, number>;
  sessions!: Table<SessionRecord, number>;
  quests!: Table<QuestRecord, string>;
  milestones!: Table<MilestoneRecord, number>;
  settings!: Table<SettingRecord, string>;

  constructor() {
    super('ThaiAudioLabDB');
    this.version(1).stores({
      words: 'id, thai, roman, toneClass, *tags',
      cards: '++id, wordId, type, [wordId+type]',
      reviews: '++id, wordId, cardType, grade, at',
      sessions: '++id, startedAt, kind',
      quests: 'id, done, category',
      milestones: 'hours',
      settings: 'key',
    });
  }
}

export const db = new ThaiAudioLabDatabase();
