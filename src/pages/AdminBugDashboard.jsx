import React, { useState, useMemo, useCallback } from 'react';
import { useBugReports } from '../lib/hooks/useBugReports';
import { useLanguage } from '../lib/i18n/LanguageContext';

const SEV = { critical:'#FF1744', high:'#FF6D00', medium:'#FFD600', low:'#4CAF50' };
const STA = { new:'#FF1744', acknowledged:'#40C4FF', in_progress:'#FF9800', resolved:'#00e676', wont_fix:'#607D8B' };
const STA_L = { new:'New', acknowledged:'Acknowledged', in_progress:'In Progress', resolved:'Resolved', wont_fix:"Won't Fix" };
const CAT_E = { ui_bug:'🖥️', functionality:'⚙️', performance:'🐌', crash:'💥', data_error:'📊', api_error:'🔌', design:'🎨', translation:'🌐', mobile:'📱', other:'🔧' };
const glass = { background:'rgba(255,255,255,0.05)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:16 };

function ago(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'now';
  if (s < 3600) return Math.floor(s/60) + 'm';
  if (s < 86400) return Math.floor(s/3600) + 'h';
  return Math.floor(s/86400) + 'd';
}

const COLUMNS = [
  { key:'new', label:'🆕 New', color:'#FF1744' },
  { key:'acknowledged', label:'👀 Acknowledged', color:'#40C4FF' },
  { key:'in_progress', label:'🔧 In Progress', color:'#FF9800' },
  { key:'resolved', label:'✅ Resolved', color:'#00e676' },
];

export default function AdminBugDashboard() {
  const { bugs, stats, updateBugStatus, loading } = useBugReports();
  const [view, setView] = useState('kanban');
  const [selected, setSelected] = useState(null);
  const [devNote, setDevNote] = useState('');
  const [resNote, setResNote] = useState('');
  const [dragId, setDragId] = useState(null);

  const byStatus = useMemo(() => {
    const m = { new:[], acknowledged:[], in_progress:[], resolved:[], wont_fix:[] };
    bugs.forEach(b => { if (m[b.status]) m[b.status].push(b); else m.new.push(b); });
    return m;
  }, [bugs]);

  const handleDrop = useCallback((newStatus) => {
    if (!dragId) return;
    updateBugStatus(dragId, newStatus, '');
    setDragId(null);
  }, [dragId, updateBugStatus]);

  const quickAction = (bugId, status, note='') => {
    updateBugStatus(bugId, status, note);
    if (selected?.id === bugId) setSelected(prev => ({ ...prev, status }));
  };

  const topStats = [
    { icon:'🔴', label:'Critical', count:stats.critical||0, color:'#FF1744', pulse:true },
    { icon:'🟠', label:'High', count:stats.high||0, color:'#FF6D00' },
    { icon:'🟡', label:'Medium', count:stats.medium||0, color:'#FFD600' },
    { icon:'🟢', label:'Low', count:stats.low||0, color:'#4CAF50' },
    { icon:'✅', label:'Resolved', count:stats.resolved||0, color:'#00e676' },
    { icon:'📊', label:'Total', count:stats.total||0, color:'#E040FB' },
  ];

  return (
    <div style={{ maxWidth:1400, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,rgba(255,23,68,0.12),rgba(255,109,0,0.08))', border:'1px solid rgba(255,23,68,0.15)', borderRadius:20, padding:'20px 28px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ color:'#fff', fontSize:22, fontWeight:800, margin:0 }}>🐛 Admin Bug Dashboard</h1>
            <p style={{ color:'rgba(255,255,255,0.4)', fontSize:12, margin:'4px 0 0' }}>Developer QA Console — Drag to resolve</p>
          </div>
          <div style={{ display:'flex', gap:6 }}>
            {['kanban','list'].map(v => (
              <button key={v} onClick={() => setView(v)} style={{
                ...glass, padding:'7px 16px', cursor:'pointer', fontSize:12, fontWeight:600,
                background: view === v ? 'rgba(255,23,68,0.2)' : 'rgba(255,255,255,0.04)',
                color: view === v ? '#FF1744' : 'rgba(255,255,255,0.5)',
                border: view === v ? '1px solid rgba(255,23,68,0.3)' : '1px solid rgba(255,255,255,0.08)',
              }}>
                {v === 'kanban' ? '📋 Kanban' : '📄 List'}
              </button>
            ))}
          </div>
        </div>
        {/* Stats */}
        <div style={{ display:'flex', gap:10, marginTop:16, flexWrap:'wrap' }}>
          {topStats.map(s => (
            <div key={s.label} style={{ ...glass, padding:'10px 16px', display:'flex', alignItems:'center', gap:8, flex:'1 1 120px', minWidth:100, animation: s.pulse && s.count > 0 ? 'pulse-glow 2s infinite' : 'none' }}>
              <span style={{ fontSize:20 }}>{s.icon}</span>
              <div>
                <div style={{ color:s.color, fontSize:22, fontWeight:800, lineHeight:1 }}>{s.count}</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:10, fontWeight:600 }}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display:'flex', gap:16 }}>
        {/* Main area */}
        <div style={{ flex:selected ? '0 0 58%' : '1 1 100%', transition:'all 0.3s' }}>
          {/* KANBAN VIEW */}
          {view === 'kanban' && (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, alignItems:'flex-start' }}>
              {COLUMNS.map(col => (
                <div key={col.key}
                  onDragOver={e => e.preventDefault()}
                  onDrop={() => handleDrop(col.key)}
                  style={{ ...glass, padding:0, minHeight:300, borderRadius:16, overflow:'hidden' }}
                >
                  {/* Column header */}
                  <div style={{ padding:'12px 16px', background: col.color + '15', borderBottom: `2px solid ${col.color}40`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <span style={{ color:'#fff', fontWeight:700, fontSize:13 }}>{col.label}</span>
                    <span style={{ background:col.color+'30', color:col.color, padding:'2px 10px', borderRadius:20, fontSize:11, fontWeight:700 }}>{byStatus[col.key]?.length || 0}</span>
                  </div>
                  {/* Cards */}
                  <div style={{ padding:8, display:'flex', flexDirection:'column', gap:6 }}>
                    {(byStatus[col.key] || []).map(bug => (
                      <div key={bug.id} draggable onDragStart={() => setDragId(bug.id)} onClick={() => { setSelected(bug); setDevNote(bug.developer_note||''); setResNote(bug.resolution_note||''); }}
                        style={{
                          background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)',
                          borderLeft: `3px solid ${SEV[bug.severity]||'#FFD600'}`, borderRadius:10, padding:'10px 12px',
                          cursor:'grab', transition:'all 0.2s',
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.08)'; e.currentTarget.style.transform='translateY(-1px)'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.04)'; e.currentTarget.style.transform='none'; }}
                      >
                        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:4 }}>
                          <span style={{ fontSize:14 }}>{CAT_E[bug.category]||'🔧'}</span>
                          <span style={{ color:'#fff', fontWeight:600, fontSize:12, flex:1, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bug.title?.slice(0,40)}</span>
                        </div>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', fontSize:10, color:'rgba(255,255,255,0.35)' }}>
                          <span>{bug.reporter_name?.split(' ')[0]} · {ago(bug.reported_at)}</span>
                          <span style={{ padding:'1px 6px', borderRadius:8, background:SEV[bug.severity]+'20', color:SEV[bug.severity], fontWeight:700, fontSize:9 }}>{bug.severity?.slice(0,4).toUpperCase()}</span>
                        </div>
                        {bug.upvote_count > 0 && <div style={{ fontSize:10, color:'rgba(255,255,255,0.3)', marginTop:3 }}>👍 {bug.upvote_count}</div>}
                      </div>
                    ))}
                    {(byStatus[col.key]||[]).length === 0 && <div style={{ textAlign:'center', padding:20, color:'rgba(255,255,255,0.15)', fontSize:12 }}>No bugs</div>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* LIST VIEW */}
          {view === 'list' && (
            <div style={{ ...glass, overflow:'hidden' }}>
              <table style={{ width:'100%', borderCollapse:'collapse', fontSize:13 }}>
                <thead>
                  <tr style={{ background:'rgba(255,23,68,0.08)' }}>
                    {['Sev','Cat','Title','Reporter','Page','Status','👍','Time'].map(h => (
                      <th key={h} style={{ padding:'10px 12px', color:'rgba(255,255,255,0.6)', fontWeight:700, fontSize:11, textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {bugs.map(bug => (
                    <tr key={bug.id} onClick={() => { setSelected(bug); setDevNote(bug.developer_note||''); setResNote(bug.resolution_note||''); }}
                      style={{ cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.04)'}
                      onMouseLeave={e => e.currentTarget.style.background='transparent'}
                    >
                      <td style={{ padding:'10px 12px' }}><span style={{ width:10, height:10, borderRadius:'50%', display:'inline-block', background:SEV[bug.severity] }} /></td>
                      <td style={{ padding:'10px 8px', fontSize:16 }}>{CAT_E[bug.category]}</td>
                      <td style={{ padding:'10px 8px', color:'#fff', fontWeight:600, maxWidth:250, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{bug.title}</td>
                      <td style={{ padding:'10px 8px', color:'rgba(255,255,255,0.5)' }}>{bug.reporter_name?.split(' ')[0]}</td>
                      <td style={{ padding:'10px 8px', color:'#40C4FF', fontSize:11 }}>{bug.page_name}</td>
                      <td style={{ padding:'10px 8px' }}><span style={{ padding:'3px 10px', borderRadius:10, background:STA[bug.status]+'20', color:STA[bug.status], fontWeight:700, fontSize:10 }}>{STA_L[bug.status]}</span></td>
                      <td style={{ padding:'10px 8px', color:'rgba(255,255,255,0.4)', fontSize:12 }}>{bug.upvote_count||0}</td>
                      <td style={{ padding:'10px 8px', color:'rgba(255,255,255,0.3)', fontSize:11 }}>{ago(bug.reported_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Detail Panel */}
        {selected && (
          <div style={{ flex:'0 0 40%', ...glass, padding:24, position:'sticky', top:80, maxHeight:'85vh', overflowY:'auto', borderRadius:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
              <h3 style={{ color:'#fff', fontSize:16, fontWeight:700, margin:0 }}>🔍 Bug Details</h3>
              <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.5)', width:30, height:30, borderRadius:'50%', cursor:'pointer', fontSize:14 }}>✕</button>
            </div>

            {/* Badges */}
            <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
              <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:SEV[selected.severity]+'25', color:SEV[selected.severity], fontWeight:700 }}>{selected.severity?.toUpperCase()}</span>
              <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:'rgba(64,196,255,0.12)', color:'#40C4FF' }}>{CAT_E[selected.category]} {selected.category?.replace('_',' ')}</span>
              <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:STA[selected.status]+'25', color:STA[selected.status], fontWeight:700 }}>{STA_L[selected.status]}</span>
            </div>

            <h2 style={{ color:'#fff', fontSize:16, fontWeight:700, marginBottom:10, lineHeight:1.3 }}>{selected.title}</h2>
            <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginBottom:14, lineHeight:1.5 }}>{selected.description}</p>

            {/* Reporter info */}
            <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:14, display:'grid', gridTemplateColumns:'1fr 1fr', gap:4 }}>
              <div>👤 {selected.reporter_name}</div>
              <div>📍 {selected.page_name}</div>
              <div>🖥️ {selected.device_info?.slice(0,35)}</div>
              <div>📅 {ago(selected.reported_at)} ago</div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginBottom:16 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:700, marginBottom:8 }}>QUICK ACTIONS</div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
                <button onClick={() => quickAction(selected.id, 'acknowledged')} style={{ ...glass, padding:'10px 14px', cursor:'pointer', color:'#40C4FF', fontWeight:600, fontSize:12, textAlign:'center' }}>👀 Acknowledge</button>
                <button onClick={() => quickAction(selected.id, 'in_progress')} style={{ ...glass, padding:'10px 14px', cursor:'pointer', color:'#FF9800', fontWeight:600, fontSize:12, textAlign:'center' }}>🔧 Start Work</button>
                <button onClick={() => quickAction(selected.id, 'wont_fix', 'Not a bug / out of scope')} style={{ ...glass, padding:'10px 14px', cursor:'pointer', color:'#607D8B', fontWeight:600, fontSize:12, textAlign:'center' }}>❌ Won't Fix</button>
                <button onClick={() => quickAction(selected.id, 'resolved', resNote || 'Fixed')} style={{ padding:'10px 14px', borderRadius:16, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#00e676,#00c853)', color:'#000', fontWeight:700, fontSize:12, textAlign:'center' }}>✅ Mark Fixed</button>
              </div>
            </div>

            {/* Developer Note */}
            <div style={{ marginBottom:14 }}>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:700, marginBottom:6 }}>🔧 DEVELOPER NOTE</div>
              <textarea value={devNote} onChange={e => setDevNote(e.target.value)} placeholder="Add note visible to reporter..." rows={2} style={{ ...glass, width:'100%', padding:'10px 14px', color:'#fff', fontSize:12, outline:'none', fontFamily:'Inter,sans-serif', resize:'vertical' }} />
              <button onClick={() => updateBugStatus(selected.id, selected.status, devNote)} style={{ ...glass, padding:'6px 14px', cursor:'pointer', color:'#FF9800', fontSize:11, fontWeight:600, marginTop:6 }}>Save Note</button>
            </div>

            {/* Resolution Note */}
            <div>
              <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', fontWeight:700, marginBottom:6 }}>✅ RESOLUTION NOTE</div>
              <textarea value={resNote} onChange={e => setResNote(e.target.value)} placeholder="How did you fix it..." rows={2} style={{ ...glass, width:'100%', padding:'10px 14px', color:'#fff', fontSize:12, outline:'none', fontFamily:'Inter,sans-serif', resize:'vertical' }} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
