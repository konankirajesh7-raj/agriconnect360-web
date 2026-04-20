import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const PLANS = [
  {
    name: 'Free Farmer',
    price: '₹0',
    period: '/forever',
    desc: 'Everything a smallholder needs — completely free forever',
    highlight: false,
    features: [
      'Dashboard & 18 core modules',
      'Live weather in Telugu/Hindi/English',
      'Market prices — all AP mandis',
      'AI disease detection (10/month)',
      'Crop calendar & growth tracking',
      'Government scheme eligibility checker',
      'Knowledge library — 22+ articles',
      'Community Q&A forum',
      'Labour & equipment marketplace',
    ],
    cta: 'Start Free',
    color: '#22c55e',
  },
  {
    name: 'Pro Farmer',
    price: '₹99',
    period: '/month',
    desc: 'For serious farmers who want every advantage',
    highlight: true,
    features: [
      'Everything in Free Farmer',
      'AI disease detection — unlimited',
      'Drone NDVI reports (2/month)',
      'Expert video call — 30 min/month',
      'LSTM price prediction — advanced',
      'Satellite NDVI monitoring',
      'Insurance claim assistance',
      'Priority support — 4hr response',
      'Advanced profit analytics',
      'SMS price alerts — 50/month',
    ],
    cta: 'Start Pro — 30 Day Free Trial',
    color: '#22c55e',
  },
  {
    name: 'FPO / Enterprise',
    price: 'Custom',
    period: '',
    desc: 'For farmer producer organizations and agribusinesses',
    highlight: false,
    features: [
      'Everything in Pro Farmer',
      'Bulk farmer onboarding (1000+)',
      'White-label dashboard option',
      'REST API access',
      'Custom district-level analytics',
      'Dedicated account manager',
      'Training workshops (on-site)',
      'Integration with state APMC systems',
      'SLA guarantee — 99.5% uptime',
    ],
    cta: 'Contact Sales',
    color: '#8b5cf6',
  },
];

const FAQ = [
  { q: 'Is AgriConnect 360 really free for farmers?', a: 'Yes! All 18 core modules are completely free forever for individual farmers. No credit card required, no hidden fees. We believe every AP farmer deserves access to data and AI tools.' },
  { q: 'Does it work in Telugu?', a: 'Absolutely. Weather advisory, AI crop recommendations, expert responses, and support are all available in Telugu (తెలుగు). We are the only platform built Telugu-first for AP farmers.' },
  { q: 'Which districts does it cover?', a: 'All 13 districts of Andhra Pradesh — Guntur, Krishna, Kurnool, Vijayawada, Nellore, Visakhapatnam, Rajahmundry, Tirupati, Anantapur, Kadapa, Eluru, Ongole, and Machilipatnam — with live mandi prices and weather.' },
  { q: 'How accurate is the AI disease detection?', a: 'Our AI disease detection model is trained on 500,000+ AP-specific crop images and achieves 94% accuracy for common diseases like paddy blast, cotton bollworm, and chilli leaf curl. It improves continuously.' },
  { q: 'Is my farm data safe?', a: 'Your data is encrypted end-to-end and stored on Indian servers. We never sell your data to third parties. You own your data and can delete it anytime from Settings.' },
  { q: 'Can I use it without internet?', a: 'Core features like saved crop calendars, soil health card, and articles are available offline. Live features (weather, prices) require internet. A 2G connection is sufficient for most features.' },
  { q: 'How does the YSR Rythu Bharosa integration work?', a: 'Enter your Aadhaar and land details. We check real-time eligibility against AP government databases, show your installment status, and provide direct application links for any missing documentation.' },
  { q: 'Can a group of farmers use one account?', a: 'Free accounts are individual. FPO/Enterprise plan supports bulk farmer management — one admin can manage 1000+ farmer profiles, fields, and crop data from a single dashboard.' },
];

