import React from 'react';

interface ThaiTextProps {
  children: React.ReactNode;
  size?: number | string;
  serif?: boolean;
  className?: string;
}

export const ThaiText: React.FC<ThaiTextProps> = ({
  children,
  size = 32,
  serif = false,
  className = '',
}) => {
  const fontSize = typeof size === 'number' ? `${Math.max(size, 24)}px` : size;

  return (
    <span
      lang="th"
      className={`inline-block ${serif ? 'font-thai-serif' : 'font-thai'} ${className}`}
      style={{
        fontSize,
        lineHeight: 1.7,
        letterSpacing: 'normal',
        fontKerning: 'normal',
        textRendering: 'optimizeLegibility',
        transform: 'none',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {children}
    </span>
  );
};
