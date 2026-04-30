import React, { useState, useMemo } from 'react';

const TODAY = new Date().toISOString().slice(0, 10);
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x.toISOString().slice(0,10); };
const NEXT_WEEK = addDays(TODAY, 7);

const INITIAL = [
  { id: 1, title: 'Scout for pests (Paddy)', type: 'Pest Mgmt', crop: 'Paddy', due: TODAY, status: 'pending', priority: 'high', auto: true, recur: '' },
  { id: 2, title: 'Apply Urea — Paddy Field (Day 45)', type: 'Fertilizer', crop: 'Paddy', due: TODAY, status: 'pending', priority: 'high', auto: true, recur: '' },
  { id: 3, title: 'Check drip lines — North Block', type: 'Irrigation', crop: 'Groundnut', due: TODAY, status: 'pending', priority: 'medium', auto: true, recur: '' },
  { id: 4, title: 'Spray Imidacloprid for aphids', type: 'Pest Mgmt', crop: 'Cotton', due: addDays(TODAY, -3), status: 'pending', priority: 'high', auto: true, recur: '' },
  { id: 5, title: 'Harvest Chilli — Red stage', type: 'Harvest', crop: 'Chilli', due: addDays(TODAY, -1), status: 'pending', priority: 'medium', auto: true, recur: '' },
  { id: 6, title: 'KCC interest payment due', type: 'Finance', crop: '-', due: addDays(TODAY, 3), status: 'pending', priority: 'high', auto: false, recur: '' },
  { id: 7, title: 'Soil test — South Field', type: 'Soil', crop: 'Paddy', due: addDays(TODAY, 5), status: 'pending', priority: 'low', auto: false, recur: '' },
  { id: 8, title: 'Tractor maintenance (500h service)', type: 'Equipment', crop: '-', due: addDays(TODAY, 9), status: 'pending', priority: 'medium', auto: false, recur: '' },
  { id: 9, title: 'PMFBY enrollment deadline', type: 'Insurance', crop: 'Paddy', due: addDays(TODAY, 18), status: 'pending', priority: 'high', auto: false, recur: '' },
  { id: 10, title: 'Weeding complete — Groundnut plot', type: 'Weeding', crop: 'Groundnut', due: addDays(TODAY, -9), status: 'done', priority: 'medium', auto: true, recur: '' },
  { id: 11, title: 'Applied basal dose fertilizer', type: 'Fertilizer', crop: 'Paddy', due: addDays(TODAY, -17), status: 'done', priority: 'high', auto: true, recur: '' },
];

const CROPS = ['Paddy','Cotton','Chilli','Groundnut','Sugarcane','Wheat'];
const TYPES = ['Fertilizer','Pest Mgmt','Irrigation','Harvest','Soil','Equipment','Finance','Insurance','Weeding','Custom'];
const pC = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const pBg = { high: 'rgba(239,68,68,0.1)', medium: 'rgba(245,158,11,0.1)', low: 'rgba(16,185,129,0.1)' };
const tag = (bg, c) => ({ fontSize:'0.65rem', padding:'2px 8px', borderRadius:999, background:bg, color:c, fontWeight:600, display:'inline-block' });

