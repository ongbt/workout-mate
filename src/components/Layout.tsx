import { type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthActions } from '@convex-dev/auth/react';

export function Layout({ children }: { children: ReactNode }) {
  const { t } = useTranslation();
  const { signOut } = useAuthActions();

  return (
    <div className="flex flex-col h-full max-w-lg mx-auto px-5 pb-safe">
      <div className="flex items-center justify-end py-2">
        <button
          type="button"
          onClick={() => void signOut()}
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
