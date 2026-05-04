import { type ReactNode, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useError } from '../context/ErrorContext';

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { signOut } = useAuth();
  const { showError } = useError();

  const handleSignOut = useCallback(async () => {
    try {
      await signOut();
    } catch (e) {
      showError(
        t('errors.unexpected'),
        e instanceof Error ? e.message : t('errors.tryAgain'),
      );
    }
  }, [signOut, showError, t]);

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-5 pb-safe">
      <div className="flex items-center justify-end py-2">
        <button
          type="button"
          onClick={handleSignOut}
          className="text-xs text-text-muted hover:text-text px-2 py-1 rounded-lg hover:bg-surface transition-colors"
        >
          {t('actions.signOut')}
        </button>
      </div>
      <main className="flex flex-col flex-1">
        {children}
      </main>
    </div>
  );
}
