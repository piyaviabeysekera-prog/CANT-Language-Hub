import React, { useState } from 'react';
import consonantsData from '../../data/consonants.json';
import { ThaiText } from '../../components/typography/ThaiText';
import { useSpeech } from '../../hooks/useSpeech';

export const ConfusionsChart: React.FC = () => {
  const { speak } = useSpeech();
  const rawConfusions = (consonantsData as any).confusions as string[];
  const consonantsMap = (consonantsData as any).consonants as Record<string, [number, number, string, string, string]>;

  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  const groups = [
    { title: 'The Beaked / Arched Family (ก vs ภ vs ถ)', chars: rawConfusions[0] || 'กภถญฌณฤฎฏ', desc: 'Notice the inner vs outer head loops, beak curves, and tail descenders.' },
    { title: 'The Round Loop & Notch Family (ข vs ช vs ซ)', chars: rawConfusions[1] || 'ขชซบปษฆยฃ', desc: 'Notice head notches (ข vs ซ), tail flicks (ช vs ข), and boxy baselines (บ vs ป).' },
    { title: 'The Ascender & Descender Family (พ vs ฟ vs ผ vs ฝ)', chars: rawConfusions[2] || 'พฟฬผฝบปษ', desc: 'Notice long ascenders above the line (ฟ, ฝ, ป) and loop directions.' },
  ];

  const currentGroup = groups[activeGroupIndex] || groups[0];
  const charList = currentGroup.chars.split('');

  return (
    <div className="flex flex-col space-y-4 h-[68vh]">
      {/* Group Selector Tabs */}
      <div className="flex space-x-2">
        {groups.map((g, idx) => (
          <button
            key={idx}
            onClick={() => setActiveGroupIndex(idx)}
            className={`px-4 py-2 text-xs font-mono uppercase rounded border transition-all ${
              activeGroupIndex === idx
                ? 'bg-accent border-accent text-white font-bold shadow-none'
                : 'bg-panel border-ink/20 text-ink hover:bg-bg-deep/10'
            }`}
          >
            Group 0{idx + 1}
          </button>
        ))}
      </div>

      {/* Main Inspection Board */}
      <div className="flex-1 p5-panel p-6 rounded flex flex-col justify-between">
        <div>
          <header className="border-b border-ink/20 pb-3 mb-4">
            <h2 className="text-xl font-serif font-bold text-ink">{currentGroup.title}</h2>
            <p className="text-xs text-muted font-sans mt-1">{currentGroup.desc}</p>
          </header>

          <div className="grid grid-cols-4 md:grid-cols-5 gap-4 my-6">
            {charList.map((ch) => {
              const details = consonantsMap[ch];
              const initial = details ? details[2] : '';
              const mnemonic = details ? details[4] : '';

              return (
                <div
                  key={ch}
                  onClick={() => speak(ch)}
                  className="p-4 rounded border-2 border-ink/30 bg-bg-deep/10 hover:border-accent hover:bg-bg-deep/20 cursor-pointer flex flex-col items-center justify-center transition-all group"
                >
                  <ThaiText size={48} className="group-hover:scale-110 transition-transform">
                    {ch}
                  </ThaiText>
                  <span className="text-xs font-mono font-bold text-accent mt-2">
                    /{initial}/
                  </span>
                  {mnemonic && (
                    <span className="text-[11px] font-thai text-muted mt-1">
                      {mnemonic}
                    </span>
                  )}
                  <span className="text-[9px] font-mono text-muted/60 mt-1 uppercase">
                    🔊 Click to hear
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="pt-3 border-t border-ink/10 text-xs font-mono text-muted flex justify-between">
          <span>VISUAL DISCRIMINATION TRAINING</span>
          <span>CLICK ANY CHARACTER TO HEAR SOUND</span>
        </div>
      </div>
    </div>
  );
};
