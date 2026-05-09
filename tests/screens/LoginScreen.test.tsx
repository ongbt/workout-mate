import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { LoginScreen } from '../../src/screens/LoginScreen';
import { mockSignIn } from '../setup';

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signIn: vi.fn() }),
}));

function renderLogin() {
  return render(
    <HelmetProvider>
      <LoginScreen />
    </HelmetProvider>,
  );
}

describe('LoginScreen', () => {
  it('renders app title', () => {
    renderLogin();
    expect(screen.getByText('app.title')).toBeDefined();
  });

  it('renders tagline', () => {
    renderLogin();
    expect(screen.getByText('app.tagline')).toBeDefined();
  });

  it('renders sign-in button', () => {
    renderLogin();
    const btn = screen.getByText('actions.signInWithGoogle');
    expect(btn).toBeDefined();
  });

  it('calls signIn with google on button click', () => {
    renderLogin();
    screen.getByText('actions.signInWithGoogle').click();
    expect(mockSignIn).toHaveBeenCalledWith('google');
  });
});
