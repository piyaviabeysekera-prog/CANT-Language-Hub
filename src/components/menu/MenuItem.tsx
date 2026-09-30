import React from 'react';
import { CollageLabel } from './CollageLabel';

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
  // Alternate unselected tilt: odd rows -3deg, even rows -2deg
  const tiltDeg = isSelected ? 0 : index % 2 === 0 ? -2.5 : -4;

  return (
    <div
      onClick={onSelect}
      onMouseEnter={onMouseEnter}
      role="button"
      tabIndex={0}
      className={`relative my-1 cursor-pointer select-none transition-all duration-150 outline-none group ${
        isSelected ? 'z-20' : 'z-10'
      }`}
      style={{
        transform: `rotate(${tiltDeg}deg) ${isSelected ? 'scale(1.05) translateX(-8px)' : 'scale(1.0)'}`,
        transformOrigin: 'right center',
      }}
    >
      {/* Gold offset shadow slab behind selected crimson slab */}
      {isSelected && (
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gold translate-x-2 translate-y-1.5 rounded-sm z-0"
          style={{
            clipPath: 'polygon(6% 0%, 100% 0%, 96% 100%, 0% 100%)',
          }}
        />
      )}

      {/* Main Slab */}
      <div
        className={`relative z-10 px-6 py-2.5 flex items-center justify-between transition-colors duration-150 ${
          isSelected
            ? 'bg-crimson text-ivory font-black shadow-lg'
            : 'bg-gunmetal/90 hover:bg-charcoal text-silver border-y border-charcoal/80'
        }`}
        style={{
          clipPath: isSelected
            ? 'polygon(6% 0%, 100% 0%, 96% 100%, 0% 100%)'
            : 'polygon(4% 0%, 100% 0%, 98% 100%, 0% 100%)',
        }}
      >
        {/* Index numeral (meets minimum #8A8A8A contrast requirement) */}
        <span
          className={`text-xs font-mono font-bold tracking-widest uppercase mr-3 ${
            isSelected ? 'text-ivory/80' : 'text-[#8A8A8A]'
          }`}
        >
          0{index + 1}
        </span>

        {/* Labels: English Collage + Thai Ghost */}
        <div className="flex items-baseline space-x-3 text-right">
          <CollageLabel
            label={label}
            isSelected={isSelected}
            className={`text-xl md:text-2xl font-bold tracking-wider uppercase transition-colors ${
              isSelected ? 'text-ivory' : 'text-silver group-hover:text-ivory'
            }`}
          />
          <span
            lang="th"
            className={`text-sm font-thai font-semibold transition-opacity ${
              isSelected ? 'text-ivory/90 opacity-100' : 'text-silver/60 opacity-60'
            }`}
          >
            {thaiGhost}
          </span>
        </div>
      </div>
    </div>
  );
};
