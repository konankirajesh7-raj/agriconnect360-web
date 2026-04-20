import React, { useState } from 'react';

const CONTACT_METHODS = [
  { icon: '📞', title: 'Phone Support', desc: 'Toll-free helpline (6 AM – 9 PM)', value: '1800-425-3434', action: 'Call Now', sub: 'Available in Telugu & Hindi' },
  { icon: '💬', title: 'WhatsApp Support', desc: 'Message us anytime', value: '+91 94400 12345', action: 'Open WhatsApp', sub: 'Response in 2 hours' },
  { icon: '📧', title: 'Email Support', desc: 'For detailed queries', value: 'support@agriconnect360.in', action: 'Send Email', sub: 'Response in 24 hours' },
  { icon: '🏢', title: 'Visit Us', desc: 'Head office in Guntur', value: 'AgriConnect 360, Main Road, Guntur 522001, AP', action: 'Get Directions', sub: 'Mon–Sat, 9 AM – 6 PM' },
];

const TOPICS = ['General Inquiry', 'Technical Issue', 'Account Problem', 'Enterprise/FPO Sales', 'Partnership', 'Media/Press', 'Farmer Feedback', 'Bug Report'];

export default function ContactPublicPage() {
  const [form, setForm] = useState({ name: '', phone: '', district: '', topic: '', message: '', language: 'en' });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const DISTRICTS = ['Guntur', 'Krishna', 'Kurnool', 'Vijayawada', 'Nellore', 'Visakhapatnam', 'Rajahmundry', 'Tirupati', 'Anantapur', 'Kadapa', 'Eluru', 'Ongole', 'Machilipatnam'];

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setSubmitted(true);
      setLoading(false);
    }, 1200);
  };

  const inputStyle = {
    width: '100%', padding: '12px 14px', borderRadius: 8,
    background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)',
    color: '#e2e8f0', fontSize: '0.88rem', outline: 'none',
    transition: 'border-color 0.2s', boxSizing: 'border-box',
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

      {/* Hero */}
      <section style={{ padding: '80px 40px 60px', textAlign: 'center', maxWidth: 700, margin: '0 auto' }}>
        <div style={{ fontSize: '0.78rem', color: '#22c55e', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Get in Touch</div>
        <h1 style={{ fontFamily: 'Outfit, sans-serif', fontSize: 'clamp(2rem, 4vw, 3rem)', fontWeight: 900, marginBottom: 16 }}>
          We're Here to Help<br />
          <span style={{ color: '#22c55e' }}>తెలుగులో కూడా!</span>
        </h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', lineHeight: 1.7 }}>
          Our support team speaks Telugu, Hindi, and English. Reach us by phone, WhatsApp, or email. We respond to all farmer queries within 4 hours.
        </p>
      </section>

      {/* Contact Cards */}
      <section style={{ padding: '20px 40px 60px', maxWidth: 1100, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 20, marginBottom: 60 }}>
          {CONTACT_METHODS.map((m, i) => (
            <div key={i} style={{
              background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 14, padding: '28px 24px', transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(34,197,94,0.25)'; e.currentTarget.style.background = 'rgba(34,197,94,0.03)'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.02)'; }}>
              <div style={{ fontSize: '2rem', marginBottom: 14 }}>{m.icon}</div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#e2e8f0', marginBottom: 4 }}>{m.title}</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: 12 }}>{m.desc}</div>
              <div style={{ fontSize: '0.85rem', color: '#22c55e', fontWeight: 600, marginBottom: 8, wordBreak: 'break-word' }}>{m.value}</div>
              <div style={{ fontSize: '0.72rem', color: '#475569', marginBottom: 14 }}>{m.sub}</div>
            </div>
          ))}
        </div>

        {/* Contact Form */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40, maxWidth: 1000, margin: '0 auto' }}>
          {/* Form */}
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: 8 }}>Send Us a Message</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: 28, lineHeight: 1.6 }}>Fill the form below and our team will get back to you within 4 hours. Farmers get priority response.</p>

            {submitted ? (
              <div style={{
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.3)',
                borderRadius: 12, padding: '40px 32px', textAlign: 'center',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: 16 }}>✅</div>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.3rem', fontWeight: 700, color: '#22c55e', marginBottom: 10 }}>Message Sent!</div>
                <div style={{ color: '#64748b', fontSize: '0.88rem', lineHeight: 1.6 }}>Thank you, {form.name}! Our support team will contact you within 4 hours on your phone number or via email.</div>
                <button onClick={() => { setSubmitted(false); setForm({ name: '', phone: '', district: '', topic: '', message: '', language: 'en' }); }}
                  style={{ marginTop: 20, padding: '10px 24px', background: 'rgba(34,197,94,0.15)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 8, color: '#22c55e', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Full Name *</label>
                    <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Your name" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Phone *</label>
                    <input required value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                      placeholder="+91 XXXXX XXXXX" style={inputStyle}
                      onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                      onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>District</label>
                    <select value={form.district} onChange={e => setForm({...form, district: e.target.value})}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Select District</option>
                      {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Topic *</label>
                    <select required value={form.topic} onChange={e => setForm({...form, topic: e.target.value})}
                      style={{ ...inputStyle, cursor: 'pointer' }}>
                      <option value="">Select Topic</option>
                      {TOPICS.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Preferred Language</label>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {[['en', '🇬🇧 English'], ['te', '🇮🇳 తెలుగు'], ['hi', '🇮🇳 हिन्दी']].map(([v, l]) => (
                      <button key={v} type="button" onClick={() => setForm({...form, language: v})}
                        style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s',
                          background: form.language === v ? 'rgba(34,197,94,0.15)' : 'transparent',
                          borderColor: form.language === v ? 'rgba(34,197,94,0.4)' : 'rgba(255,255,255,0.1)',
                          color: form.language === v ? '#22c55e' : '#64748b',
                        }}>{l}</button>
                    ))}
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em', display: 'block', marginBottom: 6 }}>Message *</label>
                  <textarea required value={form.message} onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Describe your query in detail..." rows={5}
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                    onFocus={e => e.target.style.borderColor = 'rgba(34,197,94,0.4)'}
                    onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.1)'} />
                </div>

                <button type="submit" disabled={loading} style={{
                  padding: '14px', borderRadius: 10, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000',
                  fontWeight: 700, fontSize: '0.95rem', opacity: loading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}>
                  {loading ? '⏳ Sending...' : '📩 Send Message'}
                </button>
              </form>
            )}
          </div>

          {/* Right side info */}
          <div>
            <h2 style={{ fontFamily: 'Outfit, sans-serif', fontSize: '1.6rem', fontWeight: 700, marginBottom: 20 }}>Support for Every Farmer</h2>
            {[
              { icon: '🕐', title: 'Operating Hours', desc: 'Phone & WhatsApp: 6 AM – 9 PM, Mon–Sun\nEmail: 24/7, response within 24 hours\nEmergency crop alerts: 24/7' },
              { icon: '🗣️', title: 'Languages We Support', desc: 'Telugu (తెలుగు) — Primary\nHindi (हिन्दी) — Full Support\nEnglish — Full Support' },
              { icon: '📍', title: 'District Offices', desc: 'Field support teams in Guntur, Vijayawada, Kurnool, Visakhapatnam, and Tirupati. Book an in-person visit for complex issues.' },
              { icon: '⚡', title: 'Response Times', desc: 'Farmers (Free): Within 4 hours\nPro Farmer: Within 2 hours\nEnterprise: Within 30 minutes\nCrop emergency: Immediate' },
            ].map((item, i) => (
              <div key={i} style={{ marginBottom: 24, paddingBottom: 24, borderBottom: i < 3 ? '1px solid rgba(255,255,255,0.06)' : 'none' }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.5rem', flexShrink: 0 }}>{item.icon}</span>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0', marginBottom: 6 }}>{item.title}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', lineHeight: 1.7, whiteSpace: 'pre-line' }}>{item.desc}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
