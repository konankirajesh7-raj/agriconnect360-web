import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { parseVoiceCommand, getResponse, getSpeechLang, PAGE_LABELS, readPageData, fillFormField, submitCurrentForm } from '../lib/voiceCommands';
import { getCropPrice, getWeatherSummary, getAIVoiceResponse, buildPriceResponse, buildWeatherResponse } from '../lib/voiceDataService';

const SpeechRecognition = typeof window !== 'undefined' && (window.SpeechRecognition || window.webkitSpeechRecognition);

export default function VoiceAgent() {
  const [isListening, setIsListening] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [status, setStatus] = useState('idle'); // idle | listening | processing | speaking | error
  const [history, setHistory] = useState([]);
  const [pulseAnim, setPulseAnim] = useState(false);
  const [waveAmplitude, setWaveAmplitude] = useState(0);

  const recognitionRef = useRef(null);
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);
  const navigate = useNavigate();
  const location = useLocation();
  const { lang, setLang } = useLanguage();

  // Initialize speech recognition
  useEffect(() => {
    if (!SpeechRecognition) return;
    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = true;
    rec.maxAlternatives = 3;
    rec.lang = getSpeechLang(lang);

    rec.onresult = (e) => {
      let interim = '';
      let final = '';
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += t;
        else interim += t;
      }
      setTranscript(final || interim);
      if (final) handleCommand(final);
    };

    rec.onerror = (e) => {
      if (e.error === 'no-speech' || e.error === 'aborted') {
        setStatus('idle');
        setIsListening(false);
        return;
      }
      setStatus('error');
      addHistory('system', `⚠️ ${e.error === 'not-allowed' ? 'Microphone access denied. Please allow microphone.' : e.error}`);
      setIsListening(false);
    };

    rec.onend = () => {
      setIsListening(false);
      setStatus(s => s === 'processing' || s === 'speaking' ? s : 'idle');
      setWaveAmplitude(0);
    };

    rec.onaudiostart = () => setWaveAmplitude(0.5);
    rec.onsoundstart = () => setWaveAmplitude(1);
    rec.onsoundend = () => setWaveAmplitude(0.2);

    recognitionRef.current = rec;
    return () => { try { rec.abort(); } catch {} };
  }, [lang]);

  // Update recognition language when app language changes
  useEffect(() => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = getSpeechLang(lang);
    }
  }, [lang]);

  const addHistory = useCallback((type, text) => {
    setHistory(h => [...h.slice(-19), { type, text, time: Date.now() }]);
  }, []);

  const speak = useCallback((text, onEnd) => {
    if (!synthRef.current || !text) { onEnd?.(); return; }
    synthRef.current.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.lang = getSpeechLang(lang);
    utter.rate = 0.95;
    utter.pitch = 1.05;
    // Try to find a voice matching the language
    const voices = synthRef.current.getVoices();
    const langCode = getSpeechLang(lang);
    const match = voices.find(v => v.lang.startsWith(langCode.split('-')[0]));
    if (match) utter.voice = match;
    utter.onend = () => { setStatus('idle'); onEnd?.(); };
    setStatus('speaking');
    synthRef.current.speak(utter);
  }, [lang]);

  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      addHistory('system', '⚠️ Speech recognition not supported in this browser.');
      return;
    }
    try {
      synthRef.current?.cancel();
      recognitionRef.current.lang = getSpeechLang(lang);
      recognitionRef.current.start();
      setIsListening(true);
      setStatus('listening');
      setTranscript('');
      setPulseAnim(true);
      if (!isPanelOpen) {
        speak(getResponse('listening', lang));
      }
    } catch (e) {
      if (e.message?.includes('already started')) return;
      setStatus('error');
    }
  }, [lang, isPanelOpen, speak, addHistory]);

  const stopListening = useCallback(() => {
    try { recognitionRef.current?.stop(); } catch {}
    setIsListening(false);
    setStatus('idle');
    setPulseAnim(false);
    setWaveAmplitude(0);
  }, []);

  const handleCommand = useCallback((text) => {
    setStatus('processing');
    addHistory('user', text);

    const intent = parseVoiceCommand(text, lang);
    if (!intent) {
      // Smart fallback: check if asking about a crop price
      const priceMatch = text.match(/(?:price|rate|cost|how much|bhav|dhar|ధర|कीमत|भाव)\s*(?:of|for|is)?\s*(.+)/i) || text.match(/(.+?)\s*(?:price|rate|ధర|कीमत|भाव)/i);
      if (priceMatch) {
        const crop = priceMatch[1].trim();
        addHistory('assistant', `💰 Looking up ${crop}...`);
        getCropPrice(crop).then(data => {
          const msg = buildPriceResponse(data, lang);
          addHistory('assistant', `💰 ${msg}`);
          speak(msg);
        });
        return;
      }
      // Try AI fallback for general questions
      addHistory('assistant', '🤖 Thinking...');
      getAIVoiceResponse(text, `User is on page: ${location.pathname}`).then(aiReply => {
        if (aiReply) {
          addHistory('assistant', `🤖 ${aiReply}`);
          speak(aiReply);
        } else {
          const msg = getResponse('didntUnderstand', lang);
          addHistory('assistant', msg);
          speak(msg);
        }
      });
      return;
    }

    switch (intent.type) {
      case 'navigate': {
        const pageLabel = intent.label || intent.path;
        const prefix = lang === 'te' ? pageLabel + ' ' + getResponse('navigating', lang) :
                       lang === 'hi' ? pageLabel + ' ' + getResponse('navigating', lang) :
                       getResponse('navigating', lang) + ' ' + pageLabel;
        addHistory('assistant', `🧭 ${prefix}`);
        speak(prefix, () => navigate(intent.path));
        break;
      }
      case 'action': {
        switch (intent.action) {
          case 'scroll_down': {
            const msg = getResponse('scrollingDown', lang);
            addHistory('assistant', `⬇️ ${msg}`);
            window.scrollBy({ top: 400, behavior: 'smooth' });
            speak(msg);
            break;
          }
          case 'scroll_up': {
            const msg = getResponse('scrollingUp', lang);
            addHistory('assistant', `⬆️ ${msg}`);
            window.scrollBy({ top: -400, behavior: 'smooth' });
            speak(msg);
            break;
          }
          case 'go_back': {
            const msg = getResponse('goingBack', lang);
            addHistory('assistant', `↩️ ${msg}`);
            speak(msg, () => window.history.back());
            break;
          }
          case 'refresh': {
            const msg = getResponse('refreshing', lang);
            addHistory('assistant', `🔄 ${msg}`);
            speak(msg, () => window.location.reload());
            break;
          }
          case 'stop_listening': {
            const msg = getResponse('stopped', lang);
            addHistory('assistant', `🔇 ${msg}`);
            speak(msg);
            stopListening();
            setIsPanelOpen(false);
            break;
          }
          case 'read_page': {
            const pageName = PAGE_LABELS[location.pathname]?.[lang] || location.pathname;
            const pageContent = document.querySelector('main')?.innerText?.slice(0, 300) || '';
            const msg = lang === 'en' ? `You are on ${pageName}. ${pageContent.slice(0, 150)}` :
                        lang === 'te' ? `మీరు ${pageName} లో ఉన్నారు.` :
                        `आप ${pageName} पर हैं।`;
            addHistory('assistant', `📖 ${msg}`);
            speak(msg);
            break;
          }
          case 'change_language': {
            setLang(intent.targetLang);
            const msg = getResponse('languageChanged', intent.targetLang);
            addHistory('assistant', `🌐 ${msg}`);
            speak(msg);
            break;
          }
          case 'logout': {
            addHistory('assistant', '🚪 Logging out...');
            speak(lang === 'te' ? 'లాగౌట్ చేస్తున్నాం' : lang === 'hi' ? 'लॉगआउट कर रहे हैं' : 'Logging out', () => {
              localStorage.clear();
              window.location.href = '/login';
            });
            break;
          }
          case 'search': {
            if (intent.query) {
              addHistory('assistant', `🔍 Searching: ${intent.query}`);
              // Trigger the app's search overlay
              document.dispatchEvent(new CustomEvent('voice-search', { detail: { query: intent.query } }));
              speak(lang === 'te' ? `${intent.query} కోసం వెతుకుతున్నాం` : lang === 'hi' ? `${intent.query} खोज रहे हैं` : `Searching for ${intent.query}`);
            }
            break;
          }
          case 'click_button': {
            if (intent.target) {
              const found = findAndClickElement(intent.target);
              if (found) {
                addHistory('assistant', `👆 Clicked: ${intent.target}`);
                speak(lang === 'te' ? `${intent.target} నొక్కాం` : lang === 'hi' ? `${intent.target} पर क्लिक किया` : `Clicked ${intent.target}`);
              } else {
                addHistory('assistant', `❌ Could not find: ${intent.target}`);
                speak(lang === 'te' ? `${intent.target} కనుగొనలేకపోయాం` : lang === 'hi' ? `${intent.target} नहीं मिला` : `Could not find ${intent.target}`);
              }
            }
            break;
          }
          default:
            break;
        }
        break;
      }
      case 'page_action': {
        switch (intent.action) {
          case 'read_weather': {
            addHistory('assistant', '🌤️ Fetching weather...');
            getWeatherSummary().then(w => {
              const msg = buildWeatherResponse(w, lang);
              addHistory('assistant', `🌤️ ${msg}`);
              speak(msg);
            });
            break;
          }
          case 'read_prices': {
            const cropHint = (intent.context || intent.raw || '').replace(/price|of|the|what|is|rate|how|much|bhav|dhar|ధర|ఎంత|कीमत|क्या/gi, '').trim();
            if (cropHint) {
              addHistory('assistant', `💰 Looking up ${cropHint} price...`);
              getCropPrice(cropHint).then(data => {
                const msg = buildPriceResponse(data, lang);
                addHistory('assistant', `💰 ${msg}`);
                speak(msg);
              });
            } else {
              const msg = lang === 'en' ? 'Which crop price do you want? Say: price of maize, cotton price, etc.' : lang === 'te' ? 'ఏ పంట ధర కావాలి?' : 'किस फसल की कीमत चाहिए?';
              addHistory('assistant', `💰 ${msg}`);
              speak(msg);
            }
            break;
          }
          case 'read_data': {
            const data = readPageData();
            if (data.length > 0) {
              const summary = data.slice(0, 5).join('. ');
              const msg = lang === 'en' ? `Here's what I see: ${summary}` : lang === 'te' ? `ఇక్కడ డేటా: ${summary}` : `यहाँ का डेटा: ${summary}`;
              addHistory('assistant', `📊 ${msg}`);
              speak(msg);
            } else {
              const msg = getResponse('noData', lang);
              addHistory('assistant', `📊 ${msg}`);
              speak(msg);
            }
            break;
          }
          case 'fill_form': {
            // Parse "fill [field] with [value]" or "type [value] in [field]"
            const raw = intent.raw || intent.context || '';
            let field = '', value = '';
            const withMatch = raw.match(/(?:fill|enter|type|write|put|set)\s+(.+?)\s+(?:with|as|to|value)\s+(.+)/i);
            const inMatch = raw.match(/(?:type|write|enter|put)\s+(.+?)\s+(?:in|into|on)\s+(.+)/i);
            if (withMatch) { field = withMatch[1]; value = withMatch[2]; }
            else if (inMatch) { value = inMatch[1]; field = inMatch[2]; }
            else { field = intent.context?.split(' ')[0] || ''; value = intent.context?.split(' ').slice(1).join(' ') || ''; }
            if (field && value) {
              const ok = fillFormField(field, value);
              const msg = ok ? (lang === 'en' ? `Filled ${field} with ${value}` : lang === 'te' ? `${field} లో ${value} నింపాం` : `${field} में ${value} भरा`) : (lang === 'en' ? `Could not find field ${field}` : `${field} కనుగొనలేకపోయాం`);
              addHistory('assistant', ok ? `✅ ${msg}` : `❌ ${msg}`);
              speak(msg);
            } else {
              speak(lang === 'en' ? 'Please say fill field name with value' : 'దయచేసి ఫీల్డ్ పేరు మరియు విలువ చెప్పండి');
            }
            break;
          }
          case 'submit_form': {
            const btn = submitCurrentForm();
            const msg = btn ? (lang === 'en' ? `Form submitted via ${btn}` : lang === 'te' ? `ఫారం సమర్పించబడింది` : `फॉर्म जमा हो गया`) : (lang === 'en' ? 'No submit button found' : 'సబ్మిట్ బటన్ కనుగొనలేదు');
            addHistory('assistant', btn ? `✅ ${msg}` : `❌ ${msg}`);
            speak(msg);
            break;
          }
          case 'switch_tab': {
            const tabName = intent.context;
            if (tabName) {
              const found = findAndClickElement(tabName);
              const msg = found ? (lang === 'en' ? `Switched to ${tabName}` : `${tabName} కు మారాం`) : (lang === 'en' ? `Tab ${tabName} not found` : `${tabName} ట్యాబ్ కనుగొనలేదు`);
              addHistory('assistant', found ? `🔄 ${msg}` : `❌ ${msg}`);
              speak(msg);
            }
            break;
          }
          case 'add_listing': case 'create_tour': case 'sell_product': {
            const found = findAndClickElement('add') || findAndClickElement('create') || findAndClickElement('new') || findAndClickElement('list');
            const msg = found ? (lang === 'en' ? 'Opening form to create new listing' : 'కొత్త లిస్టింగ్ ఫారం తెరుస్తున్నాం') : (lang === 'en' ? 'Add button not found on this page' : 'యాడ్ బటన్ కనుగొనలేదు');
            addHistory('assistant', found ? `➕ ${msg}` : `❌ ${msg}`);
            speak(msg);
            break;
          }
          case 'ask_ai': {
            navigate('/ai');
            const msg = lang === 'en' ? 'Opening AI Advisory' : lang === 'te' ? 'ఏఐ సలహా తెరుస్తున్నాం' : 'एआई सलाह खोल रहे हैं';
            addHistory('assistant', `🤖 ${msg}`);
            speak(msg);
            break;
          }
          case 'edit_profile': {
            navigate('/profile');
            const msg = lang === 'en' ? 'Opening your profile for editing' : 'ప్రొఫైల్ తెరుస్తున్నాం';
            addHistory('assistant', `👤 ${msg}`);
            speak(msg);
            break;
          }
          default: {
            const msg = lang === 'en' ? `Performing: ${intent.action}` : `చేస్తున్నాం: ${intent.action}`;
            addHistory('assistant', `⚡ ${msg}`);
            speak(msg);
            break;
          }
        }
        break;
      }
      default:
        break;
    }
  }, [lang, navigate, location.pathname, speak, addHistory, stopListening, setLang]);

  // Find and click a DOM element by text content
  function findAndClickElement(target) {
    const lower = target.toLowerCase();
    const allClickable = document.querySelectorAll('button, a, [role="button"], input[type="submit"], .nav-item, .bottom-nav-item');
    for (const el of allClickable) {
      const text = (el.textContent || el.getAttribute('aria-label') || '').toLowerCase();
      if (text.includes(lower)) {
        el.click();
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Visual feedback
        el.style.outline = '3px solid #10b981';
        el.style.outlineOffset = '2px';
        setTimeout(() => { el.style.outline = ''; el.style.outlineOffset = ''; }, 2000);
        return true;
      }
    }
    return false;
  }

  // Keyboard shortcut: hold Space to talk
  useEffect(() => {
    const onKey = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) return;
      if (e.code === 'KeyV' && e.altKey) {
        e.preventDefault();
        if (isListening) stopListening();
        else { setIsPanelOpen(true); startListening(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isListening, startListening, stopListening]);

  // Current page label for display
  const currentPage = PAGE_LABELS[location.pathname]?.[lang] || location.pathname.replace('/', '') || 'Home';

  if (!SpeechRecognition) return null; // No support

  return (
    <>
      <style>{`
        @keyframes vaGlow { 0%,100% { box-shadow: 0 0 0 0 rgba(16,185,129,0.5); } 50% { box-shadow: 0 0 0 14px rgba(16,185,129,0); } }
        @keyframes vaWave1 { 0%,100% { height: 8px; } 50% { height: 22px; } }
        @keyframes vaWave2 { 0%,100% { height: 14px; } 50% { height: 28px; } }
        @keyframes vaWave3 { 0%,100% { height: 10px; } 50% { height: 20px; } }
        @keyframes vaSlideUp { from { opacity: 0; transform: translateY(20px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes vaPulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.06); } }
        @keyframes vaShimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        .va-fab { position: fixed; left: 20px; bottom: 100px; z-index: 9998; width: 56px; height: 56px; border-radius: 50%; border: none; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; transition: all 0.3s cubic-bezier(0.4,0,0.2,1); }
        .va-fab:hover { transform: scale(1.1); }
        .va-fab.listening { animation: vaGlow 1.5s infinite; }
        .va-panel { position: fixed; left: 20px; bottom: 170px; z-index: 9997; width: 340px; max-width: calc(100vw - 40px); border-radius: 20px; overflow: hidden; animation: vaSlideUp 0.35s ease; }
        @media (max-width: 600px) { .va-fab { left: 16px; bottom: 90px; width: 50px; height: 50px; font-size: 1.2rem; } .va-panel { left: 10px; right: 10px; bottom: 150px; width: auto; max-height: 60vh; } }
      `}</style>

      {/* Floating Mic Button */}
      <button
        className={`va-fab${isListening ? ' listening' : ''}`}
        onClick={() => {
          if (isListening) { stopListening(); }
          else { setIsPanelOpen(true); startListening(); }
        }}
        onContextMenu={(e) => { e.preventDefault(); setIsPanelOpen(p => !p); }}
        title="Voice Assistant (Alt+V)"
        style={{
          background: isListening
            ? 'linear-gradient(135deg, #ef4444, #dc2626)'
            : 'linear-gradient(135deg, #10b981, #059669)',
          color: '#fff',
          boxShadow: isListening
            ? '0 4px 20px rgba(239,68,68,0.5)'
            : '0 4px 20px rgba(16,185,129,0.4)',
        }}
      >
        {isListening ? '⏹' : '🎙️'}
      </button>

      {/* Voice Panel */}
      {isPanelOpen && (
        <div className="va-panel" style={{
          background: 'linear-gradient(160deg, rgba(10,15,30,0.97), rgba(15,23,42,0.98))',
          border: '1px solid rgba(16,185,129,0.2)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.6), 0 0 40px rgba(16,185,129,0.08)',
          backdropFilter: 'blur(20px)',
        }}>
          {/* Header */}
          <div style={{ padding: '16px 20px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 32, height: 32, borderRadius: 10, background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>🎙️</div>
              <div>
                <div style={{ fontSize: '0.88rem', fontWeight: 700, color: '#e2e8f0' }}>
                  {lang === 'te' ? 'వాయిస్ అసిస్టెంట్' : lang === 'hi' ? 'वॉइस असिस्टेंट' : 'Voice Assistant'}
                </div>
                <div style={{ fontSize: '0.68rem', color: status === 'listening' ? '#10b981' : status === 'speaking' ? '#3b82f6' : '#64748b' }}>
                  {status === 'listening' ? (lang === 'te' ? '🔴 వింటున్నాను...' : lang === 'hi' ? '🔴 सुन रहा हूँ...' : '🔴 Listening...') :
                   status === 'speaking' ? '🔊 Speaking...' :
                   status === 'processing' ? '⚙️ Processing...' :
                   `📍 ${currentPage}`}
                </div>
              </div>
            </div>
            <button onClick={() => { stopListening(); setIsPanelOpen(false); }} style={{ background: 'none', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: '1rem', padding: 4 }}>✕</button>
          </div>

          {/* Audio Visualizer */}
          {isListening && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 3, padding: '14px 0', height: 50 }}>
              {[1,2,3,4,5,6,7,8,9].map(i => (
                <div key={i} style={{
                  width: 4, borderRadius: 2, background: `linear-gradient(to top, #10b981, #3b82f6)`,
                  animation: `vaWave${(i % 3) + 1} ${0.4 + (i * 0.08)}s ease-in-out infinite`,
                  animationDelay: `${i * 0.05}s`,
                  opacity: 0.6 + waveAmplitude * 0.4,
                }} />
              ))}
            </div>
          )}

          {/* Live Transcript */}
          {transcript && (
            <div style={{ padding: '0 20px 12px' }}>
              <div style={{
                padding: '10px 14px', borderRadius: 12,
                background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)',
                fontSize: '0.85rem', color: '#e2e8f0', fontStyle: 'italic',
                backgroundImage: status === 'processing' ? 'linear-gradient(90deg, transparent, rgba(16,185,129,0.1), transparent)' : 'none',
                backgroundSize: '200% 100%',
                animation: status === 'processing' ? 'vaShimmer 1.5s infinite' : 'none',
              }}>
                "{transcript}"
              </div>
            </div>
          )}

          {/* History */}
          <div style={{ maxHeight: 200, overflowY: 'auto', padding: '0 12px 8px' }}>
            {history.length === 0 && !isListening && (
              <div style={{ textAlign: 'center', padding: '20px 12px', color: '#64748b', fontSize: '0.78rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>🎙️</div>
                {lang === 'te' ? 'మైక్ నొక్కి మాట్లాడండి' : lang === 'hi' ? 'माइक दबाकर बोलें' : 'Tap the mic and speak'}
                <div style={{ marginTop: 8, fontSize: '0.7rem', color: '#475569' }}>
                  {lang === 'te' ? 'ఉదా: "వాతావరణం చూపించు" లేదా "మార్కెట్ ధరలు"' :
                   lang === 'hi' ? 'जैसे: "मौसम दिखाओ" या "मंडी भाव"' :
                   'Try: "Show weather" or "Market prices"'}
                </div>
              </div>
            )}
            {history.slice(-6).map((h, i) => (
              <div key={i} style={{
                padding: '8px 12px', marginBottom: 4, borderRadius: 10,
                background: h.type === 'user' ? 'rgba(59,130,246,0.08)' : h.type === 'system' ? 'rgba(239,68,68,0.08)' : 'rgba(16,185,129,0.06)',
                border: `1px solid ${h.type === 'user' ? 'rgba(59,130,246,0.15)' : h.type === 'system' ? 'rgba(239,68,68,0.15)' : 'rgba(16,185,129,0.12)'}`,
              }}>
                <div style={{ fontSize: '0.72rem', color: h.type === 'user' ? '#60a5fa' : h.type === 'system' ? '#f87171' : '#34d399', fontWeight: 600, marginBottom: 2 }}>
                  {h.type === 'user' ? '🗣️ You' : h.type === 'system' ? '⚠️ System' : '🤖 Assistant'}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#cbd5e1', lineHeight: 1.4 }}>{h.text}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ padding: '8px 12px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {[
              { label: lang === 'te' ? '📊 డేటా చదువు' : lang === 'hi' ? '📊 डेटा पढ़ो' : '📊 Read Data', cmd: 'read data on this page' },
              { label: lang === 'te' ? 'వాతావరణం' : lang === 'hi' ? 'मौसम' : 'Weather', cmd: 'weather' },
              { label: lang === 'te' ? 'ధరలు' : lang === 'hi' ? 'भाव' : 'Prices', cmd: 'market prices' },
              { label: lang === 'te' ? 'ఏఐ' : 'AI', cmd: 'ai advisory' },
              { label: lang === 'te' ? '✅ సమర్పించు' : lang === 'hi' ? '✅ जमा करो' : '✅ Submit', cmd: 'submit form' },
              { label: lang === 'te' ? 'వెనక్కి' : lang === 'hi' ? 'वापस' : 'Back', cmd: 'go back' },
            ].map(q => (
              <button key={q.cmd} onClick={() => handleCommand(q.cmd)} style={{
                padding: '5px 12px', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)',
                color: '#94a3b8', cursor: 'pointer', transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(16,185,129,0.1)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.3)'; e.currentTarget.style.color = '#10b981'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#94a3b8'; }}
              >{q.label}</button>
            ))}
          </div>

          {/* Bottom bar */}
          <div style={{ padding: '6px 16px 10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: '0.62rem', color: '#475569' }}>Alt+V to toggle</span>
            <button
              onClick={() => { if (isListening) stopListening(); else startListening(); }}
              style={{
                padding: '8px 20px', borderRadius: 999, border: 'none', cursor: 'pointer',
                fontSize: '0.78rem', fontWeight: 700, color: '#fff', transition: 'all 0.2s',
                background: isListening ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #10b981, #059669)',
                boxShadow: isListening ? '0 2px 12px rgba(239,68,68,0.3)' : '0 2px 12px rgba(16,185,129,0.3)',
              }}
            >
              {isListening ? (lang === 'te' ? '⏹ ఆపు' : lang === 'hi' ? '⏹ रुको' : '⏹ Stop') :
                            (lang === 'te' ? '🎙️ మాట్లాడండి' : lang === 'hi' ? '🎙️ बोलें' : '🎙️ Speak')}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
