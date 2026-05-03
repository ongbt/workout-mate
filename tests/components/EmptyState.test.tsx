import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { EmptyState } from '../../src/components/EmptyState';

describe('EmptyState', () => {
  it('renders the no-workouts message', () => {
    const { getByText } = render(<EmptyState />);
    expect(getByText('components.emptyState.noWorkouts')).toBeDefined();
  });

  it('renders the sub-message', () => {
    const { getByText } = render(<EmptyState />);
    expect(getByText('components.emptyState.createFirst')).toBeDefined();
  });

  it('renders an SVG icon', () => {
    const { container } = render(<EmptyState />);
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
