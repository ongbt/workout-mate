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
  useMutation: () => vi.fn(),
  ConvexReactClient: vi.fn(),
}));

vi.mock('../src/context/ErrorContext', () => ({
  ErrorProvider: ({ children }: { children: React.ReactNode }) => children,
  useError: () => ({ showError: vi.fn() }),
}));

afterEach(() => {
  cleanup();
});
