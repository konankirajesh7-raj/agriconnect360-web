import React, { useState } from 'react';

const EQ = [
  { id:1, name:'Tractor (45HP)', type:'Tractor', brand:'Mahindra 575', rate:1200, unit:'hr', available:true, condition:'Excellent', location:'Guntur', owner:'Rajesh K.', phone:'98765 00001', rating:4.7, reviews:23, totalHours:1240, desc:'Heavy-duty Mahindra tractor ideal for deep plowing, land preparation and transportation. Comes with operator.' },
  { id:2, name:'Power Sprayer', type:'Spraying', brand:'Honda GX35', rate:450, unit:'hr', available:true, condition:'Good', location:'Narasaraopet', owner:'Suresh M.', phone:'98765 00002', rating:4.5, reviews:15, totalHours:340, desc:'Motorized power sprayer with 20L tank capacity. Suitable for pesticide and fertilizer spraying on all crops.' },
  { id:3, name:'Rotavator', type:'Tillage', brand:'Fieldking FKROT', rate:900, unit:'hr', available:true, condition:'Good', location:'Tenali', owner:'Anil P.', phone:'98765 00003', rating:4.3, reviews:8, totalHours:580, desc:'6-foot rotavator for fine seedbed preparation. Compatible with 45HP+ tractors.' },
  { id:4, name:'Harvester (Custom)', type:'Harvesting', brand:'John Deere W70', rate:2800, unit:'acre', available:true, condition:'Excellent', location:'Kurnool', owner:'Vijay D.', phone:'98765 00004', rating:4.9, reviews:31, totalHours:2100, desc:'Self-propelled combine harvester for paddy and wheat. Includes grain tank and straw spreader.' },
  { id:5, name:'Seed Drill', type:'Sowing', brand:'National Agro ND9', rate:600, unit:'hr', available:false, condition:'Good', location:'Ongole', owner:'Ramesh B.', phone:'98765 00005', rating:4.2, reviews:6, totalHours:210, desc:'9-row seed drill with fertilizer attachment. Suitable for paddy, wheat, maize.' },
  { id:6, name:'Thresher', type:'Harvesting', brand:'VST ST-1500', rate:800, unit:'hr', available:true, condition:'Fair', location:'Nellore', owner:'Mohan S.', phone:'98765 00006', rating:4.0, reviews:12, totalHours:460, desc:'Paddy thresher with 1500kg/hr capacity. Reduces post-harvest losses.' },
  { id:7, name:'Mini Tractor (25HP)', type:'Tractor', brand:'Kubota B2441', rate:800, unit:'hr', available:true, condition:'Excellent', location:'Guntur', owner:'Lakshmi A.', phone:'98765 00007', rating:4.6, reviews:19, totalHours:890, desc:'Compact tractor for garden, orchard and inter-cultivation operations. Easy to maneuver.' },
  { id:8, name:'Drip Irrigation Kit', type:'Irrigation', brand:'Jain Irrigation', rate:300, unit:'hr', available:true, condition:'Good', location:'Vijayawada', owner:'Krishna R.', phone:'98765 00008', rating:4.4, reviews:11, totalHours:120, desc:'Complete drip irrigation setup for 1 acre. Includes pumps, pipes, drippers and filter.' },
];
const CATS = ['All','Tractor','Tillage','Spraying','Sowing','Harvesting','Irrigation'];
const ICONS = { Tractor:'🚜', Tillage:'⚙️', Spraying:'💧', Sowing:'🌱', Harvesting:'🌾', Irrigation:'🔧', All:'📋' };
const COND = { Excellent:{ bg:'rgba(34,197,94,0.1)', color:'#22c55e' }, Good:{ bg:'rgba(245,158,11,0.1)', color:'#f59e0b' }, Fair:{ bg:'rgba(239,68,68,0.1)', color:'#ef4444' } };
const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.73rem', color:'var(--text-muted)', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' };
const REVIEWS = [
  { user:'Srinivas R.', rating:5, comment:'Excellent tractor, operator was very professional. Will book again!', date:'Apr 2026' },
  { user:'Venkata P.', rating:4, comment:'Good condition, came on time. Minor issue with fuel but resolved quickly.', date:'Mar 2026' },
  { user:'Lakshmi B.', rating:5, comment:'Very satisfied. Completed 3 acres in just 4 hours.', date:'Feb 2026' },
];

