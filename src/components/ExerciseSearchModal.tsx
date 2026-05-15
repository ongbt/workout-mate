import { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Search, Plus, Check, Lock } from 'lucide-react';
import { useExerciseSearch } from '../hooks/useExerciseSearch';
import { useUserSettings } from '../hooks/useUserSettings';
import { RapidApiKeyInput } from './RapidApiKeyInput';
import { Input } from './ui/input';
import { Button } from './ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { cn } from '../lib/utils';
import type { ExerciseSearchSelection } from '../types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (selection: ExerciseSearchSelection) => void;
}

const SKELETON_COUNT = 5;

function SkeletonRow() {
  return (
    <div className="flex animate-pulse items-center gap-3 rounded-xl p-3">
      <div className="h-14 w-14 shrink-0 rounded-xl bg-white/5" />
      <div className="flex-1 space-y-2">
        <div className="h-4 w-3/4 rounded bg-white/5" />
        <div className="h-3 w-1/2 rounded bg-white/5" />
      </div>
      <div className="h-8 w-16 rounded-lg bg-white/5" />
    </div>
  );
}

export function ExerciseSearchModal({ open, onOpenChange, onSelect }: Props) {
  const { t } = useTranslation();
  const { hasRapidApiKey } = useUserSettings();
  const {
    bodyParts,
    selectedBodyPart,
    setSelectedBodyPart,
    searchQuery,
    setSearchQuery,
    results,
    isLoading,
    error,
    needsApiKey,
    retry,
  } = useExerciseSearch();

  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  const handleSelect = useCallback(
    (result: ExerciseSearchSelection) => {
      setAddedIds((prev) => {
        const next = new Set(prev);
        next.add(result.exerciseId);
        return next;
      });
      onSelect(result);
    },
    [onSelect],
  );

  const displayBodyParts = bodyParts.length > 0 ? bodyParts : [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="flex max-h-[calc(100dvh-2rem)] flex-col overflow-hidden sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle>{t('components.exerciseSearch.title')}</DialogTitle>
          <DialogDescription>
            {t('components.exerciseSearch.description')}
          </DialogDescription>
        </DialogHeader>

        {!hasRapidApiKey && (
          <div className="py-2">
            <RapidApiKeyInput />
          </div>
        )}

        {displayBodyParts.length > 0 && (
          <div className="flex shrink-0 gap-1.5 overflow-x-auto pb-1">
            <button
              type="button"
              onClick={() => setSelectedBodyPart(null)}
              className={cn(
                'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                selectedBodyPart === null
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-surface/60 text-text-muted hover:bg-surface',
              )}
            >
              All
            </button>
            {displayBodyParts.map((part) => (
              <button
                key={part}
                type="button"
                onClick={() => setSelectedBodyPart(part)}
                className={cn(
                  'shrink-0 rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors',
                  selectedBodyPart === part
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-surface/60 text-text-muted hover:bg-surface',
                )}
              >
                {part}
              </button>
            ))}
          </div>
        )}

        {hasRapidApiKey && (
          <div className="relative shrink-0">
            <Search className="text-text-muted absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2" />
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('components.exerciseSearch.searchPlaceholder')}
              className="pl-9"
              disabled={!hasRapidApiKey}
            />
          </div>
        )}

        <div className="scrollbar-hide -mx-1 min-h-0 flex-1 space-y-1 overflow-y-auto px-1 pb-2">
          {isLoading && (
            <div className="space-y-1">
              {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {!isLoading && error && (
            <div className="flex flex-col items-center gap-3 py-8">
              <p className="text-text-muted text-center text-sm">{error}</p>
              <Button variant="outline" size="sm" onClick={retry}>
                {t('components.exerciseSearch.retry')}
              </Button>
            </div>
          )}

          {!isLoading && !error && results.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-8">
              <p className="text-text-muted text-center text-sm">
                {needsApiKey
                  ? t('components.exerciseSearch.needsKey')
                  : selectedBodyPart || searchQuery.trim()
                    ? t('components.exerciseSearch.noResults')
                    : t('components.exerciseSearch.selectBodyPart')}
              </p>
            </div>
          )}

          {!isLoading && !error && results.length > 0 && (
            <div className="space-y-1">
              {results.map((result) => {
                const isAdded = addedIds.has(result.exerciseId);
                return (
                  <div
                    key={result.exerciseId}
                    className="hover:bg-surface/40 flex items-center gap-3 rounded-xl p-2 transition-colors"
                  >
                    <img
                      src={result.imageUrl}
                      alt={result.name}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                      loading="lazy"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">
                        {result.name}
                      </p>
                      <p className="text-text-muted truncate text-xs capitalize">
                        {[result.bodyParts?.[0], result.targetMuscles?.[0]]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                    </div>
                    <Button
                      size="xs"
                      variant={isAdded ? 'default' : 'outline'}
                      onClick={() => handleSelect(result)}
                      disabled={isAdded}
                      className="shrink-0"
                    >
                      {isAdded ? (
                        <Check className="h-3.5 w-3.5" />
                      ) : hasRapidApiKey ? (
                        <>
                          <Plus className="mr-1 h-3.5 w-3.5" />
                          {t('components.exerciseSearch.add')}
                        </>
                      ) : (
                        <Lock className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="w-full"
          >
            {t('components.exerciseSearch.done')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
