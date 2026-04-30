import React,{useState,useMemo}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer}from 'recharts';
const G={glass:{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}};
const TABS=[{id:'catalog',icon:'📦',label:'Catalog'},{id:'orders',icon:'🛒',label:'Orders'},{id:'inventory',icon:'📊',label:'Inventory'},{id:'connections',icon:'🤝',label:'Connections'},{id:'outreach',icon:'📣',label:'Outreach'},{id:'payments',icon:'💳',label:'Payments'}];
const INIT_PRODUCTS=[{id:'P-001',name:'Cotton Seeds BT-2',brand:'Mahyco',price:850,mrp:900,bulkPrice:800,stock:340,unit:'pkt',cat:'Seeds',color:'#22c55e',hsn:'12072090',gst:5,minOrder:1,reorderLevel:50,crops:['Cotton'],usage:'Sow 5kg/acre',outOfStock:false,expiryDays:365},{id:'P-002',name:'DAP 50kg',brand:'IFFCO',price:1350,mrp:1400,bulkPrice:1300,stock:120,unit:'bag',cat:'Fertilizer',color:'#3b82f6',hsn:'31053000',gst:5,minOrder:1,reorderLevel:30,crops:['Rice','Wheat'],usage:'Apply 50kg/acre at sowing',outOfStock:false,expiryDays:730},{id:'P-003',name:'Neem Oil 1L',brand:'Organic India',price:420,mrp:450,bulkPrice:390,stock:85,unit:'bottle',cat:'Pesticide',color:'#f59e0b',hsn:'38089190',gst:18,minOrder:1,reorderLevel:20,crops:['All'],usage:'Dilute 5ml/L and spray',outOfStock:false,expiryDays:180},{id:'P-004',name:'Drip Kit',brand:'Jain Irrigation',price:4500,mrp:5000,bulkPrice:4200,stock:18,unit:'set',cat:'Equipment',color:'#8b5cf6',hsn:'84248990',gst:18,minOrder:1,reorderLevel:5,crops:['All'],usage:'Install per manufacturer guide',outOfStock:false,expiryDays:9999},{id:'P-005',name:'Urea 45kg',brand:'NFL',price:266,mrp:267,bulkPrice:255,stock:450,unit:'bag',cat:'Fertilizer',color:'#06b6d4',hsn:'31021000',gst:0,minOrder:1,reorderLevel:50,crops:['Rice','Wheat','Cotton'],usage:'Apply 50kg/acre during tillering',outOfStock:false,expiryDays:730}];
const INIT_ORDERS=[{id:'ORD-501',farmer:'Ramaiah Naidu',phone:'9000000001',items:'DAP x2, Urea x3',total:3498,status:'Pending',date:'Apr 23',payment:'COD',deliveryPerson:'',deliveryDate:''},{id:'ORD-502',farmer:'Lakshmi Devi',phone:'9000000005',items:'Cotton Seeds x5',total:4250,status:'Shipped',date:'Apr 22',payment:'UPI',deliveryPerson:'Ramu',deliveryDate:'Apr 24'},{id:'ORD-503',farmer:'Suresh Kumar',phone:'9000000004',items:'Drip Kit x1',total:5760,status:'Delivered',date:'Apr 20',payment:'UPI',deliveryPerson:'Ramu',deliveryDate:'Apr 21'},{id:'ORD-504',farmer:'Priya Reddy',phone:'9000000002',items:'DAP x1, Urea x2',total:1882,status:'Pending',date:'Apr 23',payment:'COD',deliveryPerson:'',deliveryDate:''}];
const SALES=[{m:'Jan',v:18},{m:'Feb',v:24},{m:'Mar',v:31},{m:'Apr',v:28},{m:'May',v:38},{m:'Jun',v:45}];
const STATUS_STYLE={Pending:{bg:'rgba(251,191,36,0.15)',color:'#fbbf24'},Accepted:{bg:'rgba(59,130,246,0.15)',color:'#60a5fa'},Shipped:{bg:'rgba(147,51,234,0.15)',color:'#a78bfa'},'Out for Delivery':{bg:'rgba(249,115,22,0.15)',color:'#fb923c'},Delivered:{bg:'rgba(34,197,94,0.15)',color:'#4ade80'},Rejected:{bg:'rgba(239,68,68,0.15)',color:'#ef4444'}};
const CAT_COLORS={Seeds:'#22c55e',Fertilizer:'#3b82f6',Fertilizers:'#3b82f6',Pesticide:'#f59e0b',Equipment:'#8b5cf6',Organic:'#10b981'};

