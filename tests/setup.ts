import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  initReactI18next: {
    type: '3rdParty' as const,
    init: vi.fn(),
  },
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options?.['count'] !== undefined) {
        const count = Number(options['count']);
        const base = key.split('.').pop()!.replace(/s$/, '');
        return `${count} ${base}${count !== 1 ? 's' : ''}`;
      }
      return key;
    },
    i18n: {
      language: 'en',
      changeLanguage: () => new Promise(() => {}),
      on: vi.fn(),
      off: vi.fn(),
    },
  }),
}));

vi.mock('convex/react', () => ({
  useConvexAuth: () => ({ isLoading: false, isAuthenticated: true }),
  useQuery: () => null,
  useMutation: () => vi.fn().mockResolvedValue(undefined),
  useAction: () => vi.fn().mockResolvedValue([]),
  ConvexReactClient: vi.fn(),
}));

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [false, vi.fn()],
    updateServiceWorker: vi.fn(),
  }),
}));

vi.mock('@convex-dev/auth/react', () => ({
  useAuthActions: () => ({ signOut: vi.fn(), signIn: vi.fn() }),
}));

vi.mock('../src/context/ErrorContext', () => ({
  ErrorProvider: ({ children }: { children: React.ReactNode }) => children,
  useError: () => ({ showError: vi.fn() }),
}));

export const mockSignOut = vi.fn();
export const mockSignIn = vi.fn();

export const authState = {
  isLoading: false,
  isAuthenticated: false,
  user: null as unknown,
  signOut: mockSignOut,
  signIn: mockSignIn,
};

vi.mock('../src/hooks/useAuth', () => ({
  useAuth: () => ({ ...authState }),
}));

afterEach(() => {
  cleanup();
  authState.isLoading = false;
  authState.isAuthenticated = false;
  authState.user = null;
  mockSignOut.mockClear();
  mockSignIn.mockClear();
});
