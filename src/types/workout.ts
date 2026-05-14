export interface Exercise {
  id: string;
  exerciseId?: string;
  name: string;
  durationSeconds: number;
  bodyParts?: string[];
  targetMuscles?: string[];
  equipments?: string[];
  imageUrl?: string;
}

export interface WorkoutConfig {
  id: string;
  name: string;
  exercises: Exercise[];
  restSeconds: number;
  restBetweenRoundsSeconds: number;
  rounds: number;
}
