import React, { useState, useEffect } from 'react';
import { db, SessionRecord } from '../../data/db';
import { Plus } from 'lucide-react';

export const JournalView: React.FC = () => {
  const [sessions, setSessions] = useState<SessionRecord[]>([]);
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [showAddModal, setShowAddModal] = useState(false);
  const [manualMinutes, setManualMinutes] = useState(30);
  const [manualNote, setManualNote] = useState('');

  const loadData = async () => {
    const list = await db.sessions.reverse().toArray();
    setSessions(list);
    const ms = list.reduce((sum, s) => sum + (s.activeMs || 0), 0);
    setTotalMinutes(Math.floor(ms / 60000));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddManualTime = async () => {
    if (manualMinutes <= 0) return;
    await db.sessions.add({
      startedAt: new Date(),
      endedAt: new Date(),
      activeMs: manualMinutes * 60000,
      kind: 'manual',
      wordIds: [],
      manual: true,
      note: manualNote || 'Offline conversational practice / Muay Thai gym',
    });
    setShowAddModal(false);
    setManualNote('');
    loadData();
  };

  const hours = Math.floor(totalMinutes / 60);
  const mins = totalMinutes % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');

  // Simple 28-day calendar tiles
  const today = new Date();
  const pastDays = Array.from({ length: 28 }, (_, i) => {
    const d = new Date();
    d.setDate(today.getDate() - (27 - i));
    const dayStr = d.toISOString().split('T')[0];
    const sessionForDay = sessions.find((s) => s.startedAt.toISOString().split('T')[0] === dayStr);
    const dayMins = sessionForDay ? Math.floor(sessionForDay.activeMs / 60000) : 0;
    return { date: dayStr, dayMins };
  });

  return (
    <div className="max-w-3xl">
      <header className="mb-6 flex justify-between items-baseline">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-muted block mb-1">
            Lifetime Banked Investment
          </span>
          <h1 className="text-4xl font-serif font-bold text-text-on-bg tracking-tight">
            {hours}h {pad(mins)}m
          </h1>
        </div>

        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-1.5 px-3 py-1.5 rounded border border-muted/30 hover:border-accent text-xs font-mono text-text-on-bg"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Offline Time</span>
        </button>
      </header>

      {/* Clean Calendar Matrix (Days without study are plain and empty - zero guilt) */}
      <section className="p5-panel p-5 rounded mb-8">
        <h2 className="text-xs font-mono uppercase text-muted tracking-wider mb-3">
          Activity Ledger (Last 28 Days)
        </h2>
        <div className="grid grid-cols-7 gap-2">
          {pastDays.map((d, idx) => {
            const hasActivity = d.dayMins > 0;
            return (
              <div
                key={idx}
                title={`${d.date}: ${d.dayMins} min`}
                className={`h-9 rounded border flex items-center justify-center text-[10px] font-mono transition-colors ${
                  hasActivity
                    ? 'bg-accent/80 border-accent text-white font-bold'
                    : 'bg-bg-deep/10 border-ink/10 text-muted/40'
                }`}
              >
                {hasActivity ? `${d.dayMins}m` : ''}
              </div>
            );
          })}
        </div>
      </section>

      {/* Session History Log */}
      <section>
        <h2 className="text-xs font-mono uppercase text-muted tracking-wider mb-3">
          Recorded Sessions
        </h2>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {sessions.length === 0 ? (
            <div className="text-xs font-mono text-muted py-4">No sessions recorded yet.</div>
          ) : (
            sessions.map((s, idx) => (
              <div
                key={idx}
                className="p5-panel-sm p-3 rounded flex justify-between items-center text-xs"
              >
                <div className="flex flex-col">
                  <span className="font-mono font-bold text-ink">
                    {s.startedAt.toISOString().split('T')[0]} · {s.kind.toUpperCase()}
                  </span>
                  <span className="text-[11px] text-muted truncate max-w-sm mt-0.5">
                    {s.note || `${s.wordIds.length} words touched`}
                  </span>
                </div>
                <span className="font-mono font-bold text-accent">
                  {Math.round(s.activeMs / 60000)} min
                </span>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Manual Time Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="p5-panel p-6 rounded max-w-md w-full">
            <h3 className="text-lg font-bold font-serif mb-4 uppercase">Log Offline Practice</h3>
            <div className="space-y-4 font-sans text-sm">
              <div>
                <label className="text-xs font-mono text-muted uppercase block mb-1">
                  Minutes Practiced
                </label>
                <input
                  type="number"
                  min="5"
                  step="5"
                  value={manualMinutes}
                  onChange={(e) => setManualMinutes(parseInt(e.target.value, 10))}
                  className="w-full p-2 border border-ink rounded bg-panel font-mono text-ink"
                />
              </div>
              <div>
                <label className="text-xs font-mono text-muted uppercase block mb-1">
                  Activity Notes
                </label>
                <textarea
                  rows={3}
                  value={manualNote}
                  onChange={(e) => setManualNote(e.target.value)}
                  placeholder="Street conversation, ordering food, Muay Thai gym sparring calls..."
                  className="w-full p-2 border border-ink rounded bg-panel text-ink text-xs font-sans"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-1.5 border border-ink rounded font-mono text-xs"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleAddManualTime}
                  className="px-4 py-1.5 bg-accent text-white font-mono text-xs font-bold rounded"
                >
                  Confirm & Bank
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
