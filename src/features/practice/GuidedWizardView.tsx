import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Sparkles, 
  Volume2, 
  Mic, 
  RotateCcw, 
  CheckCircle2, 
  Compass, 
  Clock, 
  ShieldAlert,
  ArrowRight,
  Zap,
  Flame
} from 'lucide-react';
import { db, Word, CardRecord, CardType } from '../../data/db';
import { gradeCard, createNewCard, getDueCards } from '../../data/srs';
import { ThaiText } from '../../components/typography/ThaiText';
import { AudioButton } from '../../components/audio/AudioButton';
import { ToneGlyph, ToneClass } from '../../components/audio/ToneGlyph';
import { useSpeech } from '../../hooks/useSpeech';
import { useActiveTime } from '../../hooks/useActiveTime';
import { computeSkillLevels } from '../skills/levels';
import { exportSessionToObsidian } from '../../export/obsidian';

export function getMilestoneInfo(day: number) {
  if (day <= 30) {
    let focusDeck = 'core';
    if (day > 10 && day <= 20) focusDeck = 'food';
    if (day > 20) focusDeck = day % 2 === 0 ? 'gym' : 'transit';
    return {
      month: 1,
      title: 'Month 1 // Acoustic Calibration & Survival Core',
      tagline: 'Pitch contour invariance, tone discrimination, and zero-English street survival.',
      focusDeck,
      dayInMonth: day,
    };
  } else if (day <= 60) {
    let focusDeck = 'shopping';
    if (day > 40 && day <= 50) focusDeck = 'gym';
    if (day > 50) focusDeck = 'tones';
    return {
      month: 2,
      title: 'Month 2 // Street Fluidity & Syntactic Modularity',
      tagline: 'Slot-and-frame expansion, bargaining, and minimal pair discrimination.',
      focusDeck,
      dayInMonth: day - 30,
    };
  } else {
    let focusDeck = 'charm';
    if (day > 75) focusDeck = 'all';
    return {
      month: 3,
      title: 'Month 3 // Lupin Charm & Automaticity',
      tagline: 'Dual-task resistance, charismatic banter, and unscripted street fluency.',
      focusDeck,
      dayInMonth: day - 60,
    };
  }
}

type WizardStage = 
  | 'intro'           // Roadmap context & daily intent
  | 'phase1_ear'      // Ear calibration (60s acoustic tuning without text)
  | 'phase2_spoken'   // Active spoken retrieval with 2.5s delay
  | 'phase3_overlearn'// Rapid 2-repeat echo loop for missed items
  | 'phase4_quest';   // Real-world field quest & Obsidian sync

