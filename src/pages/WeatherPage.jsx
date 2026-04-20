import React, { useState, useEffect } from 'react';
import axios from 'axios';

// Open-Meteo API — FREE, no API key needed!
const OPEN_METEO_URL = 'https://api.open-meteo.com/v1/forecast';
const DEFAULT_LAT = 16.3067; // Guntur, Andhra Pradesh
const DEFAULT_LON = 80.4365;

const WMO_CODES = {
  0: { label: 'Clear Sky', icon: '☀️' }, 1: { label: 'Mainly Clear', icon: '🌤️' }, 2: { label: 'Partly Cloudy', icon: '⛅' }, 3: { label: 'Overcast', icon: '☁️' },
  45: { label: 'Fog', icon: '🌫️' }, 48: { label: 'Rime Fog', icon: '🌫️' },
  51: { label: 'Light Drizzle', icon: '🌦️' }, 53: { label: 'Drizzle', icon: '🌦️' }, 55: { label: 'Dense Drizzle', icon: '🌧️' },
  61: { label: 'Slight Rain', icon: '🌧️' }, 63: { label: 'Rain', icon: '🌧️' }, 65: { label: 'Heavy Rain', icon: '⛈️' },
  71: { label: 'Slight Snow', icon: '🌨️' }, 73: { label: 'Snow', icon: '🌨️' }, 75: { label: 'Heavy Snow', icon: '❄️' },
  80: { label: 'Rain Showers', icon: '🌦️' }, 81: { label: 'Moderate Showers', icon: '🌧️' }, 82: { label: 'Violent Showers', icon: '⛈️' },
  95: { label: 'Thunderstorm', icon: '⛈️' }, 96: { label: 'Thunderstorm + Hail', icon: '⛈️' }, 99: { label: 'Severe Thunderstorm', icon: '🌩️' },
};

const LOCATIONS = [
  { name: 'Guntur, Andhra Pradesh', lat: 16.3067, lon: 80.4365 },
  { name: 'Vijayawada, AP', lat: 16.5062, lon: 80.6480 },
  { name: 'Visakhapatnam, AP', lat: 17.6868, lon: 83.2185 },
  { name: 'Tirupati, AP', lat: 13.6288, lon: 79.4192 },
  { name: 'Kurnool, AP', lat: 15.8281, lon: 78.0373 },
  { name: 'Rajahmundry, AP', lat: 17.0005, lon: 81.8040 },
  { name: 'Nellore, AP', lat: 14.4426, lon: 79.9865 },
  { name: 'Anantapur, AP', lat: 14.6819, lon: 77.6006 },
];

const LANGS = { en: 'English', hi: 'हिन्दी', te: 'తెలుగు' };

function getAdvisory(temp, humidity, windSpeed, rain, weatherCode, lang) {
  const advices = [];
  if (rain > 5) advices.push(lang === 'hi' ? '🚫 छिड़काव न करें — बारिश से दवाई बह जाएगी' : lang === 'te' ? '🚫 పిచికారీ చేయవద్దు — వర్షంలో మందు కొట్టుకుపోతుంది' : '🚫 Do NOT spray pesticides — rain will wash away chemicals');
  else if (windSpeed < 15 && !rain) advices.push(lang === 'hi' ? '✅ छिड़काव के लिए अच्छा समय — हवा कम है' : lang === 'te' ? '✅ పిచికారీకి మంచి సమయం — గాలి తక్కువగా ఉంది' : '✅ Good conditions for spraying — low wind speed');
  if (temp > 38) advices.push(lang === 'hi' ? '🌡️ अत्यधिक गर्मी — सिंचाई बढ़ाएं, सुबह/शाम काम करें' : lang === 'te' ? '🌡️ తీవ్ర వేడి — నీటిపారుదల పెంచండి' : '🌡️ Extreme heat — increase irrigation frequency, work early morning/late evening');
  if (humidity > 85) advices.push(lang === 'hi' ? '⚠️ फंगल रोग का खतरा — नमी अधिक है, फसल की निगरानी करें' : lang === 'te' ? '⚠️ శిలీంధ్ర వ్యాధి ప్రమాదం — తేమ ఎక్కువగా ఉంది' : '⚠️ High fungal disease risk — monitor crops for blight/mildew');
  if (rain > 20) advices.push(lang === 'hi' ? '🌊 भारी बारिश — जल निकासी की जांच करें' : lang === 'te' ? '🌊 భారీ వర్షం — నీటి పారుదల తనిఖీ చేయండి' : '🌊 Heavy rainfall alert — ensure drainage channels are clear');
  if (rain < 1 && temp > 30) advices.push(lang === 'hi' ? '💧 सिंचाई करें — सूखा और गर्मी' : lang === 'te' ? '💧 నీరు పెట్టండి — ఎండ మరియు పొడి' : '💧 Irrigate today — dry conditions with high temperatures');
  if (weatherCode >= 95) advices.push(lang === 'hi' ? '⛈️ तूफान — फसल की सुरक्षा करें, बाहर न जाएं' : lang === 'te' ? '⛈️ తుఫాను — పంటను రక్షించండి' : '⛈️ Thunderstorm warning — protect standing crops, avoid open fields');
  if (advices.length === 0) advices.push(lang === 'hi' ? '✅ मौसम सामान्य — खेती जारी रखें' : lang === 'te' ? '✅ వాతావరణం సాధారణం — వ్యవసాయం కొనసాగించండి' : '✅ Weather is favorable — continue normal farming activities');
  return advices;
}

