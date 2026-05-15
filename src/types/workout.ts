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

export interface RestSegment {
  type: 'rest';
  id: string;
  durationSeconds: number;
}

export interface ExerciseSegment extends Exercise {
  type: 'exercise';
}

export type WorkoutSegment = ExerciseSegment | RestSegment;

export interface WorkoutConfig {
  id: string;
  name: string;
  segments: WorkoutSegment[];
  rounds: number;
}
