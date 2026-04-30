import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import T, { navT as navTranslate } from './translations';

const LanguageContext = createContext(null);
const STORAGE_KEY = 'agri360_language';

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
    value: { lang, setLang, t, t3, tri, navT, T }
  }, children);
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (ctx) return ctx;
  // Fallback when used outside provider
  const fallbackT = (key) => T[key]?.en || key;
  const fallbackNavT = (label) => navTranslate(label, 'en');
  return { lang: 'en', setLang: () => {}, t: fallbackT, t3: (key) => T[key] ? `${T[key].te} | ${T[key].en} | ${T[key].hi}` : key, tri: (key) => T[key] || { te: key, en: key, hi: key }, navT: fallbackNavT, T };
}

export default LanguageContext;
