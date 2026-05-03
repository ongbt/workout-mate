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
      <WorkoutSetCard workout={mockWorkout} onEdit={vi.fn()} onPlay={vi.fn()} />,
    );
    expect(getByText('Test Workout')).toBeDefined();
  });

  it('shows exercise count in text', () => {
    const { container } = render(
      <WorkoutSetCard workout={mockWorkout} onEdit={vi.fn()} onPlay={vi.fn()} />,
    );
    expect(container.textContent).toContain('2 exercises');
  });

  it('shows round count in text', () => {
    const { container } = render(
      <WorkoutSetCard workout={mockWorkout} onEdit={vi.fn()} onPlay={vi.fn()} />,
    );
    expect(container.textContent).toContain('2 rounds');
  });

  it('calls onPlay when play area clicked', () => {
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
    const editButton = container.querySelectorAll('button')[1]!;
    fireEvent.click(editButton);
    expect(onEdit).toHaveBeenCalledOnce();
  });
});
