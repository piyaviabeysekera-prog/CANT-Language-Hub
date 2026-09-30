import React from 'react';
import { BrushHighlight } from './BrushHighlight';

interface MenuItemProps {
  label: string;
  thaiGhost: string;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onMouseEnter: () => void;
}

export const MenuItem: React.FC<MenuItemProps> = ({
  label,
  thaiGhost,
  index,
  isSelected,
  onSelect,
  onMouseEnter,
}) => {
  return (
    <div
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      role="button"
      tabIndex={0}
      className={`relative px-8 py-3 my-1.5 cursor-pointer select-none transition-all duration-150 flex items-center justify-between text-right outline-none ${
        isSelected
          ? 'scale-105 font-black text-white z-10'
          : 'opacity-70 hover:opacity-100 text-text-on-bg'
      }`}
      style={{
        transform: isSelected ? 'rotate(0deg) scale(1.06)' : 'rotate(-3deg)',
        transformOrigin: 'right center',
      }}
    >
      {isSelected && <BrushHighlight index={index} />}
      
      <span className="text-xs font-mono opacity-40 mr-4 tracking-widest uppercase">
        0{index + 1}
      </span>

      <div className="flex items-baseline space-x-3">
        <span className="text-2xl tracking-wider uppercase font-sans font-bold">
          {label}
        </span>
        <span
          lang="th"
          className="text-sm font-thai opacity-50"
        >
          {thaiGhost}
        </span>
      </div>
    </div>
  );
};
