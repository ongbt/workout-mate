import { v } from 'convex/values';

export const MAX_NAME_LENGTH = 200;

export function checkNameLength(name: string, label: string): void {
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`${label} must be under ${MAX_NAME_LENGTH} characters`);
  }
}

export const exerciseSegmentValidator = v.object({
  type: v.literal('exercise'),
  id: v.string(),
  exerciseId: v.optional(v.string()),
  name: v.string(),
  durationSeconds: v.number(),
  bodyParts: v.optional(v.array(v.string())),
  targetMuscles: v.optional(v.array(v.string())),
  equipments: v.optional(v.array(v.string())),
  imageUrl: v.optional(v.string()),
});

export const restSegmentValidator = v.object({
  type: v.literal('rest'),
  id: v.string(),
  durationSeconds: v.number(),
});

export const segmentValidator = v.union(
  exerciseSegmentValidator,
  restSegmentValidator,
);
