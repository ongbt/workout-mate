import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

vi.mock('react-i18next', () => ({
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

afterEach(() => {
  cleanup();
});
