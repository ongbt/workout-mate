import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useWorkouts } from '../hooks/useWorkouts';
import { Layout } from '../components/Layout';
import { WorkoutSetCard } from '../components/WorkoutSetCard';
import { EmptyState } from '../components/EmptyState';

export function HomeScreen() {
  const { t } = useTranslation();
  const { workouts } = useWorkouts();
  const navigate = useNavigate();

  return (
    <Layout>
      <Helmet>
        <title>{t('screens.home.pageTitle')}</title>
        <meta name="description" content={t('screens.home.pageDescription')} />
      </Helmet>
      <header className="py-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('app.title')}</h1>
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
          {t('screens.home.createNew')}
        </button>
      </div>
    </Layout>
  );
}
