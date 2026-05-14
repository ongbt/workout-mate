import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockGtag = vi.fn();

vi.stubGlobal('document', {
  createElement: vi.fn(() => ({
    async: false,
    src: '',
    onload: null as (() => void) | null,
    onerror: null as (() => void) | null,
  })),
  head: { appendChild: vi.fn() },
});

vi.stubGlobal('window', {
  gtag: mockGtag,
  dataLayer: [],
});

describe('trackPageView', () => {
  beforeEach(() => {
    vi.resetModules();
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', 'G-TEST123');
    mockGtag.mockClear();
  });

  it('sends page_view event with only page_path', async () => {
    const { trackPageView } = await import('../../src/lib/analytics');
    trackPageView('/test-path');
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/test-path',
    });
  });

  it('includes hash fragments in the path', async () => {
    const { trackPageView } = await import('../../src/lib/analytics');
    trackPageView('/#/active/abc123');
    expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
      page_path: '/#/active/abc123',
    });
  });

  it('does not include page_title in the event', async () => {
    const { trackPageView } = await import('../../src/lib/analytics');
    trackPageView('/some-path');
    const callArgs = mockGtag.mock.calls[0] as [
      string,
      string,
      Record<string, string>,
    ];
    expect(callArgs[2]).not.toHaveProperty('page_title');
  });

  it('no-ops when GA measurement ID is not configured', async () => {
    vi.stubEnv('VITE_GA_MEASUREMENT_ID', undefined);
    const { trackPageView } = await import('../../src/lib/analytics');
    mockGtag.mockClear();
    trackPageView('/test');
    expect(mockGtag).not.toHaveBeenCalled();
  });
});
