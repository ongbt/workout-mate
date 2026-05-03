import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { FinishedView } from '../../src/components/FinishedView';

function renderFinished() {
  return render(
    <MemoryRouter>
      <FinishedView />
    </MemoryRouter>,
  );
}

describe('FinishedView', () => {
  it('renders completion message', () => {
    const { getByText } = renderFinished();
    expect(getByText('components.finishedView.workoutComplete')).toBeDefined();
  });

  it('renders sub-message', () => {
    const { getByText } = renderFinished();
    expect(getByText('components.finishedView.greatJob')).toBeDefined();
  });

  it('renders back to home button', () => {
    const { getByText } = renderFinished();
    expect(getByText('actions.backToHome')).toBeDefined();
  });

  it('renders checkmark SVG', () => {
    const { container } = renderFinished();
    expect(container.querySelector('svg')).toBeTruthy();
  });
});
