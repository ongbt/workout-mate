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
  exercises: [{ id: 'e1', name: 'Push-ups', durationSeconds: 30 }],
  restSeconds: 10,
  restBetweenRoundsSeconds: 60,
  rounds: 2,
};

vi.mock('../../src/hooks/useWorkouts', () => ({
  useWorkouts: vi.fn(),
}));

import { useWorkouts } from '../../src/hooks/useWorkouts';

function renderHomeWithWorkouts(workouts: (typeof workoutA)[]) {
  vi.mocked(useWorkouts).mockReturnValue({
    workouts,
    addWorkout: vi.fn(),
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
  } as ReturnType<typeof useWorkouts>);

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
});
