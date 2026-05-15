import { useCallback, useEffect, useRef } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { useTranslation } from 'react-i18next';
import { api } from '../../convex/_generated/api';
import type { Doc, Id } from '../../convex/_generated/dataModel';
import { useError } from '../context/ErrorContext';
import type { WorkoutConfig } from '../types';

function toWorkoutConfig(
  doc: Doc<'workouts'> | Doc<'defaultWorkouts'>,
): WorkoutConfig {
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
      await createMutation(workout);
    },
    [createMutation],
  );

  const updateWorkout = useCallback(
    async (workout: WorkoutConfig) => {
      const { id, ...fields } = workout;
      await updateMutation({ id: id as Id<'workouts'>, ...fields });
    },
    [updateMutation],
  );

  const deleteWorkout = useCallback(
    async (id: string) => {
      await removeMutation({ id: id as Id<'workouts'> });
    },
    [removeMutation],
  );

  return { workouts, addWorkout, updateWorkout, deleteWorkout };
}

export function useDefaultWorkouts(): WorkoutConfig[] {
  const data = useQuery(api.workouts.getDefaults);
  const seed = useMutation(api.workouts.seedDefaults);
  const { showError } = useError();
  const { t } = useTranslation();
  const seedAttempted = useRef(false);

  useEffect(() => {
    if (data !== undefined && data.length === 0 && !seedAttempted.current) {
      seedAttempted.current = true;
      seed().catch((e: unknown) => {
        showError(
          t('errors.unexpected'),
          e instanceof Error ? e.message : t('errors.tryAgain'),
        );
      });
    }
  }, [data, seed, showError, t]);

  return (data ?? []).map(toWorkoutConfig);
}
