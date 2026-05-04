import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TimerDisplay } from '../../src/components/TimerDisplay';

describe('TimerDisplay', () => {
  it('renders formatted time', () => {
    const { getAllByText } = render(
      <TimerDisplay
        timeRemainingMs={45000}
        totalDurationMs={45000}
        phase="exercise"
      />,
    );
    const matches = getAllByText('00:45');
    expect(matches.length).toBeGreaterThan(0);
  });

  it('uses green color for exercise phase', () => {
    const { container } = render(
      <TimerDisplay
        timeRemainingMs={45000}
        totalDurationMs={45000}
        phase="exercise"
      />,
    );
    const span = container.querySelector('span')!;
    expect(span.style.color).toBe('#22c55e');
  });

  it('uses amber color for rest phase', () => {
    const { container } = render(
      <TimerDisplay
        timeRemainingMs={15000}
        totalDurationMs={15000}
        phase="rest"
      />,
    );
    const span = container.querySelector('span')!;
    expect(span.style.color).toBe('#f59e0b');
  });

  it('pulses the circle and uses red text in last 5 seconds', () => {
    const { container } = render(
      <TimerDisplay
        timeRemainingMs={3000}
        totalDurationMs={45000}
        phase="exercise"
      />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('class')).toContain('animate-pulse');
    const span = container.querySelector('span')!;
    expect(span.style.color).toBe('#f87171');
  });

  it('does not pulse when > 5 seconds remain', () => {
    const { container } = render(
      <TimerDisplay
        timeRemainingMs={30000}
        totalDurationMs={45000}
        phase="exercise"
      />,
    );
    const svg = container.querySelector('svg')!;
    expect(svg.getAttribute('class')).not.toContain('animate-pulse');
  });

  it('renders donut with correct dash offset for half elapsed', () => {
    const { container } = render(
      <TimerDisplay
        timeRemainingMs={22500}
        totalDurationMs={45000}
        phase="exercise"
      />,
    );
    const circles = container.querySelectorAll('circle');
    const arc = circles[1]!;
    const offset = parseFloat(arc.getAttribute('stroke-dashoffset') ?? '0');
    const circumference = 2 * Math.PI * 120;
    expect(offset).toBeCloseTo(circumference / 2, -1);
  });
});
