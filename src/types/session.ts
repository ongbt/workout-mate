export type WorkoutPhase = 'idle' | 'exercise' | 'rest' | 'finished';

export interface WorkoutSessionState {
  configId: string;
  phase: WorkoutPhase;
  currentRound: number;
  currentExerciseIndex: number;
  timeRemainingMs: number;
  totalRounds: number;
  totalExercises: number;
}
