import { useNavigate } from 'react-router-dom';
import { useWorkouts } from '../hooks/useWorkouts';
import { Layout } from '../components/Layout';
import { WorkoutSetCard } from '../components/WorkoutSetCard';
import { EmptyState } from '../components/EmptyState';

export function HomeScreen() {
  const { workouts } = useWorkouts();
  const navigate = useNavigate();

  return (
    <Layout>
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workout Mate</h1>
      </header>

      {workouts.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="flex flex-col gap-3 flex-1 overflow-y-auto scrollbar-hide pb-4">
          {workouts.map((w) => (
            <li key={w.id}>
              <WorkoutSetCard
                workout={w}
                onEdit={() => navigate(`/workout/${w.id}`)}
                onPlay={() => navigate(`/active/${w.id}`)}
              />
            </li>
          ))}
        </ul>
      )}

      <div className="py-4">
        <button
          type="button"
          onClick={() => navigate('/workout/new')}
          className="w-full py-4 rounded-xl bg-primary text-background font-bold text-lg"
        >
          Create New Workout
        </button>
      </div>
    </Layout>
  );
}
