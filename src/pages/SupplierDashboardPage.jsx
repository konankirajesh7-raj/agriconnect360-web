import React,{useState}from 'react';
import{useAuth}from '../lib/hooks/useAuth';
import{LineChart,Line,XAxis,YAxis,Tooltip,ResponsiveContainer}from 'recharts';
const G={glass:{background:'rgba(255,255,255,0.03)',backdropFilter:'blur(20px)',border:'1px solid rgba(255,255,255,0.08)',borderRadius:16}};
const TABS=[{id:'catalog',icon:'📦',label:'Catalog'},{id:'orders',icon:'🛒',label:'Orders'},{id:'inventory',icon:'📊',label:'Inventory'},{id:'outreach',icon:'📣',label:'Outreach'},{id:'payments',icon:'💳',label:'Payments'},{id:'profile',icon:'🏪',label:'Profile'}];
const PRODUCTS=[{id:'P-001',name:'Cotton Seeds BT-2',brand:'Mahyco',price:850,stock:340,unit:'pkt',cat:'Seeds',color:'#22c55e'},{id:'P-002',name:'DAP 50kg',brand:'IFFCO',price:1350,stock:120,unit:'bag',cat:'Fertilizer',color:'#3b82f6'},{id:'P-003',name:'Neem Oil 1L',brand:'Organic India',price:420,stock:85,unit:'bottle',cat:'Pesticide',color:'#f59e0b'},{id:'P-004',name:'Drip Kit',brand:'Jain Irrigation',price:4500,stock:18,unit:'set',cat:'Equipment',color:'#8b5cf6'},{id:'P-005',name:'Urea 45kg',brand:'NFL',price:266,stock:450,unit:'bag',cat:'Fertilizer',color:'#06b6d4'}];
const ORDERS=[{id:'ORD-501',farmer:'Ramaiah Naidu',items:'DAP x2, Urea x3',total:3498,status:'Pending',date:'Apr 23'},{id:'ORD-502',farmer:'Lakshmi Devi',items:'Cotton Seeds x5',total:4250,status:'Shipped',date:'Apr 22'},{id:'ORD-503',farmer:'Suresh Kumar',items:'Drip Kit x1',total:5760,status:'Delivered',date:'Apr 20'},{id:'ORD-504',farmer:'Priya Reddy',items:'DAP x1, Urea x2',total:1882,status:'Pending',date:'Apr 23'}];
const SALES=[{m:'Jan',v:18},{m:'Feb',v:24},{m:'Mar',v:31},{m:'Apr',v:28},{m:'May',v:38},{m:'Jun',v:45}];
const STATUS_STYLE={Pending:{bg:'rgba(251,191,36,0.15)',color:'#fbbf24'},Shipped:{bg:'rgba(59,130,246,0.15)',color:'#60a5fa'},Delivered:{bg:'rgba(34,197,94,0.15)',color:'#4ade80'}};

