import React, { useState, useEffect } from 'react';
import { db } from '../../data/db';
import { useTheme, Theme } from '../../app/theme';
import { Folder, Download, Upload, RefreshCw } from 'lucide-react';

export const SystemView: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [thaiFontSize, setThaiFontSize] = useState<number>(32);
  const [vaultConnected, setVaultConnected] = useState<boolean>(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  useEffect(() => {
    async function loadSettings() {
      const sizeRecord = await db.settings.get('thaiFontSize');
      if (sizeRecord) setThaiFontSize(sizeRecord.value);

      const vaultRecord = await db.settings.get('vaultDirHandle');
      setVaultConnected(!!vaultRecord?.value);
    }
    loadSettings();
  }, []);

  const handlePickVault = async () => {
    if ('showDirectoryPicker' in window) {
      try {
        const handle = await (window as any).showDirectoryPicker({ mode: 'readwrite' });
        await db.settings.put({ key: 'vaultDirHandle', value: handle });
        setVaultConnected(true);
        setStatusMsg('Vault directory linked successfully!');
        setTimeout(() => setStatusMsg(null), 3000);
      } catch (err) {
        console.warn('Directory picker cancelled or unsupported:', err);
      }
    } else {
      setStatusMsg('File System Access API not available in this browser. Fallback download mode active.');
      setTimeout(() => setStatusMsg(null), 4000);
    }
  };

  const handleExportJson = async () => {
    const allData = {
      words: await db.words.toArray(),
      cards: await db.cards.toArray(),
      reviews: await db.reviews.toArray(),
      sessions: await db.sessions.toArray(),
      quests: await db.quests.toArray(),
      exportDate: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `thai-audio-lab-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateFontSize = async (size: number) => {
    setThaiFontSize(size);
    await db.settings.put({ key: 'thaiFontSize', value: size });
  };

  return (
    <div className="max-w-2xl">
      <header className="mb-6">
        <h1 className="text-3xl font-serif font-bold uppercase tracking-wide text-text-on-bg">
          System & Settings
        </h1>
        <p className="text-xs font-mono text-muted uppercase tracking-wider mt-1">
          Configuration · Obsidian Bridge · Local Backups
        </p>
      </header>

      {statusMsg && (
        <div className="mb-4 p-3 rounded bg-accent/20 border border-accent text-xs font-mono text-text-on-bg">
          {statusMsg}
        </div>
      )}

      <div className="space-y-6">
        {/* Theme Picker */}
        <section className="p5-panel p-5 rounded">
          <h2 className="text-xs font-mono uppercase text-muted tracking-wider mb-3">
            Interface Theme
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { id: 'gentleman' as Theme, label: 'Gentleman', desc: 'Obsidian #0A0A0A' },
              { id: 'deep' as Theme, label: 'Deep', desc: 'Intelligence #0A1F3D' },
              { id: 'growth' as Theme, label: 'Growth', desc: 'Systems #0A4F3C' },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTheme(t.id)}
                className={`py-3 px-3 rounded border-2 text-xs font-mono font-bold uppercase transition-all flex flex-col items-center justify-center ${
                  theme === t.id
                    ? 'border-crimson bg-crimson text-ivory shadow-none translate-x-[2px] translate-y-[2px]'
                    : 'border-ink bg-ivory text-ink hover:bg-gold/10 shadow-[3px_3px_0_var(--gunmetal)]'
                }`}
              >
                <span>{t.label}</span>
                <span className="text-[9px] font-normal opacity-75 mt-0.5">{t.desc}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Thai Font Size Slider */}
        <section className="p5-panel p-5 rounded">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-xs font-mono uppercase text-muted tracking-wider">
              Thai Script Size
            </h2>
            <span className="font-mono text-xs font-bold text-accent">{thaiFontSize}px</span>
          </div>
          <input
            type="range"
            min="24"
            max="56"
            step="4"
            value={thaiFontSize}
            onChange={(e) => handleUpdateFontSize(parseInt(e.target.value, 10))}
            className="w-full accent-accent cursor-pointer"
          />
          <div className="flex justify-between text-[10px] font-mono text-muted mt-1">
            <span>24px (Standard)</span>
            <span>32px (Recommended)</span>
            <span>56px (Large)</span>
          </div>
        </section>

        {/* Obsidian Vault Integration */}
        <section className="p5-panel p-5 rounded flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono uppercase text-muted tracking-wider mb-1">
              Obsidian Vault Folder
            </h2>
            <p className="text-xs text-ink/70">
              {vaultConnected
                ? 'Linked to vault. Direct writes enabled.'
                : 'Not linked. Click to select your Obsidian root.'}
            </p>
          </div>
          <button
            type="button"
            onClick={handlePickVault}
            className="flex items-center space-x-1.5 px-4 py-2 border-2 border-ink rounded font-mono text-xs font-bold bg-panel hover:bg-bg-deep/10 shadow-[3px_3px_0_var(--bg-deep)]"
          >
            <Folder className="w-4 h-4 text-accent" />
            <span>{vaultConnected ? 'Re-link' : 'Link Vault'}</span>
          </button>
        </section>

        {/* Database Backup & Restore */}
        <section className="p5-panel p-5 rounded flex items-center justify-between">
          <div>
            <h2 className="text-xs font-mono uppercase text-muted tracking-wider mb-1">
              Data & Backup
            </h2>
            <p className="text-xs text-ink/70">
              Export complete study history and card stability as JSON.
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleExportJson}
              className="flex items-center space-x-1.5 px-3 py-2 border border-ink rounded font-mono text-xs hover:bg-bg-deep/10"
            >
              <Download className="w-3.5 h-3.5 text-accent" />
              <span>Export JSON</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
