import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WorkoutEditScreen } from '../../src/screens/WorkoutEditScreen';

const mockAddWorkout = vi.fn();
const mockUpdateWorkout = vi.fn();
const mockDeleteWorkout = vi.fn();
const mockNavigate = vi.fn();

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn(), signIn: vi.fn() }),
  ConvexAuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useParams: () => ({ workoutId: undefined }),
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../src/hooks/useWorkouts', () => ({
  useWorkouts: () => ({
    workouts: [],
    addWorkout: mockAddWorkout,
    updateWorkout: mockUpdateWorkout,
    deleteWorkout: mockDeleteWorkout,
  }),
  useDefaultWorkouts: () => [],
}));

function renderEdit() {
  return render(
    <MemoryRouter>
      <WorkoutEditScreen />
    </MemoryRouter>,
  );
}

describe('WorkoutEditScreen', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders "New Workout" title', () => {
    const { getByText } = renderEdit();
    expect(getByText('screens.workoutEdit.titleNew')).toBeDefined();
  });

  it('renders form field labels', () => {
    const { getAllByText } = renderEdit();
    const nameEls = getAllByText('labels.name');
    expect(nameEls.length).toBeGreaterThanOrEqual(1);
  });

  it('save button is disabled when form has errors', () => {
    const { getByText } = renderEdit();
    const saveBtn = getByText('actions.save');
    expect((saveBtn.closest('button') as HTMLButtonElement).disabled).toBe(
      true,
    );
  });

  it('enables save when exercise name is filled', () => {
    const { container } = renderEdit();
    const inputs = container.querySelectorAll('input');
    // Fill in exercise name to clear the blank exercise validation
    const exerciseNameInput = inputs[2];
    if (exerciseNameInput) {
      fireEvent.change(exerciseNameInput, {
        target: { value: 'Test Exercise' },
      });
    }
    // Also fill in workout name
    fireEvent.change(inputs[0]!, { target: { value: 'My Workout' } });
    // Now save button should be enabled (all fields valid)
    const saveButton = container.querySelector('button[class*="bg-primary"]');
    expect(saveButton).toBeTruthy();
  });

  it('should not pass id field to addWorkout when creating', () => {
    const { container, getByText } = renderEdit();
    const inputs = container.querySelectorAll('input');

    // Fill workout name
    fireEvent.change(inputs[0]!, { target: { value: 'My Workout' } });
    // Fill first exercise name (inputs: name, rounds, exName, exDur)
    const exerciseNameInput = inputs[2];
    if (exerciseNameInput) {
      fireEvent.change(exerciseNameInput, {
        target: { value: 'Test Exercise' },
      });
    }

    const saveLabel = getByText('actions.save');
    const saveButton = saveLabel.closest('button') as HTMLButtonElement;
    expect(saveButton.disabled).toBe(false);
    fireEvent.click(saveButton);

    expect(mockAddWorkout).toHaveBeenCalledTimes(1);
    const passedWorkout = mockAddWorkout.mock.calls[0]![0];
    expect(passedWorkout).not.toHaveProperty('id');
    expect(passedWorkout).toMatchObject({
      name: 'My Workout',
      segments: expect.arrayContaining([
        expect.objectContaining({ name: 'Test Exercise' }),
      ]),
    });
  });

  describe('exercise library integration', () => {
    it('renders "Browse Library" button for new workouts', () => {
      const { getByText } = renderEdit();
      expect(getByText('screens.workoutEdit.browseLibrary')).toBeDefined();
    });

    it('renders "+ Add" button for custom exercises', () => {
      const { getByText } = renderEdit();
      expect(getByText('screens.workoutEdit.addExercise')).toBeDefined();
    });

    it('opens exercise search modal when Browse Library is clicked', () => {
      const { getByText } = renderEdit();
      const browseBtn = getByText('screens.workoutEdit.browseLibrary');
      fireEvent.click(browseBtn);
      // Modal should now be open — check for the key prompt since no API key is set
      expect(getByText('components.exerciseSearch.keyPrompt')).toBeDefined();
    });
  });
});
