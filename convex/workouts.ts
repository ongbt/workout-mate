import { v } from 'convex/values';
import { mutation, query, type MutationCtx } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { checkNameLength, segmentValidator } from './validators';

const workoutFields = {
  name: v.string(),
  segments: v.array(segmentValidator),
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
    checkNameLength(args.name, 'Workout name');
    for (const seg of args.segments) {
      if (seg.type === 'exercise') {
        checkNameLength(seg.name, 'Exercise name');
      }
    }
    return ctx.db.insert('workouts', { ...args, userId });
  },
});

export const update = mutation({
  args: {
    id: v.id('workouts'),
    name: v.string(),
    segments: v.array(segmentValidator),
    rounds: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const workout = await ctx.db.get(args.id);
    if (!workout || workout.userId !== userId) throw new Error('Not found');
    checkNameLength(args.name, 'Workout name');
    for (const seg of args.segments) {
      if (seg.type === 'exercise') {
        checkNameLength(seg.name, 'Exercise name');
      }
    }
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

function randomId() {
  return Array.from({ length: 4 }, () =>
    Math.random().toString(36).substring(2),
  ).join('-');
}

function mkExercise(name: string, durationSeconds: number) {
  return {
    type: 'exercise' as const,
    id: randomId(),
    name,
    durationSeconds,
  };
}

function mkRest(durationSeconds: number) {
  return {
    type: 'rest' as const,
    id: randomId(),
    durationSeconds,
  };
}

export const seedDefaults = mutation({
  handler: async (ctx) => {
    const existing = await ctx.db.query('defaultWorkouts').collect();
    if (existing.length > 0) return;
    await seedDefaultWorkouts(ctx);
  },
});

async function seedDefaultWorkouts(ctx: MutationCtx) {
  await ctx.db.insert('defaultWorkouts', {
    name: 'Full Body',
    segments: [
      mkExercise('Chest - Push-ups', 45),
      mkRest(45),
      mkExercise('Shoulder - Dumbbell - Right', 25),
      mkExercise('Shoulder - Dumbbell - Left', 25),
      mkRest(45),
      mkExercise('Bicep - Dumbbell - Right', 25),
      mkExercise('Bicep - Dumbbell - Left', 25),
      mkRest(45),
      mkExercise('Tricep - Dumbbell - Right', 25),
      mkExercise('Tricep - Dumbbell - Left', 25),
      mkRest(45),
      mkExercise('Abs - Plank', 45),
      mkExercise('Abs - Power Over', 45),
      mkExercise('Abs - Reverse Corkscrew', 45),
      mkExercise('Abs - Bicycle Crunches', 45),
      mkRest(45),
      mkExercise('Legs - Squats', 45),
      mkExercise('Legs - Lunges', 45),
      mkRest(45),
      mkExercise('Back - Overheads - Right', 25),
      mkExercise('Back - Overheads - Left', 25),
      mkRest(60),
    ],
    rounds: 3,
  });
  await ctx.db.insert('defaultWorkouts', {
    name: 'Upper Body',
    segments: [
      mkExercise('Push-ups', 30),
      mkRest(45),
      mkExercise('Shoulder Taps', 30),
      mkRest(45),
      mkExercise('Diamond Push-ups', 30),
      mkRest(45),
      mkExercise('Tricep Dips', 30),
      mkRest(60),
    ],
    rounds: 3,
  });
  await ctx.db.insert('defaultWorkouts', {
    name: 'Core Crusher',
    segments: [
      mkExercise('Plank', 30),
      mkRest(30),
      mkExercise('Crunches', 30),
      mkRest(30),
      mkExercise('Leg Raises', 30),
      mkRest(30),
      mkExercise('Bicycle Crunches', 30),
      mkRest(60),
    ],
    rounds: 3,
  });
  await ctx.db.insert('defaultWorkouts', {
    name: 'Lower Body',
    segments: [
      mkExercise('Squats', 30),
      mkRest(45),
      mkExercise('Lunges', 30),
      mkRest(45),
      mkExercise('Wall Sit', 30),
      mkRest(45),
      mkExercise('Glute Bridges', 30),
      mkRest(60),
    ],
    rounds: 3,
  });
  await ctx.db.insert('defaultWorkouts', {
    name: 'HIIT Cardio',
    segments: [
      mkExercise('Burpees', 20),
      mkRest(15),
      mkExercise('Mountain Climbers', 20),
      mkRest(15),
      mkExercise('High Knees', 20),
      mkRest(15),
      mkExercise('Jump Squats', 20),
      mkRest(45),
    ],
    rounds: 4,
  });
}
