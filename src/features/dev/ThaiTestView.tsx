import React from 'react';
import { ThaiText } from '../../components/typography/ThaiText';

export const ThaiTestView: React.FC = () => {
  // Strings with complex tone marks and stacked vowels
  const testStrings = [
    'สวัสดีครับ (Low tone + vowel combinations)',
    'ไม่เป็นไร (Mai pen rai - Falling tone on Mai)',
    'น้ำดื่มเย็นๆ (Water - High + falling + upper/lower vowels)',
    'ต้มยำกุ้งน้ำใส (Tom Yum soup - falling + rising tone marks)',
    'เก้าอี้ตัวนี้ราคาเท่าไหร่ (Upper vowels, falling & low tones)',
  ];

  const sizes = [24, 32, 48];

  return (
    <div className="p-8 max-w-4xl mx-auto bg-panel text-ink rounded border-2 border-ink shadow-panel">
      <h1 className="text-2xl font-bold font-sans tracking-wide uppercase mb-2">
        🛠️ Thai Typography Tone & Vowel Verification
      </h1>
      <p className="text-sm font-mono text-muted mb-8">
        Route: /dev/thai-test · Design Spec Section 4 Verification Check
      </p>

      <div className="space-y-8">
        {sizes.map((s) => (
          <section key={s} className="border-b border-ink/20 pb-6">
            <h2 className="text-xs font-mono font-bold text-accent uppercase mb-3 tracking-widest">
              Font Size: {s}px (Noto Sans Thai)
            </h2>
            <div className="space-y-4">
              {testStrings.map((str, idx) => (
                <div key={idx} className="flex flex-col">
                  <ThaiText size={s}>{str.split(' ')[0]}</ThaiText>
                  <span className="text-xs font-mono text-muted">{str}</span>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
};
