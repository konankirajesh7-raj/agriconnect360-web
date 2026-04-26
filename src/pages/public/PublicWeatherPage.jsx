import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FORECAST = [
  { day: 'Today', icon: '🌤️', high: 38, low: 26, rain: 10, humidity: 52, wind: 12, advisory: 'Light irrigation recommended' },
  { day: 'Tomorrow', icon: '⛅', high: 37, low: 25, rain: 20, humidity: 58, wind: 14, advisory: 'Monitor pest activity' },
  { day: 'Wed', icon: '🌧️', high: 34, low: 24, rain: 65, humidity: 72, wind: 18, advisory: 'Delay spraying operations' },
  { day: 'Thu', icon: '🌧️', high: 32, low: 23, rain: 80, humidity: 78, wind: 22, advisory: 'Ensure field drainage' },
  { day: 'Fri', icon: '⛅', high: 35, low: 24, rain: 30, humidity: 60, wind: 15, advisory: 'Good day for transplanting' },
  { day: 'Sat', icon: '☀️', high: 39, low: 27, rain: 5, humidity: 45, wind: 10, advisory: 'Apply foliar nutrition' },
  { day: 'Sun', icon: '☀️', high: 40, low: 28, rain: 0, humidity: 40, wind: 8, advisory: 'Harvest-ready crops: proceed' },
];

const DISTRICTS = ['Anantapur','Chittoor','Guntur','Kadapa','Krishna','Kurnool','Nellore','Prakasam','Srikakulam','Vizag','Vizianagaram','West Godavari','East Godavari'];

export default function PublicWeatherPage() {
  const [district, setDistrict] = useState('Guntur');
  const navigate = useNavigate();

  return (
    <div className="pub-page animated">
      <div className="pub-hero-mini">
        <h1>🌤️ 7-Day Weather Forecast — Andhra Pradesh</h1>
        <p>Farming-specific weather advisories for your district. No login required.</p>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>District:</label>
          <select className="fin-filter-select" value={district} onChange={e => setDistrict(e.target.value)} style={{ maxWidth: 220 }}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
        </div>

        <div className="pub-weather-grid">
          {FORECAST.map((f, i) => (
            <div key={f.day} className={`pub-weather-card ${i === 0 ? 'today' : ''}`}>
              <div className="pub-weather-day">{f.day}</div>
              <div className="pub-weather-icon">{f.icon}</div>
              <div className="pub-weather-temps">
                <span className="pub-weather-high">{f.high}°</span>
                <span className="pub-weather-low">{f.low}°</span>
              </div>
              <div className="pub-weather-stats">
                <span>💧 {f.rain}%</span>
                <span>💨 {f.wind} km/h</span>
              </div>
              <div className="pub-weather-advisory">🌱 {f.advisory}</div>
            </div>
          ))}
        </div>

        <div className="pub-cta-box">
          <h3>🤖 Want AI-powered crop-specific advisories?</h3>
          <p>Login for hyper-local weather alerts, pest risk forecasts, and irrigation scheduling.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Get Personalized Forecasts →</button>
        </div>
      </div>
    </div>
  );
}
