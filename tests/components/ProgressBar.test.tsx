import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ProgressBar } from '../../src/components/ProgressBar';

describe('ProgressBar', () => {
  it('renders round label with i18n key', () => {
    const { getByText } = render(
      <ProgressBar
        currentRound={1}
        totalRounds={2}
        currentExerciseIndex={0}
        totalExercises={3}
      />,
    );
    expect(getByText('components.progressBar.round')).toBeDefined();
  });

  it('renders exercise label with i18n key', () => {
    const { getByText } = render(
      <ProgressBar
        currentRound={1}
        totalRounds={2}
        currentExerciseIndex={1}
        totalExercises={3}
      />,
    );
    expect(getByText('components.progressBar.exercise')).toBeDefined();
  });

  it('sets progress bar width to 0% at start', () => {
    const { container } = render(
      <ProgressBar
        currentRound={1}
        totalRounds={2}
        currentExerciseIndex={0}
        totalExercises={3}
      />,
    );
    const bar = container.querySelector('[style]')!;
    expect(bar.getAttribute('style')).toContain('width: 0%');
  });

  it('shows partial progress for mid-workout', () => {
    const { container } = render(
      <ProgressBar
        currentRound={1}
        totalRounds={2}
        currentExerciseIndex={2}
        totalExercises={3}
      />,
    );
    const bar = container.querySelector('[style]')!;
    // currentStep = (0 * 3) + 2 = 2, totalSteps = 6, pct = ~33.33
    expect(bar.getAttribute('style')).toContain('width: 33.333');
  });
});
