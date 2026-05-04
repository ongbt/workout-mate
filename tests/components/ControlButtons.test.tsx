import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ControlButtons } from '../../src/components/ControlButtons';

function setup(
  phase: 'idle' | 'exercise' | 'rest' | 'finished',
  isRunning = false,
) {
  const props = {
    phase,
    isRunning,
    onStart: vi.fn(),
    onPause: vi.fn(),
    onResume: vi.fn(),
    onSkip: vi.fn(),
    onStop: vi.fn(),
  };
  const utils = render(<ControlButtons {...props} />);
  return { ...utils, ...props };
}

describe('ControlButtons', () => {
  it('renders "Start Workout" button when phase is idle', () => {
    const { getByText } = setup('idle');
    expect(getByText('workout.start')).toBeDefined();
  });

  it('calls onStart when start button clicked', () => {
    const { getByText, onStart } = setup('idle');
    fireEvent.click(getByText('workout.start'));
    expect(onStart).toHaveBeenCalledOnce();
  });

  it('returns null when phase is finished', () => {
    const { container } = setup('finished');
    expect(container.innerHTML).toBe('');
  });

  it('shows Stop, Pause, Skip when phase is exercise and running', () => {
    const { getByText } = setup('exercise', true);
    expect(getByText('actions.stop')).toBeDefined();
    expect(getByText('actions.pause')).toBeDefined();
    expect(getByText('actions.skip')).toBeDefined();
  });

  it('shows Stop, Resume, Skip when phase is exercise and not running', () => {
    const { getByText } = setup('exercise', false);
    expect(getByText('actions.stop')).toBeDefined();
    expect(getByText('actions.resume')).toBeDefined();
    expect(getByText('actions.skip')).toBeDefined();
  });

  it('calls onPause when pause button clicked', () => {
    const { getByText, onPause } = setup('exercise', true);
    fireEvent.click(getByText('actions.pause'));
    expect(onPause).toHaveBeenCalledOnce();
  });

  it('calls onResume when resume button clicked', () => {
    const { getByText, onResume } = setup('exercise', false);
    fireEvent.click(getByText('actions.resume'));
    expect(onResume).toHaveBeenCalledOnce();
  });

  it('calls onSkip when skip button clicked', () => {
    const { getByText, onSkip } = setup('exercise', true);
    fireEvent.click(getByText('actions.skip'));
    expect(onSkip).toHaveBeenCalledOnce();
  });
});
