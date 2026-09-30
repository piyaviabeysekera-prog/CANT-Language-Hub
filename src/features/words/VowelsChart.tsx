import React, { useState } from 'react';
import vowelsData from '../../data/vowels.json';
import { ThaiText } from '../../components/typography/ThaiText';
import { AudioButton } from '../../components/audio/AudioButton';
import { useSpeech } from '../../hooks/useSpeech';

interface VowelItem {
  vowel: string;
  examples: string[];
  pronunciation: [string, string];
}

export const VowelsChart: React.FC = () => {
  const { speak, isPlaying, rate, setRate } = useSpeech();
  const vowels = vowelsData as VowelItem[];
  const [selectedVowel, setSelectedVowel] = useState<VowelItem>(vowels[0]);

  // Clean utterance helper: synthesize vowel cleanly with consonant anchor 'อ'
  const speakVowel = (vowelStr: string) => {
    const clean = vowelStr.replace('-', '');
    speak(clean);
  };

  return (
    <div className="flex space-x-6 h-[68vh]">
      {/* Left Column: Vowels Grid */}
      <div className="w-3/5 flex flex-col p5-panel p-4 rounded overflow-hidden">
        <header className="pb-3 border-b border-ink/10 mb-3 flex justify-between items-center">
          <span className="text-xs font-mono font-bold uppercase text-ink">
            Vowel Patterns ({vowels.length})
          </span>
          <span className="text-[10px] font-mono text-muted uppercase">
            Click to Hear Sound
          </span>
        </header>

        <div className="flex-1 overflow-y-auto grid grid-cols-4 gap-2 pr-1 content-start">
          {vowels.map((item, idx) => {
            const isSelected = selectedVowel.vowel === item.vowel;
            return (
              <button
                key={idx}
                onClick={() => {
                  setSelectedVowel(item);
                  speakVowel(item.vowel);
                }}
                className={`p-2.5 rounded border-2 flex flex-col items-center justify-center transition-all ${
                  isSelected
                    ? 'border-accent bg-accent text-white shadow-none translate-x-[1px] translate-y-[1px]'
                    : 'border-ink/20 bg-bg-deep/10 hover:border-ink/60 text-ink'
                }`}
              >
                <ThaiText size={22}>{item.vowel}</ThaiText>
                <span className="text-[10px] font-mono mt-1 opacity-70">
                  /{item.pronunciation[0]}/
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Right Column: Vowel Inspector */}
      <div className="w-2/5 p5-panel p-6 rounded flex flex-col justify-between">
        {selectedVowel ? (
          <div>
            <header className="border-b border-ink/20 pb-4 mb-4 flex justify-between items-start">
              <div>
                <ThaiText size={52}>{selectedVowel.vowel}</ThaiText>
                <div className="mt-1 font-mono text-sm text-accent font-bold">
                  IPA: /{selectedVowel.pronunciation[0]}/ · Paiboon: {selectedVowel.pronunciation[1]}
                </div>
              </div>
              <AudioButton
                onPlay={() => speakVowel(selectedVowel.vowel)}
                isPlaying={isPlaying}
                rate={rate}
                onRateToggle={setRate}
              />
            </header>

            <section className="space-y-4">
              <div>
                <span className="text-xs font-mono uppercase text-muted block mb-2">
                  Sample Words Containing This Vowel
                </span>
                <div className="space-y-2">
                  {selectedVowel.examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 bg-bg-deep/10 rounded border border-ink/10 flex items-center justify-between"
                    >
                      <ThaiText size={22}>{ex}</ThaiText>
                      <button
                        onClick={() => speak(ex)}
                        className="px-2.5 py-1 text-xs font-mono rounded border border-ink hover:bg-bg-deep/20 text-ink"
                      >
                        🔊 Listen
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        ) : null}

        <div className="pt-3 border-t border-ink/10 text-[11px] font-mono text-muted flex justify-between">
          <span>VOWEL FORMATION</span>
          <span>52 PATTERNS</span>
        </div>
      </div>
    </div>
  );
};
