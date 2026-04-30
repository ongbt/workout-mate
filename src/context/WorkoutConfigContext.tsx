import { createContext, useContext, useCallback, type ReactNode } from 'react';
import { v4 as uuid } from 'uuid';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { STORAGE_KEY } from '../constants';
import type { WorkoutConfig } from '../types';

interface WorkoutConfigContextValue {
  workouts: WorkoutConfig[];
  addWorkout: (workout: Omit<WorkoutConfig, 'id'>) => void;
  updateWorkout: (workout: WorkoutConfig) => void;
  deleteWorkout: (id: string) => void;
}

const WorkoutConfigContext = createContext<WorkoutConfigContextValue | null>(null);

export function WorkoutConfigProvider({ children }: { children: ReactNode }) {
  const [workouts, setWorkouts] = useLocalStorage<WorkoutConfig[]>(STORAGE_KEY, []);

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
