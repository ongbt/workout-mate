import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useWorkouts } from '../hooks/useWorkouts';
import { useActiveWorkout } from '../hooks/useActiveWorkout';
import { Layout } from '../components/Layout';
import { TimerDisplay } from '../components/TimerDisplay';
import { PhaseIndicator } from '../components/PhaseIndicator';
import { ProgressBar } from '../components/ProgressBar';
import { ControlButtons } from '../components/ControlButtons';
import { FinishedView } from '../components/FinishedView';

export function WorkoutActiveScreen() {
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { workouts } = useWorkouts();

  const config = workouts.find((w) => w.id === workoutId);

  if (!config) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center flex-1 gap-4">
          <p className="text-text-muted">Workout not found</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-3 rounded-xl bg-surface text-text font-semibold"
          >
            Back to Home
          </button>
        </div>
      </Layout>
    );
  }

  // eslint-disable-next-line react-hooks/rules-of-hooks
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
  } = useActiveWorkout(config);

  const { phase, currentRound, currentExerciseIndex, timeRemainingMs, totalRounds, totalExercises } = sessionState;

  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const isActive = phase !== 'idle' && phase !== 'finished';

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

  const getExerciseStatus = (round: number, index: number): 'done' | 'current' | 'upcoming' => {
    if (round < currentRound) return 'done';
    if (round > currentRound) return 'upcoming';
    if (phase === 'idle') return 'upcoming';
    if (index < currentExerciseIndex) return 'done';
    if (index === currentExerciseIndex && phase === 'exercise') return 'current';
    return 'upcoming';
  };

  return (
    <Layout>
      <header className="py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={handleBack}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold truncate">{config.name}</h2>
      </header>

      {phase !== 'finished' ? (
        <div className="flex flex-col items-center gap-5 flex-1 min-h-0 overflow-y-auto scrollbar-hide pb-4">
          <PhaseIndicator phase={phase} />

          {phase === 'exercise' && currentExercise && (
            <div className="flex flex-col items-center gap-3">
              <TimerDisplay
                timeRemainingMs={timeRemainingMs}
                totalDurationMs={totalDurationMs}
                phase={phase}
              />
              <h3 className="text-xl font-bold text-center">{currentExercise.name}</h3>
              {nextExercise && (
                <p className="text-sm text-text-muted -mt-2">Next: {nextExercise.name}</p>
              )}
            </div>
          )}

          {phase === 'rest' && currentExercise && (
            <div className="flex flex-col items-center gap-3">
              <TimerDisplay
                timeRemainingMs={timeRemainingMs}
                totalDurationMs={totalDurationMs}
                phase={phase}
              />
              <p className="text-sm text-text-muted">Rest</p>
              {nextExercise && (
                <p className="text-lg font-semibold text-center -mt-2">Up next: {nextExercise.name}</p>
              )}
            </div>
          )}

          {phase === 'idle' && (
            <div className="flex flex-col gap-5 flex-1 justify-center w-full">
              <h3 className="text-xl font-bold text-center">{config.name}</h3>

              <div className="bg-surface rounded-xl p-4 space-y-3">
                <p className="text-sm font-semibold text-text-muted uppercase tracking-wider">
                  Exercises — {config.rounds} round{config.rounds !== 1 ? 's' : ''}
                </p>
                <ul className="space-y-2">
                  {config.exercises.map((ex) => (
                    <li key={ex.id} className="flex items-center justify-between">
                      <span className="text-sm">{ex.name}</span>
                      <span className="text-xs text-text-muted">{ex.durationSeconds}s</span>
                    </li>
                  ))}
                </ul>
                <hr className="border-text-muted/20" />
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Rest between exercises</span>
                  <span>{config.restSeconds}s</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-text-muted">Rest between rounds</span>
                  <span>{config.restBetweenRoundsSeconds}s</span>
                </div>
              </div>
            </div>
          )}

          {phase !== 'idle' && (
            <div className="w-full space-y-4">
              <ProgressBar
                currentRound={currentRound}
                totalRounds={totalRounds}
                currentExerciseIndex={currentExerciseIndex}
                totalExercises={totalExercises}
              />

              <div className="bg-surface rounded-xl p-3 space-y-1">
                {config.exercises.map((ex, idx) => {
                  const status = getExerciseStatus(currentRound, idx);
                  return (
                    <div
                      key={ex.id}
                      className={`flex items-center gap-3 py-2 px-2 rounded-lg transition-colors ${
                        status === 'current' ? 'bg-background ring-1 ring-primary/30' : ''
                      }`}
                    >
                      <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                        status === 'done' ? 'bg-primary' :
                        status === 'current' ? (phase === 'exercise' ? 'bg-primary animate-pulse' : 'bg-rest animate-pulse') :
                        'bg-text-muted/30'
                      }`} />
                      <span className={`text-sm flex-1 truncate ${
                        status === 'current' ? 'font-semibold' :
                        status === 'done' ? 'text-text' :
                        'text-text-muted'
                      }`}>
                        {ex.name}
                      </span>
                      <span className="text-xs text-text-muted shrink-0">{ex.durationSeconds}s</span>
                      {totalRounds > 1 && (
                        <div className="flex gap-1 shrink-0">
                          {Array.from({ length: totalRounds }, (_, r) => {
                            const rs = getExerciseStatus(r + 1, idx);
                            return (
                              <span
                                key={r}
                                className={`w-1.5 h-1.5 rounded-full ${
                                  rs === 'done' ? 'bg-primary' :
                                  rs === 'current' ? (phase === 'exercise' ? 'bg-primary' : 'bg-rest') :
                                  'bg-text-muted/20'
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
            </div>
          )}
        </div>
      ) : (
        <FinishedView />
      )}

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

      {showStopConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Stop Workout?</h3>
            <p className="text-sm text-text-muted">
              Your progress will be lost. Are you sure you want to stop?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowStopConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-primary text-background font-semibold"
              >
                Continue Workout
              </button>
              <button
                type="button"
                onClick={confirmStop}
                className="flex-1 py-3 rounded-xl bg-red-500/20 text-red-400 font-semibold border border-red-500/30"
              >
                Stop
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
