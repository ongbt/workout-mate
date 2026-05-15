import { useTranslation } from 'react-i18next';
import { Play, Pencil } from 'lucide-react';
import type { WorkoutConfig } from '../types';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';

interface Props {
  workout: WorkoutConfig;
  onEdit: () => void;
  onPlay: () => void;
}

export function WorkoutSetCard({ workout, onEdit, onPlay }: Props) {
  const { t } = useTranslation();
  const totalExercises = workout.segments.filter(
    (s) => s.type === 'exercise',
  ).length;

  return (
    <Card
      size="sm"
      onClick={onPlay}
      className="cursor-pointer rounded-2xl transition-colors hover:bg-white/[0.12]"
    >
      <CardContent className="flex items-center gap-2.5">
        <span className="bg-primary text-primary-foreground flex h-8 w-8 shrink-0 items-center justify-center rounded-full">
          <Play className="ml-0.5 h-4 w-4" fill="currentColor" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-base font-semibold">{workout.name}</h3>
          <p className="text-muted-foreground text-xs">
            {t('labels.exercises', { count: totalExercises })}
            {' · '}
            {t('labels.rounds', { count: workout.rounds })}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          <Pencil className="h-5 w-5" />
        </Button>
      </CardContent>
    </Card>
  );
}
