import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env['VITE_SENTRY_DSN'];

let initialized = false;

export function initSentry(): void {
  if (initialized) return;
  initialized = true;

  if (!SENTRY_DSN) {
    console.log('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env['MODE'] ?? 'development',
  });

  console.log('[Sentry] Initialized');
}
