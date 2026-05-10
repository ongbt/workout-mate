import { useEffect } from 'react';
import { useConsent } from '@/context/ConsentContext';
import { initGA4 } from '@/lib/analytics';

export function GA4Loader() {
  const { consent } = useConsent();

  useEffect(() => {
    if (consent === 'granted') {
      initGA4();
    }
  }, [consent]);

  return null;
}
