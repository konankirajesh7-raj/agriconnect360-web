import React,{useState}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer}from 'recharts';
const G={glass:{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}};
const TABS=[{id:'jobs',icon:'💼',label:'Jobs'},{id:'schedule',icon:'📅',label:'Schedule'},{id:'earnings',icon:'💰',label:'Earnings'},{id:'skills',icon:'🎯',label:'Skills'},{id:'welfare',icon:'🏛️',label:'Welfare'},{id:'profile',icon:'👷',label:'Profile'}];
const JOBS=[{id:'J-301',farmer:'Ramaiah Naidu',task:'Paddy Harvesting',location:'Guntur · 5km',date:'Apr 25',days:3,rate:600,status:'Open'},{id:'J-302',farmer:'Lakshmi Devi',task:'Field Ploughing',location:'Krishna · 12km',date:'Apr 26',days:2,rate:700,status:'Open'},{id:'J-303',farmer:'Venkatesh R',task:'Pesticide Spraying',location:'Kurnool · 8km',date:'Apr 24',days:1,rate:550,status:'Applied'},{id:'J-304',farmer:'Suresh Kumar',task:'Sugarcane Cutting',location:'Prakasam · 3km',date:'Apr 27',days:5,rate:650,status:'Confirmed'}];
const CHART=[{m:'Oct',v:18200},{m:'Nov',v:21500},{m:'Dec',v:15600},{m:'Jan',v:22800},{m:'Feb',v:19400},{m:'Mar',v:25100}];
const SCHEMES=[{name:'PM Shram Yogi Maan-Dhan',benefit:'₹3,000/month pension at 60',eligible:true,action:'Enroll'},{name:'BOCW Welfare Fund',benefit:'Insurance + housing + medical',eligible:true,action:'Check Status'},{name:'e-Shram Portal',benefit:'Govt ID card + accident insurance',eligible:false,action:'Register First'},{name:'NREGS (MGNREGA)',benefit:'100 days guaranteed work',eligible:true,action:'Verify'}];

