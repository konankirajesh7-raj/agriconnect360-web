import React, { useState, useMemo } from 'react';

const PRODUCTS = [
  { id: 1, name: 'Sona Masuri Rice (25kg)', farmer: 'Ravi Kumar', village: 'Mangalagiri', price: 1200, mrp: 1600, rating: 4.7, reviews: 142, organic: false, image: '🍚', category: 'Grains', inStock: true },
  { id: 2, name: 'Organic Turmeric Powder (500g)', farmer: 'Anitha Bai', village: 'Nizamabad', price: 280, mrp: 420, rating: 4.9, reviews: 89, organic: true, image: '🟡', category: 'Spices', inStock: true },
  { id: 3, name: 'Groundnut Oil (5L)', farmer: 'Suresh Reddy', village: 'Anantapur', price: 850, mrp: 1100, rating: 4.6, reviews: 67, organic: false, image: '🫗', category: 'Oils', inStock: true },
  { id: 4, name: 'Red Chilli Flakes (250g)', farmer: 'Krishna M.', village: 'Guntur', price: 150, mrp: 220, rating: 4.8, reviews: 198, organic: false, image: '🌶️', category: 'Spices', inStock: true },
  { id: 5, name: 'Organic Jaggery (1kg)', farmer: 'Venkat Rao', village: 'Vizag', price: 180, mrp: 280, rating: 4.5, reviews: 54, organic: true, image: '🧱', category: 'Sweeteners', inStock: true },
  { id: 6, name: 'Cold-Pressed Sunflower Oil (2L)', farmer: 'Padma K.', village: 'Bellary', price: 480, mrp: 650, rating: 4.4, reviews: 38, organic: true, image: '🌻', category: 'Oils', inStock: false },
  { id: 7, name: 'Hand-Pounded Rice (10kg)', farmer: 'Savitri D.', village: 'Krishna', price: 650, mrp: 850, rating: 4.7, reviews: 76, organic: true, image: '🌾', category: 'Grains', inStock: true },
  { id: 8, name: 'Fresh Moringa Powder (200g)', farmer: 'Ramesh N.', village: 'Kadapa', price: 220, mrp: 350, rating: 4.3, reviews: 29, organic: true, image: '🌿', category: 'Health', inStock: true },
];

const CATEGORIES = ['All', ...new Set(PRODUCTS.map(p => p.category))];

export default function F2CStorePage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [cart, setCart] = useState([]);

  const filtered = useMemo(() => PRODUCTS.filter(p => {
    return (category === 'All' || p.category === category) && p.name.toLowerCase().includes(query.toLowerCase()) && (!organicOnly || p.organic);
  }), [query, category, organicOnly]);

  const cartTotal = cart.reduce((s, id) => s + (PRODUCTS.find(p => p.id === id)?.price || 0), 0);
  function toggleCart(id) { setCart(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🛒 Farm-to-Consumer Store</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Buy directly from verified farmers — no middlemen</div>
        </div>
        {cart.length > 0 && (
          <div style={{ padding: '10px 18px', borderRadius: 12, background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.85rem', fontWeight: 700, color: '#34d399' }}>
            🛒 {cart.length} items • ₹{cartTotal.toLocaleString()}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 10, marginBottom: 10 }}>
          <input style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '9px 14px', outline: 'none', fontSize: '0.85rem' }} value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search products..." />
          <select style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '9px 10px', outline: 'none', fontSize: '0.82rem' }} value={category} onChange={e => setCategory(e.target.value)}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <label style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} style={{ accentColor: '#10b981' }} /> 🌿 Organic only
        </label>
      </div>

      {/* Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
        {filtered.map(p => {
          const discount = Math.round(((p.mrp - p.price) / p.mrp) * 100);
          const inCart = cart.includes(p.id);
          return (
            <div key={p.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ fontSize: '3rem', textAlign: 'center', padding: '24px 16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(59,130,246,0.06))' }}>{p.image}</div>
              <div style={{ padding: '16px 18px' }}>
                <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 8 }}>👨‍🌾 {p.farmer} • {p.village}</div>
                {p.organic && <span style={{ fontSize: '0.65rem', padding: '2px 10px', borderRadius: 999, background: 'rgba(16,185,129,0.12)', color: '#34d399', fontWeight: 600, marginBottom: 8, display: 'inline-block' }}>🌿 Organic</span>}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>₹{p.price}</span>
                  <span style={{ fontSize: '0.78rem', textDecoration: 'line-through', color: 'var(--text-muted)' }}>₹{p.mrp}</span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(245,158,11,0.12)', color: '#fbbf24', fontWeight: 600 }}>{discount}% off</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>⭐ {p.rating} ({p.reviews} reviews)</div>
                <button onClick={() => toggleCart(p.id)} disabled={!p.inStock} style={{
                  width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 10, fontWeight: 700, fontSize: '0.82rem', cursor: p.inStock ? 'pointer' : 'default',
                  border: inCart ? '1px solid rgba(16,185,129,0.3)' : 'none',
                  background: !p.inStock ? 'rgba(255,255,255,0.04)' : inCart ? 'transparent' : 'linear-gradient(135deg, #059669, #10b981)',
                  color: !p.inStock ? 'var(--text-muted)' : inCart ? '#34d399' : '#fff', transition: 'all 0.2s', opacity: p.inStock ? 1 : 0.5,
                }}>{!p.inStock ? '❌ Out of Stock' : inCart ? '✓ In Cart' : '🛒 Add to Cart'}</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
