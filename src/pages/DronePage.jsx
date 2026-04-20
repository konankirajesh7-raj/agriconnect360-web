import React, { useState } from 'react';

const REPORTS = [
  { id: 1, field: 'North Paddy Field', date: '2025-03-15', area: '5.2 acres', drone: 'DJI Agras T40', status: 'completed', ndvi: 0.72, health: 'Good', stress_zones: 1, recommendations: ['Apply nitrogen fertilizer in NW corner', 'Increase irrigation by 15%'], pest_detected: false },
  { id: 2, field: 'Cotton Plot B', date: '2025-03-10', area: '3.8 acres', drone: 'DJI Phantom 4', status: 'completed', ndvi: 0.45, health: 'Moderate', stress_zones: 3, recommendations: ['Treat bollworm in SE quadrant', 'Improve drainage in center'], pest_detected: true },
  { id: 3, field: 'Sugarcane East', date: '2025-02-28', area: '8.0 acres', drone: 'DJI Agras T40', status: 'completed', ndvi: 0.81, health: 'Excellent', stress_zones: 0, recommendations: ['Continue current management'], pest_detected: false },
  { id: 4, field: 'Wheat West', date: '2025-04-01', area: '4.5 acres', drone: 'DJI Mavic 3M', status: 'processing', ndvi: null, health: null, stress_zones: null, recommendations: [], pest_detected: false },
];

const SPRAY_LOGS = [
  { id: 1, date: '2025-03-16', field: 'North Paddy Field', chemical: 'Urea Solution 2%', area_covered: '5.0 acres', duration: '45 min', drone: 'DJI Agras T40', volume: '50L' },
  { id: 2, date: '2025-03-11', field: 'Cotton Plot B', chemical: 'Chlorpyrifos 20EC', area_covered: '3.8 acres', duration: '35 min', drone: 'DJI Agras T40', volume: '38L' },
];

const healthColor = h => h === 'Excellent' ? '#22c55e' : h === 'Good' ? '#3b82f6' : h === 'Moderate' ? '#f59e0b' : '#ef4444';

export default function DronePage() {
  const [tab, setTab] = useState('reports');
  const tabs = [{ id: 'reports', icon: '📊', label: 'Survey Reports' }, { id: 'spray', icon: '💨', label: 'Spray Logs' }, { id: 'book', icon: '📅', label: 'Book Survey' }];

  return (
    <div className="animated">
      <div className="section-header">
        <div><div className="section-title">🛸 Drone Reports & Spraying</div><div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>NDVI mapping • Pest detection • Precision spraying logs</div></div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ New Survey</button>
      </div>
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[{ label: 'Total Surveys', value: REPORTS.length, icon: '🛸', color: '#3b82f6' }, { label: 'Avg NDVI', value: (REPORTS.filter(r => r.ndvi).reduce((s, r) => s + r.ndvi, 0) / REPORTS.filter(r => r.ndvi).length).toFixed(2), icon: '🌿', color: '#22c55e' }, { label: 'Pest Alerts', value: REPORTS.filter(r => r.pest_detected).length, icon: '🐛', color: '#ef4444' }, { label: 'Spray Sessions', value: SPRAY_LOGS.length, icon: '💨', color: '#8b5cf6' }].map(s => (
          <div key={s.label} className="stat-card"><div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div><div className="stat-value" style={{ color: s.color }}>{s.value}</div><div className="stat-label">{s.label}</div></div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: tab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: tab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>{t.icon} {t.label}</button>)}
      </div>

      {tab === 'reports' && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {REPORTS.map(r => (
          <div key={r.id} className="card" style={{ padding: '20px', transition: 'transform 0.2s' }} onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }} onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div><div style={{ fontWeight: 700, fontSize: '0.95rem' }}>🛸 {r.field}</div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.date} • {r.area} • {r.drone}</div></div>
              <span className={`badge ${r.status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{r.status}</span>
            </div>
            {r.status === 'completed' && <>
              {/* NDVI Bar */}
              <div style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 4 }}><span style={{ color: 'var(--text-muted)' }}>NDVI Score</span><span style={{ fontWeight: 700, color: healthColor(r.health) }}>{r.ndvi}</span></div>
                <div style={{ height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${r.ndvi * 100}%`, background: `linear-gradient(90deg, #ef4444, #f59e0b, #22c55e)`, borderRadius: 4 }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <span style={{ background: healthColor(r.health) + '22', color: healthColor(r.health), padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>🌿 {r.health}</span>
                {r.stress_zones > 0 && <span className="badge badge-warning">⚠️ {r.stress_zones} stress zones</span>}
                {r.pest_detected && <span className="badge badge-error">🐛 Pest detected</span>}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <div style={{ fontWeight: 600, marginBottom: 4 }}>AI Recommendations:</div>
                {r.recommendations.map((rec, i) => <div key={i} style={{ paddingLeft: 12, marginBottom: 2 }}>• {rec}</div>)}
              </div>
            </>}
            {r.status === 'processing' && <div style={{ padding: '20px', textAlign: 'center', color: 'var(--text-muted)' }}><div style={{ fontSize: '2rem', marginBottom: 8 }}>⏳</div>Processing... Results in ~2 hours</div>}
          </div>
        ))}
      </div>}

      {tab === 'spray' && <div className="card"><div className="table-wrap"><table className="data-table"><thead><tr><th>Date</th><th>Field</th><th>Chemical</th><th>Area</th><th>Volume</th><th>Duration</th><th>Drone</th></tr></thead><tbody>
        {SPRAY_LOGS.map(s => <tr key={s.id}><td>{s.date}</td><td style={{ fontWeight: 600 }}>{s.field}</td><td>{s.chemical}</td><td>{s.area_covered}</td><td>{s.volume}</td><td>{s.duration}</td><td style={{ color: 'var(--text-muted)' }}>{s.drone}</td></tr>)}
      </tbody></table></div></div>}

      {tab === 'book' && <div className="card" style={{ padding: '24px', maxWidth: 500 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📅 Book Drone Survey</div>
        {[{ l: 'Field', t: 'select', o: ['North Paddy Field', 'Cotton Plot B', 'Sugarcane East', 'Wheat West'] }, { l: 'Survey Type', t: 'select', o: ['NDVI Health Map', 'Pest Detection', 'Spray Mission', 'Full Analysis'] }, { l: 'Preferred Date', t: 'date' }, { l: 'Special Instructions', t: 'text', p: 'Any specific areas to focus on...' }].map(f =>
          <div key={f.l} style={{ marginBottom: 14 }}><label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{f.l}</label>{f.t === 'select' ? <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>{f.o.map(o => <option key={o}>{o}</option>)}</select> : <input type={f.t === 'date' ? 'date' : 'text'} placeholder={f.p || ''} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', boxSizing: 'border-box' }} />}</div>
        )}
        <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }}>🛸 Book Survey — ₹2,500</button>
      </div>}
    </div>
  );
}
