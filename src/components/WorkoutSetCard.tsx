import { useTranslation } from 'react-i18next';
import type { WorkoutConfig } from '../types';

interface Props {
  workout: WorkoutConfig;
  onEdit: () => void;
  onPlay: () => void;
}

export function WorkoutSetCard({ workout, onEdit, onPlay }: Props) {
  const { t } = useTranslation();
  const totalExercises = workout.exercises.length;

  return (
    <div className="bg-surface flex items-center gap-3 rounded-xl p-4">
      <button
        type="button"
        onClick={onPlay}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left"
      >
        <span className="bg-primary text-background flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <svg
            className="ml-0.5 h-5 w-5"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">{workout.name}</h3>
          <p className="text-text-muted text-sm">
            {t('labels.exercises', { count: totalExercises })}
            {' · '}
            {t('labels.rounds', { count: workout.rounds })}
          </p>
        </div>
      </button>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="text-text-muted hover:bg-background flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
          />
        </svg>
      </button>
    </div>
  );
}
