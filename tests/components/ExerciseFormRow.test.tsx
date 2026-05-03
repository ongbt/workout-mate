import { describe, it, expect, vi } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { ExerciseFormRow } from '../../src/components/ExerciseFormRow';
import type { Exercise } from '../../src/types';

const exercise: Exercise = { id: 'e1', name: 'Push-ups', durationSeconds: 30 };

function setup(overrides = {}) {
  const props = {
    exercise,
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
    expect(onChange).toHaveBeenCalledWith({ ...exercise, name: 'Squats' });
  });

  it('calls onDelete when delete button clicked', () => {
    const { onDelete } = setup();
    const buttons = document.querySelectorAll('button');
    // Last button is delete (X button)
    const deleteBtn = buttons[buttons.length - 1]!;
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledOnce();
  });

  it('disables move up when canMoveUp is false', () => {
    setup({ canMoveUp: false, canMoveDown: true });
    const buttons = document.querySelectorAll('button');
    const moveUpBtn = buttons[0]!;
    expect(moveUpBtn.disabled).toBe(true);
  });

  it('disables move down when canMoveDown is false', () => {
    setup({ canMoveUp: true, canMoveDown: false });
    const buttons = document.querySelectorAll('button');
    const moveDownBtn = buttons[1]!;
    expect(moveDownBtn.disabled).toBe(true);
  });

  it('disables delete when canDelete is false', () => {
    setup({ canDelete: false });
    const buttons = document.querySelectorAll('button');
    const deleteBtn = buttons[buttons.length - 1]!;
    expect(deleteBtn.disabled).toBe(true);
  });
});
