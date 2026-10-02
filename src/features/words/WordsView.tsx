import React, { useState, useEffect } from 'react';
import { db, Word } from '../../data/db';
import { ThaiText } from '../../components/typography/ThaiText';
import { AudioButton } from '../../components/audio/AudioButton';
import { useSpeech } from '../../hooks/useSpeech';
import { ConsonantsChart } from './ConsonantsChart';
import { VowelsChart } from './VowelsChart';
import { ToneRulesMatrix } from './ToneRulesMatrix';
import { ConfusionsChart } from './ConfusionsChart';

type ViewMode = 'phrases' | 'consonants' | 'vowels' | 'tones' | 'confusions';

export const WordsView: React.FC = () => {
  const [mode, setMode] = useState<ViewMode>('phrases');
  const [words, setWords] = useState<Word[]>([]);
  const [selectedWord, setSelectedWord] = useState<Word | null>(null);
  const [activeTag, setActiveTag] = useState<string>('all');
  const { speak, isPlaying, rate, setRate } = useSpeech();

  useEffect(() => {
    async function loadWords() {
      const all = await db.words.toArray();
      setWords(all);
      if (all.length > 0 && !selectedWord) {
        setSelectedWord(all[0]);
      }
    }
    loadWords();
  }, [selectedWord]);

  const tagFilters = [
    { id: 'all', label: 'All Chunks' },
    { id: 'gym', label: '🥊 Muay Thai' },
    { id: 'food', label: '🍜 Street Food' },
    { id: 'transit', label: '🚕 Transit' },
    { id: 'charm', label: '🎭 Lupin Charm' },
    { id: 'shopping', label: '🛍️ Shopping' },
    { id: 'logistics', label: '🏪 7-11 & Life' },
    { id: 'tones', label: '⚡ Tone Traps' },
    { id: 'core', label: '⚓ Core' },
  ];

  const filteredWords = activeTag === 'all'
    ? words
    : words.filter((w) => w.tags.includes(activeTag));

  return (
    <div className="flex flex-col space-y-3 max-w-5xl">
      {/* Top Section Nav Tabs */}
      <div className="flex space-x-2 border-b border-muted/20 pb-2">
        {[
          { id: 'phrases', label: 'Survival Phrases', thai: 'คำศัพท์' },
          { id: 'consonants', label: '44 Consonants', thai: 'พยัญชนะ' },
          { id: 'vowels', label: '52 Vowels', thai: 'สระ' },
          { id: 'tones', label: 'Tone Rules & Calculator', thai: 'กฎวรรณยุกต์' },
          { id: 'confusions', label: 'Visual Confusions', thai: 'อักษรคล้าย' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setMode(tab.id as ViewMode)}
            className={`px-3 py-1.5 rounded text-xs font-mono uppercase transition-all flex items-baseline space-x-2 ${
              mode === tab.id
                ? 'bg-accent text-white font-bold shadow-sm'
                : 'bg-bg-deep/20 text-muted hover:bg-bg-deep/40 hover:text-text-on-bg'
            }`}
          >
            <span>{tab.label}</span>
            <span lang="th" className="text-[10px] font-thai opacity-60">
              {tab.thai}
            </span>
          </button>
        ))}
      </div>

      {/* Mode 1: Consonants Chart */}
      {mode === 'consonants' && <ConsonantsChart />}

      {/* Mode 2: Vowels Chart */}
      {mode === 'vowels' && <VowelsChart />}

      {/* Mode 3: Tone Rules Calculator */}
      {mode === 'tones' && <ToneRulesMatrix />}

      {/* Mode 4: Visual Confusions */}
      {mode === 'confusions' && <ConfusionsChart />}

      {/* Mode 5: Survival Phrases Dictionary */}
      {mode === 'phrases' && (
        <div className="flex space-x-6 h-[68vh]">
          {/* Left Column: Word List */}
          <div className="w-1/2 flex flex-col p5-panel p-4 rounded overflow-hidden">
            {/* Tag Filters */}
            <div className="flex flex-wrap gap-1 pb-2 border-b border-ink/10 mb-2">
              {tagFilters.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setActiveTag(t.id)}
                  className={`px-2 py-0.5 text-[10px] font-mono uppercase rounded transition-colors ${
                    activeTag === t.id
                      ? 'bg-accent text-white font-bold shadow-xs'
                      : 'bg-bg-deep/10 text-ink/70 hover:bg-bg-deep/20'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto space-y-1.5 pr-2">
              {filteredWords.map((w) => (
                <div
                  key={w.id}
                  onClick={() => setSelectedWord(w)}
                  className={`p-2.5 rounded cursor-pointer transition-colors flex items-center justify-between ${
                    selectedWord?.id === w.id
                      ? 'bg-bg-deep/20 border-l-4 border-accent font-bold'
                      : 'hover:bg-bg-deep/10'
                  }`}
                >
                  <div className="flex items-baseline space-x-3">
                    <span className="font-thai text-base">{w.thai}</span>
                    <span className="text-xs font-mono text-muted">{w.roman}</span>
                  </div>
                  <span className="text-xs text-ink/70 truncate max-w-[140px] text-right">
                    {w.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column: Detailed Inspector */}
          <div className="w-1/2 p5-panel p-6 rounded flex flex-col justify-between">
            {selectedWord ? (
              <div>
                <header className="border-b border-ink/20 pb-4 mb-4 flex justify-between items-start">
                  <div>
                    <ThaiText size={36}>{selectedWord.thai}</ThaiText>
                    <div className="text-sm font-mono text-muted mt-1">{selectedWord.roman}</div>
                  </div>
                  <AudioButton
                    onPlay={() => speak(selectedWord.thai, { wordId: selectedWord.id })}
                    isPlaying={isPlaying}
                    rate={rate}
                    onRateToggle={setRate}
                    tone={selectedWord.toneClass}
                  />
                </header>

                <section className="space-y-4">
                  <div>
                    <span className="text-xs font-mono uppercase text-muted block mb-1">
                      Core Meaning
                    </span>
                    <p className="text-lg font-bold text-ink">{selectedWord.meaning}</p>
                  </div>

                  {selectedWord.example && (
                    <div>
                      <span className="text-xs font-mono uppercase text-muted block mb-1">
                        Example Usage
                      </span>
                      <div className="p-3 bg-bg-deep/10 rounded border border-ink/10">
                        <ThaiText size={20} className="block text-ink">{selectedWord.example}</ThaiText>
                        <span className="text-xs text-muted block mt-1">{selectedWord.exampleMeaning}</span>
                      </div>
                    </div>
                  )}

                  <div>
                    <span className="text-xs font-mono uppercase text-muted block mb-1">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      {selectedWord.tags.map((t) => (
                        <span key={t} className="px-2 py-0.5 text-[10px] font-mono bg-bg-deep/20 rounded">
                          #{t}
                        </span>
                      ))}
                    </div>
                  </div>
                </section>
              </div>
            ) : (
              <div className="text-center text-muted font-mono my-auto">Select a phrase to inspect</div>
            )}

            <div className="pt-4 border-t border-ink/10 text-xs font-mono text-muted flex justify-between">
              <span>STATUS: KNOWN</span>
              <span>FSRS STABILITY: 4.2d</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