function CalendarView({ tasks, onToggle }) {
  const [offset, setOffset] = useState(0);
  const base = new Date(); base.setDate(1); base.setMonth(base.getMonth() + offset);
  const year = base.getFullYear(), month = base.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < firstDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const monthStr = base.toLocaleString('en-IN', { month: 'long', year: 'numeric' });

  return (
    <div className="card" style={{ padding: 18, marginBottom: 16 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
        <button onClick={() => setOffset(o => o-1)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', padding:'6px 12px', cursor:'pointer', fontSize:'0.8rem' }}>◀</button>
        <div style={{ fontWeight:700, fontSize:'0.95rem', color:'var(--text-primary)' }}>📅 {monthStr}</div>
        <button onClick={() => setOffset(o => o+1)} style={{ background:'none', border:'1px solid var(--border)', borderRadius:8, color:'var(--text-primary)', padding:'6px 12px', cursor:'pointer', fontSize:'0.8rem' }}>▶</button>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
        {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
          <div key={d} style={{ textAlign:'center', fontSize:'0.65rem', color:'var(--text-muted)', fontWeight:600, padding:4 }}>{d}</div>
        ))}
        {cells.map((day, i) => {
          if (!day) return <div key={`e${i}`} />;
          const dateStr = `${year}-${String(month+1).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
          const dayTasks = tasks.filter(t => t.due === dateStr);
          const isToday = dateStr === TODAY;
          const hasOverdue = dayTasks.some(t => t.status === 'pending' && t.due < TODAY);
          return (
            <div key={dateStr} style={{ minHeight:52, padding:4, borderRadius:8, border:`1px solid ${isToday ? 'rgba(59,130,246,0.4)' : 'rgba(255,255,255,0.04)'}`, background: isToday ? 'rgba(59,130,246,0.08)' : 'transparent', position:'relative' }}>
              <div style={{ fontSize:'0.7rem', fontWeight:isToday?700:400, color: isToday ? '#60a5fa' : 'var(--text-secondary)', marginBottom:2 }}>{day}</div>
              <div style={{ display:'flex', gap:2, flexWrap:'wrap' }}>
                {dayTasks.slice(0,3).map(t => (
                  <div key={t.id} style={{ width:6, height:6, borderRadius:'50%', background: t.status==='done' ? '#10b981' : pC[t.priority], cursor:'pointer' }} title={t.title} onClick={() => onToggle(t.id)} />
                ))}
              </div>
              {dayTasks.length > 3 && <div style={{ fontSize:'0.5rem', color:'var(--text-muted)' }}>+{dayTasks.length-3}</div>}
              {hasOverdue && <div style={{ position:'absolute', top:2, right:2, width:5, height:5, borderRadius:'50%', background:'#ef4444' }} />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AddTaskModal({ onAdd, onClose }) {
  const [form, setForm] = useState({ title:'Apply second dose fertilizer', crop:'Paddy', type:'Fertilizer', due:NEXT_WEEK, priority:'high', recur:'' });
  const up = (k,v) => setForm(p => ({...p,[k]:v}));

  const handleSave = () => {
    if (!form.title.trim()) return;
    const newTasks = [];
    const base = { id: Date.now(), title: form.title, type: form.type, crop: form.crop, due: form.due, status:'pending', priority: form.priority, auto: false, recur: form.recur };
    newTasks.push(base);
    if (form.recur === 'Weekly') {
      for (let w = 1; w <= 3; w++) {
        newTasks.push({ ...base, id: Date.now() + w, due: addDays(form.due, w * 7), title: `${form.title} (Week ${w+1})` });
      }
    }
    onAdd(newTasks);
    onClose();
  };

  const inp = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid rgba(255,255,255,0.1)', background:'rgba(8,12,20,0.65)', color:'var(--text-primary)', fontSize:'0.85rem', outline:'none' };
  const lbl = { fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4, display:'block' };

  return (
    <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(6px)', animation:'tmFade .25s ease' }} onClick={onClose}>
      <div style={{ width:'min(480px,92vw)', background:'var(--bg-card)', borderRadius:16, border:'1px solid var(--border)', boxShadow:'0 20px 60px rgba(0,0,0,0.5)', animation:'tmSlide .3s ease' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding:'18px 22px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontSize:'1rem', fontWeight:800, color:'var(--text-primary)' }}>➕ Add Task</div>
          <button onClick={onClose} style={{ background:'none', border:'none', color:'var(--text-muted)', fontSize:'1.3rem', cursor:'pointer' }}>✕</button>
        </div>
        <div style={{ padding:'18px 22px' }}>
          <div style={{ marginBottom:14 }}><label style={lbl}>Task Title</label><input value={form.title} onChange={e => up('title',e.target.value)} style={inp} /></div>
          <div style={{ display:'flex', gap:12, marginBottom:14 }}>
            <div style={{ flex:1 }}><label style={lbl}>Crop</label>
              <select value={form.crop} onChange={e => up('crop',e.target.value)} style={{...inp, appearance:'auto'}}>{CROPS.map(c => <option key={c}>{c}</option>)}<option value="-">None</option></select>
            </div>
            <div style={{ flex:1 }}><label style={lbl}>Type</label>
              <select value={form.type} onChange={e => up('type',e.target.value)} style={{...inp, appearance:'auto'}}>{TYPES.map(t => <option key={t}>{t}</option>)}</select>
            </div>
          </div>
          <div style={{ display:'flex', gap:12, marginBottom:14 }}>
            <div style={{ flex:1 }}><label style={lbl}>Due Date</label><input type="date" value={form.due} onChange={e => up('due',e.target.value)} style={inp} /></div>
            <div style={{ flex:1 }}><label style={lbl}>Priority</label>
              <select value={form.priority} onChange={e => up('priority',e.target.value)} style={{...inp, appearance:'auto'}}>
                <option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option>
              </select>
            </div>
          </div>
          <div style={{ marginBottom:18 }}><label style={lbl}>Recurring</label>
            <select value={form.recur} onChange={e => up('recur',e.target.value)} style={{...inp, appearance:'auto'}}>
              <option value="">No Repeat</option><option value="Weekly">Weekly (auto-creates 4 weeks)</option>
            </select>
            {form.recur === 'Weekly' && <div style={{ fontSize:'0.7rem', color:'#60a5fa', marginTop:4 }}>ℹ️ Will create tasks for the next 4 weeks</div>}
          </div>
          <button onClick={handleSave} style={{ width:'100%', padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontWeight:700, fontSize:'0.88rem', cursor:'pointer' }}>💾 Save Task</button>
        </div>
      </div>
    </div>
  );
}

export default function TaskManagerPage() {
  const [tasks, setTasks] = useState(INITIAL);
  const [filter, setFilter] = useState('all');
  const [view, setView] = useState('list');
  const [showAdd, setShowAdd] = useState(false);
  const [doneAnim, setDoneAnim] = useState(null);

  const overdue = tasks.filter(t => t.status === 'pending' && t.due < TODAY).length;
  const todayCount = tasks.filter(t => t.due === TODAY && t.status === 'pending').length;
  const pendingCount = tasks.filter(t => t.status === 'pending').length;
  const doneCount = tasks.filter(t => t.status === 'done').length;

  const filtered = useMemo(() => {
    let items = tasks;
    if (filter === 'pending') items = items.filter(t => t.status === 'pending');
    if (filter === 'done') items = items.filter(t => t.status === 'done');
    if (filter === 'overdue') items = items.filter(t => t.status === 'pending' && t.due < TODAY);
    if (filter === 'today') items = items.filter(t => t.due === TODAY);
    return items.sort((a, b) => a.due.localeCompare(b.due));
  }, [tasks, filter]);

  function toggleDone(id) {
    const t = tasks.find(x => x.id === id);
    if (t && t.status === 'pending') { setDoneAnim(id); setTimeout(() => setDoneAnim(null), 600); }
    setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t));
  }

  function addTasks(newTasks) { setTasks(prev => [...prev, ...newTasks]); }

  return (
    <div className="animated">
      <style>{`
        @keyframes tmFade{from{opacity:0}to{opacity:1}}
        @keyframes tmSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
        @keyframes tmDone{0%{transform:scale(1)}30%{transform:scale(1.05)}60%{transform:scale(0.97)}100%{transform:scale(1)}}
        @keyframes tmCheck{0%{transform:scale(0) rotate(-45deg)}50%{transform:scale(1.3) rotate(0deg)}100%{transform:scale(1)}}
        .tm-done-anim{animation:tmDone .5s ease}
        .tm-check-anim{animation:tmCheck .4s ease}
      `}</style>

      <div className="section-header">
        <div>
          <div className="section-title">📋 Task Manager</div>
          <div style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginTop:2 }}>Crop calendar tasks + custom reminders</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding:20, marginBottom:16 }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
          {[
            { l:'Today', v:todayCount, bg:'rgba(59,130,246,0.08)', bc:'rgba(59,130,246,0.15)', c:'#60a5fa' },
            { l:'Overdue', v:overdue, bg:'rgba(239,68,68,0.08)', bc:'rgba(239,68,68,0.15)', c:'#f87171', badge:overdue>0 },
            { l:'Pending', v:pendingCount, bg:'rgba(245,158,11,0.08)', bc:'rgba(245,158,11,0.15)', c:'#fbbf24' },
            { l:'Done', v:doneCount, bg:'rgba(16,185,129,0.08)', bc:'rgba(16,185,129,0.15)', c:'#34d399' },
          ].map(x => (
            <div key={x.l} style={{ textAlign:'center', padding:14, borderRadius:12, background:x.bg, border:`1px solid ${x.bc}`, position:'relative' }}>
              <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:4 }}>{x.l}</div>
              <div style={{ fontSize:'1.3rem', fontWeight:800, color:x.c }}>{x.v}</div>
              {x.badge && <div style={{ position:'absolute', top:6, right:6, minWidth:18, height:18, borderRadius:9, background:'#ef4444', color:'#fff', fontSize:'0.6rem', fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', padding:'0 4px', boxShadow:'0 0 8px rgba(239,68,68,0.5)' }}>{x.v}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding:12, marginBottom:16, display:'flex', gap:6, flexWrap:'wrap', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {['all','today','pending','overdue','done'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding:'6px 14px', borderRadius:999, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', transition:'all 0.15s',
              border:'1px solid', borderColor: filter===f ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)',
              background: filter===f ? 'rgba(16,185,129,0.15)' : 'transparent', color: filter===f ? '#34d399' : 'var(--text-secondary)',
            }}>{f.charAt(0).toUpperCase()+f.slice(1)}{f==='overdue'&&overdue>0?` (${overdue})`:''}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:6 }}>
          {['list','calendar'].map(v => (
            <button key={v} onClick={() => setView(v)} style={{ padding:'6px 14px', borderRadius:999, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', border:'1px solid', borderColor:view===v?'rgba(59,130,246,0.4)':'rgba(255,255,255,0.1)', background:view===v?'rgba(59,130,246,0.15)':'transparent', color:view===v?'#60a5fa':'var(--text-secondary)', transition:'all .15s' }}>
              {v==='list'?'📋 List':'📅 Calendar'}
            </button>
          ))}
        </div>
      </div>

      {/* Add Task Button */}
      <div className="card" style={{ padding:14, marginBottom:16, display:'flex', gap:10, alignItems:'center' }}>
        <button onClick={() => setShowAdd(true)} style={{ flex:1, padding:'12px', borderRadius:12, background:'linear-gradient(135deg,#059669,#10b981)', color:'#fff', border:'none', fontWeight:700, fontSize:'0.88rem', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          ➕ Add Task
        </button>
      </div>

      {/* Calendar View */}
      {view === 'calendar' && <CalendarView tasks={tasks} onToggle={toggleDone} />}

      {/* List View */}
      {view === 'list' && filtered.map(t => {
        const isOverdue = t.status === 'pending' && t.due < TODAY;
        const isDoneAnim = doneAnim === t.id;
        return (
          <div key={t.id} className={`card ${isDoneAnim ? 'tm-done-anim' : ''}`} style={{
            padding:14, marginBottom:8, display:'flex', gap:12, alignItems:'center',
            opacity: t.status==='done' ? 0.55 : 1,
            borderLeft: `3px solid ${isOverdue ? '#ef4444' : pC[t.priority]}`,
            background: isOverdue ? 'rgba(239,68,68,0.03)' : undefined,
            transition:'all 0.2s',
          }}>
            <div style={{ position:'relative' }}>
              <input type="checkbox" checked={t.status==='done'} onChange={() => toggleDone(t.id)}
                className={isDoneAnim ? 'tm-check-anim' : ''}
                style={{ width:22, height:22, accentColor:'#10b981', flexShrink:0, cursor:'pointer' }} />
              {isDoneAnim && <div style={{ position:'absolute', inset:-4, borderRadius:'50%', border:'2px solid #10b981', animation:'tmCheck .4s ease', opacity:0.5 }} />}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontWeight:600, fontSize:'0.88rem', textDecoration: t.status==='done' ? 'line-through' : 'none', color:'var(--text-primary)', lineHeight:1.3 }}>{t.title}</div>
              <div style={{ display:'flex', gap:6, marginTop:6, flexWrap:'wrap', alignItems:'center' }}>
                <span style={tag('rgba(59,130,246,0.12)','#93c5fd')}>{t.type}</span>
                {t.crop !== '-' && <span style={tag('rgba(16,185,129,0.12)','#6ee7b7')}>{t.crop}</span>}
                {t.auto && <span style={tag('rgba(245,158,11,0.12)','#fbbf24')}>⚡ Auto</span>}
                <span style={tag(pBg[t.priority], pC[t.priority])}>{t.priority.charAt(0).toUpperCase()+t.priority.slice(1)}</span>
                {t.recur && <span style={tag('rgba(139,92,246,0.12)','#c4b5fd')}>🔁 {t.recur}</span>}
                <span style={{ fontSize:'0.72rem', color: isOverdue ? '#ef4444' : 'var(--text-muted)', fontWeight: isOverdue ? 700 : 400 }}>
                  📅 {t.due} {isOverdue && '⚠️ OVERDUE'}
                </span>
              </div>
            </div>
          </div>
        );
      })}

      {showAdd && <AddTaskModal onAdd={addTasks} onClose={() => setShowAdd(false)} />}
    </div>
  );
}
