import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import type { WorkoutPhase } from '../types';
import { buttonVariants } from './ui/button';
import { cn } from '../lib/utils';

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
        className={cn(
          buttonVariants({ variant: 'default' }),
          'w-full py-4 text-lg font-bold',
        )}
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
        className={cn(
          buttonVariants({ variant: 'destructive' }),
          'flex-1 py-4 font-semibold',
        )}
        whileTap={{ scale: 0.97 }}
        transition={tapTransition}
      >
        {t('actions.stop')}
      </motion.button>
      {isRunning ? (
        <motion.button
          type="button"
          onClick={onPause}
          className="bg-rest flex-1 rounded-full py-4 text-sm font-bold text-white backdrop-blur-xl"
          whileTap={{ scale: 0.97 }}
          transition={tapTransition}
        >
          {t('actions.pause')}
        </motion.button>
      ) : (
        <motion.button
          type="button"
          onClick={onResume}
          className={cn(
            buttonVariants({ variant: 'default' }),
            'flex-1 py-4 font-bold',
          )}
          whileTap={{ scale: 0.97 }}
          transition={tapTransition}
        >
          {t('actions.resume')}
        </motion.button>
      )}
      <motion.button
        type="button"
        onClick={onSkip}
        className={cn(
          buttonVariants({ variant: 'secondary' }),
          'flex-1 py-4 font-semibold',
        )}
        whileTap={{ scale: 0.97 }}
        transition={tapTransition}
      >
        {t('actions.skip')}
      </motion.button>
    </div>
  );
}
