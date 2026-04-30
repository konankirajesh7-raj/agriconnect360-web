import React, { useState, useEffect } from 'react';

const AP_DISTRICTS = ['All Locations','Guntur','Krishna','Anantapur','Chittoor','Kurnool','Prakasam','Nellore','East Godavari','West Godavari','Visakhapatnam','Vizianagaram','Srikakulam','Kadapa'];
const DISTRICT_COORDS = [
  { n:'Guntur', lat:16.3067, lon:80.4365 }, { n:'Krishna', lat:16.5062, lon:80.6480 },
  { n:'Anantapur', lat:14.6819, lon:77.6006 }, { n:'Chittoor', lat:13.2172, lon:79.1003 },
  { n:'Kurnool', lat:15.8281, lon:78.0373 }, { n:'Prakasam', lat:15.5057, lon:80.0499 },
  { n:'Nellore', lat:14.4426, lon:79.9865 }, { n:'East Godavari', lat:17.0005, lon:81.8040 },
  { n:'West Godavari', lat:16.9174, lon:81.3399 }, { n:'Visakhapatnam', lat:17.6868, lon:83.2185 },
  { n:'Vizianagaram', lat:18.1067, lon:83.3956 }, { n:'Srikakulam', lat:18.2949, lon:83.8935 },
  { n:'Kadapa', lat:14.4674, lon:78.8241 },
];

const ORDERS = [
  { id:'ORD-001', product:'BPT-5204 Rice', seller:'Ramesh Naidu', sellerRole:'farmer', qty:'25 Kg', price:1250, status:'delivered', date:'2026-04-22', district:'Guntur' },
  { id:'ORD-002', product:'Organic Tomatoes', seller:'Lakshmi Devi', sellerRole:'farmer', qty:'10 Kg', price:400, status:'in_transit', date:'2026-04-26', district:'Chittoor' },
  { id:'ORD-003', product:'Groundnut Oil', seller:'Anantapur Agri Center', sellerRole:'supplier', qty:'5 L', price:750, status:'confirmed', date:'2026-04-28', district:'Anantapur' },
  { id:'ORD-004', product:'Fresh Mangoes (Banganapalli)', seller:'Chittoor Fruits Broker', sellerRole:'broker', qty:'20 Kg', price:1200, status:'pending', date:'2026-04-30', district:'Chittoor' },
];

const NEARBY_PRODUCTS = [
  { id:1, name:'Fresh Paddy Rice (BPT)', seller:'Venkat Rao', district:'Guntur', price:'₹50/Kg', rating:4.8, type:'Grain', icon:'🌾' },
  { id:2, name:'Organic Tomatoes', seller:'Lakshmi Devi', district:'Chittoor', price:'₹40/Kg', rating:4.7, type:'Vegetable', icon:'🍅' },
  { id:3, name:'Banganapalli Mangoes', seller:'Raju Farms', district:'Chittoor', price:'₹60/Kg', rating:4.9, type:'Fruit', icon:'🥭' },
  { id:4, name:'Pure Groundnut Oil', seller:'Anantapur Oil Mill', district:'Anantapur', price:'₹150/L', rating:4.6, type:'Oil', icon:'🫒' },
  { id:5, name:'Fresh Chilli (Teja)', seller:'Prakasam Farmers Co-op', district:'Prakasam', price:'₹120/Kg', rating:4.5, type:'Spice', icon:'🌶️' },
  { id:6, name:'Cotton Honey', seller:'Krishna Bee Farms', district:'Krishna', price:'₹350/500g', rating:4.8, type:'Natural', icon:'🍯' },
  { id:7, name:'Drumstick (Moringa)', seller:'Guntur Veggies', district:'Guntur', price:'₹30/Kg', rating:4.4, type:'Vegetable', icon:'🥦' },
  { id:8, name:'Sugarcane Jaggery', seller:'Nandyal Sweet Mills', district:'Kurnool', price:'₹80/Kg', rating:4.7, type:'Natural', icon:'🧊' },
  { id:9, name:'Fresh Fish (Rohu)', seller:'East Godavari Fisheries', district:'East Godavari', price:'₹220/Kg', rating:4.6, type:'Seafood', icon:'🐟' },
  { id:10, name:'Turmeric Powder', seller:'Nizamabad Spices', district:'Kadapa', price:'₹180/Kg', rating:4.5, type:'Spice', icon:'🟡' },
];

