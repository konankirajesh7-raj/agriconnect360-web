import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '🌤️', title: 'Live Weather AI', desc: 'Real-time forecasts with farming-specific advice in Telugu, Hindi & English. Hourly & 7-day forecasts for all AP districts.', color: '#3b82f6' },
  { icon: '💰', title: 'Mandi Price Tracker', desc: 'Live prices from 200+ APMCs across Andhra Pradesh. LSTM AI predictions show where prices will move.', color: '#22c55e' },
  { icon: '🤖', title: 'AI Crop Advisory', desc: 'Photograph disease symptoms and get instant diagnosis. AI recommends crops based on your soil, climate & market trends.', color: '#8b5cf6' },
  { icon: '🧪', title: 'Digital Soil Card', desc: 'Upload soil test results. AI interprets NPK, pH levels and generates a printable Digital Soil Health Card.', color: '#f59e0b' },
  { icon: '🌱', title: 'Crop Calendar', desc: 'Personalized day-by-day farming calendar from sowing to harvest. Pest alerts, fertilizer schedules, irrigation reminders.', color: '#22c55e' },
  { icon: '🏛️', title: 'YSR Rythu Bharosa', desc: 'Check eligibility for YSR Rythu Bharosa, PM-KISAN, PMFBY, KCC and 20+ government schemes. Apply directly.', color: '#f59e0b' },
  { icon: '🛸', title: 'Drone NDVI Reports', desc: 'Satellite-based NDVI crop health maps. Book drone spraying services. Get stress zone alerts before crop loss.', color: '#ef4444' },
  { icon: '📞', title: 'Expert Agronomists', desc: 'Connect via voice, video or WhatsApp with 50+ certified agronomists across AP. Available 6 AM – 9 PM.', color: '#06b6d4' },
  { icon: '🛡️', title: 'Crop Insurance', desc: 'PMFBY, weather-based & livestock insurance. File and track claims from your phone. Claims in 15 days.', color: '#ec4899' },
  { icon: '🚜', title: 'Equipment Rental', desc: 'Rent tractors, harvesters, sprayers from verified operators. Book by hour or by acre. Nearest to your field.', color: '#f59e0b' },
  { icon: '👷', title: 'Labour Marketplace', desc: 'Book certified farm labour groups. PaySure escrow protects payments. Rated associations with 10,000+ workers.', color: '#22c55e' },
  { icon: '🚛', title: 'Transport Hub', desc: 'Book verified trucks for produce transport. Live GPS tracking. Cost estimator shows best route to market.', color: '#3b82f6' },
];

const STATS = [
  { value: '47,000+', label: 'AP Farmers Onboarded', icon: '👨‍🌾' },
  { value: '13', label: 'Districts Covered', icon: '📍' },
  { value: '₹12.4 Cr', label: 'Market Value Tracked', icon: '💰' },
  { value: '24', label: 'AI-Powered Modules', icon: '🤖' },
  { value: '200+', label: 'APMC Markets Connected', icon: '🏪' },
  { value: '98.2%', label: 'Uptime Guaranteed', icon: '⚡' },
];

const TESTIMONIALS = [
  {
    name: 'Ramaiah Naidu', location: 'Guntur, AP', avatar: 'RN', crop: '🌿 Cotton', rating: 5,
    quote: 'Market prices feature helped me sell my cotton at ₹200/quintal more than local traders. I got ₹3.2 lakh more profit this season using AgriConnect 360.',
    district: 'Guntur District'
  },
  {
    name: 'Lakshmi Devi', location: 'Vijayawada, AP', avatar: 'LD', crop: '🌾 Paddy', rating: 5,
    quote: 'Weather advisory saved my paddy crop from unexpected rainfall. The Telugu advisory was so easy to understand. I avoided ₹1.8 lakh in losses.',
    district: 'Krishna District'
  },
  {
    name: 'Venkatesh Rao', location: 'Kurnool, AP', avatar: 'VR', crop: '🌽 Maize', rating: 5,
    quote: 'Got ₹42,000 PMFBY insurance claim processed through the app in just 15 days. The scheme eligibility checker helped me apply for YSR Rythu Bharosa too.',
    district: 'Kurnool District'
  },
  {
    name: 'Sunita Reddy', location: 'Nellore, AP', avatar: 'SR', crop: '🌾 Paddy', rating: 5,
    quote: 'AI disease detection identified blast disease in my paddy field 2 weeks early. Saved my entire 5-acre crop. The Telugu explanation was very helpful.',
    district: 'Nellore District'
  },
  {
    name: 'Krishna Murthy', location: 'Rajahmundry, AP', avatar: 'KM', crop: '🌴 Coconut', rating: 5,
    quote: 'Drone NDVI reports showed stress zones in my coconut grove. Fixed the irrigation issue before leaf drop. No more guessing — data-based farming!',
    district: 'East Godavari District'
  },
  {
    name: 'Padmavathi T', location: 'Tirupati, AP', avatar: 'PT', crop: '🥜 Groundnut', rating: 5,
    quote: 'Soil Health Card feature helped me understand my soil needs. Reduced fertilizer cost by 30% by applying only what my soil actually needed.',
    district: 'Chittoor District'
  },
];

