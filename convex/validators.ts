import { v } from 'convex/values';

export const MAX_NAME_LENGTH = 200;

export function checkNameLength(name: string, label: string): void {
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`${label} must be under ${MAX_NAME_LENGTH} characters`);
  }
}

export const exerciseValidator = v.object({
  id: v.string(),
  exerciseId: v.optional(v.string()),
  name: v.string(),
  durationSeconds: v.number(),
  bodyParts: v.optional(v.array(v.string())),
  targetMuscles: v.optional(v.array(v.string())),
  equipments: v.optional(v.array(v.string())),
  imageUrl: v.optional(v.string()),
});
