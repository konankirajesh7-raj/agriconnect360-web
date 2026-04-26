import React, { useState } from 'react';

const VEHICLES = [
  { type:'Mini Truck', capacity:'3-5 tonnes', rate:25, icon:'🚐', minKm:5 },
  { type:'Medium Truck', capacity:'5-10 tonnes', rate:35, icon:'🚛', minKm:10 },
  { type:'Large Truck', capacity:'10-20 tonnes', rate:50, icon:'🚚', minKm:15 },
  { type:'Tractor Trolley', capacity:'2-3 tonnes', rate:15, icon:'🚜', minKm:3 },
];
const AP_LOCATIONS = [
  'Guntur APMC Market','Narasaraopet, Guntur','Tenali, Guntur','Vijayawada, Krishna',
  'Nellore, Nellore','Kurnool APMC','Ongole, Prakasam','Rajahmundry, East Godavari',
  'Visakhapatnam Mandi','Tirupati APMC','Anantapur Mandi','Kadapa Mandi',
];
const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 };

const BLANK = { pickup:'Narasaraopet, Guntur', delivery:'Guntur APMC Market', cargo:'15', vehicle:'Mini Truck', crop:'Paddy' };

function estimateDistance(from, to) {
  if (!from || !to || from===to) return 0;
  const d = { 'Guntur APMC Market':0, 'Narasaraopet, Guntur':38, 'Tenali, Guntur':25, 'Vijayawada, Krishna':58, 'Nellore, Nellore':162, 'Kurnool APMC':210, 'Ongole, Prakasam':120 };
  return Math.abs((d[from]||50) - (d[to]||0)) || 45;
}

