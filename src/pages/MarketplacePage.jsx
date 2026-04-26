import React, { useState, useMemo } from 'react';

const LISTINGS = [
  { id: 1, crop: 'Paddy (Sona Masuri)', qty: 50, unit: 'Quintals', price: 2200, farmer: 'Ravi Kumar', village: 'Mangalagiri', district: 'Guntur', grade: 'A', organic: false, posted: '2026-04-20', image: '🌾' },
  { id: 2, crop: 'Cotton (MCU-5)', qty: 30, unit: 'Quintals', price: 7200, farmer: 'Lakshmi Devi', village: 'Adoni', district: 'Kurnool', grade: 'A', organic: false, posted: '2026-04-19', image: '🏵️' },
  { id: 3, crop: 'Red Chilli (Teja)', qty: 20, unit: 'Quintals', price: 14800, farmer: 'Suresh Reddy', village: 'Khammam', district: 'Guntur', grade: 'Premium', organic: false, posted: '2026-04-18', image: '🌶️' },
  { id: 4, crop: 'Groundnut (Bold)', qty: 40, unit: 'Quintals', price: 5900, farmer: 'Anitha Bai', village: 'Anantapur', district: 'Anantapur', grade: 'A', organic: true, posted: '2026-04-17', image: '🥜' },
  { id: 5, crop: 'Turmeric (Salem)', qty: 15, unit: 'Quintals', price: 9500, farmer: 'Venkat Rao', village: 'Nizamabad', district: 'Nizamabad', grade: 'A', organic: true, posted: '2026-04-16', image: '🟡' },
  { id: 6, crop: 'Maize (Hybrid)', qty: 60, unit: 'Quintals', price: 2100, farmer: 'Krishna Murthy', village: 'Karimnagar', district: 'Karimnagar', grade: 'B', organic: false, posted: '2026-04-15', image: '🌽' },
  { id: 7, crop: 'Bengal Gram', qty: 25, unit: 'Quintals', price: 5500, farmer: 'Savitri Devi', village: 'Kadapa', district: 'Kadapa', grade: 'A', organic: false, posted: '2026-04-14', image: '🫘' },
  { id: 8, crop: 'Onion (Bellary)', qty: 80, unit: 'Quintals', price: 1800, farmer: 'Ramesh Naik', village: 'Kurnool', district: 'Kurnool', grade: 'A', organic: false, posted: '2026-04-13', image: '🧅' },
  { id: 9, crop: 'Tomato', qty: 35, unit: 'Quintals', price: 2400, farmer: 'Padma Kumari', village: 'Madanapalle', district: 'Chittoor', grade: 'A', organic: true, posted: '2026-04-12', image: '🍅' },
  { id: 10, crop: 'Sunflower Seeds', qty: 20, unit: 'Quintals', price: 6400, farmer: 'Sita Devi', village: 'Bellary', district: 'Bellary', grade: 'B', organic: false, posted: '2026-04-11', image: '🌻' },
];

const DISTRICTS = ['All', ...new Set(LISTINGS.map(l => l.district))];

export default function MarketplacePage() {
  const [query, setQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [interested, setInterested] = useState([]);

  const filtered = useMemo(() => {
    let items = LISTINGS.filter(l => {
      const matchQ = l.crop.toLowerCase().includes(query.toLowerCase()) || l.farmer.toLowerCase().includes(query.toLowerCase());
      const matchD = districtFilter === 'All' || l.district === districtFilter;
      const matchO = !organicOnly || l.organic;
      return matchQ && matchD && matchO;
    });
    if (sortBy === 'price-low') items.sort((a, b) => a.price - b.price);
    if (sortBy === 'price-high') items.sort((a, b) => b.price - a.price);
    if (sortBy === 'qty') items.sort((a, b) => b.qty - a.qty);
    return items;
  }, [query, districtFilter, organicOnly, sortBy]);

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🏪 Farmer Marketplace</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Browse and list produce directly from farmers</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Listings</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{filtered.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Qty</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{filtered.reduce((s, l) => s + l.qty, 0)} Q</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Avg Price/Q</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>₹{Math.round(filtered.reduce((s, l) => s + l.price, 0) / (filtered.length || 1)).toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: 16, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 10, marginBottom: 10 }}>
          <input style={{ width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '9px 12px', outline: 'none', fontSize: '0.85rem' }} value={query} onChange={e => setQuery(e.target.value)} placeholder="🔍 Search crop or farmer..." />
          <select style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '9px 10px', outline: 'none', fontSize: '0.82rem' }} value={districtFilter} onChange={e => setDistrictFilter(e.target.value)}>
            {DISTRICTS.map(d => <option key={d}>{d}</option>)}
          </select>
          <select style={{ borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '9px 10px', outline: 'none', fontSize: '0.82rem' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
            <option value="newest">Newest</option>
            <option value="price-low">Price: Low → High</option>
            <option value="price-high">Price: High → Low</option>
            <option value="qty">Quantity</option>
          </select>
        </div>
        <label style={{ display: 'flex', gap: 8, fontSize: '0.82rem', color: 'var(--text-secondary)', alignItems: 'center', cursor: 'pointer' }}>
          <input type="checkbox" checked={organicOnly} onChange={e => setOrganicOnly(e.target.checked)} style={{ accentColor: '#10b981' }} /> 🌿 Organic only
        </label>
      </div>

      {/* Listing Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {filtered.map(l => {
          const done = interested.includes(l.id);
          return (
            <div key={l.id} className="card" style={{ padding: 18, transition: 'transform 0.2s, box-shadow 0.2s', cursor: 'default' }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <span style={{ fontSize: '2rem' }}>{l.image}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  {l.organic && <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: 999, background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 600 }}>🌿 Organic</span>}
                  <span style={{ fontSize: '0.65rem', padding: '3px 8px', borderRadius: 999, background: 'rgba(59,130,246,0.15)', color: '#93c5fd', fontWeight: 600 }}>Grade {l.grade}</span>
                </div>
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 2 }}>{l.crop}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>👨‍🌾 {l.farmer} • {l.village}, {l.district}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}><span>Quantity</span><b style={{ color: 'var(--text-primary)' }}>{l.qty} {l.unit}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}><span>Price</span><b style={{ color: '#10b981' }}>₹{l.price.toLocaleString()}/{l.unit.slice(0, -1)}</b></div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', color: 'var(--text-secondary)', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}><span>Posted</span><span>{l.posted}</span></div>
              <button
                onClick={() => setInterested(prev => prev.includes(l.id) ? prev.filter(x => x !== l.id) : [...prev, l.id])}
                style={{
                  width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 10, border: done ? '1px solid rgba(16,185,129,0.3)' : 'none',
                  background: done ? 'transparent' : 'linear-gradient(135deg, #059669, #10b981)', color: done ? '#34d399' : '#fff',
                  fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', transition: 'all 0.2s',
                }}>
                {done ? '✓ Interest Sent' : '🤝 Express Interest'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
