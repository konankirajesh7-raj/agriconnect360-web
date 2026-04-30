import React, { useState, useEffect } from 'react';

const AP_DISTRICTS = ['All Locations','Guntur','Krishna','Anantapur','Chittoor','Kurnool','Prakasam','Nellore','East Godavari','West Godavari','Visakhapatnam','Vizianagaram','Srikakulam','Kadapa'];
const DISTRICT_COORDS = [
  { n:'Guntur', lat:16.3067, lon:80.4365 }, { n:'Krishna', lat:16.5062, lon:80.6480 },
  { n:'Anantapur', lat:14.6819, lon:77.6006 }, { n:'Chittoor', lat:13.2172, lon:79.1003 },
  { n:'Kurnool', lat:15.8281, lon:78.0373 }, { n:'East Godavari', lat:17.0005, lon:81.8040 },
  { n:'Nellore', lat:14.4426, lon:79.9865 }, { n:'Prakasam', lat:15.5057, lon:80.0499 },
  { n:'West Godavari', lat:16.9174, lon:81.3399 }, { n:'Visakhapatnam', lat:17.6868, lon:83.2185 },
  { n:'Vizianagaram', lat:18.1067, lon:83.3956 }, { n:'Srikakulam', lat:18.2949, lon:83.8935 },
  { n:'Kadapa', lat:14.4674, lon:78.8241 },
];

const DRIVERS = [
  { id:1, name:'Ramesh Kumar', phone:'9876501234', vehicle:'Tata Ace (AP-07-AB-1234)', type:'Mini Truck', cap:'3T', rate:22, icon:'🚐', photo:'👤', rating:4.8, trips:156, status:'available', loc:'Guntur', district:'Guntur' },
  { id:2, name:'Suresh Reddy', phone:'9876502345', vehicle:'Ashok Leyland Dost (AP-07-CD-5678)', type:'Mini Truck', cap:'4T', rate:24, icon:'🚐', photo:'👤', rating:4.6, trips:98, status:'available', loc:'Vijayawada', district:'Krishna' },
  { id:3, name:'Venkat Rao', phone:'9876503456', vehicle:'Mahindra Bolero Pickup (AP-21-EF-9012)', type:'Tractor Trolley', cap:'2.5T', rate:15, icon:'🚜', photo:'👤', rating:4.9, trips:230, status:'on_trip', loc:'Tenali', district:'Guntur' },
  { id:4, name:'Narasimha Murthy', phone:'9876504567', vehicle:'Eicher Pro 1049 (AP-07-GH-3456)', type:'Medium Truck', cap:'7T', rate:32, icon:'🚛', photo:'👤', rating:4.7, trips:312, status:'available', loc:'Ongole', district:'Prakasam' },
  { id:5, name:'Krishna Prasad', phone:'9876505678', vehicle:'Tata 407 (AP-05-IJ-7890)', type:'Medium Truck', cap:'5T', rate:28, icon:'🚛', photo:'👤', rating:4.5, trips:87, status:'available', loc:'Kurnool', district:'Kurnool' },
  { id:6, name:'Srinivas Goud', phone:'9876506789', vehicle:'Bharatbenz 1617 (AP-09-KL-2345)', type:'Large Truck', cap:'16T', rate:48, icon:'🚚', photo:'👤', rating:4.8, trips:445, status:'on_trip', loc:'Anantapur', district:'Anantapur' },
  { id:7, name:'Raju Naidu', phone:'9876507890', vehicle:'Tata LPT 1613 (AP-29-MN-6789)', type:'Large Truck', cap:'12T', rate:42, icon:'🚚', photo:'👤', rating:4.4, trips:198, status:'available', loc:'Nellore', district:'Nellore' },
  { id:8, name:'Anil Babu', phone:'9876508901', vehicle:'John Deere 5050D Tractor (AP-07-OP-0123)', type:'Tractor Trolley', cap:'3T', rate:16, icon:'🚜', photo:'👤', rating:4.7, trips:310, status:'available', loc:'Narasaraopet', district:'Guntur' },
  { id:9, name:'Durga Rao', phone:'9876509012', vehicle:'Tata Ace Gold (AP-31-QR-4567)', type:'Mini Truck', cap:'2T', rate:20, icon:'🚐', photo:'👤', rating:4.5, trips:124, status:'available', loc:'Vizianagaram', district:'Vizianagaram' },
  { id:10, name:'Appala Naidu', phone:'9876510123', vehicle:'Ashok Leyland Bada Dost (AP-31-ST-8901)', type:'Medium Truck', cap:'5T', rate:30, icon:'🚛', photo:'👤', rating:4.6, trips:167, status:'available', loc:'Visakhapatnam', district:'Visakhapatnam' },
  { id:11, name:'Ranga Rao', phone:'9876511234', vehicle:'Mahindra 475DI Tractor (AP-03-UV-2345)', type:'Tractor Trolley', cap:'3T', rate:18, icon:'🚜', photo:'👤', rating:4.3, trips:89, status:'available', loc:'Chittoor', district:'Chittoor' },
  { id:12, name:'Samba Murthy', phone:'9876512345', vehicle:'Tata 709 (AP-01-WX-6789)', type:'Large Truck', cap:'9T', rate:38, icon:'🚚', photo:'👤', rating:4.7, trips:256, status:'on_trip', loc:'Kakinada', district:'East Godavari' },
  { id:13, name:'Obul Reddy', phone:'9876513456', vehicle:'Eicher 10.75 (AP-04-YZ-0123)', type:'Medium Truck', cap:'6T', rate:28, icon:'🚛', photo:'👤', rating:4.4, trips:143, status:'available', loc:'Kadapa', district:'Kadapa' },
];

