import { useEffect } from 'react';
import { useConsent } from '@/context/ConsentContext';
import { initPostHog } from '@/lib/posthog';

export function PostHogLoader() {
  const { consent } = useConsent();

  useEffect(() => {
    if (consent === 'granted') {
      initPostHog();
    }
  }, [consent]);

  return null;
}
