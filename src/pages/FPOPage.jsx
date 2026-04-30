import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredFPOMember, setStoredFPOMember } from '../lib/phase11Persistence';

const AP_HIERARCHY = {
  'Guntur': { mandals:['Tenali','Mangalagiri','Ponnur','Repalle','Prathipadu','Narasaraopet'] },
  'Krishna': { mandals:['Vijayawada','Machilipatnam','Gudivada','Nuzvid'] },
  'Kurnool': { mandals:['Kurnool','Adoni','Nandyal','Yemmiganur'] },
  'Anantapur': { mandals:['Anantapur','Dharmavaram','Hindupur','Penukonda'] },
  'Chittoor': { mandals:['Tirupati','Madanapalle','Chittoor','Palamaner'] },
  'Prakasam': { mandals:['Ongole','Markapur','Chirala'] },
  'East Godavari': { mandals:['Kakinada','Rajahmundry','Amalapuram'] },
};

const MEMBERS = [
  { id:1, name:'Rajesh Kumar', village:'Tenali', mandal:'Tenali', district:'Guntur', acres:8, crops:['Paddy','Cotton'], phone:'9876543210', active:true, contribution:52000, role:'Village Head' },
  { id:2, name:'Lakshmi Devi', village:'Mangalagiri', mandal:'Mangalagiri', district:'Guntur', acres:5, crops:['Chilli','Vegetables'], phone:'9876543211', active:true, contribution:38000, role:'Member' },
  { id:3, name:'Venkata Rao', village:'Ponnur', mandal:'Ponnur', district:'Guntur', acres:12, crops:['Paddy','Sugarcane'], phone:'9876543212', active:true, contribution:78000, role:'Mandal Head' },
  { id:4, name:'Suresh Babu', village:'Tenali', mandal:'Tenali', district:'Guntur', acres:6, crops:['Cotton'], phone:'9876543213', active:false, contribution:22000, role:'Member' },
  { id:5, name:'Padma', village:'Repalle', mandal:'Repalle', district:'Guntur', acres:3, crops:['Vegetables','Banana'], phone:'9876543214', active:true, contribution:28000, role:'Village Head' },
  { id:6, name:'Ravi Teja', village:'Prathipadu', mandal:'Prathipadu', district:'Guntur', acres:15, crops:['Paddy','Cotton','Chilli'], phone:'9876543215', active:true, contribution:95000, role:'District Head' },
  { id:7, name:'Krishna Prasad', village:'Vijayawada', mandal:'Vijayawada', district:'Krishna', acres:10, crops:['Sugarcane'], phone:'9876543216', active:true, contribution:65000, role:'District Head' },
  { id:8, name:'Anitha B.', village:'Machilipatnam', mandal:'Machilipatnam', district:'Krishna', acres:4, crops:['Paddy'], phone:'9876543217', active:true, contribution:32000, role:'Village Head' },
  { id:9, name:'Srinivas R.', village:'Adoni', mandal:'Adoni', district:'Kurnool', acres:7, crops:['Cotton','Groundnut'], phone:'9876543218', active:true, contribution:48000, role:'District Head' },
  { id:10, name:'Ramesh G.', village:'Anantapur', mandal:'Anantapur', district:'Anantapur', acres:9, crops:['Groundnut'], phone:'9876543219', active:true, contribution:55000, role:'Mandal Head' },
];

const ROLE_COLORS = { 'District Head':{bg:'rgba(139,92,246,0.1)',color:'#8b5cf6',icon:'👑'}, 'Mandal Head':{bg:'rgba(59,130,246,0.1)',color:'#3b82f6',icon:'🏛️'}, 'Village Head':{bg:'rgba(245,158,11,0.1)',color:'#f59e0b',icon:'⭐'}, 'Member':{bg:'rgba(34,197,94,0.1)',color:'#22c55e',icon:'👨‍🌾'} };

const COLLECTIVE_DEALS = [
  { id:1, crop:'Cotton', qty:'450 Quintals', members:34, bestPrice:'₹7,200/Q', status:'negotiating', mandi:'Guntur APMC' },
  { id:2, crop:'Paddy', qty:'800 Quintals', members:52, bestPrice:'₹2,150/Q', status:'confirmed', mandi:'Tenali APMC' },
  { id:3, crop:'Chilli', qty:'120 Quintals', members:18, bestPrice:'₹15,500/Q', status:'completed', mandi:'Guntur Mirchi Yard' },
];

const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem', boxSizing:'border-box' };

