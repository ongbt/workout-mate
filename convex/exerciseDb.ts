import { v } from 'convex/values';
import { action, internalMutation, internalQuery } from './_generated/server';
import { internal } from './_generated/api';
import type { Doc } from './_generated/dataModel';
import { getAuthUserId } from '@convex-dev/auth/server';

interface ExerciseResult {
  exerciseId: string;
  name: string;
  bodyParts: string[];
  targetMuscles: string[];
  equipments: string[];
  imageUrl: string;
  instructions?: string[];
  secondaryMuscles?: string[];
}

const EXERCISEDB_HOST =
  'edb-with-videos-and-images-by-ascendapi.p.rapidapi.com';
const EXERCISEDB_BASE = `https://${EXERCISEDB_HOST}/api/v1`;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 30;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

function checkLength(value: string, max: number, label: string): void {
  if (value.length > max) {
    throw new Error(`${label} must be under ${max} characters`);
  }
  if (!value.trim()) {
    throw new Error(`${label} cannot be empty`);
  }
}

function isCacheFresh(cachedAt: number): boolean {
  return Date.now() - cachedAt < CACHE_TTL_MS;
}

/** Extract the data array from an AscendAPI response (handles wrapped { data } or bare array) */
function extractDataArray(json: unknown): unknown[] {
  if (Array.isArray(json)) return json;
  if (json && typeof json === 'object' && 'data' in json) {
    const data = (json as { data: unknown[] }).data;
    if (Array.isArray(data)) return data;
  }
  return [];
}

export const getUserSettings = internalQuery({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
  },
});

export const getCachedBodyParts = internalQuery({
  handler: async (ctx) => {
    const exercises = await ctx.db.query('exerciseLibrary').collect();
    return [...new Set(exercises.flatMap((ex) => ex.bodyParts))].sort();
  },
});

export const getCachedExercisesByBodyPart = internalQuery({
  args: { bodyPart: v.string() },
  handler: async (ctx, args) => {
    return ctx.db
      .query('exerciseLibrary')
      .withIndex('by_bodyParts', (q) =>
        q.eq('bodyParts', args.bodyPart as unknown as string[]),
      )
      .collect();
  },
});

export const getCachedExercisesByName = internalQuery({
  args: { query: v.string() },
  handler: async (ctx, args) => {
    const q = args.query.toLowerCase();
    const all = await ctx.db.query('exerciseLibrary').collect();
    return all.filter(
      (ex) =>
        ex.name.toLowerCase().includes(q) ||
        ex.targetMuscles.some((m: string) => m.toLowerCase().includes(q)) ||
        ex.equipments.some((e: string) => e.toLowerCase().includes(q)),
    );
  },
});

export const enforceRateLimit = internalMutation({
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');

    const existing = await ctx.db
      .query('userSettings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();

    const now = Date.now();

    if (existing?.lastRequestTimestamp) {
      const elapsed = now - existing.lastRequestTimestamp;
      if (elapsed < RATE_LIMIT_WINDOW_MS) {
        const count = (existing.requestCount ?? 0) + 1;
        if (count > RATE_LIMIT_MAX) {
          throw new Error('Too many requests, please wait');
        }
        await ctx.db.patch(existing._id, {
          requestCount: count,
          lastRequestTimestamp: now,
        });
        return;
      }
    }

    if (existing) {
      await ctx.db.patch(existing._id, {
        requestCount: 1,
        lastRequestTimestamp: now,
      });
    }
  },
});

export const cacheExercises = internalMutation({
  args: {
    exercises: v.array(
      v.object({
        exerciseId: v.string(),
        name: v.string(),
        bodyParts: v.array(v.string()),
        targetMuscles: v.array(v.string()),
        equipments: v.array(v.string()),
        imageUrl: v.string(),
        instructions: v.optional(v.array(v.string())),
        secondaryMuscles: v.optional(v.array(v.string())),
      }),
    ),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    for (const ex of args.exercises) {
      checkLength(ex.name, 200, 'Exercise name');

      const existing = await ctx.db
        .query('exerciseLibrary')
        .withIndex('by_exerciseId', (q) => q.eq('exerciseId', ex.exerciseId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { ...ex, cachedAt: now });
      } else {
        await ctx.db.insert('exerciseLibrary', { ...ex, cachedAt: now });
      }
    }
  },
});

const STATIC_BODY_PARTS = [
  'back',
  'cardio',
  'chest',
  'lower arms',
  'lower legs',
  'neck',
  'shoulders',
  'upper arms',
  'upper legs',
  'waist',
];

export const listBodyParts = action({
  handler: async (ctx): Promise<string[]> => {
    const cached: string[] = await ctx.runQuery(
      internal.exerciseDb.getCachedBodyParts,
    );
    if (cached.length > 0) return cached;

    await ctx.runMutation(internal.exerciseDb.enforceRateLimit, {});
    const settings = await ctx.runQuery(internal.exerciseDb.getUserSettings);
    if (!settings?.rapidApiKey) {
      throw new Error('No RapidAPI key configured');
    }
    const response = await fetch(`${EXERCISEDB_BASE}/bodyparts`, {
      headers: {
        'X-RapidAPI-Key': settings.rapidApiKey,
        'X-RapidAPI-Host': EXERCISEDB_HOST,
      },
    });
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error(
          'RapidAPI key is invalid or does not have ExerciseDB access. Check your key and subscription at rapidapi.com.',
        );
      }
      if (response.status === 429) {
        throw new Error(
          'ExerciseDB rate limit reached. Please wait a minute and try again.',
        );
      }
      throw new Error(
        `Unable to load body parts (${response.status}). Please try again later.`,
      );
    }
    const json = (await response.json()) as unknown;
    const data = extractDataArray(json);

    if (data.length > 0) {
      const first = data[0];
      if (typeof first === 'string') return data as string[];

      // API returned exercise objects — extract unique body parts
      if (typeof first === 'object' && first !== null) {
        const parts = new Set<string>();
        for (const item of data) {
          const ex = item as Record<string, unknown>;
          const bps = ex['bodyParts'];
          if (!Array.isArray(bps)) continue;
          for (const p of bps) {
            if (typeof p === 'string') parts.add(p);
          }
        }
        if (parts.size > 0) return [...parts].sort();
      }
    }

    return STATIC_BODY_PARTS;
  },
});

