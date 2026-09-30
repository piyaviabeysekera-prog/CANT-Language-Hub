import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Clock, 
  Brain, 
  ShieldAlert, 
  ArrowRight, 
  Sparkles, 
  Zap,
  Compass
} from 'lucide-react';
import { useSpeech } from '../../hooks/useSpeech';
import { AudioButton } from '../../components/audio/AudioButton';

export const LearningPlanView: React.FC = () => {
  const navigate = useNavigate();
  const { speak, isPlaying, rate, setRate } = useSpeech();
  const [activeTab, setActiveTab] = useState<'start' | 'session' | 'science' | 'rules'>('start');

  const samplePhrases = [
    { thai: 'สวัสดีครับ', phon: 'sà-wàt-dii khráp', eng: 'Hello / Greetings (Polite)', desc: 'Low-Falling tone cadence' },
    { thai: 'ไม่เป็นไร', phon: 'mâi pen rai', eng: "No problem / It's okay", desc: 'Essential social shock-absorber' },
    { thai: 'ห้องน้ำอยู่ที่ไหน', phon: 'hông-náam yùu thîi-nǎi?', eng: 'Where is the restroom?', desc: 'Survival navigation query' },
  ];

  return (
    <div className="max-w-4xl pb-16">
      {/* Top Header & Lupin Persona Banner */}
      <header className="mb-6">
        <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded text-xs font-mono font-bold tracking-widest uppercase bg-accent/15 text-accent mb-3 border border-accent/30">
          <Sparkles className="w-3.5 h-3.5" />
          <span>ARCHON 01 // COGNITIVE MASTER PLAN</span>
        </div>
        <h1 className="text-3xl md:text-4xl font-serif font-black tracking-tight text-text-on-bg mb-2">
          The Rogue's Learning Architecture
        </h1>
        <p className="text-sm font-sans text-muted leading-relaxed max-w-2xl">
          Engineered for effortless adult Thai acquisition. Zero grammar grind. Ear-first acoustics, high-yield street lexicons, and mathematical spaced retrieval.
        </p>
      </header>

      {/* Confidant Callout Card */}
      <div className="p-4 mb-6 rounded border-l-4 border-accent bg-bg-deep/40 border-r border-t border-b border-muted/20 relative overflow-hidden">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-accent mb-1 flex items-center space-x-2">
          <Zap className="w-3.5 h-3.5" />
          <span>URIZEN // THE EFFORTLESS LEARNING PROTOCOL</span>
        </div>
        <p className="font-serif italic text-base md:text-lg text-text-on-bg mb-1">
          "It's effortless for you old friend, after all you are Arsene Lupin, the son of the wolf and prince of thieves, you will learn this faster than anyone else."
        </p>
        <p className="text-xs font-mono text-muted">
          Active Directive: Remove self-imposed friction. <strong className="text-text-on-bg">"Things are effortless if you make them seem effortless"</strong> (Charm).
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-muted/20 space-x-2 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('start')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'start'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-transparent text-muted hover:text-text-on-bg hover:border-muted/40'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>📍 Start Here</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('session')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'session'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-transparent text-muted hover:text-text-on-bg hover:border-muted/40'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>⏱️ Ideal Session Anatomy</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('science')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'science'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-transparent text-muted hover:text-text-on-bg hover:border-muted/40'
          }`}
        >
          <Brain className="w-4 h-4" />
          <span>🧬 Cognitive Architecture</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('rules')}
          className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-colors whitespace-nowrap ${
            activeTab === 'rules'
              ? 'border-accent text-accent bg-accent/10'
              : 'border-transparent text-muted hover:text-text-on-bg hover:border-muted/40'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>⚔️ Rogue's Maxims</span>
        </button>
      </div>

      {/* TAB 1: START HERE */}
      {activeTab === 'start' && (
        <div className="space-y-6">
          <div className="p5-panel p-6 rounded bg-panel">
            <h2 className="text-xl font-serif font-bold text-ink mb-1 flex items-center space-x-2">
              <span className="text-accent font-mono text-base font-bold">01.</span>
              <span>Zero-Friction Orientation</span>
            </h2>
            <p className="text-sm font-sans text-muted mb-4">
              You do not need to memorize grammar books or cram 44 letters before speaking. Follow this 3-step sequence:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-accent mb-1">Step 1</div>
                  <h3 className="font-sans font-bold text-ink text-base mb-1">Calibrate Your Ears</h3>
                  <p className="text-xs font-sans text-muted leading-relaxed mb-3">
                    Ensure your browser's Thai Web Speech audio is playing loud and clear. Test with the audio button below.
                  </p>
                </div>
                <div className="pt-2 border-t border-muted/20 flex items-center justify-between text-xs font-mono text-muted">
                  <span>Speech Synthesizer</span>
                  <span className="text-emerald-500 font-bold">READY</span>
                </div>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-accent mb-1">Step 2</div>
                  <h3 className="font-sans font-bold text-ink text-base mb-1">Pick Today's Entry Path</h3>
                  <p className="text-xs font-sans text-muted leading-relaxed mb-3">
                    High cognitive energy? Do <strong>Consonant Classes</strong>. Tired after work? Do <strong>Daily Practice Drills</strong>.
                  </p>
                </div>
                <div className="pt-2 border-t border-muted/20 flex items-center justify-between text-xs font-mono text-muted">
                  <span>Tracks Available</span>
                  <span className="text-accent font-bold">3 TRACKS</span>
                </div>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-accent mb-1">Step 3</div>
                  <h3 className="font-sans font-bold text-ink text-base mb-1">Bank Time to Obsidian</h3>
                  <p className="text-xs font-sans text-muted leading-relaxed mb-3">
                    Every active minute increments your session clock. One click syncs markdown notes directly into your Obsidian War Room.
                  </p>
                </div>
                <div className="pt-2 border-t border-muted/20 flex items-center justify-between text-xs font-mono text-muted">
                  <span>Vault Destination</span>
                  <span className="text-muted font-bold font-mono">064_Language_Lab</span>
                </div>
              </div>
            </div>
          </div>

          {/* Audio Quick Test Card */}
          <div className="p5-panel p-6 rounded bg-panel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif font-bold text-lg text-ink">Audio Check: Native Acoustic Verification</h3>
                <p className="text-xs font-sans text-muted">Click the speaker icons to verify your local Thai text-to-speech engine.</p>
              </div>
              <div className="text-xs font-mono text-muted">
                Playback Speed: <span className="text-accent font-bold">{rate}x</span>
              </div>
            </div>

            <div className="space-y-3">
              {samplePhrases.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 rounded bg-bg-deep/30 border border-muted/20 hover:border-accent/40 transition-colors">
                  <div className="flex items-baseline space-x-3">
                    <span lang="th" className="text-xl font-thai font-bold text-ink">
                      {item.thai}
                    </span>
                    <span className="text-xs font-mono text-accent">
                      {item.phon}
                    </span>
                    <span className="text-xs font-sans text-muted hidden sm:inline">
                      — {item.eng}
                    </span>
                  </div>
                  <AudioButton
                    onPlay={(r) => speak(item.thai, { rate: r })}
                    isPlaying={isPlaying}
                    rate={rate}
                    onRateToggle={setRate}
                    showRateToggle={idx === 0}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Direct Launch Shortcuts */}
          <div className="p5-panel p-6 rounded bg-panel">
            <h3 className="font-serif font-bold text-lg text-ink mb-3">Launch Direct Mission</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => navigate('/practice')}
                className="p-3.5 text-left rounded border border-muted/20 hover:border-accent bg-bg-deep/30 hover:bg-bg-deep/60 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-accent uppercase mb-1">Primary Drill</div>
                  <div className="font-sans font-bold text-ink text-sm group-hover:text-accent transition-colors">
                    Daily Practice Drills
                  </div>
                  <div className="text-xs text-muted mt-1">FSRS Spaced Repetition Cards</div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs font-mono text-muted group-hover:text-accent">
                  <span>Enter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/words')}
                className="p-3.5 text-left rounded border border-muted/20 hover:border-accent bg-bg-deep/30 hover:bg-bg-deep/60 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-accent uppercase mb-1">Alphabet & Tones</div>
                  <div className="font-sans font-bold text-ink text-sm group-hover:text-accent transition-colors">
                    Phonetic Charts & Matrix
                  </div>
                  <div className="text-xs text-muted mt-1">44 Consonants, 52 Vowels, Tones</div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs font-mono text-muted group-hover:text-accent">
                  <span>Explore</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>

              <button
                type="button"
                onClick={() => navigate('/quests')}
                className="p-3.5 text-left rounded border border-muted/20 hover:border-accent bg-bg-deep/30 hover:bg-bg-deep/60 transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="text-xs font-mono font-bold text-accent uppercase mb-1">Real-World Combat</div>
                  <div className="font-sans font-bold text-ink text-sm group-hover:text-accent transition-colors">
                    Field Quests
                  </div>
                  <div className="text-xs text-muted mt-1">Sitjaroonsak Gym & Bangkok Street</div>
                </div>
                <div className="flex items-center justify-between mt-3 text-xs font-mono text-muted group-hover:text-accent">
                  <span>Missions</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: IDEAL SESSION ANATOMY */}
      {activeTab === 'session' && (
        <div className="space-y-6">
          <div className="p5-panel p-6 rounded bg-panel">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-serif font-bold text-ink">The 15–20 Minute Standard Session</h2>
                <p className="text-xs font-sans text-muted">
                  Structured to maximize synaptic consolidation while keeping cognitive strain strictly below fatigue threshold.
                </p>
              </div>
              <div className="px-2.5 py-1 rounded bg-accent/15 border border-accent/30 text-accent font-mono text-xs font-bold uppercase">
                Daily Cadence
              </div>
            </div>

            {/* Timeline Breakdown */}
            <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-muted/30">
              {/* Phase 1 */}
              <div className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-accent -translate-x-1/2 ring-4 ring-bg" />
                <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-xs font-bold text-accent uppercase">Phase 1 · 00:00 – 03:00 (3 mins)</span>
                    <span className="text-xs font-mono text-muted">Acoustic Tuning</span>
                  </div>
                  <h3 className="font-sans font-bold text-ink text-base mb-1">Ear Attunement & Tone Calisthenics</h3>
                  <p className="text-xs font-sans text-muted leading-relaxed mb-2">
                    Open <strong className="text-text-on-bg">/words</strong> and jump to the Tone Rules Matrix or 5 Tones audio. Listen to 5-10 letters or tone syllables. Click 0.75x slow speed on difficult tone contours.
                  </p>
                  <div className="text-[11px] font-mono text-accent">
                    Goal: Reset your brain from English cadence into Thai pitch discrimination before reading.
                  </div>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-accent -translate-x-1/2 ring-4 ring-bg" />
                <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-xs font-bold text-accent uppercase">Phase 2 · 03:00 – 12:00 (9 mins)</span>
                    <span className="text-xs font-mono text-muted">Retrieval Engine</span>
                  </div>
                  <h3 className="font-sans font-bold text-ink text-base mb-1">Active Spaced Retrieval (FSRS)</h3>
                  <p className="text-xs font-sans text-muted leading-relaxed mb-2">
                    Open <strong className="text-text-on-bg">/practice</strong> and work through 10–15 cards in your active track:
                  </p>
                  <ul className="text-xs font-sans text-muted space-y-1 list-disc list-inside mb-2">
                    <li><strong className="text-text-on-bg">Sound First:</strong> Play the audio before reading the romanization.</li>
                    <li><strong className="text-text-on-bg">Vocalize Guess:</strong> Say the tone and meaning out loud.</li>
                    <li><strong className="text-text-on-bg">Flip & Rate:</strong> Press [Space] to reveal, then press [1] Again, [2] Hard, [3] Good, or [4] Easy.</li>
                  </ul>
                  <div className="text-[11px] font-mono text-accent">
                    Goal: Force synaptic retrieval effort. The struggle to recall is where memory cements.
                  </div>
                </div>
              </div>

              {/* Phase 3 */}
              <div className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-accent -translate-x-1/2 ring-4 ring-bg" />
                <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-xs font-bold text-accent uppercase">Phase 3 · 12:00 – 16:00 (4 mins)</span>
                    <span className="text-xs font-mono text-muted">Motor Fluency</span>
                  </div>
                  <h3 className="font-sans font-bold text-ink text-base mb-1">Field Quest Simulation (Gym & Street)</h3>
                  <p className="text-xs font-sans text-muted leading-relaxed mb-2">
                    Open <strong className="text-text-on-bg">/quests</strong>. Select a scenario (e.g. Sitjaroonsak Muay Thai Gym coach feedback or ordering street food). Speak the target phrase aloud 3 times with full conversational volume and polite particle (<strong className="text-text-on-bg">ครับ</strong>).
                  </p>
                  <div className="text-[11px] font-mono text-accent">
                    Goal: Transition passive vocabulary into automated muscle memory for high-pressure solo survival.
                  </div>
                </div>
              </div>

              {/* Phase 4 */}
              <div className="relative pl-10">
                <div className="absolute left-2.5 top-1.5 w-3 h-3 rounded-full bg-emerald-500 -translate-x-1/2 ring-4 ring-bg" />
                <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                  <div className="flex justify-between items-baseline mb-1">
                    <span className="font-mono text-xs font-bold text-emerald-500 uppercase">Phase 4 · 16:00 – 17:00 (1 min)</span>
                    <span className="text-xs font-mono text-muted">Ledger Deposit</span>
                  </div>
                  <h3 className="font-sans font-bold text-ink text-base mb-1">Bank Session & Sync to Obsidian</h3>
                  <p className="text-xs font-sans text-muted leading-relaxed mb-2">
                    Open <strong className="text-text-on-bg">/journal</strong>. Note one phonetic victory and one sound that felt awkward. Click <strong className="text-accent">Sync to Obsidian</strong>.
                  </p>
                  <div className="text-[11px] font-mono text-emerald-500">
                    Goal: Bank your time permanently in the vault. Zero lost progress, zero data fragmentation.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Anti-Patterns Callout */}
          <div className="p-4 rounded border border-rose-900/40 bg-rose-950/20 text-text-on-bg">
            <h4 className="font-mono text-xs font-bold text-rose-400 uppercase tracking-wider mb-2 flex items-center space-x-2">
              <ShieldAlert className="w-4 h-4" />
              <span>Session Pitfalls to Avoid</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-sans text-muted">
              <div>
                <strong className="text-text-on-bg block mb-0.5">1. Never Grind Over 25 Mins</strong>
                Spaced retrieval has diminishing returns past 20 minutes. 15 effortless minutes daily beats a 2-hour weekend cram.
              </div>
              <div>
                <strong className="text-text-on-bg block mb-0.5">2. Don't Read First</strong>
                If you look at the transliteration before hearing the sound, your English reading bias will distort the Thai tone.
              </div>
              <div>
                <strong className="text-text-on-bg block mb-0.5">3. Don't Sub-Vocalize</strong>
                Quietly whispering does not trigger motor cortex learning. Speak clearly aloud so your throat learns the tone inflection.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: COGNITIVE SCIENCE PILLARS */}
      {activeTab === 'science' && (
        <div className="space-y-6">
          <div className="p5-panel p-6 rounded bg-panel">
            <h2 className="text-xl font-serif font-bold text-ink mb-1">
              Scientific Meta-Learning Foundation
            </h2>
            <p className="text-xs font-sans text-muted mb-6">
              Synthesized from NotebookLM & Gemini Pro cognitive research. These 5 pillars form the architecture of CANT:
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="flex items-center space-x-2 text-accent font-mono text-xs font-bold uppercase mb-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Pillar 1 · Krashen's Comprehensible Input (i+1)</span>
                </div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">Acoustic Acquisition Precedes Orthography</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Adults do not acquire spoken languages by parsing abstract grammar rules; they acquire them through repeated exposure to comprehensible auditory messages in low-anxiety settings. In CANT, sound is primary. You hear the native contour before decoding script.
                </p>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="flex items-center space-x-2 text-accent font-mono text-xs font-bold uppercase mb-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Pillar 2 · Zipf's Law & 80/20 Lexical Dominance</span>
                </div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">The 300 High-Frequency Street Matrix</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  In natural human languages, word frequency follows a power law. The top 300 spoken lexical chunks in Thai account for more than 65% of daily street and gym conversations. CANT bypasses literary and bureaucratic vocabulary to cement this core first.
                </p>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="flex items-center space-x-2 text-accent font-mono text-xs font-bold uppercase mb-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Pillar 3 · Free Spaced Repetition Scheduler (ts-fsrs)</span>
                </div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">Mathematical Memory Consolidation</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Memories decay along an exponential forgetting curve: R = exp(-t/S). Using the modern FSRS algorithm implemented locally via ts-fsrs and Dexie IndexedDB, card stability and review intervals adjust automatically based on your rating, eliminating redundant reviews.
                </p>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="flex items-center space-x-2 text-accent font-mono text-xs font-bold uppercase mb-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Pillar 4 · Dual Coding & Spatial Pitch Vectors</span>
                </div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">Anchoring Abstract Tones in Space</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Thai tones (Mid, Low, Falling, High, Rising) are notoriously elusive for non-tonal speakers. CANT pairs every audio pitch contour with an immediate visual vector glyph (—, _, ^, ‾, v) and consonant class color badges to anchor sound in multiple sensory channels.
                </p>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="flex items-center space-x-2 text-accent font-mono text-xs font-bold uppercase mb-1">
                  <span className="w-2 h-2 rounded-full bg-accent" />
                  <span>Pillar 5 · Lizard-Brain RPG Gamification</span>
                </div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">4-Stat Rebellion Survival Mapping</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Every drill, tone test, and field quest feeds directly into your Rebellion RPG survival parameters: <strong>Knowledge</strong> (Lupin - retention), <strong>Proficiency</strong> (Demiurge - ear accuracy), <strong>Charm</strong> (Ren - conversational rapport), and <strong>Guts</strong> (Arsene - gym and street boldness).
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: ROGUE'S MAXIMS */}
      {activeTab === 'rules' && (
        <div className="space-y-6">
          <div className="p5-panel p-6 rounded bg-panel">
            <h2 className="text-xl font-serif font-bold text-ink mb-1">
              The Rogue's Rules of Engagement
            </h2>
            <p className="text-xs font-sans text-muted mb-6">
              Principles of the Trickster for effortless mastery:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded border border-accent/40 bg-accent/10">
                <div className="font-mono text-xs font-bold text-accent uppercase mb-1">Rule 1 · Charm & Effortlessness</div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">"Things are effortless if you make them seem effortless"</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Difficulty is a mental schema. If you expect Thai to be hard, your brain creates friction. Approach each session as a light game of audio decoding. If you are not smiling or relaxed, stop.
                </p>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="font-mono text-xs font-bold text-accent uppercase mb-1">Rule 2 · The 9 Mid Consonants Foundation</div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">Master Mid-Class First</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Do not attempt to master all 44 consonants simultaneously. The 9 Mid-class consonants (ก, จ, ด, ต, บ, ป, อ, ฎ, ฏ) have direct 1:1 tone rules that produce all 5 tones naturally. Nail them first.
                </p>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="font-mono text-xs font-bold text-accent uppercase mb-1">Rule 3 · Speak with Audacity</div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">Embrace the Foreign Mouth Feel</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Thai requires mouth shapes not found in English (like the unrounded back vowel /ɯ/ in อึ or the aspirated /th/). Do not shy away from making exaggerated sounds in private. Audacity breeds fluency.
                </p>
              </div>

              <div className="p-4 rounded border border-muted/20 bg-bg-deep/20">
                <div className="font-mono text-xs font-bold text-accent uppercase mb-1">Rule 4 · The Banked Time Ethos</div>
                <h3 className="font-sans font-bold text-ink text-base mb-1">No Broken Streaks</h3>
                <p className="text-xs font-sans text-muted leading-relaxed">
                  Duolingo-style streaks punish life interruptions. In CANT, time is banked in your ledger. A 5-minute session is 5 minutes permanently earned. Your progress never resets.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
