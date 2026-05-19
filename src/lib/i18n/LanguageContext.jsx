import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';
import T, { navT as navTranslate } from './translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'rythusphere_language';

// Build reverse lookup: English string → translation key (once at module load)
const REVERSE_EN = {};
for (const [key, val] of Object.entries(T)) {
  if (val.en) REVERSE_EN[val.en.toLowerCase()] = key;
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => {
    try { return localStorage.getItem(STORAGE_KEY) || 'te'; } catch { return 'te'; }
  });

  const setLang = useCallback((l) => {
    setLangState(l);
    try { localStorage.setItem(STORAGE_KEY, l); } catch {}
  }, []);

  // t(key) → string in current language
  const t = useCallback((key) => {
    const tr = T[key];
    if (!tr) return key;
    return tr[lang] || tr.en || key;
  }, [lang]);

  // tx(englishText) → auto-translate any English phrase to current lang
  // Works by reverse-looking up the English text in T dictionary
  const tx = useCallback((englishText) => {
    if (!englishText || lang === 'en') return englishText;
    // Try exact match first
    const lower = englishText.toLowerCase().trim();
    const key = REVERSE_EN[lower];
    if (key && T[key][lang]) return T[key][lang];
    // Try partial matching — split by common delimiters and translate each word
    const words = englishText.split(/(\s+|,\s*|•\s*|—\s*|\|\s*)/);
    let anyTranslated = false;
    const translated = words.map(w => {
      const wLower = w.toLowerCase().trim();
      const wKey = REVERSE_EN[wLower];
      if (wKey && T[wKey][lang]) { anyTranslated = true; return T[wKey][lang]; }
      return w;
    });
    return anyTranslated ? translated.join('') : englishText;
  }, [lang]);

  // t3(key) → "తెలుగు | English | हिंदी"
  const t3 = useCallback((key) => {
    const tr = T[key];
    if (!tr) return key;
    return `${tr.te} | ${tr.en} | ${tr.hi}`;
  }, []);

  // tri(key) → { te, en, hi }
  const tri = useCallback((key) => {
    return T[key] || { te: key, en: key, hi: key };
  }, []);

  // navT(englishLabel) → translated label in current language
  const navT = useCallback((englishLabel) => {
    return navTranslate(englishLabel, lang);
  }, [lang]);

  useEffect(() => {
    document.documentElement.lang = lang === 'te' ? 'te' : lang === 'hi' ? 'hi' : 'en';
  }, [lang]);

  return React.createElement(LanguageContext.Provider, {
    value: { lang, setLang, t, tx, t3, tri, navT, T }
  }, children);
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  // Fallback when used outside provider
  const fallbackT = (key) => T[key]?.en || key;
  const fallbackTx = (text) => text;
  const fallbackNavT = (label) => navTranslate(label, 'en');
  return { lang: 'en', setLang: () => {}, t: fallbackT, tx: fallbackTx, t3: (key) => T[key] ? `${T[key].te} | ${T[key].en} | ${T[key].hi}` : key, tri: (key) => T[key] || { te: key, en: key, hi: key }, navT: fallbackNavT, T };
}

export default LanguageContext;