export default function SupplierDashboardPage(){
  const{farmerProfile}=useAuth();
  const[tab,setTab]=useState('catalog');
  const[search,setSearch]=useState('');
  const inp={width:'100%',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:9,padding:'9px 12px',color:'#e2e8f0',boxSizing:'border-box',outline:'none'};

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
                <div style={{fontSize:'1.4rem',fontWeight:800,color:'#fff'}}>Supplier Portal</div>
                <div style={{fontSize:'0.8rem',color:'rgba(255,255,255,0.5)'}}>Welcome, {farmerProfile?.name||'Supplier'}</div>
              </div>
            </div>
            <div style={{display:'flex',gap:8}}>
              {[{l:'Products',v:'5',c:'#8b5cf6'},{l:'Orders',v:'4',c:'#3b82f6'},{l:'Revenue',v:'₹2.45L',c:'#22c55e'},{l:'Rating',v:'⭐4.5',c:'#f59e0b'}].map(m=>(
                <div key={m.l} style={{background:'rgba(255,255,255,0.06)',borderRadius:10,padding:'8px 14px',border:'1px solid rgba(255,255,255,0.08)'}}>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.4)',marginBottom:2}}>{m.l}</div>
                  <div style={{fontSize:'0.95rem',fontWeight:700,color:m.c}}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{display:'flex',gap:8}}>
            <button style={{background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',border:'none',borderRadius:10,padding:'10px 16px',color:'#fff',cursor:'pointer',fontSize:'0.8rem',fontWeight:600,boxShadow:'0 4px 15px rgba(139,92,246,0.4)'}}>➕ Add Product</button>
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
            {PRODUCTS.filter(p=>p.name.toLowerCase().includes(search.toLowerCase())).map(p=>(
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
                <div style={{display:'flex',gap:6}}>
                  <button style={{flex:1,background:p.color+'22',border:'1px solid '+p.color+'44',color:p.color,borderRadius:8,padding:'5px 0',fontSize:'0.7rem',cursor:'pointer',fontWeight:600}}>✏️ Edit</button>
                  <button style={{flex:1,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',color:'rgba(255,255,255,0.5)',borderRadius:8,padding:'5px 0',fontSize:'0.7rem',cursor:'pointer'}}>🔁 Restock</button>
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
            {[{i:'📦',v:'4',l:'Total',c:'#8b5cf6'},{i:'⏳',v:'2',l:'Pending',c:'#fbbf24'},{i:'🚚',v:'1',l:'Shipped',c:'#60a5fa'},{i:'💰',v:'₹15.4K',l:'Revenue',c:'#4ade80'}].map(m=>(
              <div key={m.l} style={{...G.glass,padding:16,borderRadius:12}}>
                <div style={{fontSize:'1.4rem',marginBottom:6}}>{m.i}</div>
                <div style={{fontSize:'1.3rem',fontWeight:800,color:m.c}}>{m.v}</div>
                <div style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          {ORDERS.map(o=>(
            <div key={o.id} style={{...G.glass,padding:16,borderRadius:12,marginBottom:10,display:'flex',alignItems:'center',gap:14}}>
              <div style={{width:44,height:44,borderRadius:12,background:'rgba(139,92,246,0.12)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>🛒</div>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:3}}>
                  <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.88rem'}}>{o.farmer}</span>
                  <code style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)',background:'rgba(255,255,255,0.06)',padding:'2px 6px',borderRadius:4}}>{o.id}</code>
                </div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{o.items} · {o.date}</div>
              </div>
              <div style={{textAlign:'right',marginRight:8}}>
                <div style={{fontWeight:700,color:'#4ade80',marginBottom:4}}>₹{o.total.toLocaleString('en-IN')}</div>
                <span style={{background:STATUS_STYLE[o.status]?.bg,color:STATUS_STYLE[o.status]?.color,padding:'3px 10px',borderRadius:20,fontSize:'0.68rem',fontWeight:600}}>{o.status}</span>
              </div>
              {o.status==='Pending'&&(
                <div style={{display:'flex',gap:6,flexShrink:0}}>
                  <button style={{background:'linear-gradient(135deg,#22c55e,#16a34a)',border:'none',borderRadius:8,padding:'6px 12px',color:'#fff',cursor:'pointer',fontSize:'0.72rem',fontWeight:600}}>✓ Accept</button>
                  <button style={{background:'rgba(239,68,68,0.15)',border:'1px solid rgba(239,68,68,0.3)',borderRadius:8,padding:'6px 12px',color:'#ef4444',cursor:'pointer',fontSize:'0.72rem'}}>✗ Reject</button>
                </div>
              )}
              {o.status!=='Pending'&&<button style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'6px 12px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.72rem',flexShrink:0}}>Track</button>}
            </div>
          ))}
        </div>
      )}

      {/* Inventory */}
      {tab==='inventory'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',gap:14,marginBottom:20}}>
            {PRODUCTS.map(p=>{
              const pct=Math.min(p.stock/500*100,100);
              return(
                <div key={p.id} style={{...G.glass,padding:18,borderRadius:14,borderLeft:'3px solid '+(p.stock<50?'#ef4444':p.stock<100?'#f59e0b':p.color)}}>
                  <div style={{display:'flex',justifyContent:'space-between',marginBottom:8}}>
                    <span style={{fontWeight:700,color:'#f1f5f9',fontSize:'0.85rem'}}>{p.name}</span>
                    {p.stock<50&&<span style={{background:'rgba(239,68,68,0.15)',color:'#ef4444',padding:'2px 7px',borderRadius:20,fontSize:'0.62rem',fontWeight:700}}>⚠ LOW</span>}
                  </div>
                  <div style={{fontSize:'2rem',fontWeight:800,color:p.stock<50?'#ef4444':p.stock<100?'#f59e0b':p.color,marginBottom:4}}>
                    {p.stock}<span style={{fontSize:'0.85rem',fontWeight:400,color:'rgba(255,255,255,0.4)',marginLeft:4}}>{p.unit}s</span>
                  </div>
                  <div style={{height:6,background:'rgba(255,255,255,0.06)',borderRadius:3,marginBottom:8}}>
                    <div style={{height:'100%',width:pct+'%',background:p.stock<50?'#ef4444':p.stock<100?'#f59e0b':p.color,borderRadius:3,transition:'width 0.8s'}}/>
                  </div>
                  <div style={{display:'flex',justifyContent:'space-between'}}>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>Value: ₹{(p.stock*p.price).toLocaleString('en-IN')}</span>
                    <span style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>{pct.toFixed(0)}%</span>
                  </div>
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
                <Tooltip contentStyle={{background:'#1e2533',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#e2e8f0'}}/>
                <Line type='monotone' dataKey='v' stroke='#8b5cf6' strokeWidth={2.5} dot={{fill:'#8b5cf6',r:4}} activeDot={{r:6}} name='Sales (₹L)'/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Outreach */}
      {tab==='outreach'&&(
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:16}}>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:4}}>📱 SMS Campaign</div>
            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Reach 847 farmers instantly</div>
            <div style={{marginBottom:12}}>
              <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:6}}>Target Group</label>
              <select style={{...inp,width:'100%'}}><option>All Farmers</option><option>Cotton Farmers</option><option>Paddy Farmers</option></select>
            </div>
            <div style={{marginBottom:16}}>
              <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:6}}>Message</label>
              <textarea rows={4} defaultValue='🌱 Monsoon Sale! 20% off on DAP & Urea. Order on AgriConnect 360!' style={{...inp,resize:'none',width:'100%'}}/>
            </div>
            <button style={{width:'100%',background:'linear-gradient(135deg,#8b5cf6,#6d28d9)',border:'none',borderRadius:10,padding:12,color:'#fff',cursor:'pointer',fontWeight:700,boxShadow:'0 4px 15px rgba(139,92,246,0.4)'}}>📤 Send to 847 Farmers</button>
          </div>
          <div style={{...G.glass,padding:22,borderRadius:14}}>
            <div style={{fontWeight:700,color:'#f1f5f9',marginBottom:4}}>🎟️ Create Coupon</div>
            <div style={{fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',marginBottom:16}}>Attract new buyer farmers</div>
            {[{l:'Coupon Code',v:'MONSOON2026',t:'text'},{l:'Discount %',v:'20',t:'number'},{l:'Valid Until',v:'2026-07-31',t:'date'}].map(f=>(
              <div key={f.l} style={{marginBottom:12}}>
                <label style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.5)',display:'block',marginBottom:6}}>{f.l}</label>
                <input type={f.t} defaultValue={f.v} style={{...inp}}/>
              </div>
            ))}
            <button style={{width:'100%',marginTop:4,background:'rgba(139,92,246,0.12)',border:'1px solid rgba(139,92,246,0.35)',borderRadius:10,padding:12,color:'#a78bfa',cursor:'pointer',fontWeight:700}}>🎟️ Create Coupon</button>
          </div>
        </div>
      )}

      {/* Payments */}
      {tab==='payments'&&(
        <div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:14,marginBottom:20}}>
            {[{i:'💰',v:'₹2.45L',l:'Revenue MTD',g:'rgba(34,197,94,0.1)',c:'#4ade80'},{i:'📄',v:'23',l:'GST Invoices',g:'rgba(59,130,246,0.1)',c:'#60a5fa'},{i:'⏳',v:'₹38.2K',l:'Outstanding',g:'rgba(251,191,36,0.1)',c:'#fbbf24'}].map(m=>(
              <div key={m.l} style={{background:m.g,border:'1px solid rgba(255,255,255,0.08)',borderRadius:14,padding:20}}>
                <div style={{fontSize:'1.8rem',marginBottom:8}}>{m.i}</div>
                <div style={{fontSize:'1.5rem',fontWeight:800,color:m.c,marginBottom:4}}>{m.v}</div>
                <div style={{fontSize:'0.72rem',color:'rgba(255,255,255,0.4)'}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{...G.glass,borderRadius:14,overflow:'hidden'}}>
            <div style={{padding:'14px 18px',borderBottom:'1px solid rgba(255,255,255,0.06)',fontWeight:700,color:'#f1f5f9'}}>Recent Transactions</div>
            {ORDERS.map(o=>(
              <div key={o.id} style={{padding:'12px 18px',borderBottom:'1px solid rgba(255,255,255,0.04)',display:'flex',alignItems:'center',gap:12}}>
                <div style={{width:36,height:36,borderRadius:10,background:'rgba(34,197,94,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>💳</div>
                <div style={{flex:1}}>
                  <div style={{fontSize:'0.85rem',fontWeight:600,color:'#f1f5f9'}}>{o.farmer}</div>
                  <div style={{fontSize:'0.68rem',color:'rgba(255,255,255,0.35)'}}>{o.date} · {o.id}</div>
                </div>
                <div style={{textAlign:'right'}}>
                  <div style={{fontWeight:700,color:'#4ade80'}}>₹{o.total.toLocaleString('en-IN')}</div>
                  <div style={{fontSize:'0.62rem',color:'rgba(255,255,255,0.3)'}}>UPI</div>
                </div>
                <button style={{background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,padding:'5px 10px',color:'rgba(255,255,255,0.5)',cursor:'pointer',fontSize:'0.7rem'}}>Invoice</button>
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
    </div>
  );
}
