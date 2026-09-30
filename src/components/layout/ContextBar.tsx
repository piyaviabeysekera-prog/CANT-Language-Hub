import React from 'react';
import { Clock } from 'lucide-react';

interface ContextBarProps {
  leftHints?: string;
  bankedTime?: string;
}

export const ContextBar: React.FC<ContextBarProps> = ({
  leftHints = 'Enter Confirm · Esc Back · [1-7] Direct',
  bankedTime = '0h 00m',
}) => {
  return (
    <footer className="fixed bottom-0 left-0 right-0 h-11 bg-obsidian/95 border-t border-gunmetal px-6 flex items-center justify-between text-xs z-50 text-silver font-mono select-none">
      {/* P5R style Yen / Banked Time display at bottom center-left */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-1.5 px-3 py-1 rounded bg-charcoal border border-gunmetal">
          <Clock className="w-3.5 h-3.5 text-gold" />
          <span className="text-[11px] font-bold text-silver uppercase tracking-wider">
            BANKED TIME:
          </span>
          <span className="font-giant text-lg text-ivory tracking-wide">
            {bankedTime}
          </span>
        </div>
        <span className="text-[10px] text-silver/60 uppercase tracking-widest hidden md:inline">
          REBELLION LEDGER
        </span>
      </div>

      {/* Control hints bottom-right */}
      <div className="flex items-center space-x-3 text-silver/80">
        <span className="text-xs tracking-wider">{leftHints}</span>
      </div>
    </footer>
  );
};
