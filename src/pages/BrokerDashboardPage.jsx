import React,{useState}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer}from 'recharts';
const G={glass:{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}};
const TABS=[{id:'deals',icon:'🤝',label:'Active Deals'},{id:'prices',icon:'💰',label:'Price Board'},{id:'network',icon:'🌐',label:'Network'},{id:'transport',icon:'🚛',label:'Transport'},{id:'analytics',icon:'📊',label:'Analytics'},{id:'profile',icon:'👤',label:'Profile'}];
const DEALS=[{id:'D-201',farmer:'Ramaiah Naidu',buyer:'Deccan Foods Ltd',crop:'Cotton',qty:'80 Q',rate:7200,status:'Negotiating',margin:320,date:'Apr 23'},{id:'D-202',farmer:'Lakshmi Devi',buyer:'AP Rice Mills',crop:'Paddy',qty:'150 Q',rate:2350,status:'Confirmed',margin:180,date:'Apr 22'},{id:'D-203',farmer:'Venkatesh R',buyer:'Guntur Traders',crop:'Chilli',qty:'30 Q',rate:18500,status:'Pending',margin:950,date:'Apr 21'},{id:'D-204',farmer:'Suresh Kumar',buyer:'ITC Ltd',crop:'Tobacco',qty:'200 Q',rate:4800,status:'Confirmed',margin:240,date:'Apr 20'}];
const PRICES=[{crop:'Cotton',mandi:'Guntur APMC',price:7150,change:200,trend:'up'},{crop:'Paddy',mandi:'Vijayawada',price:2280,change:-30,trend:'down'},{crop:'Chilli',mandi:'Guntur',price:18200,change:500,trend:'up'},{crop:'Maize',mandi:'Nizamabad',price:1980,change:40,trend:'up'},{crop:'Groundnut',mandi:'Anantapur',price:5600,change:-80,trend:'down'}];
const CHART=[{m:'Oct',v:3.2},{m:'Nov',v:4.1},{m:'Dec',v:3.8},{m:'Jan',v:5.2},{m:'Feb',v:4.7},{m:'Mar',v:6.1}];
const STATUS_STYLE={Negotiating:{bg:'rgba(251,191,36,0.15)',color:'#fbbf24'},Confirmed:{bg:'rgba(34,197,94,0.15)',color:'#4ade80'},Pending:{bg:'rgba(59,130,246,0.15)',color:'#60a5fa'}};