const BOOKINGS = [
  { ref:'TR-KQM29', crop:'Paddy', qty:'5.5T', pickup:'Narasaraopet', delivery:'Guntur APMC', driver:'Venkat Rao', phone:'9876503456', vehicle:'Mahindra Bolero', cost:4200, status:'in_transit', date:'2026-04-25', progress:60, eta:'2h 15m' },
  { ref:'TR-VBN44', crop:'Cotton', qty:'2T', pickup:'Tenali', delivery:'Vijayawada', driver:'Ramesh Kumar', phone:'9876501234', vehicle:'Tata Ace', cost:3800, status:'delivered', date:'2026-04-20', progress:100, eta:'—' },
  { ref:'TR-CDF11', crop:'Groundnut', qty:'8T', pickup:'Ongole', delivery:'Guntur APMC', driver:'Narasimha Murthy', phone:'9876504567', vehicle:'Eicher Pro', cost:7200, status:'requested', date:'2026-04-27', progress:0, eta:'Pending' },
];

const ST = { available:{bg:'rgba(34,197,94,0.1)',c:'#22c55e',t:'Available'}, on_trip:{bg:'rgba(245,158,11,0.1)',c:'#f59e0b',t:'On Trip'}, in_transit:{bg:'rgba(245,158,11,0.1)',c:'#f59e0b',t:'In Transit'}, delivered:{bg:'rgba(34,197,94,0.1)',c:'#22c55e',t:'Delivered'}, requested:{bg:'rgba(139,92,246,0.1)',c:'#a78bfa',t:'Requested'} };

