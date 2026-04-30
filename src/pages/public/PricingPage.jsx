import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import DownloadAppPrompt from '../../components/DownloadAppPrompt';

const PLANS = [
  {
    name: '👨‍🌾 Farmer',
    price: '₹0',
    afterTrial: '₹100/year',
    period: ' for 6 months',
    desc: 'First 6 months completely FREE — then just ₹100/year (less than ₹9/month)',
    highlight: true,
    badge: '🌾 FOR FARMERS',
    features: [
      'Dashboard & all 18+ core modules',
      'Live weather in Telugu/Hindi/English',
      'Market prices — all AP mandis',
      'AI crop disease detection — 10/month',
      'Crop calendar & growth tracking',
      'Government scheme eligibility checker',
      'Community feed & farmer network',
      'Labour & equipment marketplace',
      'Soil & water testing reports',
    ],
    cta: 'Start Free — 6 Months Free',
    color: '#22c55e',
  },
  {
    name: '🤝 Broker / Trader',
    price: '₹499',
    afterTrial: null,
    period: '/year',
    desc: 'Market intelligence for traders — just ₹42/month',
    highlight: false,
    badge: null,
    features: [
      'Real-time mandi prices (all India)',
      'Price trend analytics & predictions',
      'Farmer network directory',
      'Transport & logistics booking',
      'Crop quality grading tools',
      'SMS/WhatsApp price alerts',
      'Bulk purchase management',
    ],
    cta: 'Start Broker Plan',
    color: '#3b82f6',
  },
  {
    name: '🏪 Supplier / Dealer',
    price: '₹999',
    afterTrial: null,
    period: '/year',
    desc: 'Grow your agri business — just ₹83/month',
    highlight: false,
    badge: null,
    features: [
      'Product catalog & inventory',
      'Order management dashboard',
      'Farmer demand insights',
      'Delivery tracking & logistics',
      'Credit & payment management',
      'Seasonal demand forecasting',
      'Priority listing in marketplace',
    ],
    cta: 'Start Supplier Plan',
    color: '#f59e0b',
  },
  {
    name: '🏢 FPO / Enterprise',
    price: '₹1,999',
    afterTrial: null,
    period: '/year',
    desc: 'For farmer organizations — just ₹167/month for unlimited members',
    highlight: false,
    badge: null,
    features: [
      'Everything in Farmer plan',
      'Bulk farmer onboarding (1000+)',
      'White-label dashboard option',
      'Custom district-level analytics',
      'API access & integrations',
      'Dedicated account manager',
      'On-site training workshops',
    ],
    cta: 'Contact Us',
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
        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Simple Pricing for Everyone</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3.2rem)', fontWeight: 900, marginBottom: 16 }}>
          Farmers Start <span style={{ color: '#22c55e' }}>Free</span>.<br />
          Everyone Pays <span style={{ color: '#f59e0b' }}>Almost Nothing</span>.
        </h1>
        <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: 1.7 }}>
          6 months free for farmers, then ₹100/year. Role-based plans for brokers, suppliers & FPOs — all under ₹170/month.
        </p>
      </section>

      {/* Plans */}
      <section style={{ padding: '20px 40px 80px', maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 20 }}>
          {PLANS.map((p, i) => (
            <div key={i} style={{
              background: p.highlight ? 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(34,197,94,0.02))' : 'rgba(255,255,255,0.02)',
              border: `1px solid ${p.highlight ? 'rgba(34,197,94,0.3)' : 'rgba(255,255,255,0.06)'}`,
              borderRadius: 20, padding: '32px 24px',
              position: 'relative', transition: 'all 0.3s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; }}>
              {p.badge && (
                <div style={{
                  position: 'absolute', top: -13, left: '50%', transform: 'translateX(-50%)',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000',
                  padding: '4px 16px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap',
                }}>{p.badge}</div>
              )}
              <div style={{ fontSize: '0.88rem', fontWeight: 700, color: p.color, marginBottom: 8 }}>{p.name}</div>
              <div style={{ fontFamily: 'Outfit, sans-serif', marginBottom: 4 }}>
                <span style={{ fontSize: '2.8rem', fontWeight: 900, color: '#e2e8f0' }}>{p.price}</span>
                <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{p.period}</span>
              </div>
              {p.afterTrial && (
                <div style={{ fontSize: '0.78rem', color: '#f59e0b', fontWeight: 600, marginBottom: 6 }}>Then {p.afterTrial} after trial</div>
              )}
              <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: 24, lineHeight: 1.5 }}>{p.desc}</div>
              <Link to={p.cta === 'Contact Us' ? '/contact' : '/login'} style={{
                display: 'block', textAlign: 'center', padding: '12px',
                borderRadius: 10, textDecoration: 'none', fontWeight: 700, fontSize: '0.85rem',
                background: p.highlight ? 'linear-gradient(135deg, #22c55e, #16a34a)' : 'transparent',
                color: p.highlight ? '#000' : '#94a3b8',
                border: p.highlight ? 'none' : '1px solid rgba(255,255,255,0.12)',
                marginBottom: 24, transition: 'all 0.2s',
              }}>
                {p.cta}
              </Link>
              <div>
                {p.features.map((f, fi) => (
                  <div key={fi} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0', borderBottom: fi < p.features.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                    <span style={{ color: p.color, flexShrink: 0, marginTop: 1 }}>✓</span>
                    <span style={{ fontSize: '0.8rem', color: '#94a3b8', lineHeight: 1.4 }}>{f}</span>
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
        <div style={{ marginTop: 28 }}>
          <DownloadAppPrompt variant="hero" />
        </div>
      </section>
    </div>
  );
}
