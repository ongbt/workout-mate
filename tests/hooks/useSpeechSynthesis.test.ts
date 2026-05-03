import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSpeechSynthesis } from '../../src/hooks/useSpeechSynthesis';

globalThis.SpeechSynthesisUtterance = class {
  text = '';
  rate = 1;
  volume = 1;
  voice: SpeechSynthesisVoice | null = null;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
} as unknown as typeof SpeechSynthesisUtterance;

function setSpeechSynthesis(synth: SpeechSynthesis | undefined) {
  if (synth === undefined) {
    const w = window as unknown as Record<string, unknown>;
    delete w['speechSynthesis'];
  } else {
    (window as unknown as Record<string, unknown>)['speechSynthesis'] = synth;
  }
}

function makeMockSynth() {
  return {
    speak: vi.fn<(_: SpeechSynthesisUtterance) => void>(),
    cancel: vi.fn<() => void>(),
    pause: vi.fn<() => void>(),
    resume: vi.fn<() => void>(),
    getVoices: vi.fn<() => SpeechSynthesisVoice[]>().mockReturnValue([]),
    onvoiceschanged: null as unknown as ((this: SpeechSynthesis, ev: Event) => unknown) | null,
    paused: false,
    pending: false,
    speaking: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn() as unknown as (event: Event) => boolean,
  } satisfies SpeechSynthesis;
}

describe('useSpeechSynthesis', () => {
  let mockSynth: ReturnType<typeof makeMockSynth>;

  beforeEach(() => {
    mockSynth = makeMockSynth();
    setSpeechSynthesis(mockSynth);
  });

  it('returns isSupported true when speechSynthesis exists', () => {
    const { result } = renderHook(() => useSpeechSynthesis());
    expect(result.current.isSupported).toBe(true);
  });

  it('returns isSupported false when speechSynthesis is missing', () => {
    setSpeechSynthesis(undefined);
    const { result } = renderHook(() => useSpeechSynthesis());
    expect(result.current.isSupported).toBe(false);
  });

  it('speak calls speechSynthesis.speak', () => {
    const { result } = renderHook(() => useSpeechSynthesis());
    act(() => {
      result.current.speak('Hello');
    });
    expect(mockSynth.speak).toHaveBeenCalledTimes(1);
  });

  it('speak cancels previous speech first', () => {
    const { result } = renderHook(() => useSpeechSynthesis());
    act(() => {
      result.current.speak('First');
      result.current.speak('Second');
    });
    expect(mockSynth.cancel).toHaveBeenCalled();
  });

  it('speak calls onEnd when not supported', () => {
    setSpeechSynthesis(undefined);
    const onEnd = vi.fn();
    const { result } = renderHook(() => useSpeechSynthesis());
    act(() => {
      result.current.speak('Hello', onEnd);
    });
    expect(onEnd).toHaveBeenCalled();
  });

  it('cancel calls speechSynthesis.cancel', () => {
    const { result } = renderHook(() => useSpeechSynthesis());
    act(() => {
      result.current.cancel();
    });
    expect(mockSynth.cancel).toHaveBeenCalled();
  });

  it('cancel sets isSpeaking false', () => {
    const { result } = renderHook(() => useSpeechSynthesis());
    act(() => {
      result.current.cancel();
    });
    expect(result.current.isSpeaking).toBe(false);
  });
});
