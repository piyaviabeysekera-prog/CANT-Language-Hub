# 🇹🇭 CANT — The Thieves' Tongue // Thai Language Hub

> *"It's effortless for you old friend, after all you are Arsene Lupin, the son of the wolf and prince of thieves, you will learn this faster than anyone else."*  
> — **Urizen // Effortless Learning Protocol**

**CANT** is a self-hosted, audio-first language acquisition web application engineered for rapid adult spoken Thai fluency and independent solo survival in Thailand. Inspired by *Thieves' Cant*—the secret argot of rogues and cutpurses—it strips academic grammar grind in favor of ear-first acoustic discrimination, high-yield street vocabularies, and mathematical spaced repetition.

---

## ⚡ Core Features

- **👂 Audio-First Acoustic Architecture**: Built-in native Thai speech synthesizer (`th-TH`) via browser Web Speech API with 1.0x and 0.75x slow ear-training toggles (100% free, zero token cost, zero external API keys).
- **🔤 Phonetic Mastery Deck**:
  - **44 Consonants**: Filterable by Mid, High, and Low classes with initial/final sound mapping and native audio.
  - **52 Vowels**: Short vs. Long vowel distinction with Paiboon romanization and audio.
  - **Visual Confusions Chart**: Highlights look-alike Thai graphemes (ข/ช, ด/ต, บ/ป, ถ/ภ, ผ/พ) to eliminate reading ambiguity.
  - **Tone Rules Calculator**: Interactive matrix calculating exact syllable tone outputs based on consonant class, vowel length, tone mark, and dead/live syllable endings.
- **🧠 FSRS Spaced Retrieval Engine**: Free Spaced Repetition Scheduler (`ts-fsrs`) running directly in client-side IndexedDB (`Dexie.js`). Cards adjust dynamically along an exponential forgetting curve ($R = e^{-t/S}$).
- **🎮 Lizard-Brain Gamification**:
  - **Metaphor 5-Skill Matrix**: Real-time evaluation of Tones, Reading, Listening, Speaking, and Vocabulary levels.
  - **4-Stat Rebellion Survival Mapping**: Knowledge (Lupin), Proficiency (Demiurge), Charm (Ren/Raoul), and Guts (Arsene).
- **🥊 Field Quests**: High-stakes real-world communication drills for Sitjaroonsak Muay Thai Gym (pad-work commands, coach sparring cues) and Bangkok street survival (transit, street food, social rapport).
- **📓 Two-Way Obsidian Sync**: One-click markdown journal export via File System Access API writing directly to `06_War_Room/064_Language_Lab/Thai/Sessions/`.
- **⏱️ Banked Time Ledger**: No broken streaks. Practice time is accumulated permanently in the ledger.

---

## 🚀 Quick Start

### Option A: Instant Launcher (Windows)
1. Double-click **`CANT_App.bat`** to start the lightweight Python production server on `http://127.0.0.1:8888`.
2. Your default browser will open automatically.

### Option B: Node / Vite Development
```bash
# 1. Install dependencies
npm install

# 2. Run live development server with hot-reload (Port 5173)
npm run dev

# 3. Build optimized production bundle
npm run build

# 4. Serve production build locally
python server.py
```

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript + Vite 6
- **Styling**: Tailwind CSS (Slanted Persona 5 HUD geometry, ink/slate dark palette)
- **Local Storage**: Dexie.js (IndexedDB)
- **Spaced Repetition**: `ts-fsrs` (Free Spaced Repetition Scheduler)
- **Audio**: Web Speech API (`th-TH`) + HTML5 Audio fallback
- **Icons**: Lucide React
- **Typography**: Noto Sans Thai, Noto Serif Thai, Cormorant Garamond, Inter

---

## 📜 License & Provenance
Architected by **Urizen** for **Joker / Arsene Lupin** under the Rebellion Engine 2.0.
