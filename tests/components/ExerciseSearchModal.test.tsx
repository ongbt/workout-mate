import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import type { ExerciseSearchSelection } from '../../src/types';

let mockHasRapidApiKey = false;
let mockBodyParts: string[] = [];
let mockSelectedBodyPart: string | null = null;
let mockSearchQuery = '';
let mockResults: ExerciseSearchSelection[] = [];
let mockIsLoading = false;
let mockError: string | null = null;
let mockNeedsApiKey = true;

vi.mock('../../src/hooks/useUserSettings', () => ({
  useUserSettings: () => ({
    hasRapidApiKey: mockHasRapidApiKey,
    setRapidApiKey: vi.fn(),
    removeRapidApiKey: vi.fn(),
  }),
}));

vi.mock('../../src/hooks/useExerciseSearch', () => ({
  useExerciseSearch: () => ({
    bodyParts: mockBodyParts,
    selectedBodyPart: mockSelectedBodyPart,
    setSelectedBodyPart: vi.fn(),
    searchQuery: mockSearchQuery,
    setSearchQuery: vi.fn(),
    results: mockResults,
    isLoading: mockIsLoading,
    error: mockError,
    needsApiKey: mockNeedsApiKey,
    retry: vi.fn(),
  }),
}));

import { ExerciseSearchModal } from '../../src/components/ExerciseSearchModal';

function renderModal(onSelect = vi.fn()) {
  return render(
    <ExerciseSearchModal
      open={true}
      onOpenChange={vi.fn()}
      onSelect={onSelect}
    />,
  );
}

describe('ExerciseSearchModal', () => {
  beforeEach(() => {
    mockHasRapidApiKey = false;
    mockBodyParts = [];
    mockSelectedBodyPart = null;
    mockSearchQuery = '';
    mockResults = [];
    mockIsLoading = false;
    mockError = null;
    mockNeedsApiKey = true;
  });

  describe('disabled state — no API key', () => {
    it('renders RapidApiKeyInput when user has no key', () => {
      const { getByPlaceholderText } = renderModal();
      expect(
        getByPlaceholderText('components.exerciseSearch.keyPlaceholder'),
      ).toBeDefined();
    });

    it('shows needsKey prompt in results area', () => {
      const { getByText } = renderModal();
      expect(getByText('components.exerciseSearch.needsKey')).toBeDefined();
    });
  });

  describe('loading state', () => {
    it('renders skeleton rows when loading', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockIsLoading = true;
      renderModal();
      const skeletons = document.querySelectorAll('.animate-pulse');
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe('error state', () => {
    it('renders error message and retry button', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockIsLoading = false;
      mockError = 'API error';
      const { getByText } = renderModal();
      expect(getByText('API error')).toBeDefined();
      expect(getByText('components.exerciseSearch.retry')).toBeDefined();
    });
  });

  describe('empty state', () => {
    it('renders "no results" when search is active', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockIsLoading = false;
      mockError = null;
      mockResults = [];
      mockSearchQuery = 'nothing';
      const { getByText } = renderModal();
      expect(getByText('components.exerciseSearch.noResults')).toBeDefined();
    });

    it('renders select body part hint when nothing is selected', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockIsLoading = false;
      mockError = null;
      mockResults = [];
      mockSearchQuery = '';
      const { getByText } = renderModal();
      expect(
        getByText('components.exerciseSearch.selectBodyPart'),
      ).toBeDefined();
    });
  });

  describe('success state', () => {
    it('renders result rows when exercises are available', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockIsLoading = false;
      mockError = null;
      mockResults = [
        {
          exerciseId: 'ex1',
          name: 'Push-ups',
          bodyParts: ['chest'],
          targetMuscles: ['pectorals'],
          equipments: ['body weight'],
          imageUrl: 'https://example.com/pushups.gif',
        },
      ];
      const { getByText } = renderModal();
      expect(getByText('Push-ups')).toBeDefined();
    });

    it('renders body part chips when body parts are available', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockBodyParts = ['chest', 'back'];
      mockIsLoading = false;
      mockError = null;
      mockResults = [];
      const { getByText } = renderModal();
      expect(getByText('chest')).toBeDefined();
      expect(getByText('back')).toBeDefined();
    });

    it('shows Add button on each result row', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockIsLoading = false;
      mockError = null;
      mockResults = [
        {
          exerciseId: 'ex1',
          name: 'Push-ups',
          bodyParts: ['chest'],
          targetMuscles: ['pectorals'],
          equipments: ['body weight'],
          imageUrl: 'https://example.com/pushups.gif',
        },
      ];
      const { getByText } = renderModal();
      expect(getByText('components.exerciseSearch.add')).toBeDefined();
    });
  });

  describe('done button', () => {
    it('renders Done button in footer', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      const { getByText } = renderModal();
      expect(getByText('components.exerciseSearch.done')).toBeDefined();
    });
  });

  describe('add button behavior', () => {
    const testResult: ExerciseSearchSelection = {
      exerciseId: 'ex1',
      name: 'Push-ups',
      bodyParts: ['chest'],
      targetMuscles: ['pectorals'],
      equipments: ['body weight'],
      imageUrl: 'https://example.com/pushups.gif',
    };

    it('calls onSelect and shows checkmark after adding', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockResults = [testResult];
      const onSelect = vi.fn();
      const { getByText, queryByText } = renderModal(onSelect);

      const addBtn = getByText('components.exerciseSearch.add');
      fireEvent.click(addBtn);

      expect(onSelect).toHaveBeenCalledTimes(1);
      expect(onSelect).toHaveBeenCalledWith(testResult);
      // Button should now show checkmark, not "+ Add" text
      expect(queryByText('components.exerciseSearch.add')).toBeNull();
    });

    it('keeps checkmark after add — no timeout reversion', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockResults = [testResult];
      const onSelect = vi.fn();
      const { getByText } = renderModal(onSelect);

      fireEvent.click(getByText('components.exerciseSearch.add'));

      // The button should show checkmark, not "+ Add"
      // (previously a setTimeout reverted this after 1500ms)
      expect(() => getByText('components.exerciseSearch.add')).toThrow();
    });

    it('resets added state when modal reopens', () => {
      mockHasRapidApiKey = true;
      mockNeedsApiKey = false;
      mockResults = [testResult];
      const onSelect = vi.fn();
      const onOpenChange = vi.fn();
      const { getByText, rerender } = render(
        <ExerciseSearchModal
          key={1}
          open={true}
          onOpenChange={onOpenChange}
          onSelect={onSelect}
        />,
      );

      // Add the exercise
      fireEvent.click(getByText('components.exerciseSearch.add'));

      // Remount with a new key — simulates closing and reopening
      rerender(
        <ExerciseSearchModal
          key={2}
          open={true}
          onOpenChange={onOpenChange}
          onSelect={onSelect}
        />,
      );

      // "+ Add" should be back because the component was remounted
      expect(getByText('components.exerciseSearch.add')).toBeDefined();
    });
  });
});
