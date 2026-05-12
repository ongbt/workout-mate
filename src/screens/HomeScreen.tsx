import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSessions } from '../hooks/useSessions';
import { Layout } from '../components/Layout';
import { WorkoutSetCard } from '../components/WorkoutSetCard';
import { EmptyState } from '../components/EmptyState';
import { formatTime } from '../utils/formatTime';
import { Button } from '../components/ui/button';

function formatDate(ts: number): string {
  return new Date(ts).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

export function HomeScreen() {
  const { t } = useTranslation();
  const { workouts } = useWorkouts();
  const { sessions } = useSessions();
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

      <div className="scrollbar-hide flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pb-4">
        {sessions.length > 0 && (
          <section>
            <h2 className="text-text-muted mb-2 text-xs font-semibold tracking-wider uppercase">
              {t('screens.home.historyTitle')}
            </h2>
            <ul className="space-y-1.5">
              {sessions.map((s) => (
                <li
                  key={s._id}
                  className="flex items-center gap-3 rounded-xl bg-white/[0.06] px-3 py-2 backdrop-blur-sm"
                >
                  <span className="text-text-muted shrink-0 text-xs">
                    {formatDate(s.completedAt)}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-sm">
                    {s.workoutName}
                  </span>
                  <span className="text-text-muted shrink-0 text-xs tabular-nums">
                    {formatTime(s.totalDurationMs)}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )}

        {sessions.length === 0 && workouts.length > 0 && (
          <p className="text-text-muted py-2 text-center text-sm">
            {t('screens.home.noHistory')}
          </p>
        )}

        {workouts.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="flex flex-col gap-3">
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
      </div>

      <div className="py-4">
        <Button
          onClick={() => navigate('/workout/new')}
          className="w-full py-4 text-lg font-bold"
        >
          {t('screens.home.createNew')}
        </Button>
      </div>
    </Layout>
  );
}
