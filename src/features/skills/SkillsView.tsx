import React, { useState, useEffect } from 'react';
import { computeSkillLevels, SkillLevels } from './levels';

export const SkillsView: React.FC = () => {
  const [skills, setSkills] = useState<SkillLevels | null>(null);

  useEffect(() => {
    async function loadStats() {
      const data = await computeSkillLevels();
      setSkills(data);
    }
    loadStats();
  }, []);

  if (!skills) {
    return <div className="text-muted font-mono text-sm">Computing competency levels...</div>;
  }

  const statItems = [
    { id: 'tones', label: 'Tones', thai: 'วรรณยุกต์', data: skills.tones, desc: 'Pitch contour discrimination & inflection accuracy' },
    { id: 'reading', label: 'Reading', thai: 'การอ่าน', data: skills.reading, desc: 'Speed of grapheme decoding & word boundary identification' },
    { id: 'listening', label: 'Listening', thai: 'การฟัง', data: skills.listening, desc: 'Acoustic comprehension under native conversational speed' },
    { id: 'speaking', label: 'Speaking', thai: 'การพูด', data: skills.speaking, desc: 'Active motor production latency & phonemic muscle memory' },
    { id: 'vocabulary', label: 'Vocabulary', thai: 'คำศัพท์', data: skills.vocabulary, desc: 'Active retrieval inventory with FSRS stability > 3 days' },
  ];

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wide text-text-on-bg">
          Competency Matrix
        </h1>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mt-1">
          Whose Stats? · Recomputed silently from study records
        </p>
      </header>

      <div className="space-y-4">
        {statItems.map((stat) => {
          const progressPercent = (stat.data.progress / stat.data.max) * 100;

          return (
            <div
              key={stat.id}
              className="p5-panel p-4 rounded flex flex-col space-y-2 transition-transform hover:-translate-x-1"
            >
              <div className="flex justify-between items-baseline">
                <div className="flex items-baseline space-x-3">
                  <span className="font-sans font-bold text-lg uppercase tracking-wide text-ink">
                    {stat.label}
                  </span>
                  <span lang="th" className="text-xs font-thai text-muted opacity-60">
                    {stat.thai}
                  </span>
                </div>
                <div className="flex items-baseline space-x-1.5 font-mono">
                  <span className="text-xs text-muted">LVL</span>
                  <span className="text-xl font-bold text-accent">{stat.data.level}</span>
                </div>
              </div>

              {/* Thin level progress bar */}
              <div className="h-1.5 w-full bg-ink/10 rounded overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[11px] text-muted font-mono pt-1">
                <span>{stat.desc}</span>
                <span>{stat.data.progress} / {stat.data.max} XP</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
