import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Layout } from '../../src/components/Layout';
import { mockSignOut } from '../setup';

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn() }),
}));

function renderLayout() {
  return render(
    <Layout>
      <p data-testid="child">Child content</p>
    </Layout>,
  );
}

describe('Layout', () => {
  it('renders children', () => {
    renderLayout();
    expect(screen.getByTestId('child')).toHaveTextContent('Child content');
  });

  it('renders sign-out button', () => {
    renderLayout();
    expect(screen.getByRole('button')).toHaveTextContent('actions.signOut');
  });

  it('calls signOut on button click', () => {
    renderLayout();
    screen.getByRole('button').click();
    expect(mockSignOut).toHaveBeenCalledOnce();
  });
});
