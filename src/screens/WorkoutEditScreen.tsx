import { useReducer, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { v4 as uuid } from 'uuid';
import { useWorkoutConfig } from '../context/WorkoutConfigContext';
import { Layout } from '../components/Layout';
import { ExerciseFormRow } from '../components/ExerciseFormRow';
import { DEFAULT_EXERCISE_DURATION, DEFAULT_REST_DURATION, DEFAULT_ROUNDS, DEFAULT_REST_BETWEEN_ROUNDS, MIN_EXERCISES } from '../constants';
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
  | { type: 'MOVE_DOWN'; index: number };

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_REST':
      return { ...state, restSeconds: action.restSeconds };
    case 'SET_REST_BETWEEN_ROUNDS':
      return { ...state, restBetweenRoundsSeconds: action.restBetweenRoundsSeconds };
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
        exercises: [...state.exercises, { id: uuid(), name: '', durationSeconds: DEFAULT_EXERCISE_DURATION }],
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
    exercises: [{ id: uuid(), name: '', durationSeconds: DEFAULT_EXERCISE_DURATION }],
    restSeconds: String(DEFAULT_REST_DURATION),
    restBetweenRoundsSeconds: String(DEFAULT_REST_BETWEEN_ROUNDS),
    rounds: String(DEFAULT_ROUNDS),
  };
}

const baseInput = 'bg-surface border rounded-lg px-3 py-2.5 text-text placeholder:text-text-muted/50';
const textClass = (error: boolean) => `${baseInput} ${error ? 'border-red-500' : 'border-text-muted/30'}`;
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
  const { workoutId } = useParams<{ workoutId: string }>();
  const navigate = useNavigate();
  const { workouts, addWorkout, updateWorkout, deleteWorkout } = useWorkoutConfig();

  const existing = workoutId ? workouts.find((w) => w.id === workoutId) : undefined;
  const [form, dispatch] = useReducer(formReducer, existing, initForm);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [blanks, setBlanks] = useState<Set<string>>(new Set());

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
    if (form.rounds.trim() === '' || parseMinOne(form.rounds) === null) b.add('rounds');
    if (form.restSeconds.trim() === '' || parsePositiveInt(form.restSeconds) === null) b.add('restSeconds');
    if (form.restBetweenRoundsSeconds.trim() === '' || parsePositiveInt(form.restBetweenRoundsSeconds) === null) b.add('restBetweenRounds');
    form.exercises.forEach((e, i) => {
      if (!e.name.trim()) b.add(`ex-${i}`);
      if (String(e.durationSeconds).trim() === '') b.add(`ex-dur-${i}`);
    });
    setBlanks(b);
  }, [form]);

  const handleSave = () => {
    const rounds = parseMinOne(form.rounds);
    const restSec = parsePositiveInt(form.restSeconds);
    const restRound = parsePositiveInt(form.restBetweenRoundsSeconds);

    if (!form.name.trim() || rounds === null || restSec === null || restRound === null) {
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

    if (existing) {
      updateWorkout(config);
    } else {
      addWorkout(config);
    }
    navigate('/');
  };

  const handleDelete = () => setShowDeleteConfirm(true);

  const confirmDelete = () => {
    if (existing) {
      deleteWorkout(existing.id);
      navigate('/');
    }
  };

  const nameError = blanks.has('name');
  const roundsError = blanks.has('rounds');
  const restExError = blanks.has('restSeconds');
  const restRoundError = blanks.has('restBetweenRounds');
  const exErrors = form.exercises.map((_, i) => blanks.has(`ex-${i}`));
  const numBlanks =
    blanks.has('rounds') || blanks.has('restSeconds') || blanks.has('restBetweenRounds');
  const hasAnyError = numBlanks || nameError || form.exercises.some((e) => !e.name.trim()) || exErrors.some(Boolean);

  return (
    <Layout>
      <header className="py-4 flex items-center gap-3">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-text-muted hover:bg-surface"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-bold truncate">{existing ? 'Edit Workout' : 'New Workout'}</h2>
      </header>

      <div className="flex flex-col gap-5 flex-1 overflow-y-auto scrollbar-hide pb-4">
        <label className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">Name</span>
          <input
            type="text"
            value={form.name}
            onChange={(e) => {
              dispatch({ type: 'SET_NAME', name: e.target.value });
              checkBlank('name', e.target.value);
            }}
            onBlur={(e) => checkBlank('name', e.target.value)}
            placeholder="e.g. Upper Body"
            className={textClass(nameError)}
          />
          {nameError && <span className="text-xs text-red-400">Name is required</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">Rounds</span>
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
          {roundsError && <span className="text-xs text-red-400">Value is required</span>}
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">Rest between rounds (sec)</span>
          <input
            type="text"
            inputMode="numeric"
            value={form.restBetweenRoundsSeconds}
            onChange={(e) => {
              dispatch({ type: 'SET_REST_BETWEEN_ROUNDS', restBetweenRoundsSeconds: e.target.value });
              checkBlank('restBetweenRounds', e.target.value);
            }}
            onBlur={(e) => checkBlank('restBetweenRounds', e.target.value)}
            className={numClass(restRoundError)}
          />
          {restRoundError && <span className="text-xs text-red-400">Value is required</span>}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-sm text-text-muted">Rest between exercises (sec)</span>
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
          {restExError && <span className="text-xs text-red-400">Value is required</span>}
        </label>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-text-muted">Exercises</span>
            <button
              type="button"
              onClick={() => dispatch({ type: 'ADD_EXERCISE' })}
              className="text-sm text-primary font-medium px-3 py-1 rounded-lg hover:bg-primary/10"
            >
              + Add
            </button>
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

      <div className="py-4 flex gap-3">
        {existing && (
          <button
            type="button"
            onClick={handleDelete}
            className="px-4 py-4 rounded-xl bg-red-500/20 text-red-400 font-semibold border border-red-500/30"
          >
            Delete
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={hasAnyError}
          className={`flex-1 py-4 rounded-xl font-bold text-lg ${
            hasAnyError
              ? 'bg-text-muted/30 text-text-muted cursor-not-allowed'
              : 'bg-primary text-background'
          }`}
        >
          Save
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4">
          <div className="bg-surface rounded-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <h3 className="text-lg font-semibold">Delete Workout?</h3>
            <p className="text-sm text-text-muted">
              This will permanently delete "{form.name || 'this workout'}". This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-text-muted/20 text-text font-semibold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-semibold"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
