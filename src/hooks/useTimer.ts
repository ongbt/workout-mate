import { useState, useRef, useCallback, useEffect } from 'react';
import { TIMER_INTERVAL_MS } from '../constants';

export function useTimer(onComplete: () => void) {
  const endTimeRef = useRef<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [timeRemainingMs, setTimeRemainingMs] = useState(0);
  const [isRunning, setIsRunning] = useState(false);

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const tick = useCallback(() => {
    const remaining = endTimeRef.current - Date.now();
    if (remaining <= 0) {
      clearTimer();
      setTimeRemainingMs(0);
      setIsRunning(false);
      onComplete();
    } else {
      setTimeRemainingMs(remaining);
    }
  }, [onComplete, clearTimer]);

  const start = useCallback(
    (durationMs: number) => {
      clearTimer();
      endTimeRef.current = Date.now() + durationMs;
      setTimeRemainingMs(durationMs);
      setIsRunning(true);
      intervalRef.current = setInterval(tick, TIMER_INTERVAL_MS);
    },
    [tick, clearTimer],
  );

  const pause = useCallback(() => {
    clearTimer();
    setIsRunning(false);
  }, [clearTimer]);

  const resume = useCallback(() => {
    if (timeRemainingMs <= 0) return;
    endTimeRef.current = Date.now() + timeRemainingMs;
    setIsRunning(true);
    intervalRef.current = setInterval(tick, TIMER_INTERVAL_MS);
  }, [timeRemainingMs, tick]);

  const stop = useCallback(() => {
    clearTimer();
    setIsRunning(false);
    setTimeRemainingMs(0);
  }, [clearTimer]);

  useEffect(() => () => clearTimer(), [clearTimer]);

  return { timeRemainingMs, isRunning, start, pause, resume, stop };
}
