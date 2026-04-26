import React, { useState } from 'react';

const ASSOC = [
  { id:1, name:'Guntur Kisan Mazdoor Sangha', leader:'Ramu Naik', mobile:'98765 00001', district:'Guntur', workers:45, rating:4.5, specialties:['Paddy Harvesting','Weeding','Transplanting'], verified:true, rate:500, exp:8, completed:234, photo:'👨‍🌾' },
  { id:2, name:'Narasaraopet Labour Cooperative', leader:'Venkat Rao', mobile:'98765 00002', district:'Guntur', workers:60, rating:4.7, specialties:['Cotton Picking','Harvesting','Spraying'], verified:true, rate:480, exp:12, completed:312, photo:'👩‍🌾' },
  { id:3, name:'Tenali Agri Workers Union', leader:'Sridhar B.', mobile:'98765 00003', district:'Guntur', workers:30, rating:4.2, specialties:['Paddy Transplanting','Irrigation','Planting'], verified:true, rate:450, exp:6, completed:178, photo:'🧑‍🌾' },
  { id:4, name:'Ongole Farm Workers Assoc.', leader:'Prasad K.', mobile:'98765 00004', district:'Prakasam', workers:50, rating:4.4, specialties:['Groundnut Digging','Weeding','Harvesting'], verified:false, rate:420, exp:9, completed:189, photo:'👨‍🌾' },
  { id:5, name:'Kurnool Agricultural Labourers', leader:'Ravi T.', mobile:'98765 00005', district:'Kurnool', workers:40, rating:4.6, specialties:['Sugarcane Cutting','Cotton Picking','Weed Control'], verified:true, rate:520, exp:11, completed:256, photo:'👩‍🌾' },
];
const TASKS = ['Harvesting','Transplanting','Weeding','Spraying','Groundnut Digging','Cotton Picking','Planting','Irrigation','Land Preparation','Sugarcane Cutting'];
const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.73rem', color:'var(--text-muted)', marginBottom:4, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em' };
const STATUS_STYLE = { pending:{ bg:'rgba(245,158,11,0.1)', color:'#f59e0b' }, active:{ bg:'rgba(34,197,94,0.1)', color:'#22c55e' }, completed:{ bg:'rgba(59,130,246,0.1)', color:'#60a5fa' }, cancelled:{ bg:'rgba(239,68,68,0.1)', color:'#ef4444' } };
const BLANK = { task:'Harvesting', assoc:1, date:'', workers:'5', duration:'Full day', location:'Narasaraopet Village, Guntur', wage:'500', notes:'' };

