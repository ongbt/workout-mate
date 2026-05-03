import { useEffect, type ReactNode } from 'react';
import i18n from '../i18n';

export function LanguageWatcher({ children }: { children: ReactNode }) {
  useEffect(() => {
    document.documentElement.lang = i18n.language;
    const handleLanguageChanged = (lng: string) => {
      document.documentElement.lang = lng;
    };
    i18n.on('languageChanged', handleLanguageChanged);
    return () => {
      i18n.off('languageChanged', handleLanguageChanged);
    };
  }, []);

  return <>{children}</>;
}
