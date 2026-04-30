import React, { useState, useEffect, useCallback } from 'react';
import { getFullLocation, stopWatching, checkLocationPermission } from '../lib/services/locationService';

const CACHE_KEY = 'agri360_location_cache';

export default function LocationBar() {
  const [loc, setLoc] = useState(() => {
    try { const c = localStorage.getItem(CACHE_KEY); return c ? JSON.parse(c) : null; } catch { return null; }
  });
  const [status, setStatus] = useState('idle');

  const fetchLocation = useCallback(async () => {
    setStatus('locating');
    try {
      const data = await getFullLocation();
      setLoc(data);
      setStatus('granted');
      try { localStorage.setItem(CACHE_KEY, JSON.stringify(data)); } catch {}
    } catch (e) {
      setStatus(e.code === 1 ? 'denied' : 'error');
    }
  }, []);

  useEffect(() => {
    checkLocationPermission().then(state => {
      if (state === 'granted' || state === 'prompt') fetchLocation();
      else setStatus('denied');
    });
    return () => stopWatching();
  }, []);

  useEffect(() => {
    if (status !== 'granted') return;
    const iv = setInterval(fetchLocation, 5 * 60 * 1000);
    return () => clearInterval(iv);
  }, [status, fetchLocation]);

  if (status === 'denied') {
    return (
      <div style={styles.bar}>
        <span>📍</span>
        <span style={{ flex: 1, fontSize: '0.72rem' }}>Enable location for weather & prices</span>
        <button style={styles.btn} onClick={fetchLocation}>Allow</button>
      </div>
    );
  }

  if (status === 'locating' && !loc) {
    return (
      <div style={styles.bar}>
        <span style={{ animation: 'pulse 1.5s infinite' }}>📍</span>
        <span style={{ fontSize: '0.72rem' }}>Locating...</span>
      </div>
    );
  }

  if (!loc) return null;

  const en = loc.en || {};
  const place = [en.village || en.mandal, en.district].filter(Boolean).join(', ') || `${loc.lat?.toFixed(4)}°N`;

  return (
    <div style={styles.bar}>
      <span>📍</span>
      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#e8f5e9', flex: 1 }}>{place}</span>
      {en.state && <span style={{ fontSize: '0.68rem', color: '#a5d6a7' }}>{en.state}</span>}
      <button style={styles.btn} onClick={fetchLocation}>{status === 'locating' ? '⏳' : '🔄'}</button>
    </div>
  );
}

const styles = {
  bar: {
    background: 'linear-gradient(135deg, rgba(13,75,31,0.9), rgba(26,122,53,0.85))',
    padding: '6px 14px', display: 'flex', alignItems: 'center', gap: '8px',
    color: '#e8f5e9', fontSize: '0.75rem',
    borderBottom: '1px solid rgba(76,175,80,0.2)',
  },
  btn: {
    background: 'rgba(76,175,80,0.25)', border: 'none', color: '#81c784', padding: '3px 8px',
    borderRadius: '6px', cursor: 'pointer', fontSize: '0.7rem', fontWeight: 600,
  },
};
