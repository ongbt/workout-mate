import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { Zap } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { useError } from '../context/ErrorContext';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

export function LoginScreen() {
  const { t } = useTranslation();
  const { signIn } = useAuth();
  const { showError } = useError();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleGoogleSignIn = useCallback(async () => {
    try {
      await signIn('google');
    } catch (e) {
      showError(
        t('errors.signInFailed'),
        e instanceof Error ? e.message : t('errors.tryAgain'),
      );
    }
  }, [signIn, showError, t]);

  const handlePasswordAuth = useCallback(async () => {
    if (!email.trim()) {
      showError(t('errors.signInFailed'), t('validation.emailRequired'));
      return;
    }
    if (!password) {
      showError(t('errors.signInFailed'), t('validation.passwordRequired'));
      return;
    }
    try {
      setSubmitting(true);
      await signIn('password', {
        email,
        password,
        flow: isSignUp ? 'signUp' : 'signIn',
      });
    } catch (e) {
      showError(
        t('errors.signInFailed'),
        e instanceof Error ? e.message : t('errors.tryAgain'),
      );
    } finally {
      setSubmitting(false);
    }
  }, [email, password, isSignUp, signIn, showError, t]);

  const handleAnonymousSignIn = useCallback(async () => {
    try {
      await signIn('anonymous');
    } catch (e) {
      showError(
        t('errors.signInFailed'),
        e instanceof Error ? e.message : t('errors.tryAgain'),
      );
    }
  }, [signIn, showError, t]);

  return (
    <div className="flex h-full flex-col items-center justify-center gap-6 px-5">
      <Helmet>
        <title>{t('screens.login.pageTitle')}</title>
        <meta name="description" content={t('screens.login.pageDescription')} />
      </Helmet>

      <div className="flex flex-col items-center gap-3">
        <div className="bg-primary flex h-16 w-16 items-center justify-center rounded-2xl">
          <Zap className="text-background h-8 w-8" fill="currentColor" />
        </div>
        <h1 className="text-2xl font-bold">{t('app.title')}</h1>
        <p className="text-text-muted text-center text-sm">
          {t('app.tagline')}
        </p>
      </div>

      <form
        className="flex w-full max-w-xs flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          handlePasswordAuth();
        }}
      >
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('labels.email')}
          autoComplete="email"
        />
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder={t('labels.password')}
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
        />
        <Button type="submit" disabled={submitting}>
          {submitting
            ? '...'
            : isSignUp
              ? t('actions.signUpWithEmail')
              : t('actions.signInWithEmail')}
        </Button>
        <Button
          variant="link"
          type="button"
          onClick={() => setIsSignUp((v) => !v)}
        >
          {isSignUp ? t('actions.switchToSignIn') : t('actions.switchToSignUp')}
        </Button>
      </form>

      <div className="flex w-full max-w-xs items-center gap-3">
        <div className="bg-text-muted/20 h-px flex-1" />
        <span className="text-text-muted text-xs">
          {t('common.orContinueWith')}
        </span>
        <div className="bg-text-muted/20 h-px flex-1" />
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button
          variant="outline"
          type="button"
          onClick={handleGoogleSignIn}
          className="gap-3"
          size="lg"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          {t('actions.signInWithGoogle')}
        </Button>

        <Button variant="ghost" type="button" onClick={handleAnonymousSignIn}>
          {t('actions.signInAnonymously')}
        </Button>
      </div>
    </div>
  );
}
