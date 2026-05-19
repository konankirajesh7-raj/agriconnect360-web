import React,{useState,useEffect}from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';
import{useAuth}from '../lib/hooks/useAuth';
import{supabase}from '../lib/supabase';


const TABS=[
  {id:'overview',icon:'📊',label:'Overview'},
  {id:'ads',icon:'📢',label:'Ads'},
  {id:'users',icon:'👥',label:'Users'},
  {id:'posts',icon:'📝',label:'Posts'},
  {id:'market',icon:'🏪',label:'Market'},
  {id:'disputes',icon:'⚖️',label:'Disputes'},
  {id:'payments',icon:'💳',label:'Payments'},
  {id:'messages',icon:'💬',label:'Messages'},
  {id:'photos',icon:'📸',label:'Photos'},
  {id:'moderation',icon:'🛡️',label:'Moderation'},
  {id:'analytics',icon:'📈',label:'Analytics'},
  {id:'support',icon:'🎧',label:'Support'},
  {id:'broadcast',icon:'📡',label:'Broadcast'},
  {id:'config',icon:'⚙️',label:'Settings'},
  {id:'audit',icon:'📋',label:'Audit Log'},
];
const RC={farmer:'success',customer:'info',industrial:'info',broker:'warn',supplier:'info',labour:'warn',admin:'danger'};

export default function AdminDashboardPage(){
  const { t, tx } = useLanguage();

// ── Payment Config Sub-Component ──
function PaymentConfigPanel({ flash, addAudit }) {
  const [cfg, setCfg] = useState({ upi_id:'', phone:'', merchant_name:'RythuSphere', coupon_code:'AGRI360FREE', support_email:'', farmer_price:50, others_price:100, trial_days:180 });
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('payment_config').select('*').eq('id','default').single();
        if (data) setCfg({ upi_id:data.upi_id||'', phone:data.phone||'', merchant_name:data.merchant_name||'RythuSphere', coupon_code:data.coupon_code||'AGRI360FREE', support_email:data.support_email||'', farmer_price:data.farmer_price??50, others_price:data.others_price??100, trial_days:data.trial_days??180 });
      } catch {}
      // Fallback: load from env
      if (!cfg.upi_id) setCfg(p => ({ ...p, upi_id:import.meta.env.VITE_UPI_ID||'', phone:import.meta.env.VITE_MERCHANT_PHONE||'', support_email:import.meta.env.VITE_SUPPORT_EMAIL||'', coupon_code:import.meta.env.VITE_COUPON_CODE||'AGRI360FREE', farmer_price:Number(import.meta.env.VITE_FARMER_PRICE)||50, others_price:Number(import.meta.env.VITE_OTHERS_PRICE)||100 }));
      setLoaded(true);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.from('payment_config').upsert({ id:'default', upi_id:cfg.upi_id, phone:cfg.phone, merchant_name:cfg.merchant_name, coupon_code:cfg.coupon_code, support_email:cfg.support_email, farmer_price:Number(cfg.farmer_price), others_price:Number(cfg.others_price), trial_days:Number(cfg.trial_days), updated_at:new Date().toISOString() });
      if (error) throw error;
      addAudit('Payment config updated');
      flash('💰 Payment config saved to database!');
    } catch (e) {
      // Fallback: save to localStorage
      localStorage.setItem('rythu_payment_config', JSON.stringify(cfg));
      addAudit('Payment config saved (local)');
      flash('💾 Payment config saved locally (DB unavailable)');
    }
    setSaving(false);
  };

  if (!loaded) return null;
  const fld = (label, key, type='text', placeholder='') => (
    <div className="role-field-group"><label>{label}</label><input className="role-input" type={type} value={cfg[key]} placeholder={placeholder} onChange={e => setCfg(p => ({...p, [key]: type==='number' ? Number(e.target.value) : e.target.value}))} /></div>
  );

  return (
    <div style={{marginTop:20}}>
      <div className="role-section-title">💰 Payment & Subscription Config</div>
      <div className="role-section-desc">These values are used on the Payment Page. Changes apply instantly for all users.</div>
      <div className="role-grid-2" style={{marginTop:12}}>
        <div className="role-panel">
          <div className="panel-title">UPI Payment Details</div>
          {fld('UPI ID', 'upi_id', 'text', 'yourname@upi')}
          {fld('Merchant Phone', 'phone', 'text', '9999999999')}
          {fld('Merchant Name', 'merchant_name', 'text', 'RythuSphere')}
          {fld('Support Email', 'support_email', 'email', 'support@example.com')}
        </div>
        <div className="role-panel">
          <div className="panel-title">Subscription Settings</div>
          {fld('Coupon Code', 'coupon_code', 'text', 'AGRI360FREE')}
          {fld('Farmer Plan Price (₹)', 'farmer_price', 'number')}
          {fld('Others Plan Price (₹)', 'others_price', 'number')}
          {fld('Free Trial Days', 'trial_days', 'number')}
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{marginTop:12,padding:'11px 28px',fontSize:'0.85rem'}}>{saving ? '⏳ Saving...' : '💾 Save Payment Config'}</button>
    </div>
  );
}