export default function LabourPage() {
  const [tab, setTab] = useState('associations');
  const [form, setForm] = useState(BLANK);
  const [bookings, setBookings] = useState([
    { id:'LB-A3F2', task:'Paddy Harvesting', assocName:'Guntur Kisan Mazdoor Sangha', workers:12, wage:500, date:'2026-04-20', status:'completed', total:6000, location:'Pedakakani, Guntur' },
    { id:'LB-B8K1', task:'Cotton Picking', assocName:'Narasaraopet Labour Cooperative', workers:8, wage:480, date:'2026-04-28', status:'active', total:3840, location:'Chilakaluripet, Guntur' },
  ]);
  const [confirmed, setConfirmed] = useState(null);
  const upd = (k,v) => setForm(p=>({...p,[k]:v}));
  const totalWage = (parseInt(form.workers)||0)*(parseInt(form.wage)||0)*(form.duration==='Full day'?1:0.5);

  const handleRequest = () => {
    const ref = 'LB-'+Math.random().toString(36).substring(2,6).toUpperCase();
    const assoc = ASSOC.find(a=>a.id===parseInt(form.assoc));
    const entry = { id:ref, task:form.task, assocName:assoc?.name||'', workers:parseInt(form.workers)||0, wage:parseInt(form.wage)||0, date:form.date, status:'pending', total:totalWage, location:form.location };
    setBookings(p=>[entry,...p]);
    setConfirmed(entry); setTab('bookings'); setForm(BLANK);
  };

  return (
    <div className="animated">
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,rgba(245,158,11,0.08),rgba(251,191,36,0.04))', border:'1px solid rgba(245,158,11,0.2)', borderRadius:16, padding:'20px 24px', marginBottom:24, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
        <div>
          <div style={{ fontWeight:800, fontSize:'1.35rem' }}>👷 Labour Booking</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:4 }}>Verified farm labour · Escrow-secured · 5 AP districts</div>
        </div>
        <button className="btn btn-primary" onClick={()=>setTab('book')} style={{ background:'linear-gradient(135deg,#f59e0b,#d97706)', border:'none', boxShadow:'0 4px 16px rgba(245,158,11,0.35)', fontWeight:700 }}>+ Book Labour</button>
      </div>

      {/* Confirmed */}
      {confirmed && (
        <div style={{ background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.25)', borderRadius:12, padding:'14px 20px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:800, color:'#22c55e', marginBottom:4 }}>✅ Labour Requested! Ref: <span style={{ fontFamily:'monospace' }}>{confirmed.id}</span></div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{confirmed.task} · {confirmed.workers} workers · {confirmed.date} · <span style={{ color:'#f59e0b', fontWeight:700 }}>Status: Pending</span> · Total: ₹{confirmed.total.toLocaleString()}</div>
          </div>
          <button onClick={()=>setConfirmed(null)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, padding:'6px 12px', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.78rem' }}>✕</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Associations', value:ASSOC.length, icon:'🏢', color:'#22c55e', bg:'rgba(34,197,94,0.08)' },
          { label:'Total Workers', value:ASSOC.reduce((s,a)=>s+a.workers,0), icon:'👷', color:'#3b82f6', bg:'rgba(59,130,246,0.08)' },
          { label:'Active Bookings', value:bookings.filter(b=>b.status==='active').length, icon:'✅', color:'#f59e0b', bg:'rgba(245,158,11,0.08)' },
          { label:'Pending', value:bookings.filter(b=>b.status==='pending').length, icon:'⏳', color:'#8b5cf6', bg:'rgba(139,92,246,0.08)' },
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
        {[['associations','👥','Associations'],['book','📝','Book Labour'],['bookings','🧾','My Bookings']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'10px 20px', borderRadius:24, border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, background:tab===id?'linear-gradient(135deg,#f59e0b,#d97706)':'var(--bg-card)', color:tab===id?'#fff':'var(--text-muted)', boxShadow:tab===id?'0 4px 12px rgba(245,158,11,0.3)':'none', transition:'all 0.2s' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Associations */}
      {tab==='associations' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))', gap:18 }}>
          {ASSOC.map(a=>(
            <div key={a.id} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:16, padding:22, transition:'all 0.25s' }}
              onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(0,0,0,0.15)'}}
              onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=''}}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:14 }}>
                <div style={{ display:'flex', gap:12, alignItems:'flex-start' }}>
                  <div style={{ width:44, height:44, borderRadius:'50%', background:'linear-gradient(135deg,rgba(245,158,11,0.2),rgba(251,191,36,0.1))', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', flexShrink:0 }}>{a.photo}</div>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'0.9rem', lineHeight:1.3 }}>{a.name}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>📍 {a.district} · {a.exp} yrs exp</div>
                  </div>
                </div>
                {a.verified && <span style={{ background:'rgba(34,197,94,0.1)', color:'#22c55e', padding:'3px 10px', borderRadius:10, fontSize:'0.65rem', fontWeight:700, flexShrink:0, height:'fit-content' }}>✓ Verified</span>}
              </div>
              {/* Stats row */}
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:14 }}>
                {[['Workers',a.workers,'👷'],['Rate',`₹${a.rate}/day`,'💰'],['Rating',`⭐ ${a.rating}`,'⭐']].map(([k,v,i])=>(
                  <div key={k} style={{ background:'var(--bg-primary)', borderRadius:8, padding:'8px 10px', textAlign:'center' }}>
                    <div style={{ fontWeight:800, fontSize:'0.92rem' }}>{v}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{k}</div>
                  </div>
                ))}
              </div>
              {/* Specialties */}
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:14 }}>
                {a.specialties.map(s=><span key={s} style={{ padding:'3px 10px', borderRadius:12, background:'rgba(245,158,11,0.08)', color:'#f59e0b', border:'1px solid rgba(245,158,11,0.2)', fontSize:'0.68rem', fontWeight:600 }}>{s}</span>)}
              </div>
              {/* Progress bar — completed jobs */}
              <div style={{ marginBottom:14 }}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.68rem', color:'var(--text-muted)', marginBottom:4 }}><span>Completed Jobs</span><span style={{ fontWeight:700 }}>{a.completed}</span></div>
                <div style={{ height:4, background:'var(--border)', borderRadius:2 }}>
                  <div style={{ width:`${Math.min((a.completed/350)*100,100)}%`, height:'100%', background:'linear-gradient(90deg,#f59e0b,#22c55e)', borderRadius:2 }}/>
                </div>
              </div>
              <div style={{ display:'flex', gap:8 }}>
                <a href={`tel:${a.mobile}`} style={{ flex:1, padding:'8px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-secondary)', textDecoration:'none', textAlign:'center', fontSize:'0.78rem', fontWeight:600 }}>📞 Call</a>
                <button onClick={()=>{setForm(p=>({...p,assoc:a.id,wage:String(a.rate)}));setTab('book');}} style={{ flex:2, padding:'8px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#f59e0b,#d97706)', color:'#fff', cursor:'pointer', fontSize:'0.82rem', fontWeight:700, boxShadow:'0 4px 12px rgba(245,158,11,0.3)' }}>📝 Book This Association</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Book Form */}
      {tab==='book' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 360px', gap:20 }}>
          <div className="card" style={{ padding:28 }}>
            <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:20 }}>📝 Labour Request Form</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div><label style={LBL}>Task *</label>
                <select value={form.task} onChange={e=>upd('task',e.target.value)} style={INP}>{TASKS.map(t=><option key={t}>{t}</option>)}</select></div>
              <div><label style={LBL}>Association *</label>
                <select value={form.assoc} onChange={e=>upd('assoc',e.target.value)} style={INP}>{ASSOC.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}</select></div>
              <div><label style={LBL}>Work Date *</label><input type="date" value={form.date} onChange={e=>upd('date',e.target.value)} style={INP}/></div>
              <div><label style={LBL}>No. of Workers *</label><input type="number" min="1" placeholder="5" value={form.workers} onChange={e=>upd('workers',e.target.value)} style={INP}/></div>
              <div><label style={LBL}>Duration</label>
                <select value={form.duration} onChange={e=>upd('duration',e.target.value)} style={INP}><option>Full day</option><option>Half day</option></select></div>
              <div><label style={LBL}>Daily Wage (₹/worker)</label><input type="number" placeholder="500" value={form.wage} onChange={e=>upd('wage',e.target.value)} style={INP}/></div>
              <div style={{ gridColumn:'1/-1' }}><label style={LBL}>Farm Location *</label><input placeholder="e.g. Narasaraopet Village, Guntur" value={form.location} onChange={e=>upd('location',e.target.value)} style={INP}/></div>
              <div style={{ gridColumn:'1/-1' }}><label style={LBL}>Special Instructions</label><textarea rows={2} placeholder="Any specific requirements..." value={form.notes} onChange={e=>upd('notes',e.target.value)} style={{ ...INP, resize:'none' }}/></div>
            </div>
            <button className="btn btn-primary" disabled={!form.date||!form.workers||!form.location} onClick={handleRequest} style={{ width:'100%', padding:13, marginTop:16, fontSize:'0.95rem', background:'linear-gradient(135deg,#f59e0b,#d97706)', border:'none', boxShadow:'0 6px 20px rgba(245,158,11,0.35)', fontWeight:800 }}>
              🚀 Submit Labour Request
            </button>
          </div>
          {/* Summary card */}
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div className="card" style={{ padding:22 }}>
              <div style={{ fontWeight:800, marginBottom:14 }}>💰 Cost Summary</div>
              {[['Workers',form.workers||'0'],['Wage / Worker',`₹${form.wage||0}/day`],['Duration',form.duration],['Total Cost',`₹${totalWage.toLocaleString()}`]].map(([k,v],i)=>(
                <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:i<3?'1px solid var(--border)':'none' }}>
                  <span style={{ color:'var(--text-muted)', fontSize:'0.82rem' }}>{k}</span>
                  <span style={{ fontWeight:700, color:i===3?'#22c55e':'var(--text-primary)', fontSize:i===3?'1.1rem':'0.88rem' }}>{v}</span>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding:22 }}>
              <div style={{ fontWeight:700, marginBottom:10, fontSize:'0.85rem' }}>ℹ️ How It Works</div>
              {['Submit your request','Association confirms within 2 hours','Pay 20% advance via UPI','Workers arrive on scheduled date','Pay remaining after completion'].map((s,i)=>(
                <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:8 }}>
                  <span style={{ background:'rgba(245,158,11,0.1)', color:'#f59e0b', borderRadius:'50%', width:20, height:20, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.68rem', fontWeight:800, flexShrink:0 }}>{i+1}</span>
                  <span style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.4 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Bookings */}
      {tab==='bookings' && (
        <div className="card">
          <div style={{ padding:'18px 20px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
            <div style={{ fontWeight:700 }}>🧾 My Labour Bookings ({bookings.length})</div>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Ref</th><th>Task</th><th>Association</th><th>Location</th><th>Workers</th><th>Wage/Day</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map(b=>(
                  <tr key={b.id}>
                    <td style={{ fontWeight:800, color:'#f59e0b', fontFamily:'monospace' }}>{b.id}</td>
                    <td style={{ fontWeight:600 }}>{b.task}</td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{b.assocName}</td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{b.location}</td>
                    <td style={{ textAlign:'center', fontWeight:700 }}>{b.workers}</td>
                    <td>₹{b.wage}</td>
                    <td>{b.date}</td>
                    <td style={{ fontWeight:800, color:'#22c55e' }}>₹{b.total.toLocaleString()}</td>
                    <td><span style={{ background:STATUS_STYLE[b.status]?.bg, color:STATUS_STYLE[b.status]?.color, padding:'3px 10px', borderRadius:10, fontSize:'0.7rem', fontWeight:700 }}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
