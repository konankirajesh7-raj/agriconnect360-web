import React from 'react';
import { Link } from 'react-router-dom';

const FEATURE_CATEGORIES = [
  {
    category: 'Weather & Climate',
    icon: '🌤️',
    color: '#3b82f6',
    features: [
      { name: 'Live Weather Dashboard', desc: 'Real-time data from Open-Meteo API for all AP districts. Temperature, humidity, wind, rain, UV index, pressure.', badge: 'Live API' },
      { name: 'AI Farming Advisory', desc: 'Smart recommendations based on weather — when to spray, irrigate, harvest. Adapts to each crop.', badge: 'AI Powered' },
      { name: '7-Day Forecast', desc: 'Extended forecast with rain probability, min/max temperatures, and wind conditions for planning.', badge: null },
      { name: 'Hourly Forecast Strip', desc: 'Hour-by-hour weather for precision farming decisions. See rain windows for spraying and harvesting.', badge: null },
      { name: 'Telugu & Hindi Advisory', desc: 'All weather advice available in తెలుగు, हिन्दी, and English so every farmer understands.', badge: 'Multi-lang' },
    ]
  },
  {
    category: 'Market Intelligence',
    icon: '💰',
    color: '#22c55e',
    features: [
      { name: 'Live Mandi Prices', desc: 'Real-time prices from 200+ APMC markets. Commodity watchlist with price alerts.', badge: 'Live' },
      { name: 'Pan-India Price Heatmap', desc: 'Visual comparison of your crop prices across 8+ states to find the best market.', badge: 'Visual' },
      { name: 'Best Mandi Finder', desc: 'AI calculates net profit after transport costs for each market — tells you exactly where to sell.', badge: 'AI' },
      { name: 'LSTM Price Prediction', desc: 'Deep learning model predicts next 7-day price movements based on seasonal patterns and news.', badge: 'AI' },
      { name: 'Price Alert SMS', desc: 'Set price triggers — get SMS/app alerts when your commodity crosses your target price.', badge: null },
    ]
  },
  {
    category: 'AI Advisory',
    icon: '🤖',
    color: '#8b5cf6',
    features: [
      { name: 'AI Disease Detection', desc: 'Photograph diseased leaf/plant and get instant AI diagnosis with treatment recommendations.', badge: 'AI Vision' },
      { name: 'Crop Recommendation', desc: 'Input your soil type, climate zone, and target market — AI recommends optimal crops for maximum profit.', badge: 'AI' },
      { name: 'Yield Prediction', desc: 'AI estimates expected yield based on crop variety, weather, soil health, and historical data.', badge: 'AI' },
      { name: 'Expert Q&A', desc: 'Ask any farming question — AI answers immediately. Complex issues escalated to live agronomists.', badge: null },
      { name: 'Pest Alert System', desc: 'Early warning alerts for pest infestations based on weather patterns and region-specific risk models.', badge: 'Alert' },
    ]
  },
  {
    category: 'Soil & Crop Health',
    icon: '🌱',
    color: '#f59e0b',
    features: [
      { name: 'Digital Soil Health Card', desc: 'Upload soil test data → get instant NPK gauges, pH analysis, deficiency indicators. Print-ready.', badge: 'Digital' },
      { name: 'Satellite NDVI Monitoring', desc: 'Farmonaut-style NDVI heatmaps showing crop stress zones before visible symptoms appear.', badge: 'Satellite' },
      { name: 'Personalized Crop Calendar', desc: 'Day-by-day farming calendar from sowing to harvest with fertilizer, irrigation, and pest tasks.', badge: 'AI' },
      { name: 'Growth Stage Tracking', desc: 'Visual timeline showing current crop stage, days to harvest, and upcoming critical activities.', badge: null },
      { name: 'Drone NDVI Reports', desc: 'Book drone surveys for your fields. Get detailed NDVI maps, spray logs, and AI recommendations.', badge: 'Drone' },
    ]
  },
  {
    category: 'Financial Tools',
    icon: '💳',
    color: '#ec4899',
    features: [
      { name: 'Farm P&L Statement', desc: 'Complete profit & loss with revenue, expenses, ROI, and season-over-season comparison.', badge: null },
      { name: 'Expense Budget Tracker', desc: 'Track spending by category with budget alerts. Visual progress bars show overspend warnings.', badge: null },
      { name: 'Digital Wallet', desc: 'AgriCoins rewards system. Transaction history. Cashback on verified purchases.', badge: 'Rewards' },
      { name: 'Agri Credit Hub', desc: 'Kisan Credit Card integration, crop loan calculator, KCC application assistance.', badge: 'Finance' },
      { name: 'Insurance Hub', desc: 'PMFBY, weather-based, livestock, and equipment insurance. Claims tracked and filed digitally.', badge: 'Insurance' },
    ]
  },
  {
    category: 'Government Schemes',
    icon: '🏛️',
    color: '#06b6d4',
    features: [
      { name: 'YSR Rythu Bharosa', desc: 'Check eligibility, application status, and installment schedule for AP\'s flagship farmer scheme.', badge: 'AP Scheme' },
      { name: 'PM-KISAN Tracker', desc: 'Verify beneficiary status, track ₹6000/year installments, update land records.', badge: 'Central' },
      { name: 'Eligibility Checker', desc: 'Fill one form → see all 20+ schemes you qualify for with application links and required documents.', badge: 'AI Match' },
      { name: 'PMFBY Insurance', desc: 'Pradhan Mantri Fasal Bima Yojana enrolment, premium calculator, and claim filing.', badge: null },
      { name: 'Kisan Credit Card', desc: 'KCC application assistance, credit limit checker, renewal reminders.', badge: 'Credit' },
    ]
  },
];

