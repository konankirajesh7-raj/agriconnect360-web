import React, { useState } from 'react';

const ASSOCIATIONS = [
  { id:1, name:'Guntur Kisan Mazdoor Sangha', leader:'Ramu Naik', mobile:'9876500001', district:'Guntur', workers:45, rating:4.5, specialties:['Paddy harvesting','Weeding','Transplanting'], verified:true, rate:500 },
  { id:2, name:'Narasaraopet Labour Cooperative', leader:'Venkat Rao', mobile:'9876500002', district:'Guntur', workers:60, rating:4.7, specialties:['Cotton picking','Harvesting','Spraying'], verified:true, rate:480 },
  { id:3, name:'Tenali Agri Workers Union', leader:'Sridhar B.', mobile:'9876500003', district:'Guntur', workers:30, rating:4.2, specialties:['Paddy transplanting','Irrigation','Planting'], verified:true, rate:450 },
  { id:4, name:'Ongole Farm Workers Assoc.', leader:'Prasad K.', mobile:'9876500004', district:'Prakasam', workers:50, rating:4.4, specialties:['Groundnut digging','Weeding','Harvesting'], verified:false, rate:420 },
];
const TASKS = ['Harvesting','Transplanting','Weeding','Spraying','Groundnut Digging','Cotton Picking','Planting','Irrigation','Land Preparation'];
const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 };

const BLANK = { task:'Harvesting', assoc:1, date:'', workers:'5', duration:'Full day', location:'Narasaraopet Village, Guntur', wage:'400', notes:'' };

