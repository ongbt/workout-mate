import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

export default defineSchema({
  ...authTables,

  workouts: defineTable({
    name: v.string(),
    exercises: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        durationSeconds: v.number(),
      }),
    ),
    restSeconds: v.number(),
    restBetweenRoundsSeconds: v.number(),
    rounds: v.number(),
    userId: v.id('users'),
  }).index('by_user', ['userId']),

  defaultWorkouts: defineTable({
    name: v.string(),
    exercises: v.array(
      v.object({
        id: v.string(),
        name: v.string(),
        durationSeconds: v.number(),
      }),
    ),
    restSeconds: v.number(),
    restBetweenRoundsSeconds: v.number(),
    rounds: v.number(),
  }),
});
