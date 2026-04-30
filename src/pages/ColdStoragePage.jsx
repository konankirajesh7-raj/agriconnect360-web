import React, { useState, useEffect } from 'react';

const AP_DISTRICTS = ['All Locations','Guntur','Krishna','Anantapur','Chittoor','Kurnool','Prakasam','Nellore','East Godavari','West Godavari','Visakhapatnam','Vizianagaram','Srikakulam','Kadapa'];
const DISTRICT_COORDS = [
  { n:'Guntur', lat:16.3067, lon:80.4365 }, { n:'Krishna', lat:16.5062, lon:80.6480 },
  { n:'Anantapur', lat:14.6819, lon:77.6006 }, { n:'Chittoor', lat:13.2172, lon:79.1003 },
  { n:'Kurnool', lat:15.8281, lon:78.0373 }, { n:'Prakasam', lat:15.5057, lon:80.0499 },
  { n:'East Godavari', lat:17.0005, lon:81.8040 }, { n:'Nellore', lat:14.4426, lon:79.9865 },
  { n:'West Godavari', lat:16.9174, lon:81.3399 }, { n:'Visakhapatnam', lat:17.6868, lon:83.2185 },
  { n:'Vizianagaram', lat:18.1067, lon:83.3956 }, { n:'Srikakulam', lat:18.2949, lon:83.8935 },
  { n:'Kadapa', lat:14.4674, lon:78.8241 },
];

const FACILITIES = [
  { id:1, name:'Sri Lakshmi Cold Storage', location:'Guntur, AP', district:'Guntur', lat:16.3067, lng:80.4365, distance:4.2, capacity:5000, available:1800, pricePerDay:3.5, temp:'-18°C to 4°C', rating:4.6, phone:'9876543210', type:'Multi-Chamber', crops:['Paddy','Chilli','Cotton'], img:'🏭' },
  { id:2, name:'AP Agri Cold Chain Hub', location:'Vijayawada, AP', district:'Krishna', lat:16.5062, lng:80.6480, distance:12.8, capacity:12000, available:4200, pricePerDay:4.0, temp:'-25°C to 10°C', rating:4.8, phone:'9876543211', type:'Blast Freezer', crops:['Mango','Banana','Tomato'], img:'❄️' },
  { id:3, name:'Kisan Sheetgrah', location:'Ongole, AP', district:'Prakasam', lat:15.5057, lng:80.0499, distance:28.5, capacity:3000, available:900, pricePerDay:2.8, temp:'-5°C to 8°C', rating:4.2, phone:'9876543212', type:'Cold Room', crops:['Groundnut','Paddy'], img:'🧊' },
  { id:4, name:'FreshKeep Warehousing', location:'Tirupati, AP', district:'Chittoor', lat:13.6288, lng:79.4192, distance:42.1, capacity:8000, available:3500, pricePerDay:3.2, temp:'-20°C to 5°C', rating:4.5, phone:'9876543213', type:'Multi-Chamber', crops:['Mango','Grapes','Pomegranate'], img:'🏗️' },
  { id:5, name:'Rayalaseema Cold Stores', location:'Kurnool, AP', district:'Kurnool', lat:15.8281, lng:78.0373, distance:65.3, capacity:6000, available:2100, pricePerDay:2.5, temp:'-10°C to 6°C', rating:4.0, phone:'9876543214', type:'Cold Room', crops:['Chilli','Cotton','Sunflower'], img:'🏢' },
  { id:6, name:'Coastal AgriFresh', location:'Kakinada, AP', district:'East Godavari', lat:16.9891, lng:82.2475, distance:78.0, capacity:4500, available:1200, pricePerDay:3.0, temp:'-15°C to 8°C', rating:4.3, phone:'9876543215', type:'CA Storage', crops:['Prawn','Fish','Coconut'], img:'🌊' },
  { id:7, name:'Vizag Marine Cold Store', location:'Visakhapatnam, AP', district:'Visakhapatnam', lat:17.6868, lng:83.2185, distance:5.6, capacity:7000, available:2800, pricePerDay:3.8, temp:'-25°C to 2°C', rating:4.7, phone:'9876543216', type:'Blast Freezer', crops:['Fish','Prawn','Shrimp'], img:'🐟' },
  { id:8, name:'Vizianagaram Agri Store', location:'Vizianagaram, AP', district:'Vizianagaram', lat:18.1067, lng:83.3956, distance:8.3, capacity:2500, available:1100, pricePerDay:2.5, temp:'-10°C to 5°C', rating:4.1, phone:'9876543217', type:'Cold Room', crops:['Paddy','Cashew','Turmeric'], img:'🧊' },
  { id:9, name:'Anantapur Groundnut Hub', location:'Anantapur, AP', district:'Anantapur', lat:14.6819, lng:77.6006, distance:3.5, capacity:4000, available:1600, pricePerDay:2.2, temp:'-8°C to 6°C', rating:4.3, phone:'9876543218', type:'Cold Room', crops:['Groundnut','Sunflower','Cotton'], img:'🥜' },
  { id:10, name:'Nellore Aqua Cold Chain', location:'Nellore, AP', district:'Nellore', lat:14.4426, lng:79.9865, distance:6.8, capacity:5500, available:2000, pricePerDay:3.5, temp:'-22°C to 0°C', rating:4.5, phone:'9876543219', type:'Blast Freezer', crops:['Prawn','Fish','Shrimp'], img:'🦐' },
  { id:11, name:'Kadapa Seeds & Grains Store', location:'Kadapa, AP', district:'Kadapa', lat:14.4674, lng:78.8241, distance:4.1, capacity:3500, available:1400, pricePerDay:2.3, temp:'-5°C to 8°C', rating:4.0, phone:'9876543220', type:'Cold Room', crops:['Groundnut','Paddy','Sunflower'], img:'🌻' },
];

