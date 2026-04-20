import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { useSupabaseQuery, useSupabaseMutation } from '../lib/hooks/useSupabaseQuery';

const MOCK_EXPENSES = [
  { id: 1, farmer_id: 1, category: 'seeds', description: 'Paddy Seeds', amount: 4500, expense_date: '2024-07-10', receipt_url: null },
  { id: 2, farmer_id: 1, category: 'fertilizers', description: 'Urea 50kg', amount: 2800, expense_date: '2024-07-20', receipt_url: null },
  { id: 3, farmer_id: 2, category: 'labour', description: 'Harvesting crew', amount: 12000, expense_date: '2024-11-15', receipt_url: null },
  { id: 4, farmer_id: 3, category: 'pesticides', description: 'Insecticide spray', amount: 1800, expense_date: '2024-08-05', receipt_url: null },
  { id: 5, farmer_id: 4, category: 'irrigation', description: 'Electricity bill', amount: 3200, expense_date: '2024-09-01', receipt_url: null },
  { id: 6, farmer_id: 5, category: 'transport', description: 'To Guntur APMC', amount: 5000, expense_date: '2024-12-10', receipt_url: null },
  { id: 7, farmer_id: 7, category: 'equipment', description: 'Tractor Rental', amount: 8500, expense_date: '2024-10-20', receipt_url: null },
];

const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#f97316', '#06b6d4'];
const CAT_ICONS = { seeds: '🌱', fertilizers: '🧪', pesticides: '💊', labour: '👷', irrigation: '💧', transport: '🚛', equipment: '🚜', misc: '📋' };

const BUDGET_DATA = [
  { category: 'seeds', budget: 8000, spent: 4500 },
  { category: 'fertilizers', budget: 6000, spent: 2800 },
  { category: 'pesticides', budget: 5000, spent: 1800 },
  { category: 'labour', budget: 15000, spent: 12000 },
  { category: 'irrigation', budget: 5000, spent: 3200 },
  { category: 'transport', budget: 8000, spent: 5000 },
  { category: 'equipment', budget: 10000, spent: 8500 },
];

