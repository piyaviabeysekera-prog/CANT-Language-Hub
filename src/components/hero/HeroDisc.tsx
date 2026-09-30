import React, { useState, useEffect } from 'react';
import { AtlusStarBurst } from '../layout/AtlusStarBurst';

export interface HeroDiscProps {
  poseId?: string;
  className?: string;
  showDisc?: boolean;
  crop?: 'full' | 'waist' | 'bust';
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
  crop = 'full',
  priority = true,
}) => {
  const [imageError, setImageError] = useState(false);
  const [currentPose, setCurrentPose] = useState(poseId);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Preload menu poses on mount
  useEffect(() => {
    PRELOAD_POSES.forEach((id) => {
      const img = new Image();
      img.src = `/hero/${id}/figure@1080.webp`;
    });
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

  const figureSrc = `/hero/${currentPose}/figure@1080.webp`;
  const figureSrcSet = `/hero/${currentPose}/figure@1080.webp 1080w, /hero/${currentPose}/figure.webp 1600w`;
  const maskSrc = `/hero/${currentPose}/mask.webp`;

  return (
    <div
      className={`relative select-none pointer-events-none w-full h-full flex items-center justify-center overflow-visible atlus-hero-entrance ${className}`}
      aria-hidden="true"
    >
      {/* 1. Concentric starburst background (pre-rendered static layer, 15-25% opacity) */}
      <AtlusStarBurst
        className="absolute w-[680px] h-[680px] -right-16 top-1/2 -translate-y-1/2 z-0 opacity-20 pointer-events-none"
      />

      {/* 2. Soft radial gold glow behind head (static layer) */}
      <div
        className="absolute w-[360px] h-[360px] top-[14%] right-[16%] rounded-full z-10 pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.28) 0%, rgba(212, 175, 55, 0.08) 45%, transparent 70%)',
          filter: 'blur(20px)',
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
              boxShadow: '0 0 35px rgba(0, 0, 0, 0.7), inset 0 0 40px rgba(0, 0, 0, 0.12)',
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
          <div className="relative h-full flex items-end">
            {/* Outline Mask: 8px dilated silhouette mask tinted with --ivory */}
            <img
              src={maskSrc}
              alt=""
              className="absolute inset-0 w-auto h-full object-contain pointer-events-none select-none opacity-90 brightness-110 filter"
              style={{
                filter: 'drop-shadow(0 0 6px var(--ivory)) drop-shadow(0 0 1px var(--ivory))',
              }}
              onError={() => setImageError(true)}
            />

            {/* The Strategist Cutout */}
            <img
              src={figureSrc}
              srcSet={figureSrcSet}
              sizes="(max-width: 1200px) 1080px, 1600px"
              alt="The Strategist - CANT Guide"
              className="relative z-10 w-auto h-full max-h-[85vh] object-contain pointer-events-none select-none drop-shadow-2xl"
              loading={priority ? 'eager' : 'lazy'}
              onError={() => setImageError(true)}
            />
          </div>
        ) : (
          /* Graceful SVG Silhouette Fallback if image asset fails to load */
          <div className="relative w-80 h-[560px] flex items-end justify-center pb-8 z-20">
            <svg
              viewBox="0 0 300 600"
              className="w-full h-full drop-shadow-[0_0_12px_var(--ivory)]"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Dilated outline path */}
              <path
                d="M 150 40 C 135 40 120 55 120 75 C 120 85 125 95 130 100 L 110 130 L 70 200 L 60 380 L 100 580 L 200 580 L 240 380 L 230 200 L 190 130 L 170 100 C 175 95 180 85 180 75 C 180 55 165 40 150 40 Z"
                fill="var(--ivory)"
              />
              {/* Dark coat silhouette */}
              <path
                d="M 150 45 C 138 45 125 58 125 75 C 125 83 129 92 133 97 L 115 125 L 75 195 L 65 375 L 105 575 L 195 575 L 235 375 L 225 195 L 185 125 L 167 97 C 171 92 175 83 175 75 C 175 58 162 45 150 45 Z"
                fill="var(--obsidian)"
              />
              {/* Reflective Gold Visor */}
              <rect
                x="132"
                y="72"
                width="36"
                height="10"
                rx="2"
                fill="var(--gold)"
                filter="drop-shadow(0 0 6px var(--gold))"
              />
              {/* White collar detail */}
              <path
                d="M 142 98 L 150 115 L 158 98 Z"
                fill="var(--ivory)"
              />
              {/* Crimson Tie */}
              <path
                d="M 148 114 L 152 114 L 154 140 L 150 148 L 146 140 Z"
                fill="var(--crimson)"
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroDisc;
