import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, act } from '@testing-library/react';
import { ConsentProvider } from '../../src/context/ConsentContext';
import { SentryLoader } from '../../src/components/SentryLoader';

const { mockInitSentry } = vi.hoisted(() => ({
  mockInitSentry: vi.fn(),
}));

vi.mock('@/lib/sentry', () => ({
  initSentry: mockInitSentry,
  isSentryEnabled: () => true,
}));

const CONSENT_KEY = 'ga_consent';

describe('SentryLoader', () => {
  beforeEach(() => {
    mockInitSentry.mockClear();
    localStorage.clear();
  });

  it('renders null (invisible)', () => {
    const { container } = render(
      <ConsentProvider>
        <SentryLoader />
      </ConsentProvider>,
    );
    expect(container.firstChild).toBeNull();
  });

  it('does not call initSentry when consent is pending', () => {
    render(
      <ConsentProvider>
        <SentryLoader />
      </ConsentProvider>,
    );
    expect(mockInitSentry).not.toHaveBeenCalled();
  });

  it('does not call initSentry when consent is denied', async () => {
    localStorage.setItem(CONSENT_KEY, 'denied');
    await act(async () => {
      render(
        <ConsentProvider>
          <SentryLoader />
        </ConsentProvider>,
      );
    });
    expect(mockInitSentry).not.toHaveBeenCalled();
  });

  it('calls initSentry when consent is granted', async () => {
    localStorage.setItem(CONSENT_KEY, 'granted');
    await act(async () => {
      render(
        <ConsentProvider>
          <SentryLoader />
        </ConsentProvider>,
      );
    });
    expect(mockInitSentry).toHaveBeenCalledOnce();
  });
});
