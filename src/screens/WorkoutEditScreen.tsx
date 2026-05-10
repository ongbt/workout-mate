import { useReducer, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { v4 as uuid } from 'uuid';
import { useWorkouts, useDefaultWorkouts } from '../hooks/useWorkouts';
import { useError } from '../context/ErrorContext';
import { Layout } from '../components/Layout';
import { ExerciseFormRow } from '../components/ExerciseFormRow';
import {
  DEFAULT_EXERCISE_DURATION,
  DEFAULT_REST_DURATION,
  DEFAULT_ROUNDS,
  DEFAULT_REST_BETWEEN_ROUNDS,
  MIN_EXERCISES,
} from '../constants';
import type { WorkoutConfig, Exercise } from '../types';

interface FormState {
  name: string;
  exercises: Exercise[];
  restSeconds: string;
  restBetweenRoundsSeconds: string;
  rounds: string;
}

type FormAction =
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_REST'; restSeconds: string }
  | { type: 'SET_REST_BETWEEN_ROUNDS'; restBetweenRoundsSeconds: string }
  | { type: 'SET_ROUNDS'; rounds: string }
  | { type: 'SET_EXERCISE'; index: number; exercise: Exercise }
  | { type: 'ADD_EXERCISE' }
  | { type: 'DELETE_EXERCISE'; index: number }
  | { type: 'MOVE_UP'; index: number }
  | { type: 'MOVE_DOWN'; index: number }
  | {
      type: 'IMPORT_TEMPLATE';
      name: string;
      exercises: Exercise[];
      restSeconds: number;
      restBetweenRoundsSeconds: number;
      rounds: number;
    };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_REST':
      return { ...state, restSeconds: action.restSeconds };
    case 'SET_REST_BETWEEN_ROUNDS':
      return {
        ...state,
        restBetweenRoundsSeconds: action.restBetweenRoundsSeconds,
      };
    case 'SET_ROUNDS':
      return { ...state, rounds: action.rounds };
    case 'SET_EXERCISE': {
      const exercises = [...state.exercises];
      exercises[action.index] = action.exercise;
      return { ...state, exercises };
    }
    case 'ADD_EXERCISE':
      return {
        ...state,
        exercises: [
          ...state.exercises,
          { id: uuid(), name: '', durationSeconds: DEFAULT_EXERCISE_DURATION },
        ],
      };
    case 'DELETE_EXERCISE': {
      if (state.exercises.length <= MIN_EXERCISES) return state;
      return {
        ...state,
        exercises: state.exercises.filter((_, i) => i !== action.index),
      };
    }
    case 'MOVE_UP': {
      if (action.index <= 0) return state;
      const exercises = [...state.exercises];
      [exercises[action.index - 1], exercises[action.index]] = [
        exercises[action.index]!,
        exercises[action.index - 1]!,
      ];
      return { ...state, exercises };
    }
    case 'MOVE_DOWN': {
      if (action.index >= state.exercises.length - 1) return state;
      const exercises = [...state.exercises];
      [exercises[action.index], exercises[action.index + 1]] = [
        exercises[action.index + 1]!,
        exercises[action.index]!,
      ];
      return { ...state, exercises };
    }
    case 'IMPORT_TEMPLATE':
      return {
        ...state,
        name: action.name,
        exercises: action.exercises.map((e) => ({ ...e })),
        restSeconds: String(action.restSeconds),
        restBetweenRoundsSeconds: String(action.restBetweenRoundsSeconds),
        rounds: String(action.rounds),
      };
  }
}

function initForm(workout?: WorkoutConfig): FormState {
  if (workout) {
    return {
      name: workout.name,
      exercises: workout.exercises.map((e) => ({ ...e })),
      restSeconds: String(workout.restSeconds),
      restBetweenRoundsSeconds: String(workout.restBetweenRoundsSeconds),
      rounds: String(workout.rounds),
    };
  }
  return {
    name: '',
    exercises: [
      { id: uuid(), name: '', durationSeconds: DEFAULT_EXERCISE_DURATION },
    ],
    restSeconds: String(DEFAULT_REST_DURATION),
    restBetweenRoundsSeconds: String(DEFAULT_REST_BETWEEN_ROUNDS),
    rounds: String(DEFAULT_ROUNDS),
  };
}

