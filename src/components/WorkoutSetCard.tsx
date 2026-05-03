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
    <div className="bg-surface rounded-xl p-4 flex items-center gap-3">
      <button
        type="button"
        onClick={onPlay}
        className="flex-1 flex items-center gap-3 min-w-0 text-left cursor-pointer"
      >
        <span className="flex items-center justify-center w-10 h-10 rounded-full bg-primary text-background shrink-0">
          <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M8 5v14l11-7z" />
          </svg>
        </span>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold truncate">{workout.name}</h3>
          <p className="text-sm text-text-muted">
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
        className="w-10 h-10 flex items-center justify-center rounded-lg text-text-muted hover:bg-background shrink-0"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      </button>
    </div>
  );
}
