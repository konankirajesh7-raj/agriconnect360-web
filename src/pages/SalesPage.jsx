import React, { useState } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const MOCK_SALES = [
  { id: 1, farmer_id: 1, crop_id: 'paddy', sale_date: '2024-12-15', buyer_name: 'Mysuru APMC', buyer_type: 'apmc', quantity_quintals: 45, price_per_quintal: 2180, total_amount: 98100, payment_status: 'completed', quality_grade: 'A' },
  { id: 2, farmer_id: 2, crop_id: 'sugarcane', sale_date: '2024-12-12', buyer_name: 'Sugar Factory', buyer_type: 'factory', quantity_quintals: 120, price_per_quintal: 3450, total_amount: 414000, payment_status: 'completed', quality_grade: 'A+' },
  { id: 3, farmer_id: 3, crop_id: 'cotton', sale_date: '2024-12-10', buyer_name: 'Cotton Broker', buyer_type: 'broker', quantity_quintals: 20, price_per_quintal: 6800, total_amount: 136000, payment_status: 'pending', quality_grade: 'B' },
  { id: 4, farmer_id: 4, crop_id: 'wheat', sale_date: '2024-11-28', buyer_name: 'Vijayapura Mandi', buyer_type: 'apmc', quantity_quintals: 80, price_per_quintal: 2150, total_amount: 172000, payment_status: 'completed', quality_grade: 'A' },
  { id: 5, farmer_id: 7, crop_id: 'paddy', sale_date: '2024-11-20', buyer_name: 'FCI', buyer_type: 'government', quantity_quintals: 60, price_per_quintal: 2183, total_amount: 130980, payment_status: 'completed', quality_grade: 'A+' },
];

const MONTHLY_DATA = [
  { month: 'Aug', revenue: 320000, expenses: 180000 }, { month: 'Sep', revenue: 450000, expenses: 210000 },
  { month: 'Oct', revenue: 280000, expenses: 160000 }, { month: 'Nov', revenue: 560000, expenses: 230000 },
  { month: 'Dec', revenue: 750000, expenses: 280000 },
];

const BUYER_DIST = [
  { name: 'APMC', value: 45, color: '#22c55e' },
  { name: 'Factory', value: 25, color: '#3b82f6' },
  { name: 'Broker', value: 15, color: '#f59e0b' },
  { name: 'Government', value: 15, color: '#8b5cf6' },
];

