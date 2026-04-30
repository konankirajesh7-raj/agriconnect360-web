import React, { useState, useEffect, useRef } from 'react';

const API = 'https://api.open-meteo.com/v1/forecast';

const WMO = {
  0: { label: 'Clear Sky', icon: '☀️', bg: 'sunny' }, 1: { label: 'Mainly Clear', icon: '🌤️', bg: 'sunny' },
  2: { label: 'Partly Cloudy', icon: '⛅', bg: 'cloudy' }, 3: { label: 'Overcast', icon: '☁️', bg: 'cloudy' },
  45: { label: 'Fog', icon: '🌫️', bg: 'cloudy' }, 48: { label: 'Rime Fog', icon: '🌫️', bg: 'cloudy' },
  51: { label: 'Light Drizzle', icon: '🌦️', bg: 'rainy' }, 53: { label: 'Drizzle', icon: '🌦️', bg: 'rainy' },
  55: { label: 'Dense Drizzle', icon: '🌧️', bg: 'rainy' }, 61: { label: 'Slight Rain', icon: '🌧️', bg: 'rainy' },
  63: { label: 'Rain', icon: '🌧️', bg: 'rainy' }, 65: { label: 'Heavy Rain', icon: '⛈️', bg: 'storm' },
  80: { label: 'Rain Showers', icon: '🌦️', bg: 'rainy' }, 81: { label: 'Moderate Showers', icon: '🌧️', bg: 'rainy' },
  82: { label: 'Violent Showers', icon: '⛈️', bg: 'storm' },
  95: { label: 'Thunderstorm', icon: '⛈️', bg: 'storm' }, 96: { label: 'Thunderstorm + Hail', icon: '⛈️', bg: 'storm' },
  99: { label: 'Severe Thunderstorm', icon: '🌩️', bg: 'storm' },
};

