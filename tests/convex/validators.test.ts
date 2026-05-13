import { describe, it, expect } from 'vitest';
import { checkNameLength, MAX_NAME_LENGTH } from '../../convex/validators';

describe('checkNameLength', () => {
  it('does not throw when name is under the max length', () => {
    expect(() => checkNameLength('Short name', 'Workout name')).not.toThrow();
  });

  it('does not throw when name equals max length', () => {
    const name = 'a'.repeat(MAX_NAME_LENGTH);
    expect(() => checkNameLength(name, 'Workout name')).not.toThrow();
  });

  it('throws when name exceeds max length', () => {
    const name = 'a'.repeat(MAX_NAME_LENGTH + 1);
    expect(() => checkNameLength(name, 'Workout name')).toThrow(
      `Workout name must be under ${MAX_NAME_LENGTH} characters`,
    );
  });

  it('throws when exercise name exceeds max length', () => {
    const name = 'a'.repeat(MAX_NAME_LENGTH + 1);
    expect(() => checkNameLength(name, 'Exercise name')).toThrow(
      `Exercise name must be under ${MAX_NAME_LENGTH} characters`,
    );
  });

  it('throws for empty label', () => {
    const name = 'a'.repeat(MAX_NAME_LENGTH + 1);
    expect(() => checkNameLength(name, '')).toThrow(
      ` must be under ${MAX_NAME_LENGTH} characters`,
    );
  });

  it('does not throw for empty string', () => {
    expect(() => checkNameLength('', 'Workout name')).not.toThrow();
  });
});
