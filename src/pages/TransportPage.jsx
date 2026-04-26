import React, { useState } from 'react';

const VEHICLES = [
  { type:'Tractor Trolley', capacity:'2-3 tonnes', rate:15, icon:'🚜', minKm:3, features:'Best for short distances, farm pickup' },
  { type:'Mini Truck', capacity:'3-5 tonnes', rate:25, icon:'🚐', minKm:5, features:'Ideal for APMC deliveries within district' },
  { type:'Medium Truck', capacity:'5-10 tonnes', rate:35, icon:'🚛', minKm:10, features:'Cross-district transport, bulk crops' },
  { type:'Large Truck', capacity:'10-20 tonnes', rate:50, icon:'🚚', minKm:15, features:'Long-distance interstate transport' },
];
const AP_ROUTES = [
  { from:'Narasaraopet, Guntur', to:'Guntur APMC Market', dist:38 },
  { from:'Tenali, Guntur', to:'Guntur APMC Market', dist:25 },
  { from:'Narasaraopet, Guntur', to:'Vijayawada, Krishna', dist:72 },
  { from:'Guntur, Guntur', to:'Vijayawada, Krishna', dist:58 },
  { from:'Ongole, Prakasam', to:'Guntur APMC Market', dist:120 },
  { from:'Nellore, Nellore', to:'Chennai, Tamil Nadu', dist:175 },
  { from:'Kurnool, Kurnool', to:'Hyderabad, Telangana', dist:212 },
];
const AP_LOCS = ['Narasaraopet, Guntur','Tenali, Guntur','Guntur, Guntur','Vijayawada, Krishna','Ongole, Prakasam','Nellore, Nellore','Kurnool, Kurnool','Rajahmundry, East Godavari','Visakhapatnam, Vizag','Tirupati, Chittoor','Anantapur, Anantapur','Guntur APMC Market','Kurnool APMC','Vijayawada Mandi'];
const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.73rem', color:'var(--text-muted)', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' };
const STATUS_STYLE = { in_transit:{ bg:'rgba(245,158,11,0.1)', color:'#f59e0b', icon:'🚛' }, delivered:{ bg:'rgba(34,197,94,0.1)', color:'#22c55e', icon:'✅' }, requested:{ bg:'rgba(139,92,246,0.1)', color:'#a78bfa', icon:'📋' }, cancelled:{ bg:'rgba(239,68,68,0.1)', color:'#ef4444', icon:'❌' } };
const BLANK = { pickup:AP_LOCS[0], delivery:AP_LOCS[11], cargo:'15', vehicle:'Mini Truck', crop:'Paddy', date:new Date(Date.now()+86400000).toISOString().split('T')[0], contact:'', notes:'' };

function getRoute(from, to) {
  const r = AP_ROUTES.find(r=>r.from===from&&r.to===to)||AP_ROUTES.find(r=>r.from===to&&r.to===from);
  if (r) return r.dist;
  const idx1=AP_LOCS.indexOf(from), idx2=AP_LOCS.indexOf(to);
  return Math.abs(idx1-idx2)*28+22;
}

