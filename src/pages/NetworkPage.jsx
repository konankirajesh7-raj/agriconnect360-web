import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const ROLE_CFG = {
  farmer:{ icon:'👨‍🌾', color:'#22c55e', bg:'rgba(34,197,94,0.1)', label:'Farmer' },
  broker:{ icon:'🤝', color:'#8b5cf6', bg:'rgba(139,92,246,0.1)', label:'Broker' },
  supplier:{ icon:'🏪', color:'#3b82f6', bg:'rgba(59,130,246,0.1)', label:'Supplier' },
  labour:{ icon:'👷', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', label:'Labour' },
  industry:{ icon:'🏭', color:'#ec4899', bg:'rgba(236,72,153,0.1)', label:'Industry' },
  industrial:{ icon:'🏭', color:'#ec4899', bg:'rgba(236,72,153,0.1)', label:'Industry' },
  customer:{ icon:'🛒', color:'#06b6d4', bg:'rgba(6,182,212,0.1)', label:'Customer' },
};

export default function NetworkPage() {
  const { t, tx } = useLanguage();
  const { uid } = useAuth();
  const [tab, setTab] = useState('connections');
  const [scopeFilter, setScope] = useState('all');
  const [cropFilter, setCrop] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name:'', desc:'', crop:'', isPublic:true, scope:'district' });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [selectedPerson, setSelectedPerson] = useState(null);
  const [locFilter, setLocFilter] = useState('all');

  // DB-backed state
  const [allPeople, setAllPeople] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joined, setJoined] = useState(new Set());
  const [connected, setConnected] = useState(new Set());

  // Fetch profiles from Supabase
  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await supabase.from('profiles').select('id,full_name,name,role,district,village,mandal,phone,mobile').order('created_at',{ascending:false}).limit(200);
        if (data?.length) {
          setAllPeople(data.map(p => ({
            id: p.id,
            name: p.full_name || p.name || 'User',
            role: p.role || 'farmer',
            loc: p.district || '—',
            village: p.village || p.mandal || '',
            detail: `${(p.role||'farmer').charAt(0).toUpperCase()+(p.role||'farmer').slice(1)} · ${p.district||'AP'}`,
            phone: p.phone || p.mobile || '',
            rating: (4 + Math.random()).toFixed(1),
            bio: `${p.full_name||p.name||'User'} from ${p.village||p.district||'AP'}`,
          })));
        }
      } catch {}

      // Fetch groups from community_groups or fallback empty
      try {
        const { data: gData } = await supabase.from('community_groups').select('*').order('created_at',{ascending:false}).limit(50);
        if (gData?.length) {
          setGroups(gData.map(g => ({
            id: g.id, name: g.name||'Group', type: g.type||'crop', scope: g.scope||'district',
            loc: g.district||'AP', members: g.member_count||0, crop: g.crop||'All',
            isPublic: g.is_public !== false, img: g.emoji||'🌾', active: true, desc: g.description||''
          })));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const AP_LOCS = ['all', ...new Set(allPeople.map(p => p.loc).filter(l => l && l !== '—'))];
  const crops = [...new Set(groups.map(g => g.crop).filter(Boolean))];

  const filteredPeople = allPeople.filter(p => {
    if (roleFilter !== 'all' && p.role !== roleFilter) return false;
    if (locFilter !== 'all' && p.loc !== locFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.loc.toLowerCase().includes(search.toLowerCase()) && !p.detail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const filtered = groups.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (scopeFilter !== 'all' && g.scope !== scopeFilter) return false;
    if (cropFilter !== 'all' && g.crop !== cropFilter) return false;
    return true;
  });

  const INP = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', boxSizing:'border-box' };

  const EmptyState = ({ icon, title, sub }) => (
    <div className="card" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>
      <div style={{ fontSize:'2.5rem', marginBottom:10 }}>{icon}</div>
      <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:4, color:'var(--text-primary)' }}>{title}</div>
      <div style={{ fontSize:'0.8rem' }}>{sub}</div>
    </div>
  );

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🤝 Farmer Network</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>Connect with farmers, farm workers, brokers, suppliers & industries</div>
        </div>
        <button onClick={() => setShowCreate(true)} style={{ padding:'8px 14px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.82rem', cursor:'pointer' }}>➕ Create Group</button>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:8, marginBottom:14 }}>
        {Object.entries(ROLE_CFG).filter(([k]) => ['farmer','broker','labour','supplier','industry'].includes(k)).map(([k,v]) => {
          const cnt = allPeople.filter(p => p.role === k || (k === 'industry' && p.role === 'industrial')).length;
          return (<div key={k} style={{ background:v.bg, border:`1px solid ${v.bg.replace('0.1','0.25')}`, borderRadius:10, padding:'10px 8px', textAlign:'center' }}>
            <div style={{ fontSize:'1.2rem' }}>{v.icon}</div>
            <div style={{ fontWeight:800, fontSize:'1rem', color:v.color }}>{cnt}</div>
            <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{v.label}s</div>
          </div>);
        })}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:14, background:'var(--bg-primary)', borderRadius:10, padding:4 }}>
        {[{id:'connections',l:'👥 All Connections'},{id:'my',l:'⭐ My Network'},{id:'groups',l:'🏘️ Groups'}].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', fontSize:'0.78rem', fontWeight: tab === t.id ? 700 : 500, cursor:'pointer', background: tab === t.id ? 'var(--bg-card)' : 'transparent', color: tab === t.id ? '#22c55e' : 'var(--text-muted)' }}>{t.l}</button>
        ))}
      </div>

      {loading && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>⏳ Loading network data...</div>}

      {/* CONNECTIONS TAB */}
      {!loading && tab === 'connections' && (
        <div>
          <div style={{ display:'flex', gap:8, marginBottom:10, flexWrap:'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search by name, district, skill..." style={{ ...INP, flex:2, minWidth:200 }} />
            <select value={locFilter} onChange={e => setLocFilter(e.target.value)} style={{ ...INP, flex:1, minWidth:140 }}>
              {AP_LOCS.map(l => <option key={l} value={l}>{l === 'all' ? '📍 All Locations' : `📍 ${l}`}</option>)}
            </select>
          </div>
          <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
            {['all','farmer','broker','labour','supplier','industry'].map(r => (
              <button key={r} onClick={() => setRoleFilter(r)} style={{ padding:'5px 12px', borderRadius:14, border:'none', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', background: roleFilter===r ? (ROLE_CFG[r]?.color || '#22c55e') : 'var(--bg-card)', color: roleFilter===r ? '#fff' : 'var(--text-muted)' }}>
                {r==='all' ? '🌐 All' : `${ROLE_CFG[r].icon} ${ROLE_CFG[r].label}s`}
              </button>
            ))}
          </div>
          {filteredPeople.length === 0 ? (
            <EmptyState icon="👥" title="No connections found" sub="No registered users match your filter. Invite people to join the platform!" />
          ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
            {filteredPeople.map((p,i) => {
              const rc = ROLE_CFG[p.role] || ROLE_CFG.farmer;
              const isConn = connected.has(p.id);
              return (
                <div key={p.id||i} className="card" style={{ padding:16, borderLeft:`3px solid ${rc.color}`, cursor:'pointer', transition:'transform 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.transform=''}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:rc.bg, border:`2px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>{rc.icon}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{p.name}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📍 {p.loc}{p.village ? ` · ${p.village}` : ''}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:'0.65rem', padding:'3px 10px', borderRadius:10, background:rc.bg, color:rc.color, fontWeight:700 }}>{rc.label}</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', margin:'8px 0 4px 0' }}>{p.detail}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:10 }}>⭐ {p.rating} rating</div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={(e)=>{e.stopPropagation(); setSelectedPerson(p)}} style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>👁️ View Details</button>
                    <button onClick={(e)=>{e.stopPropagation(); setConnected(prev=>{const n=new Set(prev); n.has(p.id)?n.delete(p.id):n.add(p.id); return n;})}} style={{ flex:1, padding:'7px', borderRadius:8, border:'none', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', background: isConn ? 'rgba(239,68,68,0.1)' : `linear-gradient(135deg,${rc.color},${rc.color}dd)`, color: isConn ? '#ef4444' : '#fff' }}>
                      {isConn ? '✕ Disconnect' : '➕ Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          )}
        </div>
      )}

      {/* MY NETWORK */}
      {!loading && tab === 'my' && (
        <div>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10 }}>⭐ My Connections ({connected.size})</div>
          {connected.size === 0 && <EmptyState icon="⭐" title="No connections yet" sub='Go to "All Connections" tab to connect with people!' />}
          {[...connected].map(cid => {
            const c = allPeople.find(p => p.id === cid); if(!c) return null;
            const rc = ROLE_CFG[c.role] || ROLE_CFG.farmer;
            return (
              <div key={cid} className="card" style={{ padding:14, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:rc.bg, border:`2px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{rc.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.85rem' }}>{c.name} <span style={{ fontSize:'0.65rem', padding:'2px 8px', borderRadius:8, background:rc.bg, color:rc.color, fontWeight:600, marginLeft:4 }}>{rc.label}</span></div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>📍 {c.loc} · {c.detail}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setSelectedPerson(c)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', fontSize:'0.75rem', cursor:'pointer' }}>👁️</button>
                  {c.phone && <a href={`tel:${c.phone}`} style={{ padding:'6px 10px', borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', textDecoration:'none', fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center' }}>📞</a>}
                  {c.phone && <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" style={{ padding:'6px 10px', borderRadius:8, background:'#25D366', color:'#fff', textDecoration:'none', fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center' }}>💬</a>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GROUPS TAB */}
      {!loading && tab === 'groups' && (
        <div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search groups..." style={{ ...INP, marginBottom:10 }} />
          <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            {['all','local','district','state'].map(s => (
              <button key={s} onClick={() => setScope(s)} style={{ padding:'4px 10px', borderRadius:12, border:'none', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', background: scopeFilter === s ? '#22c55e' : 'var(--bg-card)', color: scopeFilter === s ? '#fff' : 'var(--text-muted)' }}>
                {s === 'all' ? '🌐 All' : s === 'local' ? '📍 Local' : s === 'district' ? '🏛️ District' : '🗺️ State'}
              </button>
            ))}
            {crops.length > 0 && ['all', ...crops].map(c => (
              <button key={c} onClick={() => setCrop(c)} style={{ padding:'4px 10px', borderRadius:12, border:'none', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', background: cropFilter === c ? '#f59e0b' : 'var(--bg-card)', color: cropFilter === c ? '#fff' : 'var(--text-muted)' }}>
                {c === 'all' ? '🌾 All Crops' : c}
              </button>
            ))}
          </div>
          {filtered.length === 0 ? (
            <EmptyState icon="🏘️" title="No groups yet" sub="Create a group to connect with farmers in your area!" />
          ) : (
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:12 }}>
            {filtered.map(g => (
              <div key={g.id} className="card" style={{ padding:16, borderLeft:`3px solid ${g.isPublic ? '#22c55e' : '#f59e0b'}` }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ width:44, height:44, borderRadius:12, background:'rgba(34,197,94,0.1)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem' }}>{g.img}</div>
                    <div>
                      <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{g.name}</div>
                      <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📍 {g.loc} • {g.isPublic ? '🌐 Public' : '🔒 Private'}</div>
                    </div>
                  </div>
                </div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:8 }}>{g.desc}</div>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <div style={{ display:'flex', gap:8, fontSize:'0.72rem', color:'var(--text-muted)' }}>
                    <span>👥 {g.members}</span><span>🌾 {g.crop}</span>
                  </div>
                  <button onClick={() => setJoined(prev => { const n = new Set(prev); n.has(g.id) ? n.delete(g.id) : n.add(g.id); return n; })}
                    style={{ padding:'5px 14px', borderRadius:8, border:'none', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', background: joined.has(g.id) ? 'rgba(239,68,68,0.1)' : 'linear-gradient(135deg,#22c55e,#16a34a)', color: joined.has(g.id) ? '#ef4444' : '#fff' }}>
                    {joined.has(g.id) ? '✕ Leave' : g.isPublic ? '➕ Join' : '🔐 Request'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setSelectedPerson(null)}>
          <div className="card" style={{ width:420, maxWidth:'92vw', padding:0, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            {(() => { const p = selectedPerson, rc = ROLE_CFG[p.role] || ROLE_CFG.farmer; return (<>
              <div style={{ background:`linear-gradient(135deg,${rc.bg},rgba(0,0,0,0.2))`, padding:'24px 20px', textAlign:'center', borderBottom:`2px solid ${rc.color}` }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:rc.bg, border:`3px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 10px' }}>{rc.icon}</div>
                <div style={{ fontWeight:800, fontSize:'1.1rem' }}>{p.name}</div>
                <span style={{ fontSize:'0.72rem', padding:'3px 12px', borderRadius:10, background:rc.bg, color:rc.color, fontWeight:700 }}>{rc.label}</span>
              </div>
              <div style={{ padding:'16px 20px' }}>
                <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:14, padding:10, background:'var(--bg-primary)', borderRadius:8 }}>{p.bio}</div>
                {[['📍 Location',`${p.village||''} ${p.loc}`],['📋 Details',p.detail],['⭐ Rating',`${p.rating} / 5.0`],['📞 Phone',p.phone||'Not shared']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                    <span style={{ color:'var(--text-muted)' }}>{l}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:16 }}>
                  {p.phone && <a href={`tel:${p.phone}`} style={{ flex:1, padding:10, borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', textDecoration:'none', textAlign:'center', fontWeight:700, fontSize:'0.82rem' }}>📞 Call</a>}
                  {p.phone && <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noreferrer" style={{ flex:1, padding:10, borderRadius:8, background:'#25D366', color:'#fff', textDecoration:'none', textAlign:'center', fontWeight:700, fontSize:'0.82rem' }}>💬 WhatsApp</a>}
                  <button onClick={() => setSelectedPerson(null)} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>Close</button>
                </div>
              </div>
            </>); })()}
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      {showCreate && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setShowCreate(false)}>
          <div className="card" style={{ width:440, padding:24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:14 }}>➕ Create a Group</div>
            <input value={newGroup.name} onChange={e => setNewGroup(p => ({...p, name:e.target.value}))} placeholder="Group name..." style={{ ...INP, marginBottom:10 }} />
            <textarea value={newGroup.desc} onChange={e => setNewGroup(p => ({...p, desc:e.target.value}))} placeholder="Describe your group..." style={{ ...INP, height:80, resize:'none', marginBottom:10 }} />
            <input value={newGroup.crop} onChange={e => setNewGroup(p => ({...p, crop:e.target.value}))} placeholder="Crop type..." style={{ ...INP, marginBottom:10 }} />
            <div style={{ display:'flex', gap:8, marginBottom:10 }}>
              {['district','state','local'].map(s => (
                <button key={s} onClick={() => setNewGroup(p => ({...p, scope:s}))} style={{ flex:1, padding:8, borderRadius:8, border:'none', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', background: newGroup.scope === s ? '#22c55e' : 'var(--bg-primary)', color: newGroup.scope === s ? '#fff' : 'var(--text-muted)', textTransform:'capitalize' }}>{s}</button>
              ))}
            </div>
            <div style={{ display:'flex', gap:8, marginBottom:14 }}>
              <button onClick={() => setNewGroup(p => ({...p, isPublic:true}))} style={{ flex:1, padding:8, borderRadius:8, border:'none', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', background: newGroup.isPublic ? '#3b82f6' : 'var(--bg-primary)', color: newGroup.isPublic ? '#fff' : 'var(--text-muted)' }}>🌐 Public</button>
              <button onClick={() => setNewGroup(p => ({...p, isPublic:false}))} style={{ flex:1, padding:8, borderRadius:8, border:'none', fontSize:'0.78rem', fontWeight:600, cursor:'pointer', background: !newGroup.isPublic ? '#f59e0b' : 'var(--bg-primary)', color: !newGroup.isPublic ? '#fff' : 'var(--text-muted)' }}>🔒 Private</button>
            </div>
            <div style={{ display:'flex', gap:8 }}>
              <button disabled={!newGroup.name.trim()} onClick={async () => {
                try {
                  await supabase.from('community_groups').insert({ name:newGroup.name, description:newGroup.desc, crop:newGroup.crop, is_public:newGroup.isPublic, scope:newGroup.scope, created_by:uid });
                } catch {}
                setGroups(prev => [...prev, { id: Date.now(), name:newGroup.name, desc:newGroup.desc, crop:newGroup.crop||'All', isPublic:newGroup.isPublic, scope:newGroup.scope, loc:'AP', members:1, img:'🌾', active:true, type:'crop' }]);
                setShowCreate(false); setNewGroup({ name:'', desc:'', crop:'', isPublic:true, scope:'district' });
              }} style={{ flex:1, padding:10, borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, cursor:'pointer', opacity: newGroup.name.trim() ? 1 : 0.5 }}>✅ Create</button>
              <button onClick={() => setShowCreate(false)} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
