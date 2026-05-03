import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PhaseIndicator } from '../../src/components/PhaseIndicator';

describe('PhaseIndicator', () => {
  it('shows "Ready" for idle phase', () => {
    const { getByText } = render(<PhaseIndicator phase="idle" />);
    expect(getByText('components.phaseIndicator.idle')).toBeDefined();
  });

  it('shows "Exercise" for exercise phase', () => {
    const { getByText } = render(<PhaseIndicator phase="exercise" />);
    expect(getByText('components.phaseIndicator.exercise')).toBeDefined();
  });

  it('shows "Rest" for rest phase', () => {
    const { getByText } = render(<PhaseIndicator phase="rest" />);
    expect(getByText('components.phaseIndicator.rest')).toBeDefined();
  });

  it('shows "Done" for finished phase', () => {
    const { getByText } = render(<PhaseIndicator phase="finished" />);
    expect(getByText('components.phaseIndicator.finished')).toBeDefined();
  });
});
