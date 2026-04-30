import React,{useState}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer}from 'recharts';
const G={glass:{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}};
const TABS=[{id:'deals',icon:'🤝',label:'Active Deals'},{id:'network',icon:'🌐',label:'Farmer Network'},{id:'connections',icon:'📇',label:'Connections'},{id:'mandi',icon:'🏪',label:'Mandi Ops'},{id:'payments',icon:'💳',label:'Payment Ledger'},{id:'pnl',icon:'📒',label:'P&L Notes'},{id:'prices',icon:'💰',label:'Market Intel'},{id:'analytics',icon:'📊',label:'Analytics'}];
const DEALS=[{id:'D-201',farmer:'Ramaiah Naidu',buyer:'Deccan Foods Ltd',crop:'Cotton',qty:'80 Q',rate:7200,status:'Negotiating',margin:320,date:'Apr 23'},{id:'D-202',farmer:'Lakshmi Devi',buyer:'AP Rice Mills',crop:'Paddy',qty:'150 Q',rate:2350,status:'Confirmed',margin:180,date:'Apr 22'},{id:'D-203',farmer:'Venkatesh R',buyer:'Guntur Traders',crop:'Chilli',qty:'30 Q',rate:18500,status:'Pending',margin:950,date:'Apr 21'},{id:'D-204',farmer:'Suresh Kumar',buyer:'ITC Ltd',crop:'Tobacco',qty:'200 Q',rate:4800,status:'Confirmed',margin:240,date:'Apr 20'}];
const MANDI_COMPARE=[{mandi:'Guntur APMC',paddy:2280,cotton:7150,chilli:18200,best:['chilli']},{mandi:'Vijayawada',paddy:2320,cotton:7050,chilli:17800,best:['paddy']},{mandi:'Ongole',paddy:2250,cotton:7200,chilli:17500,best:['cotton']},{mandi:'Kurnool',paddy:2190,cotton:6900,chilli:18500,best:['chilli']},{mandi:'Nellore',paddy:2350,cotton:6800,chilli:17200,best:['paddy']}];
const CHART=[{m:'Oct',v:3.2},{m:'Nov',v:4.1},{m:'Dec',v:3.8},{m:'Jan',v:5.2},{m:'Feb',v:4.7},{m:'Mar',v:6.1}];
const STATUS_STYLE={Negotiating:{bg:'rgba(251,191,36,0.15)',color:'#fbbf24'},Confirmed:{bg:'rgba(34,197,94,0.15)',color:'#4ade80'},Pending:{bg:'rgba(59,130,246,0.15)',color:'#60a5fa'},Paid:{bg:'rgba(34,197,94,0.15)',color:'#4ade80'}};

