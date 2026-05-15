import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ExerciseFormRow } from '../../src/components/ExerciseFormRow';
import type { ExerciseSegment } from '../../src/types';

const segment: ExerciseSegment = {
  type: 'exercise',
  id: 'e1',
  name: 'Push-ups',
  durationSeconds: 30,
};

function setup(overrides = {}) {
  const props = {
    segment,
    error: false,
    onChange: vi.fn(),
    onBlur: vi.fn(),
    onDelete: vi.fn(),
    canDelete: true,
    onMoveUp: vi.fn(),
    onMoveDown: vi.fn(),
    canMoveUp: true,
    canMoveDown: true,
    ...overrides,
  };
  const utils = render(<ExerciseFormRow {...props} />);
  return { ...utils, ...props };
}

describe('ExerciseFormRow', () => {
  it('renders exercise name input', () => {
    const { container } = setup();
    const inputs = container.querySelectorAll('input');
    const nameInput = inputs[0]!;
    expect(nameInput.getAttribute('value')).toBe('Push-ups');
  });

  it('renders duration input', () => {
    const { container } = setup();
    const inputs = container.querySelectorAll('input');
    const durInput = inputs[1]!;
    expect(durInput.getAttribute('value')).toBe('30');
  });

  it('calls onChange when name changes', () => {
    const { container, onChange } = setup();
    const inputs = container.querySelectorAll('input');
    const nameInput = inputs[0]!;
    fireEvent.change(nameInput, { target: { value: 'Squats' } });
    expect(onChange).toHaveBeenCalledWith({ ...segment, name: 'Squats' });
  });

  it('calls onDelete when delete button clicked', () => {
    const { onDelete } = setup();
    const buttons = document.querySelectorAll('button');
    // Delete button (X) is now the first button
    const deleteBtn = buttons[0]!;
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('disables move up when canMoveUp is false', () => {
    setup({ canMoveUp: false, canMoveDown: true });
    const buttons = document.querySelectorAll('button');
    // Move up is the second button (index 1)
    const moveUpBtn = buttons[1]!;
    expect(moveUpBtn.disabled).toBe(true);
  });

  it('disables move down when canMoveDown is false', () => {
    setup({ canMoveUp: true, canMoveDown: false });
    const buttons = document.querySelectorAll('button');
    // Move down is the third button (index 2)
    const moveDownBtn = buttons[2]!;
    expect(moveDownBtn.disabled).toBe(true);
  });

  it('disables delete when canDelete is false', () => {
    setup({ canDelete: false });
    const buttons = document.querySelectorAll('button');
    // Delete button (X) is the first button
    const deleteBtn = buttons[0]!;
    expect(deleteBtn.disabled).toBe(true);
  });
});