export default function ExpensesPage() {
  const { data: expenses, loading, isLive, refetch } = useSupabaseQuery(
    'expenses',
    { select: '*', orderBy: { column: 'expense_date', ascending: false }, limit: 200 },
    MOCK_EXPENSES
  );
  const { insert, loading: saving } = useSupabaseMutation('expenses');
  const [catFilter, setCatFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ category: 'seeds', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0] });

  const totalSpent = expenses.reduce((s, e) => s + (e.amount || 0), 0);
  const categories = [...new Set(expenses.map(e => e.category))];
  const pieData = categories.map(cat => ({ name: cat, value: expenses.filter(e => e.category === cat).reduce((s, e) => s + e.amount, 0) }));
  const filtered = catFilter === 'all' ? expenses : expenses.filter(e => e.category === catFilter);
  const totalBudget = BUDGET_DATA.reduce((s, b) => s + b.budget, 0);

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'budget', icon: '🎯', label: 'Budget Tracker' },
    { id: 'records', icon: '🧾', label: 'All Records' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">💳 Expense & Budget Manager</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            Track costs • Set budgets • {isLive ? '🟢 Live from Supabase' : '🟡 Mock data'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Expense</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Spent', value: `₹${(totalSpent / 1000).toFixed(1)}K`, icon: '💳', color: '#ef4444' },
          { label: 'Budget', value: `₹${(totalBudget / 1000).toFixed(0)}K`, icon: '🎯', color: '#3b82f6' },
          { label: 'Utilization', value: `${Math.round((totalSpent / totalBudget) * 100)}%`, icon: '📊', color: totalSpent > totalBudget * 0.9 ? '#ef4444' : '#22c55e' },
          { label: 'Remaining', value: `₹${((totalBudget - totalSpent) / 1000).toFixed(1)}K`, icon: '💰', color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20 }}>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Expense by Category</div>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={85} innerRadius={50} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip formatter={v => [`₹${v.toLocaleString()}`, 'Amount']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="card" style={{ padding: '20px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Category Breakdown</div>
            {pieData.sort((a, b) => b.value - a.value).map((p, i) => (
              <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span>{CAT_ICONS[p.name] || '📋'}</span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{p.name}</span>
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: PIE_COLORS[i % PIE_COLORS.length] }}>₹{p.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'budget' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 4 }}>🎯 Budget vs Actual — Kharif 2024-25</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>Track spending against your season budget</div>
          {BUDGET_DATA.map(b => {
            const pct = Math.round((b.spent / b.budget) * 100);
            const isOver = pct > 90;
            return (
              <div key={b.category} style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span>{CAT_ICONS[b.category] || '📋'}</span>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{b.category}</span>
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                    <span style={{ fontWeight: 700, color: isOver ? '#ef4444' : '#22c55e' }}>₹{b.spent.toLocaleString()}</span> / ₹{b.budget.toLocaleString()}
                  </div>
                </div>
                <div style={{ height: 10, background: 'var(--bg-primary)', borderRadius: 5, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(pct, 100)}%`, background: isOver ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e', borderRadius: 5, transition: 'width 0.5s ease' }} />
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.7rem', color: isOver ? '#ef4444' : 'var(--text-muted)', marginTop: 2, fontWeight: isOver ? 700 : 400 }}>
                  {pct}% used {isOver && '⚠️'}
                </div>
              </div>
            );
          })}
          <div style={{ padding: '14px', background: totalSpent > totalBudget * 0.9 ? 'rgba(239,68,68,0.08)' : 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-sm)', border: `1px solid ${totalSpent > totalBudget * 0.9 ? 'rgba(239,68,68,0.2)' : 'rgba(34,197,94,0.15)'}`, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 700 }}>Total Budget Health</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>₹{totalSpent.toLocaleString()} spent of ₹{totalBudget.toLocaleString()}</div>
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: totalSpent > totalBudget * 0.9 ? '#ef4444' : '#22c55e' }}>{Math.round((totalSpent / totalBudget) * 100)}%</div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'records' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            {['all', ...categories].map(c => (
              <button key={c} onClick={() => setCatFilter(c)} className={`filter-btn${catFilter === c ? ' active' : ''}`}>{c === 'all' ? 'All' : `${CAT_ICONS[c] || '📋'} ${c}`}</button>
            ))}
          </div>
          <div className="card">
            {loading ? <div className="loading-state">⟳ Loading expenses...</div> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Category</th><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
                  <tbody>
                    {filtered.map(e => (
                      <tr key={e.id}>
                        <td><span className="badge badge-info">{CAT_ICONS[e.category] || '📋'} {e.category}</span></td>
                        <td style={{ color: 'var(--text-secondary)' }}>{e.description || '—'}</td>
                        <td style={{ fontWeight: 700, color: '#ef4444' }}>₹{e.amount?.toLocaleString()}</td>
                        <td>{e.expense_date ? new Date(e.expense_date).toLocaleDateString('en-IN') : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* Add Expense Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowAdd(false)}>
          <div className="card" style={{ width: 420, padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>💳 Add Expense</div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Category *</label>
              <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                {['seeds','fertilizers','pesticides','labour','equipment','irrigation','transport','misc'].map(c => <option key={c} value={c}>{CAT_ICONS[c]} {c}</option>)}
              </select>
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Description</label>
              <input style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }} placeholder="e.g. Urea 50kg" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Amount (₹) *</label>
              <input type="number" style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }} placeholder="e.g. 4500" value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
            </div>
            <div style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>Date</label>
              <input type="date" style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box' }} value={form.expense_date} onChange={e => setForm(p => ({ ...p, expense_date: e.target.value }))} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" disabled={saving || !form.amount} style={{ flex: 1 }} onClick={async () => {
                const result = await insert({ ...form, amount: parseFloat(form.amount) });
                if (result.success) { setShowAdd(false); setForm({ category: 'seeds', description: '', amount: '', expense_date: new Date().toISOString().split('T')[0] }); refetch(); }
              }}>{saving ? '🔄 Saving...' : '✅ Save Expense'}</button>
              <button className="btn btn-outline" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
