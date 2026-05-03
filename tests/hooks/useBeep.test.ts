import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBeep } from '../../src/hooks/useBeep';

describe('useBeep', () => {
  let connectOscToGain: ReturnType<typeof vi.fn>;
  let startOsc: ReturnType<typeof vi.fn>;
  let stopOsc: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    connectOscToGain = vi.fn();
    startOsc = vi.fn();
    stopOsc = vi.fn();
    const connectGainToDest = vi.fn();
    const setValueAtTime = vi.fn();
    const exponentialRamp = vi.fn();

    const oscInstance = {
      type: '',
      frequency: { value: 0 },
      connect: connectOscToGain,
      start: startOsc,
      stop: stopOsc,
    };

    const gainInstance = {
      gain: {
        setValueAtTime,
        exponentialRampToValueAtTime: exponentialRamp,
      },
      connect: connectGainToDest,
    };

    const createOsc = vi.fn(() => oscInstance);
    const createGain = vi.fn(() => gainInstance);

    globalThis.AudioContext = vi.fn(function () {
      return {
        createOscillator: createOsc,
        createGain: createGain,
        destination: Symbol('destination'),
        currentTime: 1.5,
      };
    }) as unknown as typeof AudioContext;
  });

  it('returns a beep function', () => {
    const { result } = renderHook(() => useBeep());
    expect(typeof result.current).toBe('function');
  });

  it('creates AudioContext on first call', () => {
    const { result } = renderHook(() => useBeep());
    act(() => {
      result.current();
    });
    expect(globalThis.AudioContext).toHaveBeenCalled();
  });

  it('connects oscillator to gain', () => {
    const { result } = renderHook(() => useBeep());
    act(() => {
      result.current(440, 200);
    });
    expect(connectOscToGain).toHaveBeenCalled();
  });

  it('starts and stops oscillator', () => {
    const { result } = renderHook(() => useBeep());
    act(() => {
      result.current();
    });
    expect(startOsc).toHaveBeenCalled();
    expect(stopOsc).toHaveBeenCalled();
  });

  it('catches errors gracefully when AudioContext throws', () => {
    globalThis.AudioContext = vi.fn(function () {
      throw new Error('Not supported');
    }) as unknown as typeof AudioContext;
    const { result } = renderHook(() => useBeep());
    expect(() => {
      act(() => {
        result.current();
      });
    }).not.toThrow();
  });
});
