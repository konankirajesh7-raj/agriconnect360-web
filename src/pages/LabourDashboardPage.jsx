import React,{useState}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{BarChart,Bar,XAxis,YAxis,Tooltip,ResponsiveContainer}from 'recharts';
const G={glass:{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}};
const TABS=[{id:'workers',icon:'👷',label:'Workers'},{id:'bookings',icon:'📋',label:'Bookings'},{id:'attendance',icon:'✅',label:'Attendance'},{id:'connections',icon:'🤝',label:'Connections'},{id:'payments',icon:'💳',label:'Payments'},{id:'analytics',icon:'📊',label:'Analytics'}];
const INIT_WORKERS=[{name:'Ramaiah',phone:'9111111111',age:35,skills:['Harvesting','Weeding'],wage:400,upi:'ramaiah@paytm',status:'Available'},{name:'Lakshmi',phone:'9111111112',age:28,skills:['Weeding','Transplanting'],wage:380,upi:'lakshmi@upi',status:'Available'},{name:'Suresh',phone:'9111111113',age:40,skills:['Ploughing','Tractor'],wage:420,upi:'suresh@paytm',status:'Busy'},{name:'Geetha',phone:'9111111114',age:32,skills:['Harvesting','Sorting'],wage:370,upi:'geetha@upi',status:'Available'}];
const INIT_BOOKINGS=[{id:'BK-101',farmer:'Rajesh Kumar',task:'Paddy Harvesting',date:'Apr 27',workers:5,location:'Guntur',status:'Pending',assigned:[]}];
const CHART=[{m:'Oct',v:18200},{m:'Nov',v:21500},{m:'Dec',v:15600},{m:'Jan',v:22800},{m:'Feb',v:19400},{m:'Mar',v:25100}];

