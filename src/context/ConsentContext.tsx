/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useState,
  type ReactNode,
} from 'react';

type ConsentState = 'granted' | 'denied' | 'pending';

const CONSENT_KEY = 'ga_consent';

function readConsent(): ConsentState {
  try {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (stored === 'granted' || stored === 'denied') return stored;
  } catch {
    // localStorage unavailable (private browsing, etc.)
  }
  return 'pending';
}

function writeConsent(state: ConsentState) {
  try {
    localStorage.setItem(CONSENT_KEY, state);
  } catch {
    // silently ignore
  }
}

type ConsentContextValue = {
  consent: ConsentState;
  grant: () => void;
  deny: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

export function ConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<ConsentState>(readConsent);

  const grant = useCallback(() => {
    writeConsent('granted');
    setConsent('granted');
  }, []);

  const deny = useCallback(() => {
    writeConsent('denied');
    setConsent('denied');
  }, []);

  return (
    <ConsentContext.Provider value={{ consent, grant, deny }}>
      {children}
    </ConsentContext.Provider>
  );
}

export function useConsent() {
  const ctx = useContext(ConsentContext);
  if (!ctx) throw new Error('useConsent must be used within ConsentProvider');
  return ctx;
}