export const GuidedWizardView: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isPlaying, rate, setRate } = useSpeech();
  const { activeMs, activeMinutes } = useActiveTime(true);

  // Curriculum progress
  const [currentDay, setCurrentDay] = useState<number>(1);
  const [stage, setStage] = useState<WizardStage>('intro');

  // Datasets
  const [earChunks, setEarChunks] = useState<Word[]>([]);
  const [earIndex, setEarIndex] = useState(0);

  const [spokenCards, setSpokenCards] = useState<{ card: CardRecord; word: Word }[]>([]);
  const [spokenIndex, setSpokenIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [delayRemaining, setDelayRemaining] = useState<number>(2.5);
  const [canReveal, setCanReveal] = useState(false);

  // Overlearning queue (items graded 1 or 2)
  const [missedWords, setMissedWords] = useState<Word[]>([]);
  const [overlearnIndex, setOverlearnIndex] = useState(0);
  const [overlearnRepeats, setOverlearnRepeats] = useState(0);

  // Telemetry
  const [wordsTouched, setWordsTouched] = useState<Word[]>([]);
  const [todayQuest, setTodayQuest] = useState<string>('Order street food with custom spice level ("ไม่เผ็ด")');
  const [exportStatus, setExportStatus] = useState<string | null>(null);
  const [totalSessionsCount, setTotalSessionsCount] = useState<number>(0);

  const timerRef = useRef<any>(null);

  // 1. Load Current Plan Day & Build Queues
  useEffect(() => {
    async function initWizard() {
      // Load current curriculum day
      const setting = await db.settings.get('curriculumDay');
      const day = setting ? Number(setting.value) : 1;
      setCurrentDay(day);

      const sessionCount = await db.sessions.count();
      setTotalSessionsCount(sessionCount);

      const milestone = getMilestoneInfo(day);
      const allWords = await db.words.toArray();
      const allCards = await db.cards.toArray();
      const dueCards = await getDueCards();

      // Filter words for current milestone deck
      const matchingWords = milestone.focusDeck === 'all'
        ? allWords
        : allWords.filter(w => w.tags.includes(milestone.focusDeck));

      const candidateWords = matchingWords.length > 0 ? matchingWords : allWords;
      const shuffled = candidateWords.sort(() => 0.5 - Math.random());

      // Phase 1: 3 Ear Calibration chunks
      setEarChunks(shuffled.slice(0, 3));

      // Phase 2: 7 Active Spoken Retrieval chunks (Strictly Deduplicated)
      const seenWordIds = new Set<string>();
      const queue: { card: CardRecord; word: Word }[] = [];
      const wordMap = new Map(allWords.map(w => [w.id, w]));

      // Priority: due cards
      for (const c of dueCards) {
        if (queue.length >= 7) break;
        const w = wordMap.get(c.wordId);
        if (w && (milestone.focusDeck === 'all' || w.tags.includes(milestone.focusDeck))) {
          if (!seenWordIds.has(w.id)) {
            seenWordIds.add(w.id);
            queue.push({ card: c, word: w });
          }
        }
      }

      // Fill remaining from candidate words
      for (const w of shuffled) {
        if (queue.length >= 7) break;
        if (!seenWordIds.has(w.id)) {
          seenWordIds.add(w.id);
          const card = allCards.find(c => c.wordId === w.id && c.type === 'reading')
            || allCards.find(c => c.wordId === w.id)
            || createNewCard(w.id, 'reading');
          queue.push({ card, word: w });
        }
      }

      setSpokenCards(queue);

      // Select Today's Quest
      const quests = await db.quests.toArray();
      const openQuests = quests.filter(q => !q.done);
      if (openQuests.length > 0) {
        setTodayQuest(openQuests[day % openQuests.length].title);
      }
    }

    initWizard();
  }, []);

  const milestone = getMilestoneInfo(currentDay);

  // Auto-play audio during Phase 1 (Ear Calibration)
  useEffect(() => {
    if (stage === 'phase1_ear' && earChunks[earIndex]) {
      speak(earChunks[earIndex].thai, { wordId: earChunks[earIndex].id });
    }
  }, [stage, earIndex, earChunks, speak]);

  // 2.5s Desirable Difficulty Countdown Timer for Spoken Retrieval
  useEffect(() => {
    if (stage !== 'phase2_spoken') return;

    setShowAnswer(false);
    setCanReveal(false);
    setDelayRemaining(2.5);

    const interval = 100; // 100ms ticks
    let elapsed = 0;

    timerRef.current = setInterval(() => {
      elapsed += 0.1;
      const left = Math.max(0, 2.5 - elapsed);
      setDelayRemaining(Number(left.toFixed(1)));

      if (left <= 0) {
        clearInterval(timerRef.current!);
        setCanReveal(true);
      }
    }, interval);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [stage, spokenIndex]);

  // Auto-play native audio upon answer reveal
  const currentSpoken = spokenCards[spokenIndex];
  useEffect(() => {
    if (stage === 'phase2_spoken' && showAnswer && currentSpoken) {
      speak(currentSpoken.word.thai, { wordId: currentSpoken.word.id });
    }
  }, [stage, showAnswer, currentSpoken, speak]);

  // Handle Spoken Card Grade
  const handleGrade = async (grade: 1 | 2 | 3 | 4) => {
    if (!currentSpoken) return;

    setWordsTouched(prev => {
      if (!prev.some(w => w.id === currentSpoken.word.id)) {
        return [...prev, currentSpoken.word];
      }
      return prev;
    });

    if (grade <= 2) {
      setMissedWords(prev => {
        if (!prev.some(w => w.id === currentSpoken.word.id)) {
          return [...prev, currentSpoken.word];
        }
        return prev;
      });
    }

    const updatedFSRS = gradeCard(currentSpoken.card.fsrs, grade);
    if (currentSpoken.card.id) {
      await db.cards.update(currentSpoken.card.id, { fsrs: updatedFSRS });
    }

    await db.reviews.add({
      wordId: currentSpoken.word.id,
      cardType: currentSpoken.card.type,
      grade,
      at: new Date(),
      durationMs: 3500,
    });

    if (spokenIndex + 1 < spokenCards.length) {
      setSpokenIndex(prev => prev + 1);
    } else {
      // Transition to Phase 3 (Overlearning) if any missed, else Phase 4
      if (missedWords.length > 0 || grade <= 2) {
        setStage('phase3_overlearn');
      } else {
        setStage('phase4_quest');
      }
    }
  };

  // Keyboard navigation for Spoken Retrieval
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (stage !== 'phase2_spoken') return;

      if (e.code === 'Space') {
        e.preventDefault();
        if (canReveal) setShowAnswer(true);
      } else if (showAnswer) {
        if (e.key === '1') handleGrade(1);
        if (e.key === '2') handleGrade(2);
        if (e.key === '3') handleGrade(3);
        if (e.key === '4') handleGrade(4);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [stage, canReveal, showAnswer, handleGrade]);

  // Handle Overlearn Echo Step
  const currentOverlearn = missedWords[overlearnIndex];
  const handleOverlearnEcho = () => {
    if (!currentOverlearn) {
      setStage('phase4_quest');
      return;
    }

    speak(currentOverlearn.thai, { wordId: currentOverlearn.id });
    if (overlearnRepeats < 1) {
      setOverlearnRepeats(prev => prev + 1);
    } else {
      setOverlearnRepeats(0);
      if (overlearnIndex + 1 < missedWords.length) {
        setOverlearnIndex(prev => prev + 1);
      } else {
        setStage('phase4_quest');
      }
    }
  };

  // Final Session Completion
  const handleCompleteSession = async () => {
    // 1. Bank session
    await db.sessions.add({
      startedAt: new Date(Date.now() - activeMs),
      endedAt: new Date(),
      activeMs,
      kind: 'practice',
      wordIds: wordsTouched.map(w => w.id),
      note: `Guided Wizard Day ${currentDay} (${milestone.title})`,
    });

    // 2. Increment curriculum day
    const nextDay = Math.min(90, currentDay + 1);
    await db.settings.put({ key: 'curriculumDay', value: nextDay });

    navigate('/');
  };

  // =========================================================================
  // STAGE 0: INTRO & DAILY INTENT
  // =========================================================================
  if (stage === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-6 bg-panel text-ink rounded border-2 border-ink shadow-panel">
        <header className="border-b border-ink/15 pb-4 mb-4 flex justify-between items-baseline">
          <div>
            <div className="flex items-center space-x-2 text-accent text-xs font-mono font-bold tracking-widest uppercase mb-1">
              <Sparkles className="w-4 h-4" />
              <span>THE 90-DAY ROGUE PROTOCOL</span>
            </div>
            <h1 className="text-2xl font-serif font-bold uppercase tracking-tight">
              Day {currentDay} of 90 // Guided 5-Minute Session
            </h1>
          </div>
          <span className="text-xs font-mono font-bold bg-accent text-white px-2.5 py-1 rounded">
            DAY {milestone.dayInMonth}/30
          </span>
        </header>

        {/* Milestone Card */}
        <div className="p-4 bg-bg-deep/5 rounded border border-ink/10 mb-5">
          <span className="text-[11px] font-mono uppercase text-muted tracking-wider block font-bold mb-0.5">
            Active Milestone:
          </span>
          <h2 className="text-base font-serif font-bold text-ink mb-1">
            {milestone.title}
          </h2>
          <p className="text-xs font-sans text-muted">
            {milestone.tagline}
          </p>
        </div>

        {/* 4-Phase Protocol Summary */}
        <div className="space-y-2 mb-6 text-xs font-mono">
          <span className="text-muted uppercase tracking-wider block font-bold mb-1">
            Daily Session Sequence (Total ~5 Minutes):
          </span>
          <div className="p-2.5 bg-panel rounded border border-ink/10 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5 text-accent" /> Phase 1: Ear Calibration (60s)
            </span>
            <span className="text-muted text-[11px]">3 Chunks · Passive Contour Tuning</span>
          </div>
          <div className="p-2.5 bg-panel rounded border border-ink/10 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Mic className="w-3.5 h-3.5 text-accent" /> Phase 2: Active Spoken Retrieval (3m)
            </span>
            <span className="text-muted text-[11px]">7 Chunks · 2.5s Delay Timer</span>
          </div>
          <div className="p-2.5 bg-panel rounded border border-ink/10 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-accent" /> Phase 3: Immediate Overlearning (45s)
            </span>
            <span className="text-muted text-[11px]">Rapid Vocal Echo Loop</span>
          </div>
          <div className="p-2.5 bg-panel rounded border border-ink/10 flex items-center justify-between">
            <span className="font-bold flex items-center gap-2">
              <Compass className="w-3.5 h-3.5 text-accent" /> Phase 4: Field Quest Briefing (30s)
            </span>
            <span className="text-muted text-[11px]">Real-World Physical Transfer</span>
          </div>
        </div>

        <div className="p-3 bg-accent/10 rounded border-l-4 border-accent mb-6 text-xs font-serif italic text-ink">
          "Things are effortless if you make them seem effortless. After all, you are Arsene Lupin."
        </div>

        <button
          type="button"
          onClick={() => setStage('phase1_ear')}
          className="w-full py-3.5 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95 shadow-md flex items-center justify-center space-x-2"
        >
          <span>Begin Phase 1: Ear Calibration</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  // =========================================================================
  // STAGE 1: PHASE 1 — EAR CALIBRATION & ACOUSTIC PITCH TUNING (60s)
  // =========================================================================
  if (stage === 'phase1_ear') {
    const chunk = earChunks[earIndex];
    return (
      <div className="max-w-xl mx-auto p-8 bg-panel text-ink rounded border-2 border-ink shadow-panel text-center">
        <div className="flex items-center justify-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-accent mb-2">
          <Volume2 className="w-4 h-4 animate-pulse" />
          <span>PHASE 1 // EAR CALIBRATION ({earIndex + 1} OF {earChunks.length})</span>
        </div>

        <h2 className="text-xl font-serif font-black uppercase tracking-tight mb-2">
          Acoustic Contour Invariance
        </h2>
        <p className="text-xs font-sans text-muted mb-6">
          Close your eyes. Listen to the pitch direction. Do not read, write, or translate.
        </p>

        {/* Pitch Contour Visualizer */}
        <div className="my-8 p-6 bg-bg-deep/10 rounded-xl border border-ink/15 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-3 mb-4">
            <ToneGlyph tone={chunk?.toneClass || 'mid'} />
            <span className="text-sm font-mono font-bold uppercase tracking-wider text-accent">
              {chunk?.toneClass?.toUpperCase()} PITCH CONTOUR
            </span>
          </div>

          <div className="w-48 h-2 bg-ink/10 rounded-full overflow-hidden my-2">
            <div className="h-full bg-accent animate-pulse w-full" />
          </div>

          <button
            type="button"
            onClick={() => chunk && speak(chunk.thai, { wordId: chunk.id })}
            className="mt-4 px-4 py-2 bg-ink text-panel rounded font-mono text-xs uppercase flex items-center space-x-2 hover:opacity-90"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Replay Audio</span>
          </button>
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-ink/10">
          <span className="text-[11px] font-mono text-muted">
            Ear tuning calibrates auditory cortex boundaries
          </span>
          <button
            type="button"
            onClick={() => {
              if (earIndex + 1 < earChunks.length) {
                setEarIndex(prev => prev + 1);
              } else {
                setStage('phase2_spoken');
              }
            }}
            className="px-6 py-2.5 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95 shadow-sm"
          >
            {earIndex + 1 < earChunks.length ? 'Next Contour (Space)' : 'Proceed to Spoken Retrieval'}
          </button>
        </div>
      </div>
    );
  }

  // =========================================================================
  // STAGE 2: PHASE 2 — ACTIVE SPOKEN RETRIEVAL (3 MINS)
  // =========================================================================
  if (stage === 'phase2_spoken') {
    return (
      <div className="max-w-2xl mx-auto bg-panel text-ink rounded border-2 border-ink shadow-panel overflow-hidden">
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-ink/10">
          <div
            className="h-full bg-accent transition-all duration-200"
            style={{ width: `${((spokenIndex + 1) / spokenCards.length) * 100}%` }}
          />
        </div>

        <div className="p-8">
          {/* Header */}
          <div className="h-6 flex items-center justify-between mb-4">
            <span className="text-[11px] font-mono uppercase font-bold bg-accent text-white px-2 py-0.5 rounded">
              PHASE 2 // SPOKEN RETRIEVAL ({spokenIndex + 1} OF {spokenCards.length})
            </span>
            <span className="text-xs font-mono font-bold text-muted">
              {currentSpoken?.word.tags[0]?.toUpperCase() || 'CORE'}
            </span>
          </div>

          {/* Prompt Section */}
          <div className="min-h-[160px] flex flex-col items-center justify-center text-center my-4">
            <span className="text-xs font-mono uppercase text-muted tracking-wider mb-2 font-bold">
              COMMUNICATIVE INTENT / SITUATION:
            </span>
            <h2 className="text-2xl md:text-3xl font-serif font-black text-ink mb-4 px-4 leading-tight">
              {currentSpoken?.word.meaning}
            </h2>

            {/* 2.5-Second Visual Delay Timer */}
            {!showAnswer && (
              <div className="flex flex-col items-center my-2">
                <div className="w-56 h-2 bg-ink/15 rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-accent transition-all duration-100 ease-linear"
                    style={{ width: `${((2.5 - delayRemaining) / 2.5) * 100}%` }}
                  />
                </div>
                {delayRemaining > 0 ? (
                  <span className="text-xs font-mono text-muted tracking-wider">
                    🧠 Assembling Neural Trace... ({delayRemaining}s)
                  </span>
                ) : (
                  <span className="text-xs font-mono font-bold text-accent uppercase tracking-wider animate-pulse flex items-center gap-1.5">
                    <Mic className="w-3.5 h-3.5" /> Speak the Thai chunk aloud now!
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Reveal & Grade Section */}
          <div className="pt-6 border-t border-ink/10 flex flex-col items-center">
            {!showAnswer ? (
              <button
                type="button"
                disabled={!canReveal}
                onClick={() => setShowAnswer(true)}
                className={`px-8 py-3.5 rounded font-mono font-bold text-xs uppercase shadow-sm transition-all ${
                  canReveal
                    ? 'bg-ink text-panel hover:opacity-90 cursor-pointer'
                    : 'bg-ink/30 text-panel/50 cursor-not-allowed'
                }`}
              >
                {canReveal ? 'Reveal Target Phrase (Space)' : `Retrieval Delay (${delayRemaining}s)`}
              </button>
            ) : (
              <div className="w-full flex flex-col items-center space-y-4">
                {/* Detailed Target Chunk Card */}
                <div className="text-center p-4 bg-bg-deep/5 rounded border border-ink/15 w-full">
                  <div className="flex items-center justify-center space-x-3 mb-1">
                    <ThaiText size={38} className="font-bold text-ink">
                      {currentSpoken?.word.thai}
                    </ThaiText>
                    <ToneGlyph tone={currentSpoken?.word.toneClass || 'mid'} />
                  </div>
                  <span className="text-sm font-mono text-accent font-bold block mb-1">
                    {currentSpoken?.word.roman}
                  </span>
                  <span className="text-base font-serif font-bold text-ink block">
                    {currentSpoken?.word.meaning}
                  </span>
                  {currentSpoken?.word.example && (
                    <div className="mt-3 pt-2 border-t border-ink/10 text-xs">
                      <span className="font-thai block text-ink/90 font-medium">
                        {currentSpoken.word.example}
                      </span>
                      <span className="font-sans text-muted block text-[11px] mt-0.5">
                        {currentSpoken.word.exampleMeaning}
                      </span>
                    </div>
                  )}
                </div>

                {/* 4-button FSRS rating */}
                <div className="grid grid-cols-4 gap-3 w-full max-w-md">
                  {[
                    { g: 1, label: 'Again', desc: 'Missed' },
                    { g: 2, label: 'Hard', desc: 'Hesitated' },
                    { g: 3, label: 'Good', desc: 'Natural' },
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
    );
  }

  // =========================================================================
  // STAGE 3: PHASE 3 — IMMEDIATE OVERLEARNING (45S)
  // =========================================================================
  if (stage === 'phase3_overlearn') {
    return (
      <div className="max-w-xl mx-auto p-8 bg-panel text-ink rounded border-2 border-ink shadow-panel text-center">
        <div className="flex items-center justify-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-accent mb-2">
          <RotateCcw className="w-4 h-4" />
          <span>PHASE 3 // IMMEDIATE OVERLEARNING ({overlearnIndex + 1} OF {missedWords.length})</span>
        </div>

        <h2 className="text-xl font-serif font-black uppercase tracking-tight mb-2">
          Seal Motor Articulation Pathway
        </h2>
        <p className="text-xs font-sans text-muted mb-6">
          Repeat this chunk twice with full vocal projection to lock the motor pattern.
        </p>

        <div className="my-6 p-6 bg-bg-deep/5 rounded border border-ink/15 flex flex-col items-center">
          <ThaiText size={42} className="font-bold mb-1">
            {currentOverlearn?.thai}
          </ThaiText>
          <span className="text-sm font-mono text-accent font-bold mb-2">
            {currentOverlearn?.roman}
          </span>
          <span className="text-sm font-serif font-bold text-ink">
            {currentOverlearn?.meaning}
          </span>

          <div className="mt-4 flex items-center space-x-2">
            <span className="text-xs font-mono font-bold">
              Repetition: {overlearnRepeats + 1} of 2
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleOverlearnEcho}
          className="w-full py-3 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95 shadow-md flex items-center justify-center space-x-2"
        >
          <Volume2 className="w-4 h-4" />
          <span>Echo & Confirm Vocal Projection</span>
        </button>
      </div>
    );
  }

  // =========================================================================
  // STAGE 4: PHASE 4 — FIELD QUEST BRIEFING & VAULT SYNC (30S)
  // =========================================================================
  return (
    <div className="max-w-2xl mx-auto p-8 bg-panel text-ink rounded border-2 border-ink shadow-panel">
      <header className="border-b border-ink/15 pb-4 mb-4 flex justify-between items-baseline">
        <div>
          <div className="flex items-center space-x-2 text-accent text-xs font-mono font-bold tracking-widest uppercase mb-1">
            <CheckCircle2 className="w-4 h-4" />
            <span>SESSION 100% COMPLETE</span>
          </div>
          <h1 className="text-2xl font-serif font-bold uppercase tracking-wide">
            Day {currentDay} Concluded · {activeMinutes}m Banked
          </h1>
        </div>
        <span className="text-xs font-mono font-bold bg-ink text-panel px-2.5 py-1 rounded">
          {wordsTouched.length} CHUNKS SECURED
        </span>
      </header>

      {/* Real-World Field Quest Callout */}
      <div className="p-5 bg-accent/10 rounded border-2 border-accent mb-5">
        <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-accent mb-1.5">
          <Compass className="w-4 h-4" />
          <span>TODAY'S PHYSICAL WORLD FIELD MISSION (24-HOUR EXECUTION)</span>
        </div>
        <p className="text-lg font-serif font-black text-ink mb-1">
          {todayQuest}
        </p>
        <p className="text-xs font-sans text-muted">
          Execute this in Bangkok today. Physical reality converts fragile memory into automatic reflexes.
        </p>
      </div>

      {/* Urizen Antigravity Co-Pilot Strategic Card */}
      <div className="p-4 bg-bg-deep/5 rounded border border-ink/15 mb-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2 text-xs font-mono font-bold uppercase tracking-wider text-ink">
            <Zap className="w-3.5 h-3.5 text-accent" />
            <span>URIZEN STRATEGIC CHECKPOINT</span>
          </div>
          <span className="text-[10px] font-mono text-muted">
            Sessions Banked: {totalSessionsCount + 1}
          </span>
        </div>
        <p className="text-xs font-sans text-muted leading-relaxed mb-2">
          You don't need to open Antigravity daily. But once a week (every 7 sessions), open Antigravity and run:
        </p>
        <div className="p-2 bg-ink text-panel font-mono text-xs rounded flex items-center justify-between">
          <span className="text-accent font-bold">/fluent-audit</span>
          <span className="text-panel/60 text-[10px]">Urizen Socratic Error Analysis & Recalibration</span>
        </div>
      </div>

      {/* Actions */}
      <footer className="flex items-center justify-between pt-4 border-t border-ink/15">
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
                wordIds: wordsTouched.map(w => w.id),
                note: `Guided Day ${currentDay} Completed`,
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
          className="px-4 py-2.5 text-xs font-mono uppercase border border-ink hover:bg-bg-deep/10 rounded font-bold"
        >
          {exportStatus || 'Save Note to Obsidian'}
        </button>

        <button
          type="button"
          onClick={handleCompleteSession}
          className="px-8 py-3 bg-accent text-white font-mono font-bold text-xs uppercase rounded border border-ink hover:opacity-95 shadow-md flex items-center space-x-2"
        >
          <span>Bank Day {currentDay} & Return to Hub</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </footer>
    </div>
  );
};
