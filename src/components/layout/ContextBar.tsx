import React from 'react';

interface ContextBarProps {
  leftHints?: string;
  bankedTime?: string;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  leftHints = 'Enter Confirm · Esc Back · ↑↓ Navigate · 1-6 Jump',
  bankedTime = '0h 00m',
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-10 bg-bg-deep/80 backdrop-blur-sm border-t border-muted/20 px-6 flex items-center justify-between text-xs z-50 text-muted font-mono select-none">
      <div className="flex items-center space-x-2">
        <span className="inline-block w-2 h-2 rounded-full bg-accent/80 mr-1" />
        <span>{leftHints}</span>
      </div>
      <div className="flex items-center space-x-2">
        <span>BANKED TIME:</span>
        <span className="font-bold text-text-on-bg">{bankedTime}</span>
      </div>
    </footer>
  );
};
