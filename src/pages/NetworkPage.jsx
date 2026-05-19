import React, { useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

const GROUPS = [
  { id:1, name:'Guntur Paddy Farmers', type:'crop', scope:'district', loc:'Guntur', members:342, crop:'Paddy', isPublic:true, img:'🌾', active:true, desc:'Share paddy growing tips, market prices & irrigation schedules' },
  { id:2, name:'AP Cotton Growers', type:'crop', scope:'state', loc:'AP', members:1250, crop:'Cotton', isPublic:true, img:'🌿', active:true, desc:'Cotton farming community for all AP districts' },
  { id:3, name:'Anantapur Groundnut Circle', type:'crop', scope:'district', loc:'Anantapur', members:186, crop:'Groundnut', isPublic:true, img:'🥜', active:true, desc:'Groundnut varieties, soil tips & market connections' },
  { id:4, name:'Vijayawada Market Traders', type:'market', scope:'local', loc:'Vijayawada', members:89, crop:'All', isPublic:true, img:'🏪', active:true, desc:'Buy/sell crops at best prices in Krishna district' },
  { id:5, name:'Chittoor Mango Association', type:'crop', scope:'district', loc:'Chittoor', members:420, crop:'Mango', isPublic:false, img:'🥭', active:true, desc:'Private group for verified mango growers — ask to join' },
  { id:6, name:'Organic Farmers AP', type:'method', scope:'state', loc:'AP', members:678, crop:'Organic', isPublic:true, img:'🌱', active:true, desc:'Natural farming, zero-budget practices & organic certification' },
  { id:7, name:'Kurnool Sunflower Farmers', type:'crop', scope:'district', loc:'Kurnool', members:95, crop:'Sunflower', isPublic:true, img:'🌻', active:false, desc:'Sunflower cultivation techniques & market info' },
  { id:8, name:'Rajahmundry Sugarcane', type:'crop', scope:'district', loc:'East Godavari', members:230, crop:'Sugarcane', isPublic:true, img:'🎋', active:true, desc:'Sugarcane growers of East Godavari district' },
];

const ALL_PEOPLE = [
  { name:'Ramesh Naidu', role:'farmer', loc:'Guntur', detail:'Paddy, Cotton · 8 acres', phone:'9876501111', rating:4.8, village:'Narasaraopet', bio:'Progressive farmer with 15 yrs experience in paddy cultivation. Uses drip irrigation and organic methods.' },
  { name:'Lakshmi Devi', role:'farmer', loc:'Chittoor', detail:'Mango, Tomato · 5 acres', phone:'9876521111', rating:4.7, village:'Madanapalle', bio:'Specializes in Banganapalli mango orchards and polyhouse tomato farming.' },
  { name:'Krishna Prasad', role:'farmer', loc:'Krishna', detail:'Sugarcane, Banana · 12 acres', phone:'9876511111', rating:4.9, village:'Vijayawada', bio:'Large-scale sugarcane farmer, FPO head for Krishna district.' },
  { name:'Srinivas Reddy', role:'broker', loc:'Guntur', detail:'Guntur APMC · All crops', phone:'9876503333', rating:4.5, village:'Guntur', bio:'Licensed APMC broker, 10+ years connecting farmers to wholesale buyers.' },
  { name:'Raju Traders', role:'broker', loc:'Krishna', detail:'Vijayawada Mandi · Grains', phone:'9876513333', rating:4.6, village:'Vijayawada', bio:'Top-rated grain broker at Vijayawada wholesale market.' },
  { name:'Suresh Goud', role:'labour', loc:'Krishna', detail:'Harvesting, Planting · 8 yrs', phone:'9876512222', rating:4.3, village:'Machilipatnam', bio:'Experienced farm worker. Available for seasonal harvesting across Krishna district.' },
  { name:'Anil Kumar', role:'labour', loc:'Chittoor', detail:'Mango Picking, Spraying', phone:'9876522222', rating:4.5, village:'Tirupati', bio:'Specialized in mango harvesting. Team of 12 workers available.' },
  { name:'AP Agri Suppliers', role:'supplier', loc:'Guntur', detail:'Seeds, Fertilizers, Equipment', phone:'9876504444', rating:4.7, village:'Guntur', bio:'Authorized dealer for major seed brands. Bulk discounts available for FPO members.' },
  { name:'Krishna Seeds Center', role:'supplier', loc:'Krishna', detail:'Pesticides, Micro-nutrients', phone:'9876514444', rating:4.8, village:'Vijayawada', bio:'Complete farm input store. Free delivery above ₹5000.' },
  { name:'Sri Lakshmi Rice Mill', role:'industry', loc:'Guntur', detail:'Rice Processing · 50 TPD', phone:'9876505555', rating:4.4, village:'Mangalagiri', bio:'Modern rice milling unit. Direct procurement from farmers at competitive rates.' },
  { name:'Andhra Sugar Factory', role:'industry', loc:'Krishna', detail:'Sugar Manufacturing', phone:'9876515555', rating:4.7, village:'Tanuku', bio:'One of the largest sugar manufacturers in AP. Seasonal cane procurement.' },
];

const ROLE_CFG = {
  farmer:{ icon:'👨‍🌾', color:'#22c55e', bg:'rgba(34,197,94,0.1)', label:'Farmer' },
  broker:{ icon:'🤝', color:'#8b5cf6', bg:'rgba(139,92,246,0.1)', label:'Broker' },
  supplier:{ icon:'🏪', color:'#3b82f6', bg:'rgba(59,130,246,0.1)', label:'Supplier' },
  labour:{ icon:'👷', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', label:'Labour' },
  industry:{ icon:'🏭', color:'#ec4899', bg:'rgba(236,72,153,0.1)', label:'Industry' },
};

export default function NetworkPage() {
  const { t, tx } = useLanguage();
  const [tab, setTab] = useState('connections');
  const [scopeFilter, setScope] = useState('all');
  const [cropFilter, setCrop] = useState('all');
  const [showCreate, setShowCreate] = useState(false);
  const [newGroup, setNewGroup] = useState({ name:'', desc:'', crop:'', isPublic:true, scope:'district' });
  const [search, setSearch] = useState('');
  const [joined, setJoined] = useState(new Set([1, 3, 6]));
  const [roleFilter, setRoleFilter] = useState('all');
  const [connected, setConnected] = useState(new Set([0,3,5]));
  const [selectedPerson, setSelectedPerson] = useState(null);

  const filtered = GROUPS.filter(g => {
    if (search && !g.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (scopeFilter !== 'all' && g.scope !== scopeFilter) return false;
    if (cropFilter !== 'all' && g.crop !== cropFilter) return false;
    return true;
  });
  const crops = [...new Set(GROUPS.map(g => g.crop))];
  const [locFilter, setLocFilter] = useState('all');
  const AP_LOCS = ['all',...new Set(ALL_PEOPLE.map(p=>p.loc))];

  const filteredPeople = ALL_PEOPLE.filter(p => {
    if (roleFilter !== 'all' && p.role !== roleFilter) return false;
    if (locFilter !== 'all' && p.loc !== locFilter) return false;
    if (search && !p.name.toLowerCase().includes(search.toLowerCase()) && !p.loc.toLowerCase().includes(search.toLowerCase()) && !p.detail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });
  const INP = { width:'100%', padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', boxSizing:'border-box' };

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
        {Object.entries(ROLE_CFG).map(([k,v]) => {
          const cnt = ALL_PEOPLE.filter(p=>p.role===k).length;
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

      {/* CONNECTIONS TAB */}
      {tab === 'connections' && (
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
            {filteredPeople.map((p,i) => {
              const rc = ROLE_CFG[p.role];
              const isConn = connected.has(i);
              return (
                <div key={i} className="card" style={{ padding:16, borderLeft:`3px solid ${rc.color}`, cursor:'pointer', transition:'transform 0.2s' }}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.transform=''}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:44, height:44, borderRadius:'50%', background:rc.bg, border:`2px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>{rc.icon}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{p.name}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📍 {p.loc} · {p.village}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:'0.65rem', padding:'3px 10px', borderRadius:10, background:rc.bg, color:rc.color, fontWeight:700 }}>{rc.label}</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', margin:'8px 0 4px 0' }}>{p.detail}</div>
                  <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginBottom:10 }}>⭐ {p.rating} rating</div>
                  <div style={{ display:'flex', gap:6 }}>
                    <button onClick={(e)=>{e.stopPropagation(); setSelectedPerson(p)}} style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', fontSize:'0.75rem', fontWeight:600, cursor:'pointer' }}>👁️ View Details</button>
                    <button onClick={(e)=>{e.stopPropagation(); setConnected(prev=>{const n=new Set(prev); n.has(i)?n.delete(i):n.add(i); return n;})}} style={{ flex:1, padding:'7px', borderRadius:8, border:'none', fontSize:'0.75rem', fontWeight:700, cursor:'pointer', background: isConn ? 'rgba(239,68,68,0.1)' : `linear-gradient(135deg,${rc.color},${rc.color}dd)`, color: isConn ? '#ef4444' : '#fff' }}>
                      {isConn ? '✕ Disconnect' : '➕ Connect'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* MY NETWORK */}
      {tab === 'my' && (
        <div>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:10 }}>⭐ My Connections ({connected.size})</div>
          {connected.size === 0 && <div className="card" style={{ padding:40, textAlign:'center', color:'var(--text-muted)' }}>No connections yet. Go to "All Connections" tab to connect!</div>}
          {[...connected].map(i => {
            const c = ALL_PEOPLE[i]; if(!c) return null;
            const rc = ROLE_CFG[c.role];
            return (
              <div key={i} className="card" style={{ padding:14, marginBottom:8, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <div style={{ width:38, height:38, borderRadius:'50%', background:rc.bg, border:`2px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{rc.icon}</div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.85rem' }}>{c.name} <span style={{ fontSize:'0.65rem', padding:'2px 8px', borderRadius:8, background:rc.bg, color:rc.color, fontWeight:600, marginLeft:4 }}>{rc.label}</span></div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>📍 {c.loc} · {c.detail}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:6 }}>
                  <button onClick={() => setSelectedPerson(c)} style={{ padding:'6px 10px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', fontSize:'0.75rem', cursor:'pointer' }}>👁️</button>
                  <a href={`tel:${c.phone}`} style={{ padding:'6px 10px', borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', textDecoration:'none', fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center' }}>📞</a>
                  <a href={`https://wa.me/91${c.phone}`} target="_blank" rel="noreferrer" style={{ padding:'6px 10px', borderRadius:8, background:'#25D366', color:'#fff', textDecoration:'none', fontSize:'0.75rem', fontWeight:700, display:'flex', alignItems:'center' }}>💬</a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* GROUPS TAB */}
      {tab === 'groups' && (
        <div>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search groups..." style={{ ...INP, marginBottom:10 }} />
          <div style={{ display:'flex', gap:6, marginBottom:8, flexWrap:'wrap' }}>
            {['all','local','district','state'].map(s => (
              <button key={s} onClick={() => setScope(s)} style={{ padding:'4px 10px', borderRadius:12, border:'none', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', background: scopeFilter === s ? '#22c55e' : 'var(--bg-card)', color: scopeFilter === s ? '#fff' : 'var(--text-muted)' }}>
                {s === 'all' ? '🌐 All' : s === 'local' ? '📍 Local' : s === 'district' ? '🏛️ District' : '🗺️ State'}
              </button>
            ))}
            {['all', ...crops].map(c => (
              <button key={c} onClick={() => setCrop(c)} style={{ padding:'4px 10px', borderRadius:12, border:'none', fontSize:'0.72rem', fontWeight:600, cursor:'pointer', background: cropFilter === c ? '#f59e0b' : 'var(--bg-card)', color: cropFilter === c ? '#fff' : 'var(--text-muted)' }}>
                {c === 'all' ? '🌾 All Crops' : c}
              </button>
            ))}
          </div>
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
        </div>
      )}

      {/* Person Detail Modal */}
      {selectedPerson && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setSelectedPerson(null)}>
          <div className="card" style={{ width:420, maxWidth:'92vw', padding:0, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            {(() => { const p = selectedPerson, rc = ROLE_CFG[p.role]; return (<>
              <div style={{ background:`linear-gradient(135deg,${rc.bg},rgba(0,0,0,0.2))`, padding:'24px 20px', textAlign:'center', borderBottom:`2px solid ${rc.color}` }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:rc.bg, border:`3px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', margin:'0 auto 10px' }}>{rc.icon}</div>
                <div style={{ fontWeight:800, fontSize:'1.1rem' }}>{p.name}</div>
                <span style={{ fontSize:'0.72rem', padding:'3px 12px', borderRadius:10, background:rc.bg, color:rc.color, fontWeight:700 }}>{rc.label}</span>
              </div>
              <div style={{ padding:'16px 20px' }}>
                <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6, marginBottom:14, padding:10, background:'var(--bg-primary)', borderRadius:8 }}>{p.bio}</div>
                {[['📍 Location',`${p.village}, ${p.loc}`],['📋 Details',p.detail],['⭐ Rating',`${p.rating} / 5.0`],['📞 Phone',p.phone]].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                    <span style={{ color:'var(--text-muted)' }}>{l}</span>
                    <span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:16 }}>
                  <a href={`tel:${p.phone}`} style={{ flex:1, padding:10, borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', textDecoration:'none', textAlign:'center', fontWeight:700, fontSize:'0.82rem' }}>📞 Call</a>
                  <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noreferrer" style={{ flex:1, padding:10, borderRadius:8, background:'#25D366', color:'#fff', textDecoration:'none', textAlign:'center', fontWeight:700, fontSize:'0.82rem' }}>💬 WhatsApp</a>
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
              <button disabled={!newGroup.name.trim()} onClick={() => { alert('✅ Group created!'); setShowCreate(false); }} style={{ flex:1, padding:10, borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, cursor:'pointer', opacity: newGroup.name.trim() ? 1 : 0.5 }}>✅ Create</button>
              <button onClick={() => setShowCreate(false)} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
