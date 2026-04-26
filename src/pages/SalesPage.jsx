import React, { useState, useMemo } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const CROPS_LIST = ['Paddy','Cotton','Sugarcane','Chilli','Maize','Groundnut','Wheat','Vegetables','Banana','Tomato'];
const BUYER_TYPES = ['Mandi / APMC','Private Trader','Broker','Factory','FCI','Direct Consumer','Cooperative','Export'];
const GRADES = ['A+','A','B+','B','C'];

const INIT_SALES = [
  { id:1, crop:'Paddy',    sale_date:'2026-04-20', buyer_name:'Guntur APMC',   buyer_type:'Mandi / APMC', quantity_quintals:45, price_per_quintal:2180, transport_cost:800,  total_amount:98100, net_amount:97300, payment_status:'completed', quality_grade:'A',  market:'Guntur' },
  { id:2, crop:'Cotton',   sale_date:'2026-04-15', buyer_name:'Cotton Broker', buyer_type:'Broker',       quantity_quintals:20, price_per_quintal:6800, transport_cost:1200, total_amount:136000,net_amount:134800,payment_status:'pending',   quality_grade:'B',  market:'Kurnool' },
  { id:3, crop:'Sugarcane',sale_date:'2026-04-10', buyer_name:'Sugar Factory', buyer_type:'Factory',      quantity_quintals:120,price_per_quintal:3450, transport_cost:2000, total_amount:414000,net_amount:412000,payment_status:'completed', quality_grade:'A+', market:'Tenali' },
  { id:4, crop:'Paddy',    sale_date:'2026-03-25', buyer_name:'FCI Depot',     buyer_type:'FCI',          quantity_quintals:60, price_per_quintal:2183, transport_cost:0,    total_amount:130980,net_amount:130980,payment_status:'completed', quality_grade:'A+', market:'Guntur' },
  { id:5, crop:'Chilli',   sale_date:'2026-03-18', buyer_name:'Vijayawada APMC',buyer_type:'Mandi / APMC',quantity_quintals:15, price_per_quintal:8400, transport_cost:600,  total_amount:126000,net_amount:125400,payment_status:'completed', quality_grade:'A',  market:'Vijayawada' },
];

const MONTHLY_DATA = [
  { month:'Nov', revenue:320000, expenses:180000 },
  { month:'Dec', revenue:450000, expenses:210000 },
  { month:'Jan', revenue:280000, expenses:160000 },
  { month:'Feb', revenue:560000, expenses:230000 },
  { month:'Mar', revenue:750000, expenses:280000 },
  { month:'Apr', revenue:905080, expenses:300000 },
];

const BUYER_DIST = [
  { name:'APMC', value:45, color:'#22c55e' },
  { name:'Factory', value:25, color:'#3b82f6' },
  { name:'Broker', value:15, color:'#f59e0b' },
  { name:'Government', value:15, color:'#8b5cf6' },
];