const LOCS = [
  { n: 'Guntur', lat: 16.3067, lon: 80.4365 },
  { n: 'Vijayawada', lat: 16.5062, lon: 80.6480 },
  { n: 'Visakhapatnam', lat: 17.6868, lon: 83.2185 },
  { n: 'Tirupati', lat: 13.6288, lon: 79.4192 },
  { n: 'Kurnool', lat: 15.8281, lon: 78.0373 },
  { n: 'Rajahmundry', lat: 17.0005, lon: 81.8040 },
  { n: 'Nellore', lat: 14.4426, lon: 79.9865 },
  { n: 'Anantapur', lat: 14.6819, lon: 77.6006 },
  { n: 'Kadapa', lat: 14.4674, lon: 78.8241 },
  { n: 'Eluru', lat: 16.7107, lon: 81.0952 },
  { n: 'Ongole', lat: 15.5057, lon: 80.0499 },
  { n: 'Srikakulam', lat: 18.2949, lon: 83.8935 },
  { n: 'Vizianagaram', lat: 18.1067, lon: 83.3956 },
  { n: 'Kakinada', lat: 16.9891, lon: 82.2475 },
  { n: 'Machilipatnam', lat: 16.1875, lon: 81.1389 },
  { n: 'Chittoor', lat: 13.2172, lon: 79.1003 },
  { n: 'Nandyal', lat: 15.4786, lon: 78.4836 },
  { n: 'Tenali', lat: 16.2384, lon: 80.6400 },
  { n: 'Proddatur', lat: 14.7502, lon: 78.5481 },
  { n: 'Hindupur', lat: 13.8286, lon: 77.4911 },
  { n: 'Dharmavaram', lat: 14.4133, lon: 77.7206 },
  { n: 'Adoni', lat: 15.6322, lon: 77.2773 },
  { n: 'Madanapalle', lat: 13.5504, lon: 78.5026 },
  { n: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { n: 'Warangal', lat: 17.9784, lon: 79.5941 },
  { n: 'Karimnagar', lat: 18.4386, lon: 79.1288 },
  { n: 'Nizamabad', lat: 18.6725, lon: 78.0941 },
  { n: 'Khammam', lat: 17.2473, lon: 80.1514 },
  { n: 'Narasaraopet', lat: 16.2346, lon: 80.0480 },
  { n: 'Mangalagiri', lat: 16.4307, lon: 80.5686 },
  { n: 'Tadepalligudem', lat: 16.8143, lon: 81.5279 },
  { n: 'Amalapuram', lat: 16.5790, lon: 82.0048 },
  { n: 'Bhimavaram', lat: 16.5449, lon: 81.5212 },
  { n: 'Tanuku', lat: 16.7567, lon: 81.6810 },
  { n: 'Gudivada', lat: 16.4407, lon: 80.9960 },
  { n: 'Chilakaluripet', lat: 16.0892, lon: 80.1672 },
  { n: 'Markapur', lat: 15.7354, lon: 79.2693 },
  { n: 'Kavali', lat: 14.9136, lon: 79.9939 },
  { n: 'Palakollu', lat: 16.5177, lon: 81.7301 },
  { n: 'Chirala', lat: 15.8239, lon: 80.3521 },
  { n: 'Bapatla', lat: 15.9048, lon: 80.4670 },
  { n: 'Rajam', lat: 18.4561, lon: 83.6425 },
  { n: 'Palasa', lat: 18.7686, lon: 84.4155 },
  { n: 'Parvathipuram', lat: 18.7832, lon: 83.4253 },
  { n: 'Bobbili', lat: 18.5736, lon: 83.3591 },
  { n: 'Salur', lat: 18.5147, lon: 83.2050 },
  { n: 'Amadalavalasa', lat: 18.4107, lon: 83.9031 },
  { n: 'Narasannapeta', lat: 18.4141, lon: 84.0445 },
  { n: 'Ichapuram', lat: 19.1142, lon: 84.6866 },
  { n: 'Nellimarla', lat: 18.1610, lon: 83.4460 },
  { n: 'Gajapathinagaram', lat: 18.2780, lon: 83.3300 },
  { n: 'Srungavarapukota', lat: 17.8900, lon: 83.1400 },
];

const PAGE_BG = {
  sunny: { bg: 'linear-gradient(180deg, #ff8f00 0%, #ff6f00 25%, #e65100 50%, #bf360c 75%, #4e342e 100%)', text: '#fff' },
  cloudy: { bg: 'linear-gradient(180deg, #78909c 0%, #546e7a 30%, #37474f 60%, #263238 100%)', text: '#eceff1' },
  rainy:  { bg: 'linear-gradient(180deg, #1565c0 0%, #0d47a1 30%, #1a237e 60%, #0d1b2a 100%)', text: '#e3f2fd' },
  storm:  { bg: 'linear-gradient(180deg, #4a148c 0%, #311b92 25%, #1a237e 50%, #0d1b2a 100%)', text: '#e8eaf6' },
};

function tips(t, h, w, r, c) {
  const a = [];
  if (r > 5) { a.push('🚫 Do NOT spray pesticides — rain washes chemicals away'); a.push('🌾 Good day for transplanting paddy seedlings'); }
  else if (w < 15 && !r) a.push('✅ Perfect for spraying — low wind, no rain');
  if (t > 38) { a.push('🌡️ Extreme heat — irrigate fields early morning or late evening'); a.push('🐄 Keep livestock in shade, provide extra water'); }
  if (t > 42) a.push('⚠️ Heat wave warning — avoid outdoor farm work 12-4 PM');
  if (h > 85) a.push('⚠️ High fungal risk — monitor crops');
  if (r > 20) a.push('🌊 Heavy rain — check drainage');
  if (r < 1 && t > 30) a.push('💧 Irrigate — dry & hot');
  if (c >= 95) a.push('⛈️ Storm — protect crops');
  if (!a.length) a.push('✅ Weather favorable — continue farming');
  return a;
}

// CSS-only rain/lightning animations
const EFFECTS_CSS = `
@keyframes rainDrop { 0% { transform: translateY(-10vh) rotate(15deg); opacity:0.7; } 100% { transform: translateY(110vh) rotate(15deg); opacity:0; } }
@keyframes flash { 0%,100% { opacity:0; } 10% { opacity:0.8; } 20% { opacity:0; } 30% { opacity:0.5; } 40% { opacity:0; } }
@keyframes sunPulse { 0%,100% { transform: scale(1); opacity:0.4; } 50% { transform: scale(1.15); opacity:0.6; } }
@keyframes cloudDrift { 0% { transform: translateX(-10%); } 100% { transform: translateX(10%); } }
@keyframes floatUp { 0% { transform: translateY(0); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0); } }
.rain-line { position:fixed; width:2px; background:linear-gradient(transparent, rgba(255,255,255,0.4)); animation:rainDrop linear infinite; pointer-events:none; z-index:0; }
.lightning { position:fixed; inset:0; background:rgba(255,255,255,0.15); animation:flash 4s ease-in-out infinite; pointer-events:none; z-index:0; }
.sun-glow { position:fixed; top:-60px; right:-40px; width:200px; height:200px; border-radius:50%; background:radial-gradient(circle, rgba(255,235,59,0.4) 0%, rgba(255,152,0,0.15) 50%, transparent 70%); animation:sunPulse 4s ease-in-out infinite; pointer-events:none; z-index:0; }
.cloud-float { animation: cloudDrift 6s ease-in-out infinite alternate; }
`;

function RainEffect() {
  return <>
    {Array.from({length: 40}).map((_, i) => (
      <div key={i} className="rain-line" style={{
        left: `${Math.random()*100}%`, height: `${12+Math.random()*20}px`,
        animationDuration: `${0.4+Math.random()*0.4}s`, animationDelay: `${Math.random()*1}s`,
      }} />
    ))}
  </>;
}

export default function WeatherPage() {
  const [w, setW] = useState(null);
  const [fc, setFc] = useState([]);
  const [hr, setHr] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loc, setLoc] = useState(LOCS[0]);
  const [live, setLive] = useState(false);
  const [sq, setSq] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsCity, setGpsCity] = useState('');
  const [gpsError, setGpsError] = useState('');
  const ctrl = useRef(null);

  // Find nearest known city — returns the actual LOCS entry
  const findNearest = (lat, lon) => {
    let best = LOCS[0], minD = Infinity;
    LOCS.forEach(l => {
      const dLat = l.lat - lat;
      const dLon = l.lon - lon;
      const d = dLat * dLat + dLon * dLon;
      if (d < minD) { minD = d; best = l; }
    });
    return best;
  };

  // GPS handler — used by both auto-detect and button
  const handleGPSPosition = (pos) => {
    const userLat = pos.coords.latitude;
    const userLon = pos.coords.longitude;
    const nearest = findNearest(userLat, userLon);
    setGpsCity(`${nearest.n} (${userLat.toFixed(2)}°N, ${userLon.toFixed(2)}°E)`);
    setGpsError('');
    setLoc(nearest);
    setGpsLoading(false);
  };

  const handleGPSError = (err) => {
    setGpsLoading(false);
    if (err.code === 1) setGpsError('📍 Location permission denied — allow in browser settings');
    else if (err.code === 3) setGpsError('📍 Location timed out — try again');
    else setGpsError('📍 Location unavailable');
  };

  // Auto-detect GPS location on mount
  useEffect(() => {
    if (!navigator.geolocation) return;
    setGpsLoading(true);
    // Try high accuracy first
    navigator.geolocation.getCurrentPosition(
      handleGPSPosition,
      () => {
        // Fallback: try without high accuracy
        navigator.geolocation.getCurrentPosition(
          handleGPSPosition,
          (err) => { console.log('GPS skipped:', err.message); setGpsLoading(false); },
          { enableHighAccuracy: false, timeout: 15000, maximumAge: 600000 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 }
    );
  }, []);

  const detectGPS = () => {
    if (!navigator.geolocation) { setGpsError('GPS not available on this device'); return; }
    setGpsLoading(true);
    setGpsError('');
    navigator.geolocation.getCurrentPosition(
      handleGPSPosition,
      (err) => {
        // Fallback: try without high accuracy
        navigator.geolocation.getCurrentPosition(
          handleGPSPosition,
          handleGPSError,
          { enableHighAccuracy: false, timeout: 20000, maximumAge: 0 }
        );
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  useEffect(() => {
    if (ctrl.current) ctrl.current.abort();
    const ac = new AbortController();
    ctrl.current = ac;
    setLoading(true); setLive(false);

    const params = `latitude=${loc.lat}&longitude=${loc.lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,apparent_temperature,surface_pressure&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max&hourly=temperature_2m,precipitation_probability,weather_code&timezone=Asia%2FKolkata&forecast_days=7`;

    async function tryFetch() {
      const urls = [
        `/api/weather?lat=${loc.lat}&lon=${loc.lon}`,
        `https://api.open-meteo.com/v1/forecast?${params}`,
      ];

      for (const url of urls) {
        try {
          console.log('🌤️ Trying:', url.substring(0, 50) + '...');
          const r = await fetch(url, { signal: ac.signal });
          if (!r.ok) { console.warn('❌ HTTP', r.status); continue; }
          const data = await r.json();
          if (data?.current?.temperature_2m !== undefined) {
            console.log('✅ Live weather:', data.current.temperature_2m + '°C via', url.startsWith('/api') ? 'proxy' : 'direct');
            return data;
          }
        } catch (e) {
          if (e.name === 'AbortError') throw e;
          console.warn('❌ Failed:', e.message);
        }
      }
      throw new Error('All methods failed');
    }

    tryFetch()
      .then(data => {
        if (ac.signal.aborted) return;
        const c = data.current;
        setW({ temp: c.temperature_2m, hum: c.relative_humidity_2m, wind: c.wind_speed_10m, rain: c.precipitation, code: c.weather_code, feel: c.apparent_temperature, pres: c.surface_pressure });
        const d = data.daily;
        setFc(d.time.map((t, i) => ({ date: t, code: d.weather_code[i], max: d.temperature_2m_max[i], min: d.temperature_2m_min[i], rain: d.precipitation_sum[i], wind: d.wind_speed_10m_max[i] })));
        const h = data.hourly;
        setHr(h.time.slice(0, 24).map((t, i) => ({ time: t, temp: h.temperature_2m[i], rp: h.precipitation_probability[i], code: h.weather_code[i] })));
        setLive(true);
      })
      .catch(e => {
        if (e.name === 'AbortError') return;
        console.warn('🌤️ Using offline weather data');
        setW({ temp: 33, hum: 68, wind: 14, rain: 0, code: 1, feel: 35, pres: 1010 });
        const td = new Date();
        setFc([1,2,61,3,0,1,2].map((code, i) => { const d = new Date(td); d.setDate(d.getDate()+i); return { date: d.toISOString().split('T')[0], code, max: 36-i, min: 22+(i%2), rain: [0,2,15,8,0,0,3][i], wind: 14-i }; }));
        setHr([]);
      })
      .finally(() => setLoading(false));

    return () => { ac.abort(); };
  }, [loc]);

  const wmo = w ? (WMO[w.code] || { label: 'Clear', icon: '🌤️', bg: 'sunny' }) : { label: '', icon: '', bg: 'sunny' };
  const bg = wmo.bg || 'sunny';
  const theme = PAGE_BG[bg];
  const advs = w ? tips(w.temp, w.hum, w.wind, w.rain, w.code) : [];
  const fLocs = sq ? LOCS.filter(l => l.n.toLowerCase().includes(sq.toLowerCase())) : LOCS;

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', minHeight:400, color:'var(--text-muted)' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ fontSize:'3rem', marginBottom:16, animation:'floatUp 1.5s ease-in-out infinite' }}>🌤️</div>
        <div style={{ fontSize:'0.9rem' }}>Loading weather for {loc.n}...</div>
      </div>
    </div>
  );

  return (
    <div style={{ background: theme.bg, color: theme.text, borderRadius: 16, padding: '20px 16px', position: 'relative', overflow: 'hidden', minHeight: '80vh' }}>
      <style>{EFFECTS_CSS}</style>

      {/* Weather effects */}
      {(bg === 'rainy' || bg === 'storm') && <RainEffect />}
      {bg === 'storm' && <div className="lightning" />}
      {bg === 'sunny' && <div className="sun-glow" />}

      {/* Content — above effects */}
      <div style={{ position: 'relative', zIndex: 1 }}>

        {/* Location selector */}
        <div style={{ marginBottom: 14 }}>
          <input value={sq} onChange={e => setSq(e.target.value)} placeholder="🔍 Search city..."
            style={{ width: '100%', padding: '8px 12px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.25)', color: '#fff', fontSize: '0.8rem', outline: 'none', boxSizing: 'border-box', marginBottom: 8, backdropFilter: 'blur(4px)' }} />
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4, flexWrap: 'wrap' }}>
            <button onClick={detectGPS}
              style={{
                padding: '5px 12px', borderRadius: 16, fontSize: '0.7rem', fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap',
                background: gpsCity ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.1)',
                border: `1px solid ${gpsCity ? 'rgba(34,197,94,0.5)' : 'rgba(239,68,68,0.3)'}`,
                color: gpsCity ? '#22c55e' : '#f87171', backdropFilter: 'blur(4px)',
              }}>
              {gpsLoading ? '⏳ Detecting...' : gpsCity ? `📍 ${gpsCity} (GPS)` : '📍 Detect Location'}
            </button>
            {gpsError && <span style={{ fontSize: '0.7rem', color: '#f87171', padding: '5px 8px' }}>{gpsError}</span>}
            {sq && fLocs.map(l => (
              <button key={l.n} onClick={() => { setLoc(l); setSq(''); setGpsCity(''); }}
                style={{
                  padding: '5px 12px', borderRadius: 16, fontSize: '0.7rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap',
                  background: loc.n === l.n ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${loc.n === l.n ? 'rgba(255,255,255,0.5)' : 'rgba(255,255,255,0.15)'}`,
                  color: '#fff', backdropFilter: 'blur(4px)',
                }}>
                {l.n}
              </button>
            ))}
          </div>
        </div>

        {/* Hero */}
        <div style={{ textAlign: 'center', padding: '20px 0 24px' }}>
          <div className="cloud-float" style={{ fontSize: '5.5rem', filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.3))', marginBottom: 8 }}>{wmo.icon}</div>
          <div style={{ fontSize: '4.5rem', fontWeight: 900, lineHeight: 1, textShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>{w.temp}°C</div>
          <div style={{ fontSize: '0.9rem', opacity: 0.7, marginTop: 4 }}>Feels like {w.feel}°C</div>
          <div style={{ fontSize: '1.2rem', fontWeight: 700, marginTop: 8 }}>{wmo.label}</div>
          <div style={{ fontSize: '0.78rem', opacity: 0.6, marginTop: 4 }}>
            📍 {loc.n}, Andhra Pradesh {live && <span style={{ color: '#69f0ae' }}>• 🟢 Live</span>}
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 16 }}>
          {[
            { l: 'Humidity', v: `${w.hum}%`, i: '💧' },
            { l: 'Wind', v: `${w.wind} km/h`, i: '💨' },
            { l: 'Rain', v: `${w.rain} mm`, i: '🌧️' },
            { l: 'Pressure', v: `${Math.round(w.pres)}`, i: '📊' },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '10px 6px', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ fontSize: '1.1rem' }}>{s.i}</div>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{s.v}</div>
              <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>{s.l}</div>
            </div>
          ))}
        </div>

        {/* AI Advisory */}
        <div style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, borderLeft: '3px solid #69f0ae', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: 8, color: '#69f0ae' }}>🤖 AI Farming Advisory</div>
          {advs.map((a, i) => (
            <div key={i} style={{ padding: '5px 0', fontSize: '0.8rem', opacity: 0.9, borderBottom: i < advs.length-1 ? '1px solid rgba(255,255,255,0.1)' : 'none', lineHeight: 1.5 }}>{a}</div>
          ))}
        </div>

        {/* Hourly */}
        {hr.length > 0 && (
          <div style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '12px 14px', marginBottom: 14, border: '1px solid rgba(255,255,255,0.1)' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>⏰ Next 24 Hours</div>
            <div style={{ display: 'flex', overflowX: 'auto', WebkitOverflowScrolling: 'touch', paddingBottom: 4 }}>
              {hr.filter((_, i) => i % 3 === 0).map((h, i) => (
                <div key={i} style={{ minWidth: 52, textAlign: 'center', padding: '4px' }}>
                  <div style={{ fontSize: '0.6rem', opacity: 0.6 }}>{new Date(h.time).toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true })}</div>
                  <div style={{ fontSize: '1rem', margin: '2px 0' }}>{(WMO[h.code] || { icon: '🌤️' }).icon}</div>
                  <div style={{ fontSize: '0.78rem', fontWeight: 700 }}>{h.temp}°</div>
                  <div style={{ fontSize: '0.55rem', color: '#90caf9' }}>💧{h.rp}%</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 7-Day */}
        <div style={{ background: 'rgba(0,0,0,0.2)', backdropFilter: 'blur(8px)', borderRadius: 12, padding: '12px 14px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 700, marginBottom: 8 }}>📅 7-Day Forecast</div>
          {fc.map((d, i) => {
            const dw = WMO[d.code] || { label: 'Clear', icon: '🌤️' };
            const dn = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric' });
            return (
              <div key={d.date} style={{ display: 'flex', alignItems: 'center', padding: '7px 0', gap: 8, borderBottom: i < fc.length-1 ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
                <div style={{ width: 60, fontWeight: i < 2 ? 700 : 500, fontSize: '0.75rem' }}>{dn}</div>
                <div style={{ fontSize: '1.1rem' }}>{dw.icon}</div>
                <div style={{ flex: 1, fontSize: '0.7rem', opacity: 0.7 }}>{dw.label}</div>
                <span style={{ color: '#ff8a80', fontWeight: 700, fontSize: '0.78rem' }}>{d.max}°</span>
                <span style={{ opacity: 0.5, fontSize: '0.7rem' }}>/</span>
                <span style={{ color: '#82b1ff', fontSize: '0.78rem' }}>{d.min}°</span>
                <span style={{ width: 40, textAlign: 'right', fontSize: '0.63rem', color: d.rain > 5 ? '#90caf9' : 'rgba(255,255,255,0.4)' }}>🌧️{d.rain}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