export default function PricingPage() {
  const [openFaq, setOpenFaq] = useState(null);
  const [billing, setBilling] = useState('monthly');

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

      {/* Hero */}
      <section style={{ padding: '80px 40px 60px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Simple Pricing</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, marginBottom: 16 }}>
          Free for Farmers.<br />
          <span style={{ color: '#22c55e' }}>Always.</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7 }}>
          All core features are free forever for individual AP farmers. Pro features available for power users. Enterprise plans for FPOs.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, marginTop: 32 }}>
          <span style={{ fontSize: '0.85rem', color: billing === 'monthly' ? '#e2e8f0' : '#64748b' }}>Monthly</span>
          <div style={{
            width: 48, height: 26, borderRadius: 13, background: 'rgba(34,197,94,0.2)',
            border: '1px solid rgba(34,197,94,0.3)', cursor: 'pointer', position: 'relative',
            transition: 'all 0.2s',
          }} onClick={() => setBilling(b => b === 'monthly' ? 'yearly' : 'monthly')}>
            <div style={{
              position: 'absolute', top: 3, left: billing === 'yearly' ? 22 : 3,
              width: 18, height: 18, borderRadius: '50%', background: '#22c55e',
              transition: 'left 0.2s',
            }} />
          </div>
          <span style={{ fontSize: '0.85rem', color: billing === 'yearly' ? '#e2e8f0' : '#64748b' }}>
            Yearly
            <span style={{ fontSize: '0.72rem', color: '#22c55e', marginLeft: 6, fontWeight: 700 }}>Save 20%</span>
          </span>
        </div>
      </section>

      {/* Plans */}
      <section style={{ padding: '20px 40px 80px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
          {PLANS.map((p, i) => (
            <div key={i} style={{
              background: p.highlight ? 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${p.highlight ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 20, padding: '36px 28px',
              position: 'relative', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
              {p.highlight && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000',
                  padding: '4px 16px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700,
                }}>⭐ MOST POPULAR</div>
              )}
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#64748b', marginBottom: 6 }}>{p.name}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                <span style={{ fontSize: '3rem', fontWeight: 900, color: '#e2e8f0' }}>{p.price === '₹0' ? '₹0' : billing === 'yearly' && p.price !== 'Custom' ? `₹${Math.round(parseInt(p.price.slice(1)) * 0.8)}` : p.price}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.period}</span>
              </div>
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 28, lineHeight: 1.5 }}>{p.desc}</div>
              <Link to={p.name === 'FPO / Enterprise' ? '/contact' : '/login'} style={{
                display: 'block', textAlign: 'center', padding: '13px',
                borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.9rem',
                background: p.highlight ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
                color: p.highlight ? '#000' : '#94a3b8',
                border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                marginBottom: 28, transition: 'all 0.2s',
              }}>
                {p.cta}
              </Link>
              <div>
                {p.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '7px 0', borderBottom: fi < p.features.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: '#22c55e', flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.4 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '60px 40px 80px', maxWidth: 760, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Frequently Asked Questions</h2>
          <p style={{ color: '#64748b' }}>Got more questions? Reach us at support@agriconnect360.in or call 1800-XXX-XXXX (toll free)</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FAQ.map((item, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 10, overflow: 'hidden', transition: 'all 0.2s',
            }}>
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{
                width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '18px 20px', background: 'none', border: 'none', cursor: 'pointer',
                color: '#e2e8f0', textAlign: 'left', fontSize: '0.92rem', fontWeight: 600,
              }}>
                {item.q}
                <span style={{ color: '#22c55e', fontSize: '1.2rem', marginLeft: 16, flexShrink: 0, transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : '' }}>+</span>
              </button>
              {openFaq === i && (
                <div style={{ padding: '0 20px 18px', fontSize: '0.85rem', color: '#64748b', lineHeight: 1.7 }}>
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '60px 40px 80px', textAlign: 'center', background: 'rgba(34,197,94,0.03)', borderTop: '1px solid rgba(34,197,94,0.1)' }}>
        <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '2rem', fontWeight: 800, marginBottom: 12 }}>Start with Free — No Strings Attached</h2>
        <p style={{ color: '#64748b', marginBottom: 32 }}>Create your account in 2 minutes. No credit card. Access 18 modules instantly.</p>
        <Link to="/login" style={{
          background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000',
          padding: '16px 40px', borderRadius: 10, fontWeight: 700, fontSize: '1rem', textDecoration: 'none',
          boxShadow: '0 4px 24px rgba(34,197,94,0.3)',
        }}>
          🌾 Get Started Free
        </Link>
      </section>
    </div>
  );
}
