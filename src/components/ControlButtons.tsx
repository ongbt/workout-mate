import { useTranslation } from 'react-i18next';
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
      <button
        type="button"
        onClick={onStart}
        className={cn(
          buttonVariants({ variant: 'default' }),
          'w-full py-4 text-lg font-bold transition-transform active:scale-[0.97]',
        )}
      >
        {t('workout.start')}
      </button>
    );
  }

  return (
    <div className="flex gap-3">
      <button
        type="button"
        onClick={onStop}
        className={cn(
          buttonVariants({ variant: 'destructive' }),
          'flex-1 py-4 font-semibold transition-transform active:scale-[0.97]',
        )}
      >
        {t('actions.stop')}
      </button>
      {isRunning ? (
        <button
          type="button"
          onClick={onPause}
          className="bg-rest flex-1 rounded-full py-4 text-sm font-bold text-white backdrop-blur-xl transition-transform active:scale-[0.97]"
        >
          {t('actions.pause')}
        </button>
      ) : (
        <button
          type="button"
          onClick={onResume}
          className={cn(
            buttonVariants({ variant: 'default' }),
            'flex-1 py-4 font-bold transition-transform active:scale-[0.97]',
          )}
        >
          {t('actions.resume')}
        </button>
      )}
      <button
        type="button"
        onClick={onSkip}
        className={cn(
          buttonVariants({ variant: 'secondary' }),
          'flex-1 py-4 font-semibold transition-transform active:scale-[0.97]',
        )}
      >
        {t('actions.skip')}
      </button>
    </div>
  );
}
