import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/server';

const RAPIDAPI_KEY_MIN_LENGTH = 20;
const RAPIDAPI_KEY_MAX_LENGTH = 200;

export const get = query({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
  },
});

export const setRapidApiKey = mutation({
  args: { key: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const trimmed = args.key.trim();
    if (!trimmed) throw new Error('API key cannot be empty');
    if (trimmed.length < RAPIDAPI_KEY_MIN_LENGTH)
      throw new Error(
        `API key must be at least ${RAPIDAPI_KEY_MIN_LENGTH} characters`,
      );
    if (trimmed.length > RAPIDAPI_KEY_MAX_LENGTH)
      throw new Error(
        `API key must be under ${RAPIDAPI_KEY_MAX_LENGTH} characters`,
      );

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { rapidApiKey: trimmed });
    } else {
      await ctx.db.insert('userSettings', {
        rapidApiKey: trimmed,
        userId,
      });
    }
  },
});

export const removeRapidApiKey = mutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    if (existing) {
      await ctx.db.patch(existing._id, { rapidApiKey: undefined });
    }
  },
});
