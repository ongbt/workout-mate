import posthog from 'posthog-js';

const POSTHOG_KEY: string | undefined = import.meta.env['VITE_POSTHOG_KEY'];
const POSTHOG_HOST: string =
  import.meta.env['VITE_POSTHOG_HOST'] || 'https://eu.i.posthog.com';

let initialized = false;

export function initPostHog(): void {
  if (initialized || !POSTHOG_KEY) return;
  initialized = true;

  posthog.init(POSTHOG_KEY, {
    api_host: POSTHOG_HOST,
    persistence: 'localStorage',
    autocapture: false,
    disable_session_recording: false,
    loaded: (ph) => {
      ph.register({ environment: import.meta.env['MODE'] ?? 'development' });
      console.log('[PostHog] initialized');
    },
  });
}

export function getPostHog() {
  return posthog;
}

declare global {
  interface Window {
    posthog?: typeof posthog;
  }
}