const JOURNEY_STEPS = [
  { step: '01', icon: '🧪', title: 'Know Your Soil', desc: 'Upload soil test → get Digital Soil Health Card with AI recommendations', color: '#22c55e' },
  { step: '02', icon: '🌱', title: 'Plan Your Crop', desc: 'AI recommends best crops based on soil, climate & current mandi prices', color: '#3b82f6' },
  { step: '03', icon: '🛒', title: 'Get Quality Inputs', desc: 'Buy verified seeds, fertilizers & pesticides from certified suppliers', color: '#8b5cf6' },
  { step: '04', icon: '🌿', title: 'Grow Smart', desc: 'Personalized crop calendar, AI pest alerts, drone NDVI monitoring', color: '#f59e0b' },
  { step: '05', icon: '💰', title: 'Sell at Best Price', desc: 'Real-time mandi prices, best market finder, transport booking', color: '#ef4444' },
  { step: '06', icon: '📊', title: 'Track Your Profit', desc: 'Expenses, revenue, ROI analysis — complete farm P&L statement', color: '#06b6d4' },
];

const DISTRICTS = [
  'Guntur', 'Krishna', 'Kurnool', 'Vijayawada', 'Nellore',
  'Visakhapatnam', 'Rajahmundry', 'Tirupati', 'Anantapur',
  'Kadapa', 'Eluru', 'Ongole', 'Machilipatnam',
];