const cs = {
  overlay: { position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(6px)',animation:'csFadeIn .25s ease' },
  modal: { width:'min(520px,92vw)',maxHeight:'85vh',overflowY:'auto',background:'var(--bg-card)',borderRadius:16,border:'1px solid var(--border)',boxShadow:'0 20px 60px rgba(0,0,0,0.5)',animation:'csSlideUp .3s ease' },
  mHead: { padding:'20px 24px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center' },
  mBody: { padding:'20px 24px' },
  row: { display:'flex',gap:12,marginBottom:14 },
  label: { fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:4,display:'block' },
  input: { width:'100%',padding:'10px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(8,12,20,0.65)',color:'var(--text-primary)',fontSize:'0.85rem',outline:'none' },
  btn: { padding:'12px 28px',borderRadius:12,background:'linear-gradient(135deg,#059669,#10b981)',color:'#fff',border:'none',fontWeight:700,fontSize:'0.88rem',cursor:'pointer',width:'100%',marginTop:8 },
  close: { background:'none',border:'none',color:'var(--text-muted)',fontSize:'1.3rem',cursor:'pointer',padding:4 },
  tag: (bg,c) => ({ fontSize:'0.65rem',padding:'2px 8px',borderRadius:999,background:bg,color:c,fontWeight:600,display:'inline-block' }),
};

function MapView({ facilities, onSelect }) {
  return (
    <div style={{ position:'relative',width:'100%',height:380,borderRadius:14,overflow:'hidden',background:'linear-gradient(135deg,#0a1628,#132040)',border:'1px solid var(--border)' }}>
      <div style={{ position:'absolute',inset:0,opacity:0.15,backgroundImage:'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)',backgroundSize:'24px 24px' }} />
      <div style={{ position:'absolute',top:12,left:12,padding:'6px 12px',borderRadius:8,background:'rgba(0,0,0,0.5)',fontSize:'0.72rem',color:'#93c5fd',fontWeight:600,backdropFilter:'blur(4px)',border:'1px solid rgba(59,130,246,0.2)' }}>📍 Andhra Pradesh — {facilities.length} Facilities</div>
      {facilities.map((f,i) => {
        const x = 15 + ((f.lng - 78) / 5) * 70;
        const y = 15 + ((17 - f.lat) / 4) * 70;
        return (
          <div key={f.id} onClick={() => onSelect(f)} style={{ position:'absolute',left:`${x}%`,top:`${y}%`,cursor:'pointer',animation:`csPinDrop .4s ease ${i*0.08}s both`,zIndex:10 }}>
            <div style={{ width:36,height:36,borderRadius:'50%',background:'linear-gradient(135deg,#3b82f6,#06b6d4)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',boxShadow:'0 0 16px rgba(59,130,246,0.5),0 4px 12px rgba(0,0,0,0.3)',border:'2px solid rgba(255,255,255,0.3)',transition:'transform .2s' }}
              onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.25)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
            >{f.img}</div>
            <div style={{ position:'absolute',top:-28,left:'50%',transform:'translateX(-50%)',whiteSpace:'nowrap',fontSize:'0.62rem',fontWeight:600,color:'#fff',background:'rgba(0,0,0,0.7)',padding:'2px 8px',borderRadius:6,backdropFilter:'blur(4px)' }}>{f.name.split(' ').slice(0,2).join(' ')}</div>
          </div>
        );
      })}
      <style>{`
        @keyframes csFadeIn{from{opacity:0}to{opacity:1}}
        @keyframes csSlideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes csPinDrop{from{opacity:0;transform:scale(0) translateY(-20px)}to{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>
    </div>
  );
}

function DetailModal({ facility, onClose, onBook }) {
  if (!facility) return null;
  const f = facility;
  const usedPct = ((f.capacity - f.available) / f.capacity * 100).toFixed(0);
  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.mHead}>
          <div>
            <div style={{ fontSize:'1.1rem',fontWeight:800,color:'var(--text-primary)' }}>{f.img} {f.name}</div>
            <div style={{ fontSize:'0.78rem',color:'var(--text-muted)',marginTop:2 }}>📍 {f.location} • {f.distance} km away</div>
          </div>
          <button style={cs.close} onClick={onClose}>✕</button>
        </div>
        <div style={cs.mBody}>
          <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:12,marginBottom:18 }}>
            {[
              { l:'Temperature Range', v:f.temp, ic:'🌡️', bg:'rgba(239,68,68,0.08)',bc:'rgba(239,68,68,0.15)' },
              { l:'Price / Day / MT', v:`₹${f.pricePerDay}`, ic:'💰', bg:'rgba(16,185,129,0.08)',bc:'rgba(16,185,129,0.15)' },
              { l:'Total Capacity', v:`${f.capacity.toLocaleString()} MT`, ic:'📦', bg:'rgba(59,130,246,0.08)',bc:'rgba(59,130,246,0.15)' },
              { l:'Available', v:`${f.available.toLocaleString()} MT`, ic:'✅', bg:'rgba(245,158,11,0.08)',bc:'rgba(245,158,11,0.15)' },
            ].map(x => (
              <div key={x.l} style={{ padding:14,borderRadius:12,background:x.bg,border:`1px solid ${x.bc}`,textAlign:'center' }}>
                <div style={{ fontSize:'0.68rem',color:'var(--text-muted)',marginBottom:4 }}>{x.ic} {x.l}</div>
                <div style={{ fontSize:'1.05rem',fontWeight:700,color:'var(--text-primary)' }}>{x.v}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:6 }}>Capacity Utilization</div>
            <div style={{ height:10,borderRadius:6,background:'rgba(255,255,255,0.06)',overflow:'hidden' }}>
              <div style={{ height:'100%',width:`${usedPct}%`,borderRadius:6,background:`linear-gradient(90deg,#10b981,${usedPct > 75 ? '#ef4444' : '#3b82f6'})`,transition:'width .5s ease' }} />
            </div>
            <div style={{ fontSize:'0.68rem',color:'var(--text-muted)',marginTop:4 }}>{usedPct}% used</div>
          </div>
          <div style={{ marginBottom:16 }}>
            <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:6 }}>Stored Crops</div>
            <div style={{ display:'flex',gap:6,flexWrap:'wrap' }}>
              {f.crops.map(c => <span key={c} style={cs.tag('rgba(16,185,129,0.12)','#6ee7b7')}>{c}</span>)}
            </div>
          </div>
          <div style={{ display:'flex',gap:8,marginBottom:16 }}>
            <span style={cs.tag('rgba(59,130,246,0.12)','#93c5fd')}>{f.type}</span>
            <span style={cs.tag('rgba(245,158,11,0.12)','#fbbf24')}>⭐ {f.rating}</span>
            <span style={cs.tag('rgba(139,92,246,0.12)','#c4b5fd')}>📞 {f.phone}</span>
          </div>
          <button style={cs.btn} onClick={() => onBook(f)}>📦 Book Slot</button>
        </div>
      </div>
    </div>
  );
}

