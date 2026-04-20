import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_EQUIPMENT = [
  { id: 1, name: 'Tractor (45HP)', type: 'Tractor', brand: 'Mahindra 575', hourly_rate: 1200, per_acre: null, is_available: true, condition: 'excellent', location: 'Dharwad', owner: 'Rajesh K.', rating: 4.7, reviews: 23, availability: 'Tomorrow 9am-1pm', image: '🚜' },
  { id: 2, name: 'Power Sprayer', type: 'Spraying', brand: 'Honda GX35', hourly_rate: 450, per_acre: null, is_available: true, condition: 'good', location: 'Hubballi', owner: 'Suresh M.', rating: 4.5, reviews: 15, availability: 'Today 3pm-6pm', image: '💨' },
  { id: 3, name: 'Rotavator', type: 'Tillage', brand: 'Fieldking FKROT', hourly_rate: 900, per_acre: null, is_available: true, condition: 'good', location: 'Belgaum', owner: 'Anil P.', rating: 4.3, reviews: 8, availability: 'Saturday 10am-4pm', image: '⚙️' },
  { id: 4, name: 'Harvester (Custom)', type: 'Harvesting', brand: 'John Deere', hourly_rate: null, per_acre: 2800, is_available: true, condition: 'excellent', location: 'Solapur', owner: 'Vijay D.', rating: 4.9, reviews: 31, availability: 'Next week slots open', image: '🌾' },
  { id: 5, name: 'Seed Drill', type: 'Sowing', brand: 'National Agro', hourly_rate: 600, per_acre: null, is_available: false, condition: 'good', location: 'Gadag', owner: 'Ramesh B.', rating: 4.2, reviews: 6, availability: 'Booked until Friday', image: '🌱' },
  { id: 6, name: 'Thresher', type: 'Harvesting', brand: 'VST ST-1500', hourly_rate: 800, per_acre: null, is_available: true, condition: 'fair', location: 'Raichur', owner: 'Mohan S.', rating: 4.0, reviews: 12, availability: 'Available now', image: '🔄' },
];

const CATEGORIES = ['All', 'Tractor', 'Tillage', 'Spraying', 'Sowing', 'Harvesting'];

export default function EquipmentPage() {
  const [equipment, setEquipment] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');
  const [bookingId, setBookingId] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('agri_admin_token');
    axios.get('/api/v1/equipment?all=true', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setEquipment(r.data.equipment || r.data.data || MOCK_EQUIPMENT))
      .catch(() => setEquipment(MOCK_EQUIPMENT))
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'All' ? equipment : equipment.filter(e => e.type === filter);

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🚜 Machinery Sharing</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Equipment rental marketplace for tractors, sprayers, harvesters</div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {['Rental', 'Marketplace', 'Scheduling'].map(tab => (
            <button key={tab} className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>{tab}</button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Listed Equipment', value: equipment.length, icon: '🚜', color: '#3b82f6' },
          { label: 'Available Now', value: equipment.filter(e => e.is_available).length, icon: '✅', color: '#22c55e' },
          { label: 'Avg Hourly Rate', value: `₹${Math.round(equipment.filter(e => e.hourly_rate).reduce((s, e) => s + e.hourly_rate, 0) / equipment.filter(e => e.hourly_rate).length || 0)}`, icon: '💰', color: '#f59e0b' },
          { label: 'In Use', value: equipment.filter(e => !e.is_available).length, icon: '🔄', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setFilter(c)}
            className={`filter-btn${filter === c ? ' active' : ''}`}>{c}</button>
        ))}
      </div>

      {/* Equipment Cards — Marketplace Style */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {loading ? <div className="loading-state" style={{ gridColumn: '1/-1' }}>⟳ Loading equipment...</div> :
          filtered.map(e => (
            <div key={e.id} className="card" style={{ padding: '20px', opacity: e.is_available ? 1 : 0.7, position: 'relative', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; ev.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform = ''; ev.currentTarget.style.boxShadow = ''; }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ fontSize: '2rem', width: 48, height: 48, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{e.image}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{e.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{e.location} • {e.brand}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>₹</div>
                  <div style={{ fontWeight: 700, color: '#22c55e', fontSize: '1.05rem' }}>
                    {e.hourly_rate ? `₹${e.hourly_rate}/hr` : `₹${e.per_acre}/acre`}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                <span className={`badge ${e.is_available ? 'badge-green' : 'badge-amber'}`}>
                  {e.is_available ? '● Available' : '● In Use'}
                </span>
                <span className="badge badge-blue">{e.type}</span>
                <span className="badge" style={{ background: 'rgba(139,92,246,0.1)', color: '#8b5cf6' }}>{e.condition}</span>
              </div>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>
                📅 {e.availability} • ⭐ {e.rating} ({e.reviews} reviews) • 👤 {e.owner}
              </div>

              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }}
                  disabled={!e.is_available} onClick={() => setBookingId(e.id)}>
                  {bookingId === e.id ? '✓ Request Sent!' : 'Request Booking'}
                </button>
                <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>Negotiate</button>
              </div>
            </div>
          ))
        }
      </div>

      {/* Cross-module shortcuts */}
      <div className="card" style={{ marginTop: 24, padding: '16px 20px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>Cross-module shortcuts</div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>Jump to related tools to complete a full journey</div>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { icon: '📊', label: 'Price compare', path: '/market-prices' },
            { icon: '🧮', label: 'Cost engine', path: '/expenses' },
            { icon: '💰', label: 'Profit calculator', path: '/sales' },
          ].map(s => (
            <a key={s.label} href={s.path} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.78rem', textDecoration: 'none' }}>
              {s.icon} {s.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