function OutreachTab({inp,flash}){
  const[campName,setCampName]=useState('');const[campType,setCampType]=useState('SMS');const[campTarget,setCampTarget]=useState('Rice Farmers Guntur');const[campDiscount,setCampDiscount]=useState('10');const[campSchedule,setCampSchedule]=useState('');const[campMsg,setCampMsg]=useState('🌱 Kharif 2024 Seed Sale! 10% off on all seeds. Order now on AgriConnect 360!');
  const[campaigns,setCampaigns]=useState([{name:'Monsoon Fertilizer Sale',type:'SMS',target:'All Farmers',status:'Sent',date:'Apr 20',reach:847},{name:'Cotton Season Prep',type:'WhatsApp',target:'Cotton Farmers',status:'Scheduled',date:'Apr 28',reach:312}]);
  const[couponCode,setCouponCode]=useState('');const[couponDisc,setCouponDisc]=useState('20');const[couponMin,setCouponMin]=useState('500');const[couponMax,setCouponMax]=useState('200');const[couponDays,setCouponDays]=useState('30');
  const[coupons,setCoupons]=useState([{code:'MONSOON2026',disc:20,min:500,max:200,days:30,used:14,status:'Active'}]);
  const[showPreview,setShowPreview]=useState(false);
  function scheduleCampaign(){if(!campName)return;setCampaigns(p=>[{name:campName,type:campType,target:campTarget,status:'Scheduled',date:campSchedule||'Tomorrow 9AM',reach:Math.round(300+Math.random()*500)},...p]);setCampName('');flash('✅ Campaign scheduled!');}
  function createCoupon(){if(!couponCode)return;setCoupons(p=>[{code:couponCode,disc:+couponDisc,min:+couponMin,max:+couponMax,days:+couponDays,used:0,status:'Active'},...p]);setCouponCode('');flash('🎟️ Coupon created!');}
  return(
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
      <div>
        <div style={{...G.glass,padding:22,borderRadius:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:4}}>📣 Create Campaign</div>
          <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Reach farmers with offers</div>
          {[{l:'Campaign Name',v:campName,s:setCampName,ph:'Kharif 2024 Seed Sale'},{l:'Discount %',v:campDiscount,s:setCampDiscount,ph:'10',t:'number'}].map(f=>(
            <div key={f.l} style={{marginBottom:10}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label><input type={f.t||'text'} placeholder={f.ph} value={f.v} onChange={e=>f.s(e.target.value)} style={{...inp}}/></div>
          ))}
          <div style={{display:'flex',gap:8,marginBottom:10}}>
            <div style={{flex:1}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>Type</label><select value={campType} onChange={e=>setCampType(e.target.value)} style={{...inp}}><option>SMS</option><option>WhatsApp</option><option>Push</option></select></div>
            <div style={{flex:1}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>Target</label><select value={campTarget} onChange={e=>setCampTarget(e.target.value)} style={{...inp}}><option>Rice Farmers Guntur</option><option>Cotton Farmers</option><option>All Farmers</option><option>Paddy Farmers</option></select></div>
          </div>
          <div style={{marginBottom:10}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>Schedule</label><input placeholder="Tomorrow 9AM" value={campSchedule} onChange={e=>setCampSchedule(e.target.value)} style={{...inp}}/></div>
          <div style={{marginBottom:10}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>Message</label><textarea rows={3} value={campMsg} onChange={e=>setCampMsg(e.target.value)} style={{...inp,resize:'none'}}/><div style={{textAlign:'right',fontSize:'0.62rem',color:campMsg.length>160?'#ef4444':'rgba(255,255,255,0.3)',marginTop:2}}>{campMsg.length}/160 chars</div></div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setShowPreview(true)} style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:10,color:'#fff',cursor:'pointer',fontWeight:600,fontSize:'0.8rem'}}>👁️ Preview</button>
            <button onClick={scheduleCampaign} style={{flex:1,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',border:'none',borderRadius:10,padding:10,color:'#fff',cursor:'pointer',fontWeight:700,fontSize:'0.8rem',boxShadow:'0 4px 15px rgba(139,92,246,0.4)'}}>📅 Schedule</button>
          </div>
        </div>
        {showPreview&&(
          <div style={{...G.glass,padding:18,borderRadius:14,marginBottom:16,borderLeft:'3px solid #8b5cf6'}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:8}}>📱 SMS Preview</div>
            <div style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:14,fontSize:'0.82rem',color:'#e2e8f0',lineHeight:1.5,fontFamily:'monospace'}}>{campMsg}</div>
            <div style={{display:'flex',justifyContent:'space-between',marginTop:8,fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>
              <span>{campMsg.length} chars · {campMsg.length>160?'2 SMS':'1 SMS'}</span>
              <span>Target: {campTarget}</span>
            </div>
            <button onClick={()=>setShowPreview(false)} style={{marginTop:8,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'5px 14px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem'}}>Close Preview</button>
          </div>
        )}
        <div style={{...G.glass,padding:18,borderRadius:14}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:10}}>📋 Campaigns</div>
          {campaigns.map(c=>(
            <div key={c.name} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
              <span style={{fontSize:'1.2rem'}}>{c.type==='SMS'?'📱':c.type==='WhatsApp'?'💬':'🔔'}</span>
              <div style={{flex:1}}><div style={{fontWeight:600,color:'#f1f5f9',fontSize:'0.82rem'}}>{c.name}</div><div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.35)'}}>{c.target} · {c.date} · {c.reach} farmers</div></div>
              <span style={{background:c.status==='Sent'?'rgba(34,197,94,0.15)':'rgba(251,191,36,0.15)',color:c.status==='Sent'?'#4ade80':'#fbbf24',padding:'3px 10px',borderRadius:20,fontSize:'0.65rem',fontWeight:600}}>{c.status}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <div style={{...G.glass,padding:22,borderRadius:14,marginBottom:16}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:4}}>🎟️ Create Coupon</div>
          <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Attract buyers with discount codes</div>
          {[{l:'Coupon Code',v:couponCode,s:setCouponCode,ph:'KHARIF20'},{l:'Discount %',v:couponDisc,s:setCouponDisc,ph:'20',t:'number'},{l:'Min Order (₹)',v:couponMin,s:setCouponMin,ph:'500',t:'number'},{l:'Max Discount (₹)',v:couponMax,s:setCouponMax,ph:'200',t:'number'},{l:'Valid Days',v:couponDays,s:setCouponDays,ph:'30',t:'number'}].map(f=>(
            <div key={f.l} style={{marginBottom:10}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label><input type={f.t||'text'} placeholder={f.ph} value={f.v} onChange={e=>f.s(e.target.value)} style={{...inp}}/></div>
          ))}
          <button onClick={createCoupon} style={{width:'100%',marginTop:4,background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:10,padding:12,color:'#a78bfa',cursor:'pointer',fontWeight:700}}>🎟️ Create Coupon</button>
        </div>
        <div style={{...G.glass,padding:18,borderRadius:14}}>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:10}}>🎫 Active Coupons</div>
          {coupons.map(c=>(
            <div key={c.code} style={{background:'rgba(139,92,246,0.06)',border:'1px solid rgba(139,92,246,0.15)',borderRadius:10,padding:14,marginBottom:10}}>
              <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                <code style={{fontSize:'1rem',fontWeight:800,color:'#a78bfa',letterSpacing:2}}>{c.code}</code>
                <span style={{background:'rgba(34,197,94,0.15)',color:'#4ade80',padding:'2px 8px',borderRadius:20,fontSize:'0.62rem',fontWeight:600}}>{c.status}</span>
              </div>
              <div style={{display:'flex',gap:12,fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>
                <span>{c.disc}% off</span><span>Min ₹{c.min}</span><span>Max ₹{c.max}</span><span>{c.days}d</span><span style={{color:'#4ade80'}}>{c.used} used</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SupplierDashboardPage(){
  const{farmerProfile}=useAuth();
  const[tab,setTab]=useState('catalog');
  const[search,setSearch]=useState('');
  const[products,setProducts]=useState(INIT_PRODUCTS);
  const[orders,setOrders]=useState(()=>{const farmerOrders=JSON.parse(localStorage.getItem('agri_orders')||'[]');return[...INIT_ORDERS,...farmerOrders];});
  const[showAddProduct,setShowAddProduct]=useState(false);
  const[newProd,setNewProd]=useState({name:'',brand:'',price:'',mrp:'',bulkPrice:'',stock:'',unit:'kg',cat:'Fertilizer',hsn:'',gst:'0',minOrder:'1',reorderLevel:'50',crops:'',usage:''});
  const[selectedOrder,setSelectedOrder]=useState(null);
  const[toast,setToast]=useState('');
  const[stockUpdateId,setStockUpdateId]=useState(null);
  const[stockUpdateQty,setStockUpdateQty]=useState('200');
  const inp={width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'};
  const lowStock=products.filter(p=>p.stock<=p.reorderLevel&&!p.outOfStock);
  const expiringSoon=products.filter(p=>p.expiryDays<=30);
  function addProduct(){
    if(!newProd.name||!newProd.price)return;
    const id='P-'+String(products.length+1).padStart(3,'0');
    const color=CAT_COLORS[newProd.cat]||'#8b5cf6';
    setProducts(prev=>[...prev,{...newProd,id,price:+newProd.price,mrp:+newProd.mrp||+newProd.price,bulkPrice:+newProd.bulkPrice||+newProd.price,stock:+newProd.stock||0,gst:+newProd.gst,minOrder:+newProd.minOrder||1,reorderLevel:+newProd.reorderLevel||50,crops:newProd.crops.split(',').map(s=>s.trim()),color,outOfStock:false,expiryDays:365}]);
    setShowAddProduct(false);setNewProd({name:'',brand:'',price:'',mrp:'',bulkPrice:'',stock:'',unit:'kg',cat:'Fertilizer',hsn:'',gst:'0',minOrder:'1',reorderLevel:'50',crops:'',usage:''});
    flash('✅ Product added to catalog');
  }
  function updateOrderStatus(id,status,extra={}){setOrders(prev=>prev.map(o=>o.id===id?{...o,status,...extra}:o));flash(`Order ${id} → ${status}`);}
  function toggleStock(id){setProducts(prev=>prev.map(p=>p.id===id?{...p,outOfStock:!p.outOfStock}:p));}
  function editStock(id,val){setProducts(prev=>prev.map(p=>p.id===id?{...p,stock:+val}:p));}
  function editExpiry(id,val){setProducts(prev=>prev.map(p=>p.id===id?{...p,expiryDays:+val}:p));}
  function flash(msg){setToast(msg);setTimeout(()=>setToast(''),2000);}
  function downloadInvoice(o){
    const inv=`AgriMart Guntur — GST Tax Invoice\n${'='.repeat(45)}\nGSTIN: 37AABCS1234H1ZP\nInvoice: INV-${o.id.replace('ORD-','')}\nDate: ${o.date}\n\nBill To: ${o.farmer}\nPhone: ${o.phone}\n\nItems: ${o.items}\nPayment: ${o.payment}\n\nSubtotal: ₹${o.total}\nCGST (2.5%): ₹${Math.round(o.total*0.025)}\nSGST (2.5%): ₹${Math.round(o.total*0.025)}\nTotal: ₹${o.total+Math.round(o.total*0.05)}\n\nAgriMart Guntur | Main Road, Guntur`;
    const b=new Blob([inv],{type:'application/pdf'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=`Invoice_${o.id}.pdf`;a.click();URL.revokeObjectURL(u);
  }

  return(
    <div style={{fontFamily:'Inter,sans-serif'}}>
      {/* Hero Banner */}
      <div style={{background:'linear-gradient(135deg,#1e0533 0%,#0f172a 50%,#0c1a2e 100%)',borderRadius:20,padding:'28px 32px',marginBottom:24,position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:-40,right:-40,width:200,height:200,borderRadius:'50%',background:'radial-gradient(circle,rgba(139,92,246,0.3),transparent)',pointerEvents:'none'}}/>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',position:'relative'}}>
          <div>
            <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:12}}>
              <div style={{width:48,height:48,borderRadius:14,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.5rem',boxShadow:'0 8px 24px rgba(139,92,246,0.4)'}}>🏪</div>
              <div>
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#fff'}}>AgriMart Guntur</div>
                <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.5)'}}>Welcome, {farmerProfile?.name||'Supplier'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {[{l:'Products',v:String(products.length),c:'#8b5cf6'},{l:'Orders',v:String(orders.length),c:'#3b82f6'},{l:'Low Stock',v:String(lowStock.length),c:lowStock.length?'#ef4444':'#22c55e'},{l:'Pending',v:String(orders.filter(o=>o.status==='Pending').length),c:'#f59e0b'}].map(m=>(
                <div key={m.l} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button onClick={()=>setShowAddProduct(true)} style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,boxShadow:'0 4px 15px rgba(139,92,246,0.4)'}}>➕ Add Product</button>
            <button style={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.15)',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem'}}>📤 Export</button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',gap:4,marginBottom:20,background:'rgba(255,255,255,0.03)',borderRadius:12,padding:4,border:'1px solid rgba(255,255,255,0.06)'}}>
        {TABS.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:'9px 6px',borderRadius:9,border:'none',cursor:'pointer',fontSize:'0.76rem',fontWeight:600,transition:'all 0.25s',background:tab===t.id?'linear-gradient(135deg,#8b5cf6,#6d28d9)':'transparent',color:tab===t.id?'#fff':'rgba(255,255,255,0.45)',boxShadow:tab===t.id?'0 4px 12px rgba(139,92,246,0.3)':'none'}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Catalog */}
      {tab==='catalog'&&(
        <div>
          <div style={{display:'flex',gap:10,marginBottom:16}}>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder='🔍 Search products...' style={{...inp,flex:1}}/>
            <select style={{...inp,width:'auto'}}>
              <option>All Categories</option><option>Seeds</option><option>Fertilizer</option><option>Pesticide</option>
            </select>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))',gap:14}}>
            {products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
              <div key={p.id} style={{...G.glass,padding:18,borderRadius:14,transition:'all 0.3s',cursor:'pointer'}}
                onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 30px rgba(0,0,0,0.3)'}}
                onMouseLeave={e=>{e.currentTarget.style.transform='translateY(0)';e.currentTarget.style.boxShadow='none'}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:10}}>
                  <span style={{background:p.color+'22',color:p.color,padding:'3px 8px',borderRadius:6,fontSize:'0.65rem',fontWeight:700}}>{p.cat}</span>
                  <span style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.3)'}}>{p.id}</span>
                </div>
                <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:3}}>{p.name}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)',marginBottom:10}}>{p.brand}</div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <span style={{fontSize:'1.1rem',fontWeight:800,color:p.color}}>₹{p.price}</span>
                  <span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.35)'}}>/{p.unit}</span>
                </div>
                <div style={{marginBottom:10}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:4}}>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)'}}>Stock</span>
                    <span style={{fontSize:'0.68rem',color:p.stock<50?'#ef4444':p.stock<100?'#f59e0b':'#4ade80',fontWeight:700}}>{p.stock} {p.unit}s</span>
                  </div>
                  <div style={{height:4,background:'rgba(255,255,255,0.06)',borderRadius:2}}>
                    <div style={{height:'100%',width:Math.min(p.stock/500*100,100)+'%',background:p.stock<50?'#ef4444':p.stock<100?'#f59e0b':p.color,borderRadius:2,transition:'width 0.8s'}}/>
                  </div>
                </div>
                {p.outOfStock&&<div style={{background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'3px 8px',borderRadius:6,fontSize:'0.65rem',fontWeight:700,textAlign:'center',marginBottom:6}}>❌ Out of Stock</div>}
                {p.stock<=p.reorderLevel&&!p.outOfStock&&<div style={{background:'rgba(249,115,22,0.15)',color:'#fb923c',padding:'3px 8px',borderRadius:6,fontSize:'0.65rem',fontWeight:700,textAlign:'center',marginBottom:6}}>⚠️ Low Stock</div>}
                {p.expiryDays<=30&&<div style={{background:'rgba(239,68,68,0.12)',color:'#f87171',padding:'3px 8px',borderRadius:6,fontSize:'0.62rem',textAlign:'center',marginBottom:6}}>⏰ Expiring Soon ({p.expiryDays}d)</div>}
                <div style={{display:'flex',gap:6}}>
                  <button onClick={()=>toggleStock(p.id)} style={{flex:1,background:p.outOfStock?'rgba(34,197,94,0.15)':'rgba(239,68,68,0.12)',border:'none',color:p.outOfStock?'#4ade80':'#f87171',borderRadius:8,padding:'5px 0',fontSize:'0.68rem',cursor:'pointer',fontWeight:600}}>{p.outOfStock?'✅ Restock':'❌ Mark OOS'}</button>
                  <button onClick={()=>{const v=prompt('New stock qty:',p.stock);if(v)editStock(p.id,v)}} style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',borderRadius:8,padding:'5px 0',fontSize:'0.68rem',cursor:'pointer'}}>✏️ Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders */}
      {tab==='orders'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginBottom:20}}>
            {[{i:'📦',v:String(orders.length),l:'Total',c:'#8b5cf6'},{i:'⏳',v:String(orders.filter(o=>o.status==='Pending').length),l:'Pending',c:'#fbbf24'},{i:'🚚',v:String(orders.filter(o=>o.status==='Shipped'||o.status==='Out for Delivery').length),l:'In Transit',c:'#60a5fa'},{i:'💰',v:'₹'+Math.round(orders.filter(o=>o.status==='Delivered').reduce((s,o)=>s+o.total,0)/1000)+'K',l:'Collected',c:'#4ade80'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12}}>
                <div style={{fontSize:'1.4rem',marginBottom:6}}>{m.i}</div>
                <div style={{fontSize:'1.3rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          {orders.map(o=>(
            <div key={o.id} style={{...G.glass,padding:16,borderRadius:12,marginBottom:10}}>
              <div style={{display:'flex',alignItems:'center',gap:14}}>
                <div style={{width:44,height:44,borderRadius:12,background:'rgba(139,92,246,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>🛒</div>
                <div style={{flex:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                    <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem'}}>{o.farmer}</span>
                    <code style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.06)',padding:'2px 6px',borderRadius:4}}>{o.id}</code>
                  </div>
                  <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{o.items} · {o.date} · {o.payment}</div>
                </div>
                <div style={{textAlign:'right',marginRight:8}}>
                  <div style={{fontWeight:700,color:'#4ade80',marginBottom:4}}>₹{o.total.toLocaleString('en-IN')}</div>
                  <span style={{background:(STATUS_STYLE[o.status]||{}).bg,color:(STATUS_STYLE[o.status]||{}).color,padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>{o.status}</span>
                </div>
              </div>
              <div style={{display:'flex',gap:6,marginTop:10,flexWrap:'wrap'}}>
                {o.status==='Pending'&&<><button onClick={()=>updateOrderStatus(o.id,'Accepted')} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'6px 12px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>✓ Accept</button><button onClick={()=>updateOrderStatus(o.id,'Rejected')} style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'6px 12px',color:'#ef4444',cursor:'pointer',fontSize:'0.72rem'}}>✗ Reject</button></>}
                {o.status==='Accepted'&&<button onClick={()=>updateOrderStatus(o.id,'Out for Delivery',{deliveryPerson:'Ramu',deliveryDate:'Tomorrow'})} style={{background:'linear-gradient(135deg,#f59e0b,#d97706)',border:'none',borderRadius:8,padding:'6px 12px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>🚚 Out for Delivery</button>}
                {o.status==='Out for Delivery'&&<button onClick={()=>updateOrderStatus(o.id,'Delivered')} style={{background:'linear-gradient(135deg,#10b981,#059669)',border:'none',borderRadius:8,padding:'6px 12px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>📦 Mark Delivered</button>}
                {o.status==='Delivered'&&<button onClick={()=>downloadInvoice(o)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 12px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem'}}>📄 Download Invoice</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Inventory */}
      {tab==='inventory'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))',gap:14,marginBottom:20}}>
            {products.map(p=>{
              const pct=Math.min(p.stock/500*100,100);
              const demand=Math.round(p.stock*0.3+Math.random()*40);
              return(
                <div key={p.id} style={{...G.glass,padding:18,borderRadius:14,borderLeft:'3px solid '+(p.stock<=p.reorderLevel?'#ef4444':p.stock<100?'#f59e0b':p.color)}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.85rem'}}>{p.name}</span>
                    {p.stock<=p.reorderLevel&&<span style={{background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'2px 7px',borderRadius:20,fontSize:'0.62rem',fontWeight:700}}>⚠ LOW</span>}
                    {p.outOfStock&&<span style={{background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'2px 7px',borderRadius:20,fontSize:'0.62rem',fontWeight:700}}>❌ OOS</span>}
                  </div>
                  <div style={{fontSize:'2rem',fontWeight:800,color:p.stock<=p.reorderLevel?'#ef4444':p.stock<100?'#f59e0b':p.color,marginBottom:4}}>
                    {p.stock}<span style={{fontSize:'0.85rem',fontWeight:400,color:'rgba(255,255,255,0.4)',marginLeft:4}}>{p.unit}s</span>
                  </div>
                  <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,marginBottom:8}}>
                    <div style={{height:'100%',width:pct+'%',background:p.stock<=p.reorderLevel?'#ef4444':p.stock<100?'#f59e0b':p.color,borderRadius:3,transition:'width 0.8s'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>Value: ₹{(p.stock*p.price).toLocaleString('en-IN')}</span>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>Reorder: {p.reorderLevel}</span>
                  </div>
                  <div style={{background:'rgba(59,130,246,0.08)',borderRadius:8,padding:'6px 10px',marginBottom:8,border:'1px solid rgba(59,130,246,0.15)'}}>
                    <div style={{fontSize:'0.65rem',color:'#60a5fa',fontWeight:600}}>📊 Demand Forecast (30d)</div>
                    <div style={{fontSize:'0.82rem',fontWeight:700,color:'#93c5fd'}}>{demand} {p.unit}s expected</div>
                    {demand>p.stock&&<div style={{fontSize:'0.62rem',color:'#f87171',marginTop:2}}>⚠ Stock insufficient! Reorder {demand-p.stock} {p.unit}s</div>}
                  </div>
                  {stockUpdateId===p.id?(
                    <div style={{display:'flex',gap:6}}>
                      <input type='number' value={stockUpdateQty} onChange={e=>setStockUpdateQty(e.target.value)} placeholder='Qty to add' style={{flex:1,background:'rgba(255,255,255,0.08)',border:'1px solid rgba(139,92,246,0.3)',borderRadius:8,padding:'7px 10px',color:'#e2e8f0',fontSize:'0.78rem',outline:'none'}}/>
                      <button onClick={()=>{const q=parseInt(stockUpdateQty)||0;editStock(p.id,p.stock+q);flash(`✅ ${p.name}: +${q} → ${p.stock+q} total`);setStockUpdateId(null)}} style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'7px 12px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:700}}>✓ Add</button>
                      <button onClick={()=>setStockUpdateId(null)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'7px 10px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem'}}>✕</button>
                    </div>
                  ):(
                    <button onClick={()=>{setStockUpdateId(p.id);setStockUpdateQty('200')}} style={{width:'100%',background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.25)',borderRadius:8,padding:'7px',color:'#a78bfa',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>📦 Record Stock Update</button>
                  )}
                </div>
              );
            })}
          </div>
          <div style={{...G.glass,padding:20,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📈 Monthly Sales (₹ Lakhs)</div>
            <ResponsiveContainer width='100%' height={160}>
              <LineChart data={SALES}>
                <XAxis dataKey='m' tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/>
                <Line type='monotone' dataKey='v' stroke='#8b5cf6' strokeWidth={2.5} dot={{fill:'#8b5cf6',r:4}} activeDot={{r:6}} name='Sales (₹L)'/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Connections */}
      {tab==='connections'&&(
        <div>
          <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14,fontSize:'1rem'}}>🤝 My Business Network</div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
            {[
              {title:'👨‍🌾 Farmer Customers',count:47,items:[{n:'Ramaiah Naidu',d:'Guntur',s:'Regular · Seeds & Fertilizers',ph:'9000000001'},{n:'Lakshmi Devi',d:'Krishna',s:'Regular · Pesticides',ph:'9000000005'},{n:'Suresh Kumar',d:'Prakasam',s:'New · Equipment',ph:'9000000004'}]},
              {title:'🤝 Brokers',count:8,items:[{n:'Rajesh Broker',d:'Guntur',s:'Cotton & Paddy deals',ph:'9100000001'},{n:'Srinivas Reddy',d:'Guntur',s:'Chilli deals',ph:'9100000002'}]},
              {title:'🏪 Other Suppliers',count:5,items:[{n:'Kurnool Agri Store',d:'Kurnool',s:'Seeds wholesale',ph:'9200000001'},{n:'Vizag Farm Mart',d:'Visakhapatnam',s:'Organic products',ph:'9200000002'}]},
              {title:'🏭 Industries',count:4,items:[{n:'Deccan Foods Ltd',d:'Guntur',s:'Bulk fertilizer buyer',ph:'9300000001'},{n:'AP Sugar Factory',d:'Krishna',s:'Equipment buyer',ph:'9300000002'}]},
              {title:'🚛 Transport Partners',count:3,items:[{n:'Ramesh Kumar',d:'Guntur',s:'Delivery — Tata Ace',ph:'9876501234'},{n:'Venkat Rao',d:'Guntur',s:'Bulk transport',ph:'9876503456'}]},
              {title:'👷 Labour Partners',count:2,items:[{n:'Guntur Kisan Sangha',d:'Guntur',s:'Loading/unloading',ph:'9876500001'}]},
            ].map(sec=>(
              <div key={sec.title} style={{...G.glass,padding:18,borderRadius:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:12}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.92rem'}}>{sec.title}</span>
                  <span style={{fontSize:'0.72rem',color:'#a78bfa',fontWeight:600}}>{sec.count} total</span>
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

      {/* Outreach */}
      {tab==='outreach'&&<OutreachTab inp={inp} flash={flash}/>}

      {/* Payments/Analytics */}
      {tab==='payments'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:14,marginBottom:20}}>
            {[{i:'💰',v:'₹2.45L',l:'Revenue MTD',c:'#4ade80'},{i:'📄',v:'23',l:'GST Invoices',c:'#60a5fa'},{i:'⏳',v:'₹38.2K',l:'Outstanding',c:'#fbbf24'},{i:'📊',v:'₹18.5L',l:'Revenue YTD',c:'#a78bfa'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:18,borderRadius:14,textAlign:'center'}}>
                <div style={{fontSize:'1.6rem',marginBottom:6}}>{m.i}</div>
                <div style={{fontSize:'1.3rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.4)',marginTop:2}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16,marginBottom:16}}>
            <div style={{...G.glass,padding:20,borderRadius:14}}>
              <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:12}}>🏆 Top Products</div>
              {[{n:'DAP 50kg',s:87,r:'₹1.17L',c:'#3b82f6'},{n:'Cotton Seeds BT-2',s:64,r:'₹54.4K',c:'#22c55e'},{n:'Urea 45kg',s:156,r:'₹41.5K',c:'#06b6d4'},{n:'Neem Oil 1L',s:42,r:'₹17.6K',c:'#f59e0b'},{n:'Drip Kit',s:8,r:'₹36K',c:'#8b5cf6'}].map((p,i)=>(
                <div key={p.n} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <span style={{width:22,height:22,borderRadius:6,background:p.c+'22',color:p.c,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:800}}>#{i+1}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'0.82rem',fontWeight:600,color:'#f1f5f9'}}>{p.n}</div>
                    <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.35)'}}>{p.s} units sold</div>
                  </div>
                  <span style={{fontWeight:700,color:p.c,fontSize:'0.85rem'}}>{p.r}</span>
                </div>
              ))}
            </div>
            <div style={{...G.glass,padding:20,borderRadius:14}}>
              <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:12}}>👨‍🌾 Top Customers</div>
              {[{n:'Ramaiah Naidu',o:12,r:'₹42K',d:'Guntur'},{n:'Lakshmi Devi',o:8,r:'₹34K',d:'Prakasam'},{n:'Suresh Kumar',o:6,r:'₹28K',d:'Krishna'},{n:'Priya Reddy',o:5,r:'₹15K',d:'Nellore'},{n:'Venkat Rao',o:4,r:'₹12K',d:'Kurnool'}].map((c,i)=>(
                <div key={c.n} style={{display:'flex',alignItems:'center',gap:10,padding:'8px 0',borderBottom:'1px solid rgba(255,255,255,0.04)'}}>
                  <span style={{width:22,height:22,borderRadius:6,background:'rgba(34,197,94,0.15)',color:'#4ade80',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'0.7rem',fontWeight:800}}>#{i+1}</span>
                  <div style={{flex:1}}>
                    <div style={{fontSize:'0.82rem',fontWeight:600,color:'#f1f5f9'}}>{c.n}</div>
                    <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.35)'}}>{c.o} orders · {c.d}</div>
                  </div>
                  <span style={{fontWeight:700,color:'#4ade80',fontSize:'0.85rem'}}>{c.r}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{...G.glass,padding:20,borderRadius:14,marginBottom:16}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:14}}>
              <div style={{fontWeight:700,color:'#f1f5f9'}}>📈 Revenue Trend</div>
              <button onClick={()=>{const csv='Month,Sales(Lakhs)\n'+SALES.map(s=>s.m+','+s.v).join('\n');const b=new Blob([csv],{type:'text/csv'});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download='AgriMart_Sales_Report.csv';a.click();URL.revokeObjectURL(u);flash('📥 Sales report downloaded')}} style={{background:'rgba(34,197,94,0.12)',border:'1px solid rgba(34,197,94,0.25)',borderRadius:8,padding:'6px 14px',color:'#4ade80',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>📥 Export Excel</button>
            </div>
            <ResponsiveContainer width='100%' height={180}>
              <LineChart data={SALES}>
                <XAxis dataKey='m' tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <YAxis tick={{fill:'#64748b',fontSize:11}} axisLine={false} tickLine={false}/>
                <Tooltip contentStyle={{background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/>
                <Line type='monotone' dataKey='v' stroke='#8b5cf6' strokeWidth={2.5} dot={{fill:'#8b5cf6',r:4}} activeDot={{r:6}} name='Sales (₹L)'/>
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{...G.glass,borderRadius:14,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:700,color:'#f1f5f9'}}>Recent Transactions</div>
            {orders.filter(o=>o.status==='Delivered').map(o=>(
              <div key={o.id} style={{padding:'12px 18px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(34,197,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>💳</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{o.farmer}</div>
                  <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>{o.date} · {o.id}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700,color:'#4ade80'}}>₹{o.total.toLocaleString('en-IN')}</div>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)'}}>{o.payment||'UPI'}</div>
                </div>
                <button onClick={()=>downloadInvoice(o)} style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'5px 10px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.7rem'}}>Invoice</button>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Profile */}
      {tab==='profile'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:16}}>🏪 Shop Details</div>
            {[{l:'Shop Name',v:'Sri Sai Agri Centre'},{l:'Location',v:'Main Road, Guntur'},{l:'Phone',v:'+91 98765 43210'},{l:'Business Hours',v:'8 AM - 7 PM'},{l:'GSTIN',v:'37AABCS1234H1ZP'}].map(f=>(
              <div key={f.l} style={{marginBottom:12}}>
                <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:6}}>{f.l}</label>
                <input defaultValue={f.v} style={{...inp}}/>
              </div>
            ))}
            <button style={{width:'100%',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700,marginTop:4,boxShadow:'0 4px 15px rgba(139,92,246,0.4)'}}>💾 Save Profile</button>
          </div>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:14}}>📊 Shop Stats</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:10,marginBottom:16}}>
              {[{l:'Rating',v:'⭐ 4.5',c:'#f59e0b'},{l:'Reviews',v:'234',c:'#60a5fa'},{l:'Delivery',v:'25 km',c:'#4ade80'},{l:'Since',v:'2019',c:'#a78bfa'}].map(s=>(
                <div key={s.l} style={{background:'rgba(255,255,255,0.04)',borderRadius:10,padding:12,textAlign:'center'}}>
                  <div style={{fontSize:'1.1rem',fontWeight:800,color:s.c}}>{s.v}</div>
                  <div style={{fontSize:'0.65rem',color:'rgba(255,255,255,0.35)',marginTop:2}}>{s.l}</div>
                </div>
              ))}
            </div>
            <div style={{marginBottom:12}}>
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:8}}>Categories</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['Seeds','Fertilizers','Pesticides','Equipment','Organic'].map(c=>(
                  <span key={c} style={{background:'rgba(139,92,246,0.12)',color:'#a78bfa',padding:'3px 10px',borderRadius:20,fontSize:'0.7rem',border:'1px solid rgba(139,92,246,0.25)'}}>{c}</span>
                ))}
              </div>
            </div>
            <div>
              <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',marginBottom:8}}>Brands</div>
              <div style={{display:'flex',gap:6,flexWrap:'wrap'}}>
                {['Mahyco','IFFCO','NFL','Bayer','Jain'].map(b=>(
                  <span key={b} style={{background:'rgba(34,197,94,0.1)',color:'#4ade80',padding:'3px 10px',borderRadius:20,fontSize:'0.7rem',border:'1px solid rgba(34,197,94,0.2)'}}>{b}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {toast&&<div style={{position:'fixed',bottom:24,right:24,background:'rgba(16,185,129,0.95)',color:'#fff',padding:'12px 20px',borderRadius:12,fontSize:'0.85rem',fontWeight:600,zIndex:999,boxShadow:'0 8px 30px rgba(0,0,0,0.3)',animation:'fadeIn 0.3s ease'}}>{toast}</div>}
      {showAddProduct&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.6)',zIndex:998,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={()=>setShowAddProduct(false)}>
          <div onClick={e=>e.stopPropagation()} style={{background:'#1a1f2e',borderRadius:16,padding:24,width:480,maxHeight:'80vh',overflow:'auto',border:'1px solid rgba(255,255,255,0.1)'}}>
            <h3 style={{color:'#f1f5f9',margin:'0 0 16px'}}>➕ Add New Product</h3>
            {[{k:'name',l:'Product Name',ph:'Urea Fertilizer'},{k:'brand',l:'Brand',ph:'IFFCO'},{k:'hsn',l:'HSN Code',ph:'31021000'},{k:'price',l:'Selling Price (₹)',ph:'255',t:'number'},{k:'mrp',l:'MRP (₹)',ph:'267',t:'number'},{k:'bulkPrice',l:'Bulk Price (10+)',ph:'245',t:'number'},{k:'stock',l:'Stock Qty',ph:'500',t:'number'},{k:'reorderLevel',l:'Reorder Level',ph:'50',t:'number'},{k:'crops',l:'Compatible Crops',ph:'Rice, Wheat, Cotton'},{k:'usage',l:'Usage Instructions',ph:'Apply 50kg/acre during tillering'}].map(f=>(
              <div key={f.k} style={{marginBottom:10}}>
                <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>{f.l}</label>
                <input type={f.t||'text'} placeholder={f.ph} value={newProd[f.k]} onChange={e=>setNewProd(p=>({...p,[f.k]:e.target.value}))} style={{...inp}}/>
              </div>
            ))}
            <div style={{display:'flex',gap:10,marginBottom:10}}>
              <div style={{flex:1}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>Category</label><select value={newProd.cat} onChange={e=>setNewProd(p=>({...p,cat:e.target.value}))} style={{...inp}}><option>Fertilizer</option><option>Seeds</option><option>Pesticide</option><option>Equipment</option><option>Organic</option></select></div>
              <div style={{flex:1}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>Unit</label><select value={newProd.unit} onChange={e=>setNewProd(p=>({...p,unit:e.target.value}))} style={{...inp}}><option>kg</option><option>bag</option><option>bottle</option><option>L</option><option>pkt</option><option>set</option></select></div>
              <div style={{flex:1}}><label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:4}}>GST %</label><select value={newProd.gst} onChange={e=>setNewProd(p=>({...p,gst:e.target.value}))} style={{...inp}}><option value='0'>0%</option><option value='5'>5%</option><option value='12'>12%</option><option value='18'>18%</option></select></div>
            </div>
            <div style={{display:'flex',gap:8,marginTop:16}}>
              <button onClick={addProduct} style={{flex:1,background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700}}>💾 Save Product</button>
              <button onClick={()=>setShowAddProduct(false)} style={{flex:1,background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,padding:12,color:'#fff',cursor:'pointer'}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
