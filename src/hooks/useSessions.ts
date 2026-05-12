import { useCallback } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '../../convex/_generated/api';
import type { Doc } from '../../convex/_generated/dataModel';
import type { WorkoutSessionRecord, WorkoutCompletion } from '../types';

function toSessionRecord(doc: Doc<'sessions'>): WorkoutSessionRecord {
  return {
    _id: doc._id,
    workoutId: doc.workoutId,
    workoutName: doc.workoutName,
    completedAt: doc.completedAt,
    totalDurationMs: doc.totalDurationMs,
    exerciseCount: doc.exerciseCount,
    roundsCompleted: doc.roundsCompleted,
  };
}

export function useSessions(limit = 10) {
  const data = useQuery(api.sessions.list, { limit });
  const createMutation = useMutation(api.sessions.create);
  const count = useQuery(api.sessions.count);

  const sessions: WorkoutSessionRecord[] = data?.map(toSessionRecord) ?? [];

  const recordSession = useCallback(
    async (
      workoutId: string,
      workoutName: string,
      completion: WorkoutCompletion,
    ) => {
      await createMutation({
        workoutId,
        workoutName,
        completedAt: completion.completedAt,
        totalDurationMs: completion.totalDurationMs,
        exerciseCount: completion.exerciseCount,
        roundsCompleted: completion.roundsCompleted,
      });
    },
    [createMutation],
  );

  return { sessions, totalCount: count ?? 0, recordSession };
}
