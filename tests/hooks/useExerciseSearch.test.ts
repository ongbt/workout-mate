import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

const hasRapidApiKeyMock = vi.fn(() => false);

vi.mock('../../src/hooks/useUserSettings', () => ({
  useUserSettings: () => ({
    hasRapidApiKey: hasRapidApiKeyMock(),
    setRapidApiKey: vi.fn(),
    removeRapidApiKey: vi.fn(),
  }),
}));

vi.mock('convex/react', () => ({
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: true }),
  useQuery: () => null,
  useMutation: () => vi.fn().mockResolvedValue(undefined),
  useAction: () => vi.fn().mockResolvedValue([]),
  ConvexReactClient: vi.fn(),
}));

import { useExerciseSearch } from '../../src/hooks/useExerciseSearch';

describe('useExerciseSearch', () => {
  describe('needsApiKey', () => {
    it('returns true when user has no RapidAPI key', () => {
      hasRapidApiKeyMock.mockReturnValue(false);
      const { result } = renderHook(() => useExerciseSearch());
      expect(result.current.needsApiKey).toBe(true);
    });

    it('returns false when user has a RapidAPI key', () => {
      hasRapidApiKeyMock.mockReturnValue(true);
      const { result } = renderHook(() => useExerciseSearch());
      expect(result.current.needsApiKey).toBe(false);
    });
  });

  describe('initial state', () => {
    it('has empty body parts, results, and null error', () => {
      hasRapidApiKeyMock.mockReturnValue(false);
      const { result } = renderHook(() => useExerciseSearch());
      expect(result.current.bodyParts).toEqual([]);
      expect(result.current.results).toEqual([]);
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });

    it('has null selected body part by default', () => {
      const { result } = renderHook(() => useExerciseSearch());
      expect(result.current.selectedBodyPart).toBeNull();
    });

    it('has empty search query by default', () => {
      const { result } = renderHook(() => useExerciseSearch());
      expect(result.current.searchQuery).toBe('');
    });
  });

  describe('setSelectedBodyPart', () => {
    it('updates selected body part', () => {
      hasRapidApiKeyMock.mockReturnValue(true);
      const { result } = renderHook(() => useExerciseSearch());
      act(() => {
        result.current.setSelectedBodyPart('chest');
      });
      expect(result.current.selectedBodyPart).toBe('chest');
    });

    it('allows setting null to deselect', () => {
      hasRapidApiKeyMock.mockReturnValue(true);
      const { result } = renderHook(() => useExerciseSearch());
      act(() => {
        result.current.setSelectedBodyPart('chest');
      });
      act(() => {
        result.current.setSelectedBodyPart(null);
      });
      expect(result.current.selectedBodyPart).toBeNull();
    });
  });

  describe('setSearchQuery', () => {
    it('updates search query immediately', () => {
      hasRapidApiKeyMock.mockReturnValue(true);
      const { result } = renderHook(() => useExerciseSearch());
      act(() => {
        result.current.setSearchQuery('push');
      });
      expect(result.current.searchQuery).toBe('push');
    });
  });

  describe('retry', () => {
    it('exposes a callable retry function', () => {
      hasRapidApiKeyMock.mockReturnValue(true);
      const { result } = renderHook(() => useExerciseSearch());
      expect(typeof result.current.retry).toBe('function');
    });
  });
});
