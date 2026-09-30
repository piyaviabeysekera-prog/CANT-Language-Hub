import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AtlusWedge } from '../../components/layout/AtlusWedge';
import { HeroDisc } from '../../components/hero/HeroDisc';
import { useMenu } from '../../app/menuContext';

const POSE_MAP: Record<string, string> = {
  '/': '10-welcome',
  '/plan': '10-welcome',
  '/practice': '02-analyze',
  '/words': '11-investigate',
  '/skills': '05-reveal',
  '/journal': '06-reflect',
  '/quests': '09-walk',
  '/system': '04-construct',
};

export const HomeView: React.FC = () => {
  const navigate = useNavigate();
  const { hoveredPath, setHoveredPath } = useMenu();

  const activePath = hoveredPath || '/';
  const activePose = POSE_MAP[activePath] || '10-welcome';

  return (
    <div className="relative w-full min-h-[calc(100vh-140px)] flex flex-col lg:flex-row items-center justify-between gap-8 py-2">
      {/* Left / Center Column: Atlus Wedge + Mission Launch Dossier */}
      <div className="flex-1 max-w-xl z-20 flex flex-col justify-center">
        {/* Atlus Wedge Banner (Syncs dynamically with hovered or selected section) */}
        <div className="mb-6 atlus-wedge-entrance">
          <AtlusWedge currentPath={activePath} />
        </div>

        {/* Quick Launch Mission Calling Cards (Preserving all functional entry points) */}
        <div
          className="flex flex-col space-y-2.5"
          onMouseLeave={() => setHoveredPath(null)}
        >
          {/* 1. Learning Plan & Protocol */}
          <button
            type="button"
            onClick={() => navigate('/plan')}
            onMouseEnter={() => setHoveredPath('/plan')}
            className={`group relative text-left py-3 px-4 bg-gunmetal hover:bg-charcoal border-l-4 shadow-[4px_4px_0_rgba(0,0,0,0.6)] transition-all duration-150 transform hover:-translate-y-0.5 flex items-center justify-between ${
              activePath === '/plan' ? 'border-gold bg-charcoal' : 'border-crimson'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-condensed font-bold text-base text-ivory tracking-wide group-hover:text-gold transition-colors flex items-center gap-2">
                <span className="text-crimson font-black">▶</span> 📍 Start Here: Learning Plan & Session Protocol
              </span>
              <span className="text-[11px] font-sans text-silver opacity-80 mt-0.5">
                The Rogue's Strategy: 4-week roadmap & daily deliberate practice blueprint
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-gold px-2 py-0.5 border border-gold/40 bg-obsidian/60 uppercase tracking-widest ml-3">
              BLUEPRINT
            </span>
          </button>

          {/* 2. Daily Practice Drills */}
          <button
            type="button"
            onClick={() => navigate('/practice')}
            onMouseEnter={() => setHoveredPath('/practice')}
            className={`group relative text-left py-3 px-4 bg-charcoal hover:bg-gunmetal border-l-4 shadow-[4px_4px_0_rgba(0,0,0,0.6)] transition-all duration-150 transform hover:-translate-y-0.5 flex items-center justify-between ${
              activePath === '/practice' ? 'border-gold bg-gunmetal' : 'border-silver/40'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-condensed font-bold text-base text-ivory tracking-wide group-hover:text-gold transition-colors flex items-center gap-2">
                <span className="text-silver group-hover:text-gold">▶</span> Daily Practice Drills
              </span>
              <span className="text-[11px] font-sans text-silver opacity-80 mt-0.5">
                FSRS Spaced Repetition across Ear, Mouth, and Script tracks
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-silver group-hover:text-gold px-2 py-0.5 border border-silver/30 bg-obsidian/60 uppercase tracking-widest ml-3">
              RETURN
            </span>
          </button>

          {/* 3. Consonants & Vowels Charts */}
          <button
            type="button"
            onClick={() => navigate('/words')}
            onMouseEnter={() => setHoveredPath('/words')}
            className={`group relative text-left py-3 px-4 bg-charcoal hover:bg-gunmetal border-l-4 shadow-[4px_4px_0_rgba(0,0,0,0.6)] transition-all duration-150 transform hover:-translate-y-0.5 flex items-center justify-between ${
              activePath === '/words' ? 'border-gold bg-gunmetal' : 'border-silver/40'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-condensed font-bold text-base text-ivory tracking-wide group-hover:text-gold transition-colors flex items-center gap-2">
                <span className="text-silver group-hover:text-gold">▶</span> 44 Consonants & 52 Vowels Charts
              </span>
              <span className="text-[11px] font-sans text-silver opacity-80 mt-0.5">
                Complete phonetic reference with instant native audio & class tags
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-silver group-hover:text-gold px-2 py-0.5 border border-silver/30 bg-obsidian/60 uppercase tracking-widest ml-3">
              ALPHABET
            </span>
          </button>

          {/* 4. Tone Rules Calculator */}
          <button
            type="button"
            onClick={() => navigate('/words')}
            onMouseEnter={() => setHoveredPath('/words')}
            className={`group relative text-left py-3 px-4 bg-charcoal hover:bg-gunmetal border-l-4 shadow-[4px_4px_0_rgba(0,0,0,0.6)] transition-all duration-150 transform hover:-translate-y-0.5 flex items-center justify-between ${
              activePath === '/words' ? 'border-gold bg-gunmetal' : 'border-silver/40'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-condensed font-bold text-base text-ivory tracking-wide group-hover:text-gold transition-colors flex items-center gap-2">
                <span className="text-silver group-hover:text-gold">▶</span> Interactive Tone Rules Calculator
              </span>
              <span className="text-[11px] font-sans text-silver opacity-80 mt-0.5">
                Deterministic 5-rule matrix: class + mark + vowel length + syllable ending
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-silver group-hover:text-gold px-2 py-0.5 border border-silver/30 bg-obsidian/60 uppercase tracking-widest ml-3">
              CALCULATE
            </span>
          </button>

          {/* 5. Real-World Field Missions */}
          <button
            type="button"
            onClick={() => navigate('/quests')}
            onMouseEnter={() => setHoveredPath('/quests')}
            className={`group relative text-left py-3 px-4 bg-charcoal hover:bg-gunmetal border-l-4 shadow-[4px_4px_0_rgba(0,0,0,0.6)] transition-all duration-150 transform hover:-translate-y-0.5 flex items-center justify-between ${
              activePath === '/quests' ? 'border-gold bg-gunmetal' : 'border-silver/40'
            }`}
          >
            <div className="flex flex-col">
              <span className="font-condensed font-bold text-base text-ivory tracking-wide group-hover:text-gold transition-colors flex items-center gap-2">
                <span className="text-silver group-hover:text-gold">▶</span> Real-World Field Missions (Gym & Street)
              </span>
              <span className="text-[11px] font-sans text-silver opacity-80 mt-0.5">
                Level-up Courage & Charm in authentic Bangkok environments
              </span>
            </div>
            <span className="font-mono text-xs font-bold text-silver group-hover:text-gold px-2 py-0.5 border border-silver/30 bg-obsidian/60 uppercase tracking-widest ml-3">
              FIELD
            </span>
          </button>
        </div>
      </div>

      {/* Right Column: Atlus Hero Disc with The Strategist */}
      <div className="flex-1 w-full max-w-lg lg:max-w-xl h-[560px] lg:h-[660px] relative z-10 flex items-center justify-center">
        <HeroDisc
          poseId={activePose}
          showDisc={true}
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default HomeView;
