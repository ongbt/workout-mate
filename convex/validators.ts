export const MAX_NAME_LENGTH = 200;

export function checkNameLength(name: string, label: string): void {
  if (name.length > MAX_NAME_LENGTH) {
    throw new Error(`${label} must be under ${MAX_NAME_LENGTH} characters`);
  }
}