export default function BrokerDashboardPage(){
  const{farmerProfile}=useAuth();
  const[tab,setTab]=useState('deals');
  const[search,setSearch]=useState('');
  const[toast,setToast]=useState('');
  const[farmers,setFarmers]=useState([{name:'Ramaiah Naidu',district:'Guntur',crop:'Cotton',harvest:'Jun 2026',phone:'9000000001',notes:'Good cotton farmer'},{name:'Lakshmi Devi',district:'Krishna',crop:'Paddy',harvest:'May 2026',phone:'9000000002',notes:''},{name:'Suresh Kumar',district:'Prakasam',crop:'Sugarcane',harvest:'Jul 2026',phone:'9000000005',notes:''}]);
  const[showAddFarmer,setShowAddFarmer]=useState(false);
  const[searchMob,setSearchMob]=useState('');
  const[addNote,setAddNote]=useState('');
  const[transactions,setTransactions]=useState([{id:'T-101',farmer:'Ramaiah Naidu',crop:'Cotton',market:'Guntur APMC',qty:20,price:7150,commission:2.5,status:'Paid',date:'Apr 20'}]);
  const[txForm,setTxForm]=useState({farmer:'Rajesh Kumar',crop:'Paddy BPT-5204',market:'Guntur APMC',qty:'15',price:'2150',commission:'2.5'});
  const[showTxForm,setShowTxForm]=useState(false);
  const[txCalc,setTxCalc]=useState(null);
  const[payments,setPayments]=useState([{id:'PAY-101',farmer:'Ramaiah Naidu',amount:139425,method:'UPI',ref:'UPI789012',status:'Paid',date:'Apr 20'}]);
  const[showPayForm,setShowPayForm]=useState(false);
  const[payForm,setPayForm]=useState({amount:'',method:'UPI',ref:''});
  const[showNewDeal,setShowNewDeal]=useState(false);
  const[deals,setDeals]=useState(DEALS);
  const[newDeal,setNewDeal]=useState({farmer:'',buyer:'',crop:'',qty:'',rate:'',margin:''});
  function flash(m){setToast(m);setTimeout(()=>setToast(''),2500);}
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
            <button onClick={()=>setShowNewDeal(!showNewDeal)} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,boxShadow:'0 4px 15px rgba(245,158,11,0.4)'}}>➕ New Deal</button>
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
          {showNewDeal&&(
            <div style={{...G.glass,padding:20,borderRadius:14,marginBottom:16}}>
              <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:12}}>🤝 Create New Deal</div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                {[{l:'Farmer',k:'farmer',ph:'Ramaiah Naidu'},{l:'Buyer',k:'buyer',ph:'Deccan Foods Ltd'},{l:'Crop',k:'crop',ph:'Cotton'},{l:'Quantity',k:'qty',ph:'80 Q'},{l:'Rate (₹/Q)',k:'rate',ph:'7200',t:'number'},{l:'Margin (₹/Q)',k:'margin',ph:'320',t:'number'}].map(f=>
                  <div key={f.k}><label style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label><input type={f.t||'text'} placeholder={f.ph} value={newDeal[f.k]} onChange={e=>setNewDeal(p=>({...p,[f.k]:e.target.value}))} style={{...inp}}/></div>
                )}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{if(!newDeal.farmer||!newDeal.crop)return;setDeals(p=>[{id:'D-'+String(200+p.length+1),farmer:newDeal.farmer,buyer:newDeal.buyer,crop:newDeal.crop,qty:newDeal.qty,rate:+newDeal.rate||0,status:'Pending',margin:+newDeal.margin||0,date:new Date().toLocaleDateString('en-IN',{month:'short',day:'numeric'})},...p]);setShowNewDeal(false);setNewDeal({farmer:'',buyer:'',crop:'',qty:'',rate:'',margin:''});flash('✅ Deal created!')}} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:8,padding:'8px 18px',color:'#fff',cursor:'pointer',fontWeight:600}}>💾 Create Deal</button>
                <button onClick={()=>setShowNewDeal(false)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'8px 14px',color:'rgba(255,255,255,0.5)',cursor:'pointer'}}>Cancel</button>
              </div>
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:16}}>
            {[{i:'🤝',v:'4',l:'Total Deals',c:'#fbbf24'},{i:'⏳',v:'1',l:'Pending',c:'#60a5fa'},{i:'✅',v:'2',l:'Confirmed',c:'#4ade80'},{i:'💰',v:'₹84K',l:'Commission',c:'#a78bfa'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12}}>
                <div style={{fontSize:'1.4rem',marginBottom:6}}>{m.i}</div>
                <div style={{fontSize:'1.3rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          {deals.map(d=>(
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

      {tab==='network'&&(
        <div>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
            <div style={{fontWeight:700,color:'#f1f5f9',fontSize:'1rem'}}>👨‍🌾 Farmer Network ({farmers.length})</div>
            <button onClick={()=>setShowAddFarmer(!showAddFarmer)} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,padding:'8px 16px',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:'0.8rem'}}>+ Add Farmer to Network</button>
          </div>
          {showAddFarmer&&(
            <div style={{...G.glass,padding:18,borderRadius:14,marginBottom:16}}>
              <div style={{fontWeight:600,color:'#f1f5f9',marginBottom:10}}>Search Farmer by Mobile</div>
              <div style={{display:'flex',gap:8,marginBottom:10}}>
                <input value={searchMob} onChange={e=>setSearchMob(e.target.value)} placeholder="9000000001" style={{...inp,flex:1}}/>
                <button onClick={()=>{if(searchMob==='9000000001')flash('✅ Found: Rajesh Kumar, Guntur');else flash('❌ Not found')}} style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:8,padding:'8px 16px',color:'#fbbf24',cursor:'pointer',fontWeight:600}}>🔍 Search</button>
              </div>
              {searchMob==='9000000001'&&<div style={{background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,padding:12,marginBottom:10}}>
                <div style={{fontWeight:700,color:'#4ade80'}}>✅ Rajesh Kumar · Guntur · 2 acres Rice</div>
                <input value={addNote} onChange={e=>setAddNote(e.target.value)} placeholder="Notes: Good cotton farmer" style={{...inp,marginTop:8}}/>
                <button onClick={()=>{setFarmers(p=>[...p,{name:'Rajesh Kumar',district:'Guntur',crop:'Rice',harvest:'Aug 2026',phone:'9000000001',notes:addNote}]);setShowAddFarmer(false);setSearchMob('');flash('✅ Rajesh Kumar added to network')}} style={{marginTop:8,background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'7px 16px',color:'#fff',cursor:'pointer',fontWeight:600,fontSize:'0.78rem'}}>+ Add to Network</button>
              </div>}
            </div>
          )}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            <div>
              {farmers.map(f=>(
                <div key={f.name+f.crop} style={{...G.glass,padding:14,borderRadius:12,marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <div><span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem'}}>{f.name}</span><span style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginLeft:8}}>{f.district}</span></div>
                    <div style={{display:'flex',gap:6}}>
                      <button onClick={()=>window.open('tel:'+f.phone)} style={{background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:6,padding:'3px 8px',color:'#4ade80',cursor:'pointer',fontSize:'0.68rem'}}>📞 Call</button>
                      <button onClick={()=>window.open('https://wa.me/91'+f.phone)} style={{background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:6,padding:'3px 8px',color:'#4ade80',cursor:'pointer',fontSize:'0.68rem'}}>💬 WhatsApp</button>
                    </div>
                  </div>
                  <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>🌾 {f.crop} · 📅 Harvest: {f.harvest}</div>
                  {f.notes&&<div style={{fontSize:'0.68rem',color:'#fbbf24',marginTop:4}}>📝 {f.notes}</div>}
                </div>
              ))}
            </div>
            <div style={{...G.glass,padding:18,borderRadius:14}}>
              <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:12}}>📅 Harvest Calendar</div>
              {farmers.map(f=><div key={f.name+f.harvest} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                <div style={{width:8,height:8,borderRadius:4,background:f.harvest.includes('May')?'#ef4444':f.harvest.includes('Jun')?'#fbbf24':'#4ade80'}}/>
                <div style={{flex:1,fontSize:'0.82rem',color:'#f1f5f9'}}>{f.name}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{f.crop}</div>
                <div style={{fontSize:'0.72rem',fontWeight:600,color:f.harvest.includes('May')?'#ef4444':'#fbbf24'}}>{f.harvest}</div>
              </div>)}
            </div>
          </div>
        </div>
      )}

      {tab==='mandi'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[{i:'🏪',v:transactions.length+'',l:'Total Transactions',c:'#fbbf24'},{i:'💰',v:'₹'+Math.round(transactions.reduce((s,t)=>s+t.qty*t.price*t.commission/100,0)).toLocaleString(),l:'Commission This Week',c:'#4ade80'},{i:'📊',v:'2.5%',l:'Avg Commission',c:'#60a5fa'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12,textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',marginBottom:4}}>{m.i}</div>
                <div style={{fontSize:'1.2rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          <button onClick={()=>setShowTxForm(!showTxForm)} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,padding:'10px 20px',color:'#fff',cursor:'pointer',fontWeight:600,marginBottom:16,boxShadow:'0 4px 15px rgba(245,158,11,0.3)'}}>+ New Transaction</button>
          {showTxForm&&(
            <div style={{...G.glass,padding:20,borderRadius:14,marginBottom:16}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:10,marginBottom:12}}>
                {[{l:'Farmer',k:'farmer'},{l:'Crop',k:'crop'},{l:'Market',k:'market'},{l:'Qty (quintals)',k:'qty',t:'number'},{l:'Price/Q (₹)',k:'price',t:'number'},{l:'Commission %',k:'commission',t:'number'}].map(f=>(
                  <div key={f.k}><label style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label><input type={f.t||'text'} value={txForm[f.k]} onChange={e=>setTxForm(p=>({...p,[f.k]:e.target.value}))} style={{...inp}}/></div>
                ))}
              </div>
              <div style={{display:'flex',gap:8}}>
                <button onClick={()=>{const g=+txForm.qty*+txForm.price;const c=g*+txForm.commission/100;setTxCalc({gross:g,commission:c,net:g-c})}} style={{background:'rgba(245,158,11,0.15)',border:'1px solid rgba(245,158,11,0.3)',borderRadius:8,padding:'8px 16px',color:'#fbbf24',cursor:'pointer',fontWeight:600}}>🔢 Calculate</button>
                {txCalc&&<button onClick={()=>{const id='T-'+String(100+transactions.length+1);setTransactions(p=>[{id,farmer:txForm.farmer,crop:txForm.crop,market:txForm.market,qty:+txForm.qty,price:+txForm.price,commission:+txForm.commission,status:'Pending',date:new Date().toLocaleDateString('en-IN',{month:'short',day:'numeric'})},...p]);setPayments(p=>[{id:'PAY-'+String(100+p.length+1),farmer:txForm.farmer,amount:txCalc.net,method:'Pending',ref:'—',status:'Pending',date:new Date().toLocaleDateString('en-IN',{month:'short',day:'numeric'})},...p]);setShowTxForm(false);setTxCalc(null);flash('✅ Transaction saved to mandi ledger')}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'8px 16px',color:'#fff',cursor:'pointer',fontWeight:600}}>💾 Save</button>}
              </div>
              {txCalc&&<div style={{marginTop:12,background:'rgba(34,197,94,0.08)',border:'1px solid rgba(34,197,94,0.2)',borderRadius:10,padding:14}}>
                <div style={{display:'flex',gap:20,fontSize:'0.85rem'}}>
                  <span style={{color:'#f1f5f9'}}>Gross: <b style={{color:'#4ade80'}}>₹{txCalc.gross.toLocaleString()}</b></span>
                  <span style={{color:'#f1f5f9'}}>Commission: <b style={{color:'#fbbf24'}}>₹{txCalc.commission.toLocaleString()}</b></span>
                  <span style={{color:'#f1f5f9'}}>Net to Farmer: <b style={{color:'#60a5fa'}}>₹{txCalc.net.toLocaleString()}</b></span>
                </div>
              </div>}
            </div>
          )}
          <div style={{...G.glass,borderRadius:14,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:700,color:'#f1f5f9'}}>📋 Mandi Ledger</div>
            {transactions.map(t=>(
              <div key={t.id} style={{padding:'12px 18px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(245,158,11,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>🏪</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{t.farmer} · {t.crop}</div>
                  <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>{t.market} · {t.qty}Q × ₹{t.price} · {t.date}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700,color:'#4ade80'}}>₹{(t.qty*t.price).toLocaleString()}</div>
                  <div style={{fontSize:'0.62rem',color:'#fbbf24'}}>Commission: ₹{Math.round(t.qty*t.price*t.commission/100).toLocaleString()}</div>
                </div>
                <span style={{background:STATUS_STYLE[t.status]?.bg,color:STATUS_STYLE[t.status]?.color,padding:'3px 10px',borderRadius:20,fontSize:'0.65rem',fontWeight:600}}>{t.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='payments'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[{i:'⏳',v:'₹'+Math.round(payments.filter(p=>p.status==='Pending').reduce((s,p)=>s+p.amount,0)).toLocaleString(),l:'Pending Payments',c:'#fbbf24'},{i:'✅',v:'₹'+Math.round(payments.filter(p=>p.status==='Paid').reduce((s,p)=>s+p.amount,0)).toLocaleString(),l:'Paid Total',c:'#4ade80'},{i:'👨‍🌾',v:payments.length+'',l:'Transactions',c:'#60a5fa'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12,textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',marginBottom:4}}>{m.i}</div>
                <div style={{fontSize:'1.2rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{...G.glass,borderRadius:14,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:700,color:'#f1f5f9'}}>💳 Payment Ledger</div>
            {payments.map(p=>(
              <div key={p.id} style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:p.status==='Paid'?'rgba(34,197,94,0.1)':'rgba(251,191,36,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>{p.status==='Paid'?'✅':'⏳'}</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{p.farmer}</div>
                  <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>{p.id} · {p.date} · {p.method} {p.ref!=='—'?'· Ref: '+p.ref:''}</div>
                </div>
                <div style={{fontWeight:700,color:p.status==='Paid'?'#4ade80':'#fbbf24',marginRight:8}}>₹{p.amount.toLocaleString()}</div>
                {p.status==='Pending'?(
                  <button onClick={()=>{const amt=prompt('Amount to pay:',p.amount);const ref=prompt('UPI/Ref Number:','UPI123456');if(amt&&ref){setPayments(prev=>prev.map(x=>x.id===p.id?{...x,status:'Paid',method:'UPI',ref}:x));flash('✅ Payment recorded! Farmer notified')}}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'6px 14px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>💰 Record Payment</button>
                ):(
                  <span style={{background:'rgba(34,197,94,0.15)',color:'#4ade80',padding:'3px 10px',borderRadius:20,fontSize:'0.65rem',fontWeight:600}}>Paid</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='prices'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>📊 Cross-Mandi Price Comparison</div>
          <div style={{...G.glass,borderRadius:14,overflow:'hidden'}}>
            <table style={{width:'100%',borderCollapse:'collapse'}}>
              <thead><tr style={{borderBottom:'1px solid rgba(255,255,255,0.08)'}}>
                {['Mandi','Paddy (₹/Q)','Cotton (₹/Q)','Chilli (₹/Q)'].map(h=><th key={h} style={{padding:'12px 16px',textAlign:'left',fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',fontWeight:600}}>{h}</th>)}
              </tr></thead>
              <tbody>{MANDI_COMPARE.map(m=>{
                const maxP=Math.max(...MANDI_COMPARE.map(x=>x.paddy));
                const maxC=Math.max(...MANDI_COMPARE.map(x=>x.cotton));
                const maxCh=Math.max(...MANDI_COMPARE.map(x=>x.chilli));
                return(<tr key={m.mandi} style={{borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <td style={{padding:'12px 16px',fontWeight:600,color:'#f1f5f9',fontSize:'0.85rem'}}>{m.mandi}</td>
                  <td style={{padding:'12px 16px',fontWeight:700,color:m.paddy===maxP?'#4ade80':'#f1f5f9',fontSize:'0.85rem',background:m.paddy===maxP?'rgba(34,197,94,0.08)':'transparent'}}>₹{m.paddy.toLocaleString()}{m.paddy===maxP&&' ✅'}</td>
                  <td style={{padding:'12px 16px',fontWeight:700,color:m.cotton===maxC?'#4ade80':'#f1f5f9',fontSize:'0.85rem',background:m.cotton===maxC?'rgba(34,197,94,0.08)':'transparent'}}>₹{m.cotton.toLocaleString()}{m.cotton===maxC&&' ✅'}</td>
                  <td style={{padding:'12px 16px',fontWeight:700,color:m.chilli===maxCh?'#4ade80':'#f1f5f9',fontSize:'0.85rem',background:m.chilli===maxCh?'rgba(34,197,94,0.08)':'transparent'}}>₹{m.chilli.toLocaleString()}{m.chilli===maxCh&&' ✅'}</td>
                </tr>);
              })}</tbody>
            </table>
          </div>
          <div style={{marginTop:8,fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>✅ = Best price highlighted green</div>
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
                <Tooltip contentStyle={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/>
                <Line type='monotone' dataKey='v' stroke='#f59e0b' strokeWidth={2.5} dot={{fill:'#f59e0b',r:4}} activeDot={{r:6}} name='Commission (₹L)'/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {tab==='clients'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>👥 All Clients & Connections</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              {title:'👨‍🌾 Farmers',count:23,items:[{n:'Ramaiah Naidu',d:'Guntur',s:'Cotton · 80Q',ph:'9000000001'},{n:'Lakshmi Devi',d:'Krishna',s:'Paddy · 150Q',ph:'9000000002'},{n:'Venkatesh R',d:'Guntur',s:'Chilli · 30Q',ph:'9000000003'},{n:'Suresh Kumar',d:'Prakasam',s:'Sugarcane',ph:'9000000005'}]},
              {title:'🏭 Industries/Buyers',count:11,items:[{n:'Deccan Foods Ltd',d:'Guntur',s:'Cotton Buyer',ph:'9100000001'},{n:'AP Rice Mills',d:'Vijayawada',s:'Paddy Buyer',ph:'9100000002'},{n:'ITC Ltd',d:'Guntur',s:'Tobacco Buyer',ph:'9100000003'}]},
              {title:'🚛 Transport',count:5,items:[{n:'Ramesh Kumar',d:'Guntur',s:'Tata Ace · 3T',ph:'9876501234'},{n:'Venkat Rao',d:'Guntur',s:'Bolero · 2.5T',ph:'9876503456'}]},
              {title:'❄️ Cold Storage',count:3,items:[{n:'Sri Laxmi Cold',d:'Guntur',s:'5000MT · ₹3/day',ph:'9200000001'},{n:'Vijayawada ColdChain',d:'Krishna',s:'8000MT',ph:'9200000002'}]},
              {title:'🏪 Suppliers',count:4,items:[{n:'Raju Agri Store',d:'Guntur',s:'Seeds & Fertilizers',ph:'9876501111'},{n:'AP Agri Suppliers',d:'Krishna',s:'Pesticides',ph:'9876502222'}]},
              {title:'👷 Labour',count:6,items:[{n:'Guntur Kisan Sangha',d:'Guntur',s:'45 workers',ph:'9876500001'},{n:'Kurnool Labourers',d:'Kurnool',s:'40 workers',ph:'9876500005'}]},
            ].map(sec=>(
              <div key={sec.title} style={{...G.glass,padding:18,borderRadius:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.92rem'}}>{sec.title}</span>
                  <span style={{fontSize:'0.72rem',color:'#fbbf24',fontWeight:600}}>{sec.count} total</span>
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

      {tab==='pnl'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>📒 Profit & Loss Notes</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12,marginBottom:16}}>
            {[{i:'📈',v:'₹6.1L',l:'Total Revenue',c:'#4ade80'},{i:'📉',v:'₹1.8L',l:'Expenses',c:'#ef4444'},{i:'💰',v:'₹4.3L',l:'Net Profit',c:'#fbbf24'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12,textAlign:'center'}}>
                <div style={{fontSize:'1.4rem',marginBottom:4}}>{m.i}</div>
                <div style={{fontSize:'1.2rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{...G.glass,borderRadius:14,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:700,color:'#f1f5f9'}}>📋 Transaction Notes</div>
            {[
              {date:'Apr 23',note:'Cotton deal with Deccan Foods — Margin ₹320/Q on 80Q = ₹25,600',type:'income',amt:25600},
              {date:'Apr 22',note:'Paddy brokerage — AP Rice Mills — 150Q × ₹180 margin = ₹27,000',type:'income',amt:27000},
              {date:'Apr 21',note:'Transport cost Guntur→Vijayawada — 2 trips',type:'expense',amt:4200},
              {date:'Apr 20',note:'Market fees + weighing charges — Guntur APMC',type:'expense',amt:1800},
              {date:'Apr 19',note:'Chilli deal advance commission — Venkatesh R',type:'income',amt:28500},
              {date:'Apr 18',note:'Phone/Internet + travel expenses',type:'expense',amt:3500},
            ].map((n,i)=>(
              <div key={i} style={{padding:'12px 18px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:8,height:8,borderRadius:4,background:n.type==='income'?'#4ade80':'#ef4444',flexShrink:0}} />
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.82rem',color:'#f1f5f9'}}>{n.note}</div>
                  <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>{n.date}</div>
                </div>
                <div style={{fontWeight:700,color:n.type==='income'?'#4ade80':'#ef4444',fontSize:'0.88rem'}}>{n.type==='income'?'+':'-'}₹{n.amt.toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='profile'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:16}}>👤 Broker Profile</div>
            {[{l:'Full Name',v:'Rajesh Broker'},{l:'Firm Name',v:'Sri Lakshmi Traders'},{l:'Primary Mandi',v:'Guntur APMC'},{l:'Phone',v:'+91 94400 12345'},{l:'Years Experience',v:'12'},{l:'GSTIN',v:'37AABRL1234H1ZP'}].map(f=>(
              <div key={f.l} style={{marginBottom:12}}>
                <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:5}}>{f.l}</label>
                <input defaultValue={f.v} style={{...inp}}/>
              </div>
            ))}
            <button onClick={()=>flash('✅ Profile saved')} style={{width:'100%',background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700,boxShadow:'0 4px 15px rgba(245,158,11,0.3)'}}>💾 Save Profile</button>
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
      {tab==='connections'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>📇 My Connections</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              {title:'👨‍🌾 Farmers',count:23,items:[{n:'Ramaiah Naidu',d:'Guntur',s:'Cotton · 80Q capacity',ph:'9000000001'},{n:'Lakshmi Devi',d:'Krishna',s:'Paddy · Premium BPT',ph:'9000000002'},{n:'Venkatesh R',d:'Prakasam',s:'Chilli Teja variety',ph:'9000000003'}]},
              {title:'🏪 Suppliers & Buyers',count:11,items:[{n:'Deccan Foods Ltd',d:'Guntur',s:'Cotton & Paddy buyer',ph:'9100000001'},{n:'AP Rice Mills',d:'Krishna',s:'Rice processing',ph:'9100000002'},{n:'ITC Ltd',d:'Guntur',s:'Tobacco & commodity',ph:'9100000003'}]},
              {title:'🏭 Industries',count:5,items:[{n:'Nagarjuna Fertilizers',d:'Guntur',s:'Bulk buyer · fertilizers',ph:'9200000001'},{n:'KCP Sugar Mills',d:'Krishna',s:'Sugarcane processing',ph:'9200000002'}]},
              {title:'🚛 Transport',count:8,items:[{n:'Ramesh Kumar',d:'Guntur',s:'Tata Ace · 3T',ph:'9876501234'},{n:'Narasimha Murthy',d:'Prakasam',s:'Eicher Pro · 7T',ph:'9876504567'},{n:'Srinivas Goud',d:'Anantapur',s:'Bharatbenz · 16T',ph:'9876506789'}]},
              {title:'👷 Labour',count:4,items:[{n:'Guntur Kisan Mazdoor Sangha',d:'Guntur',s:'45 workers · harvesting',ph:'9876500001'},{n:'Ongole Farm Workers',d:'Prakasam',s:'50 workers · digging',ph:'9876500004'}]},
              {title:'❄️ Cold Storage',count:3,items:[{n:'Sri Lakshmi Cold Storage',d:'Guntur',s:'5000 MT · Multi-chamber',ph:'9876543210'},{n:'AP Agri Cold Chain Hub',d:'Krishna',s:'12000 MT · Blast freezer',ph:'9876543211'}]},
            ].map(sec=>(
              <div key={sec.title} style={{...G.glass,padding:18,borderRadius:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.92rem'}}>{sec.title}</span>
                  <span style={{fontSize:'0.72rem',color:'#fbbf24',fontWeight:600}}>{sec.count} total</span>
                </div>
                {sec.items.map(it=>(
                  <div key={it.n} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{it.n}</div>
                      <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>📍 {it.d} · {it.s}</div>
                    </div>
                    <button onClick={()=>window.open('tel:'+it.ph)} style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:6,padding:'3px 8px',color:'#fbbf24',cursor:'pointer',fontSize:'0.68rem'}}>📞</button>
                    <button onClick={()=>window.open('https://wa.me/91'+it.ph)} style={{background:'rgba(245,158,11,0.1)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:6,padding:'3px 8px',color:'#fbbf24',cursor:'pointer',fontSize:'0.68rem'}}>💬</button>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
      {toast&&<div style={{position:'fixed',bottom:24,right:24,background:'linear-gradient(135deg,#1e293b,#0f172a)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:14,padding:'14px 24px',color:'#4ade80',fontWeight:600,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>{toast}</div>}
    </div>
  );
}