// ── Admin Credentials Sub-Component ──
function AdminCredentialsPanel({ flash, addAudit }) {
  const [creds, setCreds] = useState({ admin_username: '', admin_password: '' });
  const [newPass, setNewPass] = useState('');
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('admin_config').select('admin_username, admin_password').eq('id', 'default').single();
        if (data) setCreds({ admin_username: data.admin_username || 'admin', admin_password: data.admin_password || '' });
      } catch {}
      setLoaded(true);
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const updates = { id: 'default', admin_username: creds.admin_username.trim().toLowerCase(), admin_password: newPass || creds.admin_password, updated_at: new Date().toISOString() };
    if (!updates.admin_username || !updates.admin_password) { flash('⚠️ Username and password cannot be empty'); setSaving(false); return; }
    if (updates.admin_password.length < 6) { flash('⚠️ Password must be at least 6 characters'); setSaving(false); return; }
    try {
      const { error } = await supabase.from('admin_config').upsert(updates);
      if (error) throw error;
      setCreds({ admin_username: updates.admin_username, admin_password: updates.admin_password });
      setNewPass('');
      addAudit('Admin credentials updated');
      flash('🔐 Admin credentials saved securely!');
    } catch (e) {
      flash('❌ Failed to save — check Supabase admin_config table exists');
    }
    setSaving(false);
  };

  if (!loaded) return null;
  return (
    <div style={{marginTop:20}}>
      <div className="role-section-title">🔐 Admin Login Credentials</div>
      <div className="role-section-desc">Change the admin username and password used to access this dashboard. Stored securely in Supabase.</div>
      <div className="role-grid-2" style={{marginTop:12}}>
        <div className="role-panel">
          <div className="panel-title">Current Credentials</div>
          <div className="role-field-group"><label>Username</label><input className="role-input" type="text" value={creds.admin_username} onChange={e => setCreds(p => ({...p, admin_username: e.target.value}))} /></div>
          <div className="role-field-group">
            <label>Current Password</label>
            <div style={{display:'flex',gap:6}}>
              <input className="role-input" type={showPass?'text':'password'} value={creds.admin_password} readOnly style={{flex:1,opacity:0.7}} />
              <button className="btn btn-outline" onClick={() => setShowPass(p => !p)} style={{padding:'6px 10px',fontSize:'0.78rem'}}>{showPass ? '🙈' : '👁️'}</button>
            </div>
          </div>
        </div>
        <div className="role-panel">
          <div className="panel-title">Change Password</div>
          <div className="role-field-group"><label>New Password (min 6 chars)</label><input className="role-input" type="password" value={newPass} placeholder="Leave blank to keep current" onChange={e => setNewPass(e.target.value)} /></div>
          <div style={{fontSize:'0.75rem',color:'var(--text-muted)',marginTop:4}}>⚠️ Remember your new password — there is no recovery option.</div>
        </div>
      </div>
      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{marginTop:12,padding:'11px 28px',fontSize:'0.85rem'}}>{saving ? '⏳ Saving...' : '🔐 Update Admin Credentials'}</button>
    </div>
  );
}

