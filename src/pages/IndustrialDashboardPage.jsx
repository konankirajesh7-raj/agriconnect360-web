import React, { useState, useMemo } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

const TABS = [
  { id: 'procurement', icon: '📦', label: 'Procurement' },
  { id: 'sourcing', icon: '🔍', label: 'Farmer Sourcing' },
  { id: 'quality', icon: '🧪', label: 'Quality Inspection' },
  { id: 'payments', icon: '💳', label: 'Payments' },
  { id: 'analytics', icon: '📊', label: 'Analytics' },
  { id: 'profile', icon: '🏭', label: 'Factory Profile' },
];

const DEMO_TARGETS = [
  { crop: 'Cotton', target_qty: 5000, procured_qty: 3200, unit: 'quintals', rate: 6800 },
  { crop: 'Sugarcane', target_qty: 20000, procured_qty: 14500, unit: 'tonnes', rate: 3500 },
  { crop: 'Paddy', target_qty: 8000, procured_qty: 7100, unit: 'quintals', rate: 2200 },
];

const DEMO_FARMERS = [
  { name: 'Ramaiah Naidu', district: 'Guntur', crop: 'Cotton', area: '5 acres', yield: '12 q/acre', rating: 4.5 },
  { name: 'Lakshmi Devi', district: 'Krishna', crop: 'Paddy', area: '8 acres', yield: '22 q/acre', rating: 4.8 },
  { name: 'Venkatesh R', district: 'Kurnool', crop: 'Cotton', area: '12 acres', yield: '10 q/acre', rating: 4.2 },
  { name: 'Suresh Kumar', district: 'Prakasam', crop: 'Sugarcane', area: '15 acres', yield: '45 t/acre', rating: 4.6 },
];

const DEMO_INSPECTIONS = [
  { id: 'QI-001', farmer: 'Ramaiah Naidu', crop: 'Cotton', moisture: 8.2, impurity: 1.1, grade: 'A', status: 'Accepted' },
  { id: 'QI-002', farmer: 'Venkatesh R', crop: 'Cotton', moisture: 12.5, impurity: 3.4, grade: 'C', status: 'Rejected' },
  { id: 'QI-003', farmer: 'Lakshmi Devi', crop: 'Paddy', moisture: 14.0, impurity: 0.8, grade: 'A', status: 'Accepted' },
];

const DEMO_PAYMENTS = [
  { id: 'PAY-101', farmer: 'Ramaiah Naidu', amount: 217600, mode: 'UPI', status: 'Confirmed', date: '2026-04-20' },
  { id: 'PAY-102', farmer: 'Lakshmi Devi', amount: 156200, mode: 'Bank Transfer', status: 'Processing', date: '2026-04-22' },
  { id: 'PAY-103', farmer: 'Suresh Kumar', amount: 507500, mode: 'UPI', status: 'Initiated', date: '2026-04-23' },
];

