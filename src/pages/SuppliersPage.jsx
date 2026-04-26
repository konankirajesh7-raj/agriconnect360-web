import React, { useState } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';

const CATS = ['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Irrigation', 'Storage'];
const CAT_ICONS = { Seeds: '🌱', Fertilizers: '🧪', Pesticides: '💊', Equipment: '🚜', Irrigation: '💧', Storage: '🏭' };
const CAT_COLORS = { Seeds: '#22c55e', Fertilizers: '#3b82f6', Pesticides: '#ef4444', Irrigation: '#06b6d4', Equipment: '#f59e0b', Storage: '#8b5cf6' };

const MOCK_SUPPLIERS = [
  { id: 1, name: 'Agro Seeds Ltd', owner_name: 'Ravi Kumar', mobile: '9876502001', category: 'Seeds', district: 'Mysuru', rating: 4.5, is_verified: true, is_active: true },
  { id: 2, name: 'AP Agri Suppliers', owner_name: 'Mohan Rao', mobile: '9876502002', category: 'Fertilizers', district: 'Vijayawada', rating: 4.2, is_verified: true, is_active: true },
  { id: 3, name: 'Crop Care Pesticides', owner_name: 'Sunil Patil', mobile: '9876502003', category: 'Pesticides', district: 'Dharwad', rating: 3.8, is_verified: false, is_active: true },
  { id: 4, name: 'Drip Plus Irrigation', owner_name: 'Anand Gowda', mobile: '9876502004', category: 'Irrigation', district: 'Vijayapura', rating: 4.7, is_verified: true, is_active: true },
  { id: 5, name: 'Farm Tools Hub', owner_name: 'Ganesh N', mobile: '9876502005', category: 'Equipment', district: 'Haveri', rating: 4.0, is_verified: true, is_active: false },
  { id: 6, name: 'GreenGrow Seeds', owner_name: 'Priya Devi', mobile: '9876502006', category: 'Seeds', district: 'Tumkur', rating: 4.6, is_verified: true, is_active: true },
];

// AgroStar-inspired product catalog
const MOCK_PRODUCTS = [
  { id: 1, name: 'BPT-5204 Paddy Seeds', supplier: 'Agro Seeds Ltd', category: 'Seeds', price: 180, unit: 'kg', stock: 'In Stock', discount: '10%', rating: 4.5, image: '🌾' },
  { id: 2, name: 'Urea (46-0-0)', supplier: 'AP Agri Suppliers', category: 'Fertilizers', price: 266, unit: '50kg bag', stock: 'In Stock', discount: null, rating: 4.3, image: '🧪' },
  { id: 3, name: 'DAP (18-46-0)', supplier: 'AP Agri Suppliers', category: 'Fertilizers', price: 1350, unit: '50kg bag', stock: 'Low Stock', discount: '5%', rating: 4.6, image: '🧪' },
  { id: 4, name: 'Imidacloprid 17.8% SL', supplier: 'Crop Care', category: 'Pesticides', price: 320, unit: '250ml', stock: 'In Stock', discount: '15%', rating: 4.1, image: '💊' },
  { id: 5, name: 'Neem Oil (Azadirachtin)', supplier: 'Crop Care', category: 'Pesticides', price: 450, unit: '1L', stock: 'In Stock', discount: null, rating: 4.4, image: '🌿' },
  { id: 6, name: 'Inline Drip Kit (1 acre)', supplier: 'Drip Plus', category: 'Irrigation', price: 12500, unit: 'kit', stock: 'In Stock', discount: '20%', rating: 4.8, image: '💧' },
  { id: 7, name: 'NHH-44 Cotton Seeds', supplier: 'GreenGrow Seeds', category: 'Seeds', price: 850, unit: 'packet (450g)', stock: 'In Stock', discount: null, rating: 4.7, image: '🌱' },
  { id: 8, name: 'Battery Sprayer 16L', supplier: 'Farm Tools Hub', category: 'Equipment', price: 3200, unit: 'unit', stock: 'In Stock', discount: '12%', rating: 4.2, image: '💨' },
];

