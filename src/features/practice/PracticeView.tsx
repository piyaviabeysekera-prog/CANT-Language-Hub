import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db, Word, CardRecord } from '../../data/db';
import { gradeCard } from '../../data/srs';
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
  const [searchParams] = useSearchParams();
  const { speak, isPlaying, rate, setRate } = useSpeech();
  const { activeMs, activeMinutes } = useActiveTime(true);

  // Track selection: phrases, consonants, tone_rules
  const [track, setTrack] = useState<PracticeTrack>('phrases');
  const [phase, setPhase] = useState<'pause' | 'drilling' | 'close'>('pause');

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

  // Load datasets
  useEffect(() => {
    async function loadData() {
      // 1. Phrases
      const allWords = await db.words.toArray();
      const allCards = await db.cards.toArray();
      const wordMap = new Map(allWords.map((w) => [w.id, w]));

      const selected: { card: CardRecord; word: Word }[] = [];
      for (const card of allCards) {
        const word = wordMap.get(card.wordId);
        if (word && selected.length < 10) {
          selected.push({ card, word });
        }
      }
      setCards(selected);

      // 2. Consonants
      const consonantsMap = (consonantsData as any).consonants as Record<string, [number, number, string, string, string]>;
      const cList = Object.entries(consonantsMap).map(([char, details]) => ({
        char,
        cls: getConsonantClass(char),
        initial: details[2] || '',
      }));
      // Shuffle & pick 10
      setConsonantDrills(cList.sort(() => 0.5 - Math.random()).slice(0, 10));

      // 3. Tone Rule Drill Items
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
    }
    loadData();
  }, []);

  // Pre-session breathing line: skippable with any key
  useEffect(() => {
    if (phase !== 'pause') return;
    const skipPause = () => setPhase('drilling');
    window.addEventListener('keydown', skipPause);
    const timer = setTimeout(skipPause, 15000);
    return () => {
      window.removeEventListener('keydown', skipPause);
      clearTimeout(timer);
    };
  }, [phase]);

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
        });
        setPhase('close');
      }
    },
    [currentPhrase, currentIndex, cards.length, activeMs, wordsTouched]
  );

  // Handle Consonant Class Choice
  const handleConsonantChoice = async (chosenClass: 'mid' | 'high' | 'low') => {
    if (!currentConsonant) return;
    const isCorrect = chosenClass === currentConsonant.cls;
    setFeedback(isCorrect ? 'Correct!' : `Actually ${currentConsonant.cls.toUpperCase()}`);
    setTimeout(() => setFeedback(null), 400);

    // Record review to update Reading/Tones competency
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

    // Record review to update Tones competency
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

  // 1. Pre-Session Breathing Pause Screen
  if (phase === 'pause') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] max-w-xl mx-auto text-center">
        <span className="text-xs font-mono uppercase tracking-widest text-muted mb-4">
          Center Your Focus
        </span>
        <div className="w-64 h-1 bg-bg-deep/40 rounded overflow-hidden my-6">
          <div className="h-full bg-accent animate-pulse w-full transition-all duration-1000" />
        </div>
        <p className="text-sm font-sans text-muted">
          Breathe in ... breathe out.
        </p>
        <button
          type="button"
          onClick={() => setPhase('drilling')}
          className="mt-8 text-xs font-mono uppercase text-muted/60 hover:text-text-on-bg"
        >
          Press any key to begin immediately
        </button>
      </div>
    );
  }

  // 2. Session Close Screen
  if (phase === 'close') {
    return (
      <div className="p-8 max-w-2xl mx-auto bg-panel text-ink rounded border-2 border-ink shadow-panel">
        <header className="border-b border-ink/20 pb-4 mb-6 flex justify-between items-baseline">
          <div>
            <h1 className="text-2xl font-serif font-bold uppercase tracking-wide">
              Drill Concluded
            </h1>
            <p className="text-xs font-mono text-muted">
              {activeMinutes} minutes banked to your lifetime ledger
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-accent">COMPLETED</span>
        </header>

        <section className="mb-8">
          <h2 className="text-xs font-mono uppercase text-muted tracking-wider mb-2">
            Practice Track: {track.toUpperCase()}
          </h2>
          <p className="text-xs text-ink/70 font-sans">
            Competency matrices for Tones, Reading, and Listening have been silently recalibrated.
          </p>
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

          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2.5 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95"
          >
            Back to Menu (Enter)
          </button>
        </footer>
      </div>
    );
  }

  return (
    <div className="flex flex-col space-y-4 max-w-2xl mx-auto">
      {/* Track Selector Bar */}
      <div className="flex space-x-2 border-b border-muted/20 pb-2">
        {[
          { id: 'phrases', label: 'Survival Phrases', thai: 'ประโยค' },
          { id: 'consonants', label: 'Consonant Classes', thai: 'อักษรสูงกลางต่ำ' },
          { id: 'tone_rules', label: 'Tone Rules Drill', thai: 'คำนวณเสียง' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => {
              setTrack(t.id as PracticeTrack);
              setShowAnswer(false);
            }}
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

      {/* TRACK 1: Survival Phrases */}
      {track === 'phrases' && currentPhrase && (
        <div className="relative bg-panel text-ink rounded border-2 border-ink shadow-panel overflow-hidden">
          <div className="h-1.5 w-full bg-ink/10">
            <div
              className="h-full bg-accent transition-all duration-200"
              style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
            />
          </div>

          <div className="p-8">
            <div className="h-6 flex items-center justify-between mb-4">
              <span className="text-[11px] font-mono uppercase text-muted tracking-widest">
                {currentPhrase.card.type.toUpperCase()} DRILL
              </span>
              {feedback && (
                <span className="text-xs font-mono font-bold text-accent underline">
                  {feedback}
                </span>
              )}
            </div>

            <div className="min-h-[140px] flex flex-col items-center justify-center text-center my-4">
              {currentPhrase.card.type === 'recognition' && (
                <>
                  <ThaiText size={40}>{currentPhrase.word.thai}</ThaiText>
                  <span className="text-sm font-mono text-muted mt-2">{currentPhrase.word.roman}</span>
                </>
              )}

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
                    Listen and identify the meaning
                  </span>
                </div>
              )}

              {currentPhrase.card.type === 'reading' && (
                <>
                  <span className="text-2xl font-serif font-bold text-ink mb-2">
                    {currentPhrase.word.meaning}
                  </span>
                  <span className="text-xs font-mono text-muted uppercase">Select correct Thai phrase</span>
                </>
              )}

              {currentPhrase.card.type === 'tone' && (
                <div className="flex flex-col items-center">
                  <AudioButton
                    onPlay={() => speak(currentPhrase.word.thai, { wordId: currentPhrase.word.id })}
                    isPlaying={isPlaying}
                    rate={rate}
                    onRateToggle={setRate}
                  />
                  <ThaiText size={32} className="mt-3">{currentPhrase.word.thai}</ThaiText>
                  <span className="text-xs font-mono text-muted mt-2">Identify the pitch contour</span>
                </div>
              )}
            </div>

            <div className="pt-6 border-t border-ink/10 flex flex-col items-center">
              {!showAnswer ? (
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="px-8 py-3 bg-ink text-panel rounded font-mono font-bold text-xs uppercase hover:opacity-90 shadow-sm"
                >
                  Reveal Answer (Space)
                </button>
              ) : (
                <div className="w-full flex flex-col items-center space-y-4">
                  <div className="text-center mb-2">
                    <span className="text-lg font-bold text-ink block">{currentPhrase.word.meaning}</span>
                    {currentPhrase.word.example && (
                      <span className="text-xs font-thai text-muted block mt-1">{currentPhrase.word.example}</span>
                    )}
                  </div>

                  <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                    {[
                      { g: 1, label: 'Again' },
                      { g: 2, label: 'Hard' },
                      { g: 3, label: 'Good' },
                      { g: 4, label: 'Easy' },
                    ].map((btn) => (
                      <button
                        key={btn.g}
                        onClick={() => handleGrade(btn.g as any)}
                        className="py-2.5 px-2 rounded border border-ink/40 bg-panel text-xs font-mono font-bold hover:bg-ink/10 active:border-accent"
                      >
                        <span className="block text-[10px] text-muted">{btn.g}</span>
                        {btn.label}
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
