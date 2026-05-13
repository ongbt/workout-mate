import { StrictMode, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import { ConvexAuthProvider } from '@convex-dev/auth/react';
import { ConvexReactClient } from 'convex/react';
import './index.css';
import './i18n';
import { LanguageWatcher } from './components/LanguageWatcher';
import { ConsentBanner } from './components/ConsentBanner';
import { GA4Loader } from './components/GA4Loader';
import { PostHogLoader } from './components/PostHogLoader';
import { SentryLoader } from './components/SentryLoader';
import { ErrorProvider } from './context/ErrorContext';
import { ConsentProvider } from './context/ConsentContext';
import App from './App.tsx';

const convex = new ConvexReactClient(import.meta.env['VITE_CONVEX_URL']!);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Suspense
      fallback={
        <div className="flex h-full items-center justify-center">
          <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
        </div>
      }
    >
      <HelmetProvider>
        <LanguageWatcher>
          <ConsentProvider>
            <ConvexAuthProvider client={convex}>
              <ErrorProvider>
                <App />
                <ConsentBanner />
                <GA4Loader />
                <PostHogLoader />
                <SentryLoader />
              </ErrorProvider>
            </ConvexAuthProvider>
          </ConsentProvider>
        </LanguageWatcher>
      </HelmetProvider>
    </Suspense>
  </StrictMode>,
);
