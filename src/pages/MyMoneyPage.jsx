import React, { useState } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../lib/hooks/useAuth';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { salesDB, expensesDB } from '../lib/supabase';

const PIE_COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#f97316','#06b6d4','#ec4899'];
const CAT_ICONS = { seeds:'🌱', fertilizers:'🧪', pesticides:'💊', labour:'👷', irrigation:'💧', transport:'🚛', equipment:'🚜', misc:'📋', procurement:'📦', inventory:'🏪', logistics:'🚛', marketing:'📢', wages:'💰', utilities:'⚡' };
const CROPS = ['Paddy','Cotton','Chilli','Sugarcane','Maize','Groundnut','Vegetables','Banana','Tomato','Other'];
const PAY_METHODS = ['UPI','Cash','Bank Transfer','Cheque'];

const ROLE_MONEY = {
  farmer:     { title:'💰 My Farm Money', desc:'Crop sales, farm expenses & profit tracker', incomeLabel:'+ Sale', expenseLabel:'+ Expense', profitLabel:'Season Profit' },
  broker:     { title:'💰 Trade Finance', desc:'Commission tracking, deal expenses & profit', incomeLabel:'+ Commission', expenseLabel:'+ Cost', profitLabel:'Net Earnings' },
  supplier:   { title:'💰 Shop Finances', desc:'Product sales, inventory costs & margin tracker', incomeLabel:'+ Revenue', expenseLabel:'+ Cost', profitLabel:'Net Margin' },
  industrial: { title:'💰 Business Finance', desc:'Procurement costs, revenue & P&L tracker', incomeLabel:'+ Revenue', expenseLabel:'+ Cost', profitLabel:'Net P&L' },
  labour:     { title:'💰 My Earnings', desc:'Job payments, daily wages & expense tracker', incomeLabel:'+ Payment', expenseLabel:'+ Expense', profitLabel:'Net Savings' },
  customer:   { title:'💰 My Spending', desc:'Purchase history & budget tracker', incomeLabel:'+ Refund', expenseLabel:'+ Purchase', profitLabel:'Total Spent' },
};

const INIT_INCOME = [
  { id:1, type:'income', crop:'Paddy', desc:'Sold at Guntur APMC', buyer:'Guntur APMC', qty:45, rate:2180, amount:98100, date:'2026-04-20', method:'UPI', status:'received' },
  { id:2, type:'income', crop:'Cotton', desc:'Cotton sale', buyer:'Cotton Broker', qty:20, rate:6800, amount:136000, date:'2026-04-15', method:'Cash', status:'pending' },
  { id:3, type:'income', crop:'Sugarcane', desc:'Factory delivery', buyer:'Sugar Factory', qty:120, rate:3450, amount:414000, date:'2026-04-10', method:'Bank Transfer', status:'received' },
  { id:4, type:'income', crop:'Chilli', desc:'APMC auction', buyer:'Vijayawada APMC', qty:15, rate:8400, amount:126000, date:'2026-03-18', method:'UPI', status:'received' },
];

const INIT_EXPENSE = [
  { id:101, type:'expense', category:'seeds', desc:'Paddy Seeds (BPT-5204)', crop:'Paddy', amount:4500, date:'2026-04-10', method:'UPI' },
  { id:102, type:'expense', category:'fertilizers', desc:'Urea 50kg + DAP', crop:'Paddy', amount:2800, date:'2026-04-12', method:'Cash' },
  { id:103, type:'expense', category:'labour', desc:'Harvesting crew (5 days)', crop:'Cotton', amount:12000, date:'2026-04-15', method:'Cash' },
  { id:104, type:'expense', category:'pesticides', desc:'Insecticide spray', crop:'Paddy', amount:1800, date:'2026-04-16', method:'UPI' },
  { id:105, type:'expense', category:'irrigation', desc:'Borewell electricity', crop:'Paddy', amount:3200, date:'2026-04-18', method:'Cash' },
  { id:106, type:'expense', category:'transport', desc:'Transport to Guntur APMC', crop:'Cotton', amount:5000, date:'2026-04-20', method:'UPI' },
  { id:107, type:'expense', category:'equipment', desc:'Tractor Rental', crop:'Paddy', amount:8500, date:'2026-04-22', method:'Cash' },
];

