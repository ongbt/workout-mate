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

export interface WorkoutSessionRecord {
  _id: string;
  workoutId: string;
  workoutName: string;
  completedAt: number;
  totalDurationMs: number;
  exerciseCount: number;
  roundsCompleted: number;
}

export interface WorkoutCompletion {
  completedAt: number;
  totalDurationMs: number;
  exerciseCount: number;
  roundsCompleted: number;
}
