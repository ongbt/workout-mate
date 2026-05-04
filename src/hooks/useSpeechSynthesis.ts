import { useCallback, useRef, useState } from 'react';

interface UseSpeechSynthesisReturn {
  speak: (text: string, onEnd?: () => void) => void;
  cancel: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useSpeechSynthesis(): UseSpeechSynthesisReturn {
  const [isSupported] = useState(
    () => typeof window !== 'undefined' && 'speechSynthesis' in window,
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const voiceRef = useRef<SpeechSynthesisVoice | null>(null);

  const ensureVoices = useCallback(() => {
    if (!isSupported || voiceRef.current) return;
    const voices = speechSynthesis.getVoices();
    voiceRef.current =
      voices.find((v) => v.lang.startsWith('en')) ?? voices[0] ?? null;
  }, [isSupported]);

  const speak = useCallback(
    (text: string, onEnd?: () => void) => {
      if (!isSupported) {
        onEnd?.();
        return;
      }
      speechSynthesis.cancel();
      ensureVoices();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 1;
      if (voiceRef.current) utterance.voice = voiceRef.current;
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      utterance.onerror = () => {
        setIsSpeaking(false);
        onEnd?.();
      };
      speechSynthesis.speak(utterance);
    },
    [isSupported, ensureVoices],
  );

  const cancel = useCallback(() => {
    if (isSupported) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, [isSupported]);

  return { speak, cancel, isSpeaking, isSupported };
}
