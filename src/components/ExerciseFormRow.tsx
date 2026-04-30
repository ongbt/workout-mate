import { useState, useCallback } from 'react';
import type { Exercise } from '../types';

interface Props {
  exercise: Exercise;
  error: boolean;
  onChange: (updated: Exercise) => void;
  onBlur: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

const textClass = (error: boolean) =>
  `flex-1 bg-surface border rounded-lg px-3 py-2.5 text-text placeholder:text-text-muted/50 min-w-0 ${
    error ? 'border-red-500' : 'border-text-muted/30'
  }`;

const numClass = 'w-16 bg-surface border border-text-muted/30 rounded-lg px-2 py-2.5 text-center text-text';

const moveBtnClass =
  'w-8 h-8 flex items-center justify-center rounded-lg text-text-muted hover:text-text hover:bg-surface shrink-0 disabled:opacity-20 disabled:cursor-not-allowed';

export function ExerciseFormRow({ exercise, error, onChange, onBlur, onDelete, canDelete, onMoveUp, onMoveDown, canMoveUp, canMoveDown }: Props) {
  const [durStr, setDurStr] = useState(String(exercise.durationSeconds));

  const handleDurChange = useCallback(
    (raw: string) => {
      setDurStr(raw);
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 1) {
        onChange({ ...exercise, durationSeconds: n });
      }
    },
    [exercise, onChange],
  );

  const handleDurBlur = useCallback(() => {
    const n = parseInt(durStr, 10);
    if (isNaN(n) || n < 1) {
      setDurStr(String(exercise.durationSeconds));
    }
  }, [durStr, exercise.durationSeconds]);

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onMoveUp}
        disabled={!canMoveUp}
        className={moveBtnClass}
        aria-label="Move up"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 15l7-7 7 7" />
        </svg>
      </button>
      <button
        type="button"
        onClick={onMoveDown}
        disabled={!canMoveDown}
        className={moveBtnClass}
        aria-label="Move down"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <input
        type="text"
        value={exercise.name}
        onChange={(e) => onChange({ ...exercise, name: e.target.value })}
        onBlur={onBlur}
        placeholder="Exercise name"
        className={textClass(error)}
      />
      <input
        type="text"
        inputMode="numeric"
        value={durStr}
        onChange={(e) => handleDurChange(e.target.value)}
        onBlur={handleDurBlur}
        className={numClass}
      />
      <span className="text-xs text-text-muted w-8 shrink-0">sec</span>
      <button
        type="button"
        onClick={onDelete}
        disabled={!canDelete}
        className="w-10 h-10 flex items-center justify-center rounded-lg text-red-400 hover:bg-red-400/10 disabled:opacity-30 disabled:cursor-not-allowed shrink-0"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