export default function FPOPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('hierarchy');
  const [districtFilter, setDistrictFilter] = useState('All');
  const [mandalFilter, setMandalFilter] = useState('All');
  const [roleFilterFPO, setRoleFilterFPO] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsSending, setSmsSending] = useState(false);
  const [smsSent, setSmsSent] = useState(false);

  const districts = ['All', ...Object.keys(AP_HIERARCHY)];
  const mandals = districtFilter !== 'All' ? ['All', ...(AP_HIERARCHY[districtFilter]?.mandals || [])] : ['All'];

  const filteredMembers = useMemo(() => {
    let list = MEMBERS;
    if (districtFilter !== 'All') list = list.filter(m => m.district === districtFilter);
    if (mandalFilter !== 'All') list = list.filter(m => m.mandal === mandalFilter);
    if (roleFilterFPO !== 'All') list = list.filter(m => m.role === roleFilterFPO);
    if (searchQuery) list = list.filter(m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) || m.village.toLowerCase().includes(searchQuery.toLowerCase()));
    return list;
  }, [districtFilter, mandalFilter, roleFilterFPO, searchQuery]);

  const hierarchyStats = useMemo(() => {
    const dHeads = MEMBERS.filter(m => m.role === 'District Head').length;
    const mHeads = MEMBERS.filter(m => m.role === 'Mandal Head').length;
    const vHeads = MEMBERS.filter(m => m.role === 'Village Head').length;
    return { dHeads, mHeads, vHeads, total: MEMBERS.length };
  }, []);

  const handleBulkSMS = () => { setSmsSending(true); setTimeout(() => { setSmsSending(false); setSmsSent(true); setTimeout(() => setSmsSent(false), 3000); }, 2000); };

  const exportCSV = () => {
    const headers = ['Name','Village','Mandal','District','Role','Acres','Crops','Phone','Active','Contribution'];
    const rows = MEMBERS.map(m => [m.name,m.village,m.mandal,m.district,m.role,m.acres,m.crops.join(';'),m.phone,m.active?'Yes':'No',m.contribution]);
    const csv = [headers,...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type:'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FPO_Members_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openMemberProfile = useCallback((member) => {
    setStoredFPOMember({ ...member, state:'Andhra Pradesh', selectedCrops:member.crops });
    navigate('/profile');
  }, [navigate]);

  const TABS = [
    { id:'hierarchy', label:'🏛️ Hierarchy', icon:'🏛️' },
    { id:'members', label:'👥 Members', icon:'👥' },
    { id:'bargaining', label:'🤝 Bargaining', icon:'🤝' },
    { id:'sms', label:'📱 Bulk SMS', icon:'📱' },
  ];

  return (
    <div className="animated">
      {/* Header */}
      <div style={{ background:'linear-gradient(135deg,rgba(139,92,246,0.08),rgba(34,197,94,0.06))', border:'1px solid rgba(139,92,246,0.15)', borderRadius:16, padding:'20px 24px', marginBottom:20, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:10 }}>
        <div>
          <div style={{ fontWeight:800, fontSize:'1.3rem', display:'flex', alignItems:'center', gap:10 }}>🏢 FPO Mode — Location-Based Network</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>Village → Mandal → District hierarchy · Connect farmer heads across AP</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button onClick={exportCSV} style={{ padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>📥 Export CSV</button>
          <button onClick={() => { clearStoredFPOMember(); navigate('/profile'); }} style={{ padding:'8px 14px', borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.78rem', cursor:'pointer' }}>👤 My Profile</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:16 }}>
        {[
          { label:'District Heads', value:hierarchyStats.dHeads, ...ROLE_COLORS['District Head'] },
          { label:'Mandal Heads', value:hierarchyStats.mHeads, ...ROLE_COLORS['Mandal Head'] },
          { label:'Village Heads', value:hierarchyStats.vHeads, ...ROLE_COLORS['Village Head'] },
          { label:'Total Members', value:hierarchyStats.total, bg:'rgba(34,197,94,0.1)', color:'#22c55e', icon:'👥' },
        ].map(s => (
          <div key={s.label} style={{ background:s.bg, border:`1px solid ${s.bg.replace('0.1','0.25')}`, borderRadius:12, padding:'14px 10px', textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem' }}>{s.icon}</div>
            <div style={{ fontWeight:800, fontSize:'1.4rem', color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'0.68rem', color:'var(--text-muted)', fontWeight:600 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:4, marginBottom:16, background:'var(--bg-primary)', borderRadius:10, padding:4 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex:1, padding:'8px', borderRadius:8, border:'none', fontSize:'0.78rem', fontWeight:tab===t.id?700:500, cursor:'pointer', background:tab===t.id?'var(--bg-card)':'transparent', color:tab===t.id?'#8b5cf6':'var(--text-muted)' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* HIERARCHY TAB */}
      {tab === 'hierarchy' && (
        <div>
          <div style={{ fontWeight:700, fontSize:'0.9rem', marginBottom:12 }}>🏛️ AP District → Mandal → Village Heads</div>
          {Object.entries(AP_HIERARCHY).map(([dist, data]) => {
            const dHead = MEMBERS.find(m => m.district === dist && m.role === 'District Head');
            const distMembers = MEMBERS.filter(m => m.district === dist);
            return (
              <div key={dist} className="card" style={{ padding:16, marginBottom:12, borderLeft:'3px solid #8b5cf6' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'1rem' }}>📍 {dist} District</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{data.mandals.length} Mandals · {distMembers.length} members</div>
                  </div>
                  {dHead && (
                    <div style={{ display:'flex', gap:8, alignItems:'center', padding:'6px 12px', borderRadius:8, background:ROLE_COLORS['District Head'].bg, cursor:'pointer' }} onClick={() => setSelectedMember(dHead)}>
                      <span>👑</span>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.78rem', color:ROLE_COLORS['District Head'].color }}>{dHead.name}</div>
                        <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>District Head</div>
                      </div>
                    </div>
                  )}
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:8 }}>
                  {data.mandals.map(mandal => {
                    const mHead = MEMBERS.find(m => m.mandal === mandal && (m.role === 'Mandal Head' || m.role === 'Village Head'));
                    return (
                      <div key={mandal} style={{ padding:'10px 12px', borderRadius:8, background:'var(--bg-primary)', border:'1px solid var(--border)', cursor: mHead ? 'pointer' : 'default' }} onClick={() => mHead && setSelectedMember(mHead)}>
                        <div style={{ fontWeight:600, fontSize:'0.82rem' }}>🏘️ {mandal}</div>
                        {mHead ? (
                          <div style={{ fontSize:'0.7rem', color:ROLE_COLORS[mHead.role].color, marginTop:4 }}>{ROLE_COLORS[mHead.role].icon} {mHead.name} ({mHead.role})</div>
                        ) : (
                          <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4 }}>No head assigned</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MEMBERS TAB */}
      {tab === 'members' && (
        <div>
          <div style={{ display:'flex', gap:10, marginBottom:12, flexWrap:'wrap' }}>
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Search..." style={{ ...INP, flex:'1 1 160px' }} />
            <select value={districtFilter} onChange={e => { setDistrictFilter(e.target.value); setMandalFilter('All'); }} style={{ ...INP, width:140 }}>
              {districts.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            <select value={mandalFilter} onChange={e => setMandalFilter(e.target.value)} style={{ ...INP, width:140 }}>
              {mandals.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
            <select value={roleFilterFPO} onChange={e => setRoleFilterFPO(e.target.value)} style={{ ...INP, width:140 }}>
              {['All','District Head','Mandal Head','Village Head','Member'].map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:10 }}>{filteredMembers.length} members found</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
            {filteredMembers.map(m => {
              const rc = ROLE_COLORS[m.role];
              return (
                <div key={m.id} className="card" style={{ padding:16, borderLeft:`3px solid ${rc.color}`, cursor:'pointer', transition:'transform 0.2s' }}
                  onClick={() => setSelectedMember(m)}
                  onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-2px)'}} onMouseLeave={e=>{e.currentTarget.style.transform=''}}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:42, height:42, borderRadius:'50%', background:rc.bg, border:`2px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>{rc.icon}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{m.name}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📍 {m.village}, {m.mandal}, {m.district}</div>
                      </div>
                    </div>
                    <span style={{ fontSize:'0.65rem', padding:'3px 10px', borderRadius:10, background:rc.bg, color:rc.color, fontWeight:700 }}>{m.role}</span>
                  </div>
                  <div style={{ display:'flex', gap:12, marginTop:10, fontSize:'0.75rem', color:'var(--text-muted)' }}>
                    <span>🌾 {m.crops.join(', ')}</span><span>📐 {m.acres} acres</span><span>💰 ₹{m.contribution.toLocaleString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* BARGAINING TAB */}
      {tab === 'bargaining' && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:12 }}>
          {COLLECTIVE_DEALS.map(d => (
            <div key={d.id} className="card" style={{ padding:18 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontWeight:800, fontSize:'1rem' }}>{d.crop}</span>
                <span style={{ fontSize:'0.72rem', padding:'3px 10px', borderRadius:10, fontWeight:700, background: d.status==='completed'?'rgba(34,197,94,0.1)':d.status==='confirmed'?'rgba(59,130,246,0.1)':'rgba(245,158,11,0.1)', color: d.status==='completed'?'#22c55e':d.status==='confirmed'?'#3b82f6':'#f59e0b' }}>{d.status}</span>
              </div>
              {[['Quantity',d.qty],['Members',`${d.members} farmers`],['Best Price',d.bestPrice],['Mandi',d.mandi]].map(([l,v]) => (
                <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', fontSize:'0.82rem', borderBottom:'1px solid var(--border)' }}>
                  <span style={{ color:'var(--text-muted)' }}>{l}</span><strong>{v}</strong>
                </div>
              ))}
              {d.status === 'negotiating' && <button style={{ width:'100%', marginTop:12, padding:10, borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, cursor:'pointer' }}>🤝 Join Deal</button>}
            </div>
          ))}
        </div>
      )}

      {/* SMS TAB */}
      {tab === 'sms' && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ fontWeight:700, fontSize:'1rem', marginBottom:14 }}>📱 Bulk SMS to Members</div>
          <select style={{ ...INP, marginBottom:10 }}>
            <option>All Members ({MEMBERS.length})</option>
            <option>District Heads Only</option>
            <option>Mandal Heads Only</option>
            <option>Village Heads Only</option>
          </select>
          <textarea value={smsMessage} onChange={e => setSmsMessage(e.target.value)} rows={4} placeholder="Type your message... (Max 160 characters)" maxLength={160} style={{ ...INP, resize:'vertical', marginBottom:6 }} />
          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textAlign:'right', marginBottom:12 }}>{smsMessage.length}/160</div>
          <button onClick={handleBulkSMS} disabled={!smsMessage||smsSending} style={{ width:'100%', padding:12, borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, cursor:'pointer', opacity:smsMessage?1:0.5 }}>
            {smsSending ? '⏳ Sending...' : smsSent ? '✅ Sent!' : '📤 Send SMS'}
          </button>
        </div>
      )}

      {/* Member Detail Modal */}
      {selectedMember && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setSelectedMember(null)}>
          <div className="card" style={{ width:420, maxWidth:'92vw', padding:0, overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            {(() => { const m = selectedMember, rc = ROLE_COLORS[m.role]; return (<>
              <div style={{ background:`linear-gradient(135deg,${rc.bg},rgba(0,0,0,0.2))`, padding:'24px 20px', textAlign:'center', borderBottom:`2px solid ${rc.color}` }}>
                <div style={{ width:56, height:56, borderRadius:'50%', background:rc.bg, border:`3px solid ${rc.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.8rem', margin:'0 auto 8px' }}>{rc.icon}</div>
                <div style={{ fontWeight:800, fontSize:'1.1rem' }}>{m.name}</div>
                <span style={{ fontSize:'0.72rem', padding:'3px 12px', borderRadius:10, background:rc.bg, color:rc.color, fontWeight:700 }}>{m.role}</span>
              </div>
              <div style={{ padding:'16px 20px' }}>
                {[['📍 Village',m.village],['🏘️ Mandal',m.mandal],['🗺️ District',m.district],['🌾 Crops',m.crops.join(', ')],['📐 Farm Area',`${m.acres} acres`],['💰 Contribution',`₹${m.contribution.toLocaleString()}`],['📞 Phone',m.phone],['Status',m.active?'✅ Active':'⚠️ Inactive']].map(([l,v]) => (
                  <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid var(--border)', fontSize:'0.82rem' }}>
                    <span style={{ color:'var(--text-muted)' }}>{l}</span><span style={{ fontWeight:600 }}>{v}</span>
                  </div>
                ))}
                <div style={{ display:'flex', gap:8, marginTop:16 }}>
                  <a href={`tel:${m.phone}`} style={{ flex:1, padding:10, borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', textDecoration:'none', textAlign:'center', fontWeight:700, fontSize:'0.82rem' }}>📞 Call</a>
                  <a href={`https://wa.me/91${m.phone}`} target="_blank" rel="noreferrer" style={{ flex:1, padding:10, borderRadius:8, background:'#25D366', color:'#fff', textDecoration:'none', textAlign:'center', fontWeight:700, fontSize:'0.82rem' }}>💬 WhatsApp</a>
                  <button onClick={() => openMemberProfile(m)} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>👤 Profile</button>
                </div>
              </div>
            </>); })()}
          </div>
        </div>
      )}
    </div>
  );
}
