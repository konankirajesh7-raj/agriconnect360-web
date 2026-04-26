import React, { useState, useRef } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { useSupabaseQuery, useSupabaseMutation } from '../lib/hooks/useSupabaseQuery';

const PIE_COLORS = ['#22c55e','#3b82f6','#f59e0b','#ef4444','#8b5cf6','#f97316','#06b6d4','#ec4899'];
const CAT_ICONS = { seeds:'🌱', fertilizers:'🧪', pesticides:'💊', labour:'👷', irrigation:'💧', transport:'🚛', equipment:'🚜', misc:'📋' };
const CROPS = ['Paddy','Cotton','Chilli','Sugarcane','Maize','Groundnut','Vegetables','Banana','Tomato','Other'];
const PAY_METHODS = ['UPI','Cash','Bank Transfer','Cheque','Credit'];

const INIT_EXPENSES = [
  { id:1, category:'seeds',       description:'Paddy Seeds',        crop:'Paddy',   vendor:'Raju Agri Store',  amount:4500,  expense_date:'2026-04-10', payment:'UPI',  receipt:null },
  { id:2, category:'fertilizers', description:'Urea 50kg',          crop:'Paddy',   vendor:'SV Fertilizers',   amount:2800,  expense_date:'2026-04-12', payment:'Cash', receipt:null },
  { id:3, category:'labour',      description:'Harvesting crew',     crop:'Cotton',  vendor:'Ramaiah Workers',  amount:12000, expense_date:'2026-04-15', payment:'Cash', receipt:null },
  { id:4, category:'pesticides',  description:'Insecticide spray',   crop:'Paddy',   vendor:'AgriChem',         amount:1800,  expense_date:'2026-04-16', payment:'UPI',  receipt:null },
  { id:5, category:'irrigation',  description:'Borewell electricity',crop:'Paddy',   vendor:'AP-EPDCL',        amount:3200,  expense_date:'2026-04-18', payment:'Cash', receipt:null },
  { id:6, category:'transport',   description:'To Guntur APMC',      crop:'Cotton',  vendor:'Sri Sai Travels',  amount:5000,  expense_date:'2026-04-20', payment:'UPI',  receipt:null },
  { id:7, category:'equipment',   description:'Tractor Rental',      crop:'Paddy',   vendor:'Venkat Machinery', amount:8500,  expense_date:'2026-04-22', payment:'Cash', receipt:null },
];

const BUDGET_DATA = [
  { category:'seeds', budget:8000, spent:4500 },
  { category:'fertilizers', budget:6000, spent:2800 },
  { category:'pesticides', budget:5000, spent:1800 },
  { category:'labour', budget:15000, spent:12000 },
  { category:'irrigation', budget:5000, spent:3200 },
  { category:'transport', budget:8000, spent:5000 },
  { category:'equipment', budget:10000, spent:8500 },
];

const BLANK_FORM = { category:'seeds', description:'', crop:'Paddy', vendor:'', amount:'', expense_date:new Date().toISOString().split('T')[0], payment:'UPI', receipt:null };

