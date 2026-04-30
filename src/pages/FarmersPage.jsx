import React, { useState } from 'react';
import { farmersDB } from '../lib/supabase';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';
import { useAuth } from '../lib/hooks/useAuth';

const MOCK_FARMERS = [
  { id: 1, name: 'Ramaiah Gowda', mobile: '9876543210', district: 'Guntur', village: 'Tenali', is_verified: true, is_active: true, total_land_acres: 3.5, crops: 'Cotton, Paddy' },
  { id: 2, name: 'Lakshmi Devi', mobile: '9988776655', district: 'Krishna', village: 'Vijayawada', is_verified: true, is_active: true, total_land_acres: 2.0, crops: 'Paddy' },
  { id: 3, name: 'Suresh Patil', mobile: '9123456789', district: 'Prakasam', village: 'Ongole', is_verified: false, is_active: true, total_land_acres: 1.5, crops: 'Chilli' },
  { id: 4, name: 'Kavitha Reddy', mobile: '9654321098', district: 'Kurnool', village: 'Nandyal', is_verified: true, is_active: true, total_land_acres: 5.0, crops: 'Maize, Groundnut' },
  { id: 5, name: 'Venkatesh Naik', mobile: '9450123456', district: 'Anantapur', village: 'Dharmavaram', is_verified: false, is_active: false, total_land_acres: 2.5, crops: 'Groundnut' },
  { id: 6, name: 'Anitha Kumari', mobile: '9321654789', district: 'Chittoor', village: 'Madanapalle', is_verified: true, is_active: true, total_land_acres: 4.0, crops: 'Tomato, Mango' },
];

export default function FarmersPage() {
  const { isAdmin } = useAuth();
  const { data: farmers, loading, isLive } = useSupabaseQuery(
    'farmers',
    { select: '*', filters: [{ column: 'state', op: 'eq', value: 'Andhra Pradesh' }], orderBy: { column: 'created_at', ascending: false }, limit: 200 },
    MOCK_FARMERS
  );

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const filtered = farmers.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name?.toLowerCase().includes(q) || f.district?.toLowerCase().includes(q) || f.village?.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'nearby' ? true :
      filter === 'verified' ? f.is_verified : true;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: farmers.length,
    verified: farmers.filter(f => f.is_verified).length,
    nearby: farmers.filter(f => f.district === 'Guntur' || f.district === 'Krishna').length,
  };

  return (
    <div className="animated">
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          🤝 {isAdmin ? 'Farmers Management' : 'Farmer Directory'}
        </div>
        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>
          {isAdmin ? 'Manage registered farmers' : 'Browse & connect with farmers in your area'}
          {isLive && ' • 🟢 Live data'}
        </div>
      </div>

      {/* Quick Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 16 }}>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#3b82f6' }}>{stats.total}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Farmers</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22c55e' }}>{stats.verified}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Verified</div>
        </div>
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '12px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f59e0b' }}>{stats.nearby}</div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Near You</div>
        </div>
      </div>

      {/* Search + Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="🔍 Search farmer, district, village..."
          style={{ flex: 1, minWidth: 200, padding: '10px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: '0.85rem', outline: 'none' }} />
        {['all', 'verified', 'nearby'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{
              padding: '8px 14px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer',
              background: filter === f ? 'rgba(34,197,94,0.2)' : 'var(--bg-card)',
              border: `1px solid ${filter === f ? 'rgba(34,197,94,0.4)' : 'var(--border)'}`,
              color: filter === f ? '#22c55e' : 'var(--text-muted)',
            }}>
            {f === 'all' ? 'All' : f === 'verified' ? '✓ Verified' : '📍 Nearby'}
          </button>
        ))}
      </div>

      {/* Farmer Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>⟳ Loading...</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(f => (
            <div key={f.id} style={{
              background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12,
              padding: '14px', display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <div style={{
                width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', background: 'rgba(34,197,94,0.15)', border: '2px solid rgba(34,197,94,0.3)', flexShrink: 0,
              }}>
                👨‍🌾
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{f.name}</span>
                  {f.is_verified && <span style={{ fontSize: '0.65rem', padding: '1px 6px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', borderRadius: 4 }}>✓</span>}
                </div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>
                  📍 {f.village || '—'}, {f.district} • 🌾 {f.total_land_acres || '—'} acres
                </div>
                {f.crops && <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>🌱 {f.crops}</div>}
              </div>
              <button style={{
                padding: '6px 12px', borderRadius: 8, fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer',
                background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', color: '#60a5fa',
              }}>
                Connect
              </button>
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No farmers found</div>
          )}
        </div>
      )}
      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 10 }}>
        Showing {filtered.length} of {farmers.length} farmers
      </div>
    </div>
  );
}
