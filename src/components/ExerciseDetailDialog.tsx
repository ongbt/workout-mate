import { useTranslation } from 'react-i18next';
import type { Exercise } from '../types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';

interface Props {
  exercise: Exercise | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ExerciseDetailDialog({ exercise, open, onOpenChange }: Props) {
  const { t } = useTranslation();

  if (!exercise) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>{exercise.name}</DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4">
          {exercise.imageUrl && (
            <img
              src={exercise.imageUrl}
              alt={exercise.name}
              className="aspect-video w-full rounded-xl object-cover"
              loading="lazy"
            />
          )}
          <div className="space-y-3">
            {exercise.bodyParts && exercise.bodyParts.length > 0 && (
              <div>
                <span className="text-text-muted text-xs">
                  {t('labels.bodyParts')}
                </span>
                <p className="text-sm capitalize">
                  {exercise.bodyParts.join(', ')}
                </p>
              </div>
            )}
            {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
              <div>
                <span className="text-text-muted text-xs">
                  {t('labels.targetMuscles')}
                </span>
                <p className="text-sm capitalize">
                  {exercise.targetMuscles.join(', ')}
                </p>
              </div>
            )}
            {exercise.equipments && exercise.equipments.length > 0 && (
              <div>
                <span className="text-text-muted text-xs">
                  {t('labels.equipments')}
                </span>
                <p className="text-sm capitalize">
                  {exercise.equipments.join(', ')}
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
