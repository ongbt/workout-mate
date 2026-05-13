import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useConsent } from '@/context/ConsentContext';
import { trackPageView } from '@/lib/analytics';

export function AnalyticsTracker() {
  const location = useLocation();
  const { consent } = useConsent();

  useEffect(() => {
    if (consent === 'granted') {
      trackPageView(location.pathname + location.hash);
    }
  }, [location, consent]);

  return null;
}
