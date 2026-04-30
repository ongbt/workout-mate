import { HashRouter, Routes, Route } from 'react-router-dom';
import { WorkoutConfigProvider } from './context/WorkoutConfigContext';
import { HomeScreen } from './screens/HomeScreen';
import { WorkoutEditScreen } from './screens/WorkoutEditScreen';
import { WorkoutActiveScreen } from './screens/WorkoutActiveScreen';
import { PwaUpdatePrompt } from './components/PwaUpdatePrompt';

function App() {
  return (
    <WorkoutConfigProvider>
      <HashRouter>
        <PwaUpdatePrompt />
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/workout/new" element={<WorkoutEditScreen />} />
          <Route path="/workout/:workoutId" element={<WorkoutEditScreen />} />
          <Route path="/active/:workoutId" element={<WorkoutActiveScreen />} />
        </Routes>
      </HashRouter>
    </WorkoutConfigProvider>
  );
}

export default App;