export const listByBodyPart = action({
  args: { bodyPart: v.string() },
  handler: async (ctx, args): Promise<ExerciseResult[]> => {
    const trimmed = args.bodyPart.trim();
    checkLength(trimmed, 100, 'Body part');

    const cached: Array<Doc<'exerciseLibrary'>> = await ctx.runQuery(
      internal.exerciseDb.getCachedExercisesByBodyPart,
      { bodyPart: trimmed },
    );
    if (
      cached.length > 0 &&
      cached.some((ex: Doc<'exerciseLibrary'>) => isCacheFresh(ex.cachedAt))
    ) {
      return cached;
    }

    await ctx.runMutation(internal.exerciseDb.enforceRateLimit, {});
    const settings = await ctx.runQuery(internal.exerciseDb.getUserSettings);
    if (!settings?.rapidApiKey) {
      throw new Error('No RapidAPI key configured');
    }

    const url = `${EXERCISEDB_BASE}/exercises?${new URLSearchParams({ bodyPart: trimmed, limit: '50' }).toString()}`;
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': settings.rapidApiKey,
        'X-RapidAPI-Host': EXERCISEDB_HOST,
      },
    });
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error(
          'RapidAPI key is invalid or does not have ExerciseDB access. Check your key and subscription at rapidapi.com.',
        );
      }
      if (response.status === 429) {
        if (cached.length > 0) return cached;
        throw new Error(
          'ExerciseDB rate limit reached. Please wait a minute and try again.',
        );
      }
      throw new Error(
        `Unable to load exercises (${response.status}). Please try again later.`,
      );
    }

    const json = (await response.json()) as unknown;
    const exercises = extractDataArray(json);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalized = (exercises as any[]).map((ex: any) => ({
      exerciseId: String(ex.exerciseId ?? ''),
      name: String(ex.name ?? '').trim(),
      bodyParts: Array.isArray(ex.bodyParts) ? ex.bodyParts : [],
      targetMuscles: Array.isArray(ex.targetMuscles) ? ex.targetMuscles : [],
      equipments: Array.isArray(ex.equipments) ? ex.equipments : [],
      imageUrl: String(ex.imageUrl ?? ''),
      instructions: Array.isArray(ex.instructions)
        ? ex.instructions
        : undefined,
      secondaryMuscles: Array.isArray(ex.secondaryMuscles)
        ? ex.secondaryMuscles
        : undefined,
    }));

    await ctx.runMutation(internal.exerciseDb.cacheExercises, {
      exercises: normalized,
    });

    return normalized;
  },
});

export const searchByName = action({
  args: { name: v.string() },
  handler: async (ctx, args): Promise<ExerciseResult[]> => {
    const trimmed = args.name.trim();
    checkLength(trimmed, 200, 'Search term');

    const cached: Array<Doc<'exerciseLibrary'>> = await ctx.runQuery(
      internal.exerciseDb.getCachedExercisesByName,
      { query: trimmed },
    );
    if (
      cached.length > 0 &&
      cached.some((ex: Doc<'exerciseLibrary'>) => isCacheFresh(ex.cachedAt))
    ) {
      return cached;
    }

    await ctx.runMutation(internal.exerciseDb.enforceRateLimit, {});
    const settings = await ctx.runQuery(internal.exerciseDb.getUserSettings);
    if (!settings?.rapidApiKey) {
      throw new Error('No RapidAPI key configured');
    }

    const url = `${EXERCISEDB_BASE}/exercises?${new URLSearchParams({ name: trimmed, limit: '20' }).toString()}`;
    const response = await fetch(url, {
      headers: {
        'X-RapidAPI-Key': settings.rapidApiKey,
        'X-RapidAPI-Host': EXERCISEDB_HOST,
      },
    });
    if (!response.ok) {
      if (response.status === 403 || response.status === 401) {
        throw new Error(
          'RapidAPI key is invalid or does not have ExerciseDB access. Check your key and subscription at rapidapi.com.',
        );
      }
      if (response.status === 429) {
        if (cached.length > 0) return cached;
        throw new Error(
          'ExerciseDB rate limit reached. Please wait a minute and try again.',
        );
      }
      throw new Error(
        `Unable to search exercises (${response.status}). Please try again later.`,
      );
    }

    const json = (await response.json()) as unknown;
    const exercises = extractDataArray(json);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const normalized = (exercises as any[]).map((ex: any) => ({
      exerciseId: String(ex.exerciseId ?? ''),
      name: String(ex.name ?? '').trim(),
      bodyParts: Array.isArray(ex.bodyParts) ? ex.bodyParts : [],
      targetMuscles: Array.isArray(ex.targetMuscles) ? ex.targetMuscles : [],
      equipments: Array.isArray(ex.equipments) ? ex.equipments : [],
      imageUrl: String(ex.imageUrl ?? ''),
      instructions: Array.isArray(ex.instructions)
        ? ex.instructions
        : undefined,
      secondaryMuscles: Array.isArray(ex.secondaryMuscles)
        ? ex.secondaryMuscles
        : undefined,
    }));

    await ctx.runMutation(internal.exerciseDb.cacheExercises, {
      exercises: normalized,
    });

    return normalized;
  },
});
