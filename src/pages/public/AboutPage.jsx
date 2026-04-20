import React from 'react';
import { Link } from 'react-router-dom';

const TEAM = [
  { name: 'Dr. Srinivasa Rao', role: 'Chief Agronomist', expertise: 'Paddy & Cotton, 20+ years AP experience', icon: '👨‍🔬' },
  { name: 'Priya Lakshmi', role: 'AI/ML Lead', expertise: 'Crop disease detection, yield forecasting models', icon: '👩‍💻' },
  { name: 'Venkat Reddy', role: 'Head of Farmer Relations', expertise: 'Government scheme integration, rural outreach', icon: '👨‍💼' },
  { name: 'Anitha Devi', role: 'Product Manager', expertise: 'Farmer UX, Telugu-first design methodology', icon: '👩‍💼' },
];

const MILESTONES = [
  { year: '2022', title: 'Founded in Guntur', desc: 'Started with a simple mandi price tracker for Cotton and Paddy in Guntur district.' },
  { year: '2023', title: 'AI Advisory Launch', desc: 'Launched AI crop advisory with Telugu language support. 5,000+ farmers onboarded in first 6 months.' },
  { year: '2024', title: 'Scheme Integration', desc: 'Integrated YSR Rythu Bharosa, PM-KISAN, PMFBY. Partnership with 13 APMC markets.' },
  { year: '2025', title: '47K+ Farmers', desc: 'Platform expanded to all 13 AP districts. Satellite NDVI monitoring and drone reports launched.' },
  { year: '2026', title: 'Full Platform', desc: '24 modules, live weather API, insurance hub, expert connect, and transport marketplace all operational.' },
];

const PARTNERS = [
  { name: 'APMC Markets', desc: '200+ markets', icon: '🏪' },
  { name: 'AP Government', desc: 'YSR Rythu Bharosa', icon: '🏛️' },
  { name: 'Open-Meteo', desc: 'Live Weather API', icon: '🌤️' },
  { name: 'Farmonaut', desc: 'Satellite NDVI', icon: '🛸' },
  { name: 'PMFBY', desc: 'Crop Insurance', icon: '🛡️' },
  { name: 'State Bank', desc: 'KCC Integration', icon: '🏦' },
];

export default function AboutPage() {
  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

      {/* Hero */}
      <section style={{ padding: '80px 40px 60px', maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Our Story</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, marginBottom: 20 }}>
          Built in Andhra Pradesh,<br />
          <span style={{ color: '#22c55e' }}>for AP Farmers</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.8, maxWidth: 650, margin: '0 auto' }}>
          AgriConnect 360 was born in Guntur in 2022 with a single mission: give every Andhra Pradesh farmer the same data and technology advantages that large agribusinesses have. We built the first mandi price tracker in Telugu. Today, we're the state's most comprehensive agricultural platform with 47,000+ farmers across 13 districts.
        </p>
      </section>

      {/* Mission & Vision */}
      <section style={{ padding: '40px 40px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          {[
            { icon: '🎯', title: 'Our Mission', desc: 'Empower every AP farmer with real-time data, AI advisory, and government scheme access — in their own language — so they can make better decisions and earn more.', color: '#22c55e' },
            { icon: '🔭', title: 'Our Vision', desc: 'A future where no AP farmer sells below fair market price, loses crops to preventable diseases, or misses out on government support they deserve.', color: '#3b82f6' },
            { icon: '💚', title: 'Our Values', desc: 'Farmer-first design. Telugu-first communication. Free access for smallholders. Transparent AI. Data privacy. No middlemen.', color: '#8b5cf6' },
          ].map((v, i) => (
            <div key={i} style={{
              background: `${v.color}06`, border: `1px solid ${v.color}25`,
              borderRadius: 16, padding: '32px 28px',
            }}>
              <div style={{ fontSize: '2.5rem', marginBottom: 16 }}>{v.icon}</div>
              <h3 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.2rem', fontWeight: 700, color: v.color, marginBottom: 12 }}>{v.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#64748b', lineHeight: 1.7 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Timeline */}
      <section style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800 }}>Our Journey</h2>
          </div>
          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', left: 80, top: 0, bottom: 0, width: 2, background: 'rgba(34,197,94,0.2)' }} />
            {MILESTONES.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 32, marginBottom: 36, paddingLeft: 20 }}>
                <div style={{
                  minWidth: 60, height: 60, borderRadius: '50%',
                  background: 'rgba(34,197,94,0.1)', border: '2px solid rgba(34,197,94,0.3)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.8rem', fontWeight: 800, color: '#22c55e', flexShrink: 0,
                }}>{m.year}</div>
                <div style={{ paddingTop: 12 }}>
                  <div style={{ fontWeight: 700, fontSize: '1rem', color: '#e2e8f0', marginBottom: 6 }}>{m.title}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', lineHeight: 1.6 }}>{m.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section style={{ padding: '60px 40px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Built by Agriculture Experts</h2>
          <p style={{ color: '#64748b' }}>Our team combines deep agricultural knowledge with cutting-edge technology</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20 }}>
          {TEAM.map((t, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '28px 24px', textAlign: 'center',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; }}>
              <div style={{ fontSize: '3rem', marginBottom: 16 }}>{t.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', marginBottom: 4 }}>{t.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#22c55e', marginBottom: 10, fontWeight: 600 }}>{t.role}</div>
              <div style={{ fontSize: '0.76rem', color: '#64748b', lineHeight: 1.5 }}>{t.expertise}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Partners */}
      <section style={{ padding: '60px 40px', background: 'rgba(255,255,255,0.01)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Our Partners & Integrations</h2>
          <p style={{ color: '#64748b', marginBottom: 40 }}>Trusted integrations that power AgriConnect 360</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 16 }}>
            {PARTNERS.map((p, i) => (
              <div key={i} style={{
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 12, padding: '20px 24px', minWidth: 130, textAlign: 'center',
                transition: 'all 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>{p.icon}</div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#e2e8f0' }}>{p.name}</div>
                <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 4 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 40px', textAlign: 'center' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 16 }}>Join Our Growing Community</h2>
        <p style={{ color: '#64748b', marginBottom: 32 }}>47,000+ farmers trust AgriConnect 360. Be the next success story from your district.</p>
        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000',
            padding: '14px 32px', borderRadius: 10, fontWeight: 700, textDecoration: 'none',
          }}>🌾 Join Free Today</Link>
          <Link to="/contact" style={{
            border: '1px solid rgba(255,255,255,0.12)', color: '#94a3b8',
            padding: '14px 24px', borderRadius: 10, fontWeight: 600, textDecoration: 'none',
          }}>📞 Talk to Us</Link>
        </div>
      </section>
    </div>
  );
}