export default function IndustrialDashboardPage() {
  const { farmerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('procurement');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterCrop, setFilterCrop] = useState('All');

  const filteredFarmers = useMemo(() => {
    return DEMO_FARMERS.filter(f => {
      if (filterDistrict !== 'All' && f.district !== filterDistrict) return false;
      if (filterCrop !== 'All' && f.crop !== filterCrop) return false;
      if (searchQuery && !f.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [searchQuery, filterDistrict, filterCrop]);

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">🏭 Industrial Dashboard</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Procurement, quality inspection, farmer sourcing & payment management
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="prem-tab-row">
        {TABS.map(t => (
          <button key={t.id} className={`prem-tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="prem-tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Procurement */}
      {activeTab === 'procurement' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📦 Procurement Targets</div>
          <div className="role-section-desc">Track crop procurement progress against seasonal targets</div>

          <div className="role-grid-3">
            {DEMO_TARGETS.map(t => {
              const pct = Math.round((t.procured_qty / t.target_qty) * 100);
              return (
                <div key={t.crop} className="role-card">
                  <div className="role-card-header">
                    <span className="role-card-title">🌾 {t.crop}</span>
                    <span className={`role-badge ${pct >= 80 ? 'success' : pct >= 50 ? 'warn' : 'danger'}`}>{pct}%</span>
                  </div>
                  <div className="role-stat-row">
                    <span>Target</span><b>{t.target_qty.toLocaleString('en-IN')} {t.unit}</b>
                  </div>
                  <div className="role-stat-row">
                    <span>Procured</span><b>{t.procured_qty.toLocaleString('en-IN')} {t.unit}</b>
                  </div>
                  <div className="role-stat-row">
                    <span>Rate</span><b>₹{t.rate.toLocaleString('en-IN')}/{t.unit === 'tonnes' ? 'tonne' : 'quintal'}</b>
                  </div>
                  <div className="role-progress-bar">
                    <div className={`fill ${pct >= 80 ? 'ok' : pct >= 50 ? 'warn' : 'danger'}`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="role-summary-bar" style={{ marginTop: 16 }}>
            <div className="role-summary-item">
              <div className="label">Total Investment</div>
              <div className="value">₹{(DEMO_TARGETS.reduce((s, t) => s + t.procured_qty * t.rate, 0)).toLocaleString('en-IN')}</div>
            </div>
            <div className="role-summary-item">
              <div className="label">Avg Procurement</div>
              <div className="value">{Math.round(DEMO_TARGETS.reduce((s, t) => s + (t.procured_qty / t.target_qty) * 100, 0) / DEMO_TARGETS.length)}%</div>
            </div>
            <div className="role-summary-item">
              <div className="label">Active Crops</div>
              <div className="value">{DEMO_TARGETS.length}</div>
            </div>
          </div>
        </div>
      )}

      {/* Farmer Sourcing */}
      {activeTab === 'sourcing' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🔍 Farmer Sourcing Tool</div>
          <div className="role-section-desc">Search farmers by crop, district, and farm size for procurement</div>

          <div className="role-filter-bar">
            <input className="role-input" placeholder="Search farmer name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <select className="role-select" value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)}>
              <option>All</option>
              {[...new Set(DEMO_FARMERS.map(f => f.district))].map(d => <option key={d}>{d}</option>)}
            </select>
            <select className="role-select" value={filterCrop} onChange={e => setFilterCrop(e.target.value)}>
              <option>All</option>
              {[...new Set(DEMO_FARMERS.map(f => f.crop))].map(c => <option key={c}>{c}</option>)}
            </select>
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>📤 Send Bulk Offer</button>
          </div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>Farmer</th><th>District</th><th>Crop</th><th>Area</th><th>Yield</th><th>Rating</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredFarmers.map(f => (
                  <tr key={f.name}>
                    <td><b>{f.name}</b></td>
                    <td>{f.district}</td>
                    <td>{f.crop}</td>
                    <td>{f.area}</td>
                    <td>{f.yield}</td>
                    <td>⭐ {f.rating}</td>
                    <td><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Contact</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Quality Inspection */}
      {activeTab === 'quality' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🧪 Quality Inspection</div>
          <div className="role-section-desc">Grade, accept, or reject crop batches based on quality parameters</div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>ID</th><th>Farmer</th><th>Crop</th><th>Moisture %</th><th>Impurity %</th><th>Grade</th><th>Status</th></tr>
              </thead>
              <tbody>
                {DEMO_INSPECTIONS.map(i => (
                  <tr key={i.id}>
                    <td><code>{i.id}</code></td>
                    <td>{i.farmer}</td>
                    <td>{i.crop}</td>
                    <td>{i.moisture}%</td>
                    <td>{i.impurity}%</td>
                    <td><span className={`role-badge ${i.grade === 'A' ? 'success' : i.grade === 'B' ? 'warn' : 'danger'}`}>{i.grade}</span></td>
                    <td><span className={`role-badge ${i.status === 'Accepted' ? 'success' : 'danger'}`}>{i.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 12, padding: '9px 18px', fontSize: '0.82rem' }}>➕ New Inspection</button>
        </div>
      )}

      {/* Payments */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">💳 Payment Gateway</div>
          <div className="role-section-desc">Track farmer payments, generate receipts and GST invoices</div>

          <div className="role-summary-bar" style={{ marginBottom: 16 }}>
            <div className="role-summary-item"><div className="label">Total Payable</div><div className="value">₹{DEMO_PAYMENTS.reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</div></div>
            <div className="role-summary-item"><div className="label">Confirmed</div><div className="value" style={{ color: '#34d399' }}>₹{DEMO_PAYMENTS.filter(p => p.status === 'Confirmed').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</div></div>
            <div className="role-summary-item"><div className="label">Pending</div><div className="value" style={{ color: '#fbbf24' }}>₹{DEMO_PAYMENTS.filter(p => p.status !== 'Confirmed').reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}</div></div>
          </div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>ID</th><th>Farmer</th><th>Amount</th><th>Mode</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {DEMO_PAYMENTS.map(p => (
                  <tr key={p.id}>
                    <td><code>{p.id}</code></td>
                    <td>{p.farmer}</td>
                    <td><b>₹{p.amount.toLocaleString('en-IN')}</b></td>
                    <td>{p.mode}</td>
                    <td><span className={`role-badge ${p.status === 'Confirmed' ? 'success' : p.status === 'Processing' ? 'warn' : 'info'}`}>{p.status}</span></td>
                    <td>{p.date}</td>
                    <td><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Receipt</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📊 Procurement Analytics</div>
          <div className="role-section-desc">Trends, farmer reliability, and cost analysis</div>

          <div className="role-grid-3">
            <div className="role-metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-value">₹4.82 Cr</div>
              <div className="metric-label">Total Procurement (FY 2025-26)</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">👨‍🌾</div>
              <div className="metric-value">847</div>
              <div className="metric-label">Active Farmer Partners</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">⭐</div>
              <div className="metric-value">4.6</div>
              <div className="metric-label">Avg Farmer Reliability Score</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">📉</div>
              <div className="metric-value">-3.2%</div>
              <div className="metric-label">Cost vs Market Price</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">✅</div>
              <div className="metric-value">94.3%</div>
              <div className="metric-label">On-Time Delivery Rate</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">🧪</div>
              <div className="metric-value">87%</div>
              <div className="metric-label">Grade A Acceptance Rate</div>
            </div>
          </div>

          <button className="btn btn-outline" style={{ marginTop: 14, padding: '9px 18px', fontSize: '0.82rem' }}>📥 Export CSV Report</button>
        </div>
      )}

      {/* Factory Profile */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🏭 Factory Profile</div>
          <div className="role-section-desc">Public-facing factory information visible to farmers</div>

          <div className="role-grid-2">
            <div className="role-panel">
              <div className="panel-title">Company Information</div>
              <div className="role-field-group">
                <label>Factory Name</label>
                <input className="role-input" defaultValue="Sri Venkateshwara Cotton Industries" />
              </div>
              <div className="role-field-group">
                <label>GSTIN</label>
                <input className="role-input" defaultValue="37AABCS1234H1ZP" />
              </div>
              <div className="role-field-group">
                <label>Location</label>
                <input className="role-input" defaultValue="Guntur, Andhra Pradesh" />
              </div>
              <div className="role-field-group">
                <label>Contact Email</label>
                <input className="role-input" defaultValue="procurement@svcindustries.in" />
              </div>
            </div>
            <div className="role-panel">
              <div className="panel-title">Procurement Preferences</div>
              <div className="role-field-group">
                <label>Crops Needed</label>
                <input className="role-input" defaultValue="Cotton, Sugarcane, Paddy" />
              </div>
              <div className="role-field-group">
                <label>Payment Terms</label>
                <input className="role-input" defaultValue="Net 7 days via UPI/Bank Transfer" />
              </div>
              <div className="role-field-group">
                <label>Certifications</label>
                <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                  {['ISO 9001', 'FSSAI', 'BIS'].map(c => (
                    <span key={c} className="role-badge success">{c}</span>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ marginTop: 12, padding: '9px 18px', fontSize: '0.82rem', width: '100%' }}>💾 Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
