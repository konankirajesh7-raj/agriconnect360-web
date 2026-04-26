import React, { useState } from 'react';

const EQUIPMENT = [
  { id:1, name:'Tractor (45HP)', type:'Tractor', brand:'Mahindra 575', rate:1200, unit:'hr', available:true, condition:'Excellent', location:'Guntur', owner:'Rajesh K.', rating:4.7, reviews:23 },
  { id:2, name:'Power Sprayer', type:'Spraying', brand:'Honda GX35', rate:450, unit:'hr', available:true, condition:'Good', location:'Narasaraopet', owner:'Suresh M.', rating:4.5, reviews:15 },
  { id:3, name:'Rotavator', type:'Tillage', brand:'Fieldking FKROT', rate:900, unit:'hr', available:true, condition:'Good', location:'Tenali', owner:'Anil P.', rating:4.3, reviews:8 },
  { id:4, name:'Harvester (Custom)', type:'Harvesting', brand:'John Deere', rate:2800, unit:'acre', available:true, condition:'Excellent', location:'Kurnool', owner:'Vijay D.', rating:4.9, reviews:31 },
  { id:5, name:'Seed Drill', type:'Sowing', brand:'National Agro', rate:600, unit:'hr', available:false, condition:'Good', location:'Ongole', owner:'Ramesh B.', rating:4.2, reviews:6 },
  { id:6, name:'Thresher', type:'Harvesting', brand:'VST ST-1500', rate:800, unit:'hr', available:true, condition:'Fair', location:'Nellore', owner:'Mohan S.', rating:4.0, reviews:12 },
  { id:7, name:'Mini Tractor (25HP)', type:'Tractor', brand:'Kubota B2441', rate:800, unit:'hr', available:true, condition:'Excellent', location:'Guntur', owner:'Lakshmi A.', rating:4.6, reviews:19 },
  { id:8, name:'Drip Irrigation Kit', type:'Irrigation', brand:'Jain Irrigation', rate:300, unit:'hr', available:true, condition:'Good', location:'Vijayawada', owner:'Krishna R.', rating:4.4, reviews:11 },
];
const CATEGORIES = ['All','Tractor','Tillage','Spraying','Sowing','Harvesting','Irrigation'];
const TYPE_ICONS = { Tractor:'🚜', Tillage:'⚙️', Spraying:'💧', Sowing:'🌱', Harvesting:'🌾', Irrigation:'🔧' };
const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };

