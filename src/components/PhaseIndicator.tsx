import { useTranslation } from 'react-i18next';
import { AnimatePresence, motion } from 'framer-motion';
import type { WorkoutPhase } from '../types';

const COLORS: Record<WorkoutPhase, string> = {
  idle: 'bg-text-muted',
  exercise: 'bg-primary',
  rest: 'bg-rest',
  finished: 'bg-primary',
};

interface Props {
  phase: WorkoutPhase;
}

export function PhaseIndicator({ phase }: Props) {
  const { t } = useTranslation();

  return (
    <div className="flex items-center justify-center gap-2">
      <AnimatePresence mode="wait">
        <motion.div
          key={phase}
          className="flex items-center gap-2"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0, transition: { duration: 0.15 } }}
          exit={{ opacity: 0, y: 8, transition: { duration: 0.1 } }}
        >
          <span className={`h-3 w-3 rounded-full ${COLORS[phase]}`} />
          <span className="text-text-muted text-sm font-semibold tracking-wider uppercase">
            {t(`components.phaseIndicator.${phase}`)}
          </span>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
