import React, { useState, useMemo } from 'react';

const INIT = [
  { id: 1, crop: 'Paddy (Sona Masuri)', qty: 50, unit: 'Quintals', price: 2200, farmer: 'Ravi Kumar', village: 'Mangalagiri', district: 'Guntur', grade: 'A', organic: false, posted: '2026-04-20', image: '🌾', status: 'active', views: 142, interested: 3, phone: '9000000002' },
  { id: 2, crop: 'Cotton (MCU-5)', qty: 30, unit: 'Quintals', price: 7200, farmer: 'Lakshmi Devi', village: 'Adoni', district: 'Kurnool', grade: 'A', organic: false, posted: '2026-04-19', image: '🏵️', status: 'active', views: 98, interested: 1, phone: '9000000003' },
  { id: 3, crop: 'Red Chilli (Teja)', qty: 20, unit: 'Quintals', price: 14800, farmer: 'Suresh Reddy', village: 'Khammam', district: 'Guntur', grade: 'Premium', organic: false, posted: '2026-04-18', image: '🌶️', status: 'active', views: 210, interested: 5, phone: '9000000004' },
  { id: 4, crop: 'Groundnut (Bold)', qty: 40, unit: 'Quintals', price: 5900, farmer: 'Anitha Bai', village: 'Anantapur', district: 'Anantapur', grade: 'A', organic: true, posted: '2026-04-17', image: '🥜', status: 'active', views: 76, interested: 2, phone: '9000000005' },
  { id: 5, crop: 'Turmeric (Salem)', qty: 15, unit: 'Quintals', price: 9500, farmer: 'Venkat Rao', village: 'Nizamabad', district: 'Nizamabad', grade: 'A', organic: true, posted: '2026-04-16', image: '🟡', status: 'active', views: 54, interested: 0, phone: '9000000006' },
  { id: 6, crop: 'Maize (Hybrid)', qty: 60, unit: 'Quintals', price: 2100, farmer: 'Krishna Murthy', village: 'Karimnagar', district: 'Karimnagar', grade: 'B', organic: false, posted: '2026-04-15', image: '🌽', status: 'active', views: 88, interested: 1, phone: '9000000007' },
  { id: 7, crop: 'Fresh Tomatoes', qty: 5, unit: 'Kg', price: 35, farmer: 'Padma K.', village: 'Madanapalle', district: 'Chittoor', grade: 'A', organic: true, posted: '2026-04-28', image: '🍅', status: 'active', views: 32, interested: 4, phone: '9000000008' },
  { id: 8, crop: 'Brinjal (Green)', qty: 3, unit: 'Kg', price: 25, farmer: 'Sita Devi', village: 'Tenali', district: 'Guntur', grade: 'A', organic: false, posted: '2026-04-27', image: '🍆', status: 'active', views: 18, interested: 2, phone: '9000000009' },
  { id: 9, crop: 'Drumstick (Moringa)', qty: 2, unit: 'Kg', price: 40, farmer: 'Ramesh B.', village: 'Ongole', district: 'Prakasam', grade: 'A', organic: true, posted: '2026-04-26', image: '🥒', status: 'active', views: 24, interested: 1, phone: '9000000010' },
  { id: 10, crop: 'Curry Leaves (Fresh)', qty: 1, unit: 'Kg', price: 80, farmer: 'Lakshmi A.', village: 'Narasaraopet', district: 'Guntur', grade: 'A', organic: true, posted: '2026-04-25', image: '🌿', status: 'active', views: 45, interested: 6, phone: '9000000011' },
  { id: 11, crop: 'Lady Finger (Bhindi)', qty: 4, unit: 'Kg', price: 30, farmer: 'Venkata P.', village: 'Vijayawada', district: 'Krishna', grade: 'A', organic: false, posted: '2026-04-24', image: '🥬', status: 'active', views: 22, interested: 3, phone: '9000000012' },
];

