import React from 'react';

interface LightningDividerProps {
  variant?: 0 | 1;
  className?: string;
}

export const LightningDivider: React.FC<LightningDividerProps> = ({
  variant = 0,
  className = '',
}) => {
  // Alternating jagged polygon path
  const points =
    variant === 0
      ? '0,2 60,0 120,4 180,1 240,5 300,2'
      : '0,3 70,5 130,1 190,4 250,0 300,3';

  return (
    <div className={`w-full h-1.5 overflow-hidden my-0.5 select-none pointer-events-none opacity-80 ${className}`}>
      <svg
        viewBox="0 0 300 6"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full stroke-ivory stroke-[1.8]"
        preserveAspectRatio="none"
      >
        <polyline points={points} stroke="var(--ivory)" strokeLinecap="round" strokeLinejoin="miter" />
      </svg>
    </div>
  );
};
