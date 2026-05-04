import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

const exerciseValidator = v.object({
  id: v.string(),
  name: v.string(),
  durationSeconds: v.number(),
});

const workoutFields = {
  name: v.string(),
  exercises: v.array(exerciseValidator),
  restSeconds: v.number(),
  restBetweenRoundsSeconds: v.number(),
  rounds: v.number(),
};

export const list = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query('workouts')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const create = mutation({
  args: workoutFields,
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    return ctx.db.insert('workouts', { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id('workouts'),
    name: v.string(),
    exercises: v.array(exerciseValidator),
    restSeconds: v.number(),
    restBetweenRoundsSeconds: v.number(),
    rounds: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const workout = await ctx.db.get(args.id);
    if (!workout || workout.userId !== userId) throw new Error('Not found');
    const { id, ...fields } = args;
    return ctx.db.replace(id, { ...fields, userId });
  },
});

export const remove = mutation({
  args: { id: v.id('workouts') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const workout = await ctx.db.get(args.id);
    if (!workout || workout.userId !== userId) return;
    await ctx.db.delete(args.id);
  },
});

export const getDefaults = query({
  handler: async (ctx) => {
    return ctx.db.query('defaultWorkouts').collect();
  },
});

export const seedDefaults = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query('defaultWorkouts').collect();
    if (existing.length > 0) return;

    await ctx.db.insert('defaultWorkouts', {
      name: 'Full Body',
      exercises: [
        {
          id: crypto.randomUUID(),
          name: 'Chest - Push-ups',
          durationSeconds: 45,
        },
        {
          id: crypto.randomUUID(),
          name: 'Shoulder - Dumbbell - Right',
          durationSeconds: 25,
        },
        {
          id: crypto.randomUUID(),
          name: 'Shoulder - Dumbbell - Left',
          durationSeconds: 25,
        },
        {
          id: crypto.randomUUID(),
          name: 'Bicep - Dumbbell - Right',
          durationSeconds: 25,
        },
        {
          id: crypto.randomUUID(),
          name: 'Bicep - Dumbbell - Left',
          durationSeconds: 25,
        },
        {
          id: crypto.randomUUID(),
          name: 'Tricep - Dumbbell - Right',
          durationSeconds: 25,
        },
        {
          id: crypto.randomUUID(),
          name: 'Tricep - Dumbbell - Left',
          durationSeconds: 25,
        },
        { id: crypto.randomUUID(), name: 'Abs - Plank', durationSeconds: 45 },
        {
          id: crypto.randomUUID(),
          name: 'Abs - Power Over',
          durationSeconds: 45,
        },
        {
          id: crypto.randomUUID(),
          name: 'Abs - Reverse Corkscrew',
          durationSeconds: 45,
        },
        {
          id: crypto.randomUUID(),
          name: 'Abs - Bicycle Crunches',
          durationSeconds: 45,
        },
        { id: crypto.randomUUID(), name: 'Legs - Squats', durationSeconds: 45 },
        { id: crypto.randomUUID(), name: 'Legs - Lunges', durationSeconds: 45 },
        {
          id: crypto.randomUUID(),
          name: 'Back - Overheads - Right',
          durationSeconds: 25,
        },
        {
          id: crypto.randomUUID(),
          name: 'Back - Overheads - Left',
          durationSeconds: 25,
        },
      ],
      restSeconds: 45,
      restBetweenRoundsSeconds: 60,
      rounds: 3,
    });
    await ctx.db.insert('defaultWorkouts', {
      name: 'Upper Body',
      exercises: [
        { id: crypto.randomUUID(), name: 'Push-ups', durationSeconds: 30 },
        { id: crypto.randomUUID(), name: 'Shoulder Taps', durationSeconds: 30 },
        {
          id: crypto.randomUUID(),
          name: 'Diamond Push-ups',
          durationSeconds: 30,
        },
        { id: crypto.randomUUID(), name: 'Tricep Dips', durationSeconds: 30 },
      ],
      restSeconds: 45,
      restBetweenRoundsSeconds: 60,
      rounds: 3,
    });
    await ctx.db.insert('defaultWorkouts', {
      name: 'Core Crusher',
      exercises: [
        { id: crypto.randomUUID(), name: 'Plank', durationSeconds: 30 },
        { id: crypto.randomUUID(), name: 'Crunches', durationSeconds: 30 },
        { id: crypto.randomUUID(), name: 'Leg Raises', durationSeconds: 30 },
        {
          id: crypto.randomUUID(),
          name: 'Bicycle Crunches',
          durationSeconds: 30,
        },
      ],
      restSeconds: 30,
      restBetweenRoundsSeconds: 60,
      rounds: 3,
    });
    await ctx.db.insert('defaultWorkouts', {
      name: 'Lower Body',
      exercises: [
        { id: crypto.randomUUID(), name: 'Squats', durationSeconds: 30 },
        { id: crypto.randomUUID(), name: 'Lunges', durationSeconds: 30 },
        { id: crypto.randomUUID(), name: 'Wall Sit', durationSeconds: 30 },
        { id: crypto.randomUUID(), name: 'Glute Bridges', durationSeconds: 30 },
      ],
      restSeconds: 45,
      restBetweenRoundsSeconds: 60,
      rounds: 3,
    });
    await ctx.db.insert('defaultWorkouts', {
      name: 'HIIT Cardio',
      exercises: [
        { id: crypto.randomUUID(), name: 'Burpees', durationSeconds: 20 },
        {
          id: crypto.randomUUID(),
          name: 'Mountain Climbers',
          durationSeconds: 20,
        },
        { id: crypto.randomUUID(), name: 'High Knees', durationSeconds: 20 },
        { id: crypto.randomUUID(), name: 'Jump Squats', durationSeconds: 20 },
      ],
      restSeconds: 15,
      restBetweenRoundsSeconds: 45,
      rounds: 4,
    });
  },
});
