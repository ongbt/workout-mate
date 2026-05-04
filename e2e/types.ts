// E2E test globals injected via Playwright addInitScript
declare global {
  interface Window {
    __E2E_AUTH__?: {
      isAuthenticated: boolean;
    };
  }
}

export {};
