import type { WorkoutPhase } from '../types';

interface Props {
  phase: WorkoutPhase;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onStop: () => void;
}

export function ControlButtons({ phase, isRunning, onStart, onPause, onResume, onSkip, onStop }: Props) {
  if (phase === 'finished') return null;

  if (phase === 'idle') {
    return (
      <button
        type="button"
        onClick={onStart}
        className="w-full py-4 rounded-xl bg-primary text-background font-bold text-lg"
      >
        Start Workout
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onStop}
        className="flex-1 py-4 rounded-xl bg-red-500/20 text-red-400 font-semibold border border-red-500/30"
      >
        Stop
      </button>
      {isRunning ? (
        <button
          type="button"
          onClick={onPause}
          className="flex-1 py-4 rounded-xl bg-rest text-background font-bold"
        >
          Pause
        </button>
      ) : (
        <button
          type="button"
          onClick={onResume}
          className="flex-1 py-4 rounded-xl bg-primary text-background font-bold"
        >
          Resume
        </button>
      )}
      <button
        type="button"
        onClick={onSkip}
        className="flex-1 py-4 rounded-xl bg-surface text-text font-semibold"
      >
        Skip
      </button>
    </div>
  );
}