function BookingModal({ facility, onClose, onSave }) {
  const [form, setForm] = useState({ crop:'Paddy', qty:'', fromDate:'', toDate:'', name:'', phone:'' });
  const [submitted, setSubmitted] = useState(false);
  if (!facility) return null;
  const update = (k,v) => setForm(p => ({...p,[k]:v}));
  const days = form.fromDate && form.toDate ? Math.max(1, Math.ceil((new Date(form.toDate)-new Date(form.fromDate))/(86400000))) : 0;
  const cost = days * facility.pricePerDay * (parseFloat(form.qty)||0);

  const handleConfirm = () => {
    setSubmitted(true);
    if (onSave) onSave({ facility: facility.name, crop: form.crop, qty: parseFloat(form.qty)||0, from: form.fromDate, to: form.toDate, cost: Math.round(cost) });
  };

  if (submitted) return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={{...cs.modal,textAlign:'center',padding:40}} onClick={e => e.stopPropagation()}>
        <div style={{ fontSize:64,marginBottom:16,animation:'csPinDrop .5s ease' }}>✅</div>
        <div style={{ fontSize:'1.2rem',fontWeight:800,color:'var(--text-primary)',marginBottom:8 }}>Booking Confirmed!</div>
        <div style={{ fontSize:'0.85rem',color:'var(--text-muted)',marginBottom:6 }}>{facility.name}</div>
        <div style={{ fontSize:'0.85rem',color:'#34d399',fontWeight:700,marginBottom:20 }}>{form.qty} MT • {days} days • ₹{cost.toLocaleString()}</div>
        <button style={{...cs.btn,width:'auto',padding:'10px 32px',display:'inline-block'}} onClick={onClose}>Done</button>
      </div>
    </div>
  );

  return (
    <div style={cs.overlay} onClick={onClose}>
      <div style={cs.modal} onClick={e => e.stopPropagation()}>
        <div style={cs.mHead}>
          <div style={{ fontSize:'1rem',fontWeight:800,color:'var(--text-primary)' }}>📦 Book Cold Storage Slot</div>
          <button style={cs.close} onClick={onClose}>✕</button>
        </div>
        <div style={cs.mBody}>
          <div style={{ padding:12,borderRadius:10,background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.12)',marginBottom:18,fontSize:'0.82rem',color:'#93c5fd' }}>
            {facility.img} {facility.name} — ₹{facility.pricePerDay}/MT/day
          </div>
          <div style={cs.row}>
            <div style={{ flex:1 }}><label style={cs.label}>Crop</label>
              <select value={form.crop} onChange={e => update('crop',e.target.value)} style={{...cs.input,appearance:'auto'}}>{facility.crops.map(c => <option key={c} value={c}>{c}</option>)}</select>
            </div>
            <div style={{ flex:1 }}><label style={cs.label}>Quantity (MT)</label>
              <input type="number" value={form.qty} onChange={e => update('qty',e.target.value)} placeholder="e.g. 50" style={cs.input} />
            </div>
          </div>
          <div style={cs.row}>
            <div style={{ flex:1 }}><label style={cs.label}>From Date</label><input type="date" value={form.fromDate} onChange={e => update('fromDate',e.target.value)} style={cs.input} /></div>
            <div style={{ flex:1 }}><label style={cs.label}>To Date</label><input type="date" value={form.toDate} onChange={e => update('toDate',e.target.value)} style={cs.input} /></div>
          </div>
          <div style={cs.row}>
            <div style={{ flex:1 }}><label style={cs.label}>Contact Name</label><input value={form.name} onChange={e => update('name',e.target.value)} placeholder="Your name" style={cs.input} /></div>
            <div style={{ flex:1 }}><label style={cs.label}>Phone</label><input value={form.phone} onChange={e => update('phone',e.target.value)} placeholder="9876543210" style={cs.input} /></div>
          </div>
          {cost > 0 && (
            <div style={{ padding:14,borderRadius:10,background:'rgba(16,185,129,0.08)',border:'1px solid rgba(16,185,129,0.15)',marginBottom:12,textAlign:'center' }}>
              <div style={{ fontSize:'0.72rem',color:'var(--text-muted)' }}>Estimated Cost</div>
              <div style={{ fontSize:'1.2rem',fontWeight:800,color:'#34d399' }}>₹{cost.toLocaleString()}</div>
              <div style={{ fontSize:'0.68rem',color:'var(--text-muted)' }}>{form.qty} MT × {days} days × ₹{facility.pricePerDay}</div>
            </div>
          )}
          <button style={cs.btn} onClick={handleConfirm}>Confirm Booking</button>
        </div>
      </div>
    </div>
  );
}

