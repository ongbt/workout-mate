import { useState, useCallback, useRef, useEffect } from 'react';
import { useTimer } from './useTimer';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useBeep } from './useBeep';
import { useWakeLock } from './useWakeLock';
import { COUNTDOWN_WARN_THRESHOLD, TEN_SECOND_INTERVAL } from '../constants';
import type {
  WorkoutConfig,
  WorkoutSegment,
  ExerciseSegment,
  WorkoutCompletion,
} from '../types';
import type { WorkoutPhase, WorkoutSessionState } from '../types';

function getExercises(segments: WorkoutSegment[]): ExerciseSegment[] {
  return segments.filter((s) => s.type === 'exercise') as ExerciseSegment[];
}

function getNextExerciseSegment(
  segments: WorkoutSegment[],
  fromIndex: number,
): { index: number; segment: ExerciseSegment } | null {
  for (let i = fromIndex; i < segments.length; i++) {
    if (segments[i]!.type === 'exercise') {
      return { index: i, segment: segments[i]! as ExerciseSegment };
    }
  }
  return null;
}

export function useActiveWorkout(
  config: WorkoutConfig,
  onComplete?: (completion: WorkoutCompletion) => void,
) {
  const [phase, setPhase] = useState<WorkoutPhase>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentSegmentIndex, setCurrentSegmentIndex] = useState(0);
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis();
  const beep = useBeep();
  const wakeLock = useWakeLock();

  const configRef = useRef(config);
  const phaseRef = useRef(phase);
  const roundRef = useRef(currentRound);
  const idxRef = useRef(currentSegmentIndex);

  useEffect(() => {
    configRef.current = config;
  });
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);
  useEffect(() => {
    roundRef.current = currentRound;
  }, [currentRound]);
  useEffect(() => {
    idxRef.current = currentSegmentIndex;
  }, [currentSegmentIndex]);

  const suppressFirstReadoutRef = useRef(false);
  const startTimerRef = useRef<(ms: number) => void>(() => {});
  const onCompleteRef = useRef(onComplete);
  const sessionStartRef = useRef(0);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const startTimerAfterSpeech = useCallback(
    (text: string, durationMs: number, afterText?: string) => {
      suppressFirstReadoutRef.current = true;
      speak(text, () => {
        startTimerRef.current(durationMs);
        if (afterText) speak(afterText);
      });
    },
    [speak],
  );

  const speakRef = useRef(speak);
  useEffect(() => {
    speakRef.current = speak;
  });

  const advancePhase = useCallback(() => {
    const p = phaseRef.current;
    const idx = idxRef.current;
    const round = roundRef.current;
    const cfg = configRef.current;
    const segments = cfg.segments;
    const cur = segments[idx];

    if (!cur) {
      setPhase('finished');
      speak('Workout complete! Great job!');
      wakeLock.release();
      onCompleteRef.current?.({
        completedAt: Date.now(),
        totalDurationMs: Date.now() - sessionStartRef.current,
        exerciseCount: getExercises(segments).length,
        roundsCompleted: cfg.rounds,
      });
      return;
    }

    if (p === 'exercise') {
      if (cur.type !== 'exercise') {
        // Current segment is not an exercise but we're in exercise phase —
        // skip to next exercise segment
        const next = getNextExerciseSegment(segments, idx + 1);
        if (next) {
          setCurrentSegmentIndex(next.index);
          setPhase('exercise');
          startTimerAfterSpeech(
            `${next.segment.name}. Go!`,
            next.segment.durationSeconds * 1000,
          );
        } else {
          setPhase('finished');
          speakRef.current('Workout complete!');
        }
        return;
      }

      // Find the next segment
      const nextIdx = idx + 1;
      if (nextIdx < segments.length) {
        const next = segments[nextIdx]!;
        if (next.type === 'rest') {
          const nextEx = getNextExerciseSegment(segments, nextIdx + 1);
          const isEndOfList = nextEx === null;
          // Skip end-of-list rest on the last round
          if (isEndOfList && round >= cfg.rounds) {
            setPhase('finished');
            speak('Workout complete! Great job!');
            wakeLock.release();
            onCompleteRef.current?.({
              completedAt: Date.now(),
              totalDurationMs: Date.now() - sessionStartRef.current,
              exerciseCount: getExercises(segments).length,
              roundsCompleted: cfg.rounds,
            });
            return;
          }
          setCurrentSegmentIndex(nextIdx);
          setPhase('rest');
          if (nextEx) {
            startTimerAfterSpeech(
              `Rest for ${next.durationSeconds} seconds`,
              next.durationSeconds * 1000,
              `Next: ${nextEx.segment.name}`,
            );
          } else {
            startTimerAfterSpeech(
              `Round ${round} complete. Rest for ${next.durationSeconds} seconds`,
              next.durationSeconds * 1000,
            );
          }
        } else {
          // Next is exercise — go directly
          setCurrentSegmentIndex(nextIdx);
          setPhase('exercise');
          startTimerAfterSpeech(
            `${next.name}. Go!`,
            next.durationSeconds * 1000,
          );
        }
      } else {
        // End of segments — move to next round or finish
        if (round >= cfg.rounds) {
          setPhase('finished');
          speak('Workout complete! Great job!');
          wakeLock.release();
          onCompleteRef.current?.({
            completedAt: Date.now(),
            totalDurationMs: Date.now() - sessionStartRef.current,
            exerciseCount: getExercises(segments).length,
            roundsCompleted: cfg.rounds,
          });
        } else {
          setCurrentRound((r) => r + 1);
          setCurrentSegmentIndex(0);
          const first = segments[0]!;
          if (first.type === 'exercise') {
            setPhase('exercise');
            startTimerAfterSpeech(
              `Round ${round + 1}. ${first.name}. Go!`,
              first.durationSeconds * 1000,
            );
          } else {
            // First segment in list is rest — handle it
            setPhase('rest');
            startTimerAfterSpeech(
              `Rest for ${first.durationSeconds} seconds`,
              first.durationSeconds * 1000,
            );
          }
        }
      }
      return;
    }

    // Was rest, move to next segment
    const nextIdx = idx + 1;

    if (nextIdx >= segments.length) {
      if (round >= cfg.rounds) {
        setPhase('finished');
        speak('Workout complete! Great job!');
        wakeLock.release();
        onCompleteRef.current?.({
          completedAt: Date.now(),
          totalDurationMs: Date.now() - sessionStartRef.current,
          exerciseCount: getExercises(segments).length,
          roundsCompleted: cfg.rounds,
        });
        return;
      }
      setCurrentRound((r) => r + 1);
      setCurrentSegmentIndex(0);
      const first = segments[0]!;
      if (first.type === 'exercise') {
        setPhase('exercise');
        startTimerAfterSpeech(
          `Round ${round + 1}. ${first.name}. Go!`,
          first.durationSeconds * 1000,
        );
      } else {
        setPhase('rest');
        startTimerAfterSpeech(
          `Rest for ${first.durationSeconds} seconds`,
          first.durationSeconds * 1000,
        );
      }
      return;
    }

    const next = segments[nextIdx]!;
    if (next.type === 'exercise') {
      setCurrentSegmentIndex(nextIdx);
      setPhase('exercise');
      startTimerAfterSpeech(`${next.name}. Go!`, next.durationSeconds * 1000);
    } else {
      // Rest followed by rest — just go to rest
      setCurrentSegmentIndex(nextIdx);
      setPhase('rest');
      startTimerAfterSpeech(
        `Rest for ${next.durationSeconds} seconds`,
        next.durationSeconds * 1000,
      );
    }
  }, [speak, startTimerAfterSpeech, wakeLock]);

  const handleTimerComplete = useCallback(() => {
    advancePhase();
  }, [advancePhase]);

  const {
    timeRemainingMs,
    isRunning,
    start: startTimer,
    pause,
    resume,
    stop: stopTimer,
  } = useTimer(handleTimerComplete);

  useEffect(() => {
    startTimerRef.current = startTimer;
  }, [startTimer]);

  useEffect(() => () => cancelSpeech(), [cancelSpeech]);

  const prevSecondsRef = useRef(-1);

  useEffect(() => {
    if (!isRunning || phase === 'finished') return;
    const secs = Math.ceil(timeRemainingMs / 1000);
    if (secs === prevSecondsRef.current || secs <= 0) return;

    if (suppressFirstReadoutRef.current) {
      suppressFirstReadoutRef.current = false;
      prevSecondsRef.current = secs;
      return;
    }

    if (isSpeaking) return;

    prevSecondsRef.current = secs;

    if (secs <= COUNTDOWN_WARN_THRESHOLD) {
      beep(1200, 100);
    } else if (secs % TEN_SECOND_INTERVAL === 0) {
      speak(`${secs} seconds`);
    }
  }, [timeRemainingMs, isRunning, phase, beep, isSpeaking, speak]);

  const handleStart = useCallback(() => {
    wakeLock.request();
    sessionStartRef.current = Date.now();
    const first = config.segments[0];
    if (!first) {
      setPhase('finished');
      return;
    }
    setPhase(first.type === 'exercise' ? 'exercise' : 'rest');
    setCurrentRound(1);
    setCurrentSegmentIndex(0);
    if (first.type === 'exercise') {
      startTimerAfterSpeech(
        `Round 1. ${first.name}. Go!`,
        first.durationSeconds * 1000,
      );
    } else {
      startTimerAfterSpeech(
        `Rest for ${first.durationSeconds} seconds`,
        first.durationSeconds * 1000,
      );
    }
  }, [config, startTimerAfterSpeech, wakeLock]);

  const handlePause = useCallback(() => {
    wakeLock.release();
    pause();
  }, [pause, wakeLock]);

  const handleResume = useCallback(() => {
    wakeLock.request();
    resume();
  }, [resume, wakeLock]);

  const handleStop = useCallback(() => {
    cancelSpeech();
    wakeLock.release();
    stopTimer();
    setPhase('idle');
    setCurrentRound(1);
    setCurrentSegmentIndex(0);
  }, [stopTimer, wakeLock, cancelSpeech]);

  const handleSkip = useCallback(() => {
    stopTimer();
    advancePhase();
  }, [stopTimer, advancePhase]);

  const sessionState: WorkoutSessionState = {
    configId: config.id,
    phase,
    currentRound,
    currentExerciseIndex: currentSegmentIndex,
    timeRemainingMs,
    totalRounds: config.rounds,
    totalExercises: getExercises(config.segments).length,
  };

  const currentSegment = config.segments[currentSegmentIndex] ?? null;
  const currentExercise =
    currentSegment?.type === 'exercise' ? currentSegment : null;

  const nextExercise = ((): ExerciseSegment | null => {
    const nextEx = getNextExerciseSegment(
      config.segments,
      currentSegmentIndex + 1,
    );
    if (nextEx) return nextEx.segment;
    if (currentRound < config.rounds) {
      const first = getNextExerciseSegment(config.segments, 0);
      return first?.segment ?? null;
    }
    return null;
  })();

  const totalDurationMs = currentSegment
    ? currentSegment.durationSeconds * 1000
    : 0;

  const showExerciseInfo = phase === 'exercise' || phase === 'rest';

  return {
    sessionState,
    totalDurationMs,
    isRunning,
    currentExercise: showExerciseInfo ? currentExercise : null,
    nextExercise: showExerciseInfo ? nextExercise : null,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleSkip,
  };
}
