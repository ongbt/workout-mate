import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEY } from '../constants';
import type { WorkoutConfig } from '../types';

const defaultWorkouts: WorkoutConfig[] = [
  {
    id: uuid(),
    name: 'Full Body',
    exercises: [
      { id: uuid(), name: 'Chest - Push-ups', durationSeconds: 30 },
      { id: uuid(), name: 'Shoulder - Dumbbell - Right', durationSeconds: 25 },
      { id: uuid(), name: 'Shoulder - Dumbbell - Left', durationSeconds: 25 },
      { id: uuid(), name: 'Bicep - Dumbbell - Right', durationSeconds: 25 },
      { id: uuid(), name: 'Bicep - Dumbbell - Left', durationSeconds: 25 }, 
      { id: uuid(), name: 'Tricep - Dumbbell - Right', durationSeconds: 25 },
      { id: uuid(), name: 'Tricep - Dumbbell - Left', durationSeconds: 25 }, 
      { id: uuid(), name: 'Abs - Plank', durationSeconds: 45 },
      { id: uuid(), name: 'Abs - Power Over', durationSeconds: 45 },
      { id: uuid(), name: 'Abs - Reverse Corkscrew', durationSeconds: 45 },
      { id: uuid(), name: 'Abs - Bicycle Crunches', durationSeconds: 45 },
      { id: uuid(), name: 'Legs - Squats', durationSeconds: 45 },
      { id: uuid(), name: 'Legs - Lunges', durationSeconds: 45 },
      { id: uuid(), name: 'Legs - Calf Raises', durationSeconds: 45 },
      { id: uuid(), name: 'Back - Overheads - Right', durationSeconds: 25 },
      { id: uuid(), name: 'Back - Overheads - Left', durationSeconds: 25 },
      { id: uuid(), name: 'Back - Dumbbell - Right', durationSeconds: 25 },
      { id: uuid(), name: 'Back - Dumbbell - Left', durationSeconds: 25 },
    ],
    restSeconds: 45,
    restBetweenRoundsSeconds: 60,
    rounds: 3,
  }, {
    id: uuid(),
    name: 'Upper Body',
    exercises: [
      { id: uuid(), name: 'Push-ups', durationSeconds: 30 },
      { id: uuid(), name: 'Shoulder Taps', durationSeconds: 30 },
      { id: uuid(), name: 'Diamond Push-ups', durationSeconds: 30 },
      { id: uuid(), name: 'Tricep Dips', durationSeconds: 30 },    
    ],
    restSeconds: 45,
    restBetweenRoundsSeconds: 60,
    rounds: 3,
  },
  {
    id: uuid(),
    name: 'Core Crusher',
    exercises: [
      { id: uuid(), name: 'Plank', durationSeconds: 30 },
      { id: uuid(), name: 'Crunches', durationSeconds: 30 },
      { id: uuid(), name: 'Leg Raises', durationSeconds: 30 },
      { id: uuid(), name: 'Bicycle Crunches', durationSeconds: 30 },
    ],
    restSeconds: 30,
    restBetweenRoundsSeconds: 60,
    rounds: 3,
  },
  {
    id: uuid(),
    name: 'Lower Body',
    exercises: [
      { id: uuid(), name: 'Squats', durationSeconds: 30 },
      { id: uuid(), name: 'Lunges', durationSeconds: 30 },
      { id: uuid(), name: 'Wall Sit', durationSeconds: 30 },
      { id: uuid(), name: 'Glute Bridges', durationSeconds: 30 },
    ],
    restSeconds: 45,
    restBetweenRoundsSeconds: 60,
    rounds: 3,
  },
  {
    id: uuid(),
    name: 'HIIT Cardio',
    exercises: [
      { id: uuid(), name: 'Burpees', durationSeconds: 20 },
      { id: uuid(), name: 'Mountain Climbers', durationSeconds: 20 },
      { id: uuid(), name: 'High Knees', durationSeconds: 20 },
      { id: uuid(), name: 'Jump Squats', durationSeconds: 20 },
    ],
    restSeconds: 15,
    restBetweenRoundsSeconds: 45,
    rounds: 4,
  },
];

interface WorkoutConfigContextValue {
  workouts: WorkoutConfig[];
  addWorkout: (workout: Omit<WorkoutConfig, 'id'>) => void;
  updateWorkout: (workout: WorkoutConfig) => void;
  deleteWorkout: (id: string) => void;
}

const WorkoutConfigContext = createContext<WorkoutConfigContextValue | null>(null);

export function WorkoutConfigProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useLocalStorage<WorkoutConfig[]>(STORAGE_KEY, defaultWorkouts);

  const addWorkout = useCallback(
    (workout: Omit<WorkoutConfig, 'id'>) => {
      const newWorkout: WorkoutConfig = { ...workout, id: uuid() };
      setWorkouts((prev) => [...prev, newWorkout]);
    },
    [setWorkouts],
  );

  const updateWorkout = useCallback(
    (workout: WorkoutConfig) => {
      setWorkouts((prev) => prev.map((w) => (w.id === workout.id ? workout : w)));
    },
    [setWorkouts],
  );

  const deleteWorkout = useCallback(
    (id: string) => {
      setWorkouts((prev) => prev.filter((w) => w.id !== id));
    },
    [setWorkouts],
  );

  return (
    <WorkoutConfigContext.Provider value={{ workouts, addWorkout, updateWorkout, deleteWorkout }}>
      {children}
    </WorkoutConfigContext.Provider>
  );
}

export function useWorkoutConfig(): WorkoutConfigContextValue {
  const ctx = useContext(WorkoutConfigContext);
  if (!ctx) throw new Error('useWorkoutConfig must be used within WorkoutConfigProvider');
  return ctx;
}
