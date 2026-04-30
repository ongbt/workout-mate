export interface Exercise {
  id: string;
  name: string;
  durationSeconds: number;
}

export interface WorkoutConfig {
  id: string;
  name: string;
  exercises: Exercise[];
  restSeconds: number;
  restBetweenRoundsSeconds: number;
  rounds: number;
}
