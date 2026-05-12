import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useActiveWorkout } from '../../src/hooks/useActiveWorkout';
import type { WorkoutConfig } from '../../src/types';

const config: WorkoutConfig = {
  id: 'w1',
  name: 'Test',
  exercises: [
    { id: 'e1', name: 'Push-ups', durationSeconds: 5 },
    { id: 'e2', name: 'Squats', durationSeconds: 3 },
  ],
  restSeconds: 2,
  restBetweenRoundsSeconds: 5,
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

    // Run through exercise 1 (5s → rest 2s → exercise 2 3s → rest 2s →
    // rest between rounds 5s → exercise 1 5s → rest 2s → exercise 2 3s → rest 2s → finished)
    // Total: 5+2+3+2+5+5+2+3+2 = 29s
    // We need to flush speech after each phase transition to get timer running again.
    // Exercise 1 (5s): handleStart already set it up with blocking speech.
    // After flushing, timer started. Advance 5000ms.

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Timer complete → advancePhase called → phase should be 'rest'
    expect(result.current.sessionState.phase).toBe('rest');

    // Flush blocking speech for rest
    act(() => {
      flushSpeech();
    });

    // Advance rest (2s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Should now be exercise 2
    expect(result.current.sessionState.phase).toBe('exercise');

    // Flush speech for exercise 2
    act(() => {
      flushSpeech();
    });

    // Advance exercise 2 (3s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Should be rest (between rounds since round 1 exercise 2 was last)
    expect(result.current.sessionState.phase).toBe('rest');

    // Flush speech
    act(() => {
      flushSpeech();
    });

    // Advance rest between rounds (5s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Should be round 2 exercise 1
    expect(result.current.sessionState.phase).toBe('exercise');

    // Flush speech
    act(() => {
      flushSpeech();
    });

    // Advance exercise 1 round 2 (5s)
    act(() => {
      vi.advanceTimersByTime(5000);
    });

    // Rest
    expect(result.current.sessionState.phase).toBe('rest');
    act(() => {
      flushSpeech();
    });

    // Advance rest (2s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Exercise 2 round 2
    expect(result.current.sessionState.phase).toBe('exercise');
    act(() => {
      flushSpeech();
    });

    // Advance exercise 2 (3s)
    act(() => {
      vi.advanceTimersByTime(3000);
    });

    // Rest (last rest of last round)
    expect(result.current.sessionState.phase).toBe('rest');
    act(() => {
      flushSpeech();
    });

    // Advance final rest (2s)
    act(() => {
      vi.advanceTimersByTime(2000);
    });

    // Now we should be finished
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
