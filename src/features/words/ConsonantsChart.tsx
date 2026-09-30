import React, { useState } from 'react';
import consonantsData from '../../data/consonants.json';
import { ThaiText } from '../../components/typography/ThaiText';
import { AudioButton } from '../../components/audio/AudioButton';
import { useSpeech } from '../../hooks/useSpeech';

const lowChars = 'ครทมพลนชวยภซงฟธฮฆญณฒฌฑฬฅ';
const midChars = 'กตปอจบดฎฏ';
const highChars = 'สหขผถศฝฉฐษฃ';

export function getConsonantClass(char: string): 'mid' | 'high' | 'low' {
  if (midChars.includes(char)) return 'mid';
  if (highChars.includes(char)) return 'high';
  return 'low';
}

export const ConsonantsChart: React.FC = () => {
  const { speak, isPlaying, rate, setRate } = useSpeech();
  const [filterClass, setFilterClass] = useState<'all' | 'mid' | 'high' | 'low'>('all');
  const [selectedChar, setSelectedChar] = useState<string>('ก');

  const consonantsMap = (consonantsData as any).consonants as Record<string, [number, number, string, string, string]>;

  const consonantEntries = Object.entries(consonantsMap).map(([char, details]) => ({
    char,
    cls: getConsonantClass(char),
    initialSound: details[2] || '',
    finalSound: details[3] || '',
    exampleWord: details[4] || '',
  }));

  const filtered = filterClass === 'all'
    ? consonantEntries
    : consonantEntries.filter((c) => c.cls === filterClass);

  const activeEntry = consonantEntries.find((c) => c.char === selectedChar) || consonantEntries[0];

  const classBadges = {
    mid: { label: 'MID CLASS (อักษรกลาง)', color: 'bg-emerald-800/80 text-emerald-100 border-emerald-600' },
    high: { label: 'HIGH CLASS (อักษรสูง)', color: 'bg-amber-800/80 text-amber-100 border-amber-600' },
    low: { label: 'LOW CLASS (อักษรต่ำ)', color: 'bg-cyan-800/80 text-cyan-100 border-cyan-600' },
  };

  return (
    <div className="flex space-x-6 h-[68vh]">
      {/* Left Column: Consonant Grid */}
      <div className="w-3/5 flex flex-col p5-panel p-4 rounded overflow-hidden">
        {/* Class Filter Bar */}
        <div className="flex space-x-2 pb-3 border-b border-ink/10 mb-3">
          {(['all', 'mid', 'high', 'low'] as const).map((cls) => (
            <button
              key={cls}
              onClick={() => setFilterClass(cls)}
              className={`px-3 py-1 text-xs font-mono uppercase rounded transition-colors font-bold ${
                filterClass === cls
                  ? 'bg-accent text-white'
                  : 'bg-bg-deep/10 text-ink/70 hover:bg-bg-deep/20'
              }`}
            >
              {cls === 'all' ? 'All (44)' : `${cls} Class (${consonantEntries.filter(c => c.cls === cls).length})`}
            </button>
          ))}
        </div>

        {/* Consonant Tile Matrix */}
        <div className="flex-1 overflow-y-auto grid grid-cols-6 gap-2 pr-1 content-start">
          {filtered.map((item) => {
            const isSelected = selectedChar === item.char;
            return (
              <button
                key={item.char}
                onClick={() => {
                  setSelectedChar(item.char);
                  speak(item.char);
                }}
                className={`p-2 rounded border-2 flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'border-accent bg-accent text-white shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'border-ink/20 bg-bg-deep/10 hover:border-ink/60 text-ink'
                }`}
              >
                <ThaiText size={26}>{item.char}</ThaiText>
                <span className="text-[10px] font-mono mt-0.5 opacity-70">
                  {item.initialSound}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Character Inspector */}
      <div className="w-2/5 p5-panel p-6 rounded flex flex-col justify-between">
        {activeEntry ? (
          <div>
            <header className="border-b border-ink/20 pb-4 mb-4 flex justify-between items-start">
              <div>
                <ThaiText size={56}>{activeEntry.char}</ThaiText>
                <div className="mt-1">
                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-mono font-bold uppercase rounded border ${classBadges[activeEntry.cls].color}`}>
                    {classBadges[activeEntry.cls].label}
                  </span>
                </div>
              </div>
              <AudioButton
                onPlay={() => speak(activeEntry.char)}
                isPlaying={isPlaying}
                rate={rate}
                onRateToggle={setRate}
              />
            </header>

            <section className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-bg-deep/10 rounded border border-ink/10">
                  <span className="text-[10px] font-mono uppercase text-muted block">Initial Sound</span>
                  <span className="text-lg font-bold font-mono text-ink">/{activeEntry.initialSound}/</span>
                </div>
                <div className="p-3 bg-bg-deep/10 rounded border border-ink/10">
                  <span className="text-[10px] font-mono uppercase text-muted block">Final Sound</span>
                  <span className="text-lg font-bold font-mono text-ink">/{activeEntry.finalSound}/</span>
                </div>
              </div>

              {activeEntry.exampleWord && (
                <div className="p-3 bg-bg-deep/10 rounded border border-ink/10 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-muted block mb-0.5">Example Word</span>
                    <ThaiText size={22}>{activeEntry.exampleWord}</ThaiText>
                  </div>
                  <button
                    onClick={() => speak(activeEntry.exampleWord)}
                    className="px-2.5 py-1 text-xs font-mono rounded border border-ink hover:bg-bg-deep/20 text-ink"
                  >
                    🔊 Hear
                  </button>
                </div>
              )}

              <div className="text-xs text-muted font-sans leading-relaxed pt-2">
                <strong>Tone Influence:</strong> When paired with vowels and tone markers, this consonant's class determines whether the syllable carries a Low, Mid, High, Falling, or Rising pitch.
              </div>
            </section>
          </div>
        ) : null}

        <div className="pt-3 border-t border-ink/10 text-[11px] font-mono text-muted flex justify-between">
          <span>ALPHABET MATRIX</span>
          <span>44 CONSONANTS</span>
        </div>
      </div>
    </div>
  );
};
