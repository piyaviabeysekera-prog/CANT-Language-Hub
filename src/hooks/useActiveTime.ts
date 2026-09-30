import { useState, useEffect, useRef, useCallback } from 'react';

const IDLE_TIMEOUT_MS = 75000; // 75 seconds idle threshold

export function useActiveTime(isActive = true) {
  const [activeMs, setActiveMs] = useState(0);
  const lastInteractionRef = useRef(Date.now());
  const isTabVisibleRef = useRef(!document.hidden);

  const registerInteraction = useCallback(() => {
    lastInteractionRef.current = Date.now();
  }, []);

  useEffect(() => {
    const handleActivity = () => registerInteraction();
    const handleVisibility = () => {
      isTabVisibleRef.current = !document.hidden;
      if (!document.hidden) {
        lastInteractionRef.current = Date.now();
      }
    };

    window.addEventListener('keydown', handleActivity);
    window.addEventListener('pointerdown', handleActivity);
    window.addEventListener('mousemove', handleActivity);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      window.removeEventListener('keydown', handleActivity);
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('mousemove', handleActivity);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [registerInteraction]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      const now = Date.now();
      const timeSinceInteraction = now - lastInteractionRef.current;

      if (isTabVisibleRef.current && timeSinceInteraction <= IDLE_TIMEOUT_MS) {
        setActiveMs((prev) => prev + 1000);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive]);

  const reset = useCallback(() => {
    setActiveMs(0);
    lastInteractionRef.current = Date.now();
  }, []);

  return {
    activeMs,
    activeMinutes: Math.floor(activeMs / 60000),
    activeSeconds: Math.floor((activeMs % 60000) / 1000),
    reset,
    registerInteraction,
  };
}
