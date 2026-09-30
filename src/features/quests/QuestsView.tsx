import React, { useState, useEffect } from 'react';
import { db, QuestRecord } from '../../data/db';
import { CheckSquare, Square } from 'lucide-react';

export const QuestsView: React.FC = () => {
  const [quests, setQuests] = useState<QuestRecord[]>([]);

  const loadQuests = async () => {
    const list = await db.quests.toArray();
    setQuests(list);
  };

  useEffect(() => {
    loadQuests();
  }, []);

  const toggleQuest = async (q: QuestRecord) => {
    const updatedDone = !q.done;
    await db.quests.update(q.id, {
      done: updatedDone,
      doneAt: updatedDone ? new Date() : undefined,
    });
    loadQuests();
  };

  const updateNote = async (id: string, note: string) => {
    await db.quests.update(id, { note });
    loadQuests();
  };

  return (
    <div className="max-w-3xl">
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wide text-text-on-bg">
          Real-World Field Quests
        </h1>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mt-1">
          Principle of Directness · Self-reported street & gym missions
        </p>
      </header>

      <div className="space-y-3">
        {quests.map((q) => (
          <div
            key={q.id}
            className={`p5-panel p-4 rounded flex flex-col space-y-2 transition-all ${
              q.done ? 'opacity-60 bg-bg-deep/10' : ''
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={() => toggleQuest(q)}
                  className="text-accent hover:opacity-80 transition-opacity"
                  aria-label={q.done ? 'Mark incomplete' : 'Mark complete'}
                >
                  {q.done ? (
                    <CheckSquare className="w-5 h-5" />
                  ) : (
                    <Square className="w-5 h-5 text-ink/60" />
                  )}
                </button>
                <span
                  className={`font-sans font-bold text-sm text-ink ${
                    q.done ? 'line-through text-muted' : ''
                  }`}
                >
                  {q.title}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase bg-bg-deep/20 text-muted">
                {q.category}
              </span>
            </div>

            {/* Reflection note input */}
            <div className="pl-8 pt-1">
              <input
                type="text"
                value={q.note || ''}
                onChange={(e) => updateNote(q.id, e.target.value)}
                placeholder="How did it go? (e.g. 'Used at Sitjaroonsak, coach nodded and corrected my stance')"
                className="w-full text-xs font-mono bg-bg-deep/10 border-b border-ink/20 focus:border-accent p-1 outline-none text-ink placeholder:text-muted/60"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
