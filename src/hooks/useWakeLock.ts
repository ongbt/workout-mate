import { useCallback, useEffect, useRef } from 'react';

export function useWakeLock() {
  const sentinelRef = useRef<WakeLockSentinel | null>(null);
  const activeRef = useRef(false);

  const request = useCallback(async () => {
    if (!('wakeLock' in navigator)) return;
    try {
      if (sentinelRef.current) {
        await sentinelRef.current.release().catch(() => {});
      }
      const s = await navigator.wakeLock.request('screen');
      activeRef.current = true;
      sentinelRef.current = s;
    } catch {
      // Wake lock unavailable (low battery, device policy, etc.)
    }
  }, []);

  const release = useCallback(async () => {
    activeRef.current = false;
    if (sentinelRef.current) {
      try {
        await sentinelRef.current.release();
      } catch {
        // Ignore release errors
      }
      sentinelRef.current = null;
    }
  }, []);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (
        document.visibilityState === 'visible' &&
        activeRef.current &&
        !sentinelRef.current
      ) {
        request();
      }
    };
    document.addEventListener('visibilitychange', onVisibilityChange);
    return () =>
      document.removeEventListener('visibilitychange', onVisibilityChange);
  }, [request]);

  useEffect(() => {
    return () => {
      release();
    };
  }, [release]);

  return { request, release };
}
