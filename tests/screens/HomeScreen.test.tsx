import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { HomeScreen } from '../../src/screens/HomeScreen';

const mockNavigate = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn() }),
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

const workoutA = {
  id: 'w1',
  name: 'Full Body',
  segments: [
    {
      type: 'exercise' as const,
      id: 'e1',
      name: 'Push-ups',
      durationSeconds: 30,
    },
  ],
  rounds: 2,
};

vi.mock('../../src/hooks/useWorkouts', () => ({
  useWorkouts: vi.fn(),
}));

vi.mock('../../src/hooks/useSessions', () => ({
  useSessions: vi.fn(),
}));

import { useWorkouts } from '../../src/hooks/useWorkouts';
import { useSessions } from '../../src/hooks/useSessions';

function renderHomeWithWorkouts(
  workouts: (typeof workoutA)[],
  sessions: {
    _id: string;
    workoutId: string;
    workoutName: string;
    completedAt: number;
    totalDurationMs: number;
    exerciseCount: number;
    roundsCompleted: number;
  }[] = [],
) {
  vi.mocked(useWorkouts).mockReturnValue({
    workouts,
    addWorkout: vi.fn(),
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
  } as ReturnType<typeof useWorkouts>);

  vi.mocked(useSessions).mockReturnValue({
    sessions,
    totalCount: sessions.length,
    recordSession: vi.fn(),
  } as ReturnType<typeof useSessions>);

  return render(
    <HelmetProvider>
      <MemoryRouter>
        <HomeScreen />
      </MemoryRouter>
    </HelmetProvider>,
  );
}

describe('HomeScreen', () => {
  it('shows empty state when no workouts', () => {
    renderHomeWithWorkouts([]);
    expect(screen.getByText('components.emptyState.noWorkouts')).toBeDefined();
  });

  it('renders workout cards when workouts exist', () => {
    renderHomeWithWorkouts([workoutA]);
    expect(screen.getByText('Full Body')).toBeDefined();
  });

  it('navigates to new workout on create button click', () => {
    renderHomeWithWorkouts([]);
    screen.getByText('screens.home.createNew').click();
    expect(mockNavigate).toHaveBeenCalledWith('/workout/new');
  });

  it('shows session history when sessions exist', () => {
    renderHomeWithWorkouts(
      [workoutA],
      [
        {
          _id: 's1',
          workoutId: 'w1',
          workoutName: 'Full Body',
          completedAt: Date.now(),
          totalDurationMs: 600000,
          exerciseCount: 5,
          roundsCompleted: 2,
        },
      ],
    );
    expect(screen.getByText('screens.home.historyTitle')).toBeDefined();
    expect(screen.getByText('10:00')).toBeDefined();
    // "Full Body" appears in both history and workout card
    const fullBodyEls = screen.getAllByText('Full Body');
    expect(fullBodyEls.length).toBe(2);
  });

  it('shows no-history message when workouts exist but sessions do not', () => {
    renderHomeWithWorkouts([workoutA], []);
    expect(screen.getByText('screens.home.noHistory')).toBeDefined();
  });

  it('does not show history section when sessions are empty and no workouts', () => {
    renderHomeWithWorkouts([], []);
    expect(screen.queryByText('screens.home.historyTitle')).toBeNull();
    expect(screen.queryByText('screens.home.noHistory')).toBeNull();
  });
});
