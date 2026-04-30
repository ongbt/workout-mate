import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useTimer } from '../../src/hooks/useTimer';
import { TIMER_INTERVAL_MS } from '../../src/constants';

describe('useTimer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('starts with timeRemainingMs of 0 and not running', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(onComplete));

    expect(result.current.timeRemainingMs).toBe(0);
    expect(result.current.isRunning).toBe(false);
  });

  it('counts down and calls onComplete when time runs out', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(onComplete));

    act(() => {
      result.current.start(5000);
    });

    expect(result.current.isRunning).toBe(true);
    expect(result.current.timeRemainingMs).toBe(5000);

    // Advance by 1 tick
    act(() => {
      vi.advanceTimersByTime(TIMER_INTERVAL_MS);
    });

    expect(result.current.timeRemainingMs).toBeLessThan(5000);
    expect(onComplete).not.toHaveBeenCalled();

    // Advance past the full duration
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.timeRemainingMs).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('pauses and resumes correctly', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(onComplete));

    act(() => {
      result.current.start(10000);
    });

    // Let 2 seconds pass
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    const remainingAfter2s = result.current.timeRemainingMs;

    act(() => {
      result.current.pause();
    });

    expect(result.current.isRunning).toBe(false);

    // No more time should pass while paused (advance fake timers, but interval is cleared)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    act(() => {
      result.current.resume();
    });

    expect(result.current.isRunning).toBe(true);
    // Time should be close to the remaining after pause
    expect(result.current.timeRemainingMs).toBeLessThanOrEqual(remainingAfter2s);
  });

  it('stops and resets timer', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useTimer(onComplete));

    act(() => {
      result.current.start(10000);
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.timeRemainingMs).toBe(0);
    expect(result.current.isRunning).toBe(false);
    expect(onComplete).not.toHaveBeenCalled();
  });
});
