import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';

let mockSettings: unknown = null;

vi.mock('convex/react', () => ({
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: true }),
  useQuery: () => mockSettings,
  useMutation: () => vi.fn().mockResolvedValue(undefined),
  ConvexReactClient: vi.fn(),
}));

import { useUserSettings } from '../../src/hooks/useUserSettings';

describe('useUserSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockSettings = null;
  });

  describe('hasRapidApiKey', () => {
    it('returns false when settings query returns null', () => {
      mockSettings = null;
      const { result } = renderHook(() => useUserSettings());
      expect(result.current.hasRapidApiKey).toBe(false);
    });

    it('returns false when rapidApiKey is undefined', () => {
      mockSettings = { rapidApiKey: undefined };
      const { result } = renderHook(() => useUserSettings());
      expect(result.current.hasRapidApiKey).toBe(false);
    });

    it('returns false when rapidApiKey is empty string', () => {
      mockSettings = { rapidApiKey: '' };
      const { result } = renderHook(() => useUserSettings());
      expect(result.current.hasRapidApiKey).toBe(false);
    });

    it('returns true when rapidApiKey has a value', () => {
      mockSettings = { rapidApiKey: 'abc123key' };
      const { result } = renderHook(() => useUserSettings());
      expect(result.current.hasRapidApiKey).toBe(true);
    });
  });

  it('exposes setRapidApiKey and removeRapidApiKey as functions', () => {
    const { result } = renderHook(() => useUserSettings());
    expect(typeof result.current.setRapidApiKey).toBe('function');
    expect(typeof result.current.removeRapidApiKey).toBe('function');
  });
});
