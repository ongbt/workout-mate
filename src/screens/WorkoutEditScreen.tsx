import { useReducer, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { v4 as uuid } from 'uuid';
import { ChevronLeft } from 'lucide-react';
import { useWorkouts, useDefaultWorkouts } from '../hooks/useWorkouts';
import { useError } from '../context/ErrorContext';
import { Layout } from '../components/Layout';
import { ExerciseFormRow } from '../components/ExerciseFormRow';
import { ExerciseSearchModal } from '../components/ExerciseSearchModal';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import {
  DEFAULT_EXERCISE_DURATION,
  DEFAULT_REST_DURATION,
  DEFAULT_ROUNDS,
  MIN_EXERCISES,
  MIN_SEGMENTS,
} from '../constants';
import type {
  WorkoutConfig,
  WorkoutSegment,
  ExerciseSegment,
  ExerciseSearchSelection,
} from '../types';

interface FormState {
  name: string;
  segments: WorkoutSegment[];
  rounds: string;
}

type FormAction =
  | { type: 'SET_NAME'; name: string }
  | { type: 'SET_ROUNDS'; rounds: string }
  | { type: 'SET_SEGMENT'; index: number; segment: WorkoutSegment }
  | { type: 'ADD_EXERCISE' }
  | { type: 'ADD_REST' }
  | { type: 'DELETE_SEGMENT'; index: number }
  | { type: 'MOVE_UP'; index: number }
  | { type: 'MOVE_DOWN'; index: number }
  | {
      type: 'IMPORT_TEMPLATE';
      name: string;
      segments: WorkoutSegment[];
      rounds: number;
    }
  | {
      type: 'ADD_EXERCISE_FROM_LIBRARY';
      exercise: ExerciseSegment;
    };

function exerciseCount(segments: WorkoutSegment[]): number {
  return segments.filter((s) => s.type === 'exercise').length;
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.name };
    case 'SET_ROUNDS':
      return { ...state, rounds: action.rounds };
    case 'SET_SEGMENT': {
      const segments = [...state.segments];
      segments[action.index] = action.segment;
      return { ...state, segments };
    }
    case 'ADD_EXERCISE':
      return {
        ...state,
        segments: [
          ...state.segments,
          {
            type: 'exercise' as const,
            id: uuid(),
            name: '',
            durationSeconds: DEFAULT_EXERCISE_DURATION,
          },
        ],
      };
    case 'ADD_REST':
      return {
        ...state,
        segments: [
          ...state.segments,
          {
            type: 'rest' as const,
            id: uuid(),
            durationSeconds: DEFAULT_REST_DURATION,
          },
        ],
      };
    case 'DELETE_SEGMENT': {
      if (exerciseCount(state.segments) <= MIN_EXERCISES) return state;
      const deleted = state.segments[action.index];
      const nextIdx = action.index + 1;
      if (
        deleted?.type === 'exercise' &&
        nextIdx < state.segments.length &&
        state.segments[nextIdx]?.type === 'rest'
      ) {
        return {
          ...state,
          segments: state.segments.filter(
            (_, i) => i !== action.index && i !== nextIdx,
          ),
        };
      }
      return {
        ...state,
        segments: state.segments.filter((_, i) => i !== action.index),
      };
    }
    case 'MOVE_UP': {
      if (action.index <= 0) return state;
      const segments = [...state.segments];
      [segments[action.index - 1], segments[action.index]] = [
        segments[action.index]!,
        segments[action.index - 1]!,
      ];
      return { ...state, segments };
    }
    case 'MOVE_DOWN': {
      if (action.index >= state.segments.length - 1) return state;
      const segments = [...state.segments];
      [segments[action.index], segments[action.index + 1]] = [
        segments[action.index + 1]!,
        segments[action.index]!,
      ];
      return { ...state, segments };
    }
    case 'IMPORT_TEMPLATE':
      return {
        ...state,
        name: action.name,
        segments: action.segments.map((s) => ({ ...s, id: uuid() })),
        rounds: String(action.rounds),
      };
    case 'ADD_EXERCISE_FROM_LIBRARY':
      return {
        ...state,
        segments: [...state.segments, action.exercise],
      };
  }
}

