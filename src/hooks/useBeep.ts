import { useRef, useCallback } from 'react';

export function useBeep() {
  const ctxRef = useRef<AudioContext | null>(null);

  const beep = useCallback(
    (frequency: number = 880, durationMs: number = 120) => {
      try {
        if (!ctxRef.current) {
          ctxRef.current = new AudioContext();
        }
        const ctx = ctxRef.current;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = frequency;
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(
          0.001,
          ctx.currentTime + durationMs / 1000,
        );
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + durationMs / 1000);
      } catch {
        // Audio not available
      }
    },
    [],
  );

  return beep;
}
