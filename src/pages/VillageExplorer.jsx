import React, { useState, useMemo, useEffect } from 'react';
import { getDistrictList, getMandalList, getDistrictStats, searchVillages } from '../lib/data/apVillages';
import { useLanguage } from '../lib/i18n/LanguageContext';

const DISTRICT_COORDS = {
  'Anantapur':[15.6894,77.5996],'Chittoor':[13.2172,79.1003],'East Godavari':[17.3216,82.0895],
  'Guntur':[16.3067,80.4365],'Krishna':[16.6100,80.7214],'Kurnool':[15.8281,78.0373],
  'Prakasam':[15.3484,79.5603],'Nellore':[14.4426,79.9865],'Srikakulam':[18.2949,83.8935],
  'Visakhapatnam':[17.6868,83.2185],'Vizianagaram':[18.1067,83.3956],'West Godavari':[16.9174,81.3399],
  'YSR Kadapa':[14.4674,78.8241],
};
function detectDistrict(lat, lon) {
  let best = '', dist = Infinity;
  for (const [d, [dlat, dlon]] of Object.entries(DISTRICT_COORDS)) {
    const dx = lat - dlat, dy = lon - dlon, dd = dx*dx + dy*dy;
    if (dd < dist) { dist = dd; best = d; }
  }
  return best;
}

const LOCAL_PEOPLE = {
  'Guntur': [
    { name:'Ramesh Naidu', role:'farmer', phone:'9876501111', crops:'Paddy, Cotton', rating:4.8, village:'Narasaraopet' },
    { name:'Venkat Rao', role:'labour', phone:'9876502222', skill:'Harvesting, Spraying', rating:4.6, village:'Tenali' },
    { name:'Srinivas Reddy', role:'broker', phone:'9876503333', market:'Guntur APMC', rating:4.5, village:'Guntur' },
    { name:'AP Agri Suppliers', role:'supplier', phone:'9876504444', products:'Seeds, Fertilizers', rating:4.7, village:'Guntur' },
    { name:'Sri Lakshmi Rice Mill', role:'industry', phone:'9876505555', type:'Rice Processing', rating:4.4, village:'Mangalagiri' },
  ],
  'Krishna': [
    { name:'Krishna Prasad', role:'farmer', phone:'9876511111', crops:'Sugarcane, Banana', rating:4.9, village:'Vijayawada' },
    { name:'Suresh Goud', role:'labour', phone:'9876512222', skill:'Planting, Weeding', rating:4.3, village:'Machilipatnam' },
    { name:'Raju Traders', role:'broker', phone:'9876513333', market:'Vijayawada Mandi', rating:4.6, village:'Vijayawada' },
    { name:'Krishna Seeds Center', role:'supplier', phone:'9876514444', products:'Pesticides, Equipment', rating:4.8, village:'Vijayawada' },
    { name:'Andhra Sugar Factory', role:'industry', phone:'9876515555', type:'Sugar Manufacturing', rating:4.7, village:'Tanuku' },
  ],
  'Chittoor': [
    { name:'Lakshmi Devi', role:'farmer', phone:'9876521111', crops:'Mango, Tomato', rating:4.7, village:'Tirupati' },
    { name:'Anil Kumar', role:'labour', phone:'9876522222', skill:'Mango Picking', rating:4.5, village:'Madanapalle' },
    { name:'Chittoor Fruits Broker', role:'broker', phone:'9876523333', market:'Madanapalle Tomato Market', rating:4.4, village:'Madanapalle' },
  ],
  'Anantapur': [
    { name:'Ramana Reddy', role:'farmer', phone:'9876531111', crops:'Groundnut, Sunflower', rating:4.6, village:'Anantapur' },
    { name:'Gopi Labour', role:'labour', phone:'9876532222', skill:'Ploughing, Sowing', rating:4.4, village:'Dharmavaram' },
  ],
  'Kurnool': [
    { name:'Narsimha Rao', role:'farmer', phone:'9876541111', crops:'Cotton, Jowar', rating:4.5, village:'Nandyal' },
    { name:'Kurnool Agro Traders', role:'broker', phone:'9876543333', market:'Kurnool APMC', rating:4.3, village:'Kurnool' },
  ],
  'Prakasam': [
    { name:'Satyanarayana', role:'farmer', phone:'9876551111', crops:'Tobacco, Chilli', rating:4.7, village:'Ongole' },
  ],
  'East Godavari': [
    { name:'Narasimha M.', role:'farmer', phone:'9876561111', crops:'Sugarcane, Coconut', rating:4.8, village:'Rajahmundry' },
    { name:'EG Rice Mill', role:'industry', phone:'9876565555', type:'Rice Processing', rating:4.6, village:'Amalapuram' },
  ],
};