export default function LabourPage() {
  const [tab, setTab] = useState('associations');
  const [form, setForm] = useState(BLANK);
  const [bookings, setBookings] = useState([
    { id:'LB-A3F2', task:'Paddy harvesting', assoc:'Guntur Kisan Mazdoor Sangha', workers:12, wage:500, date:'2026-04-20', status:'completed', total:6000 },
    { id:'LB-B8K1', task:'Cotton picking', assoc:'Narasaraopet Labour Cooperative', workers:8, wage:480, date:'2026-04-28', status:'active', total:3840 },
  ]);
  const [confirmed, setConfirmed] = useState(null);

  const upd = (k,v) => setForm(p=>({...p,[k]:v}));

  const totalWage = (parseInt(form.workers)||0) * (parseInt(form.wage)||0) * (form.duration==='Full day'?1:0.5);

  const handleRequest = () => {
    const ref = 'LB-' + Math.random().toString(36).substring(2,6).toUpperCase();
    const assoc = ASSOCIATIONS.find(a=>a.id===parseInt(form.assoc));
    const entry = { id:ref, task:form.task, assoc:assoc?.name||'', workers:parseInt(form.workers)||0, wage:parseInt(form.wage)||0, date:form.date, status:'pending', total:totalWage };
    setBookings(p=>[entry,...p]);
    setConfirmed(entry);
    setTab('bookings');
    setForm(BLANK);
  };

  const STATUS = { pending:'badge-warning', active:'badge-success', completed:'badge-info', cancelled:'badge-error' };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">👷 Labour Booking</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>Book verified farm labour associations · Escrow-secured payments</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize:'0.85rem', padding:'8px 16px' }} onClick={()=>setTab('book')}>+ Book Labour</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Associations', value:ASSOCIATIONS.length, icon:'👥', color:'#22c55e' },
          { label:'Total Workers', value:ASSOCIATIONS.reduce((s,a)=>s+a.workers,0), icon:'👷', color:'#3b82f6' },
          { label:'Active Bookings', value:bookings.filter(b=>b.status==='active').length, icon:'✅', color:'#f59e0b' },
          { label:'Pending', value:bookings.filter(b=>b.status==='pending').length, icon:'⏳', color:'#8b5cf6' },
        ].map(s=>(
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Confirmed banner */}
      {confirmed && (
        <div style={{ background:'rgba(34,197,94,0.1)', border:'1px solid rgba(34,197,94,0.3)', borderRadius:10, padding:'14px 20px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontWeight:700, color:'#22c55e', marginBottom:4 }}>✅ Labour Booked! Ref: <strong>{confirmed.id}</strong></div>
            <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)' }}>{confirmed.task} · {confirmed.workers} workers · {confirmed.date} · Status: <span style={{ color:'#f59e0b', fontWeight:700 }}>Pending</span> · Total: ₹{confirmed.total.toLocaleString()}</div>
          </div>
          <button onClick={()=>setConfirmed(null)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:6, padding:'6px 12px', cursor:'pointer', color:'var(--text-muted)', fontSize:'0.78rem' }}>✕</button>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {[['associations','👥','Associations'],['book','📝','Book Labour'],['bookings','🧾','My Bookings']].map(([id,icon,label])=>(
          <button key={id} onClick={()=>setTab(id)} style={{ padding:'10px 18px', borderRadius:'var(--radius-sm)', border:'none', cursor:'pointer', fontSize:'0.82rem', fontWeight:600, background:tab===id?'var(--text-primary)':'var(--bg-card)', color:tab===id?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Associations */}
      {tab==='associations' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:16 }}>
          {ASSOCIATIONS.map(a=>(
            <div key={a.id} className="card" style={{ padding:20 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <div style={{ fontWeight:700, fontSize:'0.92rem' }}>{a.name}</div>
                {a.verified && <span className="badge badge-green" style={{ fontSize:'0.65rem' }}>✓ Verified</span>}
              </div>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:8 }}>Leader: {a.leader} · {a.district}</div>
              <div style={{ display:'flex', gap:12, marginBottom:10 }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:700, color:'#22c55e' }}>{a.workers}</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Workers</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:700, color:'#f59e0b' }}>⭐ {a.rating}</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Rating</div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontWeight:700, color:'#3b82f6' }}>₹{a.rate}/day</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Rate</div>
                </div>
              </div>
              <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:12 }}>
                {a.specialties.map(s=><span key={s} style={{ padding:'2px 8px', borderRadius:10, background:'rgba(34,197,94,0.08)', color:'#22c55e', fontSize:'0.68rem', border:'1px solid rgba(34,197,94,0.2)' }}>{s}</span>)}
              </div>
              <button onClick={()=>{ setForm(p=>({...p,assoc:a.id,wage:String(a.rate)})); setTab('book'); }} className="btn btn-primary" style={{ width:'100%', padding:'8px', fontSize:'0.82rem' }}>📝 Book This Association</button>
            </div>
          ))}
        </div>
      )}

      {/* Book Labour Form */}
      {tab==='book' && (
        <div className="card" style={{ padding:28, maxWidth:600 }}>
          <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:20 }}>📝 Request Labour</div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
            <div>
              <label style={LBL}>Task *</label>
              <select value={form.task} onChange={e=>upd('task',e.target.value)} style={INP}>
                {TASKS.map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={LBL}>Association *</label>
              <select value={form.assoc} onChange={e=>upd('assoc',e.target.value)} style={INP}>
                {ASSOCIATIONS.map(a=><option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
            </div>
            <div>
              <label style={LBL}>Work Date *</label>
              <input type="date" value={form.date} onChange={e=>upd('date',e.target.value)} style={INP}/>
            </div>
            <div>
              <label style={LBL}>No. of Workers *</label>
              <input type="number" min="1" placeholder="5" value={form.workers} onChange={e=>upd('workers',e.target.value)} style={INP}/>
            </div>
            <div>
              <label style={LBL}>Duration</label>
              <select value={form.duration} onChange={e=>upd('duration',e.target.value)} style={INP}>
                <option>Full day</option>
                <option>Half day</option>
              </select>
            </div>
            <div>
              <label style={LBL}>Daily Wage (₹/worker)</label>
              <input type="number" placeholder="400" value={form.wage} onChange={e=>upd('wage',e.target.value)} style={INP}/>
            </div>
            <div style={{ gridColumn:'1/-1' }}>
              <label style={LBL}>Farm Location</label>
              <input placeholder="e.g. Narasaraopet Village, Guntur" value={form.location} onChange={e=>upd('location',e.target.value)} style={INP}/>
            </div>
          </div>

          {/* Cost summary */}
          {totalWage > 0 && (
            <div style={{ marginTop:14, padding:14, background:'rgba(34,197,94,0.08)', border:'1px solid rgba(34,197,94,0.2)', borderRadius:8 }}>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, textAlign:'center' }}>
                <div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Workers</div><div style={{ fontWeight:700 }}>{form.workers}</div></div>
                <div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Wage/Worker</div><div style={{ fontWeight:700 }}>₹{form.wage}</div></div>
                <div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Total Cost</div><div style={{ fontWeight:800, color:'#22c55e', fontSize:'1.1rem' }}>₹{totalWage.toLocaleString()}</div></div>
              </div>
            </div>
          )}

          <button className="btn btn-primary" disabled={!form.date||!form.workers} style={{ width:'100%', padding:12, marginTop:16, fontSize:'0.95rem' }} onClick={handleRequest}>
            🚀 Request Labour
          </button>
        </div>
      )}

      {/* My Bookings */}
      {tab==='bookings' && (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Ref</th><th>Task</th><th>Association</th><th>Workers</th><th>Wage/Day</th><th>Date</th><th>Total</th><th>Status</th></tr></thead>
              <tbody>
                {bookings.map(b=>(
                  <tr key={b.id}>
                    <td style={{ fontWeight:700, color:'#8b5cf6' }}>{b.id}</td>
                    <td style={{ fontWeight:600 }}>{b.task}</td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{b.assoc}</td>
                    <td style={{ textAlign:'right' }}>{b.workers}</td>
                    <td>₹{b.wage}</td>
                    <td>{b.date}</td>
                    <td style={{ fontWeight:700, color:'#22c55e' }}>₹{b.total.toLocaleString()}</td>
                    <td><span className={`badge ${STATUS[b.status]||'badge-info'}`}>{b.status}</span></td>
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
