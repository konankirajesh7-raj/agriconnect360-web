import React,{useState,useEffect}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{supabase}from '../lib/supabase';

const TABS=[{id:'overview',icon:'📊',label:'Overview'},{id:'users',icon:'👥',label:'Users'},{id:'photos',icon:'📸',label:'Photos'},{id:'moderation',icon:'🛡️',label:'Moderation'},{id:'analytics',icon:'📈',label:'Analytics'},{id:'support',icon:'🎧',label:'Support'},{id:'broadcast',icon:'📢',label:'Broadcast'},{id:'config',icon:'⚙️',label:'Config'},{id:'audit',icon:'📋',label:'Audit Log'}];
const RC={farmer:'success',customer:'info',industrial:'info',broker:'warn',supplier:'info',labour:'warn',admin:'danger'};

export default function AdminDashboardPage(){
  const{isAdmin}=useAuth();
  const[tab,setTab]=useState('overview');
  const[filterRole,setFilterRole]=useState('All');
  const[userCount,setUserCount]=useState(null);
  const[users,setUsers]=useState([
    {id:1,name:'Rajesh Kumar',phone:'9000000001',role:'farmer',district:'Guntur',status:'Active',joined:'2025-06-15',verified:true},
    {id:2,name:'SV Cotton Industries',phone:'9000000005',role:'industrial',district:'Guntur',status:'Active',joined:'2025-08-20',verified:true},
    {id:3,name:'Krishna Agri Traders',phone:'9000000004',role:'broker',district:'Krishna',status:'Active',joined:'2025-09-10',verified:true},
    {id:4,name:'Sri Sai Agri Centre',phone:'9000000003',role:'supplier',district:'Guntur',status:'Active',joined:'2025-07-05',verified:false},
    {id:5,name:'AP Labour Union',phone:'9000000006',role:'labour',district:'Prakasam',status:'Active',joined:'2025-10-01',verified:true},
    {id:6,name:'Priya Reddy',phone:'9000000002',role:'farmer',district:'Nellore',status:'Active',joined:'2026-01-12',verified:false},
  ]);
  const[search,setSearch]=useState('');
  const[toast,setToast]=useState('');
  const[tickets,setTickets]=useState([
    {id:'TK-001',subject:'Cannot view market prices',user:'Rajesh Kumar',role:'farmer',priority:'High',status:'Open',date:'2026-04-22',replies:[]},
    {id:'TK-002',subject:'Payment not received',user:'Lakshmi Devi',role:'farmer',priority:'Critical',status:'In Progress',date:'2026-04-21',replies:['We are looking into this.']},
    {id:'TK-003',subject:'Product listing rejected',user:'Sri Sai Agri',role:'supplier',priority:'Medium',status:'Resolved',date:'2026-04-20',replies:['Fixed.']},
  ]);
  const[replyText,setReplyText]=useState('');
  const[replyId,setReplyId]=useState(null);
  const[flags,setFlags]=useState({Gamification:true,'Premium Module':true,'Drone Reports':true,'WhatsApp Bot':false,'IoT Integration':true});
  const[bcForm,setBcForm]=useState({title:'',message:'',target:'All Farmers',channel:'In-App'});
  const[audit,setAudit]=useState([
    {time:'Apr 27, 10:15 AM',action:'System initialized',by:'System'},
    {time:'Apr 27, 09:00 AM',action:'Admin login',by:'Admin'},
  ]);
  const[modItems,setModItems]=useState([
    {id:1,user:'Anonymous',content:'Spam: Buy cheap seeds at...',type:'Community Post',status:'Pending'},
    {id:2,user:'User #342',content:'Offensive language in Q&A',type:'Q&A Answer',status:'Pending'},
    {id:3,user:'Supplier #12',content:'Misleading product description',type:'Product Listing',status:'Pending'},
  ]);
  function flash(m){setToast(m);setTimeout(()=>setToast(''),2500);}
  function addAudit(action){setAudit(p=>[{time:new Date().toLocaleString('en-IN',{month:'short',day:'numeric',hour:'numeric',minute:'2-digit'}),action,by:'Admin'},...p]);}

  // ── Background Photos Management ──
  const[bgPhotos,setBgPhotos]=useState([]);
  const[bgLoading,setBgLoading]=useState(false);
  const[bgFilter,setBgFilter]=useState('all'); // all, pending, approved, rejected, featured

  const TEST_PHOTOS=[
    {uploader_role:'farmer',uploader_name:'Ramesh Naidu',uploader_district:'Guntur',uploader_village:'Tenali',photo_url:'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=600',thumbnail_url:'https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=300',caption:'Golden paddy ready for harvest 🌾',category:'crop_harvest',display_type:'local',status:'pending',is_promotion:false,visible_to_roles:['farmer']},
    {uploader_role:'supplier',uploader_name:'AP Seeds Ltd',uploader_district:'Krishna',uploader_village:'Vijayawada',photo_url:'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=600',thumbnail_url:'https://images.pexels.com/photos/1459339/pexels-photo-1459339.jpeg?auto=compress&w=300',caption:'Premium Hybrid Seeds — 20% Off!',category:'promotion',display_type:'district',status:'pending',is_promotion:true,visible_to_roles:['farmer','supplier','broker']},
    {uploader_role:'labour',uploader_name:'Farm Labour Union',uploader_district:'Prakasam',uploader_village:'Ongole',photo_url:'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=600',thumbnail_url:'https://images.pexels.com/photos/2933243/pexels-photo-2933243.jpeg?auto=compress&w=300',caption:'Harvest workers available — Book now',category:'labour_work',display_type:'district',status:'pending',is_promotion:false,visible_to_roles:['farmer']},
    {uploader_role:'factory',uploader_name:'Srinivas Cotton Mill',uploader_district:'Anantapur',uploader_village:'',photo_url:'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=600',thumbnail_url:'https://images.pexels.com/photos/2252584/pexels-photo-2252584.jpeg?auto=compress&w=300',caption:'Now buying Grade-A cotton bales',category:'factory_product',display_type:'statewide',status:'pending',is_promotion:true,visible_to_roles:['farmer','broker','industrial']},
  ];

  async function fetchBgPhotos(){
    setBgLoading(true);
    try{
      const{data,error}=await supabase.from('background_photos').select('*').order('created_at',{ascending:false}).limit(100);
      if(!error&&data)setBgPhotos(data);
      else setBgPhotos([]);
    }catch{setBgPhotos([]);}
    finally{setBgLoading(false);}
  }

  async function updatePhotoStatus(id,status){
    const{error}=await supabase.from('background_photos').update({status,reviewed_at:new Date().toISOString()}).eq('id',id);
    if(!error){
      setBgPhotos(p=>p.map(x=>x.id===id?{...x,status,reviewed_at:new Date().toISOString()}:x));
      addAudit(`Photo ${status}: ID ${String(id).slice(0,8)}`);
      flash(`${status==='approved'?'✅ Approved':status==='featured'?'⭐ Featured':status==='rejected'?'❌ Rejected':'📸 Updated'}`);
    }else{flash('❌ Error: '+error.message);}
  }

  async function deletePhoto(id){
    const{error}=await supabase.from('background_photos').delete().eq('id',id);
    if(!error){
      setBgPhotos(p=>p.filter(x=>x.id!==id));
      addAudit(`Photo deleted: ID ${String(id).slice(0,8)}`);
      flash('🗑️ Photo deleted');
    }else{flash('❌ Error: '+error.message);}
  }

  async function seedTestPhotos(){
    flash('⏳ Seeding 4 test photos...');
    let success=0;
    for(const tp of TEST_PHOTOS){
      const{error}=await supabase.from('background_photos').insert(tp);
      if(!error)success++;
      else console.warn('Seed error:',error.message);
    }
    addAudit(`Seeded ${success} test photos`);
    flash(`📸 ${success}/4 test photos seeded!`);
    fetchBgPhotos();
  }

  useEffect(()=>{if(tab==='photos')fetchBgPhotos();},[tab]);
  useEffect(()=>{supabase.from('profiles').select('id',{count:'exact',head:true}).then(({count})=>{if(count!=null)setUserCount(count)});},[]);

  const filtered=users.filter(u=>(filterRole==='All'||u.role===filterRole)&&(search===''||u.name.toLowerCase().includes(search.toLowerCase())||u.phone.includes(search)));

  const filteredPhotos=bgPhotos.filter(p=>bgFilter==='all'||p.status===bgFilter);

  return(
    <div className="animated">
      <div className="section-header"><div className="section-title">🛡️ Admin Dashboard</div><div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Platform management & control center</div></div>

      <div className="prem-tab-row">{TABS.map(t=>(<button key={t.id} className={`prem-tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}><span className="prem-tab-icon">{t.icon}</span>{t.label}</button>))}</div>

      {tab==='overview'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">📊 Platform Overview</div>
        <div className="role-grid-3" style={{marginBottom:16}}>
          {[{i:'👥',v:userCount||'5,000+',l:'Total Users'},{i:'🟢',v:'1,247',l:'Active Today'},{i:'📈',v:'142',l:'New This Week'},{i:'💰',v:'₹12.4L',l:'Revenue MTD'},{i:'🎫',v:tickets.filter(t=>t.status==='Open').length,l:'Open Tickets'},{i:'⭐',v:'4.7',l:'Platform Rating'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value">{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>
      </div>)}

      {tab==='users'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">👥 User Management</div>
        <div className="role-filter-bar">
          <select className="role-select" value={filterRole} onChange={e=>setFilterRole(e.target.value)}><option>All</option><option value="farmer">Farmer</option><option value="customer">Customer</option><option value="industrial">Industrial</option><option value="broker">Broker</option><option value="supplier">Supplier</option><option value="labour">Labour</option></select>
          <input className="role-input" placeholder="Search name or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:220}}/>
          <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>{userCount!=null?userCount+' in DB':''}</span>
          <button className="btn btn-outline" onClick={()=>{const h='Name,Role,District,Status,Verified,Phone\n';const r=users.map(u=>u.name+','+u.role+','+u.district+','+u.status+','+u.verified+','+u.phone).join('\n');const b=new Blob([h+r],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='users.csv';a.click();flash('📥 CSV exported')}} style={{padding:'7px 14px',fontSize:'0.78rem',marginLeft:'auto'}}>📥 Export</button>
        </div>
        <div className="role-table-wrap"><table className="role-table"><thead><tr><th>#</th><th>Name</th><th>Phone</th><th>Role</th><th>District</th><th>Status</th><th>Verified</th><th>Actions</th></tr></thead><tbody>
          {filtered.map(u=>(<tr key={u.id}>
            <td>{u.id}</td><td><b>{u.name}</b></td><td>{u.phone}</td>
            <td><span className={`role-badge ${RC[u.role]||'info'}`}>{u.role}</span></td>
            <td>{u.district}</td>
            <td><span className={`role-badge ${u.status==='Active'?'success':u.status==='Suspended'?'danger':'warn'}`}>{u.status}</span></td>
            <td>{u.verified?'✅':'❌'}</td>
            <td style={{display:'flex',gap:4}}>
              {!u.verified&&<button className="btn btn-primary" onClick={()=>{setUsers(p=>p.map(x=>x.id===u.id?{...x,verified:true}:x));addAudit('User verified: '+u.name);flash('✅ '+u.name+' verified')}} style={{padding:'3px 8px',fontSize:'0.68rem'}}>Verify</button>}
              <button className="btn btn-outline" onClick={()=>{const ns=u.status==='Active'?'Suspended':'Active';setUsers(p=>p.map(x=>x.id===u.id?{...x,status:ns}:x));addAudit('User '+(ns==='Suspended'?'suspended':'unsuspended')+': '+u.name);flash(ns==='Suspended'?'🚫 '+u.name+' suspended':'✅ '+u.name+' activated')}} style={{padding:'3px 8px',fontSize:'0.68rem'}}>{u.status==='Active'?'Suspend':'Activate'}</button>
            </td>
          </tr>))}
        </tbody></table></div>
      </div>)}

      {/* ═══ BACKGROUND PHOTOS APPROVAL TAB ═══ */}
      {tab==='photos'&&(<div className="card" style={{padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',flexWrap:'wrap',gap:10,marginBottom:16}}>
          <div className="role-section-title" style={{margin:0}}>📸 Background Photo Approvals</div>
          <div style={{display:'flex',gap:8,flexWrap:'wrap'}}>
            <button className="btn btn-outline" onClick={fetchBgPhotos} style={{padding:'6px 14px',fontSize:'0.75rem'}}>🔄 Refresh</button>
            <button className="btn btn-primary" onClick={seedTestPhotos} style={{padding:'6px 14px',fontSize:'0.75rem',background:'linear-gradient(135deg,#f59e0b,#d97706)'}}>🧪 Seed 4 Test Photos</button>
          </div>
        </div>

        {/* Stats row */}
        <div className="role-grid-3" style={{marginBottom:16}}>
          {[
            {i:'⏳',v:bgPhotos.filter(p=>p.status==='pending').length,l:'Pending Review',c:'#f59e0b'},
            {i:'✅',v:bgPhotos.filter(p=>p.status==='approved').length,l:'Approved',c:'#22c55e'},
            {i:'⭐',v:bgPhotos.filter(p=>p.status==='featured').length,l:'Featured',c:'#3b82f6'},
            {i:'❌',v:bgPhotos.filter(p=>p.status==='rejected').length,l:'Rejected',c:'#ef4444'},
            {i:'📸',v:bgPhotos.length,l:'Total Photos',c:'#8b5cf6'},
            {i:'📢',v:bgPhotos.filter(p=>p.is_promotion).length,l:'Promotions',c:'#06b6d4'},
          ].map(m=>(<div key={m.l} className="role-metric-card" style={{cursor:'pointer',border:bgFilter===(m.l==='Total Photos'?'all':m.l==='Pending Review'?'pending':m.l.toLowerCase())?`2px solid ${m.c}`:'2px solid transparent'}} onClick={()=>setBgFilter(m.l==='Total Photos'?'all':m.l==='Pending Review'?'pending':m.l.toLowerCase())}><div className="metric-icon">{m.i}</div><div className="metric-value" style={{color:m.c}}>{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>

        {/* Filter bar */}
        <div className="role-filter-bar" style={{marginBottom:14}}>
          {['all','pending','approved','featured','rejected'].map(f=>(<button key={f} className={`role-badge ${bgFilter===f?(f==='pending'?'warn':f==='approved'?'success':f==='featured'?'info':'danger'):'info'}`} style={{cursor:'pointer',padding:'5px 14px',border:'none',opacity:bgFilter===f?1:0.5}} onClick={()=>setBgFilter(f)}>{f==='all'?'📋 All':f==='pending'?'⏳ Pending':f==='approved'?'✅ Approved':f==='featured'?'⭐ Featured':'❌ Rejected'}</button>))}
        </div>

        {bgLoading?(<div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>⏳ Loading photos from Supabase...</div>)
        :filteredPhotos.length===0?(<div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>
          <div style={{fontSize:40,marginBottom:8}}>📭</div>
          <div>No {bgFilter!=='all'?bgFilter+' ':''} photos found.</div>
          <div style={{fontSize:'0.75rem',marginTop:6}}>Click "🧪 Seed 4 Test Photos" to auto-submit test photos from different roles & localities.</div>
        </div>)
        :(<div className="role-table-wrap"><table className="role-table"><thead><tr>
          <th>Preview</th><th>Uploader</th><th>Role</th><th>District / Village</th><th>Caption</th><th>Category</th><th>Visibility</th><th>Status</th><th>Actions</th>
        </tr></thead><tbody>
          {filteredPhotos.map(p=>(<tr key={p.id}>
            <td><img src={p.thumbnail_url||p.photo_url} alt="" style={{width:60,height:40,objectFit:'cover',borderRadius:6,border:'1px solid var(--border)'}}/></td>
            <td><b>{p.uploader_name||'Unknown'}</b></td>
            <td><span className={`role-badge ${RC[p.uploader_role]||'info'}`}>{p.uploader_role}</span></td>
            <td><div style={{fontSize:'0.78rem'}}>{p.uploader_district||'—'}</div><div style={{fontSize:'0.68rem',color:'var(--text-muted)'}}>{p.uploader_village||''}</div></td>
            <td style={{maxWidth:180,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.caption||'—'}</td>
            <td><span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:8,background:'var(--surface)',color:'var(--text-secondary)'}}>{p.category}</span></td>
            <td><span style={{fontSize:'0.72rem'}}>{p.display_type==='local'?'🏠 Local':p.display_type==='district'?'📍 District':p.display_type==='statewide'?'🌍 State':p.display_type==='promotion'?'📢 Promo':p.display_type}</span></td>
            <td><span className={`role-badge ${p.status==='approved'?'success':p.status==='featured'?'info':p.status==='rejected'?'danger':'warn'}`}>{p.status}</span></td>
            <td>
              <div style={{display:'flex',gap:4,flexWrap:'wrap'}}>
                {p.status==='pending'&&<><button className="btn btn-primary" onClick={()=>updatePhotoStatus(p.id,'approved')} style={{padding:'3px 8px',fontSize:'0.66rem'}}>✅ Approve</button><button className="btn btn-outline" onClick={()=>updatePhotoStatus(p.id,'rejected')} style={{padding:'3px 8px',fontSize:'0.66rem',color:'#ef4444'}}>❌ Reject</button></>}
                {(p.status==='approved')&&<button className="btn btn-outline" onClick={()=>updatePhotoStatus(p.id,'featured')} style={{padding:'3px 8px',fontSize:'0.66rem',color:'#3b82f6'}}>⭐ Feature</button>}
                {p.status==='featured'&&<button className="btn btn-outline" onClick={()=>updatePhotoStatus(p.id,'approved')} style={{padding:'3px 8px',fontSize:'0.66rem'}}>↩ Unfeature</button>}
                {p.status==='rejected'&&<button className="btn btn-outline" onClick={()=>updatePhotoStatus(p.id,'approved')} style={{padding:'3px 8px',fontSize:'0.66rem',color:'#22c55e'}}>♻️ Re-approve</button>}
                <button className="btn btn-outline" onClick={()=>deletePhoto(p.id)} style={{padding:'3px 8px',fontSize:'0.66rem',color:'#ef4444'}}>🗑️</button>
              </div>
            </td>
          </tr>))}
        </tbody></table></div>)}
      </div>)}

      {tab==='moderation'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">🛡️ Content Moderation</div>
        <div className="role-grid-3" style={{marginBottom:14}}>
          {[{i:'📝',v:modItems.filter(m=>m.status==='Pending').length,l:'Pending Review'},{i:'✅',v:modItems.filter(m=>m.status==='Approved').length,l:'Approved'},{i:'🗑️',v:modItems.filter(m=>m.status==='Deleted').length,l:'Deleted'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value">{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>
        {modItems.map(m=>(<div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 0',borderBottom:'1px solid var(--border)',fontSize:'0.82rem'}}>
          <div><div><b>{m.type}</b> — {m.content}</div><div style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>by {m.user}</div></div>
          <div style={{display:'flex',gap:4}}>
            {m.status==='Pending'?(<>
              <button className="btn btn-primary" onClick={()=>{setModItems(p=>p.map(x=>x.id===m.id?{...x,status:'Approved'}:x));addAudit('Content approved: '+m.type);flash('✅ Approved')}} style={{padding:'4px 10px',fontSize:'0.7rem'}}>Approve</button>
              <button className="btn btn-outline" onClick={()=>{setModItems(p=>p.map(x=>x.id===m.id?{...x,status:'Deleted'}:x));addAudit('Content deleted: '+m.type);flash('🗑️ Deleted')}} style={{padding:'4px 10px',fontSize:'0.7rem',color:'#ef4444'}}>Delete</button>
            </>):(<span className={`role-badge ${m.status==='Approved'?'success':'danger'}`}>{m.status}</span>)}
          </div>
        </div>))}
      </div>)}

      {tab==='analytics'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">📈 Platform Analytics</div>
        <div className="role-grid-3">
          {[{i:'👥',v:userCount||'5,000+',l:'Total Users'},{i:'📈',v:'1,247',l:'Daily Active'},{i:'🔄',v:'68%',l:'7-Day Retention'},{i:'💰',v:'₹12.4L',l:'Revenue MTD'},{i:'🌤️',v:'Weather',l:'Most Used Feature'},{i:'🗺️',v:'13',l:'Districts Active'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value">{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>
        <div className="role-grid-2" style={{marginTop:14}}>
          <div className="role-panel"><div className="panel-title">Users by Role</div>
            {[{role:'Farmers',count:4823,pct:89},{role:'Suppliers',count:234,pct:4},{role:'Brokers',count:178,pct:3},{role:'Industrial',count:89,pct:2},{role:'Labour',count:67,pct:1}].map(r=>(<div key={r.role} style={{marginBottom:8}}><div style={{display:'flex',justifyContent:'space-between',fontSize:'0.82rem',marginBottom:3}}><span>{r.role}</span><b>{r.count} ({r.pct}%)</b></div><div className="role-progress-bar"><div className="fill ok" style={{width:r.pct+'%'}}/></div></div>))}
          </div>
          <div className="role-panel"><div className="panel-title">Top Features</div>
            {[{f:'Weather Forecast',h:12450},{f:'Market Prices',h:9870},{f:'AI Advisory',h:6230},{f:'Crop Tracking',h:5100},{f:'Expense Tracker',h:4320}].map(x=>(<div key={x.f} className="role-stat-row"><span>{x.f}</span><b>{x.h.toLocaleString()} hits</b></div>))}
            <button className="btn btn-outline" onClick={()=>{const b=new Blob(['AgriConnect360 Analytics Report\n\nTotal Users: '+(userCount||5000)+'\nDAU: 1,247\nRetention: 68%\nRevenue: ₹12.4L'],{type:'application/pdf'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='analytics_report.pdf';a.click();flash('📥 Report exported')}} style={{marginTop:10,padding:'8px 14px',fontSize:'0.78rem',width:'100%'}}>📥 Export Analytics Report</button>
          </div>
        </div>
      </div>)}

      {tab==='support'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">🎧 Support Tickets</div>
        <div className="role-summary-bar" style={{marginBottom:16}}>
          <div className="role-summary-item"><div className="label">Open</div><div className="value" style={{color:'#ef4444'}}>{tickets.filter(t=>t.status==='Open').length}</div></div>
          <div className="role-summary-item"><div className="label">In Progress</div><div className="value" style={{color:'#fbbf24'}}>{tickets.filter(t=>t.status==='In Progress').length}</div></div>
          <div className="role-summary-item"><div className="label">Resolved</div><div className="value" style={{color:'#34d399'}}>{tickets.filter(t=>t.status==='Resolved').length}</div></div>
        </div>
        {tickets.map(t=>(<div key={t.id} style={{border:'1px solid var(--border)',borderRadius:12,padding:14,marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <div><code>{t.id}</code> <b style={{marginLeft:6}}>{t.subject}</b></div>
            <span className={`role-badge ${t.status==='Resolved'?'success':t.status==='Open'?'danger':'warn'}`}>{t.status}</span>
          </div>
          <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:6}}>{t.user} · {t.role} · {t.priority} · {t.date}</div>
          {t.replies.length>0&&<div style={{background:'var(--surface)',borderRadius:8,padding:8,marginBottom:6,fontSize:'0.78rem'}}>{t.replies.map((r,i)=><div key={i} style={{color:'var(--text-secondary)'}}>💬 Admin: {r}</div>)}</div>}
          {t.status!=='Resolved'&&(<div style={{display:'flex',gap:6,marginTop:6}}>
            {replyId===t.id?(<>
              <input className="role-input" placeholder="Type reply..." value={replyText} onChange={e=>setReplyText(e.target.value)} style={{flex:1}}/>
              <button className="btn btn-primary" onClick={()=>{setTickets(p=>p.map(x=>x.id===t.id?{...x,replies:[...x.replies,replyText],status:'In Progress'}:x));setReplyId(null);setReplyText('');addAudit('Ticket reply: '+t.id);flash('💬 Reply sent')}} style={{padding:'5px 12px',fontSize:'0.72rem'}}>Send</button>
            </>):(<>
              <button className="btn btn-outline" onClick={()=>setReplyId(t.id)} style={{padding:'5px 10px',fontSize:'0.72rem'}}>💬 Reply</button>
              <button className="btn btn-primary" onClick={()=>{setTickets(p=>p.map(x=>x.id===t.id?{...x,status:'Resolved'}:x));addAudit('Ticket resolved: '+t.id);flash('✅ Ticket resolved')}} style={{padding:'5px 10px',fontSize:'0.72rem'}}>✅ Resolve</button>
            </>)}
          </div>)}
        </div>))}
      </div>)}

      {tab==='broadcast'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">📢 Send Broadcast</div>
        <div style={{maxWidth:500}}>
          {[{l:'Title',k:'title',ph:'Test Announcement'},{l:'Message',k:'message',ph:'Maintenance Sunday 2AM-4AM'}].map(f=>(<div key={f.k} className="role-field-group"><label>{f.l}</label><input className="role-input" placeholder={f.ph} value={bcForm[f.k]} onChange={e=>setBcForm(p=>({...p,[f.k]:e.target.value}))}/></div>))}
          <div className="role-field-group"><label>Target</label><select className="role-select" value={bcForm.target} onChange={e=>setBcForm(p=>({...p,target:e.target.value}))}><option>All Farmers</option><option>All Users</option><option>Suppliers</option><option>Brokers</option></select></div>
          <div className="role-field-group"><label>Channel</label><select className="role-select" value={bcForm.channel} onChange={e=>setBcForm(p=>({...p,channel:e.target.value}))}><option>In-App</option><option>SMS</option><option>Both</option></select></div>
          <button className="btn btn-primary" onClick={()=>{if(!bcForm.title)return;addAudit('Broadcast sent: "'+bcForm.title+'" to '+bcForm.target);flash('📢 Broadcast sent to '+bcForm.target+'!');setBcForm({title:'',message:'',target:'All Farmers',channel:'In-App'})}} style={{marginTop:8,padding:'10px 20px',fontSize:'0.82rem'}}>📢 Send Broadcast</button>
        </div>
      </div>)}

      {tab==='config'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">⚙️ System Configuration</div>
        <div className="role-grid-2">
          <div className="role-panel"><div className="panel-title">Feature Flags</div>
            {Object.entries(flags).map(([name,on])=>(<div key={name} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'8px 0',borderBottom:'1px solid var(--border)',fontSize:'0.82rem'}}>
              <span>{name}</span>
              <button onClick={()=>{setFlags(p=>({...p,[name]:!p[name]}));addAudit('Feature '+(on?'disabled':'enabled')+': '+name);flash((on?'❌ ':'✅ ')+name+(on?' disabled':' enabled'))}} className={`role-badge ${on?'success':'danger'}`} style={{cursor:'pointer',border:'none'}}>{on?'Enabled':'Disabled'}</button>
            </div>))}
          </div>
          <div className="role-panel"><div className="panel-title">Crop Database</div>
            <div className="role-stat-row"><span>Total Crops</span><b>127</b></div>
            <div className="role-stat-row"><span>Categories</span><b>14</b></div>
            <div className="role-stat-row"><span>MSP Updated</span><b>Apr 2026</b></div>
            <button className="btn btn-outline" onClick={()=>flash('📝 Add Crop form - coming soon')} style={{marginTop:10,width:'100%',padding:'8px'}}>➕ Add Crop</button>
            <div className="panel-title" style={{marginTop:16}}>Pricing</div>
            {[{l:'Premium Monthly',v:99},{l:'Premium Yearly',v:999},{l:'Broker Commission %',v:3}].map(p=>(<div key={p.l} className="role-field-group"><label>{p.l}</label><input className="role-input" type="number" defaultValue={p.v}/></div>))}
            <button className="btn btn-primary" onClick={()=>{addAudit('Configuration saved');flash('💾 Config saved')}} style={{marginTop:8,width:'100%',padding:'9px'}}>💾 Save</button>
          </div>
        </div>
      </div>)}

      {tab==='audit'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">📋 Audit Log</div>
        <div className="role-section-desc">All admin actions recorded with timestamps</div>
        <div className="role-table-wrap"><table className="role-table"><thead><tr><th>Time</th><th>Action</th><th>By</th></tr></thead><tbody>
          {audit.map((a,i)=>(<tr key={i}><td style={{whiteSpace:'nowrap'}}>{a.time}</td><td>{a.action}</td><td><span className="role-badge warn">{a.by}</span></td></tr>))}
        </tbody></table></div>
      </div>)}

      {toast&&<div style={{position:'fixed',bottom:24,right:24,background:'linear-gradient(135deg,#1e293b,#0f172a)',border:'1px solid rgba(34,197,94,0.3)',borderRadius:14,padding:'14px 24px',color:'#4ade80',fontWeight:600,zIndex:9999,boxShadow:'0 8px 32px rgba(0,0,0,0.4)'}}>{toast}</div>}
    </div>
  );
}