const PRICE_TRENDS = [
  { crop:'Rice (BPT)', current:'₹2,100/Q', change:'+2.3%', up:true },
  { crop:'Tomato', current:'₹40/Kg', change:'-5.1%', up:false },
  { crop:'Groundnut', current:'₹5,800/Q', change:'+1.8%', up:true },
  { crop:'Cotton', current:'₹6,200/Q', change:'+3.2%', up:true },
  { crop:'Chilli (Teja)', current:'₹12,000/Q', change:'-2.4%', up:false },
  { crop:'Mango', current:'₹60/Kg', change:'+8.1%', up:true },
];

const ST = {
  delivered: { bg:'rgba(34,197,94,0.1)', c:'#22c55e', t:'✅ Delivered' },
  in_transit: { bg:'rgba(245,158,11,0.1)', c:'#f59e0b', t:'🚛 In Transit' },
  confirmed: { bg:'rgba(59,130,246,0.1)', c:'#60a5fa', t:'📦 Confirmed' },
  pending: { bg:'rgba(139,92,246,0.1)', c:'#a78bfa', t:'⏳ Pending' },
};

const G = { glass:{ background:'rgba(255,255,255,0.03)', backdropFilter:'blur(20px)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16 } };

export default function CustomerDashboardPage() {
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [locFilter, setLocFilter] = useState('All Locations');
  const [gpsDistrict, setGpsDistrict] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      let best = DISTRICT_COORDS[0], minD = Infinity;
      DISTRICT_COORDS.forEach(d => { const dd = (d.lat-lat)**2 + (d.lon-lon)**2; if (dd < minD) { minD = dd; best = d; } });
      setGpsDistrict(best.n); setLocFilter(best.n);
    }, () => {}, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  }, []);

  const categories = ['All', ...new Set(NEARBY_PRODUCTS.map(p => p.type))];
  const filteredProducts = NEARBY_PRODUCTS.filter(p => {
    if (catFilter !== 'All' && p.type !== catFilter) return false;
    if (locFilter !== 'All Locations' && p.district !== locFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.seller.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animated">
      {/* Hero Header */}
      <div style={{ background:'linear-gradient(135deg,#7c3aed,#db2777,#f59e0b)', borderRadius:16, padding:'26px 28px', marginBottom:22, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:-30, right:-30, width:180, height:180, background:'radial-gradient(circle,rgba(255,255,255,0.12),transparent)', borderRadius:'50%' }} />
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:'#fff', margin:0 }}>🛍️ Customer Dashboard</h1>
        <p style={{ color:'rgba(255,255,255,0.75)', fontSize:'0.82rem', marginTop:4 }}>Buy fresh from farmers · Track orders · Best prices</p>
        <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
          {[
            { v:ORDERS.length, l:'My Orders', c:'#fbbf24', i:'📦' },
            { v:ORDERS.filter(o=>o.status==='in_transit').length, l:'In Transit', c:'#f59e0b', i:'🚛' },
            { v:ORDERS.filter(o=>o.status==='delivered').length, l:'Delivered', c:'#34d399', i:'✅' },
            { v:`₹${ORDERS.reduce((s,o)=>s+o.price,0).toLocaleString()}`, l:'Total Spent', c:'#c084fc', i:'💰' },
          ].map(s => (
            <div key={s.l} style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 18px', textAlign:'center', flex:'1', minWidth:90 }}>
              <div style={{ fontSize:'1.3rem', fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.7)' }}>{s.i} {s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20, flexWrap:'wrap' }}>
        {[['overview','📊','Overview'],['browse','🛒','Browse Products'],['orders','📦','My Orders'],['connections','🤝','Connections'],['prices','📈','Price Trends']].map(([id,icon,label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding:'10px 20px', borderRadius:24, border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, background:tab===id?'linear-gradient(135deg,#7c3aed,#db2777)':'var(--bg-card)', color:tab===id?'#fff':'var(--text-muted)', boxShadow:tab===id?'0 4px 14px rgba(124,58,237,0.35)':'none', transition:'all 0.2s' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* OVERVIEW */}
      {tab === 'overview' && (
        <>
          <div style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:12 }}>🔥 Trending Near You {gpsDistrict && <span style={{ fontSize:'0.75rem', color:'#22c55e', fontWeight:600 }}>📍 {gpsDistrict}</span>}</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:14, marginBottom:24 }}>
            {NEARBY_PRODUCTS.slice(0,4).map(p => (
              <div key={p.id} className="card" style={{ padding:16, cursor:'pointer', transition:'all 0.2s' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 28px rgba(0,0,0,0.15)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:8 }}>
                  <span style={{ fontSize:'1.8rem' }}>{p.icon}</span>
                  <span style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'3px 10px', borderRadius:12, fontSize:'0.72rem', fontWeight:700 }}>{p.price}</span>
                </div>
                <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{p.name}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>👨‍🌾 {p.seller} · 📍 {p.district}</div>
                <div style={{ fontSize:'0.72rem', color:'#f59e0b', marginTop:4 }}>⭐ {p.rating}</div>
              </div>
            ))}
          </div>

          <div style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:12 }}>📦 Recent Orders</div>
          <div className="card">
            {ORDERS.slice(0,3).map(o => (
              <div key={o.id} style={{ padding:'14px 18px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{o.product}</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>from {o.seller} · {o.qty} · {o.date}</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontWeight:800, color:'#22c55e' }}>₹{o.price.toLocaleString()}</div>
                  <span style={{ background:ST[o.status].bg, color:ST[o.status].c, padding:'2px 10px', borderRadius:10, fontSize:'0.7rem', fontWeight:700 }}>{ST[o.status].t}</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* BROWSE PRODUCTS */}
      {tab === 'browse' && (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:14, flexWrap:'wrap', alignItems:'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products, sellers..."
              style={{ flex:'1 1 180px', minWidth:160, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', boxSizing:'border-box' }} />
            <select value={locFilter} onChange={e => setLocFilter(e.target.value)}
              style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.82rem' }}>
              {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {gpsDistrict && <span style={{ fontSize:'0.72rem', color:'#22c55e', fontWeight:600 }}>📍 GPS: {gpsDistrict}</span>}
            <select value={catFilter} onChange={e => setCatFilter(e.target.value)}
              style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.82rem' }}>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>({filteredProducts.length} products)</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:14 }}>
            {filteredProducts.map(p => (
              <div key={p.id} className="card" style={{ padding:18, transition:'all 0.2s', cursor:'pointer' }}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 28px rgba(0,0,0,0.15)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                  <div style={{ width:48, height:48, borderRadius:12, background:'rgba(124,58,237,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem' }}>{p.icon}</div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontWeight:800, color:'#22c55e', fontSize:'1.1rem' }}>{p.price}</div>
                    <div style={{ fontSize:'0.68rem', color:'#f59e0b' }}>⭐ {p.rating}</div>
                  </div>
                </div>
                <div style={{ fontWeight:700, fontSize:'0.92rem', marginBottom:4 }}>{p.name}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>👨‍🌾 {p.seller}</div>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>📍 {p.district}</div>
                <div style={{ display:'flex', gap:8, marginTop:12 }}>
                  <button style={{ flex:1, padding:'8px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.78rem', cursor:'pointer' }}>🛒 Buy Now</button>
                  <button style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', background:'none', color:'var(--text-muted)', fontSize:'0.78rem', cursor:'pointer' }}>📞 Contact</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MY ORDERS */}
      {tab === 'orders' && (
        <div className="card">
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700 }}>📦 All Orders ({ORDERS.length})</div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Order ID</th><th>Product</th><th>Seller</th><th>Qty</th><th>Amount</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {ORDERS.map(o => (
                  <tr key={o.id}>
                    <td style={{ fontWeight:800, color:'#7c3aed', fontFamily:'monospace' }}>{o.id}</td>
                    <td style={{ fontWeight:600 }}>{o.product}</td>
                    <td><span style={{ fontSize:'0.78rem' }}>{o.seller}</span><br/><span style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>📍 {o.district}</span></td>
                    <td>{o.qty}</td>
                    <td style={{ fontWeight:800, color:'#22c55e' }}>₹{o.price.toLocaleString()}</td>
                    <td style={{ fontSize:'0.82rem' }}>{o.date}</td>
                    <td><span style={{ background:ST[o.status].bg, color:ST[o.status].c, padding:'3px 12px', borderRadius:10, fontSize:'0.72rem', fontWeight:700 }}>{ST[o.status].t}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CONNECTIONS */}
      {tab === 'connections' && (
        <div>
          <div style={{ fontWeight:700, color:'#f1f5f9', marginBottom:14, fontSize:'1rem' }}>🤝 My Network</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            {[
              {title:'👨‍🌾 Farmers',count:18,items:[{n:'Venkat Rao',d:'Guntur',s:'Rice · Premium quality',ph:'9000000001'},{n:'Lakshmi Devi',d:'Chittoor',s:'Tomatoes · Organic',ph:'9000000005'},{n:'Raju Farms',d:'Chittoor',s:'Mangoes · Seasonal',ph:'9000000003'}]},
              {title:'🏪 Suppliers',count:6,items:[{n:'Anantapur Oil Mill',d:'Anantapur',s:'Groundnut Oil',ph:'9876501111'},{n:'Krishna Bee Farms',d:'Krishna',s:'Honey · Natural',ph:'9876501112'}]},
              {title:'🤝 Brokers',count:4,items:[{n:'Chittoor Fruits Broker',d:'Chittoor',s:'Fruits specialist',ph:'9100000001'},{n:'Guntur Grain Traders',d:'Guntur',s:'Rice & Millets',ph:'9100000002'}]},
              {title:'🚛 Transport',count:3,items:[{n:'Ramesh Kumar',d:'Guntur',s:'Mini truck delivery',ph:'9876501234'}]},
              {title:'❄️ Cold Storage',count:2,items:[{n:'Sri Lakshmi Cold Storage',d:'Guntur',s:'Multi-chamber · ₹3.5/day',ph:'9876543210'}]},
              {title:'🏭 Industries',count:2,items:[{n:'AP Agri Processing',d:'Krishna',s:'Bulk orders',ph:'9300000001'}]},
            ].map(sec => (
              <div key={sec.title} style={{ ...G.glass, padding:18, borderRadius:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:12 }}>
                  <span style={{ fontWeight:700, color:'#f1f5f9', fontSize:'0.92rem' }}>{sec.title}</span>
                  <span style={{ fontSize:'0.72rem', color:'#c084fc', fontWeight:600 }}>{sec.count} total</span>
                </div>
                {sec.items.map(it => (
                  <div key={it.n} style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#f1f5f9' }}>{it.n}</div>
                      <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.4)' }}>📍 {it.d} · {it.s}</div>
                    </div>
                    <button onClick={() => window.open('tel:'+it.ph)} style={{ background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:6, padding:'3px 8px', color:'#a78bfa', cursor:'pointer', fontSize:'0.68rem' }}>📞</button>
                    <button onClick={() => window.open('https://wa.me/91'+it.ph)} style={{ background:'rgba(124,58,237,0.1)', border:'1px solid rgba(124,58,237,0.2)', borderRadius:6, padding:'3px 8px', color:'#a78bfa', cursor:'pointer', fontSize:'0.68rem' }}>💬</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRICE TRENDS */}
      {tab === 'prices' && (
        <div className="card">
          <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--border)', fontWeight:700 }}>📈 Market Price Trends</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:14, padding:18 }}>
            {PRICE_TRENDS.map(p => (
              <div key={p.crop} style={{ padding:16, borderRadius:12, background:p.up?'rgba(34,197,94,0.05)':'rgba(239,68,68,0.05)', border:`1px solid ${p.up?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)'}` }}>
                <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:6 }}>{p.crop}</div>
                <div style={{ fontSize:'1.3rem', fontWeight:800, color:p.up?'#22c55e':'#ef4444' }}>{p.current}</div>
                <div style={{ fontSize:'0.78rem', color:p.up?'#22c55e':'#ef4444', marginTop:4, fontWeight:600 }}>{p.up?'📈':'📉'} {p.change}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
