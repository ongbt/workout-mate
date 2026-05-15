import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkoutActiveScreen } from '../../src/screens/WorkoutActiveScreen';

const mockNavigate = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn(), signIn: vi.fn() }),
  ConvexAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ workoutId: 'workout-1' }),
    useNavigate: () => mockNavigate,
  };
});

const mockWorkout = {
  id: 'workout-1',
  name: 'Test Workout',
  segments: [
    {
      type: 'exercise' as const,
      id: 'e1',
      name: 'Push-ups',
      durationSeconds: 30,
    },
    { type: 'rest' as const, id: 'r1', durationSeconds: 10 },
    {
      type: 'exercise' as const,
      id: 'e2',
      name: 'Squats',
      durationSeconds: 45,
    },
    { type: 'rest' as const, id: 'r2', durationSeconds: 30 },
  ],
  rounds: 2,
};

vi.mock('../../src/hooks/useWorkouts', () => ({
  useWorkouts: () => ({
    workouts: [mockWorkout],
    addWorkout: vi.fn(),
    updateWorkout: vi.fn(),
    deleteWorkout: vi.fn(),
  }),
}));

vi.mock('../../src/hooks/useActiveWorkout', () => ({
  useActiveWorkout: () => ({
    sessionState: {
      phase: 'idle' as const,
      currentRound: 1,
      currentExerciseIndex: 0,
      timeRemainingMs: 0,
      totalRounds: 2,
      totalExercises: 2,
      configId: 'workout-1',
    },
    totalDurationMs: 30000,
    isRunning: false,
    currentExercise: null,
    nextExercise: null,
    handleStart: vi.fn(),
    handlePause: vi.fn(),
    handleResume: vi.fn(),
    handleStop: vi.fn(),
    handleSkip: vi.fn(),
  }),
}));

function renderActive() {
  return render(
    <MemoryRouter>
      <WorkoutActiveScreen />
    </MemoryRouter>,
  );
}

describe('WorkoutActiveScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders workout name in header and idle section', () => {
    const { getAllByText } = renderActive();
    const el = getAllByText('Test Workout');
    expect(el.length).toBe(2);
  });

  it('shows exercise list in idle phase', () => {
    const { getByText } = renderActive();
    expect(getByText('Push-ups')).toBeDefined();
    expect(getByText('Squats')).toBeDefined();
  });

  it('shows exercises label text in idle phase', () => {
    const { container } = renderActive();
    expect(container.textContent).toContain(
      'screens.workoutActive.exercisesLabel',
    );
  });

  it('shows rest segment info in idle phase', () => {
    const { getByText } = renderActive();
    expect(getByText('10s')).toBeDefined();
  });
});
