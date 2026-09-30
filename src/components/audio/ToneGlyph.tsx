import React from 'react';

export type ToneClass = 'mid' | 'low' | 'falling' | 'high' | 'rising';

interface ToneGlyphProps {
  tone: ToneClass;
  isPlaying?: boolean;
  className?: string;
}

export const ToneGlyph: React.FC<ToneGlyphProps> = ({
  tone,
  isPlaying = false,
  className = '',
}) => {
  // SVG path coordinates representing pitch contours over time
  const getTonePath = () => {
    switch (tone) {
      case 'mid':
        return 'M 2 12 L 26 12'; // Flat mid
      case 'low':
        return 'M 2 16 L 14 18 L 26 19'; // Dipped low
      case 'falling':
        return 'M 2 6 Q 14 4, 26 20'; // Arched plunge
      case 'high':
        return 'M 2 7 L 14 5 L 26 4'; // High elevated
      case 'rising':
        return 'M 2 18 Q 14 20, 26 6'; // Scooped rising
      default:
        return 'M 2 12 L 26 12';
    }
  };

  return (
    <div
      className={`inline-flex items-center justify-center p-1 rounded bg-bg-deep/20 text-muted ${className}`}
      title={`Tone: ${tone.toUpperCase()}`}
    >
      <svg
        width="28"
        height="24"
        viewBox="0 0 28 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <path
          d={getTonePath()}
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          className={isPlaying ? 'animate-pulse text-accent stroke-[3]' : ''}
        />
      </svg>
      <span className="text-[10px] uppercase font-mono ml-1.5 font-bold tracking-wider">
        {tone}
      </span>
    </div>
  );
};
