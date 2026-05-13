import * as Sentry from '@sentry/react';

const SENTRY_DSN = import.meta.env['VITE_SENTRY_DSN'];

let initialized = false;

export function initSentry(): void {
  if (initialized) return;

  if (!SENTRY_DSN) {
    console.log('[Sentry] DSN not configured, skipping initialization');
    return;
  }

  initialized = true;

  Sentry.init({
    dsn: SENTRY_DSN,
    environment: import.meta.env['MODE'] ?? 'development',
  });

  console.log('[Sentry] Initialized');
}

export function isSentryEnabled(): boolean {
  return initialized;
}
