/**
 * useVoiceInput — Web Speech API hook for voice commands
 * Supports Telugu (te-IN), Hindi (hi-IN), and English (en-IN)
 */
import { useState, useCallback, useRef, useEffect } from 'react';

const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export function useVoiceInput({ lang = 'en-IN', continuous = false, onResult, onError } = {}) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [supported, setSupported] = useState(false);
  const recognizerRef = useRef(null);

  useEffect(() => {
    setSupported(!!SpeechRecognition);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      onError?.('Speech recognition not supported in this browser.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const result = Array.from(event.results)
        .map(r => r[0].transcript)
        .join('');
      setTranscript(result);
      if (event.results[0]?.isFinal) {
        onResult?.(result);
      }
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      onError?.(event.error);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognizerRef.current = recognition;
    recognition.start();
    setIsListening(true);
    setTranscript('');
  }, [lang, continuous, onResult, onError]);

  const stopListening = useCallback(() => {
    recognizerRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) stopListening();
    else startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, transcript, supported, startListening, stopListening, toggleListening };
}

export default useVoiceInput;
