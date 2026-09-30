import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { ToneGlyph, ToneClass } from './ToneGlyph';

interface AudioButtonProps {
  onPlay: (rate?: number) => void;
  isPlaying?: boolean;
  disabled?: boolean;
  tone?: ToneClass;
  rate?: number;
  onRateToggle?: (newRate: number) => void;
  showRateToggle?: boolean;
  className?: string;
}

export const AudioButton: React.FC<AudioButtonProps> = ({
  onPlay,
  isPlaying = false,
  disabled = false,
  tone,
  rate = 1.0,
  onRateToggle,
  showRateToggle = true,
  className = '',
}) => {
  return (
    <div className={`inline-flex items-center space-x-2 ${className}`}>
      <button
        type="button"
        onClick={() => onPlay(rate)}
        disabled={disabled}
        aria-label="Play native Thai audio"
        className={`p-2.5 rounded border-2 border-ink transition-all ${
          isPlaying
            ? 'bg-accent text-white shadow-none translate-x-[2px] translate-y-[2px]'
            : 'bg-panel text-ink hover:bg-bg-deep/10 shadow-[3px_3px_0_var(--bg-deep)]'
        } ${disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:translate-x-[2px] active:translate-y-[2px]'}`}
      >
        {disabled ? (
          <VolumeX className="w-5 h-5 text-muted" />
        ) : (
          <Volume2 className={`w-5 h-5 ${isPlaying ? 'animate-pulse' : ''}`} />
        )}
      </button>

      {showRateToggle && onRateToggle && !disabled && (
        <button
          type="button"
          onClick={() => onRateToggle(rate === 1.0 ? 0.75 : 1.0)}
          className="px-2 py-1 text-xs font-mono font-bold rounded border border-ink/40 bg-panel text-ink hover:border-ink"
          title="Toggle speed (1.0x / 0.75x Slow Ear-Training)"
        >
          {rate === 1.0 ? '1.0x' : '0.75x SLOW'}
        </button>
      )}

      {tone && <ToneGlyph tone={tone} isPlaying={isPlaying} />}
    </div>
  );
};
