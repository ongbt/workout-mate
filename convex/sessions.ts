import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';
import { checkNameLength } from './validators';

export const create = mutation({
  args: {
    workoutId: v.string(),
    workoutName: v.string(),
    completedAt: v.number(),
    totalDurationMs: v.number(),
    exerciseCount: v.number(),
    roundsCompleted: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    checkNameLength(args.workoutName, 'Workout name');
    return ctx.db.insert('sessions', { ...args, userId });
  },
});

export const list = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return ctx.db
      .query('sessions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .take(args.limit ?? 10);
  },
});

export const count = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return 0;
    const sessions = await ctx.db
      .query('sessions')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
    return sessions.length;
  },
});
