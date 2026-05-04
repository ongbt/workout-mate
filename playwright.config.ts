import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5199',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'pnpm dev --port 5199',
    url: 'http://localhost:5199',
    reuseExistingServer: false,
    env: {
      VITE_E2E: 'true',
      VITE_CONVEX_URL: 'https://resolute-wildcat-738.convex.cloud',
    },
    timeout: 30_000,
  },
  testMatch: '**/*.spec.ts',
});