export default function SalesPage() {
  const { data: sales, loading, isLive } = useSupabaseQuery('sales', { orderBy: { column: 'sale_date', ascending: false }, limit: 200 }, MOCK_SALES);
  const [activeTab, setActiveTab] = useState('overview');

  const totalRevenue = sales.reduce((s, r) => s + (r.total_amount || 0), 0);
  const totalQty = sales.reduce((s, r) => s + (r.quantity_quintals || 0), 0);
  const pending = sales.filter(s => s.payment_status === 'pending').length;
  const totalExpenses = MONTHLY_DATA.reduce((s, m) => s + m.expenses, 0);
  const totalProfit = MONTHLY_DATA.reduce((s, m) => s + (m.revenue - m.expenses), 0);

  const tabs = [
    { id: 'overview', icon: '📊', label: 'Overview' },
    { id: 'transactions', icon: '🧾', label: 'Transactions' },
    { id: 'profit', icon: '💰', label: 'Profit Calculator' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🧾 Sales & Profit Dashboard</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Revenue tracking • Profit analysis • Payment management</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Record Sale</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, icon: '💰', color: '#22c55e' },
          { label: 'Net Profit', value: `₹${(totalProfit / 100000).toFixed(1)}L`, icon: '📈', color: '#3b82f6' },
          { label: 'Total Quantity', value: `${totalQty.toLocaleString()} Q`, icon: '⚖️', color: '#f59e0b' },
          { label: 'Pending Payment', value: pending, icon: '⏳', color: '#ef4444' },
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
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20, marginBottom: 20 }}>
            <div className="card" style={{ padding: '20px 24px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Revenue vs Expenses (₹)</div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={MONTHLY_DATA} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: 'var(--text-muted)', fontSize: 12 }} />
                  <YAxis tick={{ fill: 'var(--text-muted)', fontSize: 12 }} tickFormatter={v => `₹${(v / 1000).toFixed(0)}K`} />
                  <Tooltip formatter={v => [`₹${v.toLocaleString()}`, '']} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8 }} />
                  <Bar dataKey="revenue" name="Revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" name="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', gap: 16, marginTop: 8, fontSize: '0.75rem' }}>
                <span style={{ color: '#22c55e' }}>■ Revenue</span>
                <span style={{ color: '#ef4444' }}>■ Expenses</span>
              </div>
            </div>

            <div className="card" style={{ padding: '20px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Sales by Buyer Type</div>
              <ResponsiveContainer width="100%" height={180}>
                <PieChart>
                  <Pie data={BUYER_DIST} cx="50%" cy="50%" innerRadius={45} outerRadius={70} dataKey="value" paddingAngle={3}>
                    {BUYER_DIST.map((c, i) => <Cell key={i} fill={c.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {BUYER_DIST.map(b => (
                  <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: b.color }} />{b.name} ({b.value}%)
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Profit Summary */}
          <div className="card" style={{ padding: '20px 24px', background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 16 }}>📊 Season Profit Summary — Kharif 2024-25</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12 }}>
              {[
                { label: 'Gross Revenue', value: `₹${(totalRevenue / 100000).toFixed(1)}L`, color: '#22c55e', icon: '💰' },
                { label: 'Total Expenses', value: `₹${(totalExpenses / 100000).toFixed(1)}L`, color: '#ef4444', icon: '💸' },
                { label: 'Net Profit', value: `₹${(totalProfit / 100000).toFixed(1)}L`, color: '#3b82f6', icon: '📈' },
                { label: 'Profit Margin', value: `${((totalProfit / (totalRevenue || 1)) * 100).toFixed(0)}%`, color: '#8b5cf6', icon: '📊' },
                { label: 'ROI', value: `${((totalProfit / (totalExpenses || 1)) * 100).toFixed(0)}%`, color: '#f59e0b', icon: '🎯' },
              ].map(s => (
                <div key={s.label} style={{ textAlign: 'center', padding: '14px 8px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{s.icon}</div>
                  <div style={{ fontSize: '1.2rem', fontWeight: 800, color: s.color }}>{s.value}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'transactions' && (
        <div className="card">
          {loading ? <div className="loading-state">⟳ Loading sales...</div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Farmer</th><th>Crop</th><th>Date</th><th>Buyer</th><th>Qty (Q)</th><th>Price/Q</th><th>Total</th><th>Grade</th><th>Payment</th></tr></thead>
                <tbody>
                  {sales.map(s => (
                    <tr key={s.id}>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{s.id}</td>
                      <td>#{s.farmer_id}</td>
                      <td style={{ fontWeight: 600, textTransform: 'capitalize' }}>{s.crop_id}</td>
                      <td>{new Date(s.sale_date).toLocaleDateString('en-IN')}</td>
                      <td style={{ color: 'var(--text-muted)' }}>{s.buyer_name}</td>
                      <td style={{ textAlign: 'right', fontWeight: 600 }}>{s.quantity_quintals}</td>
                      <td>₹{s.price_per_quintal}</td>
                      <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{s.total_amount?.toLocaleString()}</td>
                      <td><span className="badge badge-info">{s.quality_grade}</span></td>
                      <td><span className={`badge ${s.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{s.payment_status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'profit' && (
        <div className="card" style={{ padding: '24px', maxWidth: 600 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>💰 Quick Profit Calculator</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>Calculate your expected profit for any crop</div>
          {[
            { label: 'Crop', type: 'select', options: ['Cotton', 'Paddy', 'Wheat', 'Sugarcane', 'Maize', 'Soybean'] },
            { label: 'Area (acres)', type: 'number', placeholder: '2.5' },
            { label: 'Expected Yield (quintal/acre)', type: 'number', placeholder: '8' },
            { label: 'Expected Sale Price (₹/quintal)', type: 'number', placeholder: '6800' },
            { label: 'Total Input Cost (₹)', type: 'number', placeholder: '45000' },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>📊 Calculate Profit</button>
          <div style={{ marginTop: 16, padding: '14px', background: 'rgba(34,197,94,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(34,197,94,0.15)' }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 6 }}>Estimated result:</div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Revenue</div><div style={{ fontWeight: 700, color: '#22c55e' }}>₹1,36,000</div></div>
              <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Expenses</div><div style={{ fontWeight: 700, color: '#ef4444' }}>₹45,000</div></div>
              <div><div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Net Profit</div><div style={{ fontWeight: 800, color: '#3b82f6', fontSize: '1.1rem' }}>₹91,000</div></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
