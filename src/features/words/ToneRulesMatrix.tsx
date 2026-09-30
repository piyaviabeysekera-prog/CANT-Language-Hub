import React, { useState } from 'react';
import { ToneGlyph, ToneClass } from '../../components/audio/ToneGlyph';
import { ThaiText } from '../../components/typography/ThaiText';
import { AudioButton } from '../../components/audio/AudioButton';
import { useSpeech } from '../../hooks/useSpeech';

export const ToneRulesMatrix: React.FC = () => {
  const { speak, isPlaying, rate, setRate } = useSpeech();

  // Interactive Calculator State
  const [consonantClass, setConsonantClass] = useState<'high' | 'mid' | 'low'>('mid');
  const [syllableType, setSyllableType] = useState<'live' | 'dead_short' | 'dead_long'>('live');
  const [toneMark, setToneMark] = useState<'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa'>('none');

  // Compute resulting tone based on canonical Thai tone rules
  const computeTone = (
    cls: 'high' | 'mid' | 'low',
    syl: 'live' | 'dead_short' | 'dead_long',
    mark: 'none' | 'mai_ek' | 'mai_tho' | 'mai_tri' | 'mai_chattawa'
  ): { tone: ToneClass; thaiLabel: string; sample: string } => {
    // 1. With Tone Marks (Marks always override syllable type!)
    if (mark === 'mai_ek') {
      // High -> Low, Mid -> Low, Low -> Falling
      if (cls === 'low') return { tone: 'falling', thaiLabel: 'เสียงโท (Falling)', sample: 'ม่า' };
      return { tone: 'low', thaiLabel: 'เสียงเอก (Low)', sample: cls === 'high' ? 'ข่า' : 'ก่า' };
    }
    if (mark === 'mai_tho') {
      // High -> Falling, Mid -> Falling, Low -> High
      if (cls === 'low') return { tone: 'high', thaiLabel: 'เสียงตรี (High)', sample: 'ม้า' };
      return { tone: 'falling', thaiLabel: 'เสียงโท (Falling)', sample: cls === 'high' ? 'ข้า' : 'ก้า' };
    }
    if (mark === 'mai_tri') {
      // Only Mid class can take Mai Tri legally
      return { tone: 'high', thaiLabel: 'เสียงตรี (High)', sample: 'ก๊า' };
    }
    if (mark === 'mai_chattawa') {
      // Only Mid class can take Mai Chattawa legally
      return { tone: 'rising', thaiLabel: 'เสียงจัตวา (Rising)', sample: 'ก๋า' };
    }

    // 2. Unmarked Syllables (Governed by Class + Live/Dead)
    if (cls === 'high') {
      if (syl === 'live') return { tone: 'rising', thaiLabel: 'เสียงจัตวา (Rising)', sample: 'ขา' };
      return { tone: 'low', thaiLabel: 'เสียงเอก (Low)', sample: 'ขะ' };
    }

    if (cls === 'mid') {
      if (syl === 'live') return { tone: 'mid', thaiLabel: 'เสียงสามัญ (Mid)', sample: 'กา' };
      return { tone: 'low', thaiLabel: 'เสียงเอก (Low)', sample: 'กะ' };
    }

    // Low class
    if (cls === 'low') {
      if (syl === 'live') return { tone: 'mid', thaiLabel: 'เสียงสามัญ (Mid)', sample: 'มา' };
      if (syl === 'dead_short') return { tone: 'high', thaiLabel: 'เสียงตรี (High)', sample: 'มะ' };
      return { tone: 'falling', thaiLabel: 'เสียงโท (Falling)', sample: 'มาก' };
    }

    return { tone: 'mid', thaiLabel: 'เสียงสามัญ (Mid)', sample: 'กา' };
  };

  const result = computeTone(consonantClass, syllableType, toneMark);

  return (
    <div className="flex flex-col space-y-4 h-[68vh] overflow-y-auto pr-1">
      {/* Interactive Calculator Panel */}
      <div className="p5-panel p-6 rounded">
        <header className="border-b border-ink/20 pb-3 mb-4">
          <h2 className="text-xl font-serif font-bold text-ink">
            🎛️ Interactive Tone Rule Calculator
          </h2>
          <p className="text-xs text-muted font-sans mt-0.5">
            Select the syllable parameters to instantly see and hear the resulting pitch contour.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Step 1: Consonant Class */}
          <div>
            <span className="text-xs font-mono font-bold uppercase text-ink block mb-2">
              1. Consonant Class
            </span>
            <div className="flex flex-col space-y-1.5">
              {[
                { id: 'mid', label: 'Mid (กลาง: ก, จ, ด, ต...)' },
                { id: 'high', label: 'High (สูง: ข, ฉ, ถ, ส...)' },
                { id: 'low', label: 'Low (ต่ำ: ค, ช, ท, ม...)' },
              ].map((c) => (
                <button
                  key={c.id}
                  onClick={() => setConsonantClass(c.id as any)}
                  className={`p-2 rounded text-left text-xs font-mono border transition-all ${
                    consonantClass === c.id
                      ? 'bg-accent text-white border-accent font-bold shadow-none'
                      : 'bg-bg-deep/10 text-ink border-ink/20 hover:bg-bg-deep/20'
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 2: Syllable Ending */}
          <div>
            <span className="text-xs font-mono font-bold uppercase text-ink block mb-2">
              2. Syllable Ending Type
            </span>
            <div className="flex flex-col space-y-1.5">
              {[
                { id: 'live', label: 'Live (คำเป็น: Long vowel / m, n, ng)' },
                { id: 'dead_short', label: 'Dead Short (คำตาย: Short vowel / p, t, k)' },
                { id: 'dead_long', label: 'Dead Long (คำตาย: Long vowel + p, t, k)' },
              ].map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSyllableType(s.id as any)}
                  className={`p-2 rounded text-left text-xs font-mono border transition-all ${
                    syllableType === s.id
                      ? 'bg-accent text-white border-accent font-bold shadow-none'
                      : 'bg-bg-deep/10 text-ink border-ink/20 hover:bg-bg-deep/20'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Tone Marker */}
          <div>
            <span className="text-xs font-mono font-bold uppercase text-ink block mb-2">
              3. Tone Marker
            </span>
            <div className="flex flex-col space-y-1.5">
              {[
                { id: 'none', label: 'None (No Mark)' },
                { id: 'mai_ek', label: '่ ไม้เอก (Mai Ek)' },
                { id: 'mai_tho', label: '้ ไม้โท (Mai Tho)' },
                { id: 'mai_tri', label: '๊ ไม้ตรี (Mai Tri)' },
                { id: 'mai_chattawa', label: '๋ ไม้จัตวา (Mai Chattawa)' },
              ].map((m) => (
                <button
                  key={m.id}
                  onClick={() => setToneMark(m.id as any)}
                  className={`p-2 rounded text-left text-xs font-mono border transition-all ${
                    toneMark === m.id
                      ? 'bg-accent text-white border-accent font-bold shadow-none'
                      : 'bg-bg-deep/10 text-ink border-ink/20 hover:bg-bg-deep/20'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Calculation Result Banner */}
        <div className="p-4 rounded-md border-2 border-accent bg-bg-deep/20 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <ToneGlyph tone={result.tone} isPlaying={isPlaying} />
            <div>
              <span className="text-xs font-mono text-muted uppercase block">Calculated Resulting Tone</span>
              <span className="text-lg font-bold font-sans text-accent">{result.thaiLabel}</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <div className="text-right">
              <span className="text-[10px] font-mono text-muted block uppercase">Sample Pronunciation</span>
              <ThaiText size={24}>{result.sample}</ThaiText>
            </div>
            <AudioButton
              onPlay={() => speak(result.sample)}
              isPlaying={isPlaying}
              rate={rate}
              onRateToggle={setRate}
              tone={result.tone}
            />
          </div>
        </div>
      </div>

      {/* Quick Reference Rules Table */}
      <div className="p5-panel p-5 rounded">
        <h3 className="text-sm font-serif font-bold uppercase mb-3 text-ink">
          Canonical Tone Rules Matrix
        </h3>
        <table className="w-full text-xs font-mono border-collapse">
          <thead>
            <tr className="border-b-2 border-ink text-left text-muted">
              <th className="p-2">Consonant Class</th>
              <th className="p-2">Live Syllable</th>
              <th className="p-2">Dead (Short)</th>
              <th className="p-2">Dead (Long)</th>
              <th className="p-2">Mai Ek (่)</th>
              <th className="p-2">Mai Tho (้)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink/10 text-ink">
            <tr>
              <td className="p-2 font-bold text-emerald-800">MID (กลาง)</td>
              <td className="p-2">MID</td>
              <td className="p-2">LOW</td>
              <td className="p-2">LOW</td>
              <td className="p-2">LOW</td>
              <td className="p-2">FALLING</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-amber-800">HIGH (สูง)</td>
              <td className="p-2">RISING</td>
              <td className="p-2">LOW</td>
              <td className="p-2">LOW</td>
              <td className="p-2">LOW</td>
              <td className="p-2">FALLING</td>
            </tr>
            <tr>
              <td className="p-2 font-bold text-cyan-800">LOW (ต่ำ)</td>
              <td className="p-2">MID</td>
              <td className="p-2">HIGH</td>
              <td className="p-2">FALLING</td>
              <td className="p-2">FALLING</td>
              <td className="p-2">HIGH</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};
