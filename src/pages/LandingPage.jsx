import React from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  { icon: '📊', title: 'Smart Dashboard', desc: 'Complete farm management at a glance with 24+ modules' },
  { icon: '🌤️', title: 'Live Weather', desc: 'Real-time weather with AI farming advisory in Telugu & Hindi' },
  { icon: '💰', title: 'Market Prices', desc: 'Pan-India mandi prices with LSTM price predictions' },
  { icon: '🌱', title: 'Crop Calendar', desc: 'Personalized crop timeline from sowing to harvest' },
  { icon: '🤖', title: 'AI Advisory', desc: 'Disease detection, crop recommendations, yield prediction' },
  { icon: '🧪', title: 'Soil Health', desc: 'Digital soil health card with NPK gauges & NDVI maps' },
  { icon: '🛡️', title: 'Insurance Hub', desc: 'PMFBY, weather, livestock insurance with claim tracking' },
  { icon: '📞', title: 'Expert Connect', desc: 'Voice, video & WhatsApp access to agronomists' },
  { icon: '🏛️', title: 'Gov Schemes', desc: 'YSR Rythu Bharosa, PM-KISAN eligibility checker' },
  { icon: '🛸', title: 'Drone Reports', desc: 'NDVI mapping, pest detection & precision spraying' },
  { icon: '💳', title: 'Digital Wallet', desc: 'Agri Coins, rewards, transaction history' },
  { icon: '📚', title: 'Knowledge Base', desc: '22+ articles, video tutorials in multiple languages' },
];

const STATS = [
  { value: '5,000+', label: 'Farmers Onboarded' },
  { value: '24', label: 'Modules Active' },
  { value: '13', label: 'Districts Covered' },
  { value: '₹2.4 Cr', label: 'Market Value Tracked' },
];