const INP = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 };

export default function MyMoneyPage() {
  const { t, tx } = useLanguage();
  const { profile, user } = useAuth();
  const role = profile?.role || 'farmer';
  const rm = ROLE_MONEY[role] || ROLE_MONEY.farmer;
  const uid = user?.id || profile?.id || '';
  const isGuest = !uid;

  const [income, setIncome] = useState(INIT_INCOME);
  const [expenses, setExpenses] = useState(INIT_EXPENSE);
  const [tab, setTab] = useState('summary');
  const [showAdd, setShowAdd] = useState(null);
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  // Load from Supabase on mount per user
  React.useEffect(() => {
    if (isGuest) return;
    (async () => {
      try {
        const { data: sd } = await salesDB.getAll(uid);
        if (sd?.length) setIncome(sd.map(s => ({ id:s.id, type:'income', crop:s.crop_type||s.crop||'Crop', desc:s.description||'', buyer:s.buyer_name||'', qty:s.quantity_quintals||0, rate:s.price_per_quintal||0, amount:s.total_amount||0, date:s.sale_date||'', method:s.payment_method||'UPI', status:s.payment_status||'received' })));
        const { data: ed } = await expensesDB.getAll(uid);
        if (ed?.length) setExpenses(ed.map(e => ({ id:e.id, type:'expense', category:e.category||'misc', desc:e.description||'', crop:e.crop||'Paddy', amount:e.amount||0, date:e.expense_date||'', method:e.payment_method||'UPI' })));
      } catch(e) { /* silently handled */ }
    })();
  }, [uid, isGuest]);

  const totalIncome = income.reduce((s,r) => s+(r.amount||0), 0);
  const totalExpense = expenses.reduce((s,r) => s+(r.amount||0), 0);
  const profit = totalIncome - totalExpense;
  const pending = income.filter(r => r.status==='pending').reduce((s,r) => s+r.amount, 0);
  const expByCat = Object.entries(expenses.reduce((a,e) => { a[e.category]=(a[e.category]||0)+e.amount; return a; }, {})).map(([name,value]) => ({name,value})).sort((a,b) => b.value-a.value);
  const upd = (k,v) => setForm(p => ({...p,[k]:v}));
  const allRecords = [...income.map(r=>({...r,sortDate:r.date})),...expenses.map(r=>({...r,sortDate:r.date}))].sort((a,b)=>(b.sortDate||'').localeCompare(a.sortDate||''));

  const saveIncome = async () => {
    const qty=parseFloat(form.qty)||0, rate=parseFloat(form.rate)||0;
    if (!qty||!rate) return;
    setSaving(true);
    const rec = { id:Date.now(), type:'income', crop:form.crop||'Paddy', desc:form.desc||'', buyer:form.buyer||'', qty, rate, amount:qty*rate, date:form.date||new Date().toISOString().split('T')[0], method:form.method||'UPI', status:'received' };
    if (!isGuest) {
      try {
        const { data } = await salesDB.create({ farmer_id:uid, crop_type:rec.crop, description:rec.desc, buyer_name:rec.buyer, quantity_quintals:qty, price_per_quintal:rate, total_amount:rec.amount, sale_date:rec.date, payment_method:rec.method, payment_status:'received' });
        if (data?.id) rec.id = data.id;
      } catch(e) { /* silently handled */ }
    }
    setIncome(prev => [rec,...prev]); setSaving(false); setShowAdd(null);
  };

  const saveExpense = async () => {
    const amt=parseFloat(form.amount)||0;
    if (!amt) return;
    setSaving(true);
    const rec = { id:Date.now(), type:'expense', category:form.category||'misc', desc:form.desc||'', crop:form.crop||'Paddy', amount:amt, date:form.date||new Date().toISOString().split('T')[0], method:form.method||'UPI' };
    if (!isGuest) {
      try {
        const { data } = await expensesDB.create({ farmer_id:uid, category:rec.category, description:rec.desc, crop:rec.crop, amount:amt, expense_date:rec.date, payment_method:rec.method });
        if (data?.id) rec.id = data.id;
      } catch(e) { /* silently handled */ }
    }
    setExpenses(prev => [rec,...prev]); setSaving(false); setShowAdd(null);
  };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">{rm.title}</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{rm.desc}</div>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          <button className="btn btn-primary" style={{ fontSize:'0.82rem', padding:'8px 14px' }} onClick={() => { setForm({ crop:'Paddy', date:new Date().toISOString().split('T')[0], method:'UPI' }); setShowAdd('income'); }}>{rm.incomeLabel}</button>
          <button style={{ padding:'8px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'#ef4444', fontSize:'0.82rem', fontWeight:600, cursor:'pointer' }} onClick={() => { setForm({ category:'seeds', crop:'Paddy', date:new Date().toISOString().split('T')[0], method:'UPI' }); setShowAdd('expense'); }}>{rm.expenseLabel}</button>
        </div>
      </div>

      {/* Profit Card */}
      <div style={{ background: profit>=0 ? 'linear-gradient(135deg, rgba(34,197,94,0.12), rgba(59,130,246,0.06))' : 'linear-gradient(135deg, rgba(239,68,68,0.12), rgba(239,68,68,0.04))', border:`1px solid ${profit>=0?'rgba(34,197,94,0.2)':'rgba(239,68,68,0.2)'}`, borderRadius:14, padding:'20px 24px', marginBottom:16, textAlign:'center' }}>
        <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:4 }}>{rm.profitLabel}</div>
        <div style={{ fontSize:'2.2rem', fontWeight:900, color:profit>=0?'#22c55e':'#ef4444' }}>₹{(profit/1000).toFixed(1)}K</div>
        <div style={{ display:'flex', justifyContent:'center', gap:24, marginTop:10 }}>
          <div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Income</div><div style={{ fontWeight:700, color:'#22c55e', fontSize:'1rem' }}>₹{(totalIncome/1000).toFixed(0)}K</div></div>
          <div style={{ width:1, background:'var(--border)' }} />
          <div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Expenses</div><div style={{ fontWeight:700, color:'#ef4444', fontSize:'1rem' }}>₹{(totalExpense/1000).toFixed(0)}K</div></div>
          <div style={{ width:1, background:'var(--border)' }} />
          <div><div style={{ fontSize:'0.68rem', color:'var(--text-muted)' }}>Pending</div><div style={{ fontWeight:700, color:'#f59e0b', fontSize:'1rem' }}>₹{(pending/1000).toFixed(0)}K</div></div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:6, marginBottom:16 }}>
        {[{ id:'summary', icon:'📊', label:'Summary' },{ id:'income', icon:'💵', label:'Sales' },{ id:'expenses', icon:'💸', label:'Expenses' },{ id:'all', icon:'📋', label:'All Records' }].map(tb => (
          <button key={tb.id} onClick={() => setTab(tb.id)} style={{ padding:'8px 14px', borderRadius:8, cursor:'pointer', border:'none', fontSize:'0.8rem', fontWeight:600, background:tab===tb.id?'var(--text-primary)':'var(--bg-card)', color:tab===tb.id?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>{tb.icon} {tb.label}</button>
        ))}
      </div>

      {/* Summary */}
      {tab==='summary' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, marginBottom:12 }}>💸 Where Money Goes</div>
            <ResponsiveContainer width="100%" height={180}>
              <PieChart><Pie data={expByCat} cx="50%" cy="50%" outerRadius={70} innerRadius={40} dataKey="value" paddingAngle={3}>{expByCat.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]} />)}</Pie>
              <Tooltip formatter={v => [`₹${v.toLocaleString()}`,'Amount']} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }} /></PieChart>
            </ResponsiveContainer>
            <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>{expByCat.map((b,i) => (<div key={b.name} style={{ display:'flex', alignItems:'center', gap:4, fontSize:'0.72rem', color:'var(--text-muted)' }}><div style={{ width:8, height:8, borderRadius:'50%', background:PIE_COLORS[i%PIE_COLORS.length] }} />{CAT_ICONS[b.name]||'📋'} {b.name}</div>))}</div>
          </div>
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, marginBottom:12 }}>🎯 Expense Categories</div>
            {expByCat.map((cat,i) => { const pct=Math.round((cat.value/totalExpense)*100); return (
              <div key={cat.name} style={{ marginBottom:12 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4 }}><span style={{ fontSize:'0.8rem', fontWeight:600, textTransform:'capitalize' }}>{CAT_ICONS[cat.name]||'📋'} {cat.name}</span><span style={{ fontSize:'0.78rem', fontWeight:700, color:PIE_COLORS[i%PIE_COLORS.length] }}>₹{cat.value.toLocaleString()}</span></div>
                <div style={{ height:6, background:'var(--bg-primary)', borderRadius:3, overflow:'hidden' }}><div style={{ height:'100%', width:`${pct}%`, background:PIE_COLORS[i%PIE_COLORS.length], borderRadius:3 }} /></div>
              </div>); })}
          </div>
          <div className="card" style={{ padding:20, gridColumn:'1/-1' }}>
            <div style={{ fontSize:'0.82rem', fontWeight:700, marginBottom:12 }}>📋 Recent Activity</div>
            {allRecords.slice(0,8).map(r => (
              <div key={r.id} style={{ display:'flex', alignItems:'center', padding:'8px 0', gap:10, borderBottom:'1px solid var(--border)' }}>
                <div style={{ width:36, height:36, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', background:r.type==='income'?'rgba(34,197,94,0.1)':'rgba(239,68,68,0.1)' }}>{r.type==='income'?'💵':CAT_ICONS[r.category]||'💸'}</div>
                <div style={{ flex:1 }}><div style={{ fontSize:'0.82rem', fontWeight:600 }}>{r.desc||r.crop}</div><div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{r.crop} • {new Date(r.date).toLocaleDateString('en-IN')}</div></div>
                <div style={{ fontWeight:700, color:r.type==='income'?'#22c55e':'#ef4444', fontSize:'0.9rem' }}>{r.type==='income'?'+':'-'}₹{r.amount.toLocaleString()}</div>
              </div>))}
          </div>
        </div>
      )}

      {/* Income Tab */}
      {tab==='income' && (
        <div className="card"><div className="table-wrap"><table className="data-table">
          <thead><tr><th>Crop</th><th>Date</th><th>Buyer</th><th>Qty (Q)</th><th>₹/Q</th><th>Total</th><th>Payment</th><th>Status</th></tr></thead>
          <tbody>{income.map(s => (<tr key={s.id}><td style={{ fontWeight:600 }}>{s.crop}</td><td>{new Date(s.date).toLocaleDateString('en-IN')}</td><td style={{ color:'var(--text-muted)' }}>{s.buyer}</td><td style={{ textAlign:'right', fontWeight:600 }}>{s.qty}</td><td>₹{s.rate?.toLocaleString()}</td><td style={{ fontWeight:700, color:'#22c55e' }}>₹{s.amount.toLocaleString()}</td><td style={{ fontSize:'0.78rem' }}>{s.method}</td><td><span className={`badge ${s.status==='received'?'badge-success':'badge-warning'}`}>{s.status}</span></td></tr>))}</tbody>
        </table></div></div>
      )}

      {/* Expenses Tab */}
      {tab==='expenses' && (
        <div className="card"><div className="table-wrap"><table className="data-table">
          <thead><tr><th>Category</th><th>Description</th><th>Crop</th><th>Amount</th><th>Date</th><th>Payment</th></tr></thead>
          <tbody>{expenses.map(e => (<tr key={e.id}><td><span className="badge badge-info">{CAT_ICONS[e.category]||'📋'} {e.category}</span></td><td style={{ color:'var(--text-secondary)' }}>{e.desc||'—'}</td><td style={{ fontSize:'0.8rem', color:'var(--text-muted)' }}>{e.crop||'—'}</td><td style={{ fontWeight:700, color:'#ef4444' }}>₹{e.amount.toLocaleString()}</td><td>{new Date(e.date).toLocaleDateString('en-IN')}</td><td style={{ fontSize:'0.78rem' }}>{e.method}</td></tr>))}</tbody>
        </table></div></div>
      )}

      {/* All Records */}
      {tab==='all' && (
        <div className="card" style={{ padding:16 }}>
          {allRecords.map(r => (
            <div key={r.id} style={{ display:'flex', alignItems:'center', padding:'10px 0', gap:10, borderBottom:'1px solid var(--border)' }}>
              <div style={{ width:38, height:38, borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.1rem', background:r.type==='income'?'rgba(34,197,94,0.12)':'rgba(239,68,68,0.12)' }}>{r.type==='income'?'💵':CAT_ICONS[r.category]||'💸'}</div>
              <div style={{ flex:1 }}><div style={{ fontSize:'0.85rem', fontWeight:600 }}>{r.desc||r.crop}</div><div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{r.crop} • {r.method} • {new Date(r.date).toLocaleDateString('en-IN')}</div></div>
              <div style={{ textAlign:'right' }}><div style={{ fontWeight:700, color:r.type==='income'?'#22c55e':'#ef4444', fontSize:'0.95rem' }}>{r.type==='income'?'+':'-'}₹{r.amount.toLocaleString()}</div>{r.type==='income'&&r.status==='pending'&&<div style={{ fontSize:'0.65rem', color:'#f59e0b' }}>⏳ Pending</div>}</div>
            </div>))}
        </div>
      )}

      {/* Add Income Modal */}
      {showAdd==='income' && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setShowAdd(null)}>
          <div className="card" style={{ width:440, padding:24, maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>💵 Record Sale</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={LBL}>Crop</label><select value={form.crop||'Paddy'} onChange={e => upd('crop',e.target.value)} style={INP}>{CROPS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div><label style={LBL}>Date</label><input type="date" value={form.date||''} onChange={e => upd('date',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Buyer Name</label><input placeholder="e.g. Guntur APMC" value={form.buyer||''} onChange={e => upd('buyer',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Description</label><input placeholder="e.g. Sold paddy" value={form.desc||''} onChange={e => upd('desc',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Quantity (Quintals) *</label><input type="number" placeholder="e.g. 15" value={form.qty||''} onChange={e => upd('qty',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Price per Quintal (₹) *</label><input type="number" placeholder="e.g. 2100" value={form.rate||''} onChange={e => upd('rate',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Payment</label><select value={form.method||'UPI'} onChange={e => upd('method',e.target.value)} style={INP}>{PAY_METHODS.map(p => <option key={p}>{p}</option>)}</select></div>
            </div>
            {(parseFloat(form.qty)>0 && parseFloat(form.rate)>0) && (
              <div style={{ marginTop:14, padding:12, background:'rgba(34,197,94,0.08)', borderRadius:8, textAlign:'center' }}>
                <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Total Amount</div>
                <div style={{ fontSize:'1.4rem', fontWeight:800, color:'#22c55e' }}>₹{(parseFloat(form.qty)*parseFloat(form.rate)).toLocaleString()}</div>
              </div>)}
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className="btn btn-primary" style={{ flex:1 }} disabled={saving} onClick={saveIncome}>{saving?'⏳ Saving...':'✅ Save Sale'}</button>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setShowAdd(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Expense Modal */}
      {showAdd==='expense' && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setShowAdd(null)}>
          <div className="card" style={{ width:440, padding:24, maxHeight:'90vh', overflowY:'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:16 }}>💸 Add Expense</div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div><label style={LBL}>Category *</label><select value={form.category||'seeds'} onChange={e => upd('category',e.target.value)} style={INP}>{Object.keys(CAT_ICONS).map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}</select></div>
              <div><label style={LBL}>Crop</label><select value={form.crop||'Paddy'} onChange={e => upd('crop',e.target.value)} style={INP}>{CROPS.map(c => <option key={c}>{c}</option>)}</select></div>
              <div style={{ gridColumn:'1/-1' }}><label style={LBL}>Description</label><input placeholder="e.g. Urea 50kg purchase" value={form.desc||''} onChange={e => upd('desc',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Amount (₹) *</label><input type="number" placeholder="e.g. 2500" value={form.amount||''} onChange={e => upd('amount',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Date</label><input type="date" value={form.date||''} onChange={e => upd('date',e.target.value)} style={INP} /></div>
              <div><label style={LBL}>Payment</label><select value={form.method||'UPI'} onChange={e => upd('method',e.target.value)} style={INP}>{PAY_METHODS.map(p => <option key={p}>{p}</option>)}</select></div>
            </div>
            <div style={{ display:'flex', gap:10, marginTop:16 }}>
              <button className="btn btn-primary" style={{ flex:1 }} disabled={!form.amount||saving} onClick={saveExpense}>{saving?'⏳ Saving...':'✅ Save Expense'}</button>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setShowAdd(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