export default function TransportPage() {
  const [tab, setTab] = useState('calculator');
  const [form, setForm] = useState(BLANK);
  const [result, setResult] = useState(null);
  const [bookings, setBookings] = useState([
    { ref:'TR-KQM29', crop:'Paddy', qty:5.5, pickup:'Narasaraopet, Guntur', delivery:'Guntur APMC Market', vehicle:'Mini Truck', cost:4200, status:'in_transit', date:'2026-04-25', progress:60 },
    { ref:'TR-VBN44', crop:'Cotton', qty:2.0, pickup:'Tenali, Guntur', delivery:'Vijayawada, Krishna', vehicle:'Medium Truck', cost:3800, status:'delivered', date:'2026-04-20', progress:100 },
    { ref:'TR-CDF11', crop:'Groundnut', qty:8.0, pickup:'Ongole, Prakasam', delivery:'Guntur APMC Market', vehicle:'Large Truck', cost:7200, status:'requested', date:'2026-04-27', progress:5 },
  ]);
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const calculate = () => {
    if (form.pickup===form.delivery) return;
    const dist = getRoute(form.pickup, form.delivery);
    const cargo = parseFloat(form.cargo)||15;
    const options = VEHICLES.map(v=>({ ...v, cost: Math.round(dist*v.rate + cargo*12), gst: Math.round((dist*v.rate+cargo*12)*0.05), total: Math.round((dist*v.rate+cargo*12)*1.05) }));
    const chosen = options.find(v=>v.type===form.vehicle)||options[1];
    setResult({ dist, cargo, chosen, options, duration:`${Math.floor(dist/45)}h ${Math.round((dist/45%1)*60)}m`, pickup:form.pickup, delivery:form.delivery });
  };

  const book = () => {
    if (!result) return;
    const ref='TR-'+Math.random().toString(36).substring(2,7).toUpperCase();
    setBookings(p=>[{ ref, crop:form.crop, qty:parseFloat(form.cargo)/10, pickup:form.pickup, delivery:form.delivery, vehicle:form.vehicle, cost:result.chosen.total, status:'requested', date:form.date, progress:0 },...p]);
    setTab('bookings'); setResult(null);
  };

  return (
    <div className="animated">
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,rgba(59,130,246,0.08),rgba(99,102,241,0.04))', border:'1px solid rgba(59,130,246,0.2)', borderRadius:16, padding:'20px 24px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:'1.35rem' }}>🚚 Transport & Freight</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>Farm-to-APMC transport · Real-time tracking · GST-inclusive pricing</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <span style={{ background:'rgba(245,158,11,0.1)', color:'#f59e0b', padding:'6px 14px', borderRadius:20, fontSize:'0.78rem', fontWeight:700 }}>🚛 {bookings.filter(b=>b.status==='in_transit').length} Active</span>
          <span style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'6px 14px', borderRadius:20, fontSize:'0.78rem', fontWeight:700 }}>✅ {bookings.filter(b=>b.status==='delivered').length} Delivered</span>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Active Trips', value:bookings.filter(b=>b.status==='in_transit').length, icon:'🚛', color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
          { label:'Delivered', value:bookings.filter(b=>b.status==='delivered').length, icon:'✅', color:'#22c55e', bg:'rgba(34,197,94,0.08)' },
          { label:'Vehicle Types', value:VEHICLES.length, icon:'🚐', color:'#3b82f6', bg:'rgba(59,130,246,0.08)' },
          { label:'Routes Covered', value:AP_ROUTES.length+'+', icon:'🗺', color:'#8b5cf6', bg:'rgba(139,92,246,0.08)' },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{ background:s.bg, border:`1px solid ${s.bg.replace('0.08','0.2')}` }}>
            <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:22 }}>
        {[['calculator','🧮','Freight Calculator'],['bookings','📋','My Bookings'],['tracking','📡','Live Tracking']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'10px 20px', borderRadius:24, border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, background:tab===id?'linear-gradient(135deg,#3b82f6,#6366f1)':'var(--bg-card)', color:tab===id?'#fff':'var(--text-muted)', boxShadow:tab===id?'0 4px 12px rgba(59,130,246,0.35)':'none', transition:'all 0.2s' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Freight Calculator */}
      {tab==='calculator' && (
        <div style={{ display:'grid', gridTemplateColumns:'380px 1fr', gap:20 }}>
          {/* Form */}
          <div className="card" style={{ padding:24 }}>
            <div style={{ fontWeight:800, fontSize:'0.95rem', marginBottom:18 }}>🧮 Calculate Freight</div>
            <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
              <div>
                <label style={LBL}>Pickup Location *</label>
                <select value={form.pickup} onChange={e=>upd('pickup',e.target.value)} style={INP}>{AP_LOCS.map(l=><option key={l}>{l}</option>)}</select>
              </div>
              <div style={{ textAlign:'center', color:'var(--text-muted)', fontSize:'1.4rem' }}>↕</div>
              <div>
                <label style={LBL}>Delivery Location *</label>
                <select value={form.delivery} onChange={e=>upd('delivery',e.target.value)} style={INP}>{AP_LOCS.map(l=><option key={l}>{l}</option>)}</select>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
                <div><label style={LBL}>Cargo (Quintals)</label><input type="number" min="1" value={form.cargo} onChange={e=>upd('cargo',e.target.value)} style={INP}/></div>
                <div><label style={LBL}>Crop</label>
                  <select value={form.crop} onChange={e=>upd('crop',e.target.value)} style={INP}>{['Paddy','Cotton','Groundnut','Maize','Chilli','Wheat','Sugarcane'].map(c=><option key={c}>{c}</option>)}</select>
                </div>
              </div>
              <div>
                <label style={LBL}>Date of Transport</label>
                <input type="date" value={form.date} onChange={e=>upd('date',e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>Preferred Vehicle</label>
                <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
                  {VEHICLES.map(v=>(
                    <div key={v.type} onClick={()=>upd('vehicle',v.type)} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'8px 12px', borderRadius:8, border:`2px solid ${form.vehicle===v.type?'#3b82f6':'var(--border)'}`, background:form.vehicle===v.type?'rgba(59,130,246,0.06)':'var(--bg-primary)', cursor:'pointer', transition:'all 0.15s' }}>
                      <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                        <span style={{ fontSize:'1.2rem' }}>{v.icon}</span>
                        <div><div style={{ fontWeight:700, fontSize:'0.82rem' }}>{v.type}</div><div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{v.capacity}</div></div>
                      </div>
                      <span style={{ fontSize:'0.78rem', fontWeight:700, color:form.vehicle===v.type?'#3b82f6':'var(--text-muted)' }}>₹{v.rate}/km</span>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={calculate} disabled={form.pickup===form.delivery} style={{ padding:13, borderRadius:10, border:'none', background:'linear-gradient(135deg,#3b82f6,#6366f1)', color:'#fff', cursor:'pointer', fontWeight:800, fontSize:'0.95rem', boxShadow:'0 6px 20px rgba(59,130,246,0.35)', opacity:form.pickup===form.delivery?0.5:1 }}>
                🧮 Calculate Freight Cost
              </button>
            </div>
          </div>

          {/* Results */}
          <div>
            {!result ? (
              <div className="card" style={{ padding:48, textAlign:'center', color:'var(--text-muted)', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:300 }}>
                <div style={{ fontSize:'4rem', marginBottom:16 }}>🚚</div>
                <div style={{ fontWeight:700, fontSize:'1.05rem', marginBottom:8 }}>Ready to Calculate</div>
                <div style={{ fontSize:'0.82rem', lineHeight:1.6 }}>Select pickup, delivery, cargo details<br/>and click Calculate Freight Cost</div>
              </div>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                {/* Route card */}
                <div className="card" style={{ padding:22 }}>
                  <div style={{ fontWeight:800, marginBottom:16, color:'#3b82f6' }}>📍 Route Details</div>
                  <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18 }}>
                    <div style={{ flex:1, background:'rgba(59,130,246,0.06)', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase' }}>From</div>
                      <div style={{ fontWeight:800, fontSize:'0.88rem', marginTop:4 }}>{result.pickup}</div>
                    </div>
                    <div style={{ fontSize:'0.9rem', color:'var(--text-muted)' }}>→</div>
                    <div style={{ flex:1, background:'rgba(34,197,94,0.06)', borderRadius:10, padding:'12px 14px', textAlign:'center' }}>
                      <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase' }}>To</div>
                      <div style={{ fontWeight:800, fontSize:'0.88rem', marginTop:4 }}>{result.delivery}</div>
                    </div>
                  </div>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:10 }}>
                    {[['Distance',`${result.dist} km`,'📍'],['Est. Time',result.duration,'⏱'],['Cargo',`${result.cargo} Qtl`,'📦']].map(([k,v,i])=>(
                      <div key={k} style={{ background:'var(--bg-primary)', borderRadius:8, padding:'12px', textAlign:'center' }}>
                        <div style={{ fontSize:'1.4rem', marginBottom:4 }}>{i}</div>
                        <div style={{ fontWeight:800, fontSize:'0.9rem' }}>{v}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{k}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Cost breakdown */}
                <div className="card" style={{ padding:22 }}>
                  <div style={{ fontWeight:800, marginBottom:14, color:'#22c55e' }}>💰 Selected: {result.chosen.icon} {result.chosen.type}</div>
                  {[['Base Freight',`₹${result.chosen.cost.toLocaleString()}`],['GST (5%)',`₹${result.chosen.gst.toLocaleString()}`],['Total Payable',`₹${result.chosen.total.toLocaleString()}`]].map(([k,v],i)=>(
                    <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<2?'1px solid var(--border)':'none' }}>
                      <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{k}</span>
                      <span style={{ fontWeight:i===2?900:700, color:i===2?'#22c55e':'var(--text-primary)', fontSize:i===2?'1.15rem':'0.88rem' }}>{v}</span>
                    </div>
                  ))}
                </div>

                {/* All vehicle options */}
                <div className="card" style={{ padding:22 }}>
                  <div style={{ fontWeight:800, marginBottom:12 }}>🚐 All Vehicle Options</div>
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                    {result.options.map(v=>(
                      <div key={v.type} onClick={()=>upd('vehicle',v.type)} style={{ padding:'12px 14px', borderRadius:10, border:`2px solid ${form.vehicle===v.type?'#3b82f6':'var(--border)'}`, background:form.vehicle===v.type?'rgba(59,130,246,0.06)':'var(--bg-primary)', cursor:'pointer', transition:'all 0.2s' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:4 }}>
                          <span style={{ fontSize:'1.3rem' }}>{v.icon}</span>
                          <span style={{ fontWeight:800, color:form.vehicle===v.type?'#3b82f6':'#22c55e', fontSize:'1rem' }}>₹{v.total.toLocaleString()}</span>
                        </div>
                        <div style={{ fontWeight:700, fontSize:'0.82rem' }}>{v.type}</div>
                        <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{v.capacity} · {v.features}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <button onClick={book} style={{ padding:15, borderRadius:12, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', cursor:'pointer', fontWeight:800, fontSize:'1rem', boxShadow:'0 8px 24px rgba(34,197,94,0.4)' }}>
                  🚀 Book Transport · Get Tracking Code
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bookings */}
      {tab==='bookings' && (
        <div className="card">
          <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)' }}>
            <div style={{ fontWeight:700 }}>📋 My Transport Bookings ({bookings.length})</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Tracking Ref</th><th>Crop</th><th>Route</th><th>Vehicle</th><th>Date</th><th>Cost</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map(b=>(
                  <tr key={b.ref}>
                    <td style={{ fontWeight:800, color:'#3b82f6', fontFamily:'monospace' }}>{b.ref}</td>
                    <td style={{ fontWeight:600 }}>{b.crop} <span style={{ color:'var(--text-muted)', fontWeight:400, fontSize:'0.75rem' }}>({b.qty}T)</span></td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{b.pickup} → {b.delivery}</td>
                    <td>{b.vehicle}</td>
                    <td>{b.date}</td>
                    <td style={{ fontWeight:800, color:'#22c55e' }}>₹{b.cost.toLocaleString()}</td>
                    <td><span style={{ background:STATUS_STYLE[b.status]?.bg, color:STATUS_STYLE[b.status]?.color, padding:'3px 10px', borderRadius:10, fontSize:'0.72rem', fontWeight:700 }}>{STATUS_STYLE[b.status]?.icon} {b.status.replace('_',' ')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Live Tracking */}
      {tab==='tracking' && (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {bookings.filter(b=>b.status==='in_transit').length===0 ? (
            <div className="card" style={{ padding:48, textAlign:'center', color:'var(--text-muted)', display:'flex', flexDirection:'column', alignItems:'center' }}>
              <div style={{ fontSize:'4rem', marginBottom:12 }}>📡</div>
              <div style={{ fontWeight:700, fontSize:'1.05rem' }}>No Active Trips</div>
              <div style={{ fontSize:'0.82rem', marginTop:4 }}>Book a transport to see live tracking here</div>
            </div>
          ) : bookings.filter(b=>b.status==='in_transit').map(b=>(
            <div key={b.ref} className="card" style={{ padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                <div>
                  <div style={{ fontWeight:800, fontSize:'0.95rem' }}>{STATUS_STYLE[b.status]?.icon} {b.vehicle} — {b.crop} ({b.qty}T)</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>Tracking Ref: <span style={{ fontFamily:'monospace', color:'#3b82f6' }}>{b.ref}</span></div>
                </div>
                <span style={{ background:'rgba(245,158,11,0.1)', color:'#f59e0b', padding:'5px 14px', borderRadius:12, fontWeight:800, fontSize:'0.8rem' }}>IN TRANSIT</span>
              </div>
              {/* Route progress */}
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ textAlign:'center', minWidth:80 }}>
                  <div style={{ fontWeight:700, fontSize:'0.78rem' }}>{b.pickup}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.65rem' }}>📍 Pickup</div>
                </div>
                <div style={{ flex:1, position:'relative' }}>
                  <div style={{ height:6, background:'var(--border)', borderRadius:3 }}>
                    <div style={{ height:'100%', width:`${b.progress}%`, background:'linear-gradient(90deg,#22c55e,#f59e0b)', borderRadius:3, transition:'width 0.5s' }}/>
                  </div>
                  <div style={{ position:'absolute', left:`${b.progress}%`, top:-14, transform:'translateX(-50%)', fontSize:'1.4rem' }}>🚛</div>
                  <div style={{ textAlign:'center', marginTop:8, fontSize:'0.68rem', color:'var(--text-muted)' }}>{b.progress}% complete</div>
                </div>
                <div style={{ textAlign:'center', minWidth:80 }}>
                  <div style={{ fontWeight:700, fontSize:'0.78rem' }}>{b.delivery}</div>
                  <div style={{ color:'var(--text-muted)', fontSize:'0.65rem' }}>🏪 Destination</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
