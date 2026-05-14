import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
import { isSentryEnabled } from '../lib/sentry';
import i18n from '../i18n';
import { ErrorDialog } from './ErrorDialog';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack?: string }) {
    if (isSentryEnabled()) {
      Sentry.captureException(error, {
        contexts: { react: info },
      });
    }
  }

  handleClose = () => {
    this.setState({ error: null });
  };

  render() {
    return (
      <>
        {this.props.children}
        {this.state.error && (
          <ErrorDialog
            open
            title={i18n.t('errors.unexpected')}
            message={i18n.t('errors.tryAgain')}
            onClose={this.handleClose}
          />
        )}
      </>
    );
  }
}