const COMPARISON = [
  { feature: 'Telugu Language Support', us: true, others: false },
  { feature: 'AP District-Specific Prices', us: true, others: false },
  { feature: 'YSR Rythu Bharosa Integration', us: true, others: false },
  { feature: 'Satellite NDVI Monitoring', us: true, others: 'paid' },
  { feature: 'AI Disease Detection', us: true, others: true },
  { feature: 'Expert Voice Call', us: true, others: 'paid' },
  { feature: 'Drone Reports', us: true, others: 'paid' },
  { feature: 'Free to Use', us: true, others: false },
  { feature: 'Offline Mode', us: true, others: false },
  { feature: '24 Integrated Modules', us: true, others: false },
];

export default function FeaturesPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

      {/* Hero */}
      <section style={{ padding: '80px 40px 60px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Full Feature List</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, marginBottom: 16 }}>
          24 Modules Built for
          <span style={{ color: '#22c55e' }}> AP Farmers</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
          Every feature designed for Andhra Pradesh agriculture — from YSR Rythu Bharosa integration to Telugu-first AI advisory.
        </p>
      </section>

      {/* Feature Categories */}
      <section style={{ padding: '40px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
        {FEATURE_CATEGORIES.map((cat, ci) => (
          <div key={ci} style={{ marginBottom: 64 }}>
            {/* Category Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: '1.4rem',
                background: `${cat.color}15`, border: `1px solid ${cat.color}30`,
              }}>{cat.icon}</div>
              <div>
                <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.4rem', fontWeight: 700, color: '#e2e8f0' }}>{cat.category}</h2>
                <div style={{ fontSize: '0.75rem', color: cat.color }}>{cat.features.length} features</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
              {cat.features.map((f, fi) => (
                <div key={fi} style={{
                  background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '20px 20px', transition: 'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = `${cat.color}30`; e.currentTarget.style.background = `${cat.color}05`; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: '#e2e8f0' }}>{f.name}</div>
                    {f.badge && (
                      <span style={{ fontSize: '0.65rem', fontWeight: 700, background: `${cat.color}20`, color: cat.color, padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap', marginLeft: 8 }}>{f.badge}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* Comparison Table */}
      <section style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.6rem, 3vw, 2.2rem)', fontWeight: 800, marginBottom: 8 }}>Why AgriConnect 360?</h2>
            <p style={{ color: '#64748b', fontSize: '0.88rem' }}>The only platform built specifically for Andhra Pradesh farmers</p>
          </div>

          <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '14px 20px', background: 'rgba(255,255,255,0.03)' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Feature</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>AgriConnect 360</div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'center' }}>Others</div>
            </div>
            {COMPARISON.map((row, i) => (
              <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 160px', padding: '14px 20px', borderBottom: i < COMPARISON.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                <div style={{ fontSize: '0.85rem', color: '#94a3b8' }}>{row.feature}</div>
                <div style={{ textAlign: 'center' }}>
                  <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  {row.others === true ? <span style={{ color: '#22c55e', fontSize: '1.1rem' }}>✓</span>
                   : row.others === 'paid' ? <span style={{ fontSize: '0.72rem', color: '#f59e0b' }}>Paid Only</span>
                   : <span style={{ color: '#ef4444', fontSize: '1.1rem' }}>✗</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>All Features. Free Forever.</h2>
        <p style={{ color: '#64748b', marginBottom: 32, maxWidth: 500, margin: '0 auto 32px' }}>Every core feature is completely free for AP farmers. No subscription required for weather, prices, AI advisory, or schemes.</p>
        <Link to="/login" style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)',
          color: '#000', padding: '14px 36px', borderRadius: 10,
          fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
        }}>
          🌾 Get Started Free
        </Link>
      </section>
    </div>
  );
}
