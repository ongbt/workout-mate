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
      <header className="flex items-center justify-between py-6">
        <h1 className="text-2xl font-bold">{t('app.title')}</h1>
      </header>

      {workouts.length === 0 ? (
        <EmptyState />
      ) : (
        <ul className="scrollbar-hide flex flex-1 flex-col gap-3 overflow-y-auto pb-4">
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
          className="bg-primary text-background w-full rounded-xl py-4 text-lg font-bold"
        >
          {t('screens.home.createNew')}
        </button>
      </div>
    </Layout>
  );
}
