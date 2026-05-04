import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { WorkoutPhase } from '../types';

interface Props {
  phase: WorkoutPhase;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onSkip: () => void;
  onStop: () => void;
}

const tapTransition = { type: 'spring' as const, stiffness: 400, damping: 17 };

export function ControlButtons({
  phase,
  isRunning,
  onStart,
  onPause,
  onResume,
  onSkip,
  onStop,
}: Props) {
  const { t } = useTranslation();

  if (phase === 'finished') return null;

  if (phase === 'idle') {
    return (
      <motion.button
        type="button"
        onClick={onStart}
        className="bg-primary text-background w-full rounded-xl py-4 text-lg font-bold"
        whileTap={{ scale: 0.97 }}
        transition={tapTransition}
      >
        {t('workout.start')}
      </motion.button>
    );
  }

  return (
    <div className="flex gap-3">
      <motion.button
        type="button"
        onClick={onStop}
        className="flex-1 rounded-xl border border-red-500/30 bg-red-500/20 py-4 font-semibold text-red-400"
        whileTap={{ scale: 0.97 }}
        transition={tapTransition}
      >
        {t('actions.stop')}
      </motion.button>
      {isRunning ? (
        <motion.button
          type="button"
          onClick={onPause}
          className="bg-rest text-background flex-1 rounded-xl py-4 font-bold"
          whileTap={{ scale: 0.97 }}
          transition={tapTransition}
        >
          {t('actions.pause')}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={onResume}
          className="bg-primary text-background flex-1 rounded-xl py-4 font-bold"
          whileTap={{ scale: 0.97 }}
          transition={tapTransition}
        >
          {t('actions.resume')}
        </motion.button>
      )}
      <motion.button
        type="button"
        onClick={onSkip}
        className="bg-surface text-text flex-1 rounded-xl py-4 font-semibold"
        whileTap={{ scale: 0.97 }}
        transition={tapTransition}
      >
        {t('actions.skip')}
      </motion.button>
    </div>
  );
}
