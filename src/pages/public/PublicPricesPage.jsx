import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMODITIES = [
  { name: 'Paddy (Common)', unit: 'Quintal', price: 2183, change: 45, trend: [2100,2120,2140,2160,2150,2183], mandi: 'Guntur APMC' },
  { name: 'Cotton (MCU-5)', unit: 'Quintal', price: 7120, change: -80, trend: [7300,7250,7200,7180,7160,7120], mandi: 'Adoni APMC' },
  { name: 'Groundnut', unit: 'Quintal', price: 5850, change: 120, trend: [5600,5650,5700,5750,5800,5850], mandi: 'Anantapur APMC' },
  { name: 'Red Chilli', unit: 'Quintal', price: 14500, change: 300, trend: [13800,14000,14100,14200,14350,14500], mandi: 'Guntur APMC' },
  { name: 'Maize', unit: 'Quintal', price: 2050, change: 25, trend: [1980,2000,2010,2020,2040,2050], mandi: 'Kurnool APMC' },
  { name: 'Turmeric', unit: 'Quintal', price: 9200, change: -150, trend: [9500,9450,9400,9350,9250,9200], mandi: 'Nizamabad APMC' },
  { name: 'Bengal Gram', unit: 'Quintal', price: 5480, change: 60, trend: [5350,5380,5400,5420,5450,5480], mandi: 'Kadapa APMC' },
  { name: 'Jowar', unit: 'Quintal', price: 3150, change: 30, trend: [3050,3070,3090,3110,3130,3150], mandi: 'Raichur APMC' },
  { name: 'Sunflower', unit: 'Quintal', price: 6350, change: 90, trend: [6100,6150,6200,6250,6300,6350], mandi: 'Bellary APMC' },
  { name: 'Onion', unit: 'Quintal', price: 1800, change: -200, trend: [2200,2100,2000,1950,1850,1800], mandi: 'Kurnool APMC' },
  { name: 'Tomato', unit: 'Quintal', price: 2400, change: 350, trend: [1800,1900,2000,2100,2250,2400], mandi: 'Madanapalle APMC' },
  { name: 'Green Gram', unit: 'Quintal', price: 7800, change: 100, trend: [7500,7600,7650,7700,7750,7800], mandi: 'Nellore APMC' },
];

function Sparkline({ data, positive }) {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const w = 80, h = 28;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`).join(' ');
  return (
    <svg width={w} height={h} style={{ display: 'block' }}>
      <polyline points={pts} fill="none" stroke={positive ? '#10b981' : '#ef4444'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function PublicPricesPage() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const filtered = useMemo(() => COMMODITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <div className="pub-page animated">
      <div className="pub-hero-mini">
        <h1>📊 Live Market Prices — Andhra Pradesh</h1>
        <p>Real-time commodity prices from APMCs across Andhra Pradesh. Login for personalized alerts.</p>
      </div>
      <div style={{ maxWidth: 1000, margin: '0 auto', padding: '0 16px' }}>
        <input className="pub-search" value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search commodity..." />
        <div className="pub-price-grid">
          {filtered.map(c => (
            <div key={c.name} className="pub-price-card">
              <div className="pub-price-header">
                <div>
                  <div className="pub-price-name">{c.name}</div>
                  <div className="pub-price-mandi">{c.mandi}</div>
                </div>
                <Sparkline data={c.trend} positive={c.change >= 0} />
              </div>
              <div className="pub-price-value">₹{c.price.toLocaleString('en-IN')}<span className="pub-price-unit">/{c.unit}</span></div>
              <div className={`pub-price-change ${c.change >= 0 ? 'up' : 'down'}`}>{c.change >= 0 ? '▲' : '▼'} ₹{Math.abs(c.change)} today</div>
            </div>
          ))}
        </div>
        <div className="pub-cta-box">
          <h3>🔔 Want price alerts & AI predictions?</h3>
          <p>Login to get personalized price alerts, trend forecasts, and sell-time recommendations.</p>
          <button className="btn btn-primary" onClick={() => navigate('/login')}>Login for Full Access →</button>
        </div>
      </div>
    </div>
  );
}
