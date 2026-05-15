import { useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { useWorkouts } from '../hooks/useWorkouts';
import { useSessions } from '../hooks/useSessions';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { Layout } from '../components/Layout';
import { TimerDisplay } from '../components/TimerDisplay';
import { PhaseIndicator } from '../components/PhaseIndicator';
import { ProgressBar } from '../components/ProgressBar';
import { ControlButtons } from '../components/ControlButtons';
import { FinishedView } from '../components/FinishedView';
import { useFeatureFlag } from '../hooks/useFeatureFlag';
import { Button } from '../components/ui/button';
import { buttonVariants } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { cn } from '../lib/utils';
import type { WorkoutConfig, WorkoutCompletion } from '../types';

const activeExit = {
  opacity: 0,
  y: -10,
  transition: { duration: 0.2, ease: 'easeIn' as const },
};

const activeEnter = {
  opacity: 1,
  y: 0,
  transition: { duration: 0.2, ease: 'easeOut' as const },
};

const phaseContentVariants = {
  initial: { opacity: 0, y: 15 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.25, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -15,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
} as const;

const finishedVariants = {
  initial: { opacity: 0, scale: 0.85 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.35, ease: 'easeOut' as const },
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2, ease: 'easeIn' as const },
  },
} as const;

function WorkoutActiveContent({ config }: { config: WorkoutConfig }) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { recordSession } = useSessions();

  const onComplete = useCallback(
    (completion: WorkoutCompletion) => {
      recordSession(config.id, config.name, completion);
    },
    [config.id, config.name, recordSession],
  );

  const {
    sessionState,
    totalDurationMs,
    isRunning,
    currentExercise,
    nextExercise,
    handleStart,
    handlePause,
    handleResume,
    handleStop,
    handleSkip,
  } = useActiveWorkout(config, onComplete);

  const {
    phase,
    currentRound,
    currentExerciseIndex,
    timeRemainingMs,
    totalRounds,
    totalExercises,
  } = sessionState;

  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const isActive = phase !== 'idle' && phase !== 'finished';
  const controlsAbove = useFeatureFlag('workout-controls-above-exercises');

  const requestStop = () => setShowStopConfirm(true);

  const confirmStop = () => {
    setShowStopConfirm(false);
    handleStop();
    navigate('/');
  };

  const handleBack = () => {
    if (isActive) {
      requestStop();
    } else {
      navigate('/');
    }
  };

  const getExerciseStatus = (
    round: number,
    index: number,
  ): 'done' | 'current' | 'upcoming' => {
    if (round < currentRound) return 'done';
    if (round > currentRound) return 'upcoming';
    if (phase === 'idle') return 'upcoming';
    if (index < currentExerciseIndex) return 'done';
    if (index === currentExerciseIndex && phase === 'exercise')
      return 'current';
    return 'upcoming';
  };

  return (
    <Layout>
      <Helmet>
        <title>
          {t('screens.workoutActive.pageTitle', { name: config.name })}
        </title>
        <meta
          name="description"
          content={t('screens.workoutActive.pageDescription')}
        />
      </Helmet>
      <header className="flex items-center gap-3 py-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleBack}
          aria-label={t('navigation.goBack')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="truncate text-lg font-semibold">{config.name}</h2>
      </header>

      <AnimatePresence mode="wait">
        {phase !== 'finished' ? (
          <motion.div
            key="active-workout"
            className="scrollbar-hide flex min-h-0 flex-1 flex-col items-center gap-5 overflow-y-auto pb-4"
            exit={activeExit}
            animate={activeEnter}
            initial={activeExit}
          >
            <PhaseIndicator phase={phase} />

            <AnimatePresence mode="wait">
              {phase === 'exercise' && currentExercise && (
                <motion.div
                  key="exercise"
                  className="flex flex-col items-center gap-3"
                  variants={phaseContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TimerDisplay
                    timeRemainingMs={timeRemainingMs}
                    totalDurationMs={totalDurationMs}
                    phase={phase}
                  />
                  <h3 className="text-center text-xl font-bold">
                    {currentExercise.name}
                  </h3>
                  {currentExercise.imageUrl && (
                    <img
                      src={currentExercise.imageUrl}
                      alt={currentExercise.name}
                      className="h-48 w-48 rounded-2xl object-cover"
                      loading="lazy"
                    />
                  )}
                  {nextExercise && (
                    <p className="text-text-muted -mt-2 text-sm">
                      {t('screens.workoutActive.next', {
                        name: nextExercise.name,
                      })}
                    </p>
                  )}
                </motion.div>
              )}

              {phase === 'rest' && currentExercise && (
                <motion.div
                  key="rest"
                  className="flex flex-col items-center gap-3"
                  variants={phaseContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <TimerDisplay
                    timeRemainingMs={timeRemainingMs}
                    totalDurationMs={totalDurationMs}
                    phase={phase}
                  />
                  <p className="text-text-muted text-sm">
                    {t('components.phaseIndicator.rest')}
                  </p>
                  {nextExercise && (
                    <p className="-mt-2 text-center text-lg font-semibold">
                      {t('screens.workoutActive.upNext', {
                        name: nextExercise.name,
                      })}
                    </p>
                  )}
                </motion.div>
              )}

              {phase === 'idle' && (
                <motion.div
                  key="idle"
                  className="flex w-full flex-1 flex-col justify-center gap-5"
                  variants={phaseContentVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  <h3 className="text-center text-xl font-bold">
                    {config.name}
                  </h3>

                  <div className="bg-surface/80 space-y-3 rounded-2xl p-4 backdrop-blur-xl">
                    <p className="text-text-muted text-sm font-semibold tracking-wider uppercase">
                      {t('screens.workoutActive.exercisesLabel')} —{' '}
                      {t('labels.rounds', { count: config.rounds })}
                    </p>
                    <ul className="space-y-2">
                      {config.exercises.map((ex) => (
                        <li
                          key={ex.id}
                          className="flex items-center justify-between gap-2"
                        >
                          {ex.imageUrl && (
                            <img
                              src={ex.imageUrl}
                              alt={ex.name}
                              className="h-6 w-6 shrink-0 rounded-md object-cover"
                              loading="lazy"
                            />
                          )}
                          <span className="flex-1 truncate text-sm">
                            {ex.name}
                          </span>
                          <span className="text-text-muted text-xs">
                            {ex.durationSeconds}s
                          </span>
                        </li>
                      ))}
                    </ul>
                    <hr className="border-white/10" />
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        {t('screens.workoutActive.restBetweenExercises')}
                      </span>
                      <span>{config.restSeconds}s</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-muted">
                        {t('screens.workoutActive.restBetweenRounds')}
                      </span>
                      <span>{config.restBetweenRoundsSeconds}s</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {phase !== 'idle' && (
              <>
                {controlsAbove && (
                  <div className="w-full pt-2">
                    <ControlButtons
                      phase={phase}
                      isRunning={isRunning}
                      onStart={handleStart}
                      onPause={handlePause}
                      onResume={handleResume}
                      onSkip={handleSkip}
                      onStop={requestStop}
                    />
                  </div>
                )}
                <motion.div
                  className="w-full space-y-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1, transition: { duration: 0.2 } }}
                >
                  <ProgressBar
                    currentRound={currentRound}
                    totalRounds={totalRounds}
                    currentExerciseIndex={currentExerciseIndex}
                    totalExercises={totalExercises}
                  />

                  <div className="bg-surface/80 space-y-1 rounded-2xl p-3 backdrop-blur-xl">
                    {config.exercises.map((ex, idx) => {
                      const status = getExerciseStatus(currentRound, idx);
                      return (
                        <div
                          key={ex.id}
                          className={`flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                            status === 'current'
                              ? 'ring-primary/30 bg-white/[0.04] ring-1'
                              : ''
                          }`}
                        >
                          <span
                            className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                              status === 'done'
                                ? 'bg-primary'
                                : status === 'current'
                                  ? phase === 'exercise'
                                    ? 'bg-primary animate-pulse'
                                    : 'bg-rest animate-pulse'
                                  : 'bg-text-muted/30'
                            }`}
                          />
                          <span
                            className={`flex-1 truncate text-sm ${
                              status === 'current'
                                ? 'font-semibold'
                                : status === 'done'
                                  ? 'text-text'
                                  : 'text-text-muted'
                            }`}
                          >
                            {ex.name}
                          </span>
                          <span className="text-text-muted shrink-0 text-xs">
                            {ex.durationSeconds}s
                          </span>
                          {totalRounds > 1 && (
                            <div className="flex shrink-0 gap-1">
                              {Array.from({ length: totalRounds }, (_, r) => {
                                const rs = getExerciseStatus(r + 1, idx);
                                return (
                                  <span
                                    key={r}
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      rs === 'done'
                                        ? 'bg-primary'
                                        : rs === 'current'
                                          ? phase === 'exercise'
                                            ? 'bg-primary'
                                            : 'bg-rest'
                                          : 'bg-text-muted/20'
                                    }`}
                                  />
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="finished"
            className="flex flex-1 flex-col items-center justify-center gap-6"
            variants={finishedVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <FinishedView />
          </motion.div>
        )}
      </AnimatePresence>

      {(!controlsAbove || phase === 'idle') && phase !== 'finished' && (
        <div className="py-4">
          <ControlButtons
            phase={phase}
            isRunning={isRunning}
            onStart={handleStart}
            onPause={handlePause}
            onResume={handleResume}
            onSkip={handleSkip}
            onStop={requestStop}
          />
        </div>
      )}

      <Dialog open={showStopConfirm} onOpenChange={setShowStopConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('workout.stopConfirmTitle')}</DialogTitle>
            <DialogDescription>
              {t('workout.stopConfirmMessage')}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              type="button"
              onClick={() => setShowStopConfirm(false)}
              className={cn(
                buttonVariants({ variant: 'default' }),
                'flex-1 font-semibold transition-transform active:scale-[0.97]',
              )}
            >
              {t('workout.continue')}
            </button>
            <button
              type="button"
              onClick={confirmStop}
              className={cn(
                buttonVariants({ variant: 'destructive' }),
                'flex-1 font-semibold transition-transform active:scale-[0.97]',
              )}
            >
              {t('actions.stop')}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}

export function WorkoutActiveScreen() {
  const { t } = useTranslation();
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { workouts } = useWorkouts();

  const config = workouts.find((w) => w.id === workoutId);

  if (!config) {
    return (
      <Layout>
        <div className="flex flex-1 flex-col items-center justify-center gap-4">
          <p className="text-text-muted">{t('workout.notFound')}</p>
          <Button variant="secondary" onClick={() => navigate('/')}>
            {t('actions.backToHome')}
          </Button>
        </div>
      </Layout>
    );
  }

  return <WorkoutActiveContent config={config} />;
}
