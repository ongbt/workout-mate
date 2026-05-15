import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

const exerciseFields = {
  id: v.string(),
  exerciseId: v.optional(v.string()),
  name: v.string(),
  durationSeconds: v.number(),
  bodyParts: v.optional(v.array(v.string())),
  targetMuscles: v.optional(v.array(v.string())),
  equipments: v.optional(v.array(v.string())),
  imageUrl: v.optional(v.string()),
};

export default defineSchema({
  ...authTables,

  workouts: defineTable({
    name: v.string(),
    exercises: v.array(v.object(exerciseFields)),
    restSeconds: v.number(),
    restBetweenRoundsSeconds: v.number(),
    rounds: v.number(),
    userId: v.id('users'),
  }).index('by_user', ['userId']),

  sessions: defineTable({
    workoutId: v.string(),
    workoutName: v.string(),
    completedAt: v.number(),
    totalDurationMs: v.number(),
    exerciseCount: v.number(),
    roundsCompleted: v.number(),
    userId: v.id('users'),
  }).index('by_user', ['userId']),

  defaultWorkouts: defineTable({
    name: v.string(),
    exercises: v.array(v.object(exerciseFields)),
    restSeconds: v.number(),
    restBetweenRoundsSeconds: v.number(),
    rounds: v.number(),
  }),

  userSettings: defineTable({
    rapidApiKey: v.optional(v.string()),
    lastRequestTimestamp: v.optional(v.number()),
    requestCount: v.optional(v.number()),
    userId: v.id('users'),
  }).index('by_user', ['userId']),

  exerciseLibrary: defineTable({
    exerciseId: v.string(),
    name: v.string(),
    bodyParts: v.array(v.string()),
    targetMuscles: v.array(v.string()),
    equipments: v.array(v.string()),
    imageUrl: v.string(),
    instructions: v.optional(v.array(v.string())),
    secondaryMuscles: v.optional(v.array(v.string())),
    cachedAt: v.number(),
  })
    .index('by_exerciseId', ['exerciseId'])
    .index('by_bodyParts', ['bodyParts']),
});
