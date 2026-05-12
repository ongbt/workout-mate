import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorDialog } from '../../src/components/ErrorDialog';

describe('ErrorDialog', () => {
  it('renders nothing when closed', () => {
    const { container } = render(
      <ErrorDialog
        open={false}
        title="Error Title"
        message="Error message text"
        onClose={vi.fn()}
      />,
    );
    expect(container.querySelector('[data-slot="dialog-content"]')).toBeNull();
  });

  it('renders title and message when open', () => {
    render(
      <ErrorDialog
        open={true}
        title="Something went wrong"
        message="Please try again later"
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText('Something went wrong')).toBeDefined();
    expect(screen.getByText('Please try again later')).toBeDefined();
  });

  it('calls onClose when close button clicked', () => {
    const onClose = vi.fn();
    render(
      <ErrorDialog
        open={true}
        title="Error"
        message="Details"
        onClose={onClose}
      />,
    );
    const closeButtons = screen.getAllByRole('button', { name: 'Close' });
    fireEvent.click(closeButtons[0]!);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
