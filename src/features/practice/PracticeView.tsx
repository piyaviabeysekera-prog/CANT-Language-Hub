import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { db, Word, CardRecord, CardType } from '../../data/db';
import { gradeCard, createNewCard, getDueCards } from '../../data/srs';
import { ThaiText } from '../../components/typography/ThaiText';
import { AudioButton } from '../../components/audio/AudioButton';
import { ToneGlyph, ToneClass } from '../../components/audio/ToneGlyph';
import { useSpeech } from '../../hooks/useSpeech';
import { useActiveTime } from '../../hooks/useActiveTime';
import { computeSkillLevels } from '../skills/levels';
import { exportSessionToObsidian } from '../../export/obsidian';
import consonantsData from '../../data/consonants.json';
import { getConsonantClass } from '../words/ConsonantsChart';

type PracticeTrack = 'phrases' | 'consonants' | 'tone_rules';
type DrillMode = 'spoken' | 'listening' | 'mixed';

interface DeckOption {
  id: string;
  name: string;
  thai: string;
  desc: string;
  tag: string;
  icon: string;
}

const DECKS: DeckOption[] = [
  { id: 'all', name: 'Master Survival Library', thai: 'ทั้งหมด', desc: 'All 200 high-frequency survival chunks interleaved', tag: 'all', icon: '🌟' },
  { id: 'gym', name: 'Sitjaroonsak Muay Thai', thai: 'มวยไทย', desc: 'Pads, clinch, strikes, Kru commands, stamina & recovery', tag: 'gym', icon: '🥊' },
  { id: 'food', name: 'Street Food & Dining', thai: 'อาหาร', desc: 'Custom spice levels, noodle types, dishes, bill & takeaway', tag: 'food', icon: '🍜' },
  { id: 'transit', name: 'Bangkok Transit & Nav', thai: 'การเดินทาง', desc: 'Grab, motorbike win, BTS, alleyway shortcuts & directions', tag: 'transit', icon: '🚕' },
  { id: 'charm', name: 'Lupin Charm & Social', thai: 'เสน่ห์และเพื่อน', desc: 'Witty teasing, compliments, icebreakers, LINE & dates', tag: 'charm', icon: '🎭' },
  { id: 'shopping', name: 'Night Markets & Bargaining', thai: 'ช้อปปิ้ง', desc: 'Discounts, prices, sizing, PromptPay scan vs cash', tag: 'shopping', icon: '🛍️' },
  { id: 'logistics', name: '7-Eleven & Pharmacy', thai: 'ชีวิตประจำวัน', desc: 'Cashier questions, symptoms, medicine, condo & SIM', tag: 'logistics', icon: '🏪' },
  { id: 'tones', name: 'Tone Traps & Minimal Pairs', thai: 'คำพ้องเสียง', desc: 'Near/far, rice/white, wood/not pitch distinctions', tag: 'tones', icon: '⚡' },
];

const DRILL_MODES: { id: DrillMode; name: string; desc: string; icon: string }[] = [
  { id: 'spoken', name: 'Spoken Production', desc: 'English situation prompt -> Mental retrieval -> Speak Thai aloud -> Reveal & check native audio', icon: '🗣️' },
  { id: 'listening', name: 'Auditory-First', desc: 'Hear native Thai audio first -> Identify meaning & tone contour', icon: '🎧' },
  { id: 'mixed', name: 'Adaptive Mixed', desc: 'Full-spectrum rotation across spoken recall, listening, and reading', icon: '🔀' },
];

interface ConsonantDrillItem {
  char: string;
  cls: 'mid' | 'high' | 'low';
  initial: string;
}

interface ToneRuleDrillItem {
  syllable: string;
  expectedTone: ToneClass;
  ruleExplanation: string;
}

