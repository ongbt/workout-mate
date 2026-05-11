/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import * as Sentry from '@sentry/react';
import { ErrorDialog } from '../components/ErrorDialog';

interface ErrorContextValue {
  showError: (title: string, message: string) => void;
}

const ErrorContext = createContext<ErrorContextValue | null>(null);

export function ErrorProvider({ children }: { children: ReactNode }) {
  const [error, setError] = useState<{ title: string; message: string } | null>(
    null,
  );

  const showError = useCallback((title: string, message: string) => {
    Sentry.captureMessage(message, { level: 'error', extra: { title } });
    setError({ title, message });
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return (
    <ErrorContext.Provider value={{ showError }}>
      {children}
      <ErrorDialog
        open={error !== null}
        title={error?.title ?? ''}
        message={error?.message ?? ''}
        onClose={clearError}
      />
    </ErrorContext.Provider>
  );
}

export function useError() {
  const ctx = useContext(ErrorContext);
  if (!ctx) {
    throw new Error('useError must be used within an ErrorProvider');
  }
  return ctx;
}