const PREV_BOOKINGS = [
  { id:'BK-001', facility:'Sri Lakshmi Cold Storage', crop:'Paddy', qty:25, from:'2026-03-01', to:'2026-03-20', cost:1750, status:'completed' },
  { id:'BK-002', facility:'AP Agri Cold Chain Hub', crop:'Mango', qty:40, from:'2026-04-10', to:'2026-05-10', cost:4800, status:'active' },
  { id:'BK-003', facility:'Kisan Sheetgrah', crop:'Groundnut', qty:15, from:'2026-02-15', to:'2026-02-28', cost:546, status:'completed' },
];

export default function ColdStoragePage() {
  const [view, setView] = useState('list');
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState(null);
  const [search, setSearch] = useState('');
  const [locFilter, setLocFilter] = useState('All Locations');
  const [gpsDistrict, setGpsDistrict] = useState('');
  const [myBookings, setMyBookings] = useState(PREV_BOOKINGS);
  const [showBookings, setShowBookings] = useState(false);

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      let best = DISTRICT_COORDS[0], minD = Infinity;
      DISTRICT_COORDS.forEach(d => { const dd = (d.lat-lat)**2 + (d.lon-lon)**2; if (dd < minD) { minD = dd; best = d; } });
      setGpsDistrict(best.n); setLocFilter(best.n);
    }, () => {}, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  }, []);

  let filtered = FACILITIES.filter(f => f.name.toLowerCase().includes(search.toLowerCase()) || f.location.toLowerCase().includes(search.toLowerCase()));
  if (locFilter !== 'All Locations') filtered = filtered.filter(f => f.district === locFilter);

  function handleBookingDone(bk) {
    setMyBookings(prev => [{ id:`BK-${String(prev.length+1).padStart(3,'0')}`, facility:bk.facility, crop:bk.crop, qty:bk.qty, from:bk.from, to:bk.to, cost:bk.cost, status:'active' }, ...prev]);
    setBooking(null);
  }

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">❄️ Cold Storage</div>
          <div style={{ fontSize:'0.8rem',color:'var(--text-muted)',marginTop:2 }}>Find & book nearby cold storage facilities</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding:20,marginBottom:16 }}>
        <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12 }}>
          {[
            { l:'Facilities',v:FACILITIES.length,ic:'🏭',bg:'rgba(59,130,246,0.08)',bc:'rgba(59,130,246,0.15)',c:'#60a5fa' },
            { l:'Total Capacity',v:'38,500 MT',ic:'📦',bg:'rgba(16,185,129,0.08)',bc:'rgba(16,185,129,0.15)',c:'#34d399' },
            { l:'Available',v:'13,700 MT',ic:'✅',bg:'rgba(245,158,11,0.08)',bc:'rgba(245,158,11,0.15)',c:'#fbbf24' },
            { l:'Avg Price',v:'₹3.2/day',ic:'💰',bg:'rgba(139,92,246,0.08)',bc:'rgba(139,92,246,0.15)',c:'#a78bfa' },
          ].map(x => (
            <div key={x.l} style={{ textAlign:'center',padding:14,borderRadius:12,background:x.bg,border:`1px solid ${x.bc}` }}>
              <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:4 }}>{x.ic} {x.l}</div>
              <div style={{ fontSize:'1.3rem',fontWeight:800,color:x.c }}>{x.v}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:12,marginBottom:16,display:'flex',gap:10,alignItems:'center',flexWrap:'wrap' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search facilities..." style={{ flex:1,minWidth:140,padding:'8px 14px',borderRadius:10,border:'1px solid rgba(255,255,255,0.1)',background:'rgba(8,12,20,0.65)',color:'var(--text-primary)',fontSize:'0.82rem',outline:'none' }} />
        <select value={locFilter} onChange={e => setLocFilter(e.target.value)}
          style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.82rem' }}>
          {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        {gpsDistrict && <span style={{ fontSize:'0.72rem', color:'#22c55e', fontWeight:600 }}>📍 {gpsDistrict}</span>}
        {['list','map'].map(v => (
          <button key={v} onClick={() => setView(v)} style={{ padding:'7px 16px',borderRadius:999,fontSize:'0.75rem',fontWeight:600,cursor:'pointer',border:'1px solid',borderColor:view===v?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.1)',background:view===v?'rgba(59,130,246,0.15)':'transparent',color:view===v?'#60a5fa':'var(--text-secondary)',transition:'all .15s' }}>
            {v==='list'?'📋 List':'🗺️ Map'}
          </button>
        ))}
        <button onClick={() => setShowBookings(!showBookings)} style={{ padding:'7px 16px',borderRadius:999,fontSize:'0.75rem',fontWeight:600,cursor:'pointer',border:'1px solid',borderColor:showBookings?'rgba(16,185,129,0.4)':'rgba(255,255,255,0.1)',background:showBookings?'rgba(16,185,129,0.15)':'transparent',color:showBookings?'#34d399':'var(--text-secondary)',transition:'all .15s',position:'relative' }}>
          📦 My Bookings
          {myBookings.filter(b=>b.status==='active').length > 0 && <span style={{ position:'absolute',top:-4,right:-4,minWidth:16,height:16,borderRadius:8,background:'#ef4444',color:'#fff',fontSize:'0.55rem',fontWeight:700,display:'flex',alignItems:'center',justifyContent:'center',padding:'0 3px' }}>{myBookings.filter(b=>b.status==='active').length}</span>}
        </button>
      </div>

      {/* My Bookings */}
      {showBookings && (
        <div className="card" style={{ padding:18,marginBottom:16 }}>
          <div style={{ fontSize:'0.9rem',fontWeight:700,color:'var(--text-primary)',marginBottom:14 }}>📦 My Bookings ({myBookings.length})</div>
          {myBookings.length === 0 && <div style={{ fontSize:'0.82rem',color:'var(--text-muted)',textAlign:'center',padding:20 }}>No bookings yet. Book a slot to get started!</div>}
          {myBookings.map(b => (
            <div key={b.id} style={{ padding:12,marginBottom:8,borderRadius:12,background:'rgba(255,255,255,0.02)',border:'1px solid var(--border)',display:'flex',gap:14,alignItems:'center',borderLeft:`3px solid ${b.status==='active'?'#10b981':'rgba(255,255,255,0.1)'}` }}>
              <div style={{ width:40,height:40,borderRadius:10,background:b.status==='active'?'rgba(16,185,129,0.12)':'rgba(255,255,255,0.04)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0 }}>{b.status==='active'?'❄️':'✅'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:600,fontSize:'0.85rem',color:'var(--text-primary)' }}>{b.facility}</div>
                <div style={{ display:'flex',gap:6,marginTop:4,flexWrap:'wrap',alignItems:'center' }}>
                  <span style={cs.tag('rgba(59,130,246,0.12)','#93c5fd')}>{b.id}</span>
                  <span style={cs.tag('rgba(16,185,129,0.12)','#6ee7b7')}>{b.crop}</span>
                  <span style={cs.tag('rgba(245,158,11,0.12)','#fbbf24')}>{b.qty} MT</span>
                  <span style={{ fontSize:'0.68rem',color:'var(--text-muted)' }}>{b.from} → {b.to}</span>
                </div>
              </div>
              <div style={{ textAlign:'right' }}>
                <div style={{ fontWeight:700,color:'#34d399',fontSize:'0.9rem' }}>₹{b.cost.toLocaleString()}</div>
                <span style={cs.tag(b.status==='active'?'rgba(16,185,129,0.12)':'rgba(139,92,246,0.12)',b.status==='active'?'#6ee7b7':'#c4b5fd')}>{b.status==='active'?'🟢 Active':'✅ Completed'}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Map View */}
      {view === 'map' && (
        <div className="card" style={{ padding:16,marginBottom:16 }}>
          <MapView facilities={filtered} onSelect={setSelected} />
        </div>
      )}

      {/* List View */}
      {view === 'list' && filtered.map(f => {
        const usedPct = ((f.capacity - f.available) / f.capacity * 100).toFixed(0);
        return (
          <div key={f.id} className="card" style={{ padding:16,marginBottom:10,cursor:'pointer',transition:'all .2s',borderLeft:'3px solid rgba(59,130,246,0.4)' }} onClick={() => setSelected(f)}>
            <div style={{ display:'flex',gap:14,alignItems:'flex-start' }}>
              <div style={{ width:48,height:48,borderRadius:12,background:'linear-gradient(135deg,rgba(59,130,246,0.15),rgba(6,182,212,0.15))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',flexShrink:0 }}>{f.img}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:6 }}>
                  <div>
                    <div style={{ fontWeight:700,fontSize:'0.92rem',color:'var(--text-primary)' }}>{f.name}</div>
                    <div style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2 }}>📍 {f.location} • {f.distance} km</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontSize:'1rem',fontWeight:800,color:'#34d399' }}>₹{f.pricePerDay}</div>
                    <div style={{ fontSize:'0.62rem',color:'var(--text-muted)' }}>/MT/day</div>
                  </div>
                </div>
                <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:8 }}>
                  <span style={cs.tag('rgba(239,68,68,0.1)','#fca5a5')}>🌡️ {f.temp}</span>
                  <span style={cs.tag('rgba(59,130,246,0.1)','#93c5fd')}>{f.type}</span>
                  <span style={cs.tag('rgba(245,158,11,0.1)','#fbbf24')}>⭐ {f.rating}</span>
                </div>
                <div style={{ display:'flex',alignItems:'center',gap:10 }}>
                  <div style={{ flex:1,height:6,borderRadius:4,background:'rgba(255,255,255,0.06)',overflow:'hidden' }}>
                    <div style={{ height:'100%',width:`${usedPct}%`,borderRadius:4,background:'linear-gradient(90deg,#10b981,#3b82f6)',transition:'width .5s' }} />
                  </div>
                  <span style={{ fontSize:'0.68rem',color:'var(--text-muted)',whiteSpace:'nowrap' }}>{f.available.toLocaleString()} MT free</span>
                </div>
              </div>
            </div>
          </div>
        );
      })}

      <DetailModal facility={selected} onClose={() => setSelected(null)} onBook={f => { setSelected(null); setBooking(f); }} />
      <BookingModal facility={booking} onClose={() => setBooking(null)} onSave={handleBookingDone} />
    </div>
  );
}
