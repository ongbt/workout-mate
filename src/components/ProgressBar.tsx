import { useTranslation } from 'react-i18next';
import { Progress, ProgressTrack, ProgressIndicator } from './ui/progress';

interface Props {
  currentRound: number;
  totalRounds: number;
  currentExerciseIndex: number;
  totalExercises: number;
}

export function ProgressBar({
  currentRound,
  totalRounds,
  currentExerciseIndex,
  totalExercises,
}: Props) {
  const { t } = useTranslation();
  const totalSteps = totalRounds * totalExercises;
  const currentStep =
    (currentRound - 1) * totalExercises + currentExerciseIndex;
  const pct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="flex w-full flex-col items-center gap-1">
      <Progress value={pct} className="w-full">
        <ProgressTrack>
          <ProgressIndicator />
        </ProgressTrack>
      </Progress>
      <div className="text-muted-foreground flex w-full justify-between text-xs">
        <span>
          {t('components.progressBar.round', {
            current: currentRound,
            total: totalRounds,
          })}
        </span>
        <span>
          {t('components.progressBar.exercise', {
            current: currentExerciseIndex + 1,
            total: totalExercises,
          })}
        </span>
      </div>
    </div>
  );
}