const baseInput =
  'bg-surface border rounded-lg px-3 py-2.5 text-text placeholder:text-text-muted/50 focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/30';
const textClass = (error: boolean) =>
  `${baseInput} ${error ? 'border-red-500' : 'border-text-muted/30'}`;
const numClass = (error: boolean) =>
  `${baseInput} text-center ${error ? 'border-red-500' : 'border-text-muted/30'}`;

function parsePositiveInt(s: string): number | null {
  const n = parseInt(s, 10);
  if (isNaN(n) || n < 0 || s.trim() === '') return null;
  return n;
}

function parseMinOne(s: string): number | null {
  const n = parseInt(s, 10);
  if (isNaN(n) || n < 1 || s.trim() === '') return null;
  return n;
}

export function WorkoutEditScreen() {
  const { t } = useTranslation();
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkouts();
  const { showError } = useError();

  const existing = workoutId
    ? workouts.find((w) => w.id === workoutId)
    : undefined;
  const [form, dispatch] = useReducer(formReducer, existing, initForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [blanks, setBlanks] = useState<Set<string>>(new Set());
  const defaultWorkouts = useDefaultWorkouts();

  const checkBlank = useCallback((key: string, value: string) => {
    setBlanks((prev) => {
      const next = new Set(prev);
      if (value.trim() === '') {
        next.add(key);
      } else {
        next.delete(key);
      }
      return next;
    });
  }, []);

  const markAllBlank = useCallback(() => {
    const b = new Set<string>();
    if (!form.name.trim()) b.add('name');
    if (form.rounds.trim() === '' || parseMinOne(form.rounds) === null)
      b.add('rounds');
    if (
      form.restSeconds.trim() === '' ||
      parsePositiveInt(form.restSeconds) === null
    )
      b.add('restSeconds');
    if (
      form.restBetweenRoundsSeconds.trim() === '' ||
      parsePositiveInt(form.restBetweenRoundsSeconds) === null
    )
      b.add('restBetweenRounds');
    form.exercises.forEach((e, i) => {
      if (!e.name.trim()) b.add(`ex-${i}`);
      if (String(e.durationSeconds).trim() === '') b.add(`ex-dur-${i}`);
    });
    setBlanks(b);
  }, [form]);

  const handleSave = async () => {
    const rounds = parseMinOne(form.rounds);
    const restSec = parsePositiveInt(form.restSeconds);
    const restRound = parsePositiveInt(form.restBetweenRoundsSeconds);

    if (
      !form.name.trim() ||
      rounds === null ||
      restSec === null ||
      restRound === null
    ) {
      markAllBlank();
      return;
    }
    if (form.exercises.some((e) => !e.name.trim())) {
      markAllBlank();
      return;
    }

    const config = {
      id: existing?.id ?? uuid(),
      name: form.name.trim(),
      exercises: form.exercises.map((e) => ({ ...e, name: e.name.trim() })),
      restSeconds: restSec,
      restBetweenRoundsSeconds: restRound,
      rounds,
    };

    try {
      if (existing) {
        await updateWorkout(config);
      } else {
        const { id, ...workout } = config;
        void id;
        await addWorkout(workout);
      }
      navigate('/');
    } catch (e) {
      showError(
        t('errors.mutationFailed'),
        e instanceof Error ? e.message : t('errors.tryAgain'),
      );
    }
  };

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = async () => {
    if (existing) {
      try {
        await deleteWorkout(existing.id);
        navigate('/');
      } catch (e) {
        showError(
          t('errors.mutationFailed'),
          e instanceof Error ? e.message : t('errors.tryAgain'),
        );
      }
    }
  };

  const nameError = blanks.has('name');
  const roundsError = blanks.has('rounds');
  const restExError = blanks.has('restSeconds');
  const restRoundError = blanks.has('restBetweenRounds');
  const exErrors = form.exercises.map((_, i) => blanks.has(`ex-${i}`));
  const numBlanks =
    blanks.has('rounds') ||
    blanks.has('restSeconds') ||
    blanks.has('restBetweenRounds');
  const hasAnyError =
    numBlanks ||
    nameError ||
    form.exercises.some((e) => !e.name.trim()) ||
    exErrors.some(Boolean);

  return (
    <Layout>
      <Helmet>
        <title>
          {existing
            ? t('screens.workoutEdit.pageTitleEdit')
            : t('screens.workoutEdit.pageTitleNew')}
        </title>
        <meta
          name="description"
          content={t('screens.workoutEdit.pageDescription')}
        />
      </Helmet>
      <header className="flex items-center gap-3 py-4">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="text-text-muted hover:bg-surface flex h-10 w-10 items-center justify-center rounded-lg"
          aria-label={t('navigation.goBack')}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h2 className="truncate text-xl font-bold">
          {existing
            ? t('screens.workoutEdit.titleEdit')
            : t('screens.workoutEdit.titleNew')}
        </h2>
      </header>

      <div className="scrollbar-hide flex flex-1 flex-col gap-5 overflow-y-auto pb-4">
        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">{t('labels.name')}</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              dispatch({ type: 'SET_NAME', name: e.target.value });
              checkBlank('name', e.target.value);
            }}
            onBlur={(e) => checkBlank('name', e.target.value)}
            placeholder={t('screens.workoutEdit.namePlaceholder')}
            className={textClass(nameError)}
          />
          {nameError && (
            <span className="text-xs text-red-400">
              {t('validation.nameRequired')}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">{t('labels.rounds')}</span>
          <input
            type="text"
            inputMode="numeric"
            value={form.rounds}
            onChange={(e) => {
              dispatch({ type: 'SET_ROUNDS', rounds: e.target.value });
              checkBlank('rounds', e.target.value);
            }}
            onBlur={(e) => checkBlank('rounds', e.target.value)}
            className={numClass(roundsError)}
          />
          {roundsError && (
            <span className="text-xs text-red-400">
              {t('validation.valueRequired')}
            </span>
          )}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">
            {t('screens.workoutEdit.restBetweenRoundsLabel')}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.restBetweenRoundsSeconds}
            onChange={(e) => {
              dispatch({
                type: 'SET_REST_BETWEEN_ROUNDS',
                restBetweenRoundsSeconds: e.target.value,
              });
              checkBlank('restBetweenRounds', e.target.value);
            }}
            onBlur={(e) => checkBlank('restBetweenRounds', e.target.value)}
            className={numClass(restRoundError)}
          />
          {restRoundError && (
            <span className="text-xs text-red-400">
              {t('validation.valueRequired')}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">
            {t('screens.workoutEdit.restBetweenExercisesLabel')}
          </span>
          <input
            type="text"
            inputMode="numeric"
            value={form.restSeconds}
            onChange={(e) => {
              dispatch({ type: 'SET_REST', restSeconds: e.target.value });
              checkBlank('restSeconds', e.target.value);
            }}
            onBlur={(e) => checkBlank('restSeconds', e.target.value)}
            className={numClass(restExError)}
          />
          {restExError && (
            <span className="text-xs text-red-400">
              {t('validation.valueRequired')}
            </span>
          )}
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-text-muted text-sm">
              {t('screens.workoutActive.exercisesLabel')}
            </span>
            <div className="flex items-center gap-2">
              {!existing && defaultWorkouts.length > 0 && (
                <button
                  type="button"
                  onClick={() => setShowImportModal(true)}
                  className="text-text-muted hover:text-text hover:bg-surface rounded-lg px-2 py-1 text-sm transition-colors"
                >
                  {t('screens.workoutEdit.importTemplate')}
                </button>
              )}
              <button
                type="button"
                onClick={() => dispatch({ type: 'ADD_EXERCISE' })}
                className="text-primary hover:bg-primary/10 rounded-lg px-3 py-1 text-sm font-medium"
              >
                {t('screens.workoutEdit.addExercise')}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-1 px-0.5">
            <span className="w-[72px] shrink-0" />
            <span className="text-text-muted min-w-0 flex-1 text-xs">
              {t('labels.name')}
            </span>
            <span className="text-text-muted w-16 text-center text-xs">
              {t('labels.seconds')}
            </span>
            <span className="w-10 shrink-0" />
          </div>
          {form.exercises.map((ex, i) => (
            <ExerciseFormRow
              key={ex.id}
              exercise={ex}
              error={exErrors[i] ?? false}
              onChange={(updated) => {
                dispatch({ type: 'SET_EXERCISE', index: i, exercise: updated });
                checkBlank(`ex-${i}`, updated.name);
              }}
              onBlur={() => {
                checkBlank(`ex-${i}`, form.exercises[i]?.name ?? '');
              }}
              onDelete={() => dispatch({ type: 'DELETE_EXERCISE', index: i })}
              canDelete={form.exercises.length > MIN_EXERCISES}
              onMoveUp={() => dispatch({ type: 'MOVE_UP', index: i })}
              onMoveDown={() => dispatch({ type: 'MOVE_DOWN', index: i })}
              canMoveUp={i > 0}
              canMoveDown={i < form.exercises.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 py-4">
        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            className="rounded-xl border border-red-500/30 bg-red-500/20 px-4 py-4 font-semibold text-red-400"
          >
            {t('actions.delete')}
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={hasAnyError}
          className={`flex-1 rounded-xl py-4 text-lg font-bold ${
            hasAnyError
              ? 'bg-text-muted/30 text-text-muted cursor-not-allowed'
              : 'bg-primary text-background'
          }`}
        >
          {t('actions.save')}
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-surface flex w-full max-w-sm flex-col gap-4 rounded-xl p-6">
            <h3 className="text-lg font-semibold">
              {t('screens.workoutEdit.deleteConfirmTitle')}
            </h3>
            <p className="text-text-muted text-sm">
              {t('screens.workoutEdit.deleteConfirmMessage', {
                name: form.name || 'this workout',
              })}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="bg-text-muted/20 text-text flex-1 rounded-xl py-3 font-semibold"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 rounded-xl bg-red-500 py-3 font-semibold text-white"
              >
                {t('actions.delete')}
              </button>
            </div>
          </div>
        </div>
      )}

      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-surface flex max-h-[70vh] w-full max-w-sm flex-col gap-4 rounded-xl p-6">
            <h3 className="text-lg font-semibold">
              {t('screens.workoutEdit.importModalTitle')}
            </h3>
            <p className="text-text-muted text-sm">
              {t('screens.workoutEdit.importModalDescription')}
            </p>
            <div className="flex flex-col gap-2 overflow-y-auto">
              {defaultWorkouts.map((dw) => (
                <button
                  key={dw.id}
                  type="button"
                  onClick={() => {
                    dispatch({
                      type: 'IMPORT_TEMPLATE',
                      name: dw.name,
                      exercises: dw.exercises,
                      restSeconds: dw.restSeconds,
                      restBetweenRoundsSeconds: dw.restBetweenRoundsSeconds,
                      rounds: dw.rounds,
                    });
                    setShowImportModal(false);
                  }}
                  className="hover:bg-background flex items-center justify-between rounded-lg p-3 text-left transition-colors"
                >
                  <div>
                    <p className="text-sm font-medium">{dw.name}</p>
                    <p className="text-text-muted text-xs">
                      {t('labels.exercises', { count: dw.exercises.length })}{' '}
                      &middot; {t('labels.rounds', { count: dw.rounds })}
                    </p>
                  </div>
                  <span className="text-primary text-xs font-medium">
                    {t('actions.import')}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowImportModal(false)}
              className="bg-text-muted/20 text-text rounded-xl py-3 font-semibold"
            >
              {t('actions.cancel')}
            </button>
          </div>
        </div>
      )}
    </Layout>
  );
}
