import React, { useState, useEffect, useCallback } from 'react';
import { farmersDB } from '../lib/supabase';
import { useSupabaseQuery, useSupabaseMutation } from '../lib/hooks/useSupabaseQuery';

const MOCK_FARMERS = [
  { id: 1, name: 'Ramaiah Gowda', mobile: '9876543210', district: 'Guntur', village: 'Tenali', is_verified: true, is_active: true, total_land_acres: 3.5 },
  { id: 2, name: 'Lakshmi Devi', mobile: '9988776655', district: 'Krishna', village: 'Vijayawada', is_verified: true, is_active: true, total_land_acres: 2.0 },
  { id: 3, name: 'Suresh Patil', mobile: '9123456789', district: 'Prakasam', village: 'Ongole', is_verified: false, is_active: true, total_land_acres: 1.5 },
  { id: 4, name: 'Kavitha Reddy', mobile: '9654321098', district: 'Kurnool', village: 'Nandyal', is_verified: true, is_active: true, total_land_acres: 5.0 },
  { id: 5, name: 'Venkatesh Naik', mobile: '9450123456', district: 'Anantapur', village: 'Dharmavaram', is_verified: false, is_active: false, total_land_acres: 2.5 },
  { id: 6, name: 'Anitha Kumari', mobile: '9321654789', district: 'Chittoor', village: 'Madanapalle', is_verified: true, is_active: true, total_land_acres: 4.0 },
  { id: 7, name: 'Basavaraj Reddy', mobile: '9789012345', district: 'East Godavari', village: 'Rajahmundry', is_verified: true, is_active: true, total_land_acres: 6.0 },
  { id: 8, name: 'Pushpa Bai', mobile: '9234567890', district: 'West Godavari', village: 'Eluru', is_verified: false, is_active: true, total_land_acres: 1.0 },
];

export default function FarmersPage() {
  const { data: farmers, loading, error, isLive, refetch } = useSupabaseQuery(
    'farmers',
    {
      select: '*',
      filters: [{ column: 'state', op: 'eq', value: 'Andhra Pradesh' }],
      orderBy: { column: 'created_at', ascending: false },
      limit: 200,
    },
    MOCK_FARMERS
  );

  const { insert, update, remove, loading: mutating } = useSupabaseMutation('farmers');
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newFarmer, setNewFarmer] = useState({ name: '', mobile: '', district: 'Guntur', village: '', total_land_acres: '' });

  const filtered = farmers.filter(f => {
    const q = search.toLowerCase();
    const matchSearch = !q || f.name?.toLowerCase().includes(q) || f.mobile?.includes(q) || f.district?.toLowerCase().includes(q);
    const matchFilter =
      filter === 'all' ? true :
      filter === 'verified' ? f.is_verified :
      filter === 'unverified' ? !f.is_verified :
      filter === 'inactive' ? !f.is_active : true;
    return matchSearch && matchFilter;
  });

  const stats = {
    total: farmers.length,
    verified: farmers.filter(f => f.is_verified).length,
    active: farmers.filter(f => f.is_active).length,
    totalLand: farmers.reduce((s, f) => s + (parseFloat(f.total_land_acres) || 0), 0),
  };

  const handleAddFarmer = async () => {
    if (!newFarmer.name || !newFarmer.mobile) return;
    const result = await insert({
      ...newFarmer,
      state: 'Andhra Pradesh',
      total_land_acres: parseFloat(newFarmer.total_land_acres) || 0,
      is_active: true,
      is_verified: false,
    });
    if (result.success) {
      setShowAddModal(false);
      setNewFarmer({ name: '', mobile: '', district: 'Guntur', village: '', total_land_acres: '' });
      refetch();
    }
  };

  const handleVerify = async (id) => {
    await update(id, { is_verified: true });
    refetch();
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--bg-primary)',
    color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">👨‍🌾 Farmers Management</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {isLive ? '🟢 Live from Supabase' : '🟡 Mock data (offline)'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Farmer</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Farmers', value: stats.total.toLocaleString(), icon: '👨‍🌾', color: '#3b82f6' },
          { label: 'Verified', value: stats.verified, icon: '✅', color: '#22c55e' },
          { label: 'Active', value: stats.active, icon: '🟢', color: '#f59e0b' },
          { label: 'Total Land', value: `${stats.totalLand.toFixed(1)} acres`, icon: '🌾', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className="stat-icon" style={{ color: s.color, fontSize: '1.6rem' }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: 16, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name, mobile, district..." className="search-input" style={{ flex: 1, minWidth: 240 }} />
        {['all', 'verified', 'unverified', 'inactive'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`filter-btn${filter === f ? ' active' : ''}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        {loading ? (
          <div className="loading-state">⟳ Loading farmers...</div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th><th>Mobile</th><th>District</th><th>Village</th>
                  <th>Land (acres)</th><th>Status</th><th>Verified</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(f => (
                  <tr key={f.id}>
                    <td><div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{f.name}</div></td>
                    <td style={{ fontFamily: 'monospace' }}>{f.mobile}</td>
                    <td>{f.district}</td>
                    <td style={{ color: 'var(--text-muted)' }}>{f.village || f.mandal || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{f.total_land_acres || '—'}</td>
                    <td><span className={`badge ${f.is_active ? 'badge-success' : 'badge-error'}`}>{f.is_active ? 'Active' : 'Inactive'}</span></td>
                    <td><span className={`badge ${f.is_verified ? 'badge-info' : 'badge-warning'}`}>{f.is_verified ? '✓ Verified' : 'Pending'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="action-btn">👁</button>
                        <button className="action-btn">✏️</button>
                        {!f.is_verified && <button className="action-btn" style={{ color: '#22c55e' }} onClick={() => handleVerify(f.id)}>✅</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-state">No farmers found</div>}
          </div>
        )}
      </div>
      <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: 8 }}>
        Showing {filtered.length} of {farmers.length} farmers
      </div>

      {/* Add Farmer Modal */}
      {showAddModal && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowAddModal(false)}>
          <div className="card" style={{ width: 440, padding: '28px', maxHeight: '80vh', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>👨‍🌾 Add New Farmer</div>
            {[
              { label: 'Full Name *', key: 'name', placeholder: 'e.g. Ramaiah Gowda' },
              { label: 'Mobile Number *', key: 'mobile', placeholder: '10-digit mobile', maxLength: 10 },
              { label: 'District', key: 'district', placeholder: 'e.g. Guntur' },
              { label: 'Village/Mandal', key: 'village', placeholder: 'e.g. Tenali' },
              { label: 'Total Land (acres)', key: 'total_land_acres', placeholder: 'e.g. 3.5', type: 'number' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{field.label}</label>
                <input
                  style={inputStyle} type={field.type || 'text'} placeholder={field.placeholder}
                  maxLength={field.maxLength} value={newFarmer[field.key]}
                  onChange={e => setNewFarmer(p => ({ ...p, [field.key]: e.target.value }))}
                />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleAddFarmer} disabled={mutating || !newFarmer.name} style={{ flex: 1 }}>
                {mutating ? '🔄 Saving...' : '✅ Save Farmer'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowAddModal(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
