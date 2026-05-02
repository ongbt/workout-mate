import { useCallback, useEffect } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { WorkoutConfig } from '../types';

function toWorkoutConfig(doc: any): WorkoutConfig {
  return {
    id: doc._id,
    name: doc.name,
    exercises: doc.exercises,
    restSeconds: doc.restSeconds,
    restBetweenRoundsSeconds: doc.restBetweenRoundsSeconds,
    rounds: doc.rounds,
  };
}

export function useWorkouts() {
  const data = useQuery(api.workouts.list);
  const createMutation = useMutation(api.workouts.create);
  const updateMutation = useMutation(api.workouts.update);
  const removeMutation = useMutation(api.workouts.remove);

  const workouts: WorkoutConfig[] = data?.map(toWorkoutConfig) ?? [];

  const addWorkout = useCallback(
    async (workout: Omit<WorkoutConfig, 'id'>) => {
      const { id: _, ...fields } = workout as any;
      await createMutation(fields);
    },
    [createMutation],
  );

  const updateWorkout = useCallback(
    async (workout: WorkoutConfig) => {
      const { id, ...fields } = workout;
      await updateMutation({ id: id as any, ...fields });
    },
    [updateMutation],
  );

  const deleteWorkout = useCallback(
    async (id: string) => {
      await removeMutation({ id: id as any });
    },
    [removeMutation],
  );

  return { workouts, addWorkout, updateWorkout, deleteWorkout };
}

export function useDefaultWorkouts(): WorkoutConfig[] {
  const data = useQuery(api.workouts.getDefaults);
  const seed = useMutation(api.workouts.seedDefaults);

  useEffect(() => {
    if (data !== undefined && data.length === 0) {
      seed();
    }
  }, [data, seed]);

  return (data ?? []).map(toWorkoutConfig);
}