export default function LabourDashboardPage(){
  const{farmerProfile}=useAuth();
  const[tab,setTab]=useState('jobs');
  const inp={width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'};

  return(
    <div style={{fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#1a0000 0%,#0f172a 50%,#120000 100%)',borderRadius:20,padding:'28px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(239,68,68,0.3),transparent)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#ef4444,#dc2626)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',boxShadow:'0 8px 24px rgba(239,68,68,0.4)'}}>👷</div>
              <div>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#fff'}}>Labour Portal</div>
                <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.5)'}}>Welcome, {farmerProfile?.name||'Worker'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {[{l:'Jobs Near You',v:'4',c:'#f87171'},{l:'This Month',v:'₹25.1K',c:'#4ade80'},{l:'Days Worked',v:'18',c:'#fbbf24'},{l:'Rating',v:'⭐4.8',c:'#a78bfa'}].map(m=>(
                <div key={m.l} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={{background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,boxShadow:'0 4px 15px rgba(239,68,68,0.4)'}}>🔍 Find Jobs</button>
            <button style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem'}}>📞 Emergency</button>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.06)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 6px',borderRadius:9,border:'none',cursor:'pointer',fontSize:'0.76rem',fontWeight:600,transition:'all 0.25s',background:tab===t.id?'linear-gradient(135deg,#ef4444,#dc2626)':'transparent',color:tab===t.id?'#fff':'rgba(255,255,255,0.45)',boxShadow:tab===t.id?'0 4px 12px rgba(239,68,68,0.3)':'none'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==='jobs'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            {[{i:'💼',v:'4',l:'Available',c:'#f87171'},{i:'✅',v:'1',l:'Confirmed',c:'#4ade80'},{i:'⏳',v:'1',l:'Applied',c:'#fbbf24'},{i:'⭐',v:'4.8',l:'Rating',c:'#a78bfa'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12}}>
                <div style={{fontSize:'1.4rem',marginBottom:6}}>{m.i}</div>
                <div style={{fontSize:'1.3rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          {JOBS.map(j=>(
            <div key={j.id} style={{...G.glass,padding:16,borderRadius:12,marginBottom:10,display:'flex',alignItems:'center',gap:14,transition:'all 0.3s'}}
              onMouseEnter={e=>e.currentTarget.style.borderColor='rgba(239,68,68,0.3)'}
              onMouseLeave={e=>e.currentTarget.style.borderColor='rgba(255,255,255,0.08)'}>
              <div style={{width:44,height:44,borderRadius:12,background:'rgba(239,68,68,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>💼</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.9rem'}}>{j.task}</span>
                  <code style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.06)',padding:'2px 6px',borderRadius:4}}>{j.id}</code>
                </div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{j.farmer} · 📍{j.location} · {j.date} · {j.days} days</div>
              </div>
              <div style={{textAlign:'right',marginRight:8}}>
                <div style={{fontWeight:800,color:'#4ade80',fontSize:'1rem',marginBottom:4}}>₹{j.rate}/day</div>
                <span style={{background:j.status==='Confirmed'?'rgba(34,197,94,0.12)':j.status==='Applied'?'rgba(251,191,36,0.12)':'rgba(239,68,68,0.12)',color:j.status==='Confirmed'?'#4ade80':j.status==='Applied'?'#fbbf24':'#f87171',padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>{j.status}</span>
              </div>
              {j.status==='Open'&&<button style={{background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:8,padding:'8px 14px',color:'#fff',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,flexShrink:0,boxShadow:'0 4px 12px rgba(239,68,68,0.3)'}}>Apply Now</button>}
            </div>
          ))}
        </div>
      )}

      {tab==='earnings'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {[{i:'💰',v:'₹25.1K',l:'This Month',g:'rgba(34,197,94,0.1)',c:'#4ade80'},{i:'📅',v:'₹2.24L',l:'This Year',g:'rgba(59,130,246,0.1)',c:'#60a5fa'},{i:'🏦',v:'₹18.6K',l:'Balance Due',g:'rgba(251,191,36,0.1)',c:'#fbbf24'}].map(m=>(
              <div key={m.l} style={{background:m.g,border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20}}>
                <div style={{fontSize:'1.8rem',marginBottom:8}}>{m.i}</div>
                <div style={{fontSize:'1.5rem',fontWeight:800,color:m.c,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{...G.glass,padding:20,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Monthly Earnings (₹)</div>
            <ResponsiveContainer width='100%' height={180}>
              <BarChart data={CHART}>
                <XAxis dataKey='m' tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'#1e2533',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}} formatter={(v)=>['₹'+v.toLocaleString(),'Earnings']}/>
                <Bar dataKey='v' fill='#ef4444' radius={[4,4,0,0]} name='Earnings'/>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab==='skills'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>🎯 My Skills</div>
            {[{skill:'Paddy Harvesting',level:90,c:'#4ade80'},{skill:'Pesticide Spraying',level:75,c:'#f59e0b'},{skill:'Ploughing',level:85,c:'#60a5fa'},{skill:'Drip Irrigation',level:60,c:'#a78bfa'},{skill:'Tractor Operation',level:50,c:'#f87171'}].map(s=>(
              <div key={s.skill} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:5}}>
                  <span style={{fontSize:'0.82rem',color:'#f1f5f9',fontWeight:600}}>{s.skill}</span>
                  <span style={{fontSize:'0.72rem',color:s.c,fontWeight:700}}>{s.level}%</span>
                </div>
                <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3}}>
                  <div style={{height:'100%',width:s.level+'%',background:'linear-gradient(90deg,'+s.c+','+s.c+'88)',borderRadius:3,transition:'width 0.8s'}}/>
                </div>
              </div>
            ))}
          </div>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📜 Certifications</div>
            {[{name:'Safe Pesticide Handling',issuer:'ANGRAU',date:'Mar 2025',c:'#4ade80'},{name:'Farm Machinery Operation',issuer:'MANAGE',date:'Jan 2025',c:'#60a5fa'},{name:'Organic Farming Basics',issuer:'APAU',date:'Nov 2024',c:'#a78bfa'}].map(cert=>(
              <div key={cert.name} style={{...G.glass,padding:14,borderRadius:12,marginBottom:10}}>
                <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.85rem',marginBottom:3}}>{cert.name}</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)',marginBottom:6}}>{cert.issuer} · {cert.date}</div>
                <span style={{background:'rgba(34,197,94,0.12)',color:'#4ade80',padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>✓ Verified</span>
              </div>
            ))}
            <button style={{width:'100%',marginTop:8,background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:10,padding:11,color:'#fff',cursor:'pointer',fontWeight:700,boxShadow:'0 4px 15px rgba(239,68,68,0.3)'}}>📚 Enroll New Course</button>
          </div>
        </div>
      )}

      {tab==='welfare'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:4}}>🏛️ Welfare Schemes for Farm Labour</div>
          <div style={{fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Government schemes you may be eligible for</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))',gap:14}}>
            {SCHEMES.map(s=>(
              <div key={s.name} style={{...G.glass,padding:18,borderRadius:14,borderLeft:'3px solid '+(s.eligible?'#4ade80':'#64748b'),transition:'all 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 24px rgba(0,0,0,0.3)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.85rem'}}>{s.name}</span>
                  <span style={{background:s.eligible?'rgba(34,197,94,0.12)':'rgba(100,116,139,0.15)',color:s.eligible?'#4ade80':'#64748b',padding:'2px 8px',borderRadius:20,fontSize:'0.65rem',fontWeight:700}}>{s.eligible?'Eligible':'Not Yet'}</span>
                </div>
                <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',marginBottom:12,lineHeight:1.5}}>{s.benefit}</div>
                <button style={{width:'100%',background:s.eligible?'linear-gradient(135deg,#ef4444,#dc2626)':'rgba(255,255,255,0.06)',border:s.eligible?'none':'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px',color:s.eligible?'#fff':'rgba(255,255,255,0.4)',cursor:'pointer',fontSize:'0.75rem',fontWeight:600,boxShadow:s.eligible?'0 4px 12px rgba(239,68,68,0.25)':'none'}}>{s.action}</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='schedule'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📅 This Week Schedule</div>
          {['Apr 24 · Thu','Apr 25 · Fri','Apr 26 · Sat','Apr 27 · Sun','Apr 28 · Mon'].map((day,i)=>{
            const hasJob=i===0||i===1||i===3;
            const job=JOBS[i]||null;
            return(
              <div key={day} style={{...G.glass,padding:14,borderRadius:12,marginBottom:10,display:'flex',gap:14,alignItems:'center',borderLeft:'3px solid '+(hasJob?'#ef4444':'rgba(255,255,255,0.08)')}}>
                <div style={{width:60,textAlign:'center',flexShrink:0}}>
                  <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{day.split('·')[1]?.trim()}</div>
                  <div style={{fontWeight:800,fontSize:'1.1rem',color:hasJob?'#f87171':'rgba(255,255,255,0.3)'}}>{day.split('·')[0]?.trim().split(' ')[1]}</div>
                </div>
                <div style={{flex:1}}>
                  {hasJob&&job?(
                    <>
                      <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.85rem'}}>{job.task}</div>
                      <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{job.farmer} · {job.location}</div>
                    </>
                  ):(
                    <div style={{color:'rgba(255,255,255,0.25)',fontSize:'0.82rem'}}>No job scheduled</div>
                  )}
                </div>
                {hasJob&&<div style={{fontWeight:700,color:'#4ade80',flexShrink:0}}>₹{JOBS[i]?.rate}/day</div>}
              </div>
            );
          })}
        </div>
      )}

      {tab==='profile'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:16}}>👷 Worker Profile</div>
            {[{l:'Full Name',v:farmerProfile?.name||'Farm Worker'},{l:'Phone',v:'+91 98765 00001'},{l:'District',v:'Guntur'},{l:'Primary Skill',v:'Harvesting'},{l:'Daily Rate',v:'₹600'},{l:'e-Shram ID',v:'UW-AP-123456'}].map(f=>(
              <div key={f.l} style={{marginBottom:12}}>
                <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:5}}>{f.l}</label>
                <input defaultValue={f.v} style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'}}/>
              </div>
            ))}
            <button style={{width:'100%',background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700,boxShadow:'0 4px 15px rgba(239,68,68,0.3)'}}>💾 Save Profile</button>
          </div>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Work Summary</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[{l:'Days Worked',v:'18/30',c:'#f87171'},{l:'Earnings MTD',v:'₹25.1K',c:'#4ade80'},{l:'Jobs Done',v:'7',c:'#60a5fa'},{l:'Rating',v:'⭐4.8',c:'#fbbf24'}].map(s=>(
                <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:'1rem',fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{...G.glass,padding:14,borderRadius:12,marginBottom:10}}>
              <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.5)',marginBottom:6}}>Availability</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['Mon','Tue','Wed','Thu','Fri','Sat'].map((d,i)=>(
                  <div key={d} style={{width:36,height:36,borderRadius:8,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:700,background:i<5?'linear-gradient(135deg,#ef4444,#dc2626)':'rgba(255,255,255,0.06)',color:i<5?'#fff':'rgba(255,255,255,0.3)',cursor:'pointer'}}>{d}</div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
