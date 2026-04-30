import { describe, it, expect } from 'vitest';
import { formatTime } from '../../src/utils/formatTime';

describe('formatTime', () => {
  it('formats 0ms as 00:00', () => {
    expect(formatTime(0)).toBe('00:00');
  });

  it('formats 45000ms as 00:45', () => {
    expect(formatTime(45000)).toBe('00:45');
  });

  it('formats 90000ms as 01:30', () => {
    expect(formatTime(90000)).toBe('01:30');
  });

  it('formats 3599000ms as 59:59', () => {
    expect(formatTime(3599000)).toBe('59:59');
  });

  it('rounds up fractional seconds', () => {
    expect(formatTime(45100)).toBe('00:46');
  });
});
