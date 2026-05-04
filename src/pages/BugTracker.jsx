import React, { useState, useMemo } from 'react';
import { useBugReports } from '../lib/hooks/useBugReports';

const SEV_COLORS = { critical:'#FF1744', high:'#FF6D00', medium:'#FFD600', low:'#4CAF50' };
const STATUS_COLORS = { new:'#FF1744', acknowledged:'#40C4FF', in_progress:'#FF9800', resolved:'#00e676', wont_fix:'#607D8B', duplicate:'#9E9E9E' };
const STATUS_LABELS = { new:'New', acknowledged:'Acknowledged', in_progress:'In Progress', resolved:'Resolved', wont_fix:"Won't Fix", duplicate:'Duplicate' };
const CAT_EMOJIS = { ui_bug:'🖥️', functionality:'⚙️', performance:'🐌', crash:'💥', data_error:'📊', api_error:'🔌', design:'🎨', translation:'🌐', mobile:'📱', other:'🔧' };
const glass = { background:'rgba(255,255,255,0.06)', backdropFilter:'blur(14px)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:16 };

function timeAgo(d) {
  if (!d) return '';
  const s = Math.floor((Date.now() - new Date(d).getTime()) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s/60) + 'm ago';
  if (s < 86400) return Math.floor(s/3600) + 'h ago';
  return Math.floor(s/86400) + 'd ago';
}

export default function BugTracker() {
  const { bugs, myBugs, stats, loading, upvoteBug } = useBugReports();
  const [tab, setTab] = useState('all'); // all | my
  const [statusFilter, setStatusFilter] = useState('all');
  const [sevFilter, setSevFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [selected, setSelected] = useState(null);

  const list = tab === 'my' ? myBugs : bugs;

  const filtered = useMemo(() => {
    let r = [...list];
    if (statusFilter !== 'all') r = r.filter(b => b.status === statusFilter);
    if (sevFilter !== 'all') r = r.filter(b => b.severity === sevFilter);
    if (search) { const q = search.toLowerCase(); r = r.filter(b => b.title?.toLowerCase().includes(q) || b.description?.toLowerCase().includes(q)); }
    if (sort === 'newest') r.sort((a,b) => new Date(b.reported_at) - new Date(a.reported_at));
    if (sort === 'oldest') r.sort((a,b) => new Date(a.reported_at) - new Date(b.reported_at));
    if (sort === 'upvotes') r.sort((a,b) => (b.upvote_count||0) - (a.upvote_count||0));
    if (sort === 'severity') { const order = { critical:0, high:1, medium:2, low:3 }; r.sort((a,b) => (order[a.severity]||9) - (order[b.severity]||9)); }
    return r;
  }, [list, statusFilter, sevFilter, search, sort]);

  const statCards = [
    { label:'New', count: stats.new, color:'#FF1744', icon:'🆕' },
    { label:'In Progress', count: stats.in_progress, color:'#FF9800', icon:'🔧' },
    { label:'Resolved', count: stats.resolved, color:'#00e676', icon:'✅' },
    { label:'Total Open', count: (stats.new||0)+(stats.acknowledged||0)+(stats.in_progress||0), color:'#40C4FF', icon:'📋' },
  ];

  return (
    <div style={{ maxWidth:1200, margin:'0 auto' }}>
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,rgba(255,23,68,0.15),rgba(255,109,0,0.1))', border:'1px solid rgba(255,23,68,0.2)', borderRadius:20, padding:'24px 28px', marginBottom:20 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:12 }}>
          <div>
            <h1 style={{ color:'#fff', fontSize:24, fontWeight:800, margin:0 }}>🐛 Bug Tracker</h1>
            <p style={{ color:'rgba(255,255,255,0.5)', fontSize:13, margin:'4px 0 0' }}>Internal QA Dashboard — RythuSphere Team</p>
          </div>
          <div style={{ display:'flex', gap:10, flexWrap:'wrap' }}>
            {statCards.map(s => (
              <div key={s.label} style={{ ...glass, padding:'10px 18px', display:'flex', alignItems:'center', gap:8, minWidth:100 }}>
                <span style={{ fontSize:18 }}>{s.icon}</span>
                <div>
                  <div style={{ color:s.color, fontSize:20, fontWeight:800 }}>{s.count}</div>
                  <div style={{ color:'rgba(255,255,255,0.5)', fontSize:10, fontWeight:600 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabs + Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        {['all','my'].map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            ...glass, padding:'8px 20px', cursor:'pointer', fontWeight:600, fontSize:13,
            background: tab === t ? 'rgba(255,23,68,0.2)' : 'rgba(255,255,255,0.04)',
            border: tab === t ? '1px solid rgba(255,23,68,0.4)' : '1px solid rgba(255,255,255,0.1)',
            color: tab === t ? '#FF1744' : 'rgba(255,255,255,0.6)',
          }}>
            {t === 'all' ? '📋 All Bugs' : '👤 My Reports'}
          </button>
        ))}
        <div style={{ flex:1 }} />
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search bugs..." style={{ ...glass, padding:'8px 14px', color:'#fff', fontSize:13, outline:'none', minWidth:180, fontFamily:'Inter,sans-serif' }} />
        <select value={sort} onChange={e => setSort(e.target.value)} style={{ ...glass, padding:'8px 14px', color:'#fff', fontSize:12, outline:'none', fontFamily:'Inter,sans-serif', cursor:'pointer', appearance:'auto', background:'rgba(255,255,255,0.06)' }}>
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="upvotes">Most Upvoted</option>
          <option value="severity">Severity</option>
        </select>
      </div>

      {/* Filter pills */}
      <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:600, alignSelf:'center', marginRight:4 }}>STATUS:</span>
        {['all','new','acknowledged','in_progress','resolved','wont_fix'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} style={{
            padding:'5px 12px', borderRadius:20, cursor:'pointer', fontSize:11, fontWeight:600,
            background: statusFilter === s ? (STATUS_COLORS[s] || '#FF1744') + '25' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${statusFilter === s ? (STATUS_COLORS[s] || '#FF1744') + '60' : 'rgba(255,255,255,0.08)'}`,
            color: statusFilter === s ? (STATUS_COLORS[s] || '#FF1744') : 'rgba(255,255,255,0.5)',
          }}>
            {s === 'all' ? 'All' : STATUS_LABELS[s]}
          </button>
        ))}
        <span style={{ color:'rgba(255,255,255,0.4)', fontSize:11, fontWeight:600, alignSelf:'center', margin:'0 4px 0 12px' }}>SEV:</span>
        {['all','critical','high','medium','low'].map(s => (
          <button key={s} onClick={() => setSevFilter(s)} style={{
            padding:'5px 12px', borderRadius:20, cursor:'pointer', fontSize:11, fontWeight:600,
            background: sevFilter === s ? (SEV_COLORS[s] || '#FF1744') + '25' : 'rgba(255,255,255,0.04)',
            border: `1px solid ${sevFilter === s ? (SEV_COLORS[s] || '#FF1744') + '60' : 'rgba(255,255,255,0.08)'}`,
            color: sevFilter === s ? (SEV_COLORS[s] || '#FF1744') : 'rgba(255,255,255,0.5)',
          }}>
            {s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      {/* Bug list + Detail panel */}
      <div style={{ display:'flex', gap:16 }}>
        {/* List */}
        <div style={{ flex: selected ? '0 0 55%' : '1 1 100%', transition:'all 0.3s' }}>
          {loading && <div style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.4)' }}>Loading bugs...</div>}
          {!loading && filtered.length === 0 && (
            <div style={{ textAlign:'center', padding:60, ...glass }}>
              <div style={{ fontSize:48, marginBottom:12 }}>🎉</div>
              <div style={{ color:'rgba(255,255,255,0.5)', fontSize:15 }}>No bugs found. The code is perfect! (or filters too strict)</div>
            </div>
          )}
          {filtered.map(bug => (
            <div key={bug.id} onClick={() => setSelected(bug)} style={{
              ...glass, padding:'16px 20px', marginBottom:10, cursor:'pointer',
              borderLeft: `4px solid ${SEV_COLORS[bug.severity] || '#FFD600'}`,
              background: selected?.id === bug.id ? 'rgba(255,23,68,0.08)' : 'rgba(255,255,255,0.04)',
              transition:'all 0.2s',
            }}>
              {/* Top row */}
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', gap:8, marginBottom:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8, flex:1 }}>
                  <span style={{ fontSize:18 }}>{CAT_EMOJIS[bug.category] || '🔧'}</span>
                  <span style={{ color:'#fff', fontWeight:700, fontSize:15, flex:1 }}>{bug.title}</span>
                </div>
                <div style={{ display:'flex', gap:6, alignItems:'center', flexShrink:0 }}>
                  <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background: (STATUS_COLORS[bug.status]||'#666') + '25', color: STATUS_COLORS[bug.status]||'#666', fontWeight:700, whiteSpace:'nowrap' }}>{STATUS_LABELS[bug.status]}</span>
                  <span style={{ color:'rgba(255,255,255,0.3)', fontSize:11 }}>{timeAgo(bug.reported_at)}</span>
                </div>
              </div>
              {/* Reporter */}
              <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:6, fontSize:12, color:'rgba(255,255,255,0.5)' }}>
                <span style={{ width:20, height:20, borderRadius:'50%', background:'rgba(255,255,255,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>👤</span>
                {bug.reporter_name}
                {bug.reporter_role && <span style={{ padding:'2px 8px', borderRadius:10, background:'rgba(255,255,255,0.06)', fontSize:10 }}>{bug.reporter_role}</span>}
                {bug.page_name && <span style={{ color:'rgba(255,255,255,0.3)' }}>on <span style={{ color:'#40C4FF' }}>{bug.page_name}</span></span>}
              </div>
              {/* Description */}
              <p style={{ color:'rgba(255,255,255,0.55)', fontSize:13, margin:'0 0 8px', lineHeight:1.4, overflow:'hidden', textOverflow:'ellipsis', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}>{bug.description}</p>
              {/* Bottom row */}
              <div style={{ display:'flex', alignItems:'center', gap:12, fontSize:12 }}>
                <button onClick={(e) => { e.stopPropagation(); upvoteBug(bug.id); }} style={{ background:'none', border:'none', cursor:'pointer', color:'rgba(255,255,255,0.5)', fontSize:12, display:'flex', alignItems:'center', gap:4 }}>
                  👍 {bug.upvote_count || 0}
                </button>
                {bug.tags?.length > 0 && bug.tags.slice(0,3).map(t => (
                  <span key={t} style={{ padding:'2px 8px', borderRadius:8, background:'rgba(255,255,255,0.05)', color:'rgba(255,255,255,0.35)', fontSize:10 }}>{t}</span>
                ))}
                {bug.status === 'resolved' && <span style={{ color:'#00e676', fontSize:11, marginLeft:'auto' }}>✅ Fixed {timeAgo(bug.resolved_at)}</span>}
                {bug.developer_note && <span style={{ color:'#FF9800', fontSize:11, marginLeft:'auto' }}>🔧 Dev note</span>}
              </div>
            </div>
          ))}
        </div>

        {/* Detail Drawer */}
        {selected && (
          <div style={{ flex:'0 0 42%', ...glass, padding:24, position:'sticky', top:80, maxHeight:'80vh', overflowY:'auto', borderRadius:20 }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ color:'#fff', fontSize:17, fontWeight:700, margin:0 }}>Bug Details</h3>
              <button onClick={() => setSelected(null)} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.5)', width:32, height:32, borderRadius:'50%', fontSize:16, cursor:'pointer' }}>✕</button>
            </div>

            {/* Category + Severity badges */}
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <span style={{ fontSize:10, padding:'4px 12px', borderRadius:20, background:(SEV_COLORS[selected.severity]||'#FFD600')+'25', color:SEV_COLORS[selected.severity], fontWeight:700 }}>{selected.severity?.toUpperCase()}</span>
              <span style={{ fontSize:10, padding:'4px 12px', borderRadius:20, background:'rgba(64,196,255,0.15)', color:'#40C4FF', fontWeight:700 }}>{CAT_EMOJIS[selected.category]} {selected.category?.replace('_',' ')}</span>
              <span style={{ fontSize:10, padding:'4px 12px', borderRadius:20, background:(STATUS_COLORS[selected.status]||'#666')+'25', color:STATUS_COLORS[selected.status], fontWeight:700 }}>{STATUS_LABELS[selected.status]}</span>
            </div>

            <h2 style={{ color:'#fff', fontSize:18, fontWeight:700, marginBottom:12 }}>{selected.title}</h2>
            <p style={{ color:'rgba(255,255,255,0.7)', fontSize:13, lineHeight:1.6, marginBottom:16 }}>{selected.description}</p>

            {selected.steps_to_reproduce && (
              <div style={{ marginBottom:14 }}>
                <h4 style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:700, marginBottom:6 }}>STEPS TO REPRODUCE</h4>
                <div style={{ ...glass, padding:'12px 16px', fontSize:13, color:'rgba(255,255,255,0.7)', whiteSpace:'pre-wrap', lineHeight:1.5 }}>{selected.steps_to_reproduce}</div>
              </div>
            )}

            {(selected.expected_behavior || selected.actual_behavior) && (
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:14 }}>
                {selected.expected_behavior && (
                  <div style={{ background:'rgba(0,230,118,0.06)', border:'1px solid rgba(0,230,118,0.15)', borderRadius:12, padding:12 }}>
                    <div style={{ fontSize:10, color:'#00e676', fontWeight:700, marginBottom:4 }}>EXPECTED</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>{selected.expected_behavior}</div>
                  </div>
                )}
                {selected.actual_behavior && (
                  <div style={{ background:'rgba(255,82,82,0.06)', border:'1px solid rgba(255,82,82,0.15)', borderRadius:12, padding:12 }}>
                    <div style={{ fontSize:10, color:'#FF5252', fontWeight:700, marginBottom:4 }}>ACTUAL</div>
                    <div style={{ fontSize:12, color:'rgba(255,255,255,0.65)' }}>{selected.actual_behavior}</div>
                  </div>
                )}
              </div>
            )}

            {/* Meta info */}
            <div style={{ ...glass, padding:'12px 16px', marginBottom:14, fontSize:11, color:'rgba(255,255,255,0.4)', display:'grid', gridTemplateColumns:'1fr 1fr', gap:6 }}>
              <div>📍 Page: <span style={{ color:'#40C4FF' }}>{selected.page_name || selected.page_url}</span></div>
              <div>🖥️ {selected.device_info?.slice(0,40)}</div>
              <div>📅 {new Date(selected.reported_at).toLocaleString()}</div>
              <div>🌐 {selected.platform}</div>
              {selected.assigned_to && <div>👨‍💻 Assigned: {selected.assigned_to}</div>}
              <div>👍 {selected.upvote_count || 0} upvotes</div>
            </div>

            {selected.developer_note && (
              <div style={{ background:'rgba(255,152,0,0.08)', border:'1px solid rgba(255,152,0,0.2)', borderRadius:12, padding:'12px 16px', marginBottom:14 }}>
                <div style={{ fontSize:10, color:'#FF9800', fontWeight:700, marginBottom:4 }}>🔧 DEVELOPER NOTE</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{selected.developer_note}</div>
              </div>
            )}

            {selected.resolution_note && (
              <div style={{ background:'rgba(0,230,118,0.08)', border:'1px solid rgba(0,230,118,0.2)', borderRadius:12, padding:'12px 16px' }}>
                <div style={{ fontSize:10, color:'#00e676', fontWeight:700, marginBottom:4 }}>✅ RESOLUTION</div>
                <div style={{ fontSize:13, color:'rgba(255,255,255,0.7)' }}>{selected.resolution_note}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