export default function EquipmentPage() {
  const [filter, setFilter] = useState('All');
  const [selected, setSelected] = useState(null);
  const [booking, setBooking] = useState({ date: new Date(Date.now()+86400000).toISOString().split('T')[0], days:2, hours:4, payment:'upi' });
  const [confirmed, setConfirmed] = useState(null);

  const filtered = filter==='All' ? EQUIPMENT : EQUIPMENT.filter(e=>e.type===filter);

  const totalCost = selected
    ? selected.unit==='acre'
      ? selected.rate * parseFloat(booking.days||1)
      : selected.rate * parseFloat(booking.hours||1) * parseFloat(booking.days||1)
    : 0;

  const confirmBooking = () => {
    const ref = 'EQ-' + Math.random().toString(36).substring(2,8).toUpperCase();
    setConfirmed({ ref, equipment: selected.name, date: booking.date, total: totalCost });
    setSelected(null);
  };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🚜 Equipment Marketplace</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>Rent tractors, harvesters & farm equipment by the hour or day</div>
        </div>
      </div>

      {/* Booking Confirmed Banner */}
      {confirmed && (
        <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:10, padding:'16px 20px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700, color:'#22c55e', marginBottom:4 }}>✅ Booking Confirmed!</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{confirmed.equipment} · {confirmed.date} · Ref: <strong>{confirmed.ref}</strong> · Total: <strong>₹{confirmed.total.toLocaleString()}</strong></div>
          </div>
          <button onClick={()=>setConfirmed(null)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'6px 12px', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.78rem' }}>✕ Close</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Available Now', value: EQUIPMENT.filter(e=>e.available).length, icon:'✅', color:'#22c55e' },
          { label:'Total Equipment', value: EQUIPMENT.length, icon:'🚜', color:'#3b82f6' },
          { label:'Avg Rating', value:'4.5 ⭐', icon:'⭐', color:'#f59e0b' },
          { label:'Districts Covered', value:6, icon:'📍', color:'#8b5cf6' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Category Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {CATEGORIES.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{ padding:'7px 16px', borderRadius:20, border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight:600, background:filter===c?'#22c55e':'var(--bg-card)', color:filter===c?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>
            {TYPE_ICONS[c]||'📋'} {c}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:16 }}>
        {filtered.map(eq=>(
          <div key={eq.id} className="card" style={{ padding:20, opacity:eq.available?1:0.6, position:'relative' }}>
            {!eq.available && <span style={{ position:'absolute', top:12, right:12, background:'#ef4444', color:'#fff', padding:'3px 8px', borderRadius:10, fontSize:'0.65rem', fontWeight:700 }}>BOOKED</span>}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
              <div style={{ fontSize:'2.2rem' }}>{TYPE_ICONS[eq.type]||'🔧'}</div>
              <span style={{ background:`rgba(${eq.condition==='Excellent'?'34,197,94':eq.condition==='Good'?'245,158,11':'239,68,68'},0.1)`, color:`${eq.condition==='Excellent'?'#22c55e':eq.condition==='Good'?'#f59e0b':'#ef4444'}`, padding:'3px 10px', borderRadius:10, fontSize:'0.7rem', fontWeight:700 }}>{eq.condition}</span>
            </div>
            <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:2 }}>{eq.name}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:8 }}>{eq.brand} · {eq.location}</div>
            <div style={{ fontSize:'1.3rem', fontWeight:800, color:'#22c55e', marginBottom:4 }}>₹{eq.rate.toLocaleString()}<span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>/{eq.unit}</span></div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:12 }}>Owner: {eq.owner} · ⭐ {eq.rating} ({eq.reviews} reviews)</div>
            <button disabled={!eq.available} onClick={()=>{ setSelected(eq); setConfirmed(null); }} className="btn btn-primary" style={{ width:'100%', padding:'9px', fontSize:'0.82rem', opacity:eq.available?1:0.5 }}>
              {eq.available ? '📅 Book / Check Availability' : '❌ Not Available'}
            </button>
          </div>
        ))}
      </div>

      {/* Booking Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={()=>setSelected(null)}>
          <div className="card" style={{ width:480, padding:28 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:4 }}>📅 Book — {selected.name}</div>
            <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:20 }}>{selected.brand} · {selected.location} · ⭐ {selected.rating}</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 }}>Start Date</label>
                <input type="date" value={booking.date} onChange={e=>setBooking(p=>({...p,date:e.target.value}))} style={INP}/>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 }}>
                  {selected.unit==='acre' ? 'Acres' : 'Days'}
                </label>
                <input type="number" min="1" value={booking.days} onChange={e=>setBooking(p=>({...p,days:e.target.value}))} style={INP}/>
              </div>
              {selected.unit!=='acre' && (
                <div style={{ gridColumn:'1/-1' }}>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 }}>Hours per Day</label>
                  <input type="number" min="1" max="12" value={booking.hours} onChange={e=>setBooking(p=>({...p,hours:e.target.value}))} style={INP}/>
                </div>
              )}
            </div>

            {/* Cost calculation */}
            <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:8, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#22c55e', marginBottom:10 }}>💰 Cost Calculation</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, textAlign:'center' }}>
                <div>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Rate</div>
                  <div style={{ fontWeight:700 }}>₹{selected.rate}/{selected.unit}</div>
                </div>
                <div>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{selected.unit==='acre'?'Acres':'Days × Hrs'}</div>
                  <div style={{ fontWeight:700 }}>{selected.unit==='acre'?booking.days:`${booking.days}×${booking.hours}`}</div>
                </div>
                <div>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Total Cost</div>
                  <div style={{ fontWeight:800, color:'#22c55e', fontSize:'1.1rem' }}>₹{totalCost.toLocaleString()}</div>
                </div>
              </div>
            </div>

            <div style={{ marginBottom:16 }}>
              <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 }}>Payment Method</label>
              <select value={booking.payment} onChange={e=>setBooking(p=>({...p,payment:e.target.value}))} style={INP}>
                <option value="upi">UPI (PhonePe / GPay)</option>
                <option value="cash">Cash on Delivery</option>
                <option value="bank">Bank Transfer</option>
              </select>
            </div>

            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-primary" style={{ flex:1 }} onClick={confirmBooking}>✅ Book Now</button>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={()=>setSelected(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