function initForm(workout?: WorkoutConfig): FormState {
  if (workout) {
    return {
      name: workout.name,
      segments: workout.segments.map((s) => ({ ...s })),
      rounds: String(workout.rounds),
    };
  }
  return {
    name: '',
    segments: [
      {
        type: 'exercise' as const,
        id: uuid(),
        name: '',
        durationSeconds: DEFAULT_EXERCISE_DURATION,
      },
    ],
    rounds: String(DEFAULT_ROUNDS),
  };
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
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [modalKey, setModalKey] = useState(0);
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
    form.segments.forEach((s, i) => {
      if (s.type === 'exercise' && !s.name.trim()) b.add(`ex-${i}`);
      if (String(s.durationSeconds).trim() === '') b.add(`dur-${i}`);
    });
    setBlanks(b);
  }, [form]);

  const handleSave = async () => {
    const rounds = parseMinOne(form.rounds);

    if (!form.name.trim() || rounds === null) {
      markAllBlank();
      return;
    }
    if (form.segments.some((s) => s.type === 'exercise' && !s.name.trim())) {
      markAllBlank();
      return;
    }

    const config = {
      id: existing?.id ?? uuid(),
      name: form.name.trim(),
      segments: form.segments.map((s) =>
        s.type === 'exercise' ? { ...s, name: s.name.trim() } : { ...s },
      ),
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

  const handleExerciseSelect = useCallback(
    (selection: ExerciseSearchSelection) => {
      dispatch({
        type: 'ADD_EXERCISE_FROM_LIBRARY',
        exercise: {
          type: 'exercise',
          id: uuid(),
          exerciseId: selection.exerciseId,
          name: selection.name,
          durationSeconds: DEFAULT_EXERCISE_DURATION,
          bodyParts: selection.bodyParts,
          targetMuscles: selection.targetMuscles,
          equipments: selection.equipments,
          imageUrl: selection.imageUrl,
        },
      });
    },
    [],
  );

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
  const exErrors = form.segments.map((_, i) => blanks.has(`ex-${i}`));
  const hasAnyError =
    roundsError ||
    nameError ||
    form.segments.some((s) => s.type === 'exercise' && !s.name.trim()) ||
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
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/')}
          aria-label={t('navigation.goBack')}
        >
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <h2 className="truncate text-xl font-bold">
          {existing
            ? t('screens.workoutEdit.titleEdit')
            : t('screens.workoutEdit.titleNew')}
        </h2>
      </header>

      <div className="scrollbar-hide flex flex-1 flex-col gap-5 overflow-y-auto pb-4">
        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">{t('labels.name')}</span>
          <Input
            type="text"
            value={form.name}
            onChange={(e) => {
              dispatch({ type: 'SET_NAME', name: e.target.value });
              checkBlank('name', e.target.value);
            }}
            onBlur={(e) => checkBlank('name', e.target.value)}
            placeholder={t('screens.workoutEdit.namePlaceholder')}
            aria-invalid={nameError || undefined}
          />
          {nameError && (
            <span className="text-xs text-red-400">
              {t('validation.nameRequired')}
            </span>
          )}
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-text-muted text-sm">{t('labels.rounds')}</span>
          <Input
            type="text"
            inputMode="numeric"
            value={form.rounds}
            onChange={(e) => {
              dispatch({ type: 'SET_ROUNDS', rounds: e.target.value });
              checkBlank('rounds', e.target.value);
            }}
            onBlur={(e) => checkBlank('rounds', e.target.value)}
            className="text-center"
            aria-invalid={roundsError || undefined}
          />
          {roundsError && (
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
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => setShowImportModal(true)}
                >
                  {t('screens.workoutEdit.importTemplate')}
                </Button>
              )}
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setModalKey((k) => k + 1);
                  setShowExerciseModal(true);
                }}
              >
                {t('screens.workoutEdit.browseLibrary')}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => dispatch({ type: 'ADD_EXERCISE' })}
              >
                {t('screens.workoutEdit.addExercise')}
              </Button>
              <Button
                variant="ghost"
                size="xs"
                onClick={() => dispatch({ type: 'ADD_REST' })}
              >
                {t('screens.workoutEdit.addRest')}
              </Button>
            </div>
          </div>
          {form.segments.map((seg, i) => (
            <ExerciseFormRow
              key={seg.id}
              segment={seg}
              error={exErrors[i] ?? false}
              onChange={(updated) => {
                dispatch({
                  type: 'SET_SEGMENT',
                  index: i,
                  segment: updated,
                });
                if (updated.type === 'exercise') {
                  checkBlank(`ex-${i}`, updated.name);
                }
              }}
              onBlur={() => {
                if (seg.type === 'exercise') {
                  checkBlank(`ex-${i}`, seg.name ?? '');
                }
              }}
              onDelete={() => dispatch({ type: 'DELETE_SEGMENT', index: i })}
              canDelete={
                exerciseCount(form.segments) > MIN_EXERCISES ||
                form.segments.length > MIN_SEGMENTS
              }
              onMoveUp={() => dispatch({ type: 'MOVE_UP', index: i })}
              onMoveDown={() => dispatch({ type: 'MOVE_DOWN', index: i })}
              canMoveUp={i > 0}
              canMoveDown={i < form.segments.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 py-4">
        {existing && (
          <Button
            variant="destructive"
            onClick={handleDelete}
            className="px-4 py-4 font-semibold"
          >
            {t('actions.delete')}
          </Button>
        )}
        <Button
          onClick={handleSave}
          disabled={hasAnyError}
          className="flex-1 py-4 text-lg font-bold"
        >
          {t('actions.save')}
        </Button>
      </div>

      <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {t('screens.workoutEdit.deleteConfirmTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('screens.workoutEdit.deleteConfirmMessage', {
                name: form.name || 'this workout',
              })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteConfirm(false)}
            >
              {t('actions.cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('actions.delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showImportModal} onOpenChange={setShowImportModal}>
        <DialogContent className="max-h-[70vh]">
          <DialogHeader>
            <DialogTitle>
              {t('screens.workoutEdit.importModalTitle')}
            </DialogTitle>
            <DialogDescription>
              {t('screens.workoutEdit.importModalDescription')}
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-2 overflow-y-auto">
            {defaultWorkouts.map((dw) => (
              <Button
                key={dw.id}
                variant="ghost"
                onClick={() => {
                  dispatch({
                    type: 'IMPORT_TEMPLATE',
                    name: dw.name,
                    segments: dw.segments,
                    rounds: dw.rounds,
                  });
                  setShowImportModal(false);
                }}
                className="flex h-auto items-center justify-between p-3 text-left"
              >
                <div>
                  <p className="text-sm font-medium">{dw.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {t('labels.exercises', {
                      count: exerciseCount(dw.segments),
                    })}{' '}
                    &middot; {t('labels.rounds', { count: dw.rounds })}
                  </p>
                </div>
                <span className="text-primary text-xs font-medium">
                  {t('actions.import')}
                </span>
              </Button>
            ))}
          </div>
          <Button variant="outline" onClick={() => setShowImportModal(false)}>
            {t('actions.cancel')}
          </Button>
        </DialogContent>
      </Dialog>

      <ExerciseSearchModal
        key={modalKey}
        open={showExerciseModal}
        onOpenChange={setShowExerciseModal}
        onSelect={handleExerciseSelect}
      />
    </Layout>
  );
}
