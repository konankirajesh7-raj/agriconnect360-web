import React, { useState, useEffect } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

const DISTRICTS = ['All Districts','Guntur','Krishna','Anantapur','Chittoor','Kurnool','East Godavari','West Godavari','Nellore','Vizianagaram','Visakhapatnam','Prakasam','Kadapa'];

const BROKERS = [
  { id:1, name:'Venkata Rao Commodities', type:'Broker', owner:'K. Venkata Rao', phone:'9876541001', district:'Guntur', location:'Lakshmipuram, Guntur', rating:4.8, reviews:342, crops:['Paddy','Cotton','Chilli'], commission:'1.5%', since:2010, verified:true, offers:[{ crop:'Cotton', rate:7400, min_qty:10, valid:'2026-05-10' },{ crop:'Paddy', rate:2250, min_qty:20, valid:'2026-05-08' }], desc:'AP\'s most trusted commodity broker. Connects farmers directly to mills & exporters.' },
  { id:2, name:'Sri Sai Agro Industries', type:'Industry', owner:'M. Suresh Babu', phone:'9876541002', district:'Krishna', location:'Vijayawada Industrial Area', rating:4.6, reviews:218, crops:['Sugarcane','Maize'], commission:'Direct Purchase', since:2015, verified:true, offers:[{ crop:'Sugarcane', rate:3600, min_qty:100, valid:'2026-05-15' },{ crop:'Maize', rate:1950, min_qty:50, valid:'2026-05-12' }], desc:'Sugar mill & starch factory. Buy Sugarcane and Maize directly at above-market rates.' },
  { id:3, name:'Raju Cotton Ginning Mill', type:'Industry', owner:'P. Raju Naidu', phone:'9876541003', district:'Guntur', location:'Tenali Road, Guntur', rating:4.4, reviews:189, crops:['Cotton'], commission:'Direct Purchase', since:2008, verified:true, offers:[{ crop:'Cotton', rate:7550, min_qty:5, valid:'2026-05-20' }], desc:'Leading cotton ginning unit. Fastest payment within 24 hours of delivery.' },
  { id:4, name:'AP Chilli Exports Pvt Ltd', type:'Exporter', owner:'S. Krishna Murthy', phone:'9876541004', district:'Guntur', location:'Mirchi Yard, Guntur', rating:4.9, reviews:511, crops:['Chilli'], commission:'2%', since:2005, verified:true, offers:[{ crop:'Chilli', rate:9200, min_qty:10, valid:'2026-05-18' }], desc:'Largest chilli exporter in AP. Export-quality premium prices, direct farm pickup available.' },
  { id:5, name:'Green Harvest Traders', type:'Broker', owner:'T. Narasimha Rao', phone:'9876541005', district:'Kurnool', location:'Main Mandi, Kurnool', rating:4.2, reviews:94, crops:['Groundnut','Sunflower'], commission:'1.2%', since:2017, verified:false, offers:[{ crop:'Groundnut', rate:5800, min_qty:15, valid:'2026-05-09' }], desc:'Connects Kurnool groundnut & sunflower farmers to oil mills across AP and Karnataka.' },
  { id:6, name:'Vizag Sea Port Traders', type:'Exporter', owner:'B. Ramesh Varma', phone:'9876541006', district:'Visakhapatnam', location:'Port Area, Visakhapatnam', rating:4.7, reviews:267, crops:['Maize','Groundnut','Soybean'], commission:'1.8%', since:2012, verified:true, offers:[{ crop:'Maize', rate:2050, min_qty:40, valid:'2026-05-14' }], desc:'Export house with direct shipping connections. Premium prices for export-grade produce.' },
];

