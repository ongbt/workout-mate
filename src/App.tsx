import { HashRouter, Routes, Route } from 'react-router-dom';
import { useConvexAuth } from 'convex/react';
import { HomeScreen } from './screens/HomeScreen';
import { WorkoutEditScreen } from './screens/WorkoutEditScreen';
import { WorkoutActiveScreen } from './screens/WorkoutActiveScreen';
import { LoginScreen } from './screens/LoginScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { TermsScreen } from './screens/TermsScreen';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';

function App() {
  const { isLoading, isAuthenticated } = useConvexAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return (
    <HashRouter>
      <PwaUpdatePrompt />
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/workout/new" element={<WorkoutEditScreen />} />
        <Route path="/workout/:workoutId" element={<WorkoutEditScreen />} />
        <Route path="/active/:workoutId" element={<WorkoutActiveScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/terms" element={<TermsScreen />} />
      </Routes>
    </HashRouter>
  );
}

export default App;