export default function SuppliersPage() {
  const { data: suppliers, loading, isLive } = useSupabaseQuery('suppliers', { orderBy: { column: 'rating', ascending: false }, limit: 200 }, MOCK_SUPPLIERS);
  const [catFilter, setCatFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('store');
  const [cart, setCart] = useState([]);

  const filteredProducts = MOCK_PRODUCTS.filter(p => {
    const q = search.toLowerCase();
    return (catFilter === 'all' || p.category === catFilter) && (!q || p.name.toLowerCase().includes(q));
  });

  const filteredSuppliers = suppliers.filter(s => {
    const q = search.toLowerCase();
    return (catFilter === 'all' || s.category === catFilter) && (!q || s.name?.toLowerCase().includes(q) || s.district?.toLowerCase().includes(q));
  });

  const tabs = [
    { id: 'store', icon: '🛒', label: 'Input Store' },
    { id: 'directory', icon: '🏪', label: 'Suppliers' },
    { id: 'orders', icon: '📦', label: 'My Orders' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🏪 Input Store & Suppliers</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Buy seeds, fertilizers, pesticides at best prices — AgroStar inspired</div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {cart.length > 0 && (
            <span style={{ background: '#22c55e', color: '#fff', padding: '6px 14px', borderRadius: 20, fontSize: '0.78rem', fontWeight: 700 }}>🛒 {cart.length} items</span>
          )}
          <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Supplier</button>
        </div>
      </div>

      {/* Category Cards */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        {CATS.map(cat => {
          const count = catFilter === 'all' || cat === catFilter
            ? (activeTab === 'store' ? MOCK_PRODUCTS.filter(p => p.category === cat).length : suppliers.filter(s => s.category === cat).length)
            : 0;
          return (
            <div key={cat} onClick={() => setCatFilter(catFilter === cat ? 'all' : cat)}
              style={{
                background: catFilter === cat ? CAT_COLORS[cat] + '22' : 'var(--bg-card)',
                border: `1px solid ${catFilter === cat ? CAT_COLORS[cat] : 'var(--border)'}`,
                borderRadius: 'var(--radius-sm)', padding: '12px 16px', cursor: 'pointer',
                textAlign: 'center', minWidth: 100, transition: 'all 0.2s',
              }}>
              <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{CAT_ICONS[cat]}</div>
              <div style={{ fontWeight: 700, color: CAT_COLORS[cat] }}>{count}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{cat}</div>
            </div>
          );
        })}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="card" style={{ padding: '12px 16px', marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products or suppliers..."
          className="search-input" style={{ width: '100%' }} />
      </div>

      {activeTab === 'store' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
          {filteredProducts.map(p => (
            <div key={p.id} className="card" style={{ padding: '16px', transition: 'transform 0.2s' }}
              onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
              <div style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 8, background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '16px 0' }}>
                {p.image}
              </div>
              {p.discount && (
                <span style={{ position: 'relative', top: -4, background: '#ef4444', color: '#fff', padding: '2px 8px', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700 }}>{p.discount} OFF</span>
              )}
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 4, minHeight: 36 }}>{p.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 8 }}>{p.supplier} • {p.unit}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22c55e' }}>₹{p.price}</span>
                  {p.discount && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textDecoration: 'line-through', marginLeft: 6 }}>₹{Math.round(p.price * 1.15)}</span>}
                </div>
                <span style={{ fontSize: '0.7rem', color: '#f59e0b', fontWeight: 600 }}>⭐ {p.rating}</span>
              </div>
              <div style={{ fontSize: '0.68rem', color: p.stock === 'In Stock' ? '#22c55e' : '#f59e0b', fontWeight: 600, marginBottom: 10 }}>● {p.stock}</div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '7px', fontSize: '0.78rem' }}
                onClick={() => setCart([...cart, p.id])}>
                🛒 Add to Cart
              </button>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'directory' && (
        <div className="card">
          {loading ? <div className="loading-state">⟳ Loading suppliers...</div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Name</th><th>Owner</th><th>Mobile</th><th>Category</th><th>District</th><th>Rating</th><th>Verified</th><th>Status</th></tr></thead>
                <tbody>
                  {filteredSuppliers.map(s => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.owner_name}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{s.mobile}</td>
                      <td><span style={{ background: CAT_COLORS[s.category] + '22', color: CAT_COLORS[s.category], padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{s.category}</span></td>
                      <td>{s.district}</td>
                      <td><span style={{ color: '#f59e0b', fontWeight: 700 }}>★ {s.rating}</span></td>
                      <td><span className={`badge ${s.is_verified ? 'badge-info' : 'badge-warning'}`}>{s.is_verified ? '✓ Yes' : 'Pending'}</span></td>
                      <td><span className={`badge ${s.is_active ? 'badge-success' : 'badge-error'}`}>{s.is_active ? 'Active' : 'Inactive'}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📦</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No orders yet</div>
          <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Browse the Input Store and place your first order!</div>
        </div>
      )}
    </div>
  );
}