const INP = { width:'100%', padding:'10px 14px', borderRadius:6, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.9rem', boxSizing:'border-box' };
const LBL = { display:'block', fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 };

export default function ExpensesPage() {
  const { data: dbExpenses, isLive } = useSupabaseQuery('expenses', { select:'*', orderBy:{ column:'expense_date', ascending:false }, limit:200 }, INIT_EXPENSES);
  const { insert } = useSupabaseMutation('expenses');

  const [localList, setLocalList] = useState(INIT_EXPENSES);
  const expenses = isLive ? dbExpenses : localList;
  const setExpenses = isLive ? null : setLocalList;

  const [tab, setTab] = useState('overview');
  const [catFilter, setCatFilter] = useState('all');
  const [monthFilter, setMonthFilter] = useState('all');
  const [showAdd, setShowAdd] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState(BLANK_FORM);
  const [saving, setSaving] = useState(false);
  const receiptRef = useRef();

  const upd = (k, v) => setForm(p => ({ ...p, [k]: v }));

  // Derived
  const allMonths = [...new Set(expenses.map(e => e.expense_date?.slice(0,7)).filter(Boolean))].sort().reverse();
  const filtered = expenses.filter(e => {
    const catOk = catFilter === 'all' || e.category === catFilter;
    const monOk = monthFilter === 'all' || e.expense_date?.startsWith(monthFilter);
    return catOk && monOk;
  });
  const totalSpent = expenses.reduce((s,e) => s+(e.amount||0), 0);
  const totalBudget = BUDGET_DATA.reduce((s,b) => s+b.budget, 0);
  const cats = [...new Set(expenses.map(e=>e.category))];
  const pieData = cats.map(cat => ({ name:cat, value:expenses.filter(e=>e.category===cat).reduce((s,e)=>s+e.amount,0) }));

  const resetForm = () => { setForm(BLANK_FORM); setEditTarget(null); setShowAdd(false); };

  const handleSave = async () => {
    if (!form.amount) return;
    setSaving(true);
    const entry = { ...form, amount:parseFloat(form.amount), id: editTarget?.id || Date.now() };
    if (isLive) {
      await insert(entry);
    } else {
      if (editTarget) {
        setExpenses(prev => prev.map(e => e.id === editTarget.id ? entry : e));
      } else {
        setExpenses(prev => [entry, ...prev]);
      }
    }
    setSaving(false);
    resetForm();
  };

  const handleEdit = (expense) => {
    setEditTarget(expense);
    setForm({ ...expense, amount: String(expense.amount) });
    setShowAdd(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    if (isLive) { /* call delete mutation */ }
    else setExpenses(prev => prev.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  const handleReceipt = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => upd('receipt', reader.result);
    reader.readAsDataURL(file);
  };

  const tabs = [
    { id:'overview', icon:'📊', label:'Overview' },
    { id:'budget',   icon:'🎯', label:'Budget Tracker' },
    { id:'records',  icon:'🧾', label:'All Records' },
  ];

  return (
    <div className="animated">
      {/* Header */}
      <div className="section-header">
        <div>
          <div className="section-title">💳 Expense &amp; Budget Manager</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>
            Track costs • Set budgets • {isLive ? '🟢 Live' : '🟡 Demo data'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditTarget(null); setForm(BLANK_FORM); setShowAdd(true); }} style={{ fontSize:'0.85rem', padding:'8px 16px' }}>
          + Add Expense
        </button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          { label:'Total Spent', value:`₹${(totalSpent/1000).toFixed(1)}K`, icon:'💳', color:'#ef4444' },
          { label:'Budget', value:`₹${(totalBudget/1000).toFixed(0)}K`, icon:'🎯', color:'#3b82f6' },
          { label:'Utilization', value:`${Math.round((totalSpent/totalBudget)*100)}%`, icon:'📊', color:totalSpent>totalBudget*0.9?'#ef4444':'#22c55e' },
          { label:'Remaining', value:`₹${((totalBudget-totalSpent)/1000).toFixed(1)}K`, icon:'💰', color:'#22c55e' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize:'1.8rem', marginBottom:8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color:s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Month Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:16, flexWrap:'wrap', alignItems:'center' }}>
        <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600 }}>Month:</span>
        {['all', ...allMonths].map(m => (
          <button key={m} onClick={() => setMonthFilter(m)}
            style={{ padding:'5px 12px', borderRadius:20, border:'none', cursor:'pointer', fontSize:'0.78rem', fontWeight:600,
              background:monthFilter===m?'#22c55e':'var(--bg-card)', color:monthFilter===m?'#fff':'var(--text-muted)', transition:'all 0.2s' }}>
            {m === 'all' ? 'All Months' : m}
          </button>
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

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div style={{ display:'grid', gridTemplateColumns:'1fr 280px', gap:20 }}>
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:16 }}>Expense by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} innerRadius={50} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent*100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_,i) => <Cell key={i} fill={PIE_COLORS[i%PIE_COLORS.length]}/>)}
                </Pie>
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Amount']} contentStyle={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:8 }}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)', marginBottom:16 }}>Category Breakdown</div>
            {[...pieData].sort((a,b)=>b.value-a.value).map((p,i) => (
              <div key={p.name} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                  <span>{CAT_ICONS[p.name]||'📋'}</span>
                  <span style={{ fontSize:'0.85rem', color:'var(--text-secondary)', textTransform:'capitalize' }}>{p.name}</span>
                </div>
                <span style={{ fontSize:'0.85rem', fontWeight:600, color:PIE_COLORS[i%PIE_COLORS.length] }}>₹{p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Budget Tab */}
      {tab === 'budget' && (
        <div className="card" style={{ padding:24 }}>
          <div style={{ fontSize:'0.95rem', fontWeight:700, marginBottom:4 }}>🎯 Budget vs Actual — Kharif 2024-25</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginBottom:20 }}>Track spending against your season budget</div>
          {BUDGET_DATA.map(b => {
            const pct = Math.round((b.spent/b.budget)*100);
            const isOver = pct > 90;
            return (
              <div key={b.category} style={{ marginBottom:16 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <div style={{ display:'flex', gap:8, alignItems:'center' }}>
                    <span>{CAT_ICONS[b.category]||'📋'}</span>
                    <span style={{ fontSize:'0.85rem', fontWeight:600, textTransform:'capitalize' }}>{b.category}</span>
                  </div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>
                    <span style={{ fontWeight:700, color:isOver?'#ef4444':'#22c55e' }}>₹{b.spent.toLocaleString()}</span> / ₹{b.budget.toLocaleString()}
                  </div>
                </div>
                <div style={{ height:10, background:'var(--bg-primary)', borderRadius:5, overflow:'hidden' }}>
                  <div style={{ height:'100%', width:`${Math.min(pct,100)}%`, background:isOver?'#ef4444':pct>70?'#f59e0b':'#22c55e', borderRadius:5, transition:'width 0.5s ease' }}/>
                </div>
                <div style={{ textAlign:'right', fontSize:'0.7rem', color:isOver?'#ef4444':'var(--text-muted)', marginTop:2, fontWeight:isOver?700:400 }}>
                  {pct}% used {isOver && '⚠️'}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Records Tab */}
      {tab === 'records' && (
        <>
          <div style={{ display:'flex', gap:8, marginBottom:12, flexWrap:'wrap' }}>
            {['all', ...cats].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={`filter-btn${catFilter===c?' active':''}`}>
                {c === 'all' ? 'All' : `${CAT_ICONS[c]||'📋'} ${c}`}
              </button>
            ))}
          </div>
          <div className="card">
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>Category</th><th>Description</th><th>Crop</th><th>Vendor</th><th>Amount</th><th>Payment</th><th>Date</th><th>Receipt</th><th>Actions</th></tr></thead>
                <tbody>
                  {filtered.map(e => (
                    <tr key={e.id}>
                      <td><span className="badge badge-info">{CAT_ICONS[e.category]||'📋'} {e.category}</span></td>
                      <td style={{ color:'var(--text-secondary)' }}>{e.description||'—'}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{e.crop||'—'}</td>
                      <td style={{ color:'var(--text-muted)', fontSize:'0.8rem' }}>{e.vendor||'—'}</td>
                      <td style={{ fontWeight:700, color:'#ef4444' }}>₹{e.amount?.toLocaleString()}</td>
                      <td style={{ fontSize:'0.78rem' }}>{e.payment||'—'}</td>
                      <td>{e.expense_date ? new Date(e.expense_date).toLocaleDateString('en-IN') : '—'}</td>
                      <td>
                        {e.receipt
                          ? <img src={e.receipt} alt="receipt" style={{ width:36, height:36, objectFit:'cover', borderRadius:4, border:'1px solid var(--border)' }}/>
                          : <span style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>—</span>}
                      </td>
                      <td>
                        <div style={{ display:'flex', gap:6 }}>
                          <button onClick={() => handleEdit(e)} title="Edit" style={{ background:'rgba(59,130,246,0.12)', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#3b82f6', fontSize:'0.75rem' }}>✏️</button>
                          <button onClick={() => setDeleteTarget(e)} title="Delete" style={{ background:'rgba(239,68,68,0.12)', border:'none', borderRadius:6, padding:'4px 8px', cursor:'pointer', color:'#ef4444', fontSize:'0.75rem' }}>🗑️</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filtered.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>No expenses found for this filter.</div>}
            </div>
          </div>
        </>
      )}

      {/* Add / Edit Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.65)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={resetForm}>
          <div className="card" style={{ width:480, padding:28, maxHeight:'90vh', overflowY:'auto' }} onClick={e=>e.stopPropagation()}>
            <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:20 }}>💳 {editTarget ? 'Edit Expense' : 'Add Expense'}</div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {/* Category */}
              <div>
                <label style={LBL}>Category *</label>
                <select value={form.category} onChange={e=>upd('category',e.target.value)} style={INP}>
                  {Object.keys(CAT_ICONS).map(c=><option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
                </select>
              </div>
              {/* Crop */}
              <div>
                <label style={LBL}>Linked Crop</label>
                <select value={form.crop} onChange={e=>upd('crop',e.target.value)} style={INP}>
                  {CROPS.map(c=><option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              {/* Description */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={LBL}>Description</label>
                <input style={INP} placeholder="e.g. BPT-5204 seeds purchase" value={form.description} onChange={e=>upd('description',e.target.value)}/>
              </div>
              {/* Vendor */}
              <div>
                <label style={LBL}>Vendor / Shop</label>
                <input style={INP} placeholder="e.g. Agri Stores, Guntur" value={form.vendor} onChange={e=>upd('vendor',e.target.value)}/>
              </div>
              {/* Amount */}
              <div>
                <label style={LBL}>Amount (₹) *</label>
                <input type="number" style={INP} placeholder="e.g. 2500" value={form.amount} onChange={e=>upd('amount',e.target.value)}/>
              </div>
              {/* Date */}
              <div>
                <label style={LBL}>Date</label>
                <input type="date" style={INP} value={form.expense_date} onChange={e=>upd('expense_date',e.target.value)}/>
              </div>
              {/* Payment Method */}
              <div>
                <label style={LBL}>Payment Method</label>
                <select value={form.payment} onChange={e=>upd('payment',e.target.value)} style={INP}>
                  {PAY_METHODS.map(p=><option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              {/* Receipt */}
              <div style={{ gridColumn:'1/-1' }}>
                <label style={LBL}>Receipt (optional)</label>
                <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                  <button type="button" onClick={()=>receiptRef.current?.click()} style={{ padding:'8px 16px', background:'var(--bg-primary)', border:'1px dashed var(--border)', borderRadius:6, color:'var(--text-muted)', cursor:'pointer', fontSize:'0.82rem' }}>
                    📎 Upload Receipt
                  </button>
                  <input ref={receiptRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleReceipt}/>
                  {form.receipt && <img src={form.receipt} alt="receipt" style={{ width:48, height:48, objectFit:'cover', borderRadius:6, border:'1px solid var(--border)' }}/>}
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:10, marginTop:24 }}>
              <button className="btn btn-primary" disabled={saving||!form.amount} style={{ flex:1 }} onClick={handleSave}>
                {saving ? '🔄 Saving...' : `✅ ${editTarget ? 'Update Expense' : 'Save Expense'}`}
              </button>
              <button className="btn btn-outline" onClick={resetForm} style={{ flex:1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteTarget && (
        <div style={{ position:'fixed', inset:0, zIndex:1001, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }}>
          <div className="card" style={{ width:360, padding:28, textAlign:'center' }}>
            <div style={{ fontSize:'2rem', marginBottom:12 }}>🗑️</div>
            <div style={{ fontSize:'1rem', fontWeight:700, marginBottom:8 }}>Delete Expense?</div>
            <div style={{ fontSize:'0.85rem', color:'var(--text-muted)', marginBottom:20 }}>
              "{deleteTarget.description}" — ₹{deleteTarget.amount?.toLocaleString()}<br/>This cannot be undone.
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button className="btn btn-outline" style={{ flex:1 }} onClick={() => setDeleteTarget(null)}>Cancel</button>
              <button style={{ flex:1, padding:'10px', background:'#ef4444', color:'#fff', border:'none', borderRadius:8, cursor:'pointer', fontWeight:700 }} onClick={handleDelete}>
                🗑️ Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
