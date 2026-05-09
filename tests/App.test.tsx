import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { ErrorProvider } from '../src/context/ErrorContext';
import App from '../src/App';
import { authState } from './setup';

vi.mock('../src/screens/LoginScreen', () => ({
  LoginScreen: () => <div>Login Screen</div>,
}));

vi.mock('../src/screens/HomeScreen', () => ({
  HomeScreen: () => <div>app.title</div>,
}));

vi.mock('../src/components/PwaUpdatePrompt', () => ({
  PwaUpdatePrompt: () => null,
}));

vi.mock('../src/components/ErrorDialog', () => ({
  ErrorDialog: () => null,
}));

function renderApp() {
  return render(
    <HelmetProvider>
      <ErrorProvider>
        <App />
      </ErrorProvider>
    </HelmetProvider>,
  );
}

describe('App', () => {
  it('shows spinner while loading', () => {
    authState.isLoading = true;
    authState.isAuthenticated = false;
    const { container } = renderApp();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows login screen when unauthenticated', () => {
    authState.isLoading = false;
    authState.isAuthenticated = false;
    renderApp();
    expect(screen.getByText('Login Screen')).toBeDefined();
  });

  it('renders home screen at / when authenticated', async () => {
    authState.isLoading = false;
    authState.isAuthenticated = true;
    renderApp();
    expect(await screen.findByText('app.title')).toBeDefined();
  });
});
