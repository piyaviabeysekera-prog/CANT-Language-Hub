import React from 'react';

interface HeroArtProps {
  className?: string;
}

export const HeroArt: React.FC<HeroArtProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed right-0 top-0 bottom-10 w-1/3 pointer-events-none select-none overflow-hidden flex items-end justify-end opacity-20 z-0 ${className}`}
    >
      <svg
        viewBox="0 0 500 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="h-full w-auto object-cover stroke-text-on-bg stroke-[1.5]"
      >
        {/* Halftone / geometric dot matrix */}
        <pattern id="halftone" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.5" fill="currentColor" opacity="0.3" />
        </pattern>
        <rect width="500" height="800" fill="url(#halftone)" />

        {/* Stylized Bangkok Spire / Temple silhouette */}
        <path
          d="M 250 80 L 255 180 L 270 240 L 290 320 L 320 450 L 380 750 L 120 750 L 180 450 L 210 320 L 230 240 L 245 180 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <line x1="250" y1="20" x2="250" y2="80" stroke="currentColor" strokeWidth="3" />
        <circle cx="250" cy="20" r="4" fill="currentColor" />

        {/* Diagonal slash accents */}
        <line x1="100" y1="200" x2="400" y2="150" stroke="currentColor" strokeWidth="1" strokeDasharray="4 8" />
        <line x1="80" y1="500" x2="450" y2="440" stroke="currentColor" strokeWidth="1" strokeDasharray="6 10" />
      </svg>
    </div>
  );
};
