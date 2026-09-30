import React from 'react';

export interface WedgeData {
  giantWord: string;
  thai: string;
  subtitle: string;
}

export const SECTION_WEDGES: Record<string, WedgeData> = {
  '/': { giantWord: 'CANT', thai: 'ค้น', subtitle: 'Ready when you are' },
  '/plan': { giantWord: 'BLUEPRINT', thai: 'แผน', subtitle: "The Rogue's Strategy" },
  '/practice': { giantWord: 'PRACTICE', thai: 'ฝึก', subtitle: 'Start a session' },
  '/words': { giantWord: 'WORDS', thai: 'คำ', subtitle: 'Browse your lexicon' },
  '/skills': { giantWord: 'SKILLS', thai: 'ทักษะ', subtitle: 'See where you stand' },
  '/journal': { giantWord: 'JOURNAL', thai: 'บันทึก', subtitle: "Time you've banked" },
  '/quests': { giantWord: 'QUESTS', thai: 'ภารกิจ', subtitle: 'Take it into the street' },
  '/system': { giantWord: 'SYSTEM', thai: 'ระบบ', subtitle: 'Adjust the room' },
};

interface AtlusWedgeProps {
  currentPath: string;
  className?: string;
}

export const AtlusWedge: React.FC<AtlusWedgeProps> = ({ currentPath, className = '' }) => {
  const data = SECTION_WEDGES[currentPath] || SECTION_WEDGES['/'];

  return (
    <div
      className={`relative select-none pointer-events-none z-10 transition-transform duration-200 ${className}`}
      aria-hidden="true"
    >
      {/* Outer Slanted Wedge Container */}
      <div
        className="relative bg-ivory text-ink shadow-[10px_10px_0_rgba(10,10,10,0.8)] px-8 py-5 flex flex-col justify-between overflow-hidden"
        style={{
          clipPath: 'polygon(0% 4%, 96% 0%, 100% 92%, 4% 100%)',
          minWidth: '380px',
          maxWidth: '520px',
        }}
      >
        {/* Halftone dot pattern gradient overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20"
          style={{
            backgroundImage:
              'radial-gradient(#0A0A0A 1.5px, transparent 1.5px), radial-gradient(#0A0A0A 1.5px, transparent 1.5px)',
            backgroundSize: '12px 12px',
            backgroundPosition: '0 0, 6px 6px',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.05))',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0.8), rgba(0,0,0,0.05))',
          }}
        />

        {/* Diagonal black slash accent */}
        <div
          className="absolute -right-4 -top-8 w-16 h-40 bg-obsidian rotate-12 opacity-90"
          style={{ clipPath: 'polygon(0 0, 100% 0, 80% 100%, 0 80%)' }}
        />

        {/* Main Content Area */}
        <div className="relative z-10">
          {/* Giant Condensed Section Title */}
          <div className="font-giant text-6xl md:text-7xl font-black tracking-tighter text-ink uppercase leading-none transform -skew-x-6">
            {data.giantWord}
          </div>

          {/* Thai Title (32px+ Noto Sans Thai Bold) */}
          <div className="font-thai font-bold text-3xl md:text-4xl text-ink tracking-tight mt-1 opacity-90">
            {data.thai}
          </div>
        </div>

        {/* Subtitle at lower left */}
        <div className="relative z-10 mt-4 pt-2 border-t border-ink/20 flex items-center justify-between">
          <span className="font-condensed font-bold text-xs uppercase tracking-wider text-ink/75">
            {data.subtitle}
          </span>
          <span className="font-mono text-[10px] text-ink/50 uppercase tracking-widest">
            ARCHON 01 // CANT
          </span>
        </div>
      </div>
    </div>
  );
};
