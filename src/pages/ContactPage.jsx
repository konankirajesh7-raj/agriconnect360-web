import React, { useState } from 'react';

const EXPERTS = [
  { id: 1, name: 'Dr. Rajesh Kumar', role: 'Agronomist', speciality: 'Paddy & Cotton', rating: 4.8, consultations: 340, available: true, languages: ['EN', 'HI', 'KN'], photo: '👨‍🔬' },
  { id: 2, name: 'Priya Sharma', role: 'Soil Scientist', speciality: 'Soil Health & Fertilizers', rating: 4.6, consultations: 220, available: true, languages: ['EN', 'HI'], photo: '👩‍🔬' },
  { id: 3, name: 'Venkatesh R', role: 'Market Analyst', speciality: 'Pricing & Trade', rating: 4.5, consultations: 180, available: false, languages: ['EN', 'KN', 'TE'], photo: '👨‍💼' },
  { id: 4, name: 'Dr. Anitha M', role: 'Entomologist', speciality: 'Pest & Disease', rating: 4.9, consultations: 410, available: true, languages: ['EN', 'HI', 'TE'], photo: '👩‍🔬' },
];

const RECENT = [
  { id: 1, expert: 'Dr. Rajesh Kumar', type: 'voice', duration: '12 min', date: '2025-04-10', topic: 'Cotton pest management' },
  { id: 2, expert: 'Priya Sharma', type: 'chat', duration: '8 min', date: '2025-04-05', topic: 'Soil pH correction' },
  { id: 3, expert: 'Dr. Anitha M', type: 'video', duration: '20 min', date: '2025-03-28', topic: 'Bollworm treatment' },
];

export default function ContactPage() {
  const [tab, setTab] = useState('experts');
  const tabs = [{ id: 'experts', icon: '👨‍🔬', label: 'Talk to Expert' }, { id: 'history', icon: '📞', label: 'Call History' }, { id: 'support', icon: '💬', label: 'Support' }];

  return (
    <div className="animated">
      <div className="section-header">
        <div><div className="section-title">📞 Direct Contact & Expert Connect</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Voice call • Video consult • WhatsApp • SMS support</div></div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px', textDecoration: 'none' }}>💬 WhatsApp</a>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>📞 Helpline</button>
        </div>
      </div>

      {/* Quick Connect */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[{ label: 'Voice Call', icon: '📞', desc: 'Talk to agronomist', color: '#22c55e' }, { label: 'Video Consult', icon: '📹', desc: 'Face-to-face advice', color: '#3b82f6' }, { label: 'WhatsApp', icon: '💬', desc: 'Chat support', color: '#25D366' }, { label: 'SMS Alert', icon: '📱', desc: 'Get price alerts', color: '#f59e0b' }].map(c => (
          <div key={c.label} className="card" style={{ padding: '20px', textAlign: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; }} onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, color: c.color, fontSize: '0.9rem' }}>{c.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: tab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: tab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>{t.icon} {t.label}</button>)}
      </div>

      {tab === 'experts' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {EXPERTS.map(e => (
          <div key={e.id} className="card" style={{ padding: '20px', opacity: e.available ? 1 : 0.6 }}>
            <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>{e.photo}</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{e.name}</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.role} • {e.speciality}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 4 }}><span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.78rem' }}>⭐ {e.rating}</span><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.consultations} consultations</span></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>{e.languages.map(l => <span key={l} className="badge badge-info" style={{ fontSize: '0.6rem' }}>{l}</span>)}</div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} disabled={!e.available}>📞 Call</button>
              <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} disabled={!e.available}>📹 Video</button>
              <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.82rem' }}>💬</button>
            </div>
            {!e.available && <div style={{ fontSize: '0.72rem', color: '#ef4444', textAlign: 'center', marginTop: 6 }}>Currently unavailable</div>}
          </div>
        ))}
      </div>}

      {tab === 'history' && <div className="card" style={{ padding: '20px' }}>
        {RECENT.map(r => (
          <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.type === 'voice' ? '📞' : r.type === 'video' ? '📹' : '💬'}</div>
              <div><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.expert}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.topic} • {r.duration}</div></div>
            </div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.date}</div>
          </div>
        ))}
      </div>}

      {tab === 'support' && <div className="card" style={{ padding: '24px', maxWidth: 500 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>💬 Contact Support</div>
        {[{ l: 'Subject', t: 'text', p: 'e.g. Payment issue' }, { l: 'Category', t: 'select', o: ['General', 'Payment', 'Technical', 'Crops', 'Transport'] }, { l: 'Message', t: 'textarea', p: 'Describe your issue...' }].map(f =>
          <div key={f.l} style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{f.l}</label>{f.t === 'select' ? <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{f.o.map(o => <option key={o}>{o}</option>)}</select> : f.t === 'textarea' ? <textarea placeholder={f.p} rows={4} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'vertical' }} /> : <input type="text" placeholder={f.p} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />}</div>
        )}
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>📩 Submit Ticket</button>
      </div>}
    </div>
  );
}
