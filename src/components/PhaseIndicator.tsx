import { useTranslation } from 'react-i18next';
import type { WorkoutPhase } from '../types';

const COLORS: Record<WorkoutPhase, string> = {
  idle: 'bg-text-muted',
  exercise: 'bg-primary',
  rest: 'bg-rest',
  finished: 'bg-blue-400',
};

interface Props {
  phase: WorkoutPhase;
}

export function PhaseIndicator({ phase }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2">
      <span className={`w-3 h-3 rounded-full ${COLORS[phase]}`} />
      <span className="text-sm font-semibold uppercase tracking-wider text-text-muted">
        {t(`components.phaseIndicator.${phase}`)}
      </span>
    </div>
  );
}
