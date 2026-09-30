import React from 'react';

interface GhostWordProps {
  word: string;
}

export const GhostWord: React.FC<GhostWordProps> = ({ word }) => {
  return (
    <div
      aria-hidden="true"
      className="fixed -bottom-10 right-4 pointer-events-none select-none z-0 overflow-hidden"
      style={{
        opacity: 0.08,
      }}
    >
      <span
        lang="th"
        className="font-thai font-bold text-[18vw] leading-none text-text-on-bg"
      >
        {word}
      </span>
    </div>
  );
};
