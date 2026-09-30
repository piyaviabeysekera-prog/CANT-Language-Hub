import { useState, useEffect, useCallback, useRef } from 'react';

export interface UseSpeechReturn {
  speak: (text: string, options?: { rate?: number; wordId?: string }) => void;
  stop: () => void;
  supported: boolean;
  hasThaiVoice: boolean;
  voice: SpeechSynthesisVoice | null;
  setVoice: (v: SpeechSynthesisVoice) => void;
  voices: SpeechSynthesisVoice[];
  isPlaying: boolean;
  rate: number;
  setRate: (r: number) => void;
}

export function useSpeech(): UseSpeechReturn {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voice, setVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [rate, setRate] = useState<number>(1.0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const supported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const updateVoices = useCallback(() => {
    if (!supported) return;
    const all = window.speechSynthesis.getVoices();
    const thaiVoices = all.filter((v) => v.lang.toLowerCase().startsWith('th'));
    setVoices(thaiVoices);

    if (thaiVoices.length > 0 && !voice) {
      // Prefer local voice if available
      const local = thaiVoices.find((v) => v.localService) || thaiVoices[0];
      setVoice(local);
    }
  }, [supported, voice]);

  useEffect(() => {
    if (!supported) return;
    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;
  }, [supported, updateVoices]);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (supported) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  }, [supported]);

  const speak = useCallback(
    async (text: string, options?: { rate?: number; wordId?: string }) => {
      stop();
      setIsPlaying(true);

      const playbackRate = options?.rate ?? rate;
      const wordId = options?.wordId;

      // 1. Priority check: Pre-recorded audio file in public/audio/{wordId}.mp3
      if (wordId) {
        try {
          const audioUrl = `/audio/${wordId}.mp3`;
          const res = await fetch(audioUrl, { method: 'HEAD' });
          if (res.ok) {
            const audio = new Audio(audioUrl);
            audio.playbackRate = playbackRate;
            audioRef.current = audio;
            audio.onended = () => setIsPlaying(false);
            audio.onerror = () => {
              // Fallback to synthesis
              speakSynthesis(text, playbackRate);
            };
            audio.play();
            return;
          }
        } catch {
          // Proceed to synthesis fallback
        }
      }

      speakSynthesis(text, playbackRate);
    },
    [stop, rate, voice, supported]
  );

  const speakSynthesis = (text: string, playbackRate: number) => {
    if (!supported) {
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = 'th-TH';
    }

    utterance.rate = playbackRate;

    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  return {
    speak,
    stop,
    supported,
    hasThaiVoice: voices.length > 0,
    voice,
    setVoice,
    voices,
    isPlaying,
    rate,
    setRate,
  };
}