const TYPE_COLORS = { Broker:'#3b82f6', Industry:'#8b5cf6', Exporter:'#f59e0b' };
const INP = { width:'100%',padding:'9px 12px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:'0.85rem',boxSizing:'border-box',outline:'none' };

export default function BrokersPage() {
  const { t, tx } = useLanguage();
  const [district, setDistrict] = useState('All Districts');
  const [typeFilter, setTypeFilter] = useState('All');
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState(null);
  const [contact, setContact] = useState(null);
  const [offerMsg, setOfferMsg] = useState('');

  const list = BROKERS.filter(b =>
    (district==='All Districts' || b.district===district) &&
    (typeFilter==='All' || b.type===typeFilter) &&
    (!search || b.name.toLowerCase().includes(search.toLowerCase()) || b.crops.some(c=>c.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="animated" style={{ position:'relative', minHeight:'100vh' }}>
      {/* Animated background — deals/handshakes theme */}
      <div style={{ position:'fixed',inset:0,zIndex:0,pointerEvents:'none',overflow:'hidden' }}>
        <div style={{ position:'absolute',inset:0,background:'radial-gradient(ellipse at 20% 40%, rgba(59,130,246,0.04) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(245,158,11,0.04) 0%, transparent 50%)' }} />
        {['🤝','💼','🏭','📦','🌾','💰'].map((e,i)=>(
          <div key={i} style={{ position:'absolute',left:`${10+i*15}%`,top:`${20+Math.sin(i)*30}%`,fontSize:'1.4rem',opacity:0.06,animation:`bgFloat ${5+i}s ease-in-out ${i*0.8}s infinite` }}>{e}</div>
        ))}
        <style>{`@keyframes bgFloat{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}`}</style>
      </div>

      {/* Header */}
      <div className="section-header" style={{ position:'relative',zIndex:1 }}>
        <div>
          <div className="section-title">🤝 Brokers & Buyers</div>
          <div style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginTop:2 }}>Connect directly with brokers, industries & exporters • Location-based</div>
        </div>
        <div style={{ display:'flex',gap:8,flexWrap:'wrap' }}>
          <select value={district} onChange={e=>setDistrict(e.target.value)} style={{ ...INP,width:'auto',padding:'7px 12px' }}>
            {DISTRICTS.map(d=><option key={d}>{d}</option>)}
          </select>
          {['All','Broker','Industry','Exporter'].map(t=>(
            <button key={t} onClick={()=>setTypeFilter(t)} style={{ padding:'7px 14px',borderRadius:20,border:'1px solid',borderColor:typeFilter===t?TYPE_COLORS[t]||'#22c55e':'var(--border)',background:typeFilter===t?`${TYPE_COLORS[t]||'#22c55e'}15`:'transparent',color:typeFilter===t?TYPE_COLORS[t]||'#22c55e':'var(--text-muted)',fontWeight:600,fontSize:'0.78rem',cursor:'pointer' }}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div style={{ position:'relative',marginBottom:20,zIndex:1 }}>
        <span style={{ position:'absolute',left:14,top:'50%',transform:'translateY(-50%)',color:'var(--text-muted)' }}>🔍</span>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or crop..." style={{ ...INP,paddingLeft:38 }} />
      </div>

      {/* Stats */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:10,marginBottom:20,zIndex:1,position:'relative' }}>
        {[['🤝','Active Buyers',list.length,'#22c55e'],['✅','Verified',list.filter(b=>b.verified).length,'#3b82f6'],['🏭','Industries',list.filter(b=>b.type==='Industry').length,'#8b5cf6'],['📤','Exporters',list.filter(b=>b.type==='Exporter').length,'#f59e0b']].map(([i,l,v,c])=>(
          <div key={l} style={{ background:'var(--bg-card)',border:`1px solid ${c}25`,borderRadius:12,padding:14,textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem',marginBottom:4 }}>{i}</div>
            <div style={{ fontSize:'1.4rem',fontWeight:800,color:c }}>{v}</div>
            <div style={{ fontSize:'0.7rem',color:'var(--text-muted)' }}>{l}</div>
          </div>
        ))}
      </div>

      {/* Broker Cards */}
      <div style={{ display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))',gap:14,position:'relative',zIndex:1 }}>
        {list.map(b=>(
          <div key={b.id} className="card" style={{ padding:0,overflow:'hidden',cursor:'pointer',transition:'all 0.2s',borderTop:`3px solid ${TYPE_COLORS[b.type]||'#22c55e'}` }}
            onMouseEnter={e=>e.currentTarget.style.transform='translateY(-3px)'}
            onMouseLeave={e=>e.currentTarget.style.transform=''}
            onClick={()=>setSelected(selected?.id===b.id?null:b)}>
            <div style={{ padding:'18px 20px' }}>
              {/* Header row */}
              <div style={{ display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:12 }}>
                <div style={{ display:'flex',gap:12,alignItems:'center' }}>
                  <div style={{ width:46,height:46,borderRadius:12,background:`${TYPE_COLORS[b.type]||'#22c55e'}20`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem' }}>
                    {b.type==='Broker'?'🤝':b.type==='Industry'?'🏭':'📤'}
                  </div>
                  <div>
                    <div style={{ fontWeight:800,fontSize:'0.9rem',lineHeight:1.3 }}>{b.name}</div>
                    <div style={{ fontSize:'0.72rem',color:'var(--text-muted)',marginTop:2 }}>👤 {b.owner}</div>
                  </div>
                </div>
                <div style={{ display:'flex',flexDirection:'column',alignItems:'flex-end',gap:4 }}>
                  <span style={{ background:`${TYPE_COLORS[b.type]}20`,color:TYPE_COLORS[b.type],padding:'2px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:700 }}>{b.type}</span>
                  {b.verified && <span style={{ background:'rgba(34,197,94,0.1)',color:'#22c55e',padding:'2px 8px',borderRadius:20,fontSize:'0.65rem',fontWeight:700 }}>✓ Verified</span>}
                </div>
              </div>

              {/* Location & Rating */}
              <div style={{ display:'flex',justifyContent:'space-between',marginBottom:10,fontSize:'0.78rem',color:'var(--text-muted)' }}>
                <span>📍 {b.location}</span>
                <span>⭐ {b.rating} ({b.reviews})</span>
              </div>

              {/* Crops */}
              <div style={{ display:'flex',gap:6,flexWrap:'wrap',marginBottom:10 }}>
                {b.crops.map(c=><span key={c} style={{ padding:'3px 10px',borderRadius:20,background:'rgba(34,197,94,0.08)',color:'#22c55e',fontSize:'0.72rem',fontWeight:600 }}>🌾 {c}</span>)}
              </div>

              {/* Current Offers */}
              <div style={{ background:'var(--bg-primary)',borderRadius:10,padding:'10px 12px',marginBottom:10 }}>
                <div style={{ fontSize:'0.68rem',color:'var(--text-muted)',fontWeight:700,marginBottom:6,textTransform:'uppercase' }}>💰 Current Offers</div>
                {b.offers.map((o,i)=>(
                  <div key={i} style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:4 }}>
                    <span style={{ fontSize:'0.8rem',fontWeight:600 }}>{o.crop}</span>
                    <span style={{ fontSize:'0.85rem',fontWeight:800,color:'#22c55e' }}>₹{o.rate.toLocaleString()}/qtl</span>
                    <span style={{ fontSize:'0.68rem',color:'var(--text-muted)' }}>Min {o.min_qty}Q</span>
                    <span style={{ fontSize:'0.65rem',color:'#f59e0b' }}>till {o.valid}</span>
                  </div>
                ))}
              </div>

              {/* Commission */}
              <div style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:12 }}>Commission: <strong style={{ color:'var(--text-primary)' }}>{b.commission}</strong> • Since {b.since}</div>

              {/* Action Buttons */}
              <div style={{ display:'flex',gap:8 }}>
                <a href={`tel:${b.phone}`} onClick={e=>e.stopPropagation()} style={{ flex:1,padding:'9px',borderRadius:10,background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.3)',color:'#22c55e',fontWeight:700,fontSize:'0.8rem',textAlign:'center',textDecoration:'none',display:'block' }}>📞 Call</a>
                <button onClick={e=>{e.stopPropagation();setContact(b);setOfferMsg(`Hi, I am a farmer from ${b.district}. I want to discuss selling my crops. Please share your best rates.`);}} style={{ flex:2,padding:'9px',borderRadius:10,border:'none',background:`linear-gradient(135deg,${TYPE_COLORS[b.type]},${TYPE_COLORS[b.type]}cc)`,color:'#fff',fontWeight:700,fontSize:'0.8rem',cursor:'pointer' }}>
                  💬 Send Offer Request
                </button>
              </div>
            </div>

            {/* Expanded Detail */}
            {selected?.id===b.id && (
              <div style={{ borderTop:'1px solid var(--border)',padding:'14px 20px',background:'var(--bg-primary)',fontSize:'0.82rem',color:'var(--text-secondary)',lineHeight:1.7 }}>
                <strong>About:</strong> {b.desc}
              </div>
            )}
          </div>
        ))}
        {list.length===0 && <div style={{ textAlign:'center',padding:60,color:'var(--text-muted)',gridColumn:'1/-1' }}><div style={{ fontSize:'2.5rem',marginBottom:10 }}>🤝</div>No brokers found for this filter. Try another district or type.</div>}
      </div>

      {/* Contact / Offer Request Modal */}
      {contact && (
        <div style={{ position:'fixed',inset:0,zIndex:2000,background:'rgba(0,0,0,0.7)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)' }} onClick={()=>setContact(null)}>
          <div className="card" style={{ width:440,padding:26 }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontWeight:800,fontSize:'1rem',marginBottom:6 }}>💬 Offer Request — {contact.name}</div>
            <div style={{ fontSize:'0.75rem',color:'var(--text-muted)',marginBottom:16 }}>📞 {contact.phone} • 📍 {contact.location}</div>
            <div style={{ marginBottom:12 }}>
              <label style={{ display:'block',fontSize:'0.75rem',color:'var(--text-muted)',fontWeight:600,marginBottom:4 }}>YOUR MESSAGE</label>
              <textarea value={offerMsg} onChange={e=>setOfferMsg(e.target.value)} rows={5} style={{ ...INP,resize:'vertical',lineHeight:1.6 }} />
            </div>
            <div style={{ display:'flex',gap:10 }}>
              <a href={`https://wa.me/91${contact.phone}?text=${encodeURIComponent(offerMsg)}`} target="_blank" rel="noreferrer"
                style={{ flex:1,padding:11,borderRadius:10,background:'#25d366',color:'#fff',fontWeight:700,fontSize:'0.85rem',textAlign:'center',textDecoration:'none',display:'block' }}>
                💬 WhatsApp
              </a>
              <a href={`tel:${contact.phone}`}
                style={{ flex:1,padding:11,borderRadius:10,background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.3)',color:'#22c55e',fontWeight:700,fontSize:'0.85rem',textAlign:'center',textDecoration:'none',display:'block' }}>
                📞 Call Now
              </a>
              <button onClick={()=>setContact(null)} style={{ padding:'11px 16px',borderRadius:10,border:'1px solid var(--border)',background:'transparent',color:'var(--text-muted)',cursor:'pointer' }}>✕</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
