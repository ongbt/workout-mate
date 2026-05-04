import { useState, useCallback, useRef, useEffect } from 'react';
import { useTimer } from './useTimer';
import { useSpeechSynthesis } from './useSpeechSynthesis';
import { useBeep } from './useBeep';
import { useWakeLock } from './useWakeLock';
import { COUNTDOWN_WARN_THRESHOLD, TEN_SECOND_INTERVAL } from '../constants';
import type { WorkoutConfig, Exercise } from '../types';
import type { WorkoutPhase, WorkoutSessionState } from '../types';

export function useActiveWorkout(config: WorkoutConfig) {
  const [phase, setPhase] = useState<WorkoutPhase>('idle');
  const [currentRound, setCurrentRound] = useState(1);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [restDurationMs, setRestDurationMs] = useState(0);
  const { speak, cancel: cancelSpeech, isSpeaking } = useSpeechSynthesis();
  const beep = useBeep();
  const wakeLock = useWakeLock();

  const configRef = useRef(config);
  const phaseRef = useRef(phase);
  const roundRef = useRef(currentRound);
  const idxRef = useRef(currentExerciseIndex);

  // Sync refs for use in callbacks that need latest values without re-creating
  useEffect(() => { configRef.current = config; });
  useEffect(() => { phaseRef.current = phase; }, [phase]);
  useEffect(() => { roundRef.current = currentRound; }, [currentRound]);
  useEffect(() => { idxRef.current = currentExerciseIndex; }, [currentExerciseIndex]);

  const suppressFirstReadoutRef = useRef(false);
  const startTimerRef = useRef<(ms: number) => void>(() => {});

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

  const advancePhase = useCallback(() => {
    const p = phaseRef.current;
    const idx = idxRef.current;
    const round = roundRef.current;
    const cfg = configRef.current;

    if (p === 'exercise') {
      const isLastExercise = idx >= cfg.exercises.length - 1;
      const isLastRound = round >= cfg.rounds;
      const restSecs = isLastExercise && !isLastRound ? cfg.restBetweenRoundsSeconds : cfg.restSeconds;
      setRestDurationMs(restSecs * 1000);
      setPhase('rest');
      if (isLastExercise) {
        startTimerAfterSpeech(
          `Round ${round} complete. Rest for ${restSecs} seconds`,
          restSecs * 1000,
        );
      } else {
        const nextEx = cfg.exercises[idx + 1]!;
        startTimerAfterSpeech(
          `Rest for ${restSecs} seconds`,
          restSecs * 1000,
          `Next: ${nextEx.name}`,
        );
      }
      return;
    }

    // Was rest, move to next exercise or round
    const nextIdx = idx + 1;

    if (nextIdx >= cfg.exercises.length) {
      if (round >= cfg.rounds) {
        setPhase('finished');
        speak('Workout complete! Great job!');
        wakeLock.release();
        return;
      }
      setCurrentRound((r) => r + 1);
      setCurrentExerciseIndex(0);
      setPhase('exercise');
      const ex = cfg.exercises[0]!;
      startTimerAfterSpeech(
        `Round ${round + 1}. ${ex.name}. Go!`,
        ex.durationSeconds * 1000,
      );
      return;
    }

    setCurrentExerciseIndex(nextIdx);
    setPhase('exercise');
    const nextEx = cfg.exercises[nextIdx]!;
    startTimerAfterSpeech(`${nextEx.name}. Go!`, nextEx.durationSeconds * 1000);
  }, [speak, startTimerAfterSpeech, wakeLock]);

  const handleTimerComplete = useCallback(() => {
    advancePhase();
  }, [advancePhase]);

  const { timeRemainingMs, isRunning, start: startTimer, pause, resume, stop: stopTimer } = useTimer(handleTimerComplete);

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
    const firstExercise = config.exercises[0]!;
    setPhase('exercise');
    setCurrentRound(1);
    setCurrentExerciseIndex(0);
    startTimerAfterSpeech(
      `Round 1. ${firstExercise.name}. Go!`,
      firstExercise.durationSeconds * 1000,
    );
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
    setCurrentExerciseIndex(0);
  }, [stopTimer, wakeLock, cancelSpeech]);

  const handleSkip = useCallback(() => {
    stopTimer();
    advancePhase();
  }, [stopTimer, advancePhase]);

  const sessionState: WorkoutSessionState = {
    configId: config.id,
    phase,
    currentRound,
    currentExerciseIndex,
    timeRemainingMs,
    totalRounds: config.rounds,
    totalExercises: config.exercises.length,
  };

  const currentExercise = config.exercises[currentExerciseIndex] ?? null;

  const nextExercise = ((): Exercise | null => {
    const nextIdx = currentExerciseIndex + 1;
    if (nextIdx < config.exercises.length) return config.exercises[nextIdx]!;
    if (currentRound < config.rounds) return config.exercises[0]!;
    return null;
  })();

  const totalDurationMs =
    phase === 'exercise'
      ? (currentExercise?.durationSeconds ?? 0) * 1000
      : phase === 'rest'
        ? restDurationMs
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
