import React, { useState, useMemo } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

const TABS = [
  { id: 'network', icon: '👨‍🌾', label: 'Farmer Network' },
  { id: 'mandi', icon: '🏪', label: 'Mandi Operations' },
  { id: 'buyers', icon: '🤝', label: 'Buyer Connections' },
  { id: 'transport', icon: '🚛', label: 'Transport' },
  { id: 'intelligence', icon: '📈', label: 'Market Intelligence' },
  { id: 'profile', icon: '👤', label: 'Broker Profile' },
];

const DEMO_FARMERS = [
  { name: 'Ramaiah Naidu', district: 'Guntur', crop: 'Cotton', harvest: 'Oct 2026', phone: '98765xxxxx', notes: 'Prefers UPI payment' },
  { name: 'Lakshmi Devi', district: 'Krishna', crop: 'Paddy', harvest: 'Dec 2026', phone: '98456xxxxx', notes: 'Quality-conscious' },
  { name: 'Rajesh Yadav', district: 'Prakasam', crop: 'Groundnut', harvest: 'Nov 2026', phone: '97341xxxxx', notes: 'Bulk seller, reliable' },
  { name: 'Priya Reddy', district: 'Nellore', crop: 'Paddy', harvest: 'Dec 2026', phone: '98123xxxxx', notes: 'First-time seller' },
];

const DEMO_MANDI_RATES = [
  { crop: 'Cotton', rate: 6850, qty_traded: 320, market: 'Guntur APMC', date: '2026-04-23' },
  { crop: 'Paddy', rate: 2180, qty_traded: 540, market: 'Vijayawada APMC', date: '2026-04-23' },
  { crop: 'Groundnut', rate: 5600, qty_traded: 180, market: 'Kurnool APMC', date: '2026-04-23' },
];

const DEMO_DEALS = [
  { id: 'D-201', buyer: 'SV Cotton Industries', crop: 'Cotton', qty: '200 quintals', value: 1370000, status: 'In Progress' },
  { id: 'D-202', buyer: 'AP Rice Mills', crop: 'Paddy', qty: '500 quintals', value: 1090000, status: 'Closed' },
  { id: 'D-203', buyer: 'Coastal Groundnuts Ltd', crop: 'Groundnut', qty: '150 quintals', value: 840000, status: 'Negotiating' },
];