export const PracticeView: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isPlaying, rate, setRate } = useSpeech();
  const { activeMs, activeMinutes } = useActiveTime(true);

  // Top level track: phrases, consonants, tone_rules
  const [track, setTrack] = useState<PracticeTrack>('phrases');
  const [phase, setPhase] = useState<'setup' | 'drilling' | 'close'>('setup');

  // Deck & Session Config
  const [selectedDeckTag, setSelectedDeckTag] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<DrillMode>('spoken');
  const [sessionCount, setSessionCount] = useState<number>(10);

  // Phrases state
  const [cards, setCards] = useState<{ card: CardRecord; word: Word }[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [wordsTouched, setWordsTouched] = useState<Word[]>([]);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  // Consonant Class Drills state
  const [consonantDrills, setConsonantDrills] = useState<ConsonantDrillItem[]>([]);
  const [consonantIdx, setConsonantIdx] = useState(0);

  // Tone Rules Drills state
  const [toneDrills, setToneDrills] = useState<ToneRuleDrillItem[]>([]);
  const [toneIdx, setToneIdx] = useState(0);

  // Initial load for consonants and tone rules
  useEffect(() => {
    // Consonants
    const consonantsMap = (consonantsData as any).consonants as Record<string, [number, number, string, string, string]>;
    const cList = Object.entries(consonantsMap).map(([char, details]) => ({
      char,
      cls: getConsonantClass(char),
      initial: details[2] || '',
    }));
    setConsonantDrills(cList.sort(() => 0.5 - Math.random()).slice(0, 10));

    // Tone Rules
    const tList: ToneRuleDrillItem[] = [
      { syllable: 'กา', expectedTone: 'mid', ruleExplanation: 'Mid class (ก) + Live long vowel (า) = Mid tone' },
      { syllable: 'ขา', expectedTone: 'rising', ruleExplanation: 'High class (ข) + Live long vowel (า) = Rising tone' },
      { syllable: 'มา', expectedTone: 'mid', ruleExplanation: 'Low class (ม) + Live long vowel (า) = Mid tone' },
      { syllable: 'ก่า', expectedTone: 'low', ruleExplanation: 'Mid class (ก) + Mai Ek (่) = Low tone' },
      { syllable: 'ก้า', expectedTone: 'falling', ruleExplanation: 'Mid class (ก) + Mai Tho (้) = Falling tone' },
      { syllable: 'ข่า', expectedTone: 'low', ruleExplanation: 'High class (ข) + Mai Ek (่) = Low tone' },
      { syllable: 'ข้า', expectedTone: 'falling', ruleExplanation: 'High class (ข) + Mai Tho (้) = Falling tone' },
      { syllable: 'ม่า', expectedTone: 'falling', ruleExplanation: 'Low class (ม) + Mai Ek (่) = Falling tone' },
      { syllable: 'ม้า', expectedTone: 'high', ruleExplanation: 'Low class (ม) + Mai Tho (้) = High tone' },
      { syllable: 'กะ', expectedTone: 'low', ruleExplanation: 'Mid class (ก) + Dead short vowel (ะ) = Low tone' },
      { syllable: 'ขะ', expectedTone: 'low', ruleExplanation: 'High class (ข) + Dead short vowel (ะ) = Low tone' },
      { syllable: 'มะ', expectedTone: 'high', ruleExplanation: 'Low class (ม) + Dead short vowel (ะ) = High tone' },
    ];
    setToneDrills(tList.sort(() => 0.5 - Math.random()).slice(0, 8));
  }, []);

  // Build the session queue with STRICT WORD DEDUPLICATION
  const launchPhrasesSession = useCallback(async () => {
    const allWords = await db.words.toArray();
    const allCards = await db.cards.toArray();
    const dueCards = await getDueCards();

    // 1. Filter matching words for selected deck
    const eligibleWords = selectedDeckTag === 'all'
      ? allWords
      : allWords.filter((w) => w.tags.includes(selectedDeckTag));

    if (eligibleWords.length === 0) return;

    const eligibleWordIds = new Set(eligibleWords.map((w) => w.id));
    const wordMap = new Map(allWords.map((w) => [w.id, w]));

    // Card type mapping per drill mode
    const getCardTypeForMode = (mode: DrillMode, idx: number): CardType => {
      if (mode === 'spoken') return 'reading'; // Shows English prompt, requires vocal Thai retrieval
      if (mode === 'listening') return 'listening'; // Plays audio prompt first
      const mixedTypes: CardType[] = ['reading', 'listening', 'tone', 'recognition'];
      return mixedTypes[idx % mixedTypes.length];
    };

    const seenWordIds = new Set<string>();
    const queue: { card: CardRecord; word: Word }[] = [];

    // Priority 1: Due cards from FSRS matching the deck
    for (const card of dueCards) {
      if (queue.length >= sessionCount) break;
      if (eligibleWordIds.has(card.wordId) && !seenWordIds.has(card.wordId)) {
        const word = wordMap.get(card.wordId);
        if (word) {
          seenWordIds.add(word.id);
          queue.push({ card, word });
        }
      }
    }

    // Priority 2: Unreviewed or shuffled words from the deck (no duplicates!)
    const remainingWords = eligibleWords.filter((w) => !seenWordIds.has(w.id));
    const shuffled = remainingWords.sort(() => 0.5 - Math.random());

    for (let i = 0; i < shuffled.length && queue.length < sessionCount; i++) {
      const word = shuffled[i];
      const preferredType = getCardTypeForMode(selectedMode, queue.length);
      const matchingCard =
        allCards.find((c) => c.wordId === word.id && c.type === preferredType) ||
        allCards.find((c) => c.wordId === word.id) ||
        createNewCard(word.id, preferredType);

      seenWordIds.add(word.id);
      queue.push({ card: matchingCard, word });
    }

    setCards(queue);
    setCurrentIndex(0);
    setShowAnswer(false);
    setWordsTouched([]);
    setPhase('drilling');
  }, [selectedDeckTag, selectedMode, sessionCount]);

  const currentPhrase = cards[currentIndex];
  const currentConsonant = consonantDrills[consonantIdx];
  const currentToneRule = toneDrills[toneIdx];

  // Auto-play audio on prompt change
  useEffect(() => {
    if (phase === 'drilling') {
      if (track === 'phrases' && currentPhrase && (currentPhrase.card.type === 'listening' || currentPhrase.card.type === 'tone')) {
        speak(currentPhrase.word.thai, { wordId: currentPhrase.word.id });
      } else if (track === 'consonants' && currentConsonant) {
        speak(currentConsonant.char);
      } else if (track === 'tone_rules' && currentToneRule) {
        speak(currentToneRule.syllable);
      }
    }
  }, [phase, track, currentIndex, consonantIdx, toneIdx, currentPhrase, currentConsonant, currentToneRule, speak]);

  // When answer is revealed in Spoken mode, automatically play audio
  useEffect(() => {
    if (phase === 'drilling' && track === 'phrases' && showAnswer && currentPhrase) {
      speak(currentPhrase.word.thai, { wordId: currentPhrase.word.id });
    }
  }, [showAnswer, phase, track, currentPhrase, speak]);

  // Handle Phrase Grading
  const handleGrade = useCallback(
    async (grade: 1 | 2 | 3 | 4) => {
      if (!currentPhrase) return;

      setFeedback(grade >= 3 ? 'Got it' : 'Again');
      setTimeout(() => setFeedback(null), 250);

      setWordsTouched((prev) => {
        if (!prev.some((w) => w.id === currentPhrase.word.id)) {
          return [...prev, currentPhrase.word];
        }
        return prev;
      });

      const updatedFSRS = gradeCard(currentPhrase.card.fsrs, grade);
      if (currentPhrase.card.id) {
        await db.cards.update(currentPhrase.card.id, { fsrs: updatedFSRS });
      }

      await db.reviews.add({
        wordId: currentPhrase.word.id,
        cardType: currentPhrase.card.type,
        grade,
        at: new Date(),
        durationMs: 3000,
      });

      setShowAnswer(false);
      if (currentIndex + 1 < cards.length) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        await db.sessions.add({
          startedAt: new Date(Date.now() - activeMs),
          endedAt: new Date(),
          activeMs,
          kind: 'practice',
          wordIds: wordsTouched.map((w) => w.id),
          note: `Drilled Deck: ${selectedDeckTag.toUpperCase()} (${selectedMode} mode)`,
        });
        setPhase('close');
      }
    },
    [currentPhrase, currentIndex, cards.length, activeMs, wordsTouched, selectedDeckTag, selectedMode]
  );

  // Keyboard navigation for practice
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (phase !== 'drilling' || track !== 'phrases') return;

      if (e.code === 'Space') {
        e.preventDefault();
        setShowAnswer((prev) => !prev);
      } else if (showAnswer) {
        if (e.key === '1') handleGrade(1);
        if (e.key === '2') handleGrade(2);
        if (e.key === '3') handleGrade(3);
        if (e.key === '4') handleGrade(4);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, track, showAnswer, handleGrade]);

  // Handle Consonant Class Choice
  const handleConsonantChoice = async (chosenClass: 'mid' | 'high' | 'low') => {
    if (!currentConsonant) return;
    const isCorrect = chosenClass === currentConsonant.cls;
    setFeedback(isCorrect ? 'Correct!' : `Actually ${currentConsonant.cls.toUpperCase()}`);
    setTimeout(() => setFeedback(null), 400);

    await db.reviews.add({
      wordId: currentConsonant.char,
      cardType: 'reading',
      grade: isCorrect ? 4 : 1,
      at: new Date(),
      durationMs: 2500,
    });

    if (consonantIdx + 1 < consonantDrills.length) {
      setConsonantIdx((prev) => prev + 1);
    } else {
      await db.sessions.add({
        startedAt: new Date(Date.now() - activeMs),
        endedAt: new Date(),
        activeMs,
        kind: 'practice',
        wordIds: [],
        note: 'Consonant class classification drill (44 alphabet)',
      });
      setPhase('close');
    }
  };

  // Handle Tone Rule Choice
  const handleToneRuleChoice = async (chosenTone: ToneClass) => {
    if (!currentToneRule) return;
    const isCorrect = chosenTone === currentToneRule.expectedTone;
    setFeedback(isCorrect ? 'Correct!' : `${currentToneRule.expectedTone.toUpperCase()}`);
    setTimeout(() => setFeedback(null), 400);

    await db.reviews.add({
      wordId: currentToneRule.syllable,
      cardType: 'tone',
      grade: isCorrect ? 4 : 1,
      at: new Date(),
      durationMs: 3000,
    });

    if (toneIdx + 1 < toneDrills.length) {
      setToneIdx((prev) => prev + 1);
    } else {
      await db.sessions.add({
        startedAt: new Date(Date.now() - activeMs),
        endedAt: new Date(),
        activeMs,
        kind: 'practice',
        wordIds: [],
        note: 'Tone calculation rule drills completed',
      });
      setPhase('close');
    }
  };

  // =========================================================================
  // SCREEN 1: PRE-FLIGHT DECK & DRILL CONFIGURATION
  // =========================================================================
  if (phase === 'setup') {
    return (
      <div className="flex flex-col space-y-6 max-w-4xl mx-auto p-4">
        {/* Track Tabs */}
        <div className="flex space-x-2 border-b border-muted/20 pb-2">
          {[
            { id: 'phrases', label: 'Survival Chunks Library', thai: 'ประโยคเอาตัวรอด' },
            { id: 'consonants', label: '44 Consonants Drill', thai: 'อักษรสูงกลางต่ำ' },
            { id: 'tone_rules', label: 'Tone Rules Drill', thai: 'คำนวณเสียงวรรณยุกต์' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTrack(t.id as PracticeTrack)}
              className={`px-3 py-1.5 rounded text-xs font-mono uppercase transition-all flex items-baseline space-x-2 ${
                track === t.id
                  ? 'bg-accent text-white font-bold shadow-sm'
                  : 'bg-bg-deep/20 text-muted hover:bg-bg-deep/40 hover:text-text-on-bg'
              }`}
            >
              <span>{t.label}</span>
              <span lang="th" className="text-[10px] font-thai opacity-60">
                {t.thai}
              </span>
            </button>
          ))}
        </div>

        {track === 'phrases' ? (
          <div className="bg-panel text-ink rounded border-2 border-ink shadow-panel p-6">
            <header className="border-b border-ink/10 pb-4 mb-4 flex justify-between items-baseline">
              <div>
                <h2 className="text-xl font-serif font-bold uppercase tracking-wide">
                  Configure Survival Drill
                </h2>
                <p className="text-xs font-mono text-muted">
                  Select your target situational deck, pedagogical mode, and session size.
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-accent">P5 METAPHOR MATRIX</span>
            </header>

            {/* 1. Deck Selector */}
            <div className="mb-5">
              <label className="block text-xs font-mono uppercase text-muted tracking-wider mb-2 font-bold">
                1. Select Situational Deck
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
                {DECKS.map((d) => (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDeckTag(d.tag)}
                    className={`p-3 rounded text-left border transition-all flex flex-col justify-between ${
                      selectedDeckTag === d.tag
                        ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent'
                        : 'border-ink/20 bg-bg-deep/5 hover:border-ink/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{d.icon}</span>
                      <span className="text-xs font-bold font-serif">{d.name}</span>
                    </div>
                    <p className="text-[10px] font-sans text-muted mt-1 leading-tight">{d.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Drill Mode Selector */}
            <div className="mb-5">
              <label className="block text-xs font-mono uppercase text-muted tracking-wider mb-2 font-bold">
                2. Select Meta-Learning Drill Mode
              </label>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {DRILL_MODES.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setSelectedMode(m.id)}
                    className={`p-3 rounded text-left border transition-all ${
                      selectedMode === m.id
                        ? 'border-accent bg-accent/10 shadow-sm ring-1 ring-accent'
                        : 'border-ink/20 bg-bg-deep/5 hover:border-ink/40'
                    }`}
                  >
                    <div className="flex items-center space-x-2">
                      <span className="text-base">{m.icon}</span>
                      <span className="text-xs font-bold font-mono uppercase">{m.name}</span>
                    </div>
                    <p className="text-[10px] font-sans text-muted mt-1">{m.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* 3. Session Size */}
            <div className="mb-6 flex items-center justify-between border-t border-ink/10 pt-4">
              <div>
                <label className="text-xs font-mono uppercase text-muted tracking-wider block font-bold">
                  3. Cards Per Session (Guaranteed 100% Unique / Deduplicated)
                </label>
                <span className="text-[11px] text-muted">
                  Strictly 1 card per distinct lexical chunk. Zero repeats in the same session.
                </span>
              </div>
              <div className="flex space-x-2">
                {[5, 10, 15, 20].map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSessionCount(size)}
                    className={`px-3 py-1.5 rounded text-xs font-mono font-bold transition-all ${
                      sessionCount === size
                        ? 'bg-ink text-panel shadow-sm'
                        : 'bg-bg-deep/10 text-ink/70 hover:bg-bg-deep/20'
                    }`}
                  >
                    {size} Chunks
                  </button>
                ))}
              </div>
            </div>

            {/* Launch Action */}
            <div className="pt-2 flex justify-between items-center border-t border-ink/10">
              <span className="text-xs font-mono text-muted italic">
                "Things are effortless if you make them seem effortless." — Arsene Lupin
              </span>
              <button
                type="button"
                onClick={launchPhrasesSession}
                className="px-8 py-3 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95 shadow-md flex items-center space-x-2"
              >
                <span>Launch Drill</span>
                <span>(Enter)</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-panel text-ink rounded border-2 border-ink shadow-panel p-6 text-center">
            <h3 className="text-lg font-bold font-serif mb-2">
              Ready to test {track === 'consonants' ? '44 Consonant Classes' : 'Tone Rules Calculation'}
            </h3>
            <p className="text-xs font-mono text-muted mb-6">
              10 rapid-fire randomized prompts testing your foundational orthographic mechanics.
            </p>
            <button
              type="button"
              onClick={() => setPhase('drilling')}
              className="px-8 py-3 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95 shadow-md"
            >
              Start Diagnostic Drill
            </button>
          </div>
        )}
      </div>
    );
  }

  // =========================================================================
  // SCREEN 2: DRILL CONCLUDED SCREEN
  // =========================================================================
  if (phase === 'close') {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-panel text-ink rounded border-2 border-ink shadow-panel">
        <header className="border-b border-ink/20 pb-4 mb-6 flex justify-between items-baseline">
          <div>
            <h1 className="text-2xl font-serif font-bold uppercase tracking-wide">
              Drill Concluded
            </h1>
            <p className="text-xs font-mono text-muted">
              {activeMinutes} minutes banked · {wordsTouched.length} distinct chunks reviewed
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-accent">COMPLETED</span>
        </header>

        <section className="mb-6">
          <h2 className="text-xs font-mono uppercase text-muted tracking-wider mb-2 font-bold">
            Reviewed Lexical Chunks ({wordsTouched.length})
          </h2>
          <div className="max-h-48 overflow-y-auto space-y-1.5 pr-2">
            {wordsTouched.map((w) => (
              <div key={w.id} className="p-2 bg-bg-deep/5 rounded border border-ink/10 flex justify-between items-baseline">
                <div>
                  <span className="font-thai font-bold mr-2">{w.thai}</span>
                  <span className="text-xs font-mono text-muted">({w.roman})</span>
                </div>
                <span className="text-xs text-ink/80">{w.meaning}</span>
              </div>
            ))}
          </div>
        </section>

        <footer className="flex items-center justify-between pt-4 border-t border-ink/20">
          <button
            type="button"
            onClick={async () => {
              const skills = await computeSkillLevels();
              const res = await exportSessionToObsidian(
                {
                  startedAt: new Date(Date.now() - activeMs),
                  endedAt: new Date(),
                  activeMs,
                  kind: 'practice',
                  wordIds: wordsTouched.map((w) => w.id),
                },
                wordsTouched,
                `${activeMinutes}m`,
                {
                  tones: skills.tones.level,
                  reading: skills.reading.level,
                  listening: skills.listening.level,
                  speaking: skills.speaking.level,
                  vocabulary: skills.vocabulary.level,
                }
              );
              setExportStatus(res.message);
            }}
            className="px-4 py-2 text-xs font-mono uppercase border border-ink hover:bg-bg-deep/10 rounded font-bold"
          >
            {exportStatus || 'Save Note to Obsidian'}
          </button>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={() => setPhase('setup')}
              className="px-4 py-2 border border-ink bg-bg-deep/10 font-mono font-bold text-xs uppercase rounded hover:bg-bg-deep/20"
            >
              Another Drill
            </button>
            <button
              type="button"
              onClick={() => navigate('/')}
              className="px-6 py-2.5 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95"
            >
              Back to Menu (Enter)
            </button>
          </div>
        </footer>
      </div>
    );
  }

  // =========================================================================
  // SCREEN 3: ACTIVE DRILLING SCREEN
  // =========================================================================
  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
      {/* Top Track Bar */}
      <div className="flex justify-between items-center border-b border-muted/20 pb-2">
        <div className="flex space-x-2">
          {[
            { id: 'phrases', label: 'Survival Chunks', count: cards.length },
            { id: 'consonants', label: 'Consonant Classes', count: consonantDrills.length },
            { id: 'tone_rules', label: 'Tone Rules', count: toneDrills.length },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTrack(t.id as PracticeTrack);
                setShowAnswer(false);
              }}
              className={`px-3 py-1 rounded text-xs font-mono uppercase transition-all ${
                track === t.id
                  ? 'bg-accent text-white font-bold'
                  : 'bg-bg-deep/20 text-muted hover:bg-bg-deep/40'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => setPhase('setup')}
          className="text-[11px] font-mono uppercase text-muted hover:text-text-on-bg underline"
        >
          ⚙️ Change Deck / Mode
        </button>
      </div>

      {/* TRACK 1: Survival Phrases */}
      {track === 'phrases' && currentPhrase && (
        <div className="relative bg-panel text-ink rounded border-2 border-ink shadow-panel overflow-hidden">
          {/* Progress bar */}
          <div className="h-1.5 w-full bg-ink/10">
            <div
              className="h-full bg-accent transition-all duration-200"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            {/* Header: Deck Badge & Progress */}
            <div className="h-6 flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono uppercase font-bold bg-ink text-panel px-2 py-0.5 rounded">
                  {currentPhrase.word.tags[0]?.toUpperCase() || 'CORE'}
                </span>
                <span className="text-[11px] font-mono uppercase text-muted">
                  Chunk {currentIndex + 1} of {cards.length}
                </span>
              </div>
              {feedback && (
                <span className="text-xs font-mono font-bold text-accent underline animate-pulse">
                  {feedback}
                </span>
              )}
            </div>

            {/* Prompt Area */}
            <div className="min-h-[160px] flex flex-col items-center justify-center text-center my-4">
              {/* Spoken Mode Prompt: English meaning displayed, prompt user to speak aloud */}
              {currentPhrase.card.type === 'reading' && (
                <div className="flex flex-col items-center">
                  <span className="text-xs font-mono uppercase text-muted tracking-wider mb-2">
                    SITUATION / MEANING:
                  </span>
                  <span className="text-2xl font-serif font-bold text-ink mb-3 px-4">
                    {currentPhrase.word.meaning}
                  </span>
                  <span className="text-xs font-mono text-accent uppercase font-bold tracking-wide animate-pulse">
                    🗣️ Speak the Thai chunk aloud before revealing
                  </span>
                </div>
              )}

              {/* Listening Mode Prompt: Audio button, identify meaning */}
              {currentPhrase.card.type === 'listening' && (
                <div className="flex flex-col items-center">
                  <AudioButton
                    onPlay={() => speak(currentPhrase.word.thai, { wordId: currentPhrase.word.id })}
                    isPlaying={isPlaying}
                    rate={rate}
                    onRateToggle={setRate}
                    tone={currentPhrase.word.toneClass}
                  />
                  <span className="text-xs font-mono text-muted mt-3 uppercase tracking-wider">
                    Listen to native audio · Identify meaning & pitch contour
                  </span>
                </div>
              )}

              {/* Recognition Mode Prompt: Thai text */}
              {currentPhrase.card.type === 'recognition' && (
                <>
                  <ThaiText size={40}>{currentPhrase.word.thai}</ThaiText>
                  <span className="text-sm font-mono text-muted mt-2">{currentPhrase.word.roman}</span>
                </>
              )}

              {/* Tone Discrimination Prompt */}
              {currentPhrase.card.type === 'tone' && (
                <div className="flex flex-col items-center">
                  <AudioButton
                    onPlay={() => speak(currentPhrase.word.thai, { wordId: currentPhrase.word.id })}
                    isPlaying={isPlaying}
                    rate={rate}
                    onRateToggle={setRate}
                  />
                  <ThaiText size={36} className="mt-3">{currentPhrase.word.thai}</ThaiText>
                  <span className="text-xs font-mono text-muted mt-2">Identify the pitch contour</span>
                </div>
              )}
            </div>

            {/* Reveal & Grade Area */}
            <div className="pt-6 border-t border-ink/10 flex flex-col items-center">
              {!showAnswer ? (
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="px-8 py-3 bg-ink text-panel rounded font-mono font-bold text-xs uppercase hover:opacity-90 shadow-sm"
                >
                  Reveal Target Phrase (Space)
                </button>
              ) : (
                <div className="w-full flex flex-col items-center space-y-4">
                  {/* Detailed Target Chunk Card */}
                  <div className="text-center p-4 bg-bg-deep/5 rounded border border-ink/15 w-full">
                    <div className="flex items-center justify-center space-x-3 mb-1">
                      <ThaiText size={38} className="font-bold text-ink">
                        {currentPhrase.word.thai}
                      </ThaiText>
                      <ToneGlyph tone={currentPhrase.word.toneClass} />
                    </div>
                    <span className="text-sm font-mono text-accent font-bold block mb-1">
                      {currentPhrase.word.roman}
                    </span>
                    <span className="text-base font-serif font-bold text-ink block">
                      {currentPhrase.word.meaning}
                    </span>
                    {currentPhrase.word.example && (
                      <div className="mt-3 pt-2 border-t border-ink/10 text-xs">
                        <span className="font-thai block text-ink/90 font-medium">
                          {currentPhrase.word.example}
                        </span>
                        <span className="font-sans text-muted block text-[11px] mt-0.5">
                          {currentPhrase.word.exampleMeaning}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* 4-button FSRS rating */}
                  <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                    {[
                      { g: 1, label: 'Again', desc: 'Missed' },
                      { g: 2, label: 'Hard', desc: 'Hesitated' },
                      { g: 3, label: 'Good', desc: 'Smooth' },
                      { g: 4, label: 'Easy', desc: 'Automatic' },
                    ].map((btn) => (
                      <button
                        key={btn.g}
                        type="button"
                        onClick={() => handleGrade(btn.g as any)}
                        className="py-2.5 px-2 rounded border border-ink/40 bg-panel text-xs font-mono font-bold hover:bg-ink/10 active:border-accent text-center"
                      >
                        <span className="block text-[10px] text-muted">{btn.g}</span>
                        <span className="block">{btn.label}</span>
                        <span className="block text-[9px] text-muted/70 font-normal">{btn.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TRACK 2: Consonant Class Drill */}
      {track === 'consonants' && currentConsonant && (
        <div className="bg-panel text-ink rounded border-2 border-ink shadow-panel p-8">
          <header className="flex justify-between items-center mb-4">
            <span className="text-xs font-mono text-muted uppercase tracking-wider">
              Consonant Class Drill ({consonantIdx + 1} of {consonantDrills.length})
            </span>
            {feedback && (
              <span className="text-xs font-mono font-bold text-accent">{feedback}</span>
            )}
          </header>

          <div className="flex flex-col items-center justify-center my-6">
            <ThaiText size={72}>{currentConsonant.char}</ThaiText>
            <div className="mt-3 flex items-center space-x-2">
              <AudioButton
                onPlay={() => speak(currentConsonant.char)}
                isPlaying={isPlaying}
                rate={rate}
                onRateToggle={setRate}
              />
              <span className="text-sm font-mono text-muted">Initial: /{currentConsonant.initial}/</span>
            </div>
            <p className="text-xs text-muted font-sans mt-3">Which consonant class does this letter belong to?</p>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-6 border-t border-ink/10">
            <button
              onClick={() => handleConsonantChoice('high')}
              className="py-3 px-2 rounded border-2 border-amber-700 bg-amber-800/10 hover:bg-amber-800/20 text-ink text-xs font-mono font-bold uppercase"
            >
              1. High Class (สูง)
            </button>
            <button
              onClick={() => handleConsonantChoice('mid')}
              className="py-3 px-2 rounded border-2 border-emerald-700 bg-emerald-800/10 hover:bg-emerald-800/20 text-ink text-xs font-mono font-bold uppercase"
            >
              2. Mid Class (กลาง)
            </button>
            <button
              onClick={() => handleConsonantChoice('low')}
              className="py-3 px-2 rounded border-2 border-cyan-700 bg-cyan-800/10 hover:bg-cyan-800/20 text-ink text-xs font-mono font-bold uppercase"
            >
              3. Low Class (ต่ำ)
            </button>
          </div>
        </div>
      )}

      {/* TRACK 3: Tone Rules Drill */}
      {track === 'tone_rules' && currentToneRule && (
        <div className="bg-panel text-ink rounded border-2 border-ink shadow-panel p-8">
          <header className="flex justify-between items-center mb-4">
            <span className="text-xs font-mono text-muted uppercase tracking-wider">
              Tone Rule Calculation ({toneIdx + 1} of {toneDrills.length})
            </span>
            {feedback && (
              <span className="text-xs font-mono font-bold text-accent">{feedback}</span>
            )}
          </header>

          <div className="flex flex-col items-center justify-center my-6">
            <ThaiText size={64}>{currentToneRule.syllable}</ThaiText>
            <div className="mt-3">
              <AudioButton
                onPlay={() => speak(currentToneRule.syllable)}
                isPlaying={isPlaying}
                rate={rate}
                onRateToggle={setRate}
                tone={currentToneRule.expectedTone}
              />
            </div>
            <p className="text-xs text-muted font-sans mt-3">What tone does this syllable produce?</p>
          </div>

          <div className="grid grid-cols-5 gap-2 pt-6 border-t border-ink/10">
            {(['mid', 'low', 'falling', 'high', 'rising'] as ToneClass[]).map((t) => (
              <button
                key={t}
                onClick={() => handleToneRuleChoice(t)}
                className="py-2.5 px-1 rounded border-2 border-ink/30 hover:border-accent hover:bg-bg-deep/10 text-xs font-mono font-bold uppercase text-ink flex flex-col items-center"
              >
                <ToneGlyph tone={t} />
                <span className="mt-1 text-[10px]">{t}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 p-2 bg-bg-deep/10 rounded text-[11px] font-mono text-muted text-center">
            {currentToneRule.ruleExplanation}
          </div>
        </div>
      )}
    </div>
  );
};
