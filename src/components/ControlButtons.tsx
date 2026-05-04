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

export function ControlButtons({ phase, isRunning, onStart, onPause, onResume, onSkip, onStop }: Props) {
  const { t } = useTranslation();

  if (phase === 'finished') return null;

  if (phase === 'idle') {
    return (
      <motion.button
        type="button"
        onClick={onStart}
        className="w-full py-4 rounded-xl bg-primary text-background font-bold text-lg"
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
        className="flex-1 py-4 rounded-xl bg-red-500/20 text-red-400 font-semibold border border-red-500/30"
        whileTap={{ scale: 0.97 }}
        transition={tapTransition}
      >
        {t('actions.stop')}
      </motion.button>
      {isRunning ? (
        <motion.button
          type="button"
          onClick={onPause}
          className="flex-1 py-4 rounded-xl bg-rest text-background font-bold"
          whileTap={{ scale: 0.97 }}
          transition={tapTransition}
        >
          {t('actions.pause')}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={onResume}
          className="flex-1 py-4 rounded-xl bg-primary text-background font-bold"
          whileTap={{ scale: 0.97 }}
          transition={tapTransition}
        >
          {t('actions.resume')}
        </motion.button>
      )}
      <motion.button
        type="button"
        onClick={onSkip}
        className="flex-1 py-4 rounded-xl bg-surface text-text font-semibold"
        whileTap={{ scale: 0.97 }}
        transition={tapTransition}
      >
        {t('actions.skip')}
      </motion.button>
    </div>
  );
}
