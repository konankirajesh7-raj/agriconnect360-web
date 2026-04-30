import React,{useState,useMemo}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer}from 'recharts';
const G={glass:{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}};
const TABS=[{id:'procurement',icon:'📦',label:'Procurement'},{id:'sourcing',icon:'🔍',label:'Sourcing'},{id:'quality',icon:'🧪',label:'Quality'},{id:'connections',icon:'🤝',label:'Connections'},{id:'payments',icon:'💳',label:'Payments'},{id:'analytics',icon:'📊',label:'Analytics'}];
const TARGETS=[{crop:'Cotton',target:5000,procured:3200,unit:'quintals',rate:6800,color:'#3b82f6'},{crop:'Sugarcane',target:20000,procured:14500,unit:'tonnes',rate:3500,color:'#22c55e'},{crop:'Paddy',target:8000,procured:7100,unit:'quintals',rate:2200,color:'#f59e0b'}];
const FARMERS=[{name:'Ramaiah Naidu',district:'Guntur',crop:'Cotton',area:'5 ac',yield:'12 q/ac',rating:4.5},{name:'Lakshmi Devi',district:'Krishna',crop:'Paddy',area:'8 ac',yield:'22 q/ac',rating:4.8},{name:'Venkatesh R',district:'Kurnool',crop:'Cotton',area:'12 ac',yield:'10 q/ac',rating:4.2},{name:'Suresh Kumar',district:'Prakasam',crop:'Sugarcane',area:'15 ac',yield:'45 t/ac',rating:4.6}];
const INSPECTIONS=[{id:'QI-001',farmer:'Ramaiah Naidu',crop:'Cotton',moisture:8.2,impurity:1.1,grade:'A',status:'Accepted'},{id:'QI-002',farmer:'Venkatesh R',crop:'Cotton',moisture:12.5,impurity:3.4,grade:'C',status:'Rejected'},{id:'QI-003',farmer:'Lakshmi Devi',crop:'Paddy',moisture:14.0,impurity:0.8,grade:'A',status:'Accepted'}];
const PAYMENTS=[{id:'PAY-101',farmer:'Ramaiah Naidu',amount:217600,mode:'UPI',status:'Confirmed',date:'Apr 20'},{id:'PAY-102',farmer:'Lakshmi Devi',amount:156200,mode:'Bank Transfer',status:'Processing',date:'Apr 22'},{id:'PAY-103',farmer:'Suresh Kumar',amount:507500,mode:'UPI',status:'Initiated',date:'Apr 23'}];
const CHART=[{m:'Oct',v:82},{m:'Nov',v:91},{m:'Dec',v:74},{m:'Jan',v:95},{m:'Feb',v:88},{m:'Mar',v:110}];

