import { useState, useEffect, useCallback, useRef } from 'react';
import { useAction } from 'convex/react';
import { api } from '../../convex/_generated/api';
import { useUserSettings } from './useUserSettings';
import type { ExerciseSearchResult } from '../types';

const DEBOUNCE_MS = 300;

interface UseExerciseSearchReturn {
  bodyParts: string[];
  selectedBodyPart: string | null;
  setSelectedBodyPart: (part: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  results: ExerciseSearchResult[];
  isLoading: boolean;
  error: string | null;
  needsApiKey: boolean;
  retry: () => void;
}

export function useExerciseSearch(): UseExerciseSearchReturn {
  const { hasRapidApiKey } = useUserSettings();
  const listBodyParts = useAction(api.exerciseDb.listBodyParts);
  const listByBodyPart = useAction(api.exerciseDb.listByBodyPart);
  const searchByName = useAction(api.exerciseDb.searchByName);

  const [bodyParts, setBodyParts] = useState<string[]>([]);
  const [selectedBodyPart, setSelectedBodyPart] = useState<string | null>(null);
  const [searchQuery, setSearchQueryRaw] = useState('');
  const [results, setResults] = useState<ExerciseSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastActionRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const mountedRef = useRef(true);

  useEffect(() => {
    if (!hasRapidApiKey) return;
    let cancelled = false;
    void (async () => {
      try {
        const parts = await listBodyParts();
        if (!cancelled) setBodyParts(parts as string[]);
      } catch {
        // Body parts fetch failure is non-critical
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hasRapidApiKey, listBodyParts]);

  useEffect(() => {
    return () => {
      mountedRef.current = false;
    };
  }, []);

  const doFetch = useCallback(async () => {
    if (!hasRapidApiKey) {
      setResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let exercises: ExerciseSearchResult[];

      if (searchQuery.trim() && !selectedBodyPart) {
        exercises = (await searchByName({
          name: searchQuery.trim(),
        })) as ExerciseSearchResult[];
      } else if (selectedBodyPart) {
        exercises = (await listByBodyPart({
          bodyPart: selectedBodyPart,
        })) as ExerciseSearchResult[];
      } else {
        setResults([]);
        setIsLoading(false);
        return;
      }

      if (searchQuery.trim() && selectedBodyPart) {
        const query = searchQuery.trim().toLowerCase();
        exercises = exercises.filter(
          (ex) =>
            ex.name.toLowerCase().includes(query) ||
            ex.targetMuscles.some((m) => m.toLowerCase().includes(query)) ||
            ex.equipments.some((e) => e.toLowerCase().includes(query)),
        );
      }

      setResults(exercises);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unable to load exercises');
    } finally {
      setIsLoading(false);
    }
  }, [
    hasRapidApiKey,
    searchQuery,
    selectedBodyPart,
    searchByName,
    listByBodyPart,
  ]);

  useEffect(() => {
    lastActionRef.current = doFetch;
  }, [doFetch]);

  const setSearchQuery = useCallback(
    (query: string) => {
      setSearchQueryRaw(query);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        doFetch();
      }, DEBOUNCE_MS);
    },
    [doFetch],
  );

  useEffect(() => {
    if (hasRapidApiKey && selectedBodyPart !== null) {
      queueMicrotask(() => void doFetch());
    }
  }, [selectedBodyPart, hasRapidApiKey, doFetch]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const retry = useCallback(() => {
    lastActionRef.current();
  }, []);

  return {
    bodyParts,
    selectedBodyPart,
    setSelectedBodyPart,
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    error,
    needsApiKey: !hasRapidApiKey,
    retry,
  };
}
