import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronUp, ChevronDown, X } from 'lucide-react';
import type { WorkoutSegment } from '../types';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { ExerciseDetailDialog } from './ExerciseDetailDialog';

interface Props {
  segment: WorkoutSegment;
  error: boolean;
  onChange: (updated: WorkoutSegment) => void;
  onBlur: () => void;
  onDelete: () => void;
  canDelete: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
}

export function ExerciseFormRow({
  segment,
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
  const [durStr, setDurStr] = useState(String(segment.durationSeconds));
  const [showDetail, setShowDetail] = useState(false);

  const handleDurChange = useCallback(
    (raw: string) => {
      setDurStr(raw);
      const n = parseInt(raw, 10);
      if (!isNaN(n) && n >= 0) {
        onChange({ ...segment, durationSeconds: n });
      }
    },
    [segment, onChange],
  );

  const handleDurBlur = useCallback(() => {
    const n = parseInt(durStr, 10);
    if (isNaN(n) || n < 0) {
      setDurStr(String(segment.durationSeconds));
    }
  }, [durStr, segment.durationSeconds]);

  if (segment.type === 'rest') {
    return (
      <div className="text-text-muted/60 flex items-center gap-1 rounded px-2 py-0.5 text-xs">
        <span className="select-none">{t('components.restRow.label')}</span>
        <Input
          type="text"
          inputMode="numeric"
          value={durStr}
          onChange={(e) => handleDurChange(e.target.value)}
          onBlur={handleDurBlur}
          className="text-text-muted/60 h-5 w-10 border-none bg-transparent px-0 text-center text-xs shadow-none"
        />
        <span className="select-none">s</span>
        <span className="flex-1" />
        <div className="flex shrink-0">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onMoveUp}
            disabled={!canMoveUp}
            aria-label={t('components.exerciseFormRow.moveUp')}
            className="h-5 w-5"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onMoveDown}
            disabled={!canMoveDown}
            aria-label={t('components.exerciseFormRow.moveDown')}
            className="h-5 w-5"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </div>
        <Button
          variant="ghost"
          size="icon-xs"
          onClick={onDelete}
          disabled={!canDelete}
          className="text-destructive/50 hover:bg-destructive/20 h-5 w-5"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  const ex = segment;

  return (
    <div className="bg-surface space-y-1 rounded-lg px-3 py-1.5">
      <div className="flex items-center gap-2">
        {ex.exerciseId ? (
          <button
            type="button"
            onClick={() => setShowDetail(true)}
            className="flex-1 truncate text-left text-sm font-medium"
          >
            {ex.name}
          </button>
        ) : (
          <Input
            type="text"
            value={ex.name}
            onChange={(e) => onChange({ ...ex, name: e.target.value })}
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
        {ex.bodyParts?.length || ex.targetMuscles?.length ? (
          <span className="text-text-muted min-w-0 flex-1 truncate text-xs capitalize">
            {[ex.bodyParts?.[0], ex.targetMuscles?.[0]]
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
        exercise={ex.exerciseId ? ex : null}
        open={showDetail}
        onOpenChange={setShowDetail}
      />
    </div>
  );
}