const BLANK = { crop:'Paddy', sale_date:new Date().toISOString().split('T')[0], buyer_type:'Mandi / APMC', buyer_name:'', quantity_quintals:'', price_per_quintal:'', quality_grade:'A', market:'Guntur', transport_cost:'0', payment_status:'completed' };
const INP = { width:'100%', padding:'10px 14px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 };

export default function SalesPage() {
  const { data: dbSales, isLive } = useSupabaseQuery('sales', { orderBy:{ column:'sale_date', ascending:false }, limit:200 }, INIT_SALES);
  const [localSales, setLocalSales] = useState(INIT_SALES);
  const sales = isLive ? dbSales : localSales;

  const [tab, setTab] = useState('overview');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState(BLANK);

  const upd = (k,v) => setForm(p => ({ ...p, [k]:v }));

  const qty = parseFloat(form.quantity_quintals) || 0;
  const ppq = parseFloat(form.price_per_quintal) || 0;
  const tc  = parseFloat(form.transport_cost)    || 0;
  const totalAmount = qty * ppq;
  const netAmount   = totalAmount - tc;

  const handleSave = () => {
    if (!qty || !ppq) return;
    const entry = { ...form, id:Date.now(), quantity_quintals:qty, price_per_quintal:ppq, transport_cost:tc, total_amount:totalAmount, net_amount:netAmount };
    if (!isLive) setLocalSales(prev => [entry, ...prev]);
    setShowAdd(false);
    setForm(BLANK);
  };

  const totalRevenue  = sales.reduce((s,r) => s+(r.total_amount||0), 0);
  const totalNet      = sales.reduce((s,r) => s+(r.net_amount||r.total_amount||0), 0);
  const totalQty      = sales.reduce((s,r) => s+(r.quantity_quintals||0), 0);
  const pendingCount  = sales.filter(s => s.payment_status==='pending').length;
  const totalExpenses = MONTHLY_DATA.reduce((s,m)=>s+m.expenses,0);
  const totalProfit   = MONTHLY_DATA.reduce((s,m)=>s+(m.revenue-m.expenses),0);

  const monthlyWithNew = useMemo(() => {
    const newSales = localSales.filter(s => !INIT_SALES.find(i=>i.id===s.id));
    if (!newSales.length) return MONTHLY_DATA;
    const apr = MONTHLY_DATA.find(m=>m.month==='Apr');
    return MONTHLY_DATA.map(m => m.month==='Apr' ? { ...m, revenue: m.revenue + newSales.reduce((s,r)=>s+(r.total_amount||0),0) } : m);
  }, [localSales]);

  const tabs = [
    { id:'overview',      icon:'📊', label:'Overview' },
    { id:'transactions',  icon:'🧾', label:'Transactions' },
    { id:'profit',        icon:'💰', label:'P&L Calculator' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🧾 Sales &amp; Profit Dashboard</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:2 }}>Revenue tracking • Profit analysis • Payment management</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize:'0.85rem', padding:'8px 16px' }} onClick={() => { setForm(BLANK); setShowAdd(true); }}>
          + Record Sale
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Total Revenue', value:`₹${(totalRevenue/100000).toFixed(1)}L`, icon:'💰', color:'#22c55e' },
          { label:'Net Profit',    value:`₹${(totalProfit/100000).toFixed(1)}L`,  icon:'📈', color:'#3b82f6' },
          { label:'Total Qty',     value:`${totalQty.toLocaleString()} Q`,        icon:'⚖️', color:'#f59e0b' },
          { label:'Pending',       value:pendingCount,                             icon:'⏳', color:'#ef4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{ padding:'10px 18px', borderRadius:'var(--radius-sm)', cursor:'pointer', border:'none', fontSize:'0.82rem', fontWeight:600,
              background:tab===t.id?'var(--text-primary)':'var(--bg-card)', color:tab===t.id?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab==='overview' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 300px', gap:20, marginBottom:20 }}>
            <div className="card" style={{ padding:'20px 24px' }}>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:16 }}>Revenue vs Expenses (₹)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={monthlyWithNew} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)"/>
                  <XAxis dataKey="month" tick={{ fill:'var(--text-muted)', fontSize:12 }}/>
                  <YAxis tick={{ fill:'var(--text-muted)', fontSize:12 }} tickFormatter={v=>`₹${(v/1000).toFixed(0)}K`}/>
                  <Tooltip formatter={v=>[`₹${v.toLocaleString()}`,'']} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}/>
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4,4,0,0]}/>
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4,4,0,0]}/>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="card" style={{ padding:20 }}>
              <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:12 }}>Sales by Buyer Type</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={BUYER_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {BUYER_DIST.map((c,i)=><Cell key={i} fill={c.color}/>)}
                  </Pie>
                  <Tooltip/>
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                {BUYER_DIST.map(b=>(
                  <div key={b.name} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'var(--text-muted)' }}>
                    <div style={{ width:8, height:8, borderRadius:'50%', background:b.color }}/>{b.name} ({b.value}%)
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* P&L Summary */}
          <div className="card" style={{ padding:'20px 24px', background:'linear-gradient(135deg,rgba(34,197,94,0.06),rgba(59,130,246,0.04))' }}>
            <div style={{ fontSize:'0.85rem', fontWeight:700, marginBottom:16 }}>📊 Season P&amp;L Summary — Kharif 2025-26</div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:12 }}>
              {[
                { label:'Gross Revenue', value:`₹${(totalRevenue/100000).toFixed(1)}L`, color:'#22c55e', icon:'💰' },
                { label:'Total Expenses', value:`₹${(totalExpenses/100000).toFixed(1)}L`, color:'#ef4444', icon:'💸' },
                { label:'Net Profit', value:`₹${(totalProfit/100000).toFixed(1)}L`, color:'#3b82f6', icon:'📈' },
                { label:'Profit Margin', value:`${((totalProfit/(totalRevenue||1))*100).toFixed(0)}%`, color:'#8b5cf6', icon:'📊' },
                { label:'ROI', value:`${((totalProfit/(totalExpenses||1))*100).toFixed(0)}%`, color:'#f59e0b', icon:'🎯' },
              ].map(s=>(
                <div key={s.label} style={{ textAlign:'center', padding:'14px 8px', background:'var(--bg-card)', borderRadius:'var(--radius-sm)' }}>
                  <div style={{ fontSize:'1.2rem', marginBottom:4 }}>{s.icon}</div>
                  <div style={{ fontSize:'1.2rem', fontWeight:800, color:s.color }}>{s.value}</div>
                  <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Transactions */}
      {tab==='transactions' && (
        <div className="card">
          <div className="table-wrap">
            <table className="data-table">
              <thead><tr><th>Crop</th><th>Date</th><th>Buyer</th><th>Type</th><th>Qty (Q)</th><th>₹/Q</th><th>Total</th><th>Transport</th><th>Net</th><th>Grade</th><th>Market</th><th>Status</th></tr></thead>
              <tbody>
                {sales.map(s=>(
                  <tr key={s.id}>
                    <td style={{ fontWeight:600, textTransform:'capitalize' }}>{s.crop||s.crop_id}</td>
                    <td>{new Date(s.sale_date).toLocaleDateString('en-IN')}</td>
                    <td style={{ color:'var(--text-muted)' }}>{s.buyer_name}</td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{s.buyer_type}</td>
                    <td style={{ textAlign:'right', fontWeight:600 }}>{s.quantity_quintals}</td>
                    <td>₹{s.price_per_quintal?.toLocaleString()}</td>
                    <td style={{ fontWeight:700, color:'#22c55e' }}>₹{s.total_amount?.toLocaleString()}</td>
                    <td style={{ color:'#ef4444', fontSize:'0.82rem' }}>{s.transport_cost>0?`₹${s.transport_cost}`:'—'}</td>
                    <td style={{ fontWeight:700, color:'#3b82f6' }}>₹{(s.net_amount||s.total_amount)?.toLocaleString()}</td>
                    <td><span className="badge badge-info">{s.quality_grade}</span></td>
                    <td style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{s.market||'—'}</td>
                    <td><span className={`badge ${s.payment_status==='completed'?'badge-success':'badge-warning'}`}>{s.payment_status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* P&L Calculator */}
      {tab==='profit' && (
        <ProfitCalculator/>
      )}

      {/* Add Sale Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={()=>setShowAdd(false)}>
          <div className="card" style={{ width:520, padding:28, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:20 }}>🧾 Record Sale</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              <div>
                <label style={LBL}>Crop *</label>
                <select value={form.crop} onChange={e=>upd('crop',e.target.value)} style={INP}>
                  {CROPS_LIST.map(c=><option key={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>Sale Date</label>
                <input type="date" value={form.sale_date} onChange={e=>upd('sale_date',e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>Buyer Type *</label>
                <select value={form.buyer_type} onChange={e=>upd('buyer_type',e.target.value)} style={INP}>
                  {BUYER_TYPES.map(b=><option key={b}>{b}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>Buyer Name *</label>
                <input placeholder="e.g. Guntur APMC" value={form.buyer_name} onChange={e=>upd('buyer_name',e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>Quantity (Quintals) *</label>
                <input type="number" placeholder="e.g. 15" value={form.quantity_quintals} onChange={e=>upd('quantity_quintals',e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>Price per Quintal (₹) *</label>
                <input type="number" placeholder="e.g. 2100" value={form.price_per_quintal} onChange={e=>upd('price_per_quintal',e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>Quality Grade</label>
                <select value={form.quality_grade} onChange={e=>upd('quality_grade',e.target.value)} style={INP}>
                  {GRADES.map(g=><option key={g}>{g}</option>)}
                </select>
              </div>
              <div>
                <label style={LBL}>Market / Mandi Name</label>
                <input placeholder="e.g. Guntur" value={form.market} onChange={e=>upd('market',e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>Transport Cost (₹)</label>
                <input type="number" placeholder="0" value={form.transport_cost} onChange={e=>upd('transport_cost',e.target.value)} style={INP}/>
              </div>
              <div>
                <label style={LBL}>Payment Status</label>
                <select value={form.payment_status} onChange={e=>upd('payment_status',e.target.value)} style={INP}>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>
            </div>

            {/* Auto-calculated summary */}
            {qty>0 && ppq>0 && (
              <div style={{ marginTop:18, padding:14, background:'rgba(34,197,94,0.08)', borderRadius:8, border:'1px solid rgba(34,197,94,0.2)' }}>
                <div style={{ fontSize:'0.78rem', fontWeight:700, color:'#22c55e', marginBottom:10 }}>📊 Auto Calculation</div>
                <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, textAlign:'center' }}>
                  <div>
                    <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Total Amount</div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:'#22c55e' }}>₹{totalAmount.toLocaleString()}</div>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>{qty} × ₹{ppq}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Transport</div>
                    <div style={{ fontSize:'1rem', fontWeight:800, color:'#ef4444' }}>− ₹{tc.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Net Amount</div>
                    <div style={{ fontSize:'1.1rem', fontWeight:800, color:'#3b82f6' }}>₹{netAmount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )}

            <div style={{ display:'flex', gap:10, marginTop:20 }}>
              <button className="btn btn-primary" disabled={!qty||!ppq} style={{ flex:1 }} onClick={handleSave}>✅ Save Sale</button>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={()=>setShowAdd(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfitCalculator() {
  const [calc, setCalc] = useState({ crop:'Cotton', area:'', yield_q:'', price:'', cost:'' });
  const [result, setResult] = useState(null);
  const u = (k,v) => setCalc(p=>({...p,[k]:v}));
  const compute = () => {
    const area=parseFloat(calc.area)||0, yq=parseFloat(calc.yield_q)||0, price=parseFloat(calc.price)||0, cost=parseFloat(calc.cost)||0;
    const totalQty=area*yq, revenue=totalQty*price, profit=revenue-cost, margin=revenue>0?((profit/revenue)*100).toFixed(1):0;
    setResult({ totalQty, revenue, cost, profit, margin });
  };
  const INP2 = { width:'100%', padding:'8px 12px', borderRadius:'var(--radius-sm)', border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
  return (
    <div className="card" style={{ padding:24, maxWidth:600 }}>
      <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:4 }}>💰 Quick P&amp;L Calculator</div>
      <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:20 }}>Calculate expected profit for any crop</div>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
        <div><label style={LBL}>Crop</label><select value={calc.crop} onChange={e=>u('crop',e.target.value)} style={INP2}>{['Cotton','Paddy','Wheat','Sugarcane','Maize','Chilli'].map(c=><option key={c}>{c}</option>)}</select></div>
        <div><label style={LBL}>Area (acres)</label><input type="number" placeholder="2.5" value={calc.area} onChange={e=>u('area',e.target.value)} style={INP2}/></div>
        <div><label style={LBL}>Expected Yield (Q/acre)</label><input type="number" placeholder="8" value={calc.yield_q} onChange={e=>u('yield_q',e.target.value)} style={INP2}/></div>
        <div><label style={LBL}>Sale Price (₹/Q)</label><input type="number" placeholder="6800" value={calc.price} onChange={e=>u('price',e.target.value)} style={INP2}/></div>
        <div style={{ gridColumn:'1/-1' }}><label style={LBL}>Total Input Cost (₹)</label><input type="number" placeholder="45000" value={calc.cost} onChange={e=>u('cost',e.target.value)} style={INP2}/></div>
      </div>
      <button className="btn btn-primary" style={{ width:'100%', padding:12, fontSize:'0.95rem', marginTop:16 }} onClick={compute}>📊 Calculate Profit</button>
      {result && (
        <div style={{ marginTop:16, padding:14, background:'rgba(34,197,94,0.06)', borderRadius:'var(--radius-sm)', border:'1px solid rgba(34,197,94,0.15)' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, textAlign:'center' }}>
            {[
              { l:'Revenue',    v:`₹${result.revenue.toLocaleString()}`,  c:'#22c55e' },
              { l:'Expenses',   v:`₹${result.cost.toLocaleString()}`,     c:'#ef4444' },
              { l:'Net Profit', v:`₹${result.profit.toLocaleString()}`,   c:'#3b82f6' },
              { l:'Margin',     v:`${result.margin}%`,                   c:'#8b5cf6' },
            ].map(s=><div key={s.l}><div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>{s.l}</div><div style={{ fontWeight:800, color:s.c, fontSize:'1rem' }}>{s.v}</div></div>)}
          </div>
          <div style={{ textAlign:'center', marginTop:10, fontSize:'0.75rem', color:'var(--text-muted)' }}>Total: {result.totalQty.toFixed(1)} Q from {calc.area} acres</div>
        </div>
      )}
    </div>
  );
}
