import { useTranslation } from 'react-i18next';

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
      <div className="bg-surface h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-primary h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="text-text-muted flex w-full justify-between text-xs">
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
