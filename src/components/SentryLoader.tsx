import { useEffect } from 'react';
import { useConsent } from '@/context/ConsentContext';
import { initSentry } from '@/lib/sentry';

export function SentryLoader() {
  const { consent } = useConsent();

  useEffect(() => {
    if (consent === 'granted') {
      initSentry();
    }
  }, [consent]);

  return null;
}
