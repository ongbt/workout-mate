import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';

let mockNeedRefresh = false;
const mockSetNeedRefresh = vi.fn();
const mockUpdateServiceWorker = vi.fn();

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [mockNeedRefresh, mockSetNeedRefresh],
    updateServiceWorker: mockUpdateServiceWorker,
  }),
}));

describe('PwaUpdatePrompt', () => {
  it('returns null when no refresh needed', async () => {
    mockNeedRefresh = false;
    const { PwaUpdatePrompt } = await import('../../src/components/PwaUpdatePrompt');
    const { container } = render(<PwaUpdatePrompt />);
    expect(container.innerHTML).toBe('');
  });

  it('renders update prompt when needRefresh is true', async () => {
    mockNeedRefresh = true;
    vi.resetModules();
    const { PwaUpdatePrompt } = await import('../../src/components/PwaUpdatePrompt');
    const { getByText } = render(<PwaUpdatePrompt />);
    expect(getByText('components.pwaUpdatePrompt.newVersion')).toBeDefined();
    expect(getByText('actions.updateNow')).toBeDefined();
    expect(getByText('actions.dismiss')).toBeDefined();
  });

  it('calls updateServiceWorker on update click', async () => {
    mockNeedRefresh = true;
    mockUpdateServiceWorker.mockClear();
    vi.resetModules();
    const { PwaUpdatePrompt } = await import('../../src/components/PwaUpdatePrompt');
    const { getByText } = render(<PwaUpdatePrompt />);
    fireEvent.click(getByText('actions.updateNow'));
    expect(mockUpdateServiceWorker).toHaveBeenCalledWith(true);
  });

  it('calls setNeedRefresh(false) on dismiss', async () => {
    mockNeedRefresh = true;
    mockSetNeedRefresh.mockClear();
    vi.resetModules();
    const { PwaUpdatePrompt } = await import('../../src/components/PwaUpdatePrompt');
    const { getByText } = render(<PwaUpdatePrompt />);
    fireEvent.click(getByText('actions.dismiss'));
    expect(mockSetNeedRefresh).toHaveBeenCalledWith(false);
  });
});
