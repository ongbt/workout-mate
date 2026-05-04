import { lazy, Suspense } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { LoginScreen } from './screens/LoginScreen';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';
import { ErrorBoundary } from './components/ErrorBoundary';

const HomeScreen = lazy(() =>
  import('./screens/HomeScreen').then((m) => ({ default: m.HomeScreen })),
);
const WorkoutEditScreen = lazy(() =>
  import('./screens/WorkoutEditScreen').then((m) => ({
    default: m.WorkoutEditScreen,
  })),
);
const WorkoutActiveScreen = lazy(() =>
  import('./screens/WorkoutActiveScreen').then((m) => ({
    default: m.WorkoutActiveScreen,
  })),
);
const PrivacyScreen = lazy(() =>
  import('./screens/PrivacyScreen').then((m) => ({ default: m.PrivacyScreen })),
);
const TermsScreen = lazy(() =>
  import('./screens/TermsScreen').then((m) => ({ default: m.TermsScreen })),
);

function App() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <HashRouter>
      <PwaUpdatePrompt />
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="border-primary h-8 w-8 animate-spin rounded-full border-2 border-t-transparent" />
          </div>
        }
      >
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/workout/new" element={<WorkoutEditScreen />} />
            <Route path="/workout/:workoutId" element={<WorkoutEditScreen />} />
            <Route
              path="/active/:workoutId"
              element={<WorkoutActiveScreen />}
            />
            <Route path="/privacy" element={<PrivacyScreen />} />
            <Route path="/terms" element={<TermsScreen />} />
          </Routes>
        </ErrorBoundary>
      </Suspense>
    </HashRouter>
  );
}

export default App;
