import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorProvider } from '../src/context/ErrorContext';
import { authState } from './setup';

vi.mock('../src/screens/LoginScreen', () => ({
  LoginScreen: () => <div>Login Screen</div>,
}));

vi.mock('../src/components/PwaUpdatePrompt', () => ({
  PwaUpdatePrompt: () => null,
}));

vi.mock('../src/components/ErrorDialog', () => ({
  ErrorDialog: () => null,
}));

async function renderApp() {
  const App = (await import('../src/App')).default;
  return render(
    <HelmetProvider>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </HelmetProvider>,
  );
}

describe('App', () => {
  it('shows spinner while loading', async () => {
    authState.isLoading = true;
    authState.isAuthenticated = false;
    const { container } = await renderApp();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows login screen when unauthenticated', async () => {
    authState.isLoading = false;
    authState.isAuthenticated = false;
    await renderApp();
    expect(screen.getByText('Login Screen')).toBeDefined();
  });

  it('renders home screen at / when authenticated', async () => {
    authState.isLoading = false;
    authState.isAuthenticated = true;
    await renderApp();
    expect(await screen.findByText('app.title')).toBeDefined();
  });
});
