import { useEffect } from 'react';

interface KeyboardNavProps {
  onUp?: () => void;
  onDown?: () => void;
  onSelect?: () => void;
  onBack?: () => void;
  onNumberKey?: (num: number) => void;
  disabled?: boolean;
}

export function useKeyboardNav({
  onUp,
  onDown,
  onSelect,
  onBack,
  onNumberKey,
  disabled = false,
}: KeyboardNavProps) {
  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept when user is typing in an input or textarea
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        return;
      }

      if (e.key === 'ArrowUp' || e.key === 'k') {
        e.preventDefault();
        onUp?.();
      } else if (e.key === 'ArrowDown' || e.key === 'j') {
        e.preventDefault();
        onDown?.();
      } else if (e.key === 'Enter' || e.key === 'l') {
        e.preventDefault();
        onSelect?.();
      } else if (e.key === 'Escape' || e.key === 'h') {
        e.preventDefault();
        onBack?.();
      } else if (['1', '2', '3', '4', '5', '6'].includes(e.key)) {
        onNumberKey?.(parseInt(e.key, 10));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onUp, onDown, onSelect, onBack, onNumberKey, disabled]);
}
