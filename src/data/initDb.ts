import { db, Word } from './db';
import initialWords from './words.json';
import { createNewCard } from './srs';

export async function initializeDatabase() {
  const words = initialWords as Word[];
  const wordCount = await db.words.count();

  if (wordCount === 0) {
    console.log('[+] Seeding initial words into Dexie IndexedDB...');
    await db.words.bulkAdd(words);

    // Create starter SRS cards for each word
    const cards = [];
    for (const w of words) {
      cards.push(createNewCard(w.id, 'recognition'));
      cards.push(createNewCard(w.id, 'listening'));
      cards.push(createNewCard(w.id, 'reading'));
      cards.push(createNewCard(w.id, 'tone'));
    }
    await db.cards.bulkAdd(cards);

    // Seed starter real-world quests
    await db.quests.bulkAdd([
      { id: 'q-1', title: 'Order street food in Thai ("ขอ... ไม่เผ็ด")', category: 'food', done: false },
      { id: 'q-2', title: 'Ask for the bill ("เช็คบิลด้วย")', category: 'food', done: false },
      { id: 'q-3', title: 'Direct a taxi or Grab driver ("ตรงไป / เลี้ยวซ้าย")', category: 'transit', done: false },
      { id: 'q-4', title: 'Tell Kru or sparring partner "พอแล้ว" (Enough) at Sitjaroonsak Gym', category: 'gym', done: false },
      { id: 'q-5', title: 'Give a charming compliment ("น่ารักมาก")', category: 'charm', done: false },
      { id: 'q-6', title: 'Bargain at a local night market ("ลดได้ไหม")', category: 'street', done: false },
    ]);

    // Seed default settings
    await db.settings.bulkAdd([
      { key: 'theme', value: 'ink' },
      { key: 'thaiFontSize', value: 32 },
      { key: 'romanizationMode', value: 'always' },
      { key: 'preSessionPause', value: true },
      { key: 'audioRate', value: 1.0 },
    ]);

    console.log(`[+] Database seeded with ${words.length} words and ${cards.length} cards.`);
  } else if (wordCount < words.length) {
    // Incremental sync: Add any words from words.json that are missing in IndexedDB
    console.log(`[+] Incremental sync: existing ${wordCount} words vs ${words.length} master words...`);
    const existingWords = await db.words.toArray();
    const existingIds = new Set(existingWords.map((w) => w.id));
    const missingWords = words.filter((w) => !existingIds.has(w.id));

    if (missingWords.length > 0) {
      await db.words.bulkAdd(missingWords);

      const newCards = [];
      for (const w of missingWords) {
        newCards.push(createNewCard(w.id, 'recognition'));
        newCards.push(createNewCard(w.id, 'listening'));
        newCards.push(createNewCard(w.id, 'reading'));
        newCards.push(createNewCard(w.id, 'tone'));
      }
      await db.cards.bulkAdd(newCards);
      console.log(`[+] Incremental sync added ${missingWords.length} new words and ${newCards.length} cards.`);
    }
  }
}

export async function resetAndReseedDatabase() {
  console.log('[!] Resetting Dexie database to full 200-phrase library...');
  await db.words.clear();
  await db.cards.clear();
  await initializeDatabase();
  console.log('[+] Reset and reseed complete.');
}
