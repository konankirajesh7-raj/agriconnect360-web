import React, { useState } from 'react';

const EXPERIENCES = [
  { id: 1, title: 'Organic Rice Farm Stay', farmer: 'Ravi Kumar', village: 'Mangalagiri, Guntur', price: 1500, rating: 4.8, reviews: 45, duration: '1 Day', category: 'Farm Stay', image: '🌾', highlights: ['Organic paddy harvesting', 'Traditional cooking class', 'Bullock cart ride', 'Campfire dinner'], maxGuests: 8 },
  { id: 2, title: 'Cotton Farm Experience', farmer: 'Suresh Reddy', village: 'Adoni, Kurnool', price: 800, rating: 4.6, reviews: 23, duration: 'Half Day', category: 'Tour', image: '🏵️', highlights: ['Cotton picking demo', 'Ginning unit visit', 'Farmer lunch'], maxGuests: 15 },
  { id: 3, title: 'Mango Orchard Festival', farmer: 'Venkat Rao', village: 'Nunna, Krishna', price: 600, rating: 4.9, reviews: 87, duration: '4 Hours', category: 'Festival', image: '🥭', highlights: ['Pick your own mangoes', 'Mango tasting (10 varieties)', 'Farm-fresh juice'], maxGuests: 30 },
  { id: 4, title: 'Spice Plantation Walk', farmer: 'Anitha Bai', village: 'Araku Valley', price: 2000, rating: 4.7, reviews: 34, duration: '2 Days', category: 'Farm Stay', image: '🌿', highlights: ['Coffee plantation tour', 'Spice identification', 'Tribal village visit', 'Sunrise trek'], maxGuests: 6 },
  { id: 5, title: 'Dairy Farm Morning', farmer: 'Krishna M.', village: 'Tirupati, Chittoor', price: 400, rating: 4.5, reviews: 19, duration: '3 Hours', category: 'Tour', image: '🐄', highlights: ['Milking demonstration', 'Butter & ghee making', 'Calf feeding'], maxGuests: 12 },
  { id: 6, title: 'Aquaculture Adventure', farmer: 'Padma K.', village: 'Nellore', price: 900, rating: 4.4, reviews: 15, duration: 'Half Day', category: 'Tour', image: '🐟', highlights: ['Shrimp farm walkthrough', 'Fish feeding', 'Fresh seafood lunch'], maxGuests: 10 },
];

export default function AgriTourismPage() {
  const [booked, setBooked] = useState([]);
  const [filter, setFilter] = useState('All');
  const categories = ['All', 'Farm Stay', 'Tour', 'Festival'];
  const filtered = filter === 'All' ? EXPERIENCES : EXPERIENCES.filter(e => e.category === filter);

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🌿 AgriTourism</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Experience authentic farm life — support local farmers directly</div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="card" style={{ padding: 12, marginBottom: 16, display: 'flex', gap: 6 }}>
        {categories.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '7px 16px', borderRadius: 999, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            border: '1px solid', borderColor: filter === c ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)',
            background: filter === c ? 'rgba(16,185,129,0.15)' : 'transparent', color: filter === c ? '#34d399' : 'var(--text-secondary)',
          }}>{c}</button>
        ))}
      </div>

      {/* Experience Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
        {filtered.map(e => (
          <div key={e.id} className="card" style={{ padding: 0, overflow: 'hidden', transition: 'transform 0.2s, box-shadow 0.2s' }}
            onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-3px)'; ev.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.3)'; }}
            onMouseLeave={ev => { ev.currentTarget.style.transform = 'none'; ev.currentTarget.style.boxShadow = 'none'; }}>
            <div style={{ fontSize: '3rem', textAlign: 'center', padding: '28px 16px', background: 'linear-gradient(135deg, rgba(16,185,129,0.06), rgba(245,158,11,0.06))' }}>{e.image}</div>
            <div style={{ padding: '16px 18px' }}>
              <span style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 999, background: 'rgba(59,130,246,0.12)', color: '#93c5fd', fontWeight: 600, display: 'inline-block', marginBottom: 8 }}>{e.category}</span>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', marginBottom: 4, lineHeight: 1.3 }}>{e.title}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 10 }}>👨‍🌾 {e.farmer} • 📍 {e.village}</div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '5px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Duration</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.duration}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '5px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Max Guests</span><span style={{ fontWeight: 600 }}>{e.maxGuests}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '5px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Rating</span><span style={{ fontWeight: 600 }}>⭐ {e.rating} ({e.reviews})</span>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 10 }}>
                {e.highlights.map((h, i) => <span key={i} style={{ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'var(--text-secondary)' }}>{h}</span>)}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#10b981' }}>₹{e.price}<span style={{ fontSize: '0.72rem', fontWeight: 400, color: 'var(--text-muted)' }}>/person</span></span>
                <button onClick={() => setBooked(prev => prev.includes(e.id) ? prev.filter(x => x !== e.id) : [...prev, e.id])} style={{
                  padding: '9px 20px', borderRadius: 10, fontWeight: 700, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.2s',
                  border: booked.includes(e.id) ? '1px solid rgba(16,185,129,0.3)' : 'none',
                  background: booked.includes(e.id) ? 'transparent' : 'linear-gradient(135deg, #059669, #10b981)',
                  color: booked.includes(e.id) ? '#34d399' : '#fff',
                }}>{booked.includes(e.id) ? '✓ Booked' : '📅 Book Now'}</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
