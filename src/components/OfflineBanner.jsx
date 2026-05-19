import React, { useState, useEffect } from 'react';

/**
 * OfflineBanner — shows a user-friendly banner when the device goes offline
 * or when Supabase is unreachable. Auto-dismisses when back online.
 */
export default function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const goOffline = () => { setOffline(true); setDismissed(false); };
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  if (!offline || dismissed) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 99999,
      background: 'linear-gradient(135deg, #b91c1c 0%, #991b1b 100%)',
      color: '#fff', padding: '10px 20px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
      fontSize: '0.82rem', fontWeight: 600,
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
      animation: 'offlineBannerSlide 0.3s ease',
    }}>
      <style>{`
        @keyframes offlineBannerSlide { from { transform: translateY(-100%); } to { transform: translateY(0); } }
        @keyframes offlinePulse { 0%,100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
      <span style={{ animation: 'offlinePulse 1.5s ease-in-out infinite', fontSize: '1rem' }}>📡</span>
      <span>You are offline. Some features may not work until your connection is restored.</span>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)',
          color: '#fff', padding: '3px 10px', borderRadius: 6, cursor: 'pointer',
          fontSize: '0.72rem', fontWeight: 700, marginLeft: 8,
        }}
      >✕</button>
    </div>
  );
}