const TESTIMONIALS = [
  { name: 'Ramaiah Naidu', location: 'Guntur, AP', quote: 'Market prices feature helped me get ₹200/quintal more for my cotton.', crop: '🌿 Cotton' },
  { name: 'Lakshmi Devi', location: 'Vijayawada, AP', quote: 'Weather advisory saved my paddy crop from unexpected rainfall.', crop: '🌾 Paddy' },
  { name: 'Venkatesh R', location: 'Kurnool, AP', quote: 'Got ₹42,000 insurance claim processed through the app in 15 days.', crop: '🌽 Maize' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
      {/* Navbar */}
      <nav style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 40px', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, background: 'rgba(13,17,23,0.95)', backdropFilter: 'blur(12px)', zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🌾</div>
          <div><div style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>Agri Connect 360</div><div style={{ fontSize: '0.75rem', color: '#22c55e' }}>Andhra Pradesh</div></div>
        </div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <a href="/features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Features</a>
          <a href="/pricing" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Pricing</a>
          <a href="/about" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>About</a>
          <a href="/contact-us" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }}>Contact</a>
          <Link to="/login" style={{ background: '#22c55e', color: '#000', padding: '8px 20px', borderRadius: 6, fontWeight: 600, fontSize: '0.88rem', textDecoration: 'none' }}>Login →</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '80px 40px', textAlign: 'center', maxWidth: 900, margin: '0 auto' }}>
        <div style={{ display: 'inline-block', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 20, padding: '4px 14px', fontSize: '0.75rem', color: '#22c55e', fontWeight: 600, marginBottom: 20 }}>🚀 India's #1 Agricultural Platform for AP Farmers</div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: '3.2rem', fontWeight: 800, lineHeight: 1.15, marginBottom: 20, background: 'linear-gradient(135deg, #e2e8f0, #22c55e)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Manage Your Farm.<br />Maximize Your Profit.
        </h1>
        <p style={{ fontSize: '1.1rem', color: 'var(--text-muted)', lineHeight: 1.7, maxWidth: 650, margin: '0 auto 32px' }}>
          24 powerful modules — from live weather to AI crop advisory — built for Andhra Pradesh farmers. Track market prices, manage expenses, get insurance, and connect with experts.
        </p>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
          <Link to="/login" style={{ background: '#22c55e', color: '#000', padding: '14px 32px', borderRadius: 8, fontWeight: 700, fontSize: '1rem', textDecoration: 'none', transition: 'transform 0.2s' }}>🌾 Start Free — No Credit Card</Link>
          <a href="#features" style={{ border: '1px solid var(--border)', color: 'var(--text-secondary)', padding: '14px 28px', borderRadius: 8, fontWeight: 600, fontSize: '0.95rem', textDecoration: 'none' }}>See Features ↓</a>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 20 }}>
          {['తెలుగు', 'हिन्दी', 'English'].map(l => <span key={l} style={{ background: 'var(--bg-card)', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', color: 'var(--text-muted)' }}>{l}</span>)}
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          {STATS.map(s => (
            <div key={s.label}>
              <div style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#22c55e' }}>{s.value}</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" style={{ padding: '80px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 700, marginBottom: 8 }}>24 Modules. One Platform.</h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>Everything an AP farmer needs — from field to market</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {FEATURES.map(f => (
            <div key={f.title} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px 20px', transition: 'transform 0.2s, border-color 0.2s', cursor: 'default' }}
              onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-4px)'; ev.currentTarget.style.borderColor = 'rgba(34,197,94,0.3)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform = ''; ev.currentTarget.style.borderColor = ''; }}>
              <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', lineHeight: 1.5 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: '60px 40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Trusted by AP Farmers</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1000, margin: '0 auto' }}>
          {TESTIMONIALS.map(t => (
            <div key={t.name} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '24px' }}>
              <div style={{ fontSize: '0.88rem', lineHeight: 1.6, color: 'var(--text-secondary)', marginBottom: 16 }}>"{t.quote}"</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div><div style={{ fontWeight: 700, fontSize: '0.85rem' }}>{t.name}</div><div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>📍 {t.location}</div></div>
                <span style={{ fontSize: '0.75rem', background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 12px', borderRadius: 20 }}>{t.crop}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: '80px 40px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 700, marginBottom: 8 }}>Simple, Free Pricing</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: 40 }}>All core features free forever for AP farmers</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
          {[
            { name: 'Free', price: '₹0', period: '/forever', features: ['Dashboard + 18 modules', 'Weather & AI Advisory', 'Market Prices', 'Crop Calendar', 'Knowledge Library'], highlight: false },
            { name: 'Pro Farmer', price: '₹99', period: '/month', features: ['Everything in Free', 'Drone Reports', 'Insurance Hub', 'Expert Video Calls', 'Priority Support', 'Advanced Analytics'], highlight: true },
            { name: 'FPO / Enterprise', price: 'Custom', period: '', features: ['Everything in Pro', 'Bulk farmer onboarding', 'White-label dashboard', 'API access', 'Dedicated manager'], highlight: false },
          ].map(p => (
            <div key={p.name} style={{ background: p.highlight ? 'linear-gradient(135deg, rgba(34,197,94,0.08), rgba(34,197,94,0.02))' : 'var(--bg-card)', border: `1px solid ${p.highlight ? 'rgba(34,197,94,0.3)' : 'var(--border)'}`, borderRadius: 16, padding: '32px 24px', position: 'relative' }}>
              {p.highlight && <div style={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)', background: '#22c55e', color: '#000', padding: '3px 14px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 700 }}>MOST POPULAR</div>}
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontFamily: 'Outfit', fontSize: '2.5rem', fontWeight: 800, marginBottom: 4 }}>{p.price}<span style={{ fontSize: '0.8rem', fontWeight: 400, color: 'var(--text-muted)' }}>{p.period}</span></div>
              <div style={{ margin: '20px 0' }}>
                {p.features.map(f => <div key={f} style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', padding: '6px 0', textAlign: 'left' }}>✓ {f}</div>)}
              </div>
              <Link to="/login" style={{ display: 'block', padding: '12px', borderRadius: 8, textDecoration: 'none', fontWeight: 700, fontSize: '0.88rem', background: p.highlight ? '#22c55e' : 'transparent', color: p.highlight ? '#000' : 'var(--text-secondary)', border: p.highlight ? 'none' : '1px solid var(--border)' }}>Get Started</Link>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section id="about" style={{ padding: '60px 40px', background: 'var(--bg-secondary)', borderTop: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 700, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 700, marginBottom: 16 }}>About AgriConnect 360</h2>
          <p style={{ color: 'var(--text-muted)', lineHeight: 1.8, marginBottom: 20, fontSize: '0.92rem' }}>
            AgriConnect 360 is built specifically for Andhra Pradesh farmers. Our mission is to empower every farmer with technology — from real-time weather advisories in Telugu to AI-powered crop disease detection. We integrate government schemes like YSR Rythu Bharosa, connect you to the best mandis across India, and provide expert agronomist advice at your fingertips.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            {['🌾 Built in AP', '🤖 AI-Powered', '📱 Mobile Ready', '🔒 Secure', '🌍 Multi-language', '💚 Free Forever'].map(t => (
              <span key={t} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>{t}</span>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: 24, marginBottom: 16 }}>
          {['Privacy Policy', 'Terms of Service', 'Contact Us', 'API Docs'].map(l => <a key={l} href="#" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.82rem' }}>{l}</a>)}
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>© 2026 AgriConnect 360 — Built with 💚 for Andhra Pradesh Farmers</div>
      </footer>
    </div>
  );
}