export default function BrokerDashboardPage() {
  const { farmerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('network');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFarmers = useMemo(() => {
    if (!searchQuery) return DEMO_FARMERS;
    return DEMO_FARMERS.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()) || f.crop.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [searchQuery]);

  const totalCommission = useMemo(() => {
    return DEMO_DEALS.reduce((s, d) => s + Math.round(d.value * 0.03), 0);
  }, []);

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">🤝 Broker Dashboard</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Farmer network, mandi operations, buyer connections & market intelligence
        </div>
      </div>

      <div className="prem-tab-row">
        {TABS.map(t => (
          <button key={t.id} className={`prem-tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="prem-tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Farmer Network */}
      {activeTab === 'network' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">👨‍🌾 Farmer Network</div>
          <div className="role-section-desc">Manage your farmer contacts, crop schedules, and notes</div>

          <div className="role-filter-bar">
            <input className="role-input" style={{ flex: 1 }} placeholder="Search by name or crop..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>➕ Add Farmer</button>
          </div>

          <div className="role-grid-2">
            {filteredFarmers.map(f => (
              <div key={f.name} className="role-card">
                <div className="role-card-header">
                  <span className="role-card-title">{f.name}</span>
                  <span className="role-badge info">{f.district}</span>
                </div>
                <div className="role-stat-row"><span>Crop</span><b>{f.crop}</b></div>
                <div className="role-stat-row"><span>Harvest</span><b>{f.harvest}</b></div>
                <div className="role-stat-row"><span>Phone</span><b>{f.phone}</b></div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 6, fontStyle: 'italic' }}>📝 {f.notes}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem', flex: 1 }}>📞 Call</button>
                  <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem', flex: 1 }}>💬 WhatsApp</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Mandi Operations */}
      {activeTab === 'mandi' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🏪 Mandi Operations</div>
          <div className="role-section-desc">Daily mandi rates, volume tracking, and commission ledger</div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>Crop</th><th>Market</th><th>Rate (₹/q)</th><th>Qty Traded</th><th>Commission (3%)</th><th>Date</th></tr>
              </thead>
              <tbody>
                {DEMO_MANDI_RATES.map(r => (
                  <tr key={r.crop}>
                    <td><b>{r.crop}</b></td>
                    <td>{r.market}</td>
                    <td>₹{r.rate.toLocaleString('en-IN')}</td>
                    <td>{r.qty_traded} quintals</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>₹{Math.round(r.rate * r.qty_traded * 0.03).toLocaleString('en-IN')}</td>
                    <td>{r.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="role-summary-bar" style={{ marginTop: 14 }}>
            <div className="role-summary-item"><div className="label">Today's Volume</div><div className="value">{DEMO_MANDI_RATES.reduce((s, r) => s + r.qty_traded, 0)} quintals</div></div>
            <div className="role-summary-item"><div className="label">Today's Turnover</div><div className="value">₹{DEMO_MANDI_RATES.reduce((s, r) => s + r.rate * r.qty_traded, 0).toLocaleString('en-IN')}</div></div>
            <div className="role-summary-item"><div className="label">Today's Commission</div><div className="value" style={{ color: '#34d399' }}>₹{Math.round(DEMO_MANDI_RATES.reduce((s, r) => s + r.rate * r.qty_traded * 0.03, 0)).toLocaleString('en-IN')}</div></div>
          </div>
        </div>
      )}

      {/* Buyer Connections */}
      {activeTab === 'buyers' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🤝 Buyer Connections & Deals</div>
          <div className="role-section-desc">Track active deals with industrial buyers and wholesalers</div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>Deal ID</th><th>Buyer</th><th>Crop</th><th>Quantity</th><th>Value</th><th>Commission</th><th>Status</th></tr>
              </thead>
              <tbody>
                {DEMO_DEALS.map(d => (
                  <tr key={d.id}>
                    <td><code>{d.id}</code></td>
                    <td><b>{d.buyer}</b></td>
                    <td>{d.crop}</td>
                    <td>{d.qty}</td>
                    <td>₹{d.value.toLocaleString('en-IN')}</td>
                    <td style={{ color: '#34d399', fontWeight: 600 }}>₹{Math.round(d.value * 0.03).toLocaleString('en-IN')}</td>
                    <td><span className={`role-badge ${d.status === 'Closed' ? 'success' : d.status === 'In Progress' ? 'warn' : 'info'}`}>{d.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="role-summary-bar" style={{ marginTop: 14 }}>
            <div className="role-summary-item"><div className="label">Total Deal Value</div><div className="value">₹{DEMO_DEALS.reduce((s, d) => s + d.value, 0).toLocaleString('en-IN')}</div></div>
            <div className="role-summary-item"><div className="label">Total Commission</div><div className="value" style={{ color: '#34d399' }}>₹{totalCommission.toLocaleString('en-IN')}</div></div>
            <div className="role-summary-item"><div className="label">Active Deals</div><div className="value">{DEMO_DEALS.filter(d => d.status !== 'Closed').length}</div></div>
          </div>
        </div>
      )}

      {/* Transport */}
      {activeTab === 'transport' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🚛 Transport Coordination</div>
          <div className="role-section-desc">Book transport, consolidate multi-farm shipments, and track freight</div>

          <div className="role-grid-3">
            <div className="role-metric-card">
              <div className="metric-icon">🚛</div>
              <div className="metric-value">12</div>
              <div className="metric-label">Active Shipments</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">📦</div>
              <div className="metric-value">2,340 q</div>
              <div className="metric-label">Total Volume in Transit</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">₹1.85L</div>
              <div className="metric-label">Freight Cost (MTD)</div>
            </div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 14, padding: '9px 18px', fontSize: '0.82rem' }}>➕ Book New Transport</button>
        </div>
      )}

      {/* Market Intelligence */}
      {activeTab === 'intelligence' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📈 Market Intelligence</div>
          <div className="role-section-desc">Pan-India price trends, demand forecasts, and profit margins</div>

          <div className="role-grid-3">
            {[
              { crop: 'Cotton', trend: '↗️ +4.2%', demand: 'High', margin: '8.5%', color: '#34d399' },
              { crop: 'Paddy', trend: '→ +0.3%', demand: 'Stable', margin: '5.2%', color: '#fbbf24' },
              { crop: 'Groundnut', trend: '↗️ +6.8%', demand: 'Rising', margin: '12.1%', color: '#34d399' },
            ].map(c => (
              <div key={c.crop} className="role-card">
                <div className="role-card-header">
                  <span className="role-card-title">{c.crop}</span>
                  <span style={{ color: c.color, fontWeight: 700, fontSize: '0.88rem' }}>{c.trend}</span>
                </div>
                <div className="role-stat-row"><span>Demand</span><b>{c.demand}</b></div>
                <div className="role-stat-row"><span>Profit Margin</span><b style={{ color: c.color }}>{c.margin}</b></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Broker Profile */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">👤 Broker Profile</div>
          <div className="role-section-desc">Public-facing profile visible to farmers and buyers</div>

          <div className="role-grid-2">
            <div className="role-panel">
              <div className="panel-title">Personal Information</div>
              <div className="role-field-group"><label>Full Name</label><input className="role-input" defaultValue={farmerProfile?.name || 'Broker'} /></div>
              <div className="role-field-group"><label>Service Areas</label><input className="role-input" defaultValue="Guntur, Krishna, Prakasam" /></div>
              <div className="role-field-group"><label>Crops Handled</label><input className="role-input" defaultValue="Cotton, Paddy, Groundnut" /></div>
              <div className="role-field-group"><label>Commission Rate</label><input className="role-input" defaultValue="3%" /></div>
            </div>
            <div className="role-panel">
              <div className="panel-title">Verification & Stats</div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                <span className="role-badge success">✅ Aadhaar Verified</span>
                <span className="role-badge info">📱 Phone Verified</span>
              </div>
              <div className="role-stat-row"><span>Active Since</span><b>March 2024</b></div>
              <div className="role-stat-row"><span>Farmers Connected</span><b>142</b></div>
              <div className="role-stat-row"><span>Deals Closed</span><b>67</b></div>
              <div className="role-stat-row"><span>Farmer Rating</span><b>⭐ 4.7</b></div>
              <button className="btn btn-primary" style={{ marginTop: 12, padding: '9px 18px', fontSize: '0.82rem', width: '100%' }}>💾 Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
