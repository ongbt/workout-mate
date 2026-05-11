import { useSyncExternalStore, useCallback } from 'react';
import { getPostHog } from '@/lib/posthog';

export function useFeatureFlag(flagKey: string, defaultValue = false): boolean {
  const subscribe = useCallback((onStoreChange: () => void) => {
    const ph = getPostHog();
    if (!ph) {
      onStoreChange();
      return () => {};
    }
    return ph.onFeatureFlags(onStoreChange);
  }, []);

  const getSnapshot = useCallback(() => {
    const ph = getPostHog();
    if (!ph) return defaultValue;
    return ph.isFeatureEnabled(flagKey) ?? defaultValue;
  }, [flagKey, defaultValue]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