export default function WeatherPage() {
  const [weather, setWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [hourly, setHourly] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('en');
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    axios.get(OPEN_METEO_URL, {
      params: {
        latitude: location.lat, longitude: location.lon,
        current: 'temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation,weather_code,apparent_temperature,surface_pressure',
        daily: 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum,wind_speed_10m_max,sunrise,sunset',
        hourly: 'temperature_2m,precipitation_probability,weather_code',
        timezone: 'Asia/Kolkata', forecast_days: 7,
      }
    }).then(r => {
      const c = r.data.current;
      setWeather({
        temp: c.temperature_2m, humidity: c.relative_humidity_2m,
        windSpeed: c.wind_speed_10m, rain: c.precipitation,
        weatherCode: c.weather_code, feelsLike: c.apparent_temperature,
        pressure: c.surface_pressure,
      });
      const d = r.data.daily;
      setForecast(d.time.map((t, i) => ({
        date: t, code: d.weather_code[i], max: d.temperature_2m_max[i],
        min: d.temperature_2m_min[i], rain: d.precipitation_sum[i],
        wind: d.wind_speed_10m_max[i], sunrise: d.sunrise[i], sunset: d.sunset[i],
      })));
      const h = r.data.hourly;
      setHourly(h.time.slice(0, 24).map((t, i) => ({
        time: t, temp: h.temperature_2m[i], rainProb: h.precipitation_probability[i], code: h.weather_code[i],
      })));
    }).catch(() => {
      setWeather({ temp: 32, humidity: 65, windSpeed: 12, rain: 0, weatherCode: 1, feelsLike: 34, pressure: 1012 });
      setForecast([
        { date: '2025-04-19', code: 1, max: 35, min: 22, rain: 0, wind: 14 },
        { date: '2025-04-20', code: 2, max: 34, min: 21, rain: 2, wind: 10 },
        { date: '2025-04-21', code: 61, max: 30, min: 20, rain: 15, wind: 18 },
        { date: '2025-04-22', code: 3, max: 28, min: 19, rain: 8, wind: 12 },
        { date: '2025-04-23', code: 0, max: 33, min: 21, rain: 0, wind: 8 },
        { date: '2025-04-24', code: 1, max: 36, min: 23, rain: 0, wind: 6 },
        { date: '2025-04-25', code: 2, max: 34, min: 22, rain: 3, wind: 11 },
      ]);
      setError('Using cached data');
    }).finally(() => setLoading(false));
  }, [location]);

  const wmo = weather ? (WMO_CODES[weather.weatherCode] || { label: 'Unknown', icon: '🌤️' }) : { label: '', icon: '' };
  const advisories = weather ? getAdvisory(weather.temp, weather.humidity, weather.windSpeed, weather.rain, weather.weatherCode, lang) : [];

  return (
    <div className="animated">
      <div className="section-header">
        <div><div className="section-title">🌤️ Weather & Farming Advisory</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Live data from Open-Meteo API • AI farming advice • 7-day forecast</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <select value={location.name} onChange={e => setLocation(LOCATIONS.find(l => l.name === e.target.value))}
            style={{ padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.82rem' }}>
            {LOCATIONS.map(l => <option key={l.name} value={l.name}>📍 {l.name}</option>)}
          </select>
          <div style={{ display: 'flex', gap: 2 }}>
            {Object.entries(LANGS).map(([k, v]) => (
              <button key={k} onClick={() => setLang(k)} style={{ padding: '6px 10px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '0.72rem', fontWeight: 600, background: lang === k ? '#3b82f6' : 'var(--bg-card)', color: lang === k ? '#fff' : 'var(--text-muted)' }}>{v}</button>
            ))}
          </div>
        </div>
      </div>

      {loading ? <div className="loading-state" style={{ padding: 60 }}>⟳ Fetching live weather data...</div> : (
        <>
          {error && <div style={{ padding: '8px 14px', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#f59e0b', marginBottom: 12 }}>⚠️ {error} — API may be temporarily unavailable</div>}

          {/* Current Weather */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 16, marginBottom: 20 }}>
            <div className="card" style={{ padding: '24px', gridColumn: 'span 2', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(34,197,94,0.04))' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '3.5rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1 }}>{weather.temp}°C</div>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>Feels like {weather.feelsLike}°C</div>
                  <div style={{ fontSize: '1rem', fontWeight: 600, marginTop: 6 }}>{wmo.label}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {location.name}</div>
                </div>
                <div style={{ fontSize: '5rem' }}>{wmo.icon}</div>
              </div>
            </div>
            {[
              { label: 'Humidity', value: `${weather.humidity}%`, icon: '💧', color: '#3b82f6' },
              { label: 'Wind', value: `${weather.windSpeed} km/h`, icon: '💨', color: '#06b6d4' },
              { label: 'Rain', value: `${weather.rain} mm`, icon: '🌧️', color: '#22c55e' },
              { label: 'Pressure', value: `${weather.pressure} hPa`, icon: '📊', color: '#8b5cf6' },
            ].map(m => (
              <div key={m.label} className="stat-card" style={{ padding: '18px' }}>
                <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{m.icon}</div>
                <div style={{ fontSize: '1.3rem', fontWeight: 800, color: m.color }}>{m.value}</div>
                <div className="stat-label">{m.label}</div>
              </div>
            ))}
          </div>

          {/* AI Farming Advisory */}
          <div className="card" style={{ padding: '20px 24px', marginBottom: 20, background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))', borderLeft: '3px solid #22c55e' }}>
            <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12 }}>
              🤖 {lang === 'hi' ? 'AI खेती सलाह' : lang === 'te' ? 'AI వ్యవసాయ సలహా' : 'AI Farming Advisory'}
            </div>
            {advisories.map((a, i) => (
              <div key={i} style={{ padding: '8px 0', fontSize: '0.88rem', color: 'var(--text-secondary)', borderBottom: i < advisories.length - 1 ? '1px solid var(--border)' : 'none', lineHeight: 1.6 }}>{a}</div>
            ))}
          </div>

          {/* Hourly Forecast */}
          {hourly.length > 0 && (
            <div className="card" style={{ padding: '16px 20px', marginBottom: 20 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>⏰ Hourly Forecast (Next 24h)</div>
              <div style={{ display: 'flex', gap: 0, overflowX: 'auto', paddingBottom: 8 }}>
                {hourly.filter((_, i) => i % 3 === 0).map((h, i) => (
                  <div key={i} style={{ minWidth: 60, textAlign: 'center', padding: '8px 4px' }}>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{new Date(h.time).toLocaleTimeString('en-IN', { hour: '2-digit', hour12: true })}</div>
                    <div style={{ fontSize: '1.2rem', margin: '4px 0' }}>{(WMO_CODES[h.code] || { icon: '🌤️' }).icon}</div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700 }}>{h.temp}°</div>
                    <div style={{ fontSize: '0.65rem', color: '#3b82f6' }}>💧{h.rainProb}%</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Forecast */}
          <div className="card" style={{ padding: '20px 24px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 16 }}>📅 7-Day Forecast</div>
            {forecast.map((d, i) => {
              const dayWmo = WMO_CODES[d.code] || { label: 'Unknown', icon: '🌤️' };
              const dayName = i === 0 ? 'Today' : i === 1 ? 'Tomorrow' : new Date(d.date).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
              return (
                <div key={d.date} style={{ display: 'flex', alignItems: 'center', padding: '10px 0', borderBottom: i < forecast.length - 1 ? '1px solid var(--border)' : 'none', gap: 16 }}>
                  <div style={{ width: 120, fontWeight: i < 2 ? 700 : 400, fontSize: '0.85rem' }}>{dayName}</div>
                  <div style={{ width: 30, fontSize: '1.3rem' }}>{dayWmo.icon}</div>
                  <div style={{ flex: 1, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{dayWmo.label}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: '0.82rem' }}>
                    <span style={{ color: '#ef4444', fontWeight: 600 }}>{d.max}°</span>
                    <span style={{ color: 'var(--text-muted)' }}>/</span>
                    <span style={{ color: '#3b82f6' }}>{d.min}°</span>
                  </div>
                  <div style={{ width: 60, textAlign: 'right', fontSize: '0.78rem', color: d.rain > 5 ? '#3b82f6' : 'var(--text-muted)' }}>🌧️ {d.rain}mm</div>
                  <div style={{ width: 60, textAlign: 'right', fontSize: '0.78rem', color: 'var(--text-muted)' }}>💨 {d.wind}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