const DISTRICTS = ['All', ...new Set(INIT.map(l => l.district))];
const inp = { width:'100%', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(8,12,20,0.65)', color:'var(--text-primary)', padding:'9px 12px', outline:'none', fontSize:'0.85rem' };
const sel = { ...inp, cursor:'pointer' };
const pill = (a) => ({ padding:'7px 16px', borderRadius:999, border:'none', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', background: a?'var(--green-primary)':'rgba(255,255,255,0.06)', color: a?'#fff':'var(--text-muted)', transition:'all 0.15s' });

export default function MarketplacePage() {
  const [listings, setListings] = useState(INIT);
  const [query, setQuery] = useState('');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [myInterests, setMyInterests] = useState([]);
  const [tab, setTab] = useState('browse'); // browse | my | create | detail
  const [detailId, setDetailId] = useState(null);
  const [toast, setToast] = useState('');
  // Create form
  const [fc, setFc] = useState({ crop:'Paddy BPT-5204', qty:'15', price:'2100', grade:'A', organic:false, village:'Narasaraopet', district:'Guntur', phone:'9000000001' });

  const flash = m => { setToast(m); setTimeout(()=>setToast(''),2500); };

  const filtered = useMemo(() => {
    let items = listings.filter(l => l.status === 'active');
    if (query) items = items.filter(l => l.crop.toLowerCase().includes(query.toLowerCase()) || l.farmer.toLowerCase().includes(query.toLowerCase()));
    if (districtFilter !== 'All') items = items.filter(l => l.district === districtFilter);
    if (organicOnly) items = items.filter(l => l.organic);
    if (sortBy === 'price-low') items.sort((a,b) => a.price - b.price);
    if (sortBy === 'price-high') items.sort((a,b) => b.price - a.price);
    if (sortBy === 'qty') items.sort((a,b) => b.qty - a.qty);
    return items;
  }, [listings, query, districtFilter, organicOnly, sortBy]);

  const myListings = listings.filter(l => l.farmer === 'You');

  function createListing() {
    if (!fc.crop || !fc.qty || !fc.price) return;
    const nl = { id: Date.now(), crop: fc.crop, qty: +fc.qty, unit: 'Quintals', price: +fc.price, farmer: 'You', village: fc.village, district: fc.district, grade: fc.grade, organic: fc.organic, posted: new Date().toISOString().slice(0,10), image: '🌾', status: 'active', views: 0, interested: 0, phone: fc.phone };
    setListings(p => [nl, ...p]);
    setTab('my');
    flash('✅ Listing published! Visible to all buyers.');
  }

  function markSold(id) { setListings(p => p.map(l => l.id===id ? {...l, status:'sold'} : l)); flash('✅ Marked as sold. Moved to history.'); }
  function renewListing(id) { setListings(p => p.map(l => l.id===id ? {...l, posted: new Date().toISOString().slice(0,10)} : l)); flash('🔄 Listing renewed for 30 days.'); }
  function expressInterest(id) { setMyInterests(p => [...p, id]); setListings(p => p.map(l => l.id===id ? {...l, interested: l.interested+1} : l)); flash('🤝 Interest sent! Seller notified via SMS.'); }

  const detail = listings.find(l => l.id === detailId);

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🏪 Farmer Marketplace</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>Buy & sell produce directly — farmer to farmer, farmer to consumer</div>
        </div>
        <button onClick={()=>setTab('create')} style={{ padding:'10px 20px', borderRadius:10, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>+ List Produce</button>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[['browse','🏪 Browse'],['my','📋 My Listings'],['create','➕ Create']].map(([k,l])=>
          <button key={k} onClick={()=>{setTab(k);setDetailId(null);}} style={pill(tab===k)}>{l}</button>
        )}
      </div>

      {/* === CREATE TAB === */}
      {tab === 'create' && (
        <div className="card" style={{ padding:24, maxWidth:600 }}>
          <div style={{ fontWeight:700, fontSize:'1.1rem', marginBottom:18 }}>📝 List Your Produce</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Crop *</label><input style={inp} value={fc.crop} onChange={e=>setFc({...fc, crop:e.target.value})} /></div>
            <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Quantity (Quintals) *</label><input style={inp} type="number" value={fc.qty} onChange={e=>setFc({...fc, qty:e.target.value})} /></div>
            <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Price ₹/Quintal *</label><input style={inp} type="number" value={fc.price} onChange={e=>setFc({...fc, price:e.target.value})} /></div>
            <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Grade</label><select style={sel} value={fc.grade} onChange={e=>setFc({...fc, grade:e.target.value})}><option>A</option><option>B</option><option>Premium</option></select></div>
            <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Village</label><input style={inp} value={fc.village} onChange={e=>setFc({...fc, village:e.target.value})} /></div>
            <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>District</label><input style={inp} value={fc.district} onChange={e=>setFc({...fc, district:e.target.value})} /></div>
            <div><label style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>WhatsApp</label><input style={inp} value={fc.phone} onChange={e=>setFc({...fc, phone:e.target.value})} /></div>
            <div style={{ display:'flex', alignItems:'flex-end', paddingBottom:6 }}><label style={{ display:'flex', gap:8, fontSize:'0.82rem', color:'var(--text-secondary)', cursor:'pointer' }}><input type="checkbox" checked={fc.organic} onChange={e=>setFc({...fc, organic:e.target.checked})} style={{ accentColor:'#10b981' }} />🌿 Organic</label></div>
          </div>
          <button onClick={createListing} style={{ marginTop:18, padding:'12px 32px', borderRadius:10, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>🚀 List Now</button>
        </div>
      )}

      {/* === MY LISTINGS TAB === */}
      {tab === 'my' && (
        <div>
          {myListings.length === 0 && <div className="card" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>No listings yet. Create one!</div>}
          {myListings.map(l => (
            <div key={l.id} className="card" style={{ padding:18, marginBottom:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <span style={{ fontSize:'1.8rem' }}>{l.image}</span>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.95rem' }}>{l.crop}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{l.village}, {l.district} • Listed {l.posted}</div>
                  </div>
                </div>
                <span style={{ fontSize:'0.7rem', padding:'4px 10px', borderRadius:999, fontWeight:600, background: l.status==='active'?'rgba(16,185,129,0.15)':'rgba(245,158,11,0.15)', color: l.status==='active'?'#34d399':'#fbbf24' }}>{l.status==='active'?'🟢 Active':'📦 Sold'}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:12 }}>
                <div style={{ textAlign:'center', padding:8, borderRadius:8, background:'rgba(255,255,255,0.03)' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Qty</div><div style={{ fontWeight:700, fontSize:'0.9rem' }}>{l.qty} Q</div></div>
                <div style={{ textAlign:'center', padding:8, borderRadius:8, background:'rgba(255,255,255,0.03)' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Price</div><div style={{ fontWeight:700, fontSize:'0.9rem', color:'#10b981' }}>₹{l.price.toLocaleString()}</div></div>
                <div style={{ textAlign:'center', padding:8, borderRadius:8, background:'rgba(255,255,255,0.03)' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Views</div><div style={{ fontWeight:700, fontSize:'0.9rem' }}>{l.views}</div></div>
                <div style={{ textAlign:'center', padding:8, borderRadius:8, background:'rgba(255,255,255,0.03)' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Interested</div><div style={{ fontWeight:700, fontSize:'0.9rem', color:'#f59e0b' }}>{l.interested}</div></div>
              </div>
              {l.status === 'active' && (
                <div style={{ display:'flex', gap:8 }}>
                  <button onClick={()=>markSold(l.id)} style={{ padding:'8px 16px', borderRadius:8, background:'rgba(245,158,11,0.15)', color:'#fbbf24', border:'none', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>📦 Mark as Sold</button>
                  <button onClick={()=>renewListing(l.id)} style={{ padding:'8px 16px', borderRadius:8, background:'rgba(59,130,246,0.15)', color:'#93c5fd', border:'none', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>🔄 Renew (30 days)</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* === DETAIL VIEW === */}
      {tab === 'browse' && detail && (
        <div className="card" style={{ padding:24, marginBottom:16 }}>
          <button onClick={()=>setDetailId(null)} style={{ background:'none', border:'none', color:'var(--text-muted)', cursor:'pointer', fontSize:'0.82rem', marginBottom:12 }}>← Back to listings</button>
          <div style={{ display:'flex', gap:20, flexWrap:'wrap' }}>
            <div style={{ fontSize:'4rem', width:100, height:100, display:'flex', alignItems:'center', justifyContent:'center', background:'rgba(255,255,255,0.04)', borderRadius:16 }}>{detail.image}</div>
            <div style={{ flex:1, minWidth:200 }}>
              <div style={{ fontWeight:800, fontSize:'1.3rem', marginBottom:4 }}>{detail.crop}</div>
              <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:12 }}>👨‍🌾 {detail.farmer} • 📍 {detail.village}, {detail.district}</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10, marginBottom:16 }}>
                <div style={{ padding:10, borderRadius:8, background:'rgba(16,185,129,0.08)' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Price</div><div style={{ fontWeight:700, color:'#10b981' }}>₹{detail.price.toLocaleString()}/Q</div></div>
                <div style={{ padding:10, borderRadius:8, background:'rgba(59,130,246,0.08)' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Quantity</div><div style={{ fontWeight:700 }}>{detail.qty} Quintals</div></div>
                <div style={{ padding:10, borderRadius:8, background:'rgba(245,158,11,0.08)' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Grade</div><div style={{ fontWeight:700 }}>{detail.grade} {detail.organic?'🌿 Organic':''}</div></div>
              </div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:12 }}>📅 APMC Comparison: Modal ₹{(detail.price - 100).toLocaleString()} | Your price ₹{detail.price.toLocaleString()} (+₹100 premium)</div>
              <div style={{ display:'flex', gap:8 }}>
                {!myInterests.includes(detail.id) ? <button onClick={()=>expressInterest(detail.id)} style={{ padding:'10px 24px', borderRadius:10, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontWeight:700, cursor:'pointer' }}>🤝 Express Interest</button>
                : <span style={{ color:'#34d399', fontWeight:600, fontSize:'0.85rem' }}>✓ Interest Sent</span>}
                <a href={`https://wa.me/91${detail.phone}?text=Hi, interested in your ${detail.crop} listing on RythuSphere`} target="_blank" rel="noreferrer" style={{ padding:'10px 24px', borderRadius:10, background:'rgba(37,211,102,0.15)', color:'#25d366', border:'none', fontWeight:700, cursor:'pointer', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>💬 WhatsApp Seller</a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* === BROWSE TAB === */}
      {tab === 'browse' && !detail && (<>
        {/* Filters */}
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'2fr 1fr 1fr', gap:10, marginBottom:10 }}>
            <input style={inp} value={query} onChange={e=>setQuery(e.target.value)} placeholder="🔍 Search crop or farmer..." />
            <select style={sel} value={districtFilter} onChange={e=>setDistrictFilter(e.target.value)}>{DISTRICTS.map(d=><option key={d}>{d}</option>)}</select>
            <select style={sel} value={sortBy} onChange={e=>setSortBy(e.target.value)}>
              <option value="newest">Newest</option><option value="price-low">Price: Low → High</option><option value="price-high">Price: High → Low</option><option value="qty">Quantity</option>
            </select>
          </div>
          <label style={{ display:'flex', gap:8, fontSize:'0.82rem', color:'var(--text-secondary)', alignItems:'center', cursor:'pointer' }}>
            <input type="checkbox" checked={organicOnly} onChange={e=>setOrganicOnly(e.target.checked)} style={{ accentColor:'#10b981' }} /> 🌿 Organic only
          </label>
        </div>

        {/* Stats */}
        <div className="card" style={{ padding:16, marginBottom:16 }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            <div style={{ textAlign:'center', padding:12, borderRadius:12, background:'rgba(59,130,246,0.08)' }}><div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Active Listings</div><div style={{ fontSize:'1.3rem', fontWeight:800, color:'#60a5fa' }}>{filtered.length}</div></div>
            <div style={{ textAlign:'center', padding:12, borderRadius:12, background:'rgba(16,185,129,0.08)' }}><div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Total Qty</div><div style={{ fontSize:'1.3rem', fontWeight:800, color:'#34d399' }}>{filtered.reduce((s,l)=>s+l.qty,0)} Q</div></div>
            <div style={{ textAlign:'center', padding:12, borderRadius:12, background:'rgba(245,158,11,0.08)' }}><div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Avg Price</div><div style={{ fontSize:'1.3rem', fontWeight:800, color:'#fbbf24' }}>₹{Math.round(filtered.reduce((s,l)=>s+l.price,0)/(filtered.length||1)).toLocaleString()}</div></div>
          </div>
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:14 }}>
          {filtered.map(l => (
            <div key={l.id} className="card" style={{ padding:18, cursor:'pointer', transition:'transform 0.2s' }}
              onClick={()=>setDetailId(l.id)}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';}} onMouseLeave={e=>{e.currentTarget.style.transform='none';}}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:'2rem' }}>{l.image}</span>
                <div style={{ display:'flex', gap:4 }}>
                  {l.organic && <span style={{ fontSize:'0.65rem', padding:'3px 8px', borderRadius:999, background:'rgba(16,185,129,0.15)', color:'#34d399', fontWeight:600 }}>🌿 Organic</span>}
                  <span style={{ fontSize:'0.65rem', padding:'3px 8px', borderRadius:999, background:'rgba(59,130,246,0.15)', color:'#93c5fd', fontWeight:600 }}>Grade {l.grade}</span>
                </div>
              </div>
              <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:2 }}>{l.crop}</div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:10 }}>👨‍🌾 {l.farmer} • {l.village}, {l.district}</div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'var(--text-secondary)', padding:'6px 0', borderTop:'1px solid rgba(255,255,255,0.06)' }}><span>Qty</span><b>{l.qty} {l.unit}</b></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', color:'var(--text-secondary)', padding:'6px 0', borderTop:'1px solid rgba(255,255,255,0.06)' }}><span>Price</span><b style={{ color:'#10b981' }}>₹{l.price.toLocaleString()}/{l.unit==='Kg'?'Kg':'Q'}</b></div>
              <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.72rem', color:'var(--text-muted)', padding:'6px 0' }}><span>👁 {l.views} views</span><span>🤝 {l.interested} interested</span></div>
              <button onClick={e=>{e.stopPropagation(); if(!myInterests.includes(l.id)) expressInterest(l.id);}}
                style={{ width:'100%', marginTop:8, padding:'10px 0', borderRadius:10, border: myInterests.includes(l.id)?'1px solid rgba(16,185,129,0.3)':'none', background: myInterests.includes(l.id)?'transparent':'linear-gradient(135deg,#059669,#10b981)', color: myInterests.includes(l.id)?'#34d399':'#fff', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>
                {myInterests.includes(l.id) ? '✓ Interest Sent' : '🤝 Express Interest'}
              </button>
            </div>
          ))}
        </div>
      </>)}

      {toast && <div style={{ position:'fixed', bottom:24, right:24, background:'linear-gradient(135deg,#1e293b,#0f172a)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:14, padding:'14px 24px', color:'#4ade80', fontWeight:600, zIndex:9999, boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>{toast}</div>}
    </div>
  );
}