export default function TransportPage() {
  const [tab, setTab] = useState('calculator');
  const [form, setForm] = useState(BLANK);
  const [result, setResult] = useState(null);
  const [bookings, setBookings] = useState([
    { ref:'TR-KQM29', crop:'Paddy', qty:5.5, pickup:'Narasaraopet, Guntur', delivery:'Guntur APMC Market', vehicle:'Mini Truck', cost:4200, status:'in_transit', eta:'2:30 PM', date:'2026-04-25' },
    { ref:'TR-VBN44', crop:'Cotton', qty:2.0, pickup:'Tenali, Guntur', delivery:'Vijayawada, Krishna', vehicle:'Medium Truck', cost:3800, status:'delivered', eta:null, date:'2026-04-20' },
  ]);

  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const calculate = () => {
    const dist = estimateDistance(form.pickup, form.delivery) || 45;
    const veh = VEHICLES.find(v=>v.type===form.vehicle) || VEHICLES[0];
    const cargo = parseFloat(form.cargo)||15;
    const baseCost = dist * veh.rate;
    const loadCost = cargo * 12;
    const total = baseCost + loadCost;
    const options = VEHICLES.map(v=>({ ...v, cost: dist*v.rate + cargo*12 }));
    setResult({ dist, cargo, total, options, duration: Math.ceil(dist/45) + 'h ' + Math.round((dist/45%1)*60) + 'm' });
  };

  const book = () => {
    const ref = 'TR-' + Math.random().toString(36).substring(2,7).toUpperCase();
    const entry = { ref, crop:form.crop, qty:parseFloat(form.cargo)/10, pickup:form.pickup, delivery:form.delivery, vehicle:form.vehicle, cost:result?.total||0, status:'requested', eta:null, date:new Date().toISOString().split('T')[0] };
    setBookings(p=>[entry,...p]);
    setTab('bookings');
    setResult(null);
  };

  const STATUS_COLOR = { in_transit:'#f59e0b', delivered:'#22c55e', requested:'#8b5cf6', cancelled:'#ef4444' };
  const STATUS_ICON = { in_transit:'🚛', delivered:'✅', requested:'📋', cancelled:'❌' };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🚚 Transport & Freight</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>Farm-to-market transport · Freight calculator · Live tracking</div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Active Trips', value:bookings.filter(b=>b.status==='in_transit').length, icon:'🚛', color:'#f59e0b' },
          { label:'Completed', value:bookings.filter(b=>b.status==='delivered').length, icon:'✅', color:'#22c55e' },
          { label:'Available Vehicles', value:VEHICLES.length, icon:'🚐', color:'#3b82f6' },
          { label:'Districts Covered', value:12, icon:'📍', color:'#8b5cf6' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {[['calculator','🧮','Freight Calculator'],['bookings','📋','My Bookings'],['tracking','📡','Live Tracking']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'10px 18px', borderRadius:'var(--radius-sm)', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, background:tab===id?'var(--text-primary)':'var(--bg-card)', color:tab===id?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Freight Calculator */}
      {tab==='calculator' && (
        <div style={{ display:'grid', gridTemplateColumns:'420px 1fr', gap:20 }}>
          <div className="card" style={{ padding:24 }}>
            <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:18 }}>🧮 Freight Calculator</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={LBL}>Pickup Location *</label>
                <select value={form.pickup} onChange={e=>upd('pickup',e.target.value)} style={INP}>
                  {AP_LOCATIONS.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>Delivery Location *</label>
                <select value={form.delivery} onChange={e=>upd('delivery',e.target.value)} style={INP}>
                  {AP_LOCATIONS.map(l=><option key={l}>{l}</option>)}
                </select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div>
                  <label style={LBL}>Cargo (Quintals) *</label>
                  <input type="number" min="1" value={form.cargo} onChange={e=>upd('cargo',e.target.value)} style={INP} placeholder="15"/>
                </div>
                <div>
                  <label style={LBL}>Crop Type</label>
                  <select value={form.crop} onChange={e=>upd('crop',e.target.value)} style={INP}>
                    {['Paddy','Cotton','Groundnut','Maize','Chilli','Wheat','Sugarcane'].map(c=><option key={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label style={LBL}>Preferred Vehicle</label>
                <select value={form.vehicle} onChange={e=>upd('vehicle',e.target.value)} style={INP}>
                  {VEHICLES.map(v=><option key={v.type}>{v.type} ({v.capacity})</option>)}
                </select>
              </div>
              <button className="btn btn-primary" style={{ padding:12, fontSize:'0.95rem' }} onClick={calculate}>
                🧮 Calculate Freight Cost
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            {!result && (
              <div className="card" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
                <div style={{ fontSize:'3rem', marginBottom:16 }}>🚚</div>
                <div style={{ fontWeight:600, marginBottom:8 }}>Ready to Calculate</div>
                <div style={{ fontSize:'0.82rem' }}>Fill in pickup, delivery, cargo details and click Calculate</div>
              </div>
            )}
            {result && (
              <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
                {/* Summary */}
                <div className="card" style={{ padding:20 }}>
                  <div style={{ fontWeight:700, marginBottom:12, color:'#22c55e' }}>📦 Route Summary</div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:12, textAlign:'center', marginBottom:14 }}>
                    <div style={{ background:'var(--bg-primary)', borderRadius:8, padding:12 }}>
                      <div style={{ fontSize:'1.4rem' }}>📍</div>
                      <div style={{ fontSize:'0.82rem', fontWeight:700, marginTop:4 }}>{result.dist} km</div>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Distance</div>
                    </div>
                    <div style={{ background:'var(--bg-primary)', borderRadius:8, padding:12 }}>
                      <div style={{ fontSize:'1.4rem' }}>⏱</div>
                      <div style={{ fontSize:'0.82rem', fontWeight:700, marginTop:4 }}>{result.duration}</div>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Est. Time</div>
                    </div>
                    <div style={{ background:'var(--bg-primary)', borderRadius:8, padding:12 }}>
                      <div style={{ fontSize:'1.4rem' }}>📦</div>
                      <div style={{ fontSize:'0.82rem', fontWeight:700, marginTop:4 }}>{result.cargo} qtl</div>
                      <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Cargo</div>
                    </div>
                  </div>
                  <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:8, padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>Estimated Total Cost</div>
                    <div style={{ fontSize:'1.5rem', fontWeight:800, color:'#22c55e' }}>₹{result.total.toLocaleString()}</div>
                  </div>
                </div>

                {/* Vehicle options */}
                <div className="card" style={{ padding:20 }}>
                  <div style={{ fontWeight:700, marginBottom:12 }}>🚐 Vehicle Options (All Prices)</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {result.options.map(v=>(
                      <div key={v.type} onClick={()=>upd('vehicle',v.type)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 14px', borderRadius:8, border:`2px solid ${form.vehicle===v.type?'#22c55e':'var(--border)'}`, background:form.vehicle===v.type?'rgba(34,197,94,0.06)':'var(--bg-primary)', cursor:'pointer', transition:'all 0.2s' }}>
                        <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                          <span style={{ fontSize:'1.4rem' }}>{v.icon}</span>
                          <div>
                            <div style={{ fontWeight:600, fontSize:'0.88rem' }}>{v.type}</div>
                            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{v.capacity}</div>
                          </div>
                        </div>
                        <div style={{ fontWeight:800, color:'#22c55e', fontSize:'1.05rem' }}>₹{v.cost.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button className="btn btn-primary" style={{ padding:14, fontSize:'1rem' }} onClick={book}>
                  🚀 Book Transport Now
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings */}
      {tab==='bookings' && (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Ref</th><th>Crop</th><th>Pickup</th><th>Delivery</th><th>Vehicle</th><th>Cost</th><th>Date</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map(b=>(
                  <tr key={b.ref}>
                    <td style={{ fontWeight:700, color:'#8b5cf6' }}>{b.ref}</td>
                    <td>{b.crop}</td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{b.pickup}</td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{b.delivery}</td>
                    <td>{b.vehicle}</td>
                    <td style={{ fontWeight:700, color:'#22c55e' }}>₹{b.cost.toLocaleString()}</td>
                    <td>{b.date}</td>
                    <td><span style={{ color:STATUS_COLOR[b.status]||'#888', fontWeight:700, fontSize:'0.78rem' }}>{STATUS_ICON[b.status]} {b.status.replace('_',' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Tracking */}
      {tab==='tracking' && (
        <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
          {bookings.filter(b=>b.status==='in_transit').length===0 ? (
            <div className="card" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
              <div style={{ fontSize:'3rem', marginBottom:12 }}>📡</div>
              <div style={{ fontWeight:600 }}>No active trips to track</div>
            </div>
          ) : bookings.filter(b=>b.status==='in_transit').map(b=>(
            <div key={b.ref} className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                <div>
                  <div style={{ fontWeight:700 }}>🚛 {b.vehicle} — {b.crop}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>Ref: {b.ref} · ETA: {b.eta||'Calculating...'}</div>
                </div>
                <span style={{ background:'rgba(245,158,11,0.1)', color:'#f59e0b', padding:'4px 12px', borderRadius:12, fontWeight:700, fontSize:'0.78rem' }}>IN TRANSIT</span>
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ textAlign:'center', fontSize:'0.78rem' }}>
                  <div style={{ fontWeight:700 }}>{b.pickup}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.68rem' }}>Pickup</div>
                </div>
                <div style={{ flex:1, position:'relative' }}>
                  <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                    <div style={{ height:'100%', width:'60%', background:'linear-gradient(90deg,#22c55e,#f59e0b)', borderRadius:2 }}/>
                  </div>
                  <div style={{ position:'absolute', left:'60%', top:-8, transform:'translateX(-50%)', fontSize:'1.2rem' }}>🚛</div>
                </div>
                <div style={{ textAlign:'center', fontSize:'0.78rem' }}>
                  <div style={{ fontWeight:700 }}>{b.delivery}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.68rem' }}>Destination</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