export default function LabourDashboardPage(){
  const{farmerProfile}=useAuth();
  const[tab,setTab]=useState('workers');
  const[toast,setToast]=useState('');
  const[workers,setWorkers]=useState(INIT_WORKERS);
  const[showAddWorker,setShowAddWorker]=useState(false);
  const[wForm,setWForm]=useState({name:'',phone:'',age:'',skills:'',wage:'',upi:''});
  const[bookings,setBookings]=useState(INIT_BOOKINGS);
  const[attendance,setAttendance]=useState({});
  const[jobComplete,setJobComplete]=useState(false);
  const[workerPayments,setWorkerPayments]=useState([]);
  function flash(m){setToast(m);setTimeout(()=>setToast(''),2500);}
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
                <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.5)'}}>Welcome, {farmerProfile?.name||'Association'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {[{l:'Workers',v:workers.length+'',c:'#f87171'},{l:'Revenue MTD',v:'₹25.1K',c:'#4ade80'},{l:'Bookings',v:bookings.length+'',c:'#fbbf24'},{l:'Rating',v:'⭐4.8',c:'#a78bfa'}].map(m=>(
                <div key={m.l} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={()=>{setShowAddWorker(!showAddWorker);setTab('workers')}} style={{background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,boxShadow:'0 4px 15px rgba(239,68,68,0.4)'}}>+ Add Worker</button>
        </div>
      </div>

      <div style={{display:'flex',gap:4,marginBottom:20,background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.06)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 6px',borderRadius:9,border:'none',cursor:'pointer',fontSize:'0.76rem',fontWeight:600,transition:'all 0.25s',background:tab===t.id?'linear-gradient(135deg,#ef4444,#dc2626)':'transparent',color:tab===t.id?'#fff':'rgba(255,255,255,0.45)',boxShadow:tab===t.id?'0 4px 12px rgba(239,68,68,0.3)':'none'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==='workers'&&(<div>
        {showAddWorker&&(<div style={{...G.glass,padding:20,borderRadius:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:12}}>+ Add Worker</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
            {[{l:'Name',k:'name',ph:'Ramaiah'},{l:'Mobile',k:'phone',ph:'9111111111'},{l:'Age',k:'age',ph:'35',t:'number'},{l:'Skills (comma)',k:'skills',ph:'Harvesting, Weeding'},{l:'Wage/day',k:'wage',ph:'400',t:'number'},{l:'UPI ID',k:'upi',ph:'name@paytm'}].map(f=><div key={f.k}><label style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label><input type={f.t||'text'} placeholder={f.ph} value={wForm[f.k]} onChange={e=>setWForm(p=>({...p,[f.k]:e.target.value}))} style={{...inp}}/></div>)}
          </div>
          <button onClick={()=>{if(!wForm.name)return;setWorkers(p=>[...p,{name:wForm.name,phone:wForm.phone,age:+wForm.age,skills:wForm.skills.split(',').map(s=>s.trim()),wage:+wForm.wage,upi:wForm.upi,status:'Available'}]);setShowAddWorker(false);setWForm({name:'',phone:'',age:'',skills:'',wage:'',upi:''});flash('✅ '+wForm.name+' added!')}} style={{background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:8,padding:'8px 18px',color:'#fff',cursor:'pointer',fontWeight:600}}>💾 Save Worker</button>
        </div>)}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14}}>
          {workers.map(w=>(<div key={w.name} style={{...G.glass,padding:18,borderRadius:14}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}><div><span style={{fontWeight:700,color:'#f1f5f9'}}>{w.name}</span><span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)',marginLeft:6}}>Age {w.age}</span></div>
              <span style={{background:w.status==='Available'?'rgba(34,197,94,0.15)':'rgba(251,191,36,0.15)',color:w.status==='Available'?'#4ade80':'#fbbf24',padding:'2px 8px',borderRadius:20,fontSize:'0.62rem',fontWeight:600}}>{w.status}</span></div>
            <div style={{display:'flex',gap:4,flexWrap:'wrap',marginBottom:8}}>{w.skills.map(s=><span key={s} style={{background:'rgba(239,68,68,0.12)',color:'#f87171',padding:'2px 8px',borderRadius:20,fontSize:'0.62rem'}}>{s}</span>)}</div>
            <div style={{display:'flex',justifyContent:'space-between',fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}><span>₹{w.wage}/day</span><span>📱 {w.phone}</span></div>
          </div>))}
        </div>
      </div>)}

      {tab==='bookings'&&(<div>{bookings.map(b=>(<div key={b.id} style={{...G.glass,padding:18,borderRadius:14,marginBottom:14}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}><div><span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.95rem'}}>{b.task}</span><code style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.06)',padding:'2px 6px',borderRadius:4,marginLeft:8}}>{b.id}</code></div>
          <span style={{background:b.status==='Confirmed'?'rgba(34,197,94,0.15)':'rgba(251,191,36,0.15)',color:b.status==='Confirmed'?'#4ade80':'#fbbf24',padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>{b.status}</span></div>
        <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:10}}>👨‍🌾 {b.farmer} · 📍 {b.location} · 📅 {b.date} · Need {b.workers} workers</div>
        {b.assigned.length>0&&<div style={{fontSize:'0.72rem',color:'#4ade80',marginBottom:8}}>✅ Assigned: {b.assigned.join(', ')}</div>}
        {b.status==='Pending'&&(<div>
          <div style={{display:'flex',gap:6,flexWrap:'wrap',marginBottom:10}}>{workers.filter(w=>w.status==='Available').map(w=>(<label key={w.name} style={{display:'flex',alignItems:'center',gap:4,background:'rgba(255,255,255,0.04)',borderRadius:8,padding:'4px 10px',cursor:'pointer',fontSize:'0.72rem',color:'#f1f5f9'}}><input type="checkbox" defaultChecked/>{w.name} (₹{w.wage})</label>))}</div>
          <button onClick={()=>{const a=workers.filter(w=>w.status==='Available').map(w=>w.name);setBookings(p=>p.map(x=>x.id===b.id?{...x,status:'Confirmed',assigned:a}:x));flash('✅ Workers assigned! SMS sent')}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'8px 16px',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:'0.78rem'}}>✅ Assign & Accept</button>
        </div>)}
      </div>))}</div>)}

      {tab==='attendance'&&(<div>
        <div style={{...G.glass,padding:20,borderRadius:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:4}}>✅ Mark Attendance — Apr 27</div>
          <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:14}}>Check-in: 8:00 AM · Paddy Harvesting</div>
          {workers.map(w=>(<div key={w.name} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{flex:1,fontWeight:600,color:'#f1f5f9',fontSize:'0.85rem'}}>{w.name}<span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.3)',marginLeft:8}}>₹{w.wage}/day</span></div>
            <button onClick={()=>setAttendance(p=>({...p,[w.name]:p[w.name]==='Present'?'Absent':'Present'}))} style={{background:attendance[w.name]==='Present'?'rgba(34,197,94,0.15)':attendance[w.name]==='Absent'?'rgba(239,68,68,0.15)':'rgba(255,255,255,0.06)',color:attendance[w.name]==='Present'?'#4ade80':attendance[w.name]==='Absent'?'#ef4444':'rgba(255,255,255,0.4)',border:'none',borderRadius:8,padding:'5px 14px',cursor:'pointer',fontWeight:600,fontSize:'0.72rem',minWidth:80}}>{attendance[w.name]||'Mark'}</button>
          </div>))}
        </div>
        {!jobComplete&&Object.keys(attendance).length>0&&(<button onClick={()=>{const present=Object.entries(attendance).filter(([,v])=>v==='Present');const tw=present.reduce((s,[n])=>{const w=workers.find(x=>x.name===n);return s+(w?.wage||0)},0);const cm=Math.round(tw*0.1);setWorkerPayments(present.map(([n])=>{const w=workers.find(x=>x.name===n);return{name:n,wage:w?.wage||0,status:'Pending'}}));setJobComplete({present:present.length,totalWage:tw,commission:cm,total:tw+cm});flash('✅ Job complete!')}} style={{background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:10,padding:'10px 20px',color:'#fff',cursor:'pointer',fontWeight:600}}>🏁 Mark Job Complete (5:30 PM)</button>)}
        {jobComplete&&(<div style={{...G.glass,padding:18,borderRadius:14,marginTop:12}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:8}}>💰 Wage Calculation</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            <div style={{background:'rgba(34,197,94,0.08)',borderRadius:10,padding:12,textAlign:'center'}}><div style={{fontSize:'1.1rem',fontWeight:800,color:'#4ade80'}}>₹{jobComplete.totalWage?.toLocaleString()}</div><div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)'}}>{jobComplete.present} workers</div></div>
            <div style={{background:'rgba(251,191,36,0.08)',borderRadius:10,padding:12,textAlign:'center'}}><div style={{fontSize:'1.1rem',fontWeight:800,color:'#fbbf24'}}>₹{jobComplete.commission?.toLocaleString()}</div><div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)'}}>10% Commission</div></div>
            <div style={{background:'rgba(239,68,68,0.08)',borderRadius:10,padding:12,textAlign:'center'}}><div style={{fontSize:'1.1rem',fontWeight:800,color:'#f87171'}}>₹{jobComplete.total?.toLocaleString()}</div><div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)'}}>Total</div></div>
          </div>
        </div>)}
      </div>)}

      {tab==='payments'&&(<div>
        <div style={{...G.glass,padding:18,borderRadius:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:10}}>👨‍🌾 Farmer Payment</div>
          <div style={{display:'flex',alignItems:'center',gap:12}}>
            <div style={{flex:1,fontSize:'0.82rem',color:'rgba(255,255,255,0.5)'}}>Pending from Rajesh Kumar: <b style={{color:'#fbbf24'}}>₹{jobComplete?.total?.toLocaleString()||'1,320'}</b></div>
            <button onClick={()=>flash('✅ Payment ₹'+(jobComplete?.total||1320)+' recorded via UPI · Ref: UPI789012')} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'8px 14px',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:'0.75rem'}}>💰 Record Payment</button>
          </div>
        </div>
        <div style={{...G.glass,padding:18,borderRadius:14}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:10}}>👷 Pay Workers</div>
          {(workerPayments.length>0?workerPayments:workers.slice(0,3).map(w=>({name:w.name,wage:w.wage,status:'Pending'}))).map(wp=>(<div key={wp.name} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
            <div style={{flex:1,fontWeight:600,color:'#f1f5f9',fontSize:'0.85rem'}}>{wp.name}</div>
            <div style={{fontWeight:700,color:wp.status==='Paid'?'#4ade80':'#fbbf24',marginRight:8}}>₹{wp.wage}</div>
            {wp.status==='Pending'?(<button onClick={()=>{setWorkerPayments(p=>p.length>0?p.map(x=>x.name===wp.name?{...x,status:'Paid'}:x):workers.slice(0,3).map(w=>({name:w.name,wage:w.wage,status:w.name===wp.name?'Paid':'Pending'})));flash('✅ ₹'+wp.wage+' paid to '+wp.name)}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'5px 12px',color:'#fff',cursor:'pointer',fontSize:'0.7rem',fontWeight:600}}>💰 Pay UPI</button>):(<span style={{background:'rgba(34,197,94,0.15)',color:'#4ade80',padding:'3px 10px',borderRadius:20,fontSize:'0.65rem',fontWeight:600}}>Paid ✓</span>)}
          </div>))}
        </div>
      </div>)}

      {tab==='connections'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>🤝 Labour Network</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              {title:'👨‍🌾 Farmers (Employers)',count:34,items:[{n:'Rajesh Kumar',d:'Guntur',s:'Paddy · Regular client',ph:'9000000001'},{n:'Ramaiah Naidu',d:'Guntur',s:'Cotton · 5 acres',ph:'9000000002'},{n:'Lakshmi Devi',d:'Krishna',s:'Paddy · 8 acres',ph:'9000000005'}]},
              {title:'🤝 Brokers',count:5,items:[{n:'Rajesh Broker',d:'Guntur',s:'Cotton deals',ph:'9100000001'},{n:'Srinivas Reddy',d:'Guntur',s:'Harvest season',ph:'9100000002'}]},
              {title:'🏭 Industries',count:4,items:[{n:'Cotton Mill Guntur',d:'Guntur',s:'Loading/unloading',ph:'9300000001'},{n:'AP Sugar Factory',d:'Krishna',s:'Seasonal work',ph:'9300000002'}]},
              {title:'🚛 Transport',count:3,items:[{n:'Ramesh Kumar',d:'Guntur',s:'Worker transport',ph:'9876501234'}]},
              {title:'🏪 Suppliers',count:2,items:[{n:'Agri Centre',d:'Guntur',s:'Tool supplier',ph:'9876501111'}]},
              {title:'👷 Other Labour Groups',count:6,items:[{n:'Krishna Labour Co-op',d:'Krishna',s:'45 workers',ph:'9876500002'},{n:'Kurnool Mazdoor',d:'Kurnool',s:'38 workers',ph:'9876500005'}]},
            ].map(sec=>(
              <div key={sec.title} style={{...G.glass,padding:18,borderRadius:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.92rem'}}>{sec.title}</span>
                  <span style={{fontSize:'0.72rem',color:'#f87171',fontWeight:600}}>{sec.count} total</span>
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

      {tab==='analytics'&&(<div>
        <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
          {[{i:'💰',v:'₹25.1K',l:'Revenue MTD',g:'rgba(34,197,94,0.1)',c:'#4ade80'},{i:'📅',v:'₹2.24L',l:'Revenue FY',g:'rgba(59,130,246,0.1)',c:'#60a5fa'},{i:'👷',v:workers.length+'',l:'Active Workers',g:'rgba(239,68,68,0.1)',c:'#f87171'}].map(m=>(<div key={m.l} style={{background:m.g,border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20}}><div style={{fontSize:'1.8rem',marginBottom:8}}>{m.i}</div><div style={{fontSize:'1.5rem',fontWeight:800,color:m.c,marginBottom:4}}>{m.v}</div><div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div></div>))}
        </div>
        <div style={{...G.glass,padding:20,borderRadius:14}}><div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Monthly Revenue (₹)</div>
          <ResponsiveContainer width='100%' height={180}><BarChart data={CHART}><XAxis dataKey='m' tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/><YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/><Tooltip contentStyle={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/><Bar dataKey='v' fill='#ef4444' radius={[4,4,0,0]} name='Revenue'/></BarChart></ResponsiveContainer>
        </div>
      </div>)}

      {tab==='profile'&&(<div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
        <div style={{...G.glass,padding:22,borderRadius:14}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:16}}>🏢 Association Profile</div>
          {[{l:'Name',v:'Sri Lakshmi Labour Group'},{l:'Leader',v:farmerProfile?.name||'Labour Leader'},{l:'Phone',v:'+91 90000 00006'},{l:'District',v:'Guntur'},{l:'Workers',v:workers.length+''},{l:'Reg No.',v:'AP/LAB/2024/1234'}].map(f=>(<div key={f.l} style={{marginBottom:12}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:5}}>{f.l}</label><input defaultValue={f.v} style={{...inp}}/></div>))}
          <button onClick={()=>flash('✅ Profile saved')} style={{width:'100%',background:'linear-gradient(135deg,#ef4444,#dc2626)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700}}>💾 Save</button>
        </div>
        <div style={{...G.glass,padding:22,borderRadius:14}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Summary</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10}}>
            {[{l:'Workers',v:workers.length+'',c:'#f87171'},{l:'Revenue',v:'₹25.1K',c:'#4ade80'},{l:'Jobs',v:'7',c:'#60a5fa'},{l:'Rating',v:'⭐4.8',c:'#fbbf24'}].map(s=>(<div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:12,textAlign:'center'}}><div style={{fontSize:'1rem',fontWeight:800,color:s.c}}>{s.v}</div><div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div></div>))}
          </div>
        </div>
      </div>)}
      {toast&&<div style={{position:'fixed',bottom:24,right:24,background:'linear-gradient(135deg,#1e293b,#0f172a)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:14,padding:'14px 24px',color:'#f87171',fontWeight:600,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>{toast}</div>}
    </div>
  );
}
