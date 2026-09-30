import React from 'react';

interface BrushHighlightProps {
  index?: number;
  className?: string;
}

export const BrushHighlight: React.FC<BrushHighlightProps> = ({
  index = 0,
  className = '',
}) => {
  // 3 deterministic SVG brush clip variants
  const variants = [
    'polygon(0% 12%, 98% 3%, 100% 88%, 2% 96%)',
    'polygon(1% 5%, 100% 14%, 97% 94%, 0% 86%)',
    'polygon(2% 8%, 99% 6%, 98% 92%, 1% 95%)',
  ];

  const clipPath = variants[index % variants.length];

  return (
    <div
      className={`absolute inset-0 bg-accent -z-10 transition-all duration-150 pointer-events-none shadow-md ${className}`}
      style={{
        clipPath,
      }}
    />
  );
};
