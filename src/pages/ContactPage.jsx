import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

function openWhatsapp(message) {
  window.open(`https://wa.me/919876543210?text=${encodeURIComponent(message)}`, '_blank');
}

export default function ContactPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('experts');
  const [waCommand, setWaCommand] = useState('PRICE COTTON GUNTUR');
  const [broadcast, setBroadcast] = useState('Reminder: Scheme deadline in 3 days.');
  const [voiceName, setVoiceName] = useState('');
  const [photoName, setPhotoName] = useState('');
  const [waConversation, setWaConversation] = useState([{ from: 'bot', text: 'Namaste! Send PRICE, WEATHER, or SCHEME LIST.' }]);

  const tabs = [
    { id: 'experts', icon: '👨‍🔬', label: 'Talk to Expert' },
    { id: 'history', icon: '📞', label: 'Call History' },
    { id: 'whatsapp', icon: '💬', label: 'WhatsApp Bot' },
    { id: 'support', icon: '🛟', label: 'Support' },
  ];

  function sendWaCommand() {
    const cmd = waCommand.trim();
    if (!cmd) return;
    const lower = cmd.toLowerCase();
    let reply = 'Available commands: PRICE <crop> <district>, WEATHER <district>, SCHEME LIST';
    if (lower.startsWith('price')) reply = 'Price update: Cotton touched ₹7,180 in Guntur. Alert set.';
    if (lower.startsWith('weather')) reply = 'Weather alert: Moderate rain expected. Delay spray by 24 hours.';
    if (lower.includes('scheme')) reply = 'Schemes: PM-KISAN, PMFBY, KCC. Reply APPLY <scheme-name>.';
    setWaConversation((prev) => [...prev, { from: 'user', text: cmd }, { from: 'bot', text: reply }]);
    setWaCommand('');
  }

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">📞 Direct Contact & Expert Connect</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Voice call • Video consult • WhatsApp • SMS support</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <a href="https://wa.me/919876543210" target="_blank" rel="noopener noreferrer" className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px', textDecoration: 'none' }}>💬 WhatsApp</a>
          <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={() => navigate('/premium?tab=whatsapp')}>🤖 Bot Console</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 20 }}>
        {[
          { label: 'Voice Call', icon: '📞', desc: 'Talk to agronomist', color: '#22c55e' },
          { label: 'Video Consult', icon: '📹', desc: 'Face-to-face advice', color: '#3b82f6' },
          { label: 'WhatsApp', icon: '💬', desc: 'Chat support', color: '#25D366' },
          { label: 'SMS Alert', icon: '📱', desc: 'Get price alerts', color: '#f59e0b' },
        ].map((c) => (
          <div key={c.label} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', marginBottom: 8 }}>{c.icon}</div>
            <div style={{ fontWeight: 700, color: c.color, fontSize: '0.9rem' }}>{c.label}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>{c.desc}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: tab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: tab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {tab === 'experts' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {EXPERTS.map((e) => (
            <div key={e.id} className="card" style={{ padding: '20px', opacity: e.available ? 1 : 0.6 }}>
              <div style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>{e.photo}</div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{e.name}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{e.role} • {e.speciality}</div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}><span style={{ color: '#f59e0b', fontWeight: 600, fontSize: '0.78rem' }}>⭐ {e.rating}</span><span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{e.consultations} consultations</span></div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 4, marginBottom: 12 }}>{e.languages.map((l) => <span key={l} className="badge badge-info" style={{ fontSize: '0.6rem' }}>{l}</span>)}</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} disabled={!e.available}>📞 Call</button>
                <button className="btn btn-outline" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} disabled={!e.available}>📹 Video</button>
                <button className="btn btn-outline" style={{ padding: '8px 12px', fontSize: '0.82rem' }} onClick={() => openWhatsapp(`Connect me with ${e.name}`)}>💬</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'history' && (
        <div className="card" style={{ padding: '20px' }}>
          {RECENT.map((r) => (
            <div key={r.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{r.type === 'voice' ? '📞' : r.type === 'video' ? '📹' : '💬'}</div>
                <div><div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{r.expert}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.topic} • {r.duration}</div></div>
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{r.date}</div>
            </div>
          ))}
        </div>
      )}

      {tab === 'whatsapp' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10 }}>WhatsApp Business Bot</div>
            <div style={{ display: 'flex', gap: 6 }}>
              <input value={waCommand} onChange={(e) => setWaCommand(e.target.value)} placeholder="PRICE COTTON GUNTUR" style={{ flex: 1, padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <button className="btn btn-primary" style={{ padding: '8px 10px' }} onClick={sendWaCommand}>Send</button>
              <button className="btn btn-outline" style={{ padding: '8px 10px' }} onClick={() => openWhatsapp(waCommand || 'START')}>Open WA</button>
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {['PRICE COTTON GUNTUR', 'WEATHER KRISHNA', 'SCHEME LIST', 'START'].map((cmd) => (
                <button key={cmd} className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '6px 10px' }} onClick={() => setWaCommand(cmd)}>{cmd}</button>
              ))}
            </div>

            <div style={{ marginTop: 10, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: '0.72rem', marginBottom: 4 }}>Telugu voice note support</div>
                <input type="file" accept="audio/*" onChange={(e) => setVoiceName(e.target.files?.[0]?.name || '')} />
                {voiceName && <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{voiceName}</div>}
              </div>
              <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 10 }}>
                <div style={{ fontSize: '0.72rem', marginBottom: 4 }}>Photo disease detection support</div>
                <input type="file" accept="image/*" onChange={(e) => setPhotoName(e.target.files?.[0]?.name || '')} />
                {photoName && <div style={{ marginTop: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>{photoName}</div>}
              </div>
            </div>

            <div style={{ marginTop: 10 }}>
              <div style={{ fontSize: '0.76rem', marginBottom: 4 }}>Broadcast for scheme deadlines</div>
              <textarea rows={3} value={broadcast} onChange={(e) => setBroadcast(e.target.value)} style={{ width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }} />
              <button className="btn btn-outline" style={{ marginTop: 8, padding: '7px 10px', fontSize: '0.75rem' }} onClick={() => openWhatsapp(`BROADCAST\n${broadcast}`)}>
                📣 Send broadcast
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 18 }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 10 }}>Two-way AI advisor thread</div>
            <div style={{ maxHeight: 350, overflowY: 'auto', background: 'var(--bg-primary)', border: '1px solid var(--border)', borderRadius: 8, padding: 10 }}>
              {waConversation.map((m, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: m.from === 'user' ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
                  <div style={{ maxWidth: '82%', padding: '8px 10px', borderRadius: 8, background: m.from === 'user' ? 'rgba(59,130,246,0.2)' : 'rgba(34,197,94,0.14)', border: '1px solid var(--border)', fontSize: '0.78rem' }}>
                    {m.text}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'support' && (
        <div className="card" style={{ padding: '24px', maxWidth: 520 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>🛟 Contact Support</div>
          {[{ l: 'Subject', t: 'text', p: 'e.g. Payment issue' }, { l: 'Category', t: 'select', o: ['General', 'Payment', 'Technical', 'Crops', 'Transport'] }, { l: 'Message', t: 'textarea', p: 'Describe your issue...' }].map((f) => (
            <div key={f.l} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{f.l}</label>
              {f.t === 'select' ? (
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                  {f.o.map((o) => <option key={o}>{o}</option>)}
                </select>
              ) : f.t === 'textarea' ? (
                <textarea placeholder={f.p} rows={4} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box', resize: 'vertical' }} />
              ) : (
                <input type="text" placeholder={f.p} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>📩 Submit Ticket</button>
        </div>
      )}
    </div>
  );
}
