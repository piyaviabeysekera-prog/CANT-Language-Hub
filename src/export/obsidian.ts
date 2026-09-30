import { db, SessionRecord, Word } from '../data/db';

export function formatObsidianSessionNote(
  session: SessionRecord,
  words: Word[],
  cumulativeBankedTime: string,
  skillLevels: { tones: number; reading: number; listening: number; speaking: number; vocabulary: number },
  completedQuests: string[] = []
): string {
  const dateStr = session.startedAt.toISOString().split('T')[0];
  const activeMin = Math.round(session.activeMs / 60000);

  let note = `---
date: ${dateStr}
type: thai-session
active_minutes: ${activeMin}
kind: ${session.kind}
words_touched: ${words.length}
tags:
  - "#domain/meta-learning"
  - "#review"
---
# 🇹🇭 Thai Study Session · ${dateStr}

**Active Time:** ${activeMin} min · **Cumulative Banked Time:** ${cumulativeBankedTime}

## Words Touched
`;

  for (const w of words) {
    note += `- **${w.thai}** (${w.roman}) · ${w.meaning}\n`;
  }

  note += `\n## Skill Levels
- 🎵 Tones: Level ${skillLevels.tones}
- 📖 Reading: Level ${skillLevels.reading}
- 🎧 Listening: Level ${skillLevels.listening}
- 🗣️ Speaking: Level ${skillLevels.speaking}
- 📚 Vocabulary: Level ${skillLevels.vocabulary}
`;

  if (completedQuests.length > 0) {
    note += `\n## Real-World Quests Completed\n`;
    for (const q of completedQuests) {
      note += `- [x] ${q}\n`;
    }
  }

  note += `\n## Field Notes / Reflections\n${session.note || '*Clean session completed with zero friction.*'}\n`;

  return note;
}

export async function exportSessionToObsidian(
  session: SessionRecord,
  words: Word[],
  cumulativeBankedTime: string,
  skillLevels: { tones: number; reading: number; listening: number; speaking: number; vocabulary: number },
  completedQuests: string[] = []
): Promise<{ success: boolean; message: string }> {
  const content = formatObsidianSessionNote(session, words, cumulativeBankedTime, skillLevels, completedQuests);
  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const filename = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}-thai-session.md`;

  // 1. Try File System Access API if directory handle is stored
  try {
    const setting = await db.settings.get('vaultDirHandle');
    if (setting && setting.value) {
      const handle = setting.value as any;
      if (typeof handle.queryPermission === 'function') {
        const perm = await handle.queryPermission({ mode: 'readwrite' });
        if (perm !== 'granted') {
          const req = await handle.requestPermission({ mode: 'readwrite' });
          if (req !== 'granted') throw new Error('Permission denied');
        }
      }

      // Navigate or create 06_War_Room -> 064_Language_Lab -> Thai -> Sessions
      let targetDir = handle;
      const pathParts = ['06_War_Room', '064_Language_Lab', 'Thai', 'Sessions'];
      for (const part of pathParts) {
        targetDir = await targetDir.getDirectoryHandle(part, { create: true });
      }

      const fileHandle = await targetDir.getFileHandle(filename, { create: true });
      const writable = await fileHandle.createWritable();
      await writable.write(content);
      await writable.close();

      return { success: true, message: `Saved directly to vault Sessions/${filename}` };
    }
  } catch (err) {
    console.warn('[*] File System Access write failed or not configured, falling back to download:', err);
  }

  // 2. Fallback: Trigger standard browser download
  const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return { success: true, message: `Exported ${filename} via download.` };
}