export default function IndustrialDashboardPage(){
  const{farmerProfile}=useAuth();
  const[tab,setTab]=useState('procurement');
  const[search,setSearch]=useState('');
  const[toast,setToast]=useState('');
  const[showPostReq,setShowPostReq]=useState(false);
  const[reqForm,setReqForm]=useState({crop:'Cotton',qty:'100',quality:'Grade A',budget:'65000',location:'Cotton Mill, Guntur'});
  const[requirements,setRequirements]=useState([{crop:'Sugarcane',qty:'500',quality:'Grade B',budget:'3500',location:'Sugar Factory, Krishna',status:'Active'}]);
  const[showOffer,setShowOffer]=useState(null);
  const[offerForm,setOfferForm]=useState({price:'64000',qty:'2',date:'Next month'});
  const[inspections,setInspections]=useState(INSPECTIONS);
  const[showNewInsp,setShowNewInsp]=useState(false);
  const[inspForm,setInspForm]=useState({batch:'Cotton Batch 001',farmer:'Rajesh Kumar',qty:'2',moisture:'9.5',trash:'2.1',staple:'28'});
  const[inspGrade,setInspGrade]=useState(null);
  function flash(m){setToast(m);setTimeout(()=>setToast(''),2500);}
  function calcGrade(m,t){if(+m<=10&&+t<=2)return 'A';if(+m<=13&&+t<=3)return 'B';return 'C';}
  const inp={width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'};
  const filtered=FARMERS.filter(f=>f.name.toLowerCase().includes(search.toLowerCase()));

  return(
    <div style={{fontFamily:'Inter,sans-serif'}}>
      <div style={{background:'linear-gradient(135deg,#0c1a3e 0%,#0f172a 50%,#0a1628 100%)',borderRadius:20,padding:'28px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-50,right:-50,width:220,height:220,borderRadius:'50%',background:'radial-gradient(circle,rgba(59,130,246,0.3),transparent)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',boxShadow:'0 8px 24px rgba(59,130,246,0.4)'}}>🏭</div>
              <div>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#fff'}}>Industrial Portal</div>
                <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.5)'}}>Welcome, {farmerProfile?.name||'Industrial Buyer'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {[{l:'Investment',v:'₹4.82Cr',c:'#60a5fa'},{l:'Farmers',v:'847',c:'#34d399'},{l:'Acceptance',v:'87%',c:'#f59e0b'},{l:'On-Time',v:'94.3%',c:'#a78bfa'}].map(m=>(
                <div key={m.l} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>{flash(`📤 Bulk offer sent to ${filtered.length} farmers! SMS notifications dispatched`)}} style={{background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,boxShadow:'0 4px 15px rgba(59,130,246,0.4)'}}>📤 Bulk Offer</button>
            <button onClick={()=>{const h='Crop,Target,Procured,Rate,Spent\n';const r=TARGETS.map(t=>t.crop+','+t.target+','+t.procured+','+t.rate+','+(t.procured*t.rate)).join('\n');const b=new Blob([h+r],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='procurement_data.csv';a.click();flash('📥 CSV exported!')}} style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem'}}>📥 Export CSV</button>
          </div>
        </div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.06)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 6px',borderRadius:9,border:'none',cursor:'pointer',fontSize:'0.76rem',fontWeight:600,transition:'all 0.25s',background:tab===t.id?'linear-gradient(135deg,#3b82f6,#1d4ed8)':'transparent',color:tab===t.id?'#fff':'rgba(255,255,255,0.45)',boxShadow:tab===t.id?'0 4px 12px rgba(59,130,246,0.3)':'none'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==='procurement'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:16}}>
            {TARGETS.map(t=>{
              const pct=Math.round(t.procured/t.target*100);
              return(
                <div key={t.crop} style={{...G.glass,padding:20,borderRadius:14}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                    <div style={{fontWeight:700,color:'#f1f5f9'}}>{t.crop}</div>
                    <span style={{background:pct>=80?'rgba(34,197,94,0.15)':pct>=50?'rgba(251,191,36,0.15)':'rgba(239,68,68,0.15)',color:pct>=80?'#4ade80':pct>=50?'#fbbf24':'#ef4444',padding:'2px 8px',borderRadius:20,fontSize:'0.72rem',fontWeight:700}}>{pct}%</span>
                  </div>
                  <div style={{fontSize:'1.8rem',fontWeight:800,color:t.color,marginBottom:4}}>{(t.procured/1000).toFixed(1)}K<span style={{fontSize:'0.85rem',color:'rgba(255,255,255,0.4)',fontWeight:400,marginLeft:4}}>{t.unit}</span></div>
                  <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:10}}>Target: {t.target.toLocaleString('en-IN')} {t.unit}</div>
                  <div style={{height:8,background:'rgba(255,255,255,0.06)',borderRadius:4,marginBottom:8}}>
                    <div style={{height:'100%',width:pct+'%',background:'linear-gradient(90deg,'+t.color+','+t.color+'aa)',borderRadius:4,transition:'width 0.8s'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>₹{t.rate.toLocaleString('en-IN')}/unit</span>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>₹{(t.procured*t.rate/100000).toFixed(1)}L spent</span>
                  </div>
                </div>
              );
            })}
          </div>
          <div style={{...G.glass,padding:20,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📈 Monthly Procurement (Quintals)</div>
            <ResponsiveContainer width='100%' height={160}>
              <BarChart data={CHART}>
                <XAxis dataKey='m' tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/>
                <Bar dataKey='v' fill='#3b82f6' radius={[4,4,0,0]} name='Quintals'/>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <button onClick={()=>setShowPostReq(!showPostReq)} style={{marginTop:16,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',border:'none',borderRadius:10,padding:'10px 20px',color:'#fff',cursor:'pointer',fontWeight:600,boxShadow:'0 4px 15px rgba(59,130,246,0.3)'}}>📋 Post Procurement Requirement</button>
          {showPostReq&&(
            <div style={{...G.glass,padding:20,borderRadius:14,marginTop:12}}>
              <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:12}}>📋 Post Requirement</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                {[{l:'Crop',k:'crop'},{l:'Qty (tonnes)',k:'qty',t:'number'},{l:'Quality',k:'quality'},{l:'Budget (₹/tonne)',k:'budget',t:'number'},{l:'Location',k:'location'}].map(f=>
                  <div key={f.k}><label style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label><input type={f.t||'text'} value={reqForm[f.k]} onChange={e=>setReqForm(p=>({...p,[f.k]:e.target.value}))} style={{...inp}}/></div>
                )}
              </div>
              <button onClick={()=>{setRequirements(p=>[{...reqForm,status:'Active'},...p]);setShowPostReq(false);flash('✅ Requirement posted! Matching farmers notified')}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'8px 18px',color:'#fff',cursor:'pointer',fontWeight:600}}>📤 Post</button>
            </div>
          )}
          {requirements.length>0&&<div style={{...G.glass,padding:16,borderRadius:14,marginTop:12}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:8}}>📋 Active Requirements</div>
            {requirements.map((r,i)=><div key={i} style={{padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:10}}>
              <span style={{background:'rgba(34,197,94,0.15)',color:'#4ade80',padding:'2px 8px',borderRadius:20,fontSize:'0.62rem',fontWeight:600}}>{r.status}</span>
              <span style={{color:'#f1f5f9',fontSize:'0.82rem',fontWeight:600}}>{r.crop}</span>
              <span style={{color:'rgba(255,255,255,0.4)',fontSize:'0.72rem'}}>{r.qty}t · {r.quality} · ₹{(+r.budget).toLocaleString()}/t · {r.location}</span>
            </div>)}
          </div>}
        </div>
      )}

      {tab==='sourcing'&&(
        <div>
          <div style={{display:'flex',gap:10,marginBottom:16}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='🔍 Search farmers...' style={{...inp,flex:1}}/>
            <select style={{...inp,width:'auto'}}><option>All Districts</option><option>Guntur</option><option>Krishna</option><option>Kurnool</option></select>
            <select style={{...inp,width:'auto'}}><option>All Crops</option><option>Cotton</option><option>Paddy</option><option>Sugarcane</option></select>
            <button style={{background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',border:'none',borderRadius:9,padding:'9px 14px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,whiteSpace:'nowrap'}}>📤 Bulk Offer</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
            {filtered.map(f=>(
              <div key={f.name} style={{...G.glass,padding:18,borderRadius:14,transition:'all 0.3s'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-3px)';e.currentTarget.style.boxShadow='0 10px 24px rgba(0,0,0,0.3)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:12}}>
                  <div style={{width:40,height:40,borderRadius:12,background:'linear-gradient(135deg,rgba(59,130,246,0.2),rgba(29,78,216,0.1))',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem'}}>👨‍🌾</div>
                  <div>
                    <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem'}}>{f.name}</div>
                    <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{f.district}</div>
                  </div>
                  <div style={{marginLeft:'auto',background:'rgba(59,130,246,0.12)',color:'#60a5fa',padding:'3px 8px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>⭐ {f.rating}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:12}}>
                  {[{l:'Crop',v:f.crop},{l:'Area',v:f.area},{l:'Yield',v:f.yield}].map(s=>(
                    <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'7px 8px',textAlign:'center'}}>
                      <div style={{fontSize:'0.78rem',fontWeight:700,color:'#e2e8f0'}}>{s.v}</div>
                      <div style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
                    </div>
                  ))}
                </div>
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>setShowOffer(showOffer===f.name?null:f.name)} style={{flex:1,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',border:'none',borderRadius:8,padding:'7px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>📤 Send Purchase Offer</button>
                  <button onClick={()=>window.open('tel:9000000001')} style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'7px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem'}}>📞 Contact</button>
                </div>
                {showOffer===f.name&&(
                  <div style={{marginTop:10,background:'rgba(59,130,246,0.06)',border:'1px solid rgba(59,130,246,0.15)',borderRadius:10,padding:12}}>
                    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginBottom:8}}>
                      {[{l:'Price (₹/t)',k:'price'},{l:'Qty (tonnes)',k:'qty'},{l:'Delivery',k:'date'}].map(x=>
                        <div key={x.k}><label style={{fontSize:'0.6rem',color:'rgba(255,255,255,0.4)',display:'block',marginBottom:3}}>{x.l}</label><input value={offerForm[x.k]} onChange={e=>setOfferForm(p=>({...p,[x.k]:e.target.value}))} style={{...inp,padding:'6px 8px',fontSize:'0.78rem'}}/></div>
                      )}
                    </div>
                    <button onClick={()=>{setShowOffer(null);flash(`✅ Offer sent to ${f.name}! SMS notification sent`)}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'6px 14px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>📤 Send Offer</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='quality'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[{l:'Total Inspections',v:'3',c:'#60a5fa',i:'🧪'},{l:'Accepted',v:'2',c:'#4ade80',i:'✅'},{l:'Rejected',v:'1',c:'#ef4444',i:'❌'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12,display:'flex',alignItems:'center',gap:14}}>
                <div style={{fontSize:'1.8rem'}}>{m.i}</div>
                <div>
                  <div style={{fontSize:'1.4rem',fontWeight:800,color:m.c}}>{m.v}</div>
                  <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
                </div>
              </div>
            ))}
          </div>
          {inspections.map(i=>(
            <div key={i.id} style={{...G.glass,padding:16,borderRadius:12,marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:i.status==='Accepted'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>🧪</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem'}}>{i.farmer}</span>
                  <code style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.06)',padding:'2px 6px',borderRadius:4}}>{i.id}</code>
                </div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{i.crop} · Moisture: {i.moisture}% · Impurity: {i.impurity}%</div>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:8}}>
                <span style={{background:i.grade==='A'?'rgba(34,197,94,0.15)':i.grade==='B'?'rgba(251,191,36,0.15)':'rgba(239,68,68,0.15)',color:i.grade==='A'?'#4ade80':i.grade==='B'?'#fbbf24':'#ef4444',padding:'4px 10px',borderRadius:8,fontSize:'0.78rem',fontWeight:800}}>Grade {i.grade}</span>
                <span style={{background:i.status==='Accepted'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)',color:i.status==='Accepted'?'#4ade80':'#ef4444',padding:'4px 10px',borderRadius:20,fontSize:'0.72rem',fontWeight:600}}>{i.status}</span>
                {i.status==='Accepted'&&<button onClick={()=>{const c=`Quality Certificate\n${'='.repeat(30)}\n${i.id} | ${i.farmer}\nCrop: ${i.crop} | Grade: ${i.grade}\nMoisture: ${i.moisture}% | Impurity: ${i.impurity}%\nStatus: ACCEPTED\nDate: ${new Date().toLocaleDateString()}`;const b=new Blob([c],{type:'application/pdf'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`Certificate_${i.id}.pdf`;a.click()}} style={{background:'rgba(59,130,246,0.12)',border:'1px solid rgba(59,130,246,0.2)',borderRadius:6,padding:'3px 8px',color:'#60a5fa',cursor:'pointer',fontSize:'0.65rem'}}>📄 Cert</button>}
              </div>
            </div>
          ))}
          <button onClick={()=>setShowNewInsp(!showNewInsp)} style={{marginTop:8,background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',border:'none',borderRadius:10,padding:'10px 20px',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:'0.82rem',boxShadow:'0 4px 15px rgba(59,130,246,0.3)'}}>➕ New Inspection</button>
          {showNewInsp&&(
            <div style={{...G.glass,padding:20,borderRadius:14,marginTop:12}}>
              <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:12}}>🧪 New Quality Inspection</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                {[{l:'Batch',k:'batch'},{l:'Farmer',k:'farmer'},{l:'Qty (tonnes)',k:'qty',t:'number'},{l:'Moisture %',k:'moisture',t:'number'},{l:'Trash %',k:'trash',t:'number'},{l:'Staple (mm)',k:'staple',t:'number'}].map(f=>
                  <div key={f.k}><label style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label><input type={f.t||'text'} value={inspForm[f.k]} onChange={e=>setInspForm(p=>({...p,[f.k]:e.target.value}))} style={{...inp}}/></div>
                )}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>setInspGrade(calcGrade(inspForm.moisture,inspForm.trash))} style={{background:'rgba(59,130,246,0.15)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:8,padding:'8px 16px',color:'#60a5fa',cursor:'pointer',fontWeight:600}}>🔢 Calculate Grade</button>
                {inspGrade&&<button onClick={()=>{const id='QI-'+String(inspections.length+1).padStart(3,'0');setInspections(p=>[{id,farmer:inspForm.farmer,crop:'Cotton',moisture:+inspForm.moisture,impurity:+inspForm.trash,grade:inspGrade,status:'Accepted'},...p]);setShowNewInsp(false);setInspGrade(null);flash('✅ Inspection saved! Certificate generated')}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'8px 16px',color:'#fff',cursor:'pointer',fontWeight:600}}>✅ Accept</button>}
              </div>
              {inspGrade&&<div style={{marginTop:10,background:inspGrade==='A'?'rgba(34,197,94,0.08)':inspGrade==='B'?'rgba(251,191,36,0.08)':'rgba(239,68,68,0.08)',border:'1px solid '+(inspGrade==='A'?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'),borderRadius:10,padding:14}}>
                <div style={{fontSize:'1.2rem',fontWeight:800,color:inspGrade==='A'?'#4ade80':inspGrade==='B'?'#fbbf24':'#ef4444'}}>Grade {inspGrade}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>Moisture: {inspForm.moisture}% · Trash: {inspForm.trash}% · Staple: {inspForm.staple}mm</div>
              </div>}
            </div>
          )}
        </div>
      )}

      {tab==='connections'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>🤝 Industry Network</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              {title:'👨‍🌾 Farmer Suppliers',count:847,items:[{n:'Ramaiah Naidu',d:'Guntur',s:'Cotton · 12q/ac',ph:'9000000001'},{n:'Lakshmi Devi',d:'Krishna',s:'Paddy · 22q/ac',ph:'9000000002'},{n:'Venkatesh R',d:'Kurnool',s:'Cotton · 10q/ac',ph:'9000000003'}]},
              {title:'🤝 Brokers',count:12,items:[{n:'Rajesh Broker',d:'Guntur APMC',s:'Cotton & Paddy',ph:'9100000001'},{n:'Srinivas Reddy',d:'Vijayawada',s:'Chilli specialist',ph:'9100000002'}]},
              {title:'🚛 Transport Fleet',count:8,items:[{n:'Krishna Logistics',d:'Guntur',s:'10T — Factory route',ph:'9876501234'},{n:'AP Heavy Haul',d:'Vijayawada',s:'20T Bulk',ph:'9876503456'}]},
              {title:'❄️ Cold Storage',count:4,items:[{n:'Sri Laxmi Cold Storage',d:'Guntur',s:'5000MT capacity',ph:'9200000001'},{n:'Krishna ColdChain',d:'Krishna',s:'8000MT',ph:'9200000002'}]},
              {title:'🏪 Input Suppliers',count:6,items:[{n:'Agri Centre Guntur',d:'Guntur',s:'Chemicals',ph:'9876501111'},{n:'Farm Equipment Hub',d:'Krishna',s:'Machinery',ph:'9876502222'}]},
              {title:'🏭 Other Industries',count:3,items:[{n:'AP Rice Mills',d:'Vijayawada',s:'Paddy processing',ph:'9300000001'},{n:'Krishna Sugar',d:'Krishna',s:'Sugarcane processing',ph:'9300000002'}]},
            ].map(sec=>(
              <div key={sec.title} style={{...G.glass,padding:18,borderRadius:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.92rem'}}>{sec.title}</span>
                  <span style={{fontSize:'0.72rem',color:'#60a5fa',fontWeight:600}}>{sec.count} total</span>
                </div>
                {sec.items.map(it=>(
                  <div key={it.n} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{it.n}</div>
                      <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>📍 {it.d} · {it.s}</div>
                    </div>
                    <button onClick={()=>window.open('tel:'+it.ph)} style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:6,padding:'3px 8px',color:'#4ade80',cursor:'pointer',fontSize:'0.68rem'}}>📞</button>
                    <button onClick={()=>window.open('https://wa.me/91'+it.ph)} style={{background:'rgba(34,197,94,0.1)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:6,padding:'3px 8px',color:'#4ade80',cursor:'pointer',fontSize:'0.68rem'}}>💬</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='payments'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {[{i:'💰',v:'₹'+PAYMENTS.reduce((s,p)=>s+p.amount,0).toLocaleString('en-IN'),l:'Total Payable',g:'rgba(59,130,246,0.1)',c:'#60a5fa'},{i:'✅',v:'₹217,600',l:'Confirmed',g:'rgba(34,197,94,0.1)',c:'#4ade80'},{i:'⏳',v:'₹663,700',l:'Pending',g:'rgba(251,191,36,0.1)',c:'#fbbf24'}].map(m=>(
              <div key={m.l} style={{background:m.g,border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20}}>
                <div style={{fontSize:'1.8rem',marginBottom:8}}>{m.i}</div>
                <div style={{fontSize:'1.3rem',fontWeight:800,color:m.c,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          {PAYMENTS.map(p=>(
            <div key={p.id} style={{...G.glass,padding:16,borderRadius:12,marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:'rgba(59,130,246,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>💳</div>
              <div style={{flex:1}}>
                <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem',marginBottom:3}}>{p.farmer}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{p.date} · {p.mode} · {p.id}</div>
              </div>
              <div style={{textAlign:'right',marginRight:8}}>
                <div style={{fontWeight:800,fontSize:'1rem',color:'#60a5fa'}}>₹{p.amount.toLocaleString('en-IN')}</div>
                <span style={{background:p.status==='Confirmed'?'rgba(34,197,94,0.12)':p.status==='Processing'?'rgba(251,191,36,0.12)':'rgba(59,130,246,0.12)',color:p.status==='Confirmed'?'#4ade80':p.status==='Processing'?'#fbbf24':'#60a5fa',padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>{p.status}</span>
              </div>
              <button style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 12px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem',flexShrink:0}}>Receipt</button>
            </div>
          ))}
        </div>
      )}

      {tab==='analytics'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {[{i:'📈',v:'₹4.82Cr',l:'Total Procurement FY26',c:'#60a5fa',g:'rgba(59,130,246,0.1)'},{i:'👨‍🌾',v:'847',l:'Active Farmer Partners',c:'#4ade80',g:'rgba(34,197,94,0.1)'},{i:'⭐',v:'4.6',l:'Avg Reliability Score',c:'#fbbf24',g:'rgba(251,191,36,0.1)'},{i:'📉',v:'-3.2%',l:'Cost vs Market',c:'#a78bfa',g:'rgba(139,92,246,0.1)'},{i:'✅',v:'94.3%',l:'On-Time Delivery',c:'#4ade80',g:'rgba(34,197,94,0.1)'},{i:'🧪',v:'87%',l:'Grade A Acceptance',c:'#60a5fa',g:'rgba(59,130,246,0.1)'}].map(m=>(
              <div key={m.l} style={{background:m.g,border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20}}>
                <div style={{fontSize:'1.6rem',marginBottom:6}}>{m.i}</div>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:m.c,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{...G.glass,padding:20,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Procurement Trend (Quintals)</div>
            <ResponsiveContainer width='100%' height={180}>
              <BarChart data={CHART}>
                <XAxis dataKey='m' tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/>
                <Bar dataKey='v' fill='url(#blueGrad)' radius={[4,4,0,0]} name='Quintals'>
                  <defs><linearGradient id='blueGrad' x1='0' y1='0' x2='0' y2='1'><stop offset='0%' stopColor='#3b82f6'/><stop offset='100%' stopColor='#1d4ed8'/></linearGradient></defs>
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab==='profile'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:16}}>🏭 Company Info</div>
            {[{l:'Factory Name',v:'Sri Venkateshwara Cotton Industries'},{l:'GSTIN',v:'37AABCS1234H1ZP'},{l:'Location',v:'Guntur, Andhra Pradesh'},{l:'Contact Email',v:'procurement@svcindustries.in'},{l:'Crops Needed',v:'Cotton, Sugarcane, Paddy'},{l:'Payment Terms',v:'Net 7 days via UPI/Bank'}].map(f=>(
              <div key={f.l} style={{marginBottom:12}}>
                <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:5}}>{f.l}</label>
                <input defaultValue={f.v} style={{width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'}}/>
              </div>
            ))}
            <button style={{width:'100%',background:'linear-gradient(135deg,#3b82f6,#1d4ed8)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700,marginTop:4,boxShadow:'0 4px 15px rgba(59,130,246,0.3)'}}>💾 Save Profile</button>
          </div>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Factory Stats</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[{l:'Capacity',v:'500 Q/day',c:'#60a5fa'},{l:'Workers',v:'1,200',c:'#4ade80'},{l:'Est.',v:'2008',c:'#fbbf24'},{l:'Certifications',v:'ISO+FSSAI',c:'#a78bfa'}].map(s=>(
                <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:'0.95rem',fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:8}}>Certifications</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['ISO 9001','FSSAI','BIS','APEDA'].map(c=>(
                  <span key={c} style={{background:'rgba(59,130,246,0.12)',color:'#60a5fa',padding:'3px 10px',borderRadius:20,fontSize:'0.7rem',border:'1px solid rgba(59,130,246,0.25)'}}>{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {toast&&<div style={{position:'fixed',bottom:24,right:24,background:'linear-gradient(135deg,#1e293b,#0f172a)',border:'1px solid rgba(59,130,246,0.3)',borderRadius:14,padding:'14px 24px',color:'#60a5fa',fontWeight:600,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>{toast}</div>}
    </div>
  );
}