// ── Contact & Communication Config ──
function ContactConfigPanel({ flash, addAudit }) {
  const [cfg, setCfg] = useState({ support_phone:'', whatsapp:'', support_email:'', upi_display:'', bank_name:'', ifsc:'', account_no:'' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('admin_config').select('*').eq('id','default').single();
        if (data) setCfg({ support_phone:data.support_phone||'', whatsapp:data.whatsapp||'', support_email:data.support_email||'', upi_display:data.upi_display||'', bank_name:data.bank_name||'', ifsc:data.ifsc||'', account_no:data.account_no||'' });
      } catch {}
      const ls = localStorage.getItem('rythu_contact_config');
      if (ls) { try { const p = JSON.parse(ls); setCfg(prev => ({...prev, ...p})); } catch {} }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await supabase.from('admin_config').upsert({ id:'default', support_phone:cfg.support_phone, whatsapp:cfg.whatsapp, support_email:cfg.support_email, upi_display:cfg.upi_display, bank_name:cfg.bank_name, ifsc:cfg.ifsc, account_no:cfg.account_no, updated_at:new Date().toISOString() });
      addAudit('Contact config updated');
      flash('📞 Contact details saved!');
    } catch {
      localStorage.setItem('rythu_contact_config', JSON.stringify(cfg));
      flash('💾 Saved locally (DB unavailable)');
    }
    setSaving(false);
  };

  const fld = (label, key, ph='') => (
    <div className="role-field-group"><label>{label}</label><input className="role-input" value={cfg[key]} placeholder={ph} onChange={e => setCfg(p => ({...p, [key]: e.target.value}))} /></div>
  );
  return (
    <>
      {fld('Support Phone', 'support_phone', '9999999999')}
      {fld('WhatsApp Number', 'whatsapp', '919999999999')}
      {fld('Support Email', 'support_email', 'support@rythusphere.com')}
      {fld('UPI Display ID', 'upi_display', 'name@upi')}
      {fld('Bank Name', 'bank_name', 'State Bank of India')}
      {fld('IFSC Code', 'ifsc', 'SBIN0001234')}
      {fld('Account No.', 'account_no', '1234567890')}
      <button className="btn btn-primary" onClick={handleSave} disabled={saving} style={{marginTop:8,width:'100%',padding:'8px',fontSize:'0.8rem'}}>{saving ? '⏳ Saving...' : '📞 Save Contact Details'}</button>
    </>
  );
}
  const{isAdmin}=useAuth();
  const[tab,setTab]=useState('overview');
  const[filterRole,setFilterRole]=useState('All');
  const[userCount,setUserCount]=useState(null);
  const[users,setUsers]=useState([]);
  const[usersLoading,setUsersLoading]=useState(false);
  const[search,setSearch]=useState('');
  const[toast,setToast]=useState('');
  const[tickets,setTickets]=useState([
    {id:'TK-001',subject:'Cannot view market prices',user:'Rajesh Kumar',role:'farmer',priority:'High',status:'Open',date:'2026-04-22',replies:[]},
    {id:'TK-002',subject:'Payment not received',user:'Lakshmi Devi',role:'farmer',priority:'Critical',status:'In Progress',date:'2026-04-21',replies:['We are looking into this.']},
    {id:'TK-003',subject:'Product listing rejected',user:'Sri Sai Agri',role:'supplier',priority:'Medium',status:'Resolved',date:'2026-04-20',replies:['Fixed.']},
  ]);
  const[replyText,setReplyText]=useState('');
  const[replyId,setReplyId]=useState(null);
  const[flags,setFlags]=useState({'Drone Reports':true,'WhatsApp Bot':false,'AgriTourism':true,'Cold Storage':true,'AI Advisory':true});
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

  // New tab state
  const[ads,setAds]=useState([]);
  const[adsLoading,setAdsLoading]=useState(false);
  const[adCharges,setAdCharges]=useState({local:50,district:100,state:200});
  const[showChargeEdit,setShowChargeEdit]=useState(false);
  // Fetch ads from Supabase
  useEffect(()=>{
    setAdsLoading(true);
    (async()=>{
      try{
        const{data}=await supabase.from('ads').select('*').order('created_at',{ascending:false}).limit(100);
        if(data?.length)setAds(data.map(a=>({id:a.id,title:a.title,advertiser:a.advertiser_name||'User',role:a.role||'farmer',district:a.district||'',reach:a.reach||'local',status:a.status||'pending',type:a.media_type||'image',budget:a.amount_paid||0,impressions:a.views||0,clicks:a.clicks||0,date:a.created_at?.split('T')[0]||'',duration:a.duration_days||7,description:a.description||'',admin_note:a.admin_note||'',user_id:a.user_id})));
      }catch{}finally{setAdsLoading(false);}
    })();
  },[]);
  const[posts,setPosts]=useState([]);
  const[postsLoading,setPostsLoading]=useState(false);
  const[marketListings,setMarketListings]=useState([]);
  const[disputesList,setDisputesList]=useState([
    {id:'DIS-001',subject:'Payment not received for cotton delivery',farmer:'Ramesh Naidu',against:'SV Cotton Mill',priority:'High',status:'Open',date:'2026-05-03',amount:'₹1,36,000'},
    {id:'DIS-002',subject:'Seeds quality below standard',farmer:'Krishna Prasad',against:'AP Seeds Ltd',priority:'Medium',status:'In Review',date:'2026-05-01',amount:'₹4,500'},
    {id:'DIS-003',subject:'Transport delay — goods damaged',farmer:'Venkat Rao',against:'Vijayawada Transport',priority:'Critical',status:'Open',date:'2026-04-29',amount:'₹28,000'},
    {id:'DIS-004',subject:'Wrong fertilizer delivered',farmer:'Suresh Goud',against:'Krishna Seeds Center',priority:'Low',status:'Resolved',date:'2026-04-25',amount:'₹2,800'},
  ]);
  const[payments,setPayments]=useState([]);
  const[messages,setMessages]=useState([
    {id:1,from:'Ramesh Naidu',role:'farmer',subject:'Cannot access AI feature',message:'I am unable to use the crop scan. It keeps showing error.',status:'unread',date:'2026-05-04 14:30'},
    {id:2,from:'AP Seeds Ltd',role:'supplier',subject:'Ad approval request',message:'Please approve our new banner ad for hybrid seeds.',status:'unread',date:'2026-05-03 10:15'},
    {id:3,from:'Venkat Rao',role:'farmer',subject:'Transport booking issue',message:'My transport booking was cancelled without reason.',status:'unread',date:'2026-05-02 16:45'},
    {id:4,from:'Krishna Broker',role:'broker',subject:'Payment confirmation',message:'I paid via UPI but status shows pending.',status:'read',date:'2026-05-01 09:00'},
    {id:5,from:'Suresh Goud',role:'labour',subject:'Profile not updating',message:'My skills and experience are not saving properly.',status:'read',date:'2026-04-30 11:20'},
  ]);
  const[msgReply,setMsgReply]=useState('');
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
      else { /* warn removed */ }
    }
    addAudit(`Seeded ${success} test photos`);
    flash(`📸 ${success}/4 test photos seeded!`);
    fetchBgPhotos();
  }

  useEffect(()=>{if(tab==='photos')fetchBgPhotos();},[tab]);
  // Auto-load ALL data on mount
  useEffect(()=>{
    fetchUsers();
    fetchPayments();
    fetchPosts();
    // Load market listings from marketplace_listings
    supabase.from('marketplace_listings').select('*').order('created_at',{ascending:false}).limit(100).then(({data})=>{
      if(data?.length) setMarketListings(data.map(m=>({id:m.id,item:m.crop||m.title||m.crop_name||'—',seller:m.farmer_name||m.seller_name||'Seller',role:m.role||'farmer',qty:(m.quantity||0)+' '+(m.unit||'Q'),price:'₹'+(m.price_per_unit||m.price||0)+'/'+(m.unit||'Q'),district:m.district||'—',status:m.status||'active',date:m.created_at?.split('T')[0]||'—',user_id:m.user_id})));
    });
  },[]);

  // ── Fetch real users from profiles ──
  async function fetchUsers(){
    setUsersLoading(true);
    try{
      const{data,error}=await supabase.from('profiles').select('*').order('created_at',{ascending:false}).limit(200);
      if(!error&&data){
        setUsers(data.map(u=>({id:u.id,name:u.full_name||u.name||'—',phone:u.phone||u.mobile||'—',role:u.role||'farmer',district:u.district||'—',status:u.status||'Active',joined:u.created_at?.split('T')[0]||'—',verified:u.subscription_status==='active',village:u.village||'',mandal:u.mandal||''})));
        setUserCount(data.length);
      }else if(error){
        console.warn('fetchUsers error:',error.message);
      }
    }catch(e){console.warn('fetchUsers catch:',e);}
    setUsersLoading(false);
  }

  // ── Fetch real posts from community_posts ──
  async function fetchPosts(){
    setPostsLoading(true);
    try{
      const{data}=await supabase.from('community_posts').select('*').order('created_at',{ascending:false}).limit(100);
      if(data?.length){
        setPosts(data.map(p=>({id:p.id,user:p.author_name||p.user_name||'User',role:p.author_role||p.role||'farmer',content:p.content||p.body||'',type:p.post_type||p.type||'post',likes:p.likes_count||p.likes||0,comments:p.comments_count||p.comments||0,reports:p.reports_count||p.reports||0,status:p.status||'active',date:p.created_at?.split('T')[0]||'—',user_id:p.user_id})));
      }
    }catch{}
    setPostsLoading(false);
  }

  // ── Fetch real payments ──
  async function fetchPayments(){
    try{
      const{data,error}=await supabase.from('subscription_payments').select('*').order('created_at',{ascending:false}).limit(100);
      if(!error&&data?.length){
        setPayments(data.map(p=>({id:p.id?.slice(0,8)||p.id,fullId:p.id,user:p.user_name||p.user_id?.slice(0,8)||'—',role:p.role||'farmer',type:p.payment_method==='coupon'?'Coupon':'Subscription',amount:'₹'+p.amount,method:p.payment_method||'UPI',txnId:p.transaction_id||'—',status:p.status||'pending',date:p.created_at?.split('T')[0]||'—',user_id:p.user_id})));
      }
    }catch(e){console.warn('fetchPayments:',e);}
  }

  // ── Delete user (full cascade across ALL tables) ──
  async function deleteUser(userId,userName){
    if(!window.confirm(`⚠️ Delete ${userName}?\n\nThis permanently removes:\n• Profile & subscription\n• All payments\n• Community posts\n• Transport/machinery listings\n• Cold storage bookings\n• Marketplace listings\n• Expenses & disputes\n• Bug reports\n• AgriTourism bookings\n• Drone records\n• Ad submissions\n\nThis action CANNOT be undone.`))return;
    flash('⏳ Deleting '+userName+' and all associated data...');
    try{
      // Cascade delete from ALL related tables
      await Promise.allSettled([
        supabase.from('subscription_payments').delete().eq('user_id',userId),
        supabase.from('community_posts').delete().eq('user_id',userId),
        supabase.from('transport_machinery').delete().eq('user_id',userId),
        supabase.from('expenses').delete().eq('farmer_id',userId),
        supabase.from('cold_storage_units').delete().eq('user_id',userId),
        supabase.from('cold_storage_bookings').delete().eq('user_id',userId),
        supabase.from('marketplace_listings').delete().eq('user_id',userId),
        supabase.from('marketplace_orders').delete().eq('buyer_id',userId),
        supabase.from('marketplace_orders').delete().eq('seller_id',userId),
        supabase.from('agritourism_listings').delete().eq('user_id',userId),
        supabase.from('agritourism_bookings').delete().eq('user_id',userId),
        supabase.from('drone_services').delete().eq('user_id',userId),
        supabase.from('bug_reports').delete().eq('user_id',userId),
        supabase.from('disputes').delete().eq('reporter_id',userId),
        supabase.from('ads').delete().eq('user_id',userId),
        supabase.from('notifications').delete().eq('user_id',userId),
      ]);
      // Finally delete the profile itself
      const{error}=await supabase.from('profiles').delete().eq('id',userId);
      if(!error){
        setUsers(p=>p.filter(u=>u.id!==userId));
        setUserCount(p=>(p||1)-1);
        // Also remove from payments display
        setPayments(p=>p.filter(pay=>pay.user_id!==userId));
        addAudit('User fully deleted (cascade): '+userName);
        flash('🗑️ '+userName+' deleted from all tables');
      }else{flash('❌ '+error.message);}
    }catch(e){flash('❌ '+e.message);}
  }

  // ── Modify user (inline edit) ──
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({});

  function startEditUser(user) {
    setEditingUser(user.id);
    setEditForm({ name: user.name, role: user.role, district: user.district, phone: user.phone });
  }

  async function saveEditUser(userId) {
    flash('⏳ Updating user...');
    try {
      const { error } = await supabase.from('profiles').update({
        full_name: editForm.name,
        name: editForm.name,
        role: editForm.role,
        district: editForm.district,
        phone: editForm.phone,
        updated_at: new Date().toISOString(),
      }).eq('id', userId);
      if (!error) {
        setUsers(p => p.map(u => u.id === userId ? { ...u, name: editForm.name, role: editForm.role, district: editForm.district, phone: editForm.phone } : u));
        addAudit('User modified: ' + editForm.name);
        flash('✅ User updated successfully');
        setEditingUser(null);
      } else { flash('❌ ' + error.message); }
    } catch (e) { flash('❌ ' + e.message); }
  }

  useEffect(()=>{if(tab==='users'&&users.length===0)fetchUsers();},[tab]);
  useEffect(()=>{if(tab==='payments'&&payments.length===0)fetchPayments();},[tab]);

  const filtered=users.filter(u=>(filterRole==='All'||u.role===filterRole)&&(search===''||u.name.toLowerCase().includes(search.toLowerCase())||u.phone.includes(search)));

  const filteredPhotos=bgPhotos.filter(p=>bgFilter==='all'||p.status===bgFilter);

  return(
    <div className="animated">
      <div className="section-header"><div className="section-title">🛡️ Admin Dashboard</div><div style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>Platform management & control center</div></div>

      <div className="prem-tab-row">{TABS.map(t=>(<button key={t.id} className={`prem-tab-btn${tab===t.id?' active':''}`} onClick={()=>setTab(t.id)}><span className="prem-tab-icon">{t.icon}</span>{t.label}</button>))}</div>

      {tab==='overview'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">📊 Platform Overview</div>
        <div className="role-grid-3" style={{marginBottom:16}}>
          {[{i:'👥',v:userCount||0,l:'Total Users'},{i:'📢',v:ads.length,l:'Total Ads'},{i:'🏪',v:marketListings.length,l:'Market Listings'},{i:'💳',v:payments.length,l:'Payments'},{i:'🎫',v:tickets.filter(t=>t.status==='Open').length,l:'Open Tickets'},{i:'⭐',v:'4.7',l:'Platform Rating'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value">{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>
      </div>)}

      {/* ═══ ADS TAB ═══ */}
      {tab==='ads'&&(<div className="card" style={{padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div className="role-section-title" style={{margin:0}}>📢 Ad Management ({ads.length})</div>
          <div style={{display:'flex',gap:8,alignItems:'center'}}>
            <span style={{fontSize:'0.78rem',color:'var(--text-muted)'}}>⏳ {ads.filter(a=>a.status==='pending').length} pending</span>
            <button className="btn btn-outline" onClick={()=>setShowChargeEdit(!showChargeEdit)} style={{padding:'4px 12px',fontSize:'0.68rem'}}>⚙️ Charges</button>
          </div>
        </div>

        {/* Charge Management */}
        {showChargeEdit&&(<div style={{background:'rgba(245,158,11,0.06)',border:'1px solid rgba(245,158,11,0.2)',borderRadius:12,padding:16,marginBottom:16}}>
          <div style={{fontWeight:700,fontSize:'0.85rem',color:'#fbbf24',marginBottom:12}}>💰 Ad Charge Management</div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:12}}>
            {[{k:'local',l:'📍 Local',d:'Village/Mandal'},{k:'district',l:'🏘️ District',d:'District wide'},{k:'state',l:'🗺️ State',d:'All AP'}].map(c=>(
              <div key={c.k} style={{background:'var(--bg-card)',borderRadius:10,padding:12,border:'1px solid var(--border)'}}>
                <div style={{fontSize:'0.72rem',color:'var(--text-muted)',marginBottom:4}}>{c.l} <span style={{opacity:0.5}}>({c.d})</span></div>
                <div style={{display:'flex',alignItems:'center',gap:6}}>
                  <span style={{fontSize:'0.82rem',color:'var(--text-muted)'}}>₹</span>
                  <input type="number" value={adCharges[c.k]} onChange={e=>setAdCharges(p=>({...p,[c.k]:parseInt(e.target.value)||0}))} style={{width:'100%',padding:'6px 10px',borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:'0.85rem',fontWeight:700}} />
                </div>
              </div>
            ))}
          </div>
          <button onClick={()=>{setShowChargeEdit(false);flash('✅ Charges updated')}} className="btn btn-primary" style={{marginTop:10,padding:'6px 16px',fontSize:'0.72rem'}}>💾 Save Charges</button>
        </div>)}

        {/* Stats */}
        <div className="role-grid-3" style={{marginBottom:16}}>
          {[{i:'⏳',v:ads.filter(a=>a.status==='pending').length,l:'Pending',c:'#f59e0b'},{i:'✅',v:ads.filter(a=>a.status==='approved').length,l:'Approved',c:'#22c55e'},{i:'❌',v:ads.filter(a=>a.status==='rejected').length,l:'Rejected',c:'#ef4444'},{i:'💰',v:'₹'+ads.reduce((s,a)=>s+(a.budget||0),0).toLocaleString(),l:'Revenue',c:'#3b82f6'},{i:'👁️',v:ads.reduce((s,a)=>s+(a.impressions||0),0).toLocaleString(),l:'Impressions',c:'#8b5cf6'},{i:'🖱️',v:ads.reduce((s,a)=>s+(a.clicks||0),0),l:'Clicks',c:'#06b6d4'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value" style={{color:m.c}}>{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>

        {/* Ads Table */}
        {adsLoading?<div style={{textAlign:'center',padding:30,color:'var(--text-muted)'}}>⏳ Loading ads...</div>:(
        <div className="role-table-wrap"><table className="role-table"><thead><tr><th>#</th><th>Ad Title</th><th>Advertiser</th><th>Role</th><th>Reach</th><th>District</th><th>Paid</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {ads.length===0&&<tr><td colSpan={9} style={{textAlign:'center',padding:24,color:'var(--text-muted)'}}>No ad requests yet</td></tr>}
          {ads.map((a,i)=>(<tr key={a.id} style={{background:a.status==='pending'?'rgba(245,158,11,0.03)':'transparent'}}>
            <td>{i+1}</td>
            <td><b>{a.title}</b><br/><span style={{fontSize:'0.65rem',color:'var(--text-muted)'}}>{a.description?.substring(0,50)}</span></td>
            <td>{a.advertiser}</td>
            <td><span className={`role-badge ${RC[a.role]||'info'}`}>{a.role}</span></td>
            <td><span style={{fontSize:'0.68rem',padding:'2px 8px',borderRadius:8,background:a.reach==='state'?'rgba(139,92,246,0.12)':a.reach==='district'?'rgba(59,130,246,0.12)':'rgba(245,158,11,0.12)',color:a.reach==='state'?'#c4b5fd':a.reach==='district'?'#93c5fd':'#fbbf24'}}>{a.reach||'local'}</span></td>
            <td style={{fontSize:'0.78rem'}}>{a.district}</td>
            <td style={{fontWeight:700,color:'#22c55e'}}>₹{(a.budget||0).toLocaleString()}</td>
            <td><span className={`role-badge ${a.status==='approved'?'success':a.status==='rejected'?'danger':'warn'}`}>{a.status}</span></td>
            <td style={{display:'flex',gap:4,flexWrap:'wrap'}}>
              {a.status==='pending'&&<>
                <button className="btn btn-primary" onClick={async()=>{
                  setAds(p=>p.map(x=>x.id===a.id?{...x,status:'approved'}:x));
                  await supabase.from('ads').update({status:'approved'}).eq('id',a.id);
                  if(a.user_id)supabase.from('notifications').insert({user_id:a.user_id,title:'✅ Ad Approved: '+a.title,body:'Your ad is now live! It will run for '+a.duration+' days in '+a.district+'.',type:'finance',read:false}).then(()=>{});
                  addAudit('Ad approved: '+a.title);flash('✅ Ad approved & user notified');
                }} style={{padding:'3px 8px',fontSize:'0.68rem'}}>✅ Approve</button>
                <button className="btn btn-outline" onClick={async()=>{
                  const note=prompt('Rejection reason (optional):','');
                  setAds(p=>p.map(x=>x.id===a.id?{...x,status:'rejected',admin_note:note||''}:x));
                  await supabase.from('ads').update({status:'rejected',admin_note:note||''}).eq('id',a.id);
                  if(a.user_id)supabase.from('notifications').insert({user_id:a.user_id,title:'❌ Ad Rejected: '+a.title,body:note?'Reason: '+note:'Your ad was not approved. Contact admin for details.',type:'finance',read:false}).then(()=>{});
                  addAudit('Ad rejected: '+a.title);flash('❌ Ad rejected & user notified');
                }} style={{padding:'3px 8px',fontSize:'0.68rem',color:'#ef4444'}}>❌ Reject</button>
              </>}
              {a.status!=='pending'&&<button className="btn btn-outline" onClick={async()=>{
                if(!confirm('Delete this ad permanently?'))return;
                setAds(p=>p.filter(x=>x.id!==a.id));
                await supabase.from('ads').delete().eq('id',a.id);
                addAudit('Ad deleted: '+a.title);flash('🗑️ Ad removed');
              }} style={{padding:'3px 8px',fontSize:'0.68rem',color:'#ef4444'}}>🗑️</button>}
            </td>
          </tr>))}
        </tbody></table></div>)}
      </div>)}

      {/* ═══ POSTS TAB ═══ */}
      {tab==='posts'&&(<div className="card" style={{padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div className="role-section-title" style={{margin:0}}>📝 Community Posts ({posts.length})</div>
          <button className="btn btn-outline" onClick={fetchPosts} style={{padding:'7px 14px',fontSize:'0.78rem'}}>🔄 Refresh</button>
        </div>
        <div className="role-grid-3" style={{marginBottom:16}}>
          {[{i:'📝',v:posts.length,l:'Total Posts'},{i:'⚠️',v:posts.filter(p=>p.status==='flagged').length,l:'Flagged',c:'#ef4444'},{i:'❤️',v:posts.reduce((s,p)=>s+(p.likes||0),0),l:'Total Likes'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value" style={{color:m.c||'inherit'}}>{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>
        {postsLoading?<div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>⏳ Loading posts from database...</div>:
        <div className="role-table-wrap"><table className="role-table"><thead><tr><th>#</th><th>User</th><th>Role</th><th>Content</th><th>Type</th><th>❤️</th><th>💬</th><th>⚠️</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {posts.length===0&&<tr><td colSpan={10} style={{textAlign:'center',padding:30,color:'var(--text-muted)'}}>No community posts yet</td></tr>}
          {posts.map((p,i)=>(<tr key={p.id} style={{background:p.status==='flagged'?'rgba(239,68,68,0.06)':'transparent'}}>
            <td>{i+1}</td><td><b>{p.user}</b></td>
            <td><span className={`role-badge ${RC[p.role]||'info'}`}>{p.role}</span></td>
            <td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.content}</td>
            <td><span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:8,background:'var(--surface)'}}>{p.type}</span></td>
            <td>{p.likes}</td><td>{p.comments}</td><td style={{color:p.reports>0?'#ef4444':'inherit',fontWeight:p.reports>0?700:400}}>{p.reports}</td>
            <td><span className={`role-badge ${p.status==='active'?'success':'danger'}`}>{p.status}</span></td>
            <td style={{display:'flex',gap:4}}>
              {p.status==='flagged'&&<button className="btn btn-primary" onClick={async()=>{setPosts(v=>v.map(x=>x.id===p.id?{...x,status:'active',reports:0}:x));await supabase.from('community_posts').update({status:'active'}).eq('id',p.id);addAudit('Post cleared: '+p.user);flash('✅ Post cleared')}} style={{padding:'3px 8px',fontSize:'0.68rem'}}>Clear</button>}
              <button className="btn btn-outline" onClick={async()=>{if(!confirm('Delete this post?'))return;setPosts(v=>v.filter(x=>x.id!==p.id));await supabase.from('community_posts').delete().eq('id',p.id);addAudit('Post deleted: '+p.user);flash('🗑️ Post deleted')}} style={{padding:'3px 8px',fontSize:'0.68rem',color:'#ef4444'}}>🗑️</button>
            </td>
          </tr>))}
        </tbody></table></div>}
      </div>)}

      {/* ═══ MARKET TAB ═══ */}
      {tab==='market'&&(<div className="card" style={{padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div className="role-section-title" style={{margin:0}}>🏪 Marketplace Listings ({marketListings.length})</div>
          <button className="btn btn-outline" onClick={()=>{supabase.from('marketplace_listings').select('*').order('created_at',{ascending:false}).limit(100).then(({data})=>{if(data?.length)setMarketListings(data.map(m=>({id:m.id,item:m.crop||m.title||m.crop_name||'—',seller:m.farmer_name||m.seller_name||'Seller',role:m.role||'farmer',qty:(m.quantity||0)+' '+(m.unit||'Q'),price:'₹'+(m.price_per_unit||m.price||0)+'/'+(m.unit||'Q'),district:m.district||'—',status:m.status||'active',date:m.created_at?.split('T')[0]||'—',user_id:m.user_id})));flash('🔄 Refreshed')});}} style={{padding:'7px 14px',fontSize:'0.78rem'}}>🔄 Refresh</button>
        </div>
        <div className="role-table-wrap"><table className="role-table"><thead><tr><th>#</th><th>Item</th><th>Seller</th><th>Role</th><th>Qty</th><th>Price</th><th>District</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {marketListings.length===0&&<tr><td colSpan={9} style={{textAlign:'center',padding:30,color:'var(--text-muted)'}}>No marketplace listings yet</td></tr>}
          {marketListings.map((m,i)=>(<tr key={m.id} style={{background:m.status==='flagged'?'rgba(239,68,68,0.06)':'transparent'}}>
            <td>{i+1}</td><td><b>{m.item}</b></td><td>{m.seller}</td>
            <td><span className={`role-badge ${RC[m.role]||'info'}`}>{m.role}</span></td>
            <td>{m.qty}</td><td style={{fontWeight:700}}>{m.price}</td><td>{m.district}</td>
            <td><span className={`role-badge ${m.status==='active'?'success':'danger'}`}>{m.status}</span></td>
            <td style={{display:'flex',gap:4}}>
              {m.status==='flagged'&&<button className="btn btn-primary" onClick={async()=>{setMarketListings(v=>v.map(x=>x.id===m.id?{...x,status:'active'}:x));await supabase.from('marketplace_listings').update({status:'active'}).eq('id',m.id);addAudit('Listing cleared: '+m.item);flash('✅ Listing cleared')}} style={{padding:'3px 8px',fontSize:'0.68rem'}}>Clear</button>}
              <button className="btn btn-outline" onClick={async()=>{if(!confirm('Remove this listing?'))return;setMarketListings(v=>v.filter(x=>x.id!==m.id));await supabase.from('marketplace_listings').delete().eq('id',m.id);addAudit('Listing removed: '+m.item);flash('🗑️ Listing removed')}} style={{padding:'3px 8px',fontSize:'0.68rem',color:'#ef4444'}}>🗑️</button>
            </td>
          </tr>))}
        </tbody></table></div>
      </div>)}

      {/* ═══ DISPUTES TAB ═══ */}
      {tab==='disputes'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">⚖️ Dispute Resolution ({disputesList.length})</div>
        <div className="role-grid-3" style={{marginBottom:16}}>
          {[{i:'🔴',v:disputesList.filter(d=>d.status==='Open').length,l:'Open',c:'#ef4444'},{i:'🟡',v:disputesList.filter(d=>d.status==='In Review').length,l:'In Review',c:'#f59e0b'},{i:'🟢',v:disputesList.filter(d=>d.status==='Resolved').length,l:'Resolved',c:'#22c55e'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value" style={{color:m.c}}>{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>
        {disputesList.map(d=>(<div key={d.id} style={{border:'1px solid var(--border)',borderLeft:`4px solid ${d.status==='Open'?'#ef4444':d.status==='In Review'?'#f59e0b':'#22c55e'}`,borderRadius:12,padding:16,marginBottom:10}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
            <div><code>{d.id}</code> <b style={{marginLeft:6}}>{d.subject}</b></div>
            <span className={`role-badge ${d.status==='Resolved'?'success':d.status==='Open'?'danger':'warn'}`}>{d.status}</span>
          </div>
          <div style={{fontSize:'0.78rem',color:'var(--text-muted)',marginBottom:8}}>{d.farmer} → {d.against} · {d.priority} · Amount: <b>{d.amount}</b> · {d.date}</div>
          {d.status!=='Resolved'&&(<div style={{display:'flex',gap:6}}>
            {d.status==='Open'&&<button className="btn btn-outline" onClick={()=>{setDisputesList(p=>p.map(x=>x.id===d.id?{...x,status:'In Review'}:x));addAudit('Dispute review: '+d.id);flash('🔍 Under review')}} style={{padding:'5px 12px',fontSize:'0.72rem'}}>🔍 Review</button>}
            <button className="btn btn-primary" onClick={()=>{setDisputesList(p=>p.map(x=>x.id===d.id?{...x,status:'Resolved'}:x));addAudit('Dispute resolved: '+d.id);flash('✅ Dispute resolved')}} style={{padding:'5px 12px',fontSize:'0.72rem'}}>✅ Resolve</button>
          </div>)}
        </div>))}
      </div>)}

      {/* ═══ PAYMENTS TAB ═══ */}
      {tab==='payments'&&(<div className="card" style={{padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:16}}>
          <div className="role-section-title" style={{margin:0}}>💳 Payment Records ({payments.length})</div>
          <button className="btn btn-outline" onClick={()=>{const h='ID,User,Role,Type,Amount,Method,TxnID,Status,Date\n';const r=payments.map(p=>Object.values(p).join(',')).join('\n');const b=new Blob([h+r],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='payments.csv';a.click();flash('📥 Payments exported')}} style={{padding:'7px 14px',fontSize:'0.78rem'}}>📥 Export</button>
        </div>
        <div className="role-grid-3" style={{marginBottom:16}}>
          {[{i:'✅',v:payments.filter(p=>p.status==='verified').length,l:'Verified',c:'#22c55e'},{i:'⏳',v:payments.filter(p=>p.status==='pending').length,l:'Pending',c:'#f59e0b'},{i:'❌',v:payments.filter(p=>p.status==='failed').length,l:'Failed',c:'#ef4444'}].map(m=>(<div key={m.l} className="role-metric-card"><div className="metric-icon">{m.i}</div><div className="metric-value" style={{color:m.c}}>{m.v}</div><div className="metric-label">{m.l}</div></div>))}
        </div>
        <div className="role-table-wrap"><table className="role-table"><thead><tr><th>ID</th><th>User</th><th>Role</th><th>Type</th><th>Amount</th><th>Method</th><th>Txn ID</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {payments.map(p=>(<tr key={p.id}>
            <td><code>{p.id}</code></td><td><b>{p.user}</b></td>
            <td><span className={`role-badge ${RC[p.role]||'info'}`}>{p.role}</span></td>
            <td>{p.type}</td><td style={{fontWeight:700}}>{p.amount}</td><td>{p.method}</td><td style={{fontSize:'0.72rem',fontFamily:'monospace'}}>{p.txnId}</td>
            <td><span className={`role-badge ${p.status==='verified'?'success':p.status==='failed'?'danger':'warn'}`}>{p.status}</span></td>
            <td>
              {p.status==='pending'&&<><button className="btn btn-primary" onClick={async()=>{setPayments(v=>v.map(x=>x.id===p.id?{...x,status:'verified'}:x));await supabase.from('subscription_payments').update({status:'verified',verified_at:new Date().toISOString()}).eq('id',p.fullId||p.id);addAudit('Payment verified: '+p.id);flash('✅ Payment verified')}} style={{padding:'3px 8px',fontSize:'0.68rem'}}>✅ Verify</button><button className="btn btn-outline" onClick={async()=>{setPayments(v=>v.map(x=>x.id===p.id?{...x,status:'declined'}:x));await supabase.from('subscription_payments').update({status:'declined'}).eq('id',p.fullId||p.id);addAudit('Payment declined: '+p.id);flash('❌ Payment declined')}} style={{padding:'3px 8px',fontSize:'0.68rem',color:'#ef4444'}}>❌ Decline</button></>}
              {(p.status==='failed'||p.status==='declined')&&<button className="btn btn-outline" onClick={async()=>{setPayments(v=>v.map(x=>x.id===p.id?{...x,status:'pending'}:x));await supabase.from('subscription_payments').update({status:'pending'}).eq('id',p.fullId||p.id);addAudit('Payment retried: '+p.id);flash('🔄 Moved to pending')}} style={{padding:'3px 8px',fontSize:'0.68rem'}}>🔄 Retry</button>}
            </td>
          </tr>))}
        </tbody></table></div>
      </div>)}

      {/* ═══ MESSAGES TAB ═══ */}
      {tab==='messages'&&(<div className="card" style={{padding:22}}>
        <div className="role-section-title">💬 Messages ({messages.length}) · <span style={{color:'#f59e0b',fontSize:'0.85rem'}}>{messages.filter(m=>m.status==='unread').length} unread</span></div>
        {messages.map(m=>(<div key={m.id} style={{border:'1px solid var(--border)',borderLeft:`4px solid ${m.status==='unread'?'#f59e0b':'#22c55e'}`,borderRadius:12,padding:16,marginBottom:10,background:m.status==='unread'?'rgba(245,158,11,0.04)':'transparent'}}>
          <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
            <div style={{display:'flex',alignItems:'center',gap:8}}>
              <b>{m.from}</b>
              <span className={`role-badge ${RC[m.role]||'info'}`} style={{fontSize:'0.65rem'}}>{m.role}</span>
              {m.status==='unread'&&<span style={{width:8,height:8,borderRadius:'50%',background:'#f59e0b',display:'inline-block'}}/>}
            </div>
            <span style={{fontSize:'0.72rem',color:'var(--text-muted)'}}>{m.date}</span>
          </div>
          <div style={{fontWeight:600,fontSize:'0.88rem',marginBottom:4}}>{m.subject}</div>
          <div style={{fontSize:'0.82rem',color:'var(--text-secondary)',marginBottom:10,padding:'8px 10px',background:'var(--surface)',borderRadius:8}}>{m.message}</div>
          <div style={{display:'flex',gap:6}}>
            {m.status==='unread'&&<button className="btn btn-outline" onClick={()=>{setMessages(v=>v.map(x=>x.id===m.id?{...x,status:'read'}:x));addAudit('Message read: '+m.from);flash('📖 Marked as read')}} style={{padding:'5px 10px',fontSize:'0.72rem'}}>✅ Mark Read</button>}
            <button className="btn btn-primary" onClick={()=>{addAudit('Replied to: '+m.from);flash('💬 Reply sent to '+m.from)}} style={{padding:'5px 10px',fontSize:'0.72rem'}}>💬 Reply</button>
            <button className="btn btn-outline" onClick={()=>{setMessages(v=>v.filter(x=>x.id!==m.id));addAudit('Message archived: '+m.from);flash('📥 Archived')}} style={{padding:'5px 10px',fontSize:'0.72rem'}}>📥 Archive</button>
          </div>
        </div>))}
      </div>)}

      {tab==='users'&&(<div className="card" style={{padding:22}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
          <div className="role-section-title" style={{margin:0}}>👥 User Management ({userCount||0})</div>
          <button className="btn btn-outline" onClick={fetchUsers} style={{padding:'7px 14px',fontSize:'0.78rem'}}>🔄 Refresh</button>
        </div>
        <div className="role-filter-bar">
          <select className="role-select" value={filterRole} onChange={e=>setFilterRole(e.target.value)}><option>All</option><option value="farmer">Farmer</option><option value="customer">Customer</option><option value="industrial">Industrial</option><option value="broker">Broker</option><option value="supplier">Supplier</option><option value="labour">Labour</option></select>
          <input className="role-input" placeholder="Search name or phone..." value={search} onChange={e=>setSearch(e.target.value)} style={{maxWidth:220}}/>
          <button className="btn btn-outline" onClick={()=>{const h='Name,Role,District,Phone,Joined\n';const r=filtered.map(u=>u.name+','+u.role+','+u.district+','+u.phone+','+u.joined).join('\n');const b=new Blob([h+r],{type:'text/csv'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='users.csv';a.click();flash('📥 CSV exported')}} style={{padding:'7px 14px',fontSize:'0.78rem',marginLeft:'auto'}}>📥 Export</button>
        </div>
        {usersLoading?<div style={{textAlign:'center',padding:40,color:'var(--text-muted)'}}>⏳ Loading users from database...</div>:
        <div className="role-table-wrap"><table className="role-table"><thead><tr><th>#</th><th>Name</th><th>Role</th><th>District</th><th>Phone</th><th>Joined</th><th style={{minWidth:120}}>Actions</th></tr></thead><tbody>
          {filtered.map((u,i)=>(
            editingUser===u.id ? (
              <tr key={u.id} style={{background:'rgba(16,185,129,0.06)'}}>
                <td>{i+1}</td>
                <td><input className="role-input" value={editForm.name} onChange={e=>setEditForm(p=>({...p,name:e.target.value}))} style={{padding:'4px 8px',fontSize:'0.78rem',width:'100%'}} /></td>
                <td><select className="role-select" value={editForm.role} onChange={e=>setEditForm(p=>({...p,role:e.target.value}))} style={{padding:'4px 6px',fontSize:'0.72rem'}}><option value="farmer">Farmer</option><option value="customer">Customer</option><option value="industrial">Industrial</option><option value="broker">Broker</option><option value="supplier">Supplier</option><option value="labour">Labour</option></select></td>
                <td><input className="role-input" value={editForm.district} onChange={e=>setEditForm(p=>({...p,district:e.target.value}))} style={{padding:'4px 8px',fontSize:'0.78rem',width:'100%'}} /></td>
                <td><input className="role-input" value={editForm.phone} onChange={e=>setEditForm(p=>({...p,phone:e.target.value}))} style={{padding:'4px 8px',fontSize:'0.78rem',width:'100%'}} /></td>
                <td>{u.joined}</td>
                <td style={{display:'flex',gap:4}}>
                  <button className="btn btn-primary" onClick={()=>saveEditUser(u.id)} style={{padding:'3px 8px',fontSize:'0.68rem'}}>✅ Save</button>
                  <button className="btn btn-outline" onClick={()=>setEditingUser(null)} style={{padding:'3px 8px',fontSize:'0.68rem'}}>✕</button>
                </td>
              </tr>
            ) : (
              <tr key={u.id}>
                <td>{i+1}</td><td><b>{u.name}</b></td>
                <td><span className={`role-badge ${RC[u.role]||'info'}`}>{u.role}</span></td>
                <td>{u.district}</td><td>{u.phone}</td><td>{u.joined}</td>
                <td style={{display:'flex',gap:4}}>
                  <button className="btn btn-outline" onClick={()=>startEditUser(u)} style={{padding:'3px 8px',fontSize:'0.68rem',color:'#3b82f6'}} title="Edit user">✏️</button>
                  <button className="btn btn-outline" onClick={()=>deleteUser(u.id,u.name)} style={{padding:'3px 8px',fontSize:'0.68rem',color:'#ef4444'}} title="Delete user">🗑️</button>
                </td>
              </tr>
            )
          ))}
          {filtered.length===0&&<tr><td colSpan={7} style={{textAlign:'center',padding:30,color:'var(--text-muted)'}}>No users found</td></tr>}
        </tbody></table></div>}
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
            <button className="btn btn-outline" onClick={()=>{const b=new Blob(['RythuSphere Analytics Report\n\nTotal Users: '+(userCount||5000)+'\nDAU: 1,247\nRetention: 68%\nRevenue: ₹12.4L'],{type:'application/pdf'});const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='analytics_report.pdf';a.click();flash('📥 Report exported')}} style={{marginTop:10,padding:'8px 14px',fontSize:'0.78rem',width:'100%'}}>📥 Export Analytics Report</button>
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
          <div className="role-panel"><div className="panel-title">📞 Contact & Communication</div>
            <ContactConfigPanel flash={flash} addAudit={addAudit} />
            <div className="panel-title" style={{marginTop:16}}>Pricing</div>
            {[{l:'Premium Monthly',v:99},{l:'Premium Yearly',v:999},{l:'Broker Commission %',v:3}].map(p=>(<div key={p.l} className="role-field-group"><label>{p.l}</label><input className="role-input" type="number" defaultValue={p.v}/></div>))}
            <button className="btn btn-primary" onClick={()=>{addAudit('Configuration saved');flash('💾 Config saved')}} style={{marginTop:8,width:'100%',padding:'9px'}}>💾 Save</button>
          </div>
        </div>

        {/* ── Payment Config Panel ── */}
        <PaymentConfigPanel flash={flash} addAudit={addAudit} />

        {/* ── Admin Credentials Panel ── */}
        <AdminCredentialsPanel flash={flash} addAudit={addAudit} />
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
