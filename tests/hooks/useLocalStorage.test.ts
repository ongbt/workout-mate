import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';

// We need to mock localStorage for the test
const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((k) => delete store[k]);
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
  });
});

import { useLocalStorage } from '../../src/hooks/useLocalStorage';

describe('useLocalStorage', () => {
  it('returns initial value when storage is empty', () => {
    const { result } = renderHook(() => useLocalStorage('test', ['a']));
    expect(result.current[0]).toEqual(['a']);
  });

  it('reads existing value from localStorage', () => {
    store['test'] = JSON.stringify(['b', 'c']);
    const { result } = renderHook(() => useLocalStorage('test', ['a']));
    expect(result.current[0]).toEqual(['b', 'c']);
  });

  it('updates value in state and localStorage', () => {
    const { result } = renderHook(() => useLocalStorage('test', ['a']));
    act(() => {
      result.current[1](['d']);
    });
    expect(result.current[0]).toEqual(['d']);
    expect(JSON.parse(store['test']!)).toEqual(['d']);
  });

  it('handles functional update', () => {
    store['test'] = JSON.stringify([1, 2]);
    const { result } = renderHook(() => useLocalStorage<number[]>('test', []));
    act(() => {
      result.current[1]((prev) => [...prev, 3]);
    });
    expect(result.current[0]).toEqual([1, 2, 3]);
  });

  it('falls back to initial value on corrupt JSON', () => {
    store['test'] = 'not-valid-json';
    const { result } = renderHook(() => useLocalStorage('test', ['fallback']));
    expect(result.current[0]).toEqual(['fallback']);
  });
});