const ROLE_CONFIG = {
  farmer: { icon:'👨‍🌾', color:'#22c55e', bg:'rgba(34,197,94,0.1)', label:'Farmer' },
  labour: { icon:'👷', color:'#f59e0b', bg:'rgba(245,158,11,0.1)', label:'Labour' },
  broker: { icon:'🤝', color:'#8b5cf6', bg:'rgba(139,92,246,0.1)', label:'Broker' },
  supplier: { icon:'🏪', color:'#3b82f6', bg:'rgba(59,130,246,0.1)', label:'Supplier' },
  industry: { icon:'🏭', color:'#ec4899', bg:'rgba(236,72,153,0.1)', label:'Industry' },
};

export default function VillageExplorer() {
  const { t, t3 } = useLanguage();
  const [searchQ, setSearchQ] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [selectedMandal, setSelectedMandal] = useState('');
  const [selectedVillage, setSelectedVillage] = useState(null);
  const [roleFilter, setRoleFilter] = useState('all');
  const [contactModal, setContactModal] = useState(null);
  const [gpsStatus, setGpsStatus] = useState('');

  // GPS auto-detect district
  useEffect(() => {
    if (navigator.geolocation) {
      setGpsStatus('📡 Detecting location...');
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const d = detectDistrict(pos.coords.latitude, pos.coords.longitude);
          if (d) { setSelectedDistrict(d); setGpsStatus(`📍 ${d} (GPS)`); }
          else setGpsStatus('');
        },
        () => setGpsStatus(''),
        { timeout: 8000 }
      );
    }
  }, []);

  const districts = useMemo(() => getDistrictList(), []);
  const mandals = useMemo(() => selectedDistrict ? getMandalList(selectedDistrict) : [], [selectedDistrict]);
  const districtStats = useMemo(() => getDistrictStats(), []);
  const results = useMemo(() => (!searchQ && !selectedDistrict) ? [] : searchVillages(searchQ, selectedDistrict, selectedMandal), [searchQ, selectedDistrict, selectedMandal]);

  const stats = useMemo(() => {
    const m = districtStats.reduce((s, d) => s + d.mandals, 0);
    const v = districtStats.reduce((s, d) => s + d.villages, 0);
    const p = districtStats.reduce((s, d) => s + d.population, 0);
    return { districts: districtStats.length, mandals: m, villages: v, population: p };
  }, [districtStats]);

  const people = selectedDistrict ? (LOCAL_PEOPLE[selectedDistrict] || LOCAL_PEOPLE['Guntur']) : [];
  const filteredPeople = roleFilter === 'all' ? people : people.filter(p => p.role === roleFilter);

  return (
    <div className="animated" style={{ maxWidth:1400, margin:'0 auto' }}>
      {/* Hero Header */}
      <div style={{ background:'linear-gradient(135deg, #065f46, #0369a1, #7c3aed)', borderRadius:16, padding:'28px 30px', marginBottom:20, position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', top:0, right:0, width:200, height:200, background:'radial-gradient(circle, rgba(255,255,255,0.1), transparent)', borderRadius:'50%' }} />
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:'#fff', margin:0 }}>🏘️ Village Explorer</h1>
        <p style={{ color:'rgba(255,255,255,0.7)', fontSize:'0.82rem', marginTop:4 }}>Discover villages • Connect with local farmers, labours, brokers & industries</p>
        <div style={{ display:'flex', gap:12, marginTop:16, flexWrap:'wrap' }}>
          {[
            { v:stats.districts, l:'Districts', c:'#34d399', i:'🗺️' },
            { v:stats.mandals, l:'Mandals', c:'#60a5fa', i:'🏛️' },
            { v:stats.villages.toLocaleString(), l:'Villages', c:'#fbbf24', i:'🏘️' },
            { v:`${(stats.population/1e7).toFixed(1)}Cr`, l:'Population', c:'#c084fc', i:'👥' },
          ].map(s => (
            <div key={s.l} style={{ background:'rgba(255,255,255,0.12)', borderRadius:10, padding:'10px 18px', textAlign:'center', flex:'1', minWidth:100 }}>
              <div style={{ fontSize:'1.4rem', fontWeight:800, color:s.c }}>{s.v}</div>
              <div style={{ fontSize:'0.68rem', color:'rgba(255,255,255,0.7)' }}>{s.i} {s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:10, marginBottom:16, flexWrap:'wrap' }}>
        <input value={searchQ} onChange={e => setSearchQ(e.target.value)} placeholder="🔍 Search village..."
          style={{ flex:2, minWidth:200, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem' }} />
        <select value={selectedDistrict} onChange={e => { setSelectedDistrict(e.target.value); setSelectedMandal(''); }}
          style={{ flex:1, minWidth:160, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem' }}>
          <option value="">📍 Select District</option>
          {districts.map(d => <option key={d.en} value={d.en}>{d.en}</option>)}
        </select>
        {mandals.length > 0 && (
          <select value={selectedMandal} onChange={e => setSelectedMandal(e.target.value)}
            style={{ flex:1, minWidth:140, padding:'10px 14px', borderRadius:10, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.85rem' }}>
            <option value="">🏛️ All Mandals</option>
            {mandals.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
        )}
        {(searchQ || selectedDistrict) && (
          <button onClick={() => { setSearchQ(''); setSelectedDistrict(''); setSelectedMandal(''); }} style={{ padding:'10px 16px', borderRadius:10, border:'none', background:'rgba(239,68,68,0.15)', color:'#ef4444', cursor:'pointer', fontWeight:600, fontSize:'0.82rem' }}>✕ Clear</button>
        )}
      </div>

      {/* LOCAL PEOPLE — shown when district selected */}
      {selectedDistrict && people.length > 0 && (
        <div style={{ marginBottom:20 }}>
          <div style={{ fontWeight:700, fontSize:'0.95rem', marginBottom:10 }}>👥 People in {selectedDistrict}</div>
          <div style={{ display:'flex', gap:6, marginBottom:12, flexWrap:'wrap' }}>
            {['all','farmer','labour','broker','supplier','industry'].map(r => {
              const rc = ROLE_CONFIG[r];
              return (
                <button key={r} onClick={() => setRoleFilter(r)} style={{ padding:'5px 12px', borderRadius:14, border:'none', cursor:'pointer', fontSize:'0.75rem', fontWeight:600, background: roleFilter === r ? (rc?.color || '#22c55e') : 'var(--bg-card)', color: roleFilter === r ? '#fff' : 'var(--text-muted)' }}>
                  {r === 'all' ? '🌐 All' : `${rc?.icon} ${rc?.label}`}
                </button>
              );
            })}
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
            {filteredPeople.map((p, i) => {
              const rc = ROLE_CONFIG[p.role];
              return (
                <div key={i} className="card" style={{ padding:14, borderLeft:`3px solid ${rc.color}` }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                      <div style={{ width:40, height:40, borderRadius:10, background:rc.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>{rc.icon}</div>
                      <div>
                        <div style={{ fontWeight:700, fontSize:'0.88rem' }}>{p.name}</div>
                        <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>📍 {p.village} • ⭐ {p.rating}</div>
                      </div>
                    </div>
                    <span style={{ padding:'2px 8px', borderRadius:8, fontSize:'0.65rem', fontWeight:700, background:rc.bg, color:rc.color }}>{rc.label}</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:8 }}>
                    {p.crops && `🌾 ${p.crops}`}
                    {p.skill && `🔧 ${p.skill}`}
                    {p.market && `🏪 ${p.market}`}
                    {p.products && `📦 ${p.products}`}
                    {p.type && `🏭 ${p.type}`}
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    <a href={`tel:${p.phone}`} style={{ flex:1, padding:'7px', borderRadius:8, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.78rem', textAlign:'center', textDecoration:'none' }}>📞 Call</a>
                    <a href={`https://wa.me/91${p.phone}`} target="_blank" rel="noreferrer" style={{ padding:'7px 12px', borderRadius:8, background:'#25D366', color:'#fff', fontWeight:700, fontSize:'0.78rem', textDecoration:'none' }}>💬</a>
                    <button onClick={() => setContactModal(p)} style={{ flex:1, padding:'7px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontWeight:600, fontSize:'0.78rem', cursor:'pointer' }}>👁️ Profile</button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* District Grid (default) */}
      {!searchQ && !selectedDistrict && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
          {districtStats.map(d => (
            <div key={d.name} className="card" style={{ padding:18, cursor:'pointer', transition:'transform 0.2s', borderLeft:'3px solid #34d399' }}
              onClick={() => setSelectedDistrict(d.name)}
              onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
              <div style={{ fontWeight:700, fontSize:'1rem' }}>{d.name}</div>
              <div style={{ fontSize:'0.78rem', color:'#34d399' }}>{d.te}</div>
              <div style={{ fontSize:'0.72rem', color:'#fbbf24' }}>{d.hi}</div>
              <div style={{ display:'flex', gap:12, marginTop:8, fontSize:'0.72rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
                <span>🏛️ {d.mandals} Mandals</span>
                <span>🏘️ {d.villages} Villages</span>
                <span>👥 {(d.population/1e5).toFixed(1)}L</span>
                <span>📐 {d.area} km²</span>
              </div>
              <div style={{ marginTop:6, fontSize:'0.72rem', color:'#fbbf24' }}>🏢 HQ: {d.hq}</div>
            </div>
          ))}
        </div>
      )}

      {/* Village Results */}
      {(searchQ || selectedDistrict) && results.length > 0 && (
        <div>
          <div style={{ fontSize:'0.82rem', color:'var(--text-muted)', marginBottom:10 }}>📊 {results.length} villages found</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(280px, 1fr))', gap:12 }}>
            {results.map((v, i) => (
              <div key={`${v.en}-${i}`} className="card" style={{ padding:14, cursor:'pointer' }} onClick={() => setSelectedVillage(v)}>
                <div style={{ fontWeight:700, fontSize:'0.9rem' }}>🏘️ {v.en}</div>
                <div style={{ display:'flex', gap:8, marginTop:6, fontSize:'0.72rem', color:'var(--text-muted)', flexWrap:'wrap' }}>
                  <span>📍 {v.mandal}</span><span>🏛️ {v.district}</span><span>👥 {v.population?.toLocaleString()}</span><span>📮 {v.pincode}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Village Detail Slide-Out */}
      {selectedVillage && (
        <>
          <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:999 }} onClick={() => setSelectedVillage(null)} />
          <div style={{ position:'fixed', top:0, right:0, bottom:0, width:400, maxWidth:'90vw', background:'var(--bg-card)', backdropFilter:'blur(20px)', boxShadow:'-8px 0 40px rgba(0,0,0,0.5)', zIndex:1000, padding:24, overflowY:'auto' }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:16 }}>
              <h2 style={{ margin:0, fontSize:'1.1rem', fontWeight:800 }}>🏘️ Village Details</h2>
              <button onClick={() => setSelectedVillage(null)} style={{ background:'none', border:'none', color:'#ef4444', fontSize:'1.2rem', cursor:'pointer' }}>✕</button>
            </div>
            <div style={{ background:'var(--bg-primary)', borderRadius:10, padding:14, marginBottom:14 }}>
              <div style={{ fontWeight:800, fontSize:'1.1rem' }}>{selectedVillage.en}</div>
            </div>
            {[
              ['📍 Village', selectedVillage.en], ['🏛️ Mandal', selectedVillage.mandal], ['🏢 District', selectedVillage.district],
              ['📮 Pincode', selectedVillage.pincode], ['👥 Population', selectedVillage.population?.toLocaleString()],
              ['📐 Area', `${selectedVillage.area} sq km`], ['🏛️ Gram Panchayat', selectedVillage.gramPanchayat],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'8px 0', borderBottom:'1px solid var(--border)' }}>
                <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{l}</span>
                <span style={{ fontSize:'0.82rem', fontWeight:600 }}>{v || '—'}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Contact Profile Modal */}
      {contactModal && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setContactModal(null)}>
          <div className="card" style={{ width:380, padding:24 }} onClick={e => e.stopPropagation()}>
            {(() => { const rc = ROLE_CONFIG[contactModal.role]; return (
              <>
                <div style={{ textAlign:'center', marginBottom:16 }}>
                  <div style={{ width:60, height:60, borderRadius:14, background:rc.bg, display:'inline-flex', alignItems:'center', justifyContent:'center', fontSize:'2rem', marginBottom:8 }}>{rc.icon}</div>
                  <div style={{ fontWeight:800, fontSize:'1.1rem' }}>{contactModal.name}</div>
                  <span style={{ padding:'3px 10px', borderRadius:8, fontSize:'0.72rem', fontWeight:700, background:rc.bg, color:rc.color }}>{rc.label}</span>
                </div>
                <div style={{ background:'var(--bg-primary)', borderRadius:10, padding:12, marginBottom:12 }}>
                  {[['📍 Location', contactModal.village], ['⭐ Rating', contactModal.rating], ['📞 Phone', contactModal.phone]].map(([l,v]) => (
                    <div key={l} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0' }}>
                      <span style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{l}</span>
                      <span style={{ fontSize:'0.82rem', fontWeight:600 }}>{v}</span>
                    </div>
                  ))}
                  {contactModal.crops && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>🌾 {contactModal.crops}</div>}
                  {contactModal.skill && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>🔧 {contactModal.skill}</div>}
                  {contactModal.market && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>🏪 {contactModal.market}</div>}
                  {contactModal.products && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>📦 {contactModal.products}</div>}
                  {contactModal.type && <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:4 }}>🏭 {contactModal.type}</div>}
                </div>
                <div style={{ display:'flex', gap:8 }}>
                  <a href={`tel:${contactModal.phone}`} style={{ flex:1, padding:10, borderRadius:10, background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, textAlign:'center', textDecoration:'none' }}>📞 Call Now</a>
                  <a href={`https://wa.me/91${contactModal.phone}`} target="_blank" rel="noreferrer" style={{ padding:'10px 16px', borderRadius:10, background:'#25D366', color:'#fff', fontWeight:700, textDecoration:'none' }}>💬 WhatsApp</a>
                </div>
              </>
            ); })()}
          </div>
        </div>
      )}
    </div>
  );
}
