import React from 'react';
import { useNavigate } from 'react-router-dom';

export const HomeView: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col justify-center min-h-[60vh] max-w-xl">
      <header className="mb-8">
        <div className="inline-block px-2.5 py-0.5 rounded text-xs font-mono font-bold tracking-widest uppercase bg-accent/15 text-accent mb-3 border border-accent/30">
          CANT // THE THIEVES' TONGUE
        </div>
        <h1 className="text-4xl font-serif font-bold tracking-tight text-text-on-bg mb-3">
          Ready when you are.
        </h1>
        <p className="text-base text-muted font-sans font-normal leading-relaxed">
          The rogue's secret dialect for surviving and moving unseen in Thailand. Pick your path into today's focus.
        </p>
      </header>

      <div className="flex flex-col space-y-2.5 pt-4 border-t border-muted/20">
        <button
          type="button"
          onClick={() => navigate('/plan')}
          className="text-left py-2.5 px-4 rounded border border-accent/40 hover:border-accent bg-accent/10 hover:bg-accent/20 text-text-on-bg transition-colors flex items-center justify-between group"
        >
          <span className="font-sans font-semibold text-accent group-hover:text-accent-bright transition-colors">
            📍 Start Here: Learning Plan & Session Protocol
          </span>
          <span className="text-xs font-mono text-accent uppercase">Blueprint</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/practice')}
          className="text-left py-2.5 px-4 rounded border border-muted/20 hover:border-accent bg-bg-deep/30 hover:bg-bg-deep/50 text-text-on-bg transition-colors flex items-center justify-between group"
        >
          <span className="font-sans font-semibold group-hover:text-accent transition-colors">
            Daily Practice Drills
          </span>
          <span className="text-xs font-mono text-muted uppercase">Return</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/words')}
          className="text-left py-2.5 px-4 rounded border border-muted/20 hover:border-accent bg-bg-deep/30 hover:bg-bg-deep/50 text-text-on-bg transition-colors flex items-center justify-between group"
        >
          <span className="font-sans font-semibold group-hover:text-accent transition-colors">
            44 Consonants & 52 Vowels Charts
          </span>
          <span className="text-xs font-mono text-muted uppercase">Alphabet</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/words')}
          className="text-left py-2.5 px-4 rounded border border-muted/20 hover:border-accent bg-bg-deep/30 hover:bg-bg-deep/50 text-text-on-bg transition-colors flex items-center justify-between group"
        >
          <span className="font-sans font-semibold group-hover:text-accent transition-colors">
            Interactive Tone Rules Calculator
          </span>
          <span className="text-xs font-mono text-muted uppercase">Calculate</span>
        </button>

        <button
          type="button"
          onClick={() => navigate('/quests')}
          className="text-left py-2.5 px-4 rounded border border-muted/20 hover:border-accent bg-bg-deep/30 hover:bg-bg-deep/50 text-text-on-bg transition-colors flex items-center justify-between group"
        >
          <span className="font-sans font-semibold group-hover:text-accent transition-colors">
            Real-World Field Missions (Gym & Street)
          </span>
          <span className="text-xs font-mono text-muted uppercase">Field</span>
        </button>
      </div>
    </div>
  );
};
