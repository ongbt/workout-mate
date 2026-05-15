import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type { Exercise } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ExerciseDetailDialog } from './ExerciseDetailDialog';

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

export function ExerciseFormRow({
  exercise,
  error,
  onChange,
  onBlur,
  onDelete,
  canDelete,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Props) {
  const { t } = useTranslation();
  const [durStr, setDurStr] = useState(String(exercise.durationSeconds));
  const [showDetail, setShowDetail] = useState(false);

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
    <div className="bg-surface space-y-1 rounded-lg px-3 py-1.5">
      <div className="flex items-center gap-2">
        {exercise.exerciseId ? (
          <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="flex-1 truncate text-left text-sm font-medium"
          >
            {exercise.name}
          </button>
        ) : (
          <Input
            type="text"
            value={exercise.name}
            onChange={(e) => onChange({ ...exercise, name: e.target.value })}
            onBlur={onBlur}
            placeholder={t('components.exerciseFormRow.placeholder')}
            className="flex-1"
            aria-invalid={error || undefined}
          />
        )}
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          disabled={!canDelete}
          className="text-destructive hover:bg-destructive/20 shrink-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={t('components.exerciseFormRow.moveUp')}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={t('components.exerciseFormRow.moveDown')}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        {exercise.bodyParts?.length || exercise.targetMuscles?.length ? (
          <span className="text-text-muted min-w-0 flex-1 truncate text-xs capitalize">
            {[exercise.bodyParts?.[0], exercise.targetMuscles?.[0]]
              .filter(Boolean)
              .join(' · ')}
          </span>
        ) : (
          <span className="flex-1" />
        )}
        <Input
          type="text"
          inputMode="numeric"
          value={durStr}
          onChange={(e) => handleDurChange(e.target.value)}
          onBlur={handleDurBlur}
          className="w-16 shrink-0 text-center"
        />
      </div>
      <ExerciseDetailDialog
        exercise={exercise.exerciseId ? exercise : null}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </div>
  );
}
