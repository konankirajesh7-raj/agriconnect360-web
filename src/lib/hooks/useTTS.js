/**
 * useTTS — Text-to-Speech hook using Web Speech Synthesis
 * Supports Telugu, Hindi, and English
 */
import { useState, useCallback, useRef, useEffect } from 'react';

const LANG_MAP = { en: 'en-IN', te: 'te-IN', hi: 'hi-IN' };

export function useTTS({ lang = 'en', rate = 0.9, pitch = 1 } = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(false);
  const utteranceRef = useRef(null);

  useEffect(() => {
    setSupported(typeof window !== 'undefined' && 'speechSynthesis' in window);
  }, []);

  const speak = useCallback((text) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = LANG_MAP[lang] || lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [lang, rate, pitch]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  const toggleSpeak = useCallback((text) => {
    if (isSpeaking) stop();
    else speak(text);
  }, [isSpeaking, speak, stop]);

  return { isSpeaking, supported, speak, stop, toggleSpeak };
}

export default useTTS;