export default function HomePage() {
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [counts, setCounts] = useState({ farmers: 0, districts: 0, value: 0, modules: 0 });
  const [visibleStats, setVisibleStats] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setActiveTestimonial(i => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeTestimonial]);

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

      {/* ── HERO SECTION ── */}
      <section style={{
        padding: '100px 40px 80px',
        textAlign: 'center',
        maxWidth: 1100,
        margin: '0 auto',
        position: 'relative',
      }}>
        {/* Background glow */}
        <div style={{
          position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
          width: 600, height: 300,
          background: 'radial-gradient(ellipse, rgba(34,197,94,0.12) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.25)',
          borderRadius: 24, padding: '6px 16px', fontSize: '0.78rem',
          color: '#22c55e', fontWeight: 600, marginBottom: 28,
        }}>
          🚀 Andhra Pradesh's #1 Agricultural Platform
        </div>

        <h1 style={{
          fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2.2rem, 5vw, 4rem)',
          fontWeight: 900, lineHeight: 1.1, marginBottom: 24, position: 'relative',
        }}>
          <span style={{
            background: 'linear-gradient(135deg, #e2e8f0 30%, #22c55e)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Data-Driven Farming
          </span>
          <br />
          <span style={{ color: '#e2e8f0' }}>for AP Farmers</span>
        </h1>

        <p style={{
          fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#94a3b8',
          lineHeight: 1.8, maxWidth: 700, margin: '0 auto 40px',
        }}>
          24 AI-powered modules — live mandi prices, crop advisory in <strong style={{ color: '#e2e8f0' }}>తెలుగు</strong>, disease detection, government schemes, insurance, and more. Built specifically for <strong style={{ color: '#22c55e' }}>Andhra Pradesh</strong> farmers.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 48 }}>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            color: '#000', padding: '16px 36px', borderRadius: 10,
            fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
            boxShadow: '0 4px 24px rgba(34,197,94,0.3)',
            transition: 'transform 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={e => e.currentTarget.style.transform = ''}>
            🌾 Start Free — No Credit Card
          </Link>
          <Link to="/features" style={{
            border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8',
            padding: '16px 28px', borderRadius: 10, fontWeight: 600,
            fontSize: '0.95rem', textDecoration: 'none', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = '#22c55e'; e.currentTarget.style.color = '#22c55e'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#94a3b8'; }}>
            Explore Features →
          </Link>
        </div>

        {/* Language pills */}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
          {[
            { lang: 'తెలుగు', label: 'Telugu Support' },
            { lang: 'हिन्दी', label: 'Hindi Support' },
            { lang: 'English', label: 'English Support' },
          ].map(l => (
            <div key={l.lang} style={{
              display: 'flex', gap: 6, alignItems: 'center',
              background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
              padding: '6px 14px', borderRadius: 20, fontSize: '0.75rem', color: '#64748b',
            }}>
              <span style={{ color: '#22c55e' }}>✓</span>
              <strong style={{ color: '#e2e8f0' }}>{l.lang}</strong>
              <span>{l.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── STATS BAND ── */}
      <section style={{
        background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)',
        borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '48px 40px',
      }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 32, textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontSize: '2rem', marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2.2rem', fontWeight: 900, color: '#22c55e', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 6 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── SEEDS TO MARKET JOURNEY ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Complete Farming Journey</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, marginBottom: 12 }}>From Seed to Market — All in One Platform</h2>
          <p style={{ color: '#64748b', maxWidth: 600, margin: '0 auto', lineHeight: 1.7 }}>AgriConnect 360 guides you through every step of the farming cycle with AI-powered tools and real-time data.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {JOURNEY_STEPS.map((step, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '28px 24px',
              transition: 'all 0.3s', cursor: 'default',
              position: 'relative', overflow: 'hidden',
            }}
            onMouseEnter={e => { e.currentTarget.style.border = `1px solid ${step.color}40`; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.background = `${step.color}08`; }}
            onMouseLeave={e => { e.currentTarget.style.border = '1px solid rgba(255,255,255,0.06)'; e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
              <div style={{ fontSize: '0.7rem', fontWeight: 700, color: step.color, letterSpacing: '0.1em', marginBottom: 12 }}>STEP {step.step}</div>
              <div style={{ fontSize: '2.2rem', marginBottom: 12 }}>{step.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 8, color: '#e2e8f0' }}>{step.title}</div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', lineHeight: 1.6 }}>{step.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES GRID ── */}
      <section id="features" style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 60 }}>
            <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>24 Powerful Modules</div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.8rem)', fontWeight: 800, marginBottom: 12 }}>Everything an AP Farmer Needs</h2>
            <p style={{ color: '#64748b', maxWidth: 500, margin: '0 auto' }}>From AI disease detection to government scheme eligibility — all in one platform, in your language.</p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {FEATURES.map((f, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 14, padding: '24px 20px', transition: 'all 0.3s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = `${f.color}40`; e.currentTarget.style.background = `${f.color}06`; e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; e.currentTarget.style.transform = ''; }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 8, color: '#e2e8f0' }}>{f.title}</div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', lineHeight: 1.6 }}>{f.desc}</div>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginTop: 48 }}>
            <Link to="/features" style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              border: '1px solid rgba(34,197,94,0.3)', color: '#22c55e',
              padding: '12px 28px', borderRadius: 8, fontWeight: 600,
              fontSize: '0.92rem', textDecoration: 'none', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(34,197,94,0.08)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}>
              View All 24 Features →
            </Link>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ── */}
      <section style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 60 }}>
          <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Farmer Success Stories</div>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.8rem, 3vw, 2.6rem)', fontWeight: 800 }}>Trusted by AP Farmers Across 13 Districts</h2>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 16, padding: '28px 24px', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'; e.currentTarget.style.background = 'rgba(34,197,94,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
              {/* Stars */}
              <div style={{ display: 'flex', gap: 2, marginBottom: 14 }}>
                {Array(t.rating).fill('⭐').map((s, j) => <span key={j} style={{ fontSize: '0.9rem' }}>{s}</span>)}
              </div>
              <p style={{ fontSize: '0.88rem', lineHeight: 1.7, color: '#94a3b8', marginBottom: 20 }}>"{t.quote}"</p>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 700, color: '#000',
                  }}>{t.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>{t.name}</div>
                    <div style={{ fontSize: '0.72rem', color: '#64748b' }}>📍 {t.location}</div>
                  </div>
                </div>
                <span style={{ fontSize: '0.72rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: 20 }}>{t.crop}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── AP DISTRICTS COVERAGE ── */}
      <section style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, marginBottom: 8 }}>Covering All 13 AP Districts</h2>
          <p style={{ color: '#64748b', marginBottom: 32, fontSize: '0.88rem' }}>Live mandi prices, weather data, and scheme info for every district in Andhra Pradesh</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center' }}>
            {DISTRICTS.map(d => (
              <span key={d} style={{
                background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.2)',
                color: '#22c55e', padding: '8px 16px', borderRadius: 24, fontSize: '0.82rem', fontWeight: 600,
              }}>📍 {d}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ padding: '100px 40px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(34,197,94,0.06) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ position: 'relative', maxWidth: 700, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: 16 }}>
            Start Farming Smarter<br />
            <span style={{ color: '#22c55e' }}>Today — It's Free</span>
          </h2>
          <p style={{ color: '#64748b', marginBottom: 40, fontSize: '1rem', lineHeight: 1.7 }}>
            Join 47,000+ Andhra Pradesh farmers who use AgriConnect 360 to get better prices, save costs, and protect their crops with AI.
          </p>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/login" style={{
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              color: '#000', padding: '16px 40px', borderRadius: 10,
              fontWeight: 700, fontSize: '1.05rem', textDecoration: 'none',
              boxShadow: '0 8px 32px rgba(34,197,94,0.3)',
            }}>
              🌾 Register Free — Starts in 2 Minutes
            </Link>
            <Link to="/contact" style={{
              border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8',
              padding: '16px 28px', borderRadius: 10, fontWeight: 600,
              fontSize: '0.95rem', textDecoration: 'none',
            }}>
              📞 Talk to Support
            </Link>
          </div>
          <p style={{ fontSize: '0.78rem', color: '#475569', marginTop: 20 }}>
            No credit card • No hidden fees • Full platform access free
          </p>
        </div>
      </section>
    </div>
  );
}