export default function BrokerDashboardPage(){
  const{farmerProfile}=useAuth();
  const[tab,setTab]=useState('deals');
  const[search,setSearch]=useState('');
  const inp={width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'};

  return(
    <div style={{fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#1a1200 0%,#0f172a 50%,#120d00 100%)',borderRadius:20,padding:'28px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(245,158,11,0.3),transparent)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#f59e0b,#d97706)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',boxShadow:'0 8px 24px rgba(245,158,11,0.4)'}}>🤝</div>
              <div>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#fff'}}>Broker Portal</div>
                <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.5)'}}>Welcome, {farmerProfile?.name||'Broker'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {[{l:'Active Deals',v:'4',c:'#fbbf24'},{l:'Commission',v:'₹84K',c:'#4ade80'},{l:'Farmers',v:'23',c:'#60a5fa'},{l:'Buyers',v:'11',c:'#a78bfa'}].map(m=>(
                <div key={m.l} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,boxShadow:'0 4px 15px rgba(245,158,11,0.4)'}}>➕ New Deal</button>
            <button style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem'}}>📥 Export</button>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.06)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 6px',borderRadius:9,border:'none',cursor:'pointer',fontSize:'0.76rem',fontWeight:600,transition:'all 0.25s',background:tab===t.id?'linear-gradient(135deg,#f59e0b,#d97706)':'transparent',color:tab===t.id?'#fff':'rgba(255,255,255,0.45)',boxShadow:tab===t.id?'0 4px 12px rgba(245,158,11,0.3)':'none'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==='deals'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            {[{i:'🤝',v:'4',l:'Total Deals',c:'#fbbf24'},{i:'⏳',v:'1',l:'Pending',c:'#60a5fa'},{i:'✅',v:'2',l:'Confirmed',c:'#4ade80'},{i:'💰',v:'₹84K',l:'Commission',c:'#a78bfa'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12}}>
                <div style={{fontSize:'1.4rem',marginBottom:6}}>{m.i}</div>
                <div style={{fontSize:'1.3rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          {DEALS.map(d=>(
            <div key={d.id} style={{...G.glass,padding:16,borderRadius:12,marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:'rgba(245,158,11,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>🤝</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem'}}>{d.farmer}</span>
                  <span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.3)'}}>→ {d.buyer}</span>
                </div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{d.crop} · {d.qty} · ₹{d.rate.toLocaleString()}/Q · {d.date}</div>
              </div>
              <div style={{textAlign:'right',marginRight:8}}>
                <div style={{fontWeight:700,color:'#fbbf24',marginBottom:4}}>+₹{d.margin}/Q</div>
                <span style={{background:STATUS_STYLE[d.status]?.bg,color:STATUS_STYLE[d.status]?.color,padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>{d.status}</span>
              </div>
              <div style={{display:'flex',gap:6,flexShrink:0}}>
                <button style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:8,padding:'6px 12px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>View</button>
                <button style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 12px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem'}}>📋</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {tab==='prices'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>💰 Live Mandi Price Board</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))',gap:14}}>
            {PRICES.map(p=>(
              <div key={p.crop} style={{...G.glass,padding:18,borderRadius:14,transition:'all 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 24px rgba(0,0,0,0.3)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:10}}>
                  <div style={{fontWeight:700,color:'#f1f5f9'}}>{p.crop}</div>
                  <span style={{background:p.trend==='up'?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.15)',color:p.trend==='up'?'#4ade80':'#ef4444',padding:'3px 8px',borderRadius:20,fontSize:'0.68rem',fontWeight:700}}>{p.trend==='up'?'▲':'▼'} ₹{Math.abs(p.change)}</span>
                </div>
                <div style={{fontSize:'1.6rem',fontWeight:800,color:p.trend==='up'?'#4ade80':'#f1f5f9',marginBottom:4}}>₹{p.price.toLocaleString()}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:12}}>{p.mandi} · per quintal</div>
                <button style={{width:'100%',background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:8,padding:'6px',color:'#fbbf24',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>📊 Set Alert</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='analytics'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {[{i:'💰',v:'₹6.1L',l:'Commission MTD',c:'#fbbf24',g:'rgba(245,158,11,0.1)'},{i:'🤝',v:'47',l:'Deals Closed FY26',c:'#4ade80',g:'rgba(34,197,94,0.1)'},{i:'📈',v:'8.4%',l:'Avg Margin',c:'#60a5fa',g:'rgba(59,130,246,0.1)'}].map(m=>(
              <div key={m.l} style={{background:m.g,border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20}}>
                <div style={{fontSize:'1.8rem',marginBottom:8}}>{m.i}</div>
                <div style={{fontSize:'1.5rem',fontWeight:800,color:m.c,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{...G.glass,padding:20,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📈 Commission Trend (₹ Lakhs)</div>
            <ResponsiveContainer width='100%' height={180}>
              <LineChart data={CHART}>
                <XAxis dataKey='m' tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'#1e2533',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/>
                <Line type='monotone' dataKey='v' stroke='#f59e0b' strokeWidth={2.5} dot={{fill:'#f59e0b',r:4}} activeDot={{r:6}} name='Commission (₹L)'/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab==='network'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>👨‍🌾 My Farmers (23)</div>
            {['Ramaiah Naidu · Guntur · Cotton','Lakshmi Devi · Krishna · Paddy','Venkatesh R · Kurnool · Cotton','Suresh Kumar · Prakasam · Sugarcane','Priya Reddy · Nellore · Chilli'].map(f=>(
              <div key={f} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{width:34,height:34,borderRadius:10,background:'rgba(245,158,11,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>👨‍🌾</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.82rem',fontWeight:600,color:'#f1f5f9'}}>{f.split('·')[0]}</div>
                  <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{f.split('·').slice(1).join('·')}</div>
                </div>
                <button style={{background:'rgba(245,158,11,0.12)',border:'1px solid rgba(245,158,11,0.25)',borderRadius:7,padding:'4px 10px',color:'#fbbf24',cursor:'pointer',fontSize:'0.68rem'}}>Call</button>
              </div>
            ))}
          </div>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>🏭 My Buyers (11)</div>
            {['Deccan Foods Ltd · Processor','AP Rice Mills · Miller','Guntur Traders · Retailer','ITC Ltd · Manufacturer','Cargill India · Exporter'].map(b=>(
              <div key={b} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
                <div style={{width:34,height:34,borderRadius:10,background:'rgba(59,130,246,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>🏭</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.82rem',fontWeight:600,color:'#f1f5f9'}}>{b.split('·')[0]}</div>
                  <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{b.split('·')[1]}</div>
                </div>
                <button style={{background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.25)',borderRadius:7,padding:'4px 10px',color:'#60a5fa',cursor:'pointer',fontSize:'0.68rem'}}>Offer</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='transport'&&(
        <div style={{...G.glass,padding:22,borderRadius:14}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:4}}>🚛 Transport Bookings</div>
          <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Coordinate logistics between farmers and buyers</div>
          {[{route:'Guntur → Hyderabad',vehicle:'10T Tractor',status:'En Route',crop:'Cotton 80Q',eta:'6h'},{route:'Vijayawada → Chennai',vehicle:'20T Truck',status:'Booked',crop:'Paddy 200Q',eta:'Tomorrow'},{route:'Kurnool → Bangalore',vehicle:'5T Mini',status:'Available',crop:'Chilli 30Q',eta:'—'}].map(t=>(
            <div key={t.route} style={{...G.glass,padding:14,borderRadius:12,marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
              <div style={{fontSize:'1.5rem'}}>🚛</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem',marginBottom:3}}>{t.route}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{t.vehicle} · {t.crop}</div>
              </div>
              <div style={{textAlign:'right'}}>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:4}}>ETA: {t.eta}</div>
                <span style={{background:t.status==='En Route'?'rgba(34,197,94,0.12)':t.status==='Booked'?'rgba(251,191,36,0.12)':'rgba(59,130,246,0.12)',color:t.status==='En Route'?'#4ade80':t.status==='Booked'?'#fbbf24':'#60a5fa',padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>{t.status}</span>
              </div>
            </div>
          ))}
          <button style={{marginTop:8,background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,padding:'10px 20px',color:'#fff',cursor:'pointer',fontWeight:600,boxShadow:'0 4px 15px rgba(245,158,11,0.3)'}}>➕ Book Transport</button>
        </div>
      )}

      {tab==='profile'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:16}}>👤 Broker Profile</div>
            {[{l:'Full Name',v:'Rajesh Broker'},{l:'Firm Name',v:'Sri Lakshmi Traders'},{l:'Primary Mandi',v:'Guntur APMC'},{l:'Phone',v:'+91 94400 12345'},{l:'Years Experience',v:'12'},{l:'GSTIN',v:'37AABRL1234H1ZP'}].map(f=>(
              <div key={f.l} style={{marginBottom:12}}>
                <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:5}}>{f.l}</label>
                <input defaultValue={f.v} style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'}}/>
              </div>
            ))}
            <button style={{width:'100%',background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700,boxShadow:'0 4px 15px rgba(245,158,11,0.3)'}}>💾 Save Profile</button>
          </div>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Performance</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[{l:'Rating',v:'⭐ 4.7',c:'#fbbf24'},{l:'Deals FY26',v:'47',c:'#4ade80'},{l:'Commission',v:'₹6.1L',c:'#60a5fa'},{l:'Markets',v:'8',c:'#a78bfa'}].map(s=>(
                <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:'1rem',fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div>
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:8}}>Specialization</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['Cotton','Paddy','Chilli','Maize','Groundnut'].map(c=>(
                  <span key={c} style={{background:'rgba(245,158,11,0.12)',color:'#fbbf24',padding:'3px 10px',borderRadius:20,fontSize:'0.7rem',border:'1px solid rgba(245,158,11,0.25)'}}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
