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
  const totalExercises = workout.exercises.length;

  return (
    <Card
      onClick={onPlay}
      className="cursor-pointer transition-colors hover:bg-white/[0.12]"
    >
      <CardContent className="flex items-center gap-3">
        <span className="bg-primary text-primary-foreground flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
          <Play className="ml-0.5 h-5 w-5" fill="currentColor" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold">{workout.name}</h3>
          <p className="text-muted-foreground text-sm">
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
