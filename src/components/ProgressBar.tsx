interface Props {
  currentRound: number;
  totalRounds: number;
  currentExerciseIndex: number;
  totalExercises: number;
}

export function ProgressBar({ currentRound, totalRounds, currentExerciseIndex, totalExercises }: Props) {
  const totalSteps = totalRounds * totalExercises;
  const currentStep = (currentRound - 1) * totalExercises + currentExerciseIndex;
  const pct = totalSteps > 0 ? (currentStep / totalSteps) * 100 : 0;

  return (
    <div className="flex flex-col items-center gap-1 w-full">
      <div className="w-full h-2 bg-surface rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full transition-all duration-300"
          style={{ width: `${pct}%` }}
        />
      </div>
      <div className="flex justify-between w-full text-xs text-text-muted">
        <span>Round {currentRound}/{totalRounds}</span>
        <span>Ex {currentExerciseIndex + 1}/{totalExercises}</span>
      </div>
    </div>
  );
}
