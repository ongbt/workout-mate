import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveWorkout } from '../../src/hooks/useActiveWorkout';
import type { WorkoutConfig } from '../../src/types';

const config: WorkoutConfig = {
  id: 'w1',
  name: 'Test',
  segments: [
    {
      type: 'exercise' as const,
      id: 'e1',
      name: 'Push-ups',
      durationSeconds: 5,
    },
    { type: 'rest' as const, id: 'r1', durationSeconds: 2 },
    { type: 'exercise' as const, id: 'e2', name: 'Squats', durationSeconds: 3 },
    { type: 'rest' as const, id: 'r2', durationSeconds: 5 },
  ],
  rounds: 2,
};

let speechCallbacks: Array<() => void> = [];

vi.mock('../../src/hooks/useSpeechSynthesis', () => ({
  useSpeechSynthesis: () => ({
    speak: vi.fn((_text: string, onEnd?: () => void) => {
      if (onEnd) speechCallbacks.push(onEnd);
    }),
    cancel: vi.fn(),
    isSpeaking: false,
  }),
}));

vi.mock('../../src/hooks/useBeep', () => ({
  useBeep: () => vi.fn(),
}));

vi.mock('../../src/hooks/useWakeLock', () => ({
  useWakeLock: () => ({
    request: vi.fn(),
    release: vi.fn(),
  }),
}));

beforeEach(() => {
  vi.useFakeTimers();
  speechCallbacks = [];
});

afterEach(() => {
  vi.useRealTimers();
});

function flushSpeech() {
  const cbs = [...speechCallbacks];
  speechCallbacks = [];
  for (const cb of cbs) cb();
}

describe('useActiveWorkout onComplete', () => {
  it('calls onComplete when workout finishes naturally', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useActiveWorkout(config, onComplete));

    // Start the workout
    act(() => {
      result.current.handleStart();
    });

    expect(result.current.sessionState.phase).toBe('exercise');

    // Flush the blocking speech so the timer starts
    act(() => {
      flushSpeech();
    });

    expect(result.current.isRunning).toBe(true);

    // Exercise 1 (5s) → Rest (2s) → Exercise 2 (3s) → Rest (5s) →
    // Exercise 1 (5s) → Rest (2s) → Exercise 2 (3s) → finished (end rest skipped on last round)
    // Total active: 5+2+3+5+5+2+3 = 25s

    // Exercise 1 (5s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.sessionState.phase).toBe('rest');
    act(() => {
      flushSpeech();
    });

    // Rest r1 (2s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.sessionState.phase).toBe('exercise');
    act(() => {
      flushSpeech();
    });

    // Exercise 2 (3s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    expect(result.current.sessionState.phase).toBe('rest');
    act(() => {
      flushSpeech();
    });

    // Rest r2 between rounds (5s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.sessionState.phase).toBe('exercise');
    act(() => {
      flushSpeech();
    });

    // Round 2 Exercise 1 (5s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.sessionState.phase).toBe('rest');
    act(() => {
      flushSpeech();
    });

    // Round 2 Rest r1 (2s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(result.current.sessionState.phase).toBe('exercise');
    act(() => {
      flushSpeech();
    });

    // Round 2 Exercise 2 (3s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });
    // Last round — end-of-list rest skipped, should be finished
    expect(result.current.sessionState.phase).toBe('finished');
    expect(onComplete).toHaveBeenCalledTimes(1);

    const completion = onComplete.mock.calls[0]![0];
    expect(completion.exerciseCount).toBe(2);
    expect(completion.roundsCompleted).toBe(2);
    expect(completion.totalDurationMs).toBeGreaterThan(0);
  });

  it('does not call onComplete when workout is stopped', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useActiveWorkout(config, onComplete));

    act(() => {
      result.current.handleStart();
    });

    act(() => {
      result.current.handleStop();
    });

    expect(result.current.sessionState.phase).toBe('idle');
    expect(onComplete).not.toHaveBeenCalled();
  });

  it('does not call onComplete when skipped through', () => {
    const onComplete = vi.fn();
    const { result } = renderHook(() => useActiveWorkout(config, onComplete));

    act(() => {
      result.current.handleStart();
    });

    // Skip advances to rest immediately
    act(() => {
      result.current.handleSkip();
    });

    expect(result.current.sessionState.phase).toBe('rest');
    expect(onComplete).not.toHaveBeenCalled();
  });
});
