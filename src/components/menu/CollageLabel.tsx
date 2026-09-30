import React, { useMemo } from 'react';

interface CollageLabelProps {
  label: string;
  className?: string;
  isSelected?: boolean;
}

// Deterministic pseudo-random number generator from string seed
function seedRandom(seed: number) {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export const CollageLabel: React.FC<CollageLabelProps> = ({
  label,
  className = '',
  isSelected = false,
}) => {
  // If label contains Thai characters, render clean standard text
  const isThai = /[\u0E00-\u0E7F]/.test(label);

  const letters = useMemo(() => {
    if (isThai) return null;

    const fonts = ['font-display', 'font-condensed', 'font-slab'];
    let baseSeed = 0;
    for (let i = 0; i < label.length; i++) {
      baseSeed += label.charCodeAt(i) * (i + 1);
    }

    return label.split('').map((char, idx) => {
      if (char === ' ') return { char: '\u00A0', font: '', rotate: 0, scale: 1, yOffset: 0 };

      const charSeed = baseSeed + idx * 13;
      const r1 = seedRandom(charSeed);
      const r2 = seedRandom(charSeed + 1);
      const r3 = seedRandom(charSeed + 2);

      const font = fonts[Math.floor(r1 * fonts.length)];
      // Rotation between -3.5deg and +3.5deg
      const rotate = isSelected ? (r2 * 2 - 1) * 1.5 : (r2 * 2 - 1) * 3.5;
      const yOffset = (r3 * 2 - 1) * 1.5;

      return {
        char,
        font,
        rotate,
        scale: 1,
        yOffset,
      };
    });
  }, [label, isThai, isSelected]);

  if (isThai || !letters) {
    return <span className={`font-thai font-bold ${className}`}>{label}</span>;
  }

  return (
    <span className={`inline-flex items-baseline tracking-normal uppercase ${className}`}>
      {letters.map((item, idx) => (
        <span
          key={idx}
          className={`inline-block ${item.font} transition-transform duration-150`}
          style={{
            transform: `rotate(${item.rotate}deg) translateY(${item.yOffset}px)`,
          }}
        >
          {item.char}
        </span>
      ))}
    </span>
  );
};
