import React from 'react';

interface AtlusStarBurstProps {
  className?: string;
}

export const AtlusStarBurst: React.FC<AtlusStarBurstProps> = ({ className = '' }) => {
  return (
    <div
      aria-hidden="true"
      className={`fixed right-0 top-0 bottom-0 w-1/2 pointer-events-none select-none overflow-hidden opacity-20 z-0 ${className}`}
    >
      <svg
        viewBox="0 0 800 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-cover"
      >
        {/* Concentric diamond and star burst lines */}
        <g stroke="var(--crimson)" strokeWidth="1.5" opacity="0.6">
          <circle cx="450" cy="400" r="180" strokeDasharray="6 6" />
          <circle cx="450" cy="400" r="280" />
          <circle cx="450" cy="400" r="380" strokeDasharray="12 12" />
        </g>

        {/* Gunmetal radial spikes */}
        <g stroke="var(--gunmetal)" strokeWidth="2" opacity="0.8">
          <line x1="450" y1="400" x2="80" y2="100" />
          <line x1="450" y1="400" x2="150" y2="40" />
          <line x1="450" y1="400" x2="750" y2="120" />
          <line x1="450" y1="400" x2="820" y2="420" />
          <line x1="450" y1="400" x2="680" y2="720" />
          <line x1="450" y1="400" x2="220" y2="750" />
          <line x1="450" y1="400" x2="50" y2="520" />
        </g>

        {/* Star Polygon Center */}
        <polygon
          points="450,260 480,360 580,360 500,420 530,520 450,460 370,520 400,420 320,360 420,360"
          fill="none"
          stroke="var(--gold)"
          strokeWidth="1.5"
          opacity="0.4"
        />

        {/* Halftone dot matrix accent */}
        <pattern id="atlus-dots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
          <circle cx="3" cy="3" r="2" fill="var(--gunmetal)" opacity="0.5" />
        </pattern>
        <rect width="800" height="800" fill="url(#atlus-dots)" opacity="0.3" />
      </svg>
    </div>
  );
};
