import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSentryInit = vi.fn();

vi.mock('@sentry/react', () => ({
  init: mockSentryInit,
  captureException: vi.fn(),
  captureMessage: vi.fn(),
}));

async function importSentryModule() {
  return import('../../src/lib/sentry');
}

describe('sentry module', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SENTRY_DSN', 'https://test@o123.ingest.sentry.io/456');
    mockSentryInit.mockClear();
  });

  it('isSentryEnabled returns false before init', async () => {
    const { isSentryEnabled } = await importSentryModule();
    expect(isSentryEnabled()).toBe(false);
  });

  it('isSentryEnabled returns true after init', async () => {
    const { initSentry, isSentryEnabled } = await importSentryModule();
    initSentry();
    expect(isSentryEnabled()).toBe(true);
  });

  it('initSentry calls Sentry.init with correct config', async () => {
    const { initSentry } = await importSentryModule();
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledWith({
      dsn: 'https://test@o123.ingest.sentry.io/456',
      environment: 'test',
    });
  });

  it('initSentry only initializes once', async () => {
    const { initSentry } = await importSentryModule();
    initSentry();
    initSentry();
    expect(mockSentryInit).toHaveBeenCalledOnce();
  });
});

describe('sentry module without DSN', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_SENTRY_DSN', '');
    mockSentryInit.mockClear();
  });

  it('skips initialization when no DSN is present', async () => {
    const { initSentry, isSentryEnabled } = await importSentryModule();
    initSentry();
    expect(mockSentryInit).not.toHaveBeenCalled();
    expect(isSentryEnabled()).toBe(false);
  });
});
