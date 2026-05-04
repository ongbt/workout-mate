import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

const mockUseConvexAuth = vi.fn();

vi.mock('convex/react', () => ({
  useConvexAuth: () => mockUseConvexAuth(),
  ConvexReactClient: vi.fn(),
}));

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn(), signIn: vi.fn() }),
}));

vi.mock('../src/screens/HomeScreen', () => ({
  HomeScreen: () => <div>Home Screen</div>,
}));

vi.mock('../src/screens/WorkoutEditScreen', () => ({
  WorkoutEditScreen: () => <div>Workout Edit</div>,
}));

vi.mock('../src/screens/WorkoutActiveScreen', () => ({
  WorkoutActiveScreen: () => <div>Workout Active</div>,
}));

vi.mock('../src/screens/LoginScreen', () => ({
  LoginScreen: () => <div>Login Screen</div>,
}));

vi.mock('../src/screens/PrivacyScreen', () => ({
  PrivacyScreen: () => <div>Privacy</div>,
}));

vi.mock('../src/screens/TermsScreen', () => ({
  TermsScreen: () => <div>Terms</div>,
}));

vi.mock('../src/components/PwaUpdatePrompt', () => ({
  PwaUpdatePrompt: () => null,
}));

async function renderApp() {
  const App = (await import('../src/App')).default;
  return render(<App />);
}

describe('App', () => {
  it('shows spinner while loading', async () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: true, isAuthenticated: false });
    const { container } = await renderApp();
    expect(container.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows login screen when unauthenticated', async () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: false });
    await renderApp();
    expect(screen.getByText('Login Screen')).toBeDefined();
  });

  it('renders home screen at / when authenticated', async () => {
    mockUseConvexAuth.mockReturnValue({ isLoading: false, isAuthenticated: true });
    await renderApp();
    expect(await screen.findByText('Home Screen')).toBeDefined();
  });
});