export default function EquipmentPage() {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [detail, setDetail] = useState(null);
  const [booking, setBooking] = useState({ date: new Date(Date.now()+86400000).toISOString().split('T')[0], days:2, hours:4, payment:'upi', notes:'' });
  const [confirmed, setConfirmed] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [sort, setSort] = useState('rating');

  let list = filter==='All' ? EQ : EQ.filter(e=>e.type===filter);
  if (search) list = list.filter(e=>e.name.toLowerCase().includes(search.toLowerCase())||e.location.toLowerCase().includes(search.toLowerCase())||e.brand.toLowerCase().includes(search.toLowerCase()));
  if (sort==='rating') list = [...list].sort((a,b)=>b.rating-a.rating);
  if (sort==='price_asc') list = [...list].sort((a,b)=>a.rate-b.rate);
  if (sort==='price_desc') list = [...list].sort((a,b)=>b.rate-a.rate);

  const totalCost = selected ? (selected.unit==='acre' ? selected.rate*parseFloat(booking.days||1) : selected.rate*parseFloat(booking.hours||1)*parseFloat(booking.days||1)) : 0;
  const toggleFav = (id) => setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);

  const confirmBooking = () => {
    const ref='EQ-'+Math.random().toString(36).substring(2,8).toUpperCase();
    setConfirmed({ ref, equipment:selected.name, date:booking.date, total:totalCost, payment:booking.payment });
    setSelected(null);
  };

  return (
    <div className="animated">
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.04))', border:'1px solid rgba(34,197,94,0.15)', borderRadius:16, padding:'20px 24px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:'1.35rem', display:'flex', alignItems:'center', gap:10 }}>🚜 Equipment Marketplace</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>Rent tractors, harvesters & farm machinery · AP-wide coverage · Verified owners</div>
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          {favorites.length>0 && <span style={{ background:'rgba(239,68,68,0.1)', color:'#ef4444', padding:'4px 12px', borderRadius:20, fontSize:'0.75rem', fontWeight:700 }}>❤️ {favorites.length} saved</span>}
          <span style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'6px 14px', borderRadius:20, fontSize:'0.78rem', fontWeight:700 }}>✅ {EQ.filter(e=>e.available).length} Available</span>
        </div>
      </div>

      {/* Confirmed Banner */}
      {confirmed && (
        <div style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.12),rgba(16,185,129,0.06))', border:'1px solid rgba(34,197,94,0.3)', borderRadius:12, padding:'16px 22px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:800, color:'#22c55e', fontSize:'0.95rem', marginBottom:4 }}>✅ Booking Confirmed!</div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>
              {confirmed.equipment} · {confirmed.date} · Ref: <strong style={{ color:'#22c55e' }}>{confirmed.ref}</strong> · Total: <strong>₹{confirmed.total.toLocaleString()}</strong> · Payment: {confirmed.payment.toUpperCase()}
            </div>
          </div>
          <button onClick={()=>setConfirmed(null)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 14px', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.78rem' }}>✕ Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Available Now', value:EQ.filter(e=>e.available).length, icon:'✅', color:'#22c55e', bg:'rgba(34,197,94,0.08)' },
          { label:'Total Equipment', value:EQ.length, icon:'🚜', color:'#3b82f6', bg:'rgba(59,130,246,0.08)' },
          { label:'Avg Rating', value:'4.5 ★', icon:'⭐', color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
          { label:'AP Districts', value:'6', icon:'📍', color:'#8b5cf6', bg:'rgba(139,92,246,0.08)' },
        ].map(s=>(
          <div key={s.label} className="stat-card" style={{ background:s.bg, border:`1px solid ${s.bg.replace('0.08','0.2')}` }}>
            <div style={{ fontSize:'1.6rem', marginBottom:6 }}>{s.icon}</div>
            <div style={{ fontSize:'1.8rem', fontWeight:800, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:600, marginTop:2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Search + Filter + Sort */}
      <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap', alignItems:'center' }}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="🔍 Search equipment, location, brand..." style={{ ...INP, flex:'1 1 220px', minWidth:200 }}/>
        <select value={sort} onChange={e=>setSort(e.target.value)} style={{ ...INP, width:160 }}>
          <option value="rating">Sort: Top Rated</option>
          <option value="price_asc">Sort: Price ↑</option>
          <option value="price_desc">Sort: Price ↓</option>
        </select>
      </div>
      <div style={{ display:'flex', gap:8, marginBottom:20, flexWrap:'wrap' }}>
        {CATS.map(c=>(
          <button key={c} onClick={()=>setFilter(c)} style={{ padding:'8px 18px', borderRadius:24, border:'none', cursor:'pointer', fontSize:'0.8rem', fontWeight:700, background:filter===c?'linear-gradient(135deg,#22c55e,#16a34a)':'var(--bg-card)', color:filter===c?'#fff':'var(--text-muted)', boxShadow:filter===c?'0 4px 12px rgba(34,197,94,0.3)':'none', transition:'all 0.2s' }}>
            {ICONS[c]} {c} {filter===c && c!=='All' && `(${EQ.filter(e=>e.type===c).length})`}
          </button>
        ))}
      </div>

      {/* Equipment Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:18 }}>
        {list.map(eq=>(
          <div key={eq.id} style={{ background:'var(--bg-card)', border:`1px solid ${eq.available?'var(--border)':'rgba(239,68,68,0.2)'}`, borderRadius:16, padding:22, position:'relative', opacity:eq.available?1:0.7, transition:'all 0.25s', cursor:'pointer' }}
            onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.15)'}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
            {/* Fav + Status */}
            <div style={{ position:'absolute', top:14, right:14, display:'flex', gap:6, alignItems:'center' }}>
              <button onClick={(e)=>{e.stopPropagation();toggleFav(eq.id)}} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'1.1rem', lineHeight:1 }}>{favorites.includes(eq.id)?'❤️':'🤍'}</button>
              <span style={{ background:COND[eq.condition]?.bg, color:COND[eq.condition]?.color, padding:'2px 8px', borderRadius:8, fontSize:'0.65rem', fontWeight:700 }}>{eq.condition}</span>
            </div>
            {!eq.available && <span style={{ position:'absolute', top:14, left:14, background:'#ef4444', color:'#fff', padding:'2px 10px', borderRadius:8, fontSize:'0.65rem', fontWeight:700 }}>BOOKED</span>}
            {/* Icon + Type */}
            <div style={{ fontSize:'2.8rem', marginBottom:10, marginTop:eq.available?0:16 }}>{ICONS[eq.type]||'🔧'}</div>
            <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:2 }}>{eq.name}</div>
            <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:10 }}>{eq.brand} · 📍 {eq.location}</div>
            {/* Rating bar */}
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
              <div style={{ flex:1, height:4, background:'var(--border)', borderRadius:2 }}>
                <div style={{ width:`${(eq.rating/5)*100}%`, height:'100%', background:'linear-gradient(90deg,#f59e0b,#f97316)', borderRadius:2 }}/>
              </div>
              <span style={{ fontSize:'0.75rem', color:'#f59e0b', fontWeight:700 }}>⭐ {eq.rating}</span>
              <span style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>({eq.reviews})</span>
            </div>
            <div style={{ fontSize:'1.5rem', fontWeight:900, color:'#22c55e', marginBottom:4 }}>
              ₹{eq.rate.toLocaleString()}<span style={{ fontSize:'0.72rem', color:'var(--text-muted)', fontWeight:400 }}>/{eq.unit}</span>
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:14 }}>Owner: {eq.owner} · {eq.totalHours}h total usage</div>
            <div style={{ display:'flex', gap:8 }}>
              <button onClick={()=>setDetail(eq)} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-secondary)', cursor:'pointer', fontSize:'0.78rem', fontWeight:600 }}>👁 Details</button>
              <button disabled={!eq.available} onClick={()=>{setSelected(eq);setConfirmed(null);}} style={{ flex:2, padding:'8px', borderRadius:8, border:'none', background:eq.available?'linear-gradient(135deg,#22c55e,#16a34a)':'var(--border)', color:eq.available?'#fff':'var(--text-muted)', cursor:eq.available?'pointer':'not-allowed', fontSize:'0.82rem', fontWeight:700, boxShadow:eq.available?'0 4px 12px rgba(34,197,94,0.3)':'none' }}>
                {eq.available?'📅 Book Now':'❌ Unavailable'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Detail Drawer */}
      {detail && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.6)', backdropFilter:'blur(6px)', display:'flex', justifyContent:'flex-end' }} onClick={()=>setDetail(null)}>
          <div style={{ width:480, height:'100vh', overflowY:'auto', background:'var(--bg-card)', padding:28, boxShadow:'-8px 0 40px rgba(0,0,0,0.3)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20 }}>
              <div>
                <div style={{ fontSize:'2.5rem', marginBottom:8 }}>{ICONS[detail.type]}</div>
                <div style={{ fontWeight:800, fontSize:'1.15rem' }}>{detail.name}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{detail.brand} · {detail.location}</div>
              </div>
              <button onClick={()=>setDetail(null)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', cursor:'pointer', color:'var(--text-muted)' }}>✕</button>
            </div>
            <div style={{ background:'var(--bg-primary)', borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.7 }}>{detail.desc}</div>
            </div>
            {/* Specs */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:20 }}>
              {[['Rate',`₹${detail.rate}/${detail.unit}`],['Condition',detail.condition],['Owner',detail.owner],['Contact',detail.phone],['Rating',`⭐ ${detail.rating} (${detail.reviews} reviews)`],['Total Usage',`${detail.totalHours} hours`]].map(([k,v])=>(
                <div key={k} style={{ background:'var(--bg-primary)', borderRadius:8, padding:'10px 14px' }}>
                  <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>{k}</div>
                  <div style={{ fontWeight:700, fontSize:'0.85rem', marginTop:2 }}>{v}</div>
                </div>
              ))}
            </div>
            {/* Reviews */}
            <div style={{ fontWeight:700, marginBottom:12 }}>💬 Recent Reviews</div>
            {REVIEWS.map((r,i)=>(
              <div key={i} style={{ background:'var(--bg-primary)', borderRadius:10, padding:'12px 14px', marginBottom:10 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <span style={{ fontWeight:600, fontSize:'0.82rem' }}>{r.user}</span>
                  <div style={{ display:'flex', alignItems:'center', gap:4 }}>
                    {'★'.repeat(r.rating)}<span style={{ fontSize:'0.68rem', color:'var(--text-muted)', marginLeft:4 }}>{r.date}</span>
                  </div>
                </div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)' }}>{r.comment}</div>
              </div>
            ))}
            <button disabled={!detail.available} onClick={()=>{setSelected(detail);setDetail(null);}} className="btn btn-primary" style={{ width:'100%', padding:14, marginTop:12, fontSize:'0.95rem' }}>
              {detail.available?'📅 Book This Equipment':'❌ Currently Unavailable'}
            </button>
          </div>
        </div>
      )}

      {/* Booking Modal */}
      {selected && (
        <div style={{ position:'fixed', inset:0, zIndex:1001, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)' }} onClick={()=>setSelected(null)}>
          <div style={{ width:500, background:'var(--bg-card)', borderRadius:20, padding:30, boxShadow:'0 24px 64px rgba(0,0,0,0.4)' }} onClick={e=>e.stopPropagation()}>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:20 }}>
              <div style={{ fontSize:'2.5rem' }}>{ICONS[selected.type]}</div>
              <div>
                <div style={{ fontWeight:800, fontSize:'1.05rem' }}>{selected.name}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{selected.brand} · {selected.location} · ⭐ {selected.rating}</div>
              </div>
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
              <div><label style={LBL}>Start Date</label><input type="date" value={booking.date} onChange={e=>setBooking(p=>({...p,date:e.target.value}))} style={INP}/></div>
              <div><label style={LBL}>{selected.unit==='acre'?'No. of Acres':'Days'}</label><input type="number" min="1" value={booking.days} onChange={e=>setBooking(p=>({...p,days:e.target.value}))} style={INP}/></div>
              {selected.unit!=='acre' && <div style={{ gridColumn:'1/-1' }}><label style={LBL}>Hours per Day</label><input type="number" min="1" max="12" value={booking.hours} onChange={e=>setBooking(p=>({...p,hours:e.target.value}))} style={INP}/></div>}
            </div>
            {/* Cost breakdown */}
            <div style={{ background:'linear-gradient(135deg,rgba(34,197,94,0.08),rgba(16,185,129,0.04))', border:'1px solid rgba(34,197,94,0.2)', borderRadius:12, padding:16, marginBottom:16 }}>
              <div style={{ fontWeight:700, color:'#22c55e', marginBottom:12, fontSize:'0.85rem' }}>💰 Cost Breakdown</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', textAlign:'center', gap:8 }}>
                {[['Rate',`₹${selected.rate}/${selected.unit}`],['Qty',selected.unit==='acre'?`${booking.days} acres`:`${booking.days}d × ${booking.hours}h`],['Total',`₹${totalCost.toLocaleString()}`]].map(([k,v],i)=>(
                  <div key={k} style={{ background:'rgba(255,255,255,0.04)', borderRadius:8, padding:'10px 6px' }}>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase' }}>{k}</div>
                    <div style={{ fontWeight:800, color:i===2?'#22c55e':'var(--text-primary)', fontSize:i===2?'1.2rem':'0.9rem', marginTop:4 }}>{v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:14 }}>
              <label style={LBL}>Payment Method</label>
              <div style={{ display:'flex', gap:8 }}>
                {['upi','cash','bank'].map(p=>(
                  <button key={p} onClick={()=>setBooking(b=>({...b,payment:p}))} style={{ flex:1, padding:'9px 6px', borderRadius:8, border:`2px solid ${booking.payment===p?'#22c55e':'var(--border)'}`, background:booking.payment===p?'rgba(34,197,94,0.1)':'var(--bg-primary)', color:booking.payment===p?'#22c55e':'var(--text-muted)', cursor:'pointer', fontSize:'0.75rem', fontWeight:700, transition:'all 0.2s' }}>
                    {p==='upi'?'📱 UPI':p==='cash'?'💵 Cash':'🏦 Bank'}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ marginBottom:16 }}><label style={LBL}>Notes (optional)</label><textarea rows={2} value={booking.notes} onChange={e=>setBooking(p=>({...p,notes:e.target.value}))} placeholder="Any special requirements..." style={{ ...INP, resize:'none' }}/></div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={confirmBooking} style={{ flex:1, padding:13, borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', cursor:'pointer', fontWeight:800, fontSize:'0.95rem', boxShadow:'0 6px 20px rgba(34,197,94,0.35)' }}>✅ Confirm Booking</button>
              <button onClick={()=>setSelected(null)} style={{ flex:1, padding:13, borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-secondary)', cursor:'pointer', fontWeight:600 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