export default function TransportPage() {
  const [tab, setTab] = useState('vehicles');
  const [bookings, setBookings] = useState(BOOKINGS);
  const [typeFilter, setTypeFilter] = useState('all');
  const [locFilter, setLocFilter] = useState('All Locations');
  const [gpsDistrict, setGpsDistrict] = useState('');
  const [callModal, setCallModal] = useState(null);
  const [searchQ, setSearchQ] = useState('');

  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      const lat = pos.coords.latitude, lon = pos.coords.longitude;
      let best = DISTRICT_COORDS[0], minD = Infinity;
      DISTRICT_COORDS.forEach(d => { const dd = (d.lat-lat)**2 + (d.lon-lon)**2; if (dd < minD) { minD = dd; best = d; } });
      setGpsDistrict(best.n); setLocFilter(best.n);
    }, () => {}, { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 });
  }, []);

  let filtered = typeFilter === 'all' ? DRIVERS : DRIVERS.filter(d => d.type === typeFilter);
  if (locFilter !== 'All Locations') filtered = filtered.filter(d => d.district === locFilter);
  if (searchQ) filtered = filtered.filter(d => d.name.toLowerCase().includes(searchQ.toLowerCase()) || d.vehicle.toLowerCase().includes(searchQ.toLowerCase()) || d.loc.toLowerCase().includes(searchQ.toLowerCase()));
  const types = ['all', ...new Set(DRIVERS.map(d => d.type))];

  return (
    <div className="animated">
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,rgba(59,130,246,0.1),rgba(99,102,241,0.05))', border:'1px solid rgba(59,130,246,0.2)', borderRadius:14, padding:'18px 22px', marginBottom:20 }}>
        <div style={{ fontWeight:800, fontSize:'1.2rem' }}>🚚 Transport & Freight</div>
        <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>Find vehicles • Call drivers directly • Track shipments</div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:18 }}>
        {[
          { l:'Available Vehicles', v:DRIVERS.filter(d=>d.status==='available').length, i:'🚛', c:'#22c55e' },
          { l:'On Trip', v:DRIVERS.filter(d=>d.status==='on_trip').length, i:'📍', c:'#f59e0b' },
          { l:'My Bookings', v:bookings.length, i:'📋', c:'#3b82f6' },
          { l:'Total Drivers', v:DRIVERS.length, i:'👷', c:'#8b5cf6' },
        ].map(s=>(
          <div key={s.l} className="stat-card">
            <div style={{ fontSize:'1.5rem', marginBottom:6 }}>{s.i}</div>
            <div style={{ fontSize:'1.6rem', fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', fontWeight:600 }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:18 }}>
        {[['vehicles','🚛','Find Vehicle'],['bookings','📋','My Bookings'],['tracking','📡','Track Shipment']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'9px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight:700, background:tab===id?'linear-gradient(135deg,#3b82f6,#6366f1)':'var(--bg-card)', color:tab===id?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Vehicles Tab */}
      {tab==='vehicles' && (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap', alignItems:'center' }}>
            <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 Search vehicles, drivers..."
              style={{ flex:'1 1 180px', minWidth:160, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', boxSizing:'border-box' }} />
            <select value={locFilter} onChange={e => setLocFilter(e.target.value)}
              style={{ padding:'8px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.82rem' }}>
              {AP_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {gpsDistrict && <span style={{ fontSize:'0.72rem', color:'#22c55e', fontWeight:600 }}>📍 GPS: {gpsDistrict}</span>}
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>({filtered.length} vehicles)</span>
          </div>
          <div style={{ display:'flex', gap:6, marginBottom:14, flexWrap:'wrap' }}>
            {types.map(t=>(
              <button key={t} onClick={()=>setTypeFilter(t)} style={{ padding:'5px 12px', borderRadius:16, border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, background:typeFilter===t?'#3b82f6':'var(--bg-card)', color:typeFilter===t?'#fff':'var(--text-muted)' }}>
                {t === 'all' ? '🔄 All' : t}
              </button>
            ))}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(320px, 1fr))', gap:14 }}>
            {filtered.map(d=>(
              <div key={d.id} className="card" style={{ padding:16, border:`1px solid ${d.status==='available'?'rgba(34,197,94,0.2)':'rgba(245,158,11,0.2)'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:42, height:42, borderRadius:10, background:'rgba(59,130,246,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}>{d.icon}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.9rem' }}>{d.name}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📍 {d.loc} • ⭐ {d.rating} ({d.trips} trips)</div>
                    </div>
                  </div>
                  <span style={{ background:ST[d.status].bg, color:ST[d.status].c, padding:'3px 10px', borderRadius:10, fontSize:'0.68rem', fontWeight:700 }}>{ST[d.status].t}</span>
                </div>

                <div style={{ background:'var(--bg-primary)', borderRadius:8, padding:'10px 12px', marginBottom:10 }}>
                  <div style={{ fontSize:'0.78rem', fontWeight:600 }}>{d.vehicle}</div>
                  <div style={{ display:'flex', gap:12, marginTop:4 }}>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📦 {d.cap}</span>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>💰 ₹{d.rate}/km</span>
                    <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>🚗 {d.type}</span>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8 }}>
                  <a href={`tel:${d.phone}`} style={{ flex:1, padding:'9px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', cursor:'pointer', fontWeight:700, fontSize:'0.82rem', textAlign:'center', textDecoration:'none', display:'block' }}>
                    📞 Call Now
                  </a>
                  <button onClick={()=>setCallModal(d)} style={{ flex:1, padding:'9px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>
                    📋 Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Bookings Tab */}
      {tab==='bookings' && (
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {bookings.map(b=>(
            <div key={b.ref} className="card" style={{ padding:16 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div>
                  <span style={{ fontFamily:'monospace', fontWeight:800, color:'#3b82f6', fontSize:'0.9rem' }}>{b.ref}</span>
                  <span style={{ marginLeft:8, fontSize:'0.78rem', color:'var(--text-muted)' }}>{b.crop} ({b.qty})</span>
                </div>
                <span style={{ background:ST[b.status]?.bg, color:ST[b.status]?.c, padding:'4px 12px', borderRadius:10, fontSize:'0.72rem', fontWeight:700 }}>{ST[b.status]?.t}</span>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:10 }}>
                <div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600 }}>FROM</div><div style={{ fontSize:'0.82rem', fontWeight:600 }}>{b.pickup}</div></div>
                <div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600 }}>TO</div><div style={{ fontSize:'0.82rem', fontWeight:600 }}>{b.delivery}</div></div>
                <div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600 }}>COST</div><div style={{ fontSize:'0.95rem', fontWeight:800, color:'#22c55e' }}>₹{b.cost.toLocaleString()}</div></div>
              </div>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', background:'var(--bg-primary)', borderRadius:8 }}>
                <div style={{ fontSize:'0.78rem' }}>🚛 {b.driver} • {b.vehicle}</div>
                <a href={`tel:${b.phone}`} style={{ padding:'5px 12px', borderRadius:6, background:'rgba(34,197,94,0.1)', color:'#22c55e', fontWeight:700, fontSize:'0.75rem', textDecoration:'none' }}>📞 {b.phone}</a>
              </div>
              {b.status==='in_transit' && (
                <div style={{ marginTop:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:4 }}>
                    <span>{b.pickup}</span><span>ETA: {b.eta}</span><span>{b.delivery}</span>
                  </div>
                  <div style={{ height:8, background:'var(--border)', borderRadius:4, overflow:'hidden', position:'relative' }}>
                    <div style={{ height:'100%', width:`${b.progress}%`, background:'linear-gradient(90deg,#22c55e,#f59e0b)', borderRadius:4 }}/>
                  </div>
                  <div style={{ textAlign:'center', fontSize:'0.72rem', color:'#f59e0b', fontWeight:700, marginTop:4 }}>🚛 {b.progress}% complete</div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tracking Tab */}
      {tab==='tracking' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {bookings.filter(b=>b.status==='in_transit').length===0 ? (
            <div className="card" style={{ padding:48, textAlign:'center', color:'var(--text-muted)' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>📡</div>
              <div style={{ fontWeight:700 }}>No Active Shipments</div>
              <div style={{ fontSize:'0.82rem', marginTop:4 }}>Book transport to see live tracking</div>
            </div>
          ) : bookings.filter(b=>b.status==='in_transit').map(b=>(
            <div key={b.ref} className="card" style={{ padding:20, border:'1px solid rgba(245,158,11,0.3)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:'0.95rem' }}>🚛 {b.vehicle} — {b.crop} ({b.qty})</div>
                  <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>Ref: <span style={{ fontFamily:'monospace', color:'#3b82f6' }}>{b.ref}</span> • Driver: {b.driver}</div>
                </div>
                <a href={`tel:${b.phone}`} style={{ padding:'8px 14px', borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.8rem', textDecoration:'none', display:'flex', alignItems:'center', gap:4 }}>📞 Call</a>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:8 }}>
                <div style={{ textAlign:'center', minWidth:70 }}>
                  <div style={{ fontWeight:700, fontSize:'0.78rem' }}>{b.pickup}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.65rem' }}>📍 Start</div>
                </div>
                <div style={{ flex:1, position:'relative' }}>
                  <div style={{ height:8, background:'var(--border)', borderRadius:4 }}>
                    <div style={{ height:'100%', width:`${b.progress}%`, background:'linear-gradient(90deg,#22c55e,#f59e0b)', borderRadius:4 }}/>
                  </div>
                  <div style={{ position:'absolute', left:`${b.progress}%`, top:-16, transform:'translateX(-50%)', fontSize:'1.6rem' }}>🚛</div>
                </div>
                <div style={{ textAlign:'center', minWidth:70 }}>
                  <div style={{ fontWeight:700, fontSize:'0.78rem' }}>{b.delivery}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.65rem' }}>🏪 End</div>
                </div>
              </div>
              <div style={{ display:'flex', justifyContent:'center', gap:20, marginTop:8 }}>
                <div style={{ textAlign:'center' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Progress</div><div style={{ fontWeight:800, color:'#f59e0b' }}>{b.progress}%</div></div>
                <div style={{ textAlign:'center' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>ETA</div><div style={{ fontWeight:800, color:'#3b82f6' }}>{b.eta}</div></div>
                <div style={{ textAlign:'center' }}><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Cost</div><div style={{ fontWeight:800, color:'#22c55e' }}>₹{b.cost.toLocaleString()}</div></div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Driver Details Modal */}
      {callModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={()=>setCallModal(null)}>
          <div className="card" style={{ width:400, padding:24 }} onClick={e=>e.stopPropagation()}>
            <div style={{ textAlign:'center', marginBottom:16 }}>
              <div style={{ width:60, height:60, borderRadius:14, background:'rgba(59,130,246,0.1)', display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', marginBottom:8 }}>{callModal.icon}</div>
              <div style={{ fontWeight:800, fontSize:'1.1rem' }}>{callModal.name}</div>
              <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>📍 {callModal.loc} • ⭐ {callModal.rating}/5</div>
            </div>
            <div style={{ background:'var(--bg-primary)', borderRadius:10, padding:14, marginBottom:14 }}>
              <div style={{ fontSize:'0.85rem', fontWeight:700, marginBottom:6 }}>🚛 Vehicle Details</div>
              <div style={{ fontSize:'0.82rem', marginBottom:4 }}>{callModal.vehicle}</div>
              <div style={{ display:'flex', gap:12 }}>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Type: {callModal.type}</span>
                <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Capacity: {callModal.cap}</span>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10, marginBottom:16 }}>
              <div style={{ textAlign:'center', padding:8, background:'var(--bg-primary)', borderRadius:8 }}><div style={{ fontWeight:800, color:'#3b82f6' }}>₹{callModal.rate}/km</div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Rate</div></div>
              <div style={{ textAlign:'center', padding:8, background:'var(--bg-primary)', borderRadius:8 }}><div style={{ fontWeight:800, color:'#22c55e' }}>{callModal.trips}</div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Trips</div></div>
              <div style={{ textAlign:'center', padding:8, background:'var(--bg-primary)', borderRadius:8 }}><div style={{ fontWeight:800, color:'#f59e0b' }}>⭐ {callModal.rating}</div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Rating</div></div>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <a href={`tel:${callModal.phone}`} style={{ flex:1, padding:12, borderRadius:10, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:800, fontSize:'0.95rem', textAlign:'center', textDecoration:'none' }}>📞 Call {callModal.phone}</a>
              <a href={`https://wa.me/91${callModal.phone}`} target="_blank" rel="noreferrer" style={{ padding:'12px 16px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, textDecoration:'none' }}>💬</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
