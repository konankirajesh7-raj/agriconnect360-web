import React, { useState } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';

const MOCK_LABOUR = [
  { id: 1, name: 'Mysuru Kisan Sangha', leader_name: 'Ramu Naik', mobile: '9876500001', district: 'Mysuru', total_workers: 45, rating: 4.5, is_active: true, specialties: ['Paddy harvesting', 'Weeding'], verified: true, daily_rate: 650, experience_years: 8 },
  { id: 2, name: 'Belagavi Workers Union', leader_name: 'Santosh Patil', mobile: '9876500002', district: 'Belagavi', total_workers: 62, rating: 4.2, is_active: true, specialties: ['Sugarcane cutting', 'Planting'], verified: true, daily_rate: 700, experience_years: 12 },
  { id: 3, name: 'Dharwad Labour Group', leader_name: 'Manjula Devi', mobile: '9876500003', district: 'Dharwad', total_workers: 30, rating: 4.7, is_active: true, specialties: ['Cotton picking'], verified: true, daily_rate: 600, experience_years: 5 },
  { id: 4, name: 'Hubli Farm Workers', leader_name: 'Venkatesh R.', mobile: '9876500004', district: 'Dharwad', total_workers: 18, rating: 4.0, is_active: true, specialties: ['General farming', 'Spraying'], verified: false, daily_rate: 550, experience_years: 3 },
];

const MOCK_BOOKINGS = [
  { id: 1, association_id: 1, farmer_id: 1, workers_count: 12, agreed_wage: 650, total_amount: 7800, status: 'active', start_date: '2024-12-20', escrow: true },
  { id: 2, association_id: 2, farmer_id: 4, workers_count: 25, agreed_wage: 700, total_amount: 17500, status: 'quoted', start_date: '2024-12-25', escrow: false },
  { id: 3, association_id: 3, farmer_id: 3, workers_count: 8, agreed_wage: 600, total_amount: 4800, status: 'completed', start_date: '2024-12-10', escrow: true },
];

export default function LabourPage() {
  const { data: associations, loading: loadingA } = useSupabaseQuery('labour_associations', { orderBy: { column: 'rating', ascending: false }, limit: 200 }, MOCK_LABOUR);
  const { data: bookings, loading: loadingB } = useSupabaseQuery('labour_bookings', { orderBy: { column: 'start_date', ascending: false }, limit: 200 }, MOCK_BOOKINGS);
  const loading = loadingA || loadingB;
  const [activeTab, setActiveTab] = useState('associations');

  const STATUS_COLOR = { active: 'badge-success', quoted: 'badge-warning', completed: 'badge-info', cancelled: 'badge-error' };

  const tabs = [
    { id: 'associations', icon: '🤝', label: 'Labour Groups' },
    { id: 'bookings', icon: '📋', label: 'Bookings' },
    { id: 'quick-request', icon: '⚡', label: 'Quick Request' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">👷 Labour Management</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Find verified workers • PaySure guaranteed payments • Track bookings</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Post Requirement</button>
      </div>

      {/* PaySure Trust Banner */}
      <div style={{ padding: '12px 20px', marginBottom: 20, borderRadius: 'var(--radius-sm)', background: 'linear-gradient(135deg, rgba(59,130,246,0.08), rgba(139,92,246,0.06))', border: '1px solid rgba(59,130,246,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: '1.2rem' }}>🔒</span>
          <div>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6' }}>PaySure Escrow Protection</span>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginLeft: 8 }}>Funds held safely until work is verified & completed</span>
          </div>
        </div>
        <span style={{ background: '#3b82f6', color: '#fff', padding: '4px 12px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 700 }}>GUARANTEED</span>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Associations', value: associations.length, icon: '🤝', color: '#3b82f6' },
          { label: 'Total Workers', value: associations.reduce((s, a) => s + a.total_workers, 0), icon: '👷', color: '#22c55e' },
          { label: 'Active Bookings', value: bookings.filter(b => b.status === 'active').length, icon: '✅', color: '#f59e0b' },
          { label: 'Pending Quotes', value: bookings.filter(b => b.status === 'quoted').length, icon: '📋', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600,
              background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
            }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {activeTab === 'associations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {loading ? <div className="loading-state" style={{ gridColumn: '1/-1' }}>⟳ Loading...</div> :
            associations.map(a => (
              <div key={a.id} className="card" style={{ padding: '20px', transition: 'transform 0.2s' }}
                onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{a.name}</span>
                      {a.verified && <span style={{ background: '#22c55e', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700 }}>✓ VERIFIED</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{a.district} • Led by {a.leader_name} • {a.experience_years} yrs exp</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22c55e' }}>₹{a.daily_rate}<span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/day</span></div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>per worker</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {a.specialties.map(s => (
                    <span key={s} className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{s}</span>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>⭐ <strong style={{ color: '#f59e0b' }}>{a.rating}</strong></span>
                  <span>👷 {a.total_workers} workers</span>
                  <span>📞 {a.mobile}</span>
                </div>

                {/* PaySure Badge */}
                <div style={{ padding: '8px 12px', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.15)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: '0.8rem' }}>🔒</span>
                  <span style={{ fontSize: '0.72rem', color: '#3b82f6', fontWeight: 600 }}>PaySure Protected</span>
                  <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>— Payment held in escrow until work verified</span>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}>Book Now</button>
                  <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>View Profile</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card">
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16, padding: '4px' }}>Active Bookings</div>
          {loading ? <div className="loading-state">⟳ Loading...</div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Farmer</th><th>Assoc.</th><th>Workers</th><th>Wage/Day</th><th>Total</th><th>Escrow</th><th>Status</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ color: 'var(--text-muted)' }}>#{b.id}</td>
                      <td>#{b.farmer_id}</td>
                      <td>#{b.association_id}</td>
                      <td style={{ textAlign: 'center' }}>{b.workers_count}</td>
                      <td>₹{b.agreed_wage}</td>
                      <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{b.total_amount?.toLocaleString()}</td>
                      <td>{b.escrow ? <span style={{ color: '#3b82f6', fontWeight: 600, fontSize: '0.78rem' }}>🔒 PaySure</span> : <span style={{ color: 'var(--text-muted)', fontSize: '0.78rem' }}>Direct</span>}</td>
                      <td><span className={`badge ${STATUS_COLOR[b.status] || 'badge-info'}`}>{b.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quick-request' && (
        <div className="card" style={{ padding: '24px', maxWidth: 600 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>⚡ Quick Labour Request</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>Post your requirement and get quotes from nearby labour groups</div>
          {[
            { label: 'Work Type', type: 'select', options: ['Harvesting', 'Planting', 'Weeding', 'Spraying', 'General'] },
            { label: 'Crop', type: 'select', options: ['Cotton', 'Paddy', 'Wheat', 'Sugarcane', 'Maize', 'Tomato'] },
            { label: 'Workers Needed', type: 'number', placeholder: 'e.g. 10' },
            { label: 'Start Date', type: 'date' },
            { label: 'Duration (days)', type: 'number', placeholder: 'e.g. 3' },
            { label: 'Budget per Worker/Day (₹)', type: 'number', placeholder: 'e.g. 650' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5, fontWeight: 500 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <input type="checkbox" defaultChecked id="escrow-check" />
            <label htmlFor="escrow-check" style={{ fontSize: '0.78rem', color: '#3b82f6', fontWeight: 600 }}>🔒 Enable PaySure Escrow Protection</label>
          </div>
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>🚀 Post Requirement & Get Quotes</button>
        </div>
      )}
    </div>
  );
}
