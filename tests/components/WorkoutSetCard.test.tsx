import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { WorkoutSetCard } from '../../src/components/WorkoutSetCard';
import type { WorkoutConfig } from '../../src/types';

const mockWorkout: WorkoutConfig = {
  id: '1',
  name: 'Test Workout',
  exercises: [
    { id: 'e1', name: 'Push-ups', durationSeconds: 30 },
    { id: 'e2', name: 'Squats', durationSeconds: 45 },
  ],
  restSeconds: 10,
  restBetweenRoundsSeconds: 30,
  rounds: 2,
};

describe('WorkoutSetCard', () => {
  it('renders workout name', () => {
    const { getByText } = render(
      <WorkoutSetCard
        workout={mockWorkout}
        onEdit={vi.fn()}
        onPlay={vi.fn()}
      />,
    );
    expect(getByText('Test Workout')).toBeDefined();
  });

  it('shows exercise count in text', () => {
    const { container } = render(
      <WorkoutSetCard
        workout={mockWorkout}
        onEdit={vi.fn()}
        onPlay={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('2 exercises');
  });

  it('shows round count in text', () => {
    const { container } = render(
      <WorkoutSetCard
        workout={mockWorkout}
        onEdit={vi.fn()}
        onPlay={vi.fn()}
      />,
    );
    expect(container.textContent).toContain('2 rounds');
  });

  it('calls onPlay when card is clicked', () => {
    const onPlay = vi.fn();
    const { getByText } = render(
      <WorkoutSetCard workout={mockWorkout} onEdit={vi.fn()} onPlay={onPlay} />,
    );
    fireEvent.click(getByText('Test Workout'));
    expect(onPlay).toHaveBeenCalledOnce();
  });

  it('calls onEdit when edit button clicked', () => {
    const onEdit = vi.fn();
    const { container } = render(
      <WorkoutSetCard workout={mockWorkout} onEdit={onEdit} onPlay={vi.fn()} />,
    );
    const buttons = container.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(1);
    fireEvent.click(buttons[buttons.length - 1]!);
    expect(onEdit).toHaveBeenCalledOnce();
  });

  it('does not call onPlay when edit button is clicked', () => {
    const onPlay = vi.fn();
    const onEdit = vi.fn();
    const { container } = render(
      <WorkoutSetCard workout={mockWorkout} onEdit={onEdit} onPlay={onPlay} />,
    );
    const buttons = container.querySelectorAll('button');
    fireEvent.click(buttons[buttons.length - 1]!);
    expect(onPlay).not.toHaveBeenCalled();
  });
});
