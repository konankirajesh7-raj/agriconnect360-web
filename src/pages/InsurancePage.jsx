import React, { useState } from 'react';

const PRODUCTS = [
  { id: 1, name: 'PM Fasal Bima Yojana', provider: 'Govt of India', type: 'Crop', premium: '2% Kharif', coverage: '₹2L/ha', enrolled: true, icon: '🌾', color: '#22c55e', claim_status: null },
  { id: 2, name: 'Weather-based Insurance', provider: 'ICICI Lombard', type: 'Weather', premium: '₹1,200/season', coverage: '₹1.5L', enrolled: true, icon: '🌧️', color: '#3b82f6', claim_status: 'processing' },
  { id: 3, name: 'Livestock Insurance', provider: 'National Insurance', type: 'Livestock', premium: '₹800/yr', coverage: '₹80K/animal', enrolled: false, icon: '🐄', color: '#f59e0b', claim_status: null },
  { id: 4, name: 'Equipment Insurance', provider: 'New India Assurance', type: 'Equipment', premium: '₹2,500/yr', coverage: '₹5L', enrolled: false, icon: '🚜', color: '#8b5cf6', claim_status: null },
  { id: 5, name: 'Personal Accident', provider: 'LIC', type: 'Personal', premium: '₹12/yr', coverage: '₹2L', enrolled: true, icon: '🛡️', color: '#06b6d4', claim_status: null },
];

const CLAIMS = [
  { id: 1, policy: 'PMFBY — Kharif 2024', amount: 45000, status: 'approved', payout: 42000, date: '2024-11-20', reason: 'Flood damage' },
  { id: 2, policy: 'Weather Insurance', amount: 28000, status: 'processing', payout: null, date: '2025-01-10', reason: 'Unseasonal rain' },
  { id: 3, policy: 'PMFBY — Rabi 2023', amount: 32000, status: 'settled', payout: 30500, date: '2024-04-05', reason: 'Drought impact' },
];

const SC = { approved: '#22c55e', processing: '#f59e0b', settled: '#3b82f6', rejected: '#ef4444' };

export default function InsurancePage() {
  const [tab, setTab] = useState('products');
  const tabs = [{ id: 'products', icon: '🛡️', label: 'Products' }, { id: 'claims', icon: '📋', label: 'Claims' }, { id: 'calc', icon: '🧮', label: 'Calculator' }];

  return (
    <div className="animated">
      <div className="section-header">
        <div><div className="section-title">🛡️ Insurance Hub</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Crop insurance • Claim tracking • Premium calculator</div></div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ File Claim</button>
      </div>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[{ label: 'Active', value: PRODUCTS.filter(p => p.enrolled).length, icon: '🛡️', color: '#22c55e' }, { label: 'Available', value: PRODUCTS.filter(p => !p.enrolled).length, icon: '📋', color: '#3b82f6' }, { label: 'Claims', value: CLAIMS.length, icon: '📄', color: '#f59e0b' }, { label: 'Payout', value: `₹${(CLAIMS.filter(c => c.payout).reduce((s, c) => s + c.payout, 0) / 1000).toFixed(0)}K`, icon: '💰', color: '#8b5cf6' }].map(s => (
          <div key={s.label} className="stat-card"><div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: tab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: tab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>{t.icon} {t.label}</button>)}
      </div>
      {tab === 'products' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {PRODUCTS.map(p => <div key={p.id} className="card" style={{ padding: '20px', borderLeft: `3px solid ${p.color}` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}><span style={{ fontSize: '1.8rem' }}>{p.icon}</span>{p.enrolled ? <span className="badge badge-success">✓ Enrolled</span> : <span className="badge badge-info">Available</span>}</div>
          <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{p.name}</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>{p.provider} • {p.type}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 14 }}><span style={{ color: 'var(--text-muted)' }}>Premium: <strong style={{ color: '#f59e0b' }}>{p.premium}</strong></span><span style={{ color: 'var(--text-muted)' }}>Cover: <strong style={{ color: '#22c55e' }}>{p.coverage}</strong></span></div>
          {p.claim_status && <div style={{ padding: '6px 10px', background: 'rgba(245,158,11,0.08)', borderRadius: 'var(--radius-sm)', fontSize: '0.75rem', color: '#f59e0b', marginBottom: 10 }}>⏳ Claim: {p.claim_status}</div>}
          <button className={`btn ${p.enrolled ? 'btn-outline' : 'btn-primary'}`} style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}>{p.enrolled ? 'View Policy' : 'Enroll Now'}</button>
        </div>)}
      </div>}
      {tab === 'claims' && <div className="card"><div className="table-wrap"><table className="data-table"><thead><tr><th>ID</th><th>Policy</th><th>Reason</th><th>Amount</th><th>Status</th><th>Payout</th><th>Filed</th></tr></thead><tbody>
        {CLAIMS.map(c => <tr key={c.id}><td>#{c.id}</td><td style={{ fontWeight: 600 }}>{c.policy}</td><td style={{ color: 'var(--text-muted)' }}>{c.reason}</td><td style={{ fontWeight: 700 }}>₹{c.amount.toLocaleString()}</td><td><span style={{ background: (SC[c.status] || '#888') + '22', color: SC[c.status], padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>{c.status}</span></td><td style={{ fontWeight: 700, color: '#22c55e' }}>{c.payout ? `₹${c.payout.toLocaleString()}` : '—'}</td><td>{new Date(c.date).toLocaleDateString('en-IN')}</td></tr>)}
      </tbody></table></div></div>}
      {tab === 'calc' && <div className="card" style={{ padding: '24px', maxWidth: 500 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>🧮 Premium Calculator</div>
        {[{ l: 'Crop', t: 'select', o: ['Paddy', 'Cotton', 'Wheat', 'Sugarcane'] }, { l: 'Season', t: 'select', o: ['Kharif', 'Rabi'] }, { l: 'Area (ha)', t: 'number', p: '2' }, { l: 'Sum Insured/ha (₹)', t: 'number', p: '100000' }].map(f =>
          <div key={f.l} style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{f.l}</label>{f.t === 'select' ? <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{f.o.map(o => <option key={o}>{o}</option>)}</select> : <input type="number" placeholder={f.p} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />}</div>
        )}
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>Calculate</button>
        <div style={{ marginTop: 16, padding: '14px', background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-sm)', display: 'flex', justifyContent: 'space-between' }}>
          <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Premium</div><div style={{ fontWeight: 800, color: '#22c55e', fontSize: '1.2rem' }}>₹4,000</div></div>
          <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Coverage</div><div style={{ fontWeight: 700, color: '#3b82f6', fontSize: '1rem' }}>₹2,00,000</div></div>
        </div>
      </div>}
    </div>
  );
}
