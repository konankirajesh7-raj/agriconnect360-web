import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

export default function LanguageSwitcher({ compact = false }) {
  const { lang, setLang, t } = useLanguage();
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const btnRef = useRef(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  // Calculate position from button when opening
  useEffect(() => {
    if (open && btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      setPos({ top: rect.bottom + 6, right: window.innerWidth - rect.right });
    }
  }, [open]);

  const languages = [
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳', sub: 'Telugu' },
    { code: 'en', label: 'English', flag: '🇬🇧', sub: 'English' },
    { code: 'hi', label: 'हिंदी', flag: '🇮🇳', sub: 'Hindi' },
  ];

  const current = languages.find(l => l.code === lang) || languages[0];

  return (
    <div ref={ref} style={{ position: 'relative', display: 'inline-block' }}>
      <button
        ref={btnRef}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: compact ? '4px 8px' : '8px 14px',
          background: 'rgba(76,175,80,0.15)', border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: '10px', color: '#c8e6c9', cursor: 'pointer',
          fontSize: compact ? '12px' : '13px', transition: 'all 0.2s',
        }}
        onClick={() => setOpen(!open)}
      >
        🌐 {compact ? current.label.slice(0, 2) : current.label} ▾
      </button>

      {open && (
        <div style={{
          position: 'fixed',
          top: pos.top,
          right: pos.right,
          minWidth: '200px',
          background: 'rgba(13,75,31,0.98)',
          border: '1px solid rgba(76,175,80,0.4)',
          borderRadius: '12px',
          padding: '6px',
          zIndex: 99999,
          boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
          backdropFilter: 'blur(20px)',
        }}>
          {languages.map(l => (
            <div
              key={l.code}
              style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderRadius: '8px', cursor: 'pointer',
                transition: 'all 0.2s',
                background: lang === l.code ? 'rgba(76,175,80,0.25)' : 'transparent',
                color: lang === l.code ? '#4caf50' : '#c8e6c9',
              }}
              onClick={() => { setLang(l.code); setOpen(false); }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(76,175,80,0.15)'}
              onMouseLeave={(e) => e.currentTarget.style.background = lang === l.code ? 'rgba(76,175,80,0.25)' : 'transparent'}
            >
              <span style={{ fontSize: '18px' }}>{l.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: '14px' }}>{l.label}</div>
                <div style={{ fontSize: '11px', color: '#81c784' }}>{l.sub}</div>
              </div>
              {lang === l.code && <span style={{ color: '#4caf50', fontWeight: 700 }}>✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
