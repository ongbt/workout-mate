import { type ReactNode, useCallback } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../hooks/useAuth';
import { useError } from '../context/ErrorContext';
import { Button } from './ui/button';

export const CSP_POLICY =
  "default-src 'self'; " +
  "script-src 'self' https://www.googletagmanager.com https://eu-assets.i.posthog.com; " +
  "style-src 'self' 'unsafe-inline'; " +
  "connect-src 'self' wss://*.convex.cloud https://*.convex.cloud https://accounts.google.com " +
  'https://www.google-analytics.com https://analytics.google.com https://*.ingest.sentry.io https://*.ingest.us.sentry.io ' +
  'https://*.i.posthog.com; ' +
  'frame-src https://accounts.google.com; ' +
  "img-src 'self' data: https://*.cloudfront.net https://cdn.exercisedb.dev; " +
  "worker-src 'self'; " +
  "font-src 'self'; " +
  "object-src 'none'; " +
  "form-action 'self'; " +
  "base-uri 'self'";

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
    <>
      <Helmet>
        <meta http-equiv="Content-Security-Policy" content={CSP_POLICY} />
      </Helmet>
      <div className="pb-safe mx-auto flex h-full max-w-lg flex-col px-5">
        <div className="flex items-center justify-end py-2">
          <Button variant="ghost" size="xs" onClick={handleSignOut}>
            {t('actions.signOut')}
          </Button>
        </div>
        <main className="flex flex-1 flex-col">{children}</main>
      </div>
    </>
  );
}
