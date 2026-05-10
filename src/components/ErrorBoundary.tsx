import { Component, type ReactNode } from 'react';
import * as Sentry from '@sentry/react';
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
    Sentry.captureException(error, {
      contexts: { react: info },
    });
  }

  handleClose = () => {
    this.setState({ error: null });
  };

  render() {
    if (this.state.error) {
      return (
        <>
          {this.props.children}
          <ErrorDialog
            open
            title={i18n.t('errors.unexpected')}
            message={i18n.t('errors.tryAgain')}
            onClose={this.handleClose}
          />
        </>
      );
    }

    return this.props.children;
  }
}
