/**
 * Mobile Hooks — Phase 10B/10C/10D
 * Pull-to-refresh, haptic feedback, voice input, camera, geolocation, share
 */
import { useState, useEffect, useCallback, useRef } from 'react';

// ── Pull to Refresh ─────────────────────────────────────────────────
export function usePullToRefresh(onRefresh) {
  const [isPulling, setIsPulling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const startY = useRef(0);

  useEffect(() => {
    const handleTouchStart = (e) => {
      if (window.scrollY === 0) {
        startY.current = e.touches[0].clientY;
      }
    };

    const handleTouchMove = (e) => {
      if (startY.current === 0) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 60 && window.scrollY === 0) {
        setIsPulling(true);
      }
    };

    const handleTouchEnd = async () => {
      if (isPulling && !isRefreshing) {
        setIsRefreshing(true);
        triggerHaptic();
        try {
          await onRefresh?.();
        } catch (e) { console.error(e); }
        setIsRefreshing(false);
      }
      setIsPulling(false);
      startY.current = 0;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: true });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isPulling, isRefreshing, onRefresh]);

  return { isPulling, isRefreshing };
}

// ── Haptic Feedback (Vibration API) ─────────────────────────────────
export function triggerHaptic(pattern = [10]) {
  if ('vibrate' in navigator) {
    navigator.vibrate(pattern);
  }
}

export function useHaptic() {
  const light = useCallback(() => triggerHaptic([10]), []);
  const medium = useCallback(() => triggerHaptic([20]), []);
  const heavy = useCallback(() => triggerHaptic([30, 10, 30]), []);
  const success = useCallback(() => triggerHaptic([10, 50, 10]), []);
  const error = useCallback(() => triggerHaptic([50, 20, 50, 20, 50]), []);
  return { light, medium, heavy, success, error };
}

// ── Voice Input (Web Speech API) — Phase 10C ─────────────────────────
export function useVoiceInput(options = {}) {
  const { lang = 'te-IN', continuous = false, onResult } = options;
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState(null);
  const recognitionRef = useRef(null);

  const startListening = useCallback(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang;
    recognition.continuous = continuous;
    recognition.interimResults = true;

    recognition.onstart = () => {
      setIsListening(true);
      setError(null);
      triggerHaptic();
    };

    recognition.onresult = (event) => {
      let finalText = '';
      let interimText = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalText += event.results[i][0].transcript;
        } else {
          interimText += event.results[i][0].transcript;
        }
      }
      const text = finalText || interimText;
      setTranscript(text);
      if (finalText) onResult?.(finalText);
    };

    recognition.onerror = (event) => {
      setError(event.error === 'no-speech' ? 'No speech detected. Try again.' :
               event.error === 'not-allowed' ? 'Microphone access denied.' :
               `Error: ${event.error}`);
      setIsListening(false);
    };

    recognition.onend = () => setIsListening(false);

    recognitionRef.current = recognition;
    recognition.start();
  }, [lang, continuous, onResult]);

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
  }, []);

  const toggleListening = useCallback(() => {
    isListening ? stopListening() : startListening();
  }, [isListening, startListening, stopListening]);

  return { isListening, transcript, error, startListening, stopListening, toggleListening };
}

// ── Text-to-Speech (Phase 10C) ──────────────────────────────────────
export function useTextToSpeech() {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text, lang = 'te-IN') => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = 0.9;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  return { isSpeaking, speak, stop };
}

// ── Camera Access (Phase 10D) ───────────────────────────────────────
export function useCamera() {
  const [photo, setPhoto] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const openCamera = useCallback(async (facingMode = 'environment') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode, width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setError(null);
    } catch (err) {
      setError(err.name === 'NotAllowedError' ? 'Camera access denied' : err.message);
    }
  }, []);

  const takePhoto = useCallback(() => {
    if (!videoRef.current) return null;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    setPhoto(dataUrl);
    triggerHaptic([20]);
    return dataUrl;
  }, []);

  const closeCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach(t => t.stop());
    streamRef.current = null;
  }, []);

  return { photo, error, videoRef, openCamera, takePhoto, closeCamera };
}

// ── Geolocation (Phase 10D) ─────────────────────────────────────────
export function useGeolocation() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({ lat: pos.coords.latitude, lon: pos.coords.longitude, accuracy: pos.coords.accuracy });
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err.code === 1 ? 'Location access denied' : err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);

  return { location, loading, error, getLocation };
}

// ── Share via WhatsApp/SMS (Phase 10D) ──────────────────────────────
export function useShare() {
  const share = useCallback(async (data) => {
    // Try native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: data.title || 'AgriConnect 360',
          text: data.text,
          url: data.url || window.location.href,
        });
        return { success: true, method: 'native' };
      } catch (e) {
        if (e.name === 'AbortError') return { success: false, method: 'cancelled' };
      }
    }

    // Fallback: WhatsApp
    const waUrl = `https://wa.me/?text=${encodeURIComponent(data.text + (data.url ? '\n' + data.url : ''))}`;
    window.open(waUrl, '_blank');
    return { success: true, method: 'whatsapp' };
  }, []);

  const shareToWhatsApp = useCallback((text, phone = '') => {
    const url = phone
      ? `https://wa.me/${phone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }, []);

  const shareViaSMS = useCallback((text, phone = '') => {
    window.open(`sms:${phone}?body=${encodeURIComponent(text)}`);
  }, []);

  return { share, shareToWhatsApp, shareViaSMS };
}

// ── Swipe Detection ─────────────────────────────────────────────────
export function useSwipe(ref, { onSwipeLeft, onSwipeRight, threshold = 50 } = {}) {
  const touchStart = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const el = ref?.current;
    if (!el) return;

    const handleTouchStart = (e) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const handleTouchEnd = (e) => {
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > threshold) {
        if (dx > 0) onSwipeRight?.();
        else onSwipeLeft?.();
        triggerHaptic();
      }
    };

    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });
    return () => {
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, [ref, onSwipeLeft, onSwipeRight, threshold]);
}

export default {
  usePullToRefresh, triggerHaptic, useHaptic,
  useVoiceInput, useTextToSpeech,
  useCamera, useGeolocation, useShare, useSwipe,
};
