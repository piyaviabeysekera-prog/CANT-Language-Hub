import React, { useState, useEffect } from 'react';
import { AtlusStarBurst } from '../layout/AtlusStarBurst';

export interface HeroDiscProps {
  poseId?: string;
  className?: string;
  showDisc?: boolean;
  crop?: 'full' | 'waist';
  priority?: boolean;
}

// Map menu views or contexts to their canonical pose IDs
export const POSE_BY_SECTION: Record<string, string> = {
  home: '10-welcome',
  plan: '10-welcome',
  practice: '02-analyze',
  words: '11-investigate',
  skills: '05-reveal',
  journal: '06-reflect',
  quests: '09-walk',
  system: '04-construct',
  victory: '12-victory',
  pause: '01-observe',
};

// All poses to preload for instant zero-flash switching
const PRELOAD_POSES = [
  '10-welcome',
  '02-analyze',
  '11-investigate',
  '05-reveal',
  '06-reflect',
  '09-walk',
  '04-construct',
];

export const HeroDisc: React.FC<HeroDiscProps> = ({
  poseId = '10-welcome',
  className = '',
  showDisc = true,
  crop = 'waist',
  priority = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentPose, setCurrentPose] = useState(poseId);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [framing, setFraming] = useState<'waist' | 'full'>(crop);

  // Preload high-res 5K menu poses on mount (both waist and full variants)
  useEffect(() => {
    PRELOAD_POSES.forEach((id) => {
      const imgWaist = new Image();
      imgWaist.src = `/hero/${id}/figure_waist.webp`;
      const imgFull = new Image();
      imgFull.src = `/hero/${id}/figure@1080.webp`;
    });
  }, []);

  // Keyboard shortcut 'Z' to toggle zoom
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === 'z' || e.key === 'Z') {
        setFraming((prev) => (prev === 'waist' ? 'full' : 'waist'));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle pose transition smoothly (200ms crossfade with 24px slide)
  useEffect(() => {
    if (poseId !== currentPose) {
      setIsTransitioning(true);
      const timer = setTimeout(() => {
        setCurrentPose(poseId);
        setImageError(false);
        setIsTransitioning(false);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [poseId, currentPose]);

  const isWaist = framing === 'waist';
  const figureSrc = isWaist
    ? `/hero/${currentPose}/figure_waist.webp`
    : `/hero/${currentPose}/figure@1080.webp`;
  const figureSrcSet = isWaist
    ? `/hero/${currentPose}/figure_waist.webp 1200w`
    : `/hero/${currentPose}/figure@1080.webp 1200w, /hero/${currentPose}/figure.webp 2000w`;
  const maskSrc = isWaist
    ? `/hero/${currentPose}/mask_waist.webp`
    : `/hero/${currentPose}/mask.webp`;

  return (
    <div
      className={`relative select-none w-full h-full flex items-center justify-center overflow-visible atlus-hero-entrance ${className}`}
    >
      {/* 1. Concentric starburst background (pre-rendered static layer, 15-25% opacity) */}
      <AtlusStarBurst
        className="absolute w-[680px] h-[680px] -right-16 top-1/2 -translate-y-1/2 z-0 opacity-20 pointer-events-none"
      />

      {/* 2. Soft radial gold glow behind head (static layer) */}
      <div
        className="absolute w-[380px] h-[380px] top-[10%] right-[14%] rounded-full z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.32) 0%, rgba(212, 175, 55, 0.10) 45%, transparent 70%)',
          filter: 'blur(24px)',
        }}
      />

      {/* 3. The Atlus Ivory Disc / Ring */}
      {showDisc && (
        <div className="absolute right-6 top-1/2 -translate-y-1/2 w-[460px] h-[460px] lg:w-[520px] lg:h-[520px] rounded-full z-10 overflow-hidden pointer-events-none">
          {/* Solid ivory base circle */}
          <div
            className="w-full h-full rounded-full transition-transform duration-500 ease-out"
            style={{
              backgroundColor: 'var(--ivory)',
              boxShadow: '0 0 40px rgba(0, 0, 0, 0.8), inset 0 0 45px rgba(0, 0, 0, 0.15)',
            }}
          />
          {/* Halftone dot pattern overlay on bottom edge of ivory disc */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage: 'radial-gradient(var(--obsidian) 1.5px, transparent 1.5px)',
              backgroundSize: '12px 12px',
            }}
          />
          {/* Sharp diagonal crimson accent slash across ivory ring */}
          <div
            className="absolute -bottom-10 -right-10 w-[240px] h-[40px] bg-[var(--crimson)] transform -rotate-45 opacity-90 shadow-md"
          />
        </div>
      )}

      {/* 4. The Hero Character Cutout (breaks disc boundaries) */}
      <div
        className={`relative z-20 flex items-end justify-center h-full max-h-[85vh] w-auto transition-all duration-200 ease-out ${
          isTransitioning
            ? 'opacity-0 translate-x-6'
            : 'opacity-100 translate-x-0'
        }`}
        style={{
          transformOrigin: 'bottom center',
        }}
      >
        {!imageError ? (
          <div
            onClick={() => setFraming((prev) => (prev === 'waist' ? 'full' : 'waist'))}
            className={`relative flex items-end cursor-pointer group pointer-events-auto transition-transform duration-300 ${
              isWaist ? 'h-[92%] -translate-y-4' : 'h-[85%]'
            }`}
            title="Click to toggle Dynamic Zoom / Full Body (Hotkey: Z)"
          >
            {/* Outline Mask: 8px dilated silhouette mask tinted with --ivory */}
            <img
              src={maskSrc}
              alt=""
              className="absolute inset-0 w-auto h-full object-contain pointer-events-none select-none opacity-95 brightness-110 filter"
              style={{
                filter: 'drop-shadow(0 0 8px var(--ivory)) drop-shadow(0 0 1px var(--ivory))',
              }}
              onError={() => setImageError(true)}
            />

            {/* The Strategist Cutout (Crisp 5K Master Asset) */}
            <img
              src={figureSrc}
              srcSet={figureSrcSet}
              sizes="(max-width: 1200px) 1200px, 2000px"
              alt="The Strategist - CANT Guide"
              className="relative z-10 w-auto h-full object-contain pointer-events-none select-none drop-shadow-2xl transition-transform duration-200 group-hover:scale-[1.01]"
              loading={priority ? 'eager' : 'lazy'}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          /* Graceful SVG Silhouette Fallback if image asset fails to load */
          <div className="relative w-80 h-[560px] flex items-end justify-center pb-8 z-20 pointer-events-none">
            <svg
              viewBox="0 0 300 600"
              className="w-full h-full drop-shadow-[0_0_12px_var(--ivory)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M 150 40 C 135 40 120 55 120 75 C 120 85 125 95 130 100 L 110 130 L 70 200 L 60 380 L 100 580 L 200 580 L 240 380 L 230 200 L 190 130 L 170 100 C 175 95 180 85 180 75 C 180 55 165 40 150 40 Z"
                fill="var(--ivory)"
              />
              <path
                d="M 150 45 C 138 45 125 58 125 75 C 125 83 129 92 133 97 L 115 125 L 75 195 L 65 375 L 105 575 L 195 575 L 235 375 L 225 195 L 185 125 L 167 97 C 171 92 175 83 175 75 C 175 58 162 45 150 45 Z"
                fill="var(--obsidian)"
              />
              <rect
                x="132"
                y="72"
                width="36"
                height="10"
                rx="2"
                fill="var(--gold)"
                filter="drop-shadow(0 0 6px var(--gold))"
              />
              <path d="M 142 98 L 150 115 L 158 98 Z" fill="var(--ivory)" />
              <path d="M 148 114 L 152 114 L 154 140 L 150 148 L 146 140 Z" fill="var(--crimson)" />
            </svg>
          </div>
        )}
      </div>

      {/* 5. Sleek Atlus Dynamic Zoom Framing Toggle Badge */}
      <div className="absolute bottom-2 right-8 z-30 flex items-center gap-1.5 pointer-events-auto">
        <button
          type="button"
          onClick={() => setFraming((prev) => (prev === 'waist' ? 'full' : 'waist'))}
          className="px-2.5 py-1 bg-obsidian/85 hover:bg-charcoal border border-gold/40 hover:border-gold text-gold font-mono text-[10px] font-bold uppercase tracking-widest shadow-md transition-all flex items-center gap-1.5 rounded-sm"
          title="Toggle Zoom Framing (Hotkey: Z)"
        >
          <span className="text-[9px] text-crimson">◆</span>
          <span>{isWaist ? 'DYNAMIC ZOOM' : 'FULL BODY'}</span>
          <span className="text-[9px] text-silver/60">[Z]</span>
        </button>
      </div>
    </div>
  );
};

export default HeroDisc;
