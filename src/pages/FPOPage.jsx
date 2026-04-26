/**
 * Phase 11C — FPO Mode (9 tasks)
 * - Switch between farmer profiles
 * - FPO admin view — manage members
 * - Bulk SMS to FPO members
 * - Aggregated reports
 * - FPO activity heatmap
 * - Collective bargaining tool
 * - FPO expense splitting
 * - CSV export for government reporting
 * - FPO performance dashboard vs district averages
 */
import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearStoredFPOMember, setStoredFPOMember } from '../lib/phase11Persistence';

// ── Mock FPO Data ─────────────────────────────────────────────────
const FPO_INFO = {
  name: 'Guntur Farmers Producer Organization',
  regNo: 'AP/FPO/2024/001247',
  district: 'Guntur',
  state: 'Andhra Pradesh',
  totalMembers: 128,
  activeMembers: 112,
  established: '2023-06-15',
  revenue: 4250000,
  expenses: 2890000,
};

const MEMBERS = [
  { id: 1, name: 'Rajesh Kumar', village: 'Tenali', acres: 8, crops: ['Paddy', 'Cotton'], phone: '9876543210', active: true, contribution: 52000 },
  { id: 2, name: 'Lakshmi Devi', village: 'Mangalagiri', acres: 5, crops: ['Chilli', 'Vegetables'], phone: '9876543211', active: true, contribution: 38000 },
  { id: 3, name: 'Venkata Rao', village: 'Ponnur', acres: 12, crops: ['Paddy', 'Sugarcane'], phone: '9876543212', active: true, contribution: 78000 },
  { id: 4, name: 'Suresh Babu', village: 'Tenali', acres: 6, crops: ['Cotton'], phone: '9876543213', active: false, contribution: 22000 },
  { id: 5, name: 'Padma', village: 'Repalle', acres: 3, crops: ['Vegetables', 'Banana'], phone: '9876543214', active: true, contribution: 28000 },
  { id: 6, name: 'Ravi Teja', village: 'Prathipadu', acres: 15, crops: ['Paddy', 'Cotton', 'Chilli'], phone: '9876543215', active: true, contribution: 95000 },
  { id: 7, name: 'Anitha', village: 'Mangalagiri', acres: 4, crops: ['Tomato', 'Chilli'], phone: '9876543216', active: true, contribution: 32000 },
  { id: 8, name: 'Krishna Murthy', village: 'Duggirala', acres: 10, crops: ['Paddy', 'Groundnut'], phone: '9876543217', active: true, contribution: 65000 },
  { id: 9, name: 'Sita Rama', village: 'Kakumanu', acres: 7, crops: ['Cotton', 'Maize'], phone: '9876543218', active: true, contribution: 48000 },
  { id: 10, name: 'Ganga Dhar', village: 'Tenali', acres: 9, crops: ['Paddy'], phone: '9876543219', active: false, contribution: 15000 },
];

const COLLECTIVE_DEALS = [
  { id: 1, crop: 'Cotton', qty: '450 Quintals', members: 34, bestPrice: '₹7,200/Q', status: 'negotiating', mandi: 'Guntur APMC' },
  { id: 2, crop: 'Paddy', qty: '800 Quintals', members: 52, bestPrice: '₹2,150/Q', status: 'confirmed', mandi: 'Tenali APMC' },
  { id: 3, crop: 'Chilli', qty: '120 Quintals', members: 18, bestPrice: '₹15,500/Q', status: 'completed', mandi: 'Guntur Mirchi Yard' },
];

const SHARED_EXPENSES = [
  { item: 'Tractor Rental (3 units)', total: 45000, members: 12, perMember: 3750, date: '2026-04-15' },
  { item: 'Bulk Fertilizer Purchase', total: 180000, members: 45, perMember: 4000, date: '2026-04-10' },
  { item: 'Pesticide Spray Drone', total: 28000, members: 8, perMember: 3500, date: '2026-04-05' },
  { item: 'Transport to Mandi', total: 32000, members: 15, perMember: 2133, date: '2026-03-28' },
  { item: 'Soil Testing (Group)', total: 12000, members: 20, perMember: 600, date: '2026-03-20' },
];

const HEATMAP_DATA = [
  { village: 'Tenali', members: 32, activity: 92 },
  { village: 'Mangalagiri', members: 18, activity: 85 },
  { village: 'Ponnur', members: 14, activity: 78 },
  { village: 'Repalle', members: 12, activity: 65 },
  { village: 'Prathipadu', members: 10, activity: 72 },
  { village: 'Duggirala', members: 8, activity: 58 },
  { village: 'Kakumanu', members: 6, activity: 45 },
  { village: 'Others', members: 28, activity: 60 },
];

const DISTRICT_AVG = { yield: 28, income: 185000, techAdoption: 42, schemeAccess: 55 };
const FPO_PERF = { yield: 35, income: 245000, techAdoption: 78, schemeAccess: 82 };

export default function FPOPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('dashboard');
  const [selectedMember, setSelectedMember] = useState(null);
  const [smsMessage, setSmsMessage] = useState('');
  const [smsRecipients, setSmsRecipients] = useState('all');
  const [smsSending, setSmsSending] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredMembers = useMemo(() => {
    if (!searchQuery) return MEMBERS;
    return MEMBERS.filter(m =>
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.village.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleBulkSMS = () => {
    setSmsSending(true);
    setTimeout(() => {
      setSmsSending(false);
      setSmsSent(true);
      setTimeout(() => setSmsSent(false), 3000);
    }, 2000);
  };

  const exportCSV = () => {
    const headers = ['Name', 'Village', 'Acres', 'Crops', 'Phone', 'Active', 'Contribution (₹)'];
    const rows = MEMBERS.map(m => [m.name, m.village, m.acres, m.crops.join('; '), m.phone, m.active ? 'Yes' : 'No', m.contribution]);
    const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `FPO_Members_${FPO_INFO.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const openMemberProfile = useCallback((member) => {
    if (!member) return;
    setStoredFPOMember({
      ...member,
      district: FPO_INFO.district,
      state: FPO_INFO.state,
      mandal: member.village,
      selectedCrops: member.crops,
    });
    navigate('/profile');
  }, [navigate]);

  const openOwnProfile = useCallback(() => {
    clearStoredFPOMember();
    navigate('/profile');
  }, [navigate]);

  const TABS = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'members', label: 'Members', icon: '👥' },
    { id: 'bargaining', label: 'Bargaining', icon: '🤝' },
    { id: 'expenses', label: 'Expenses', icon: '💰' },
    { id: 'sms', label: 'Bulk SMS', icon: '📱' },
  ];

  return (
    <div className="animated fpo-page">
      {/* FPO Header */}
      <div className="fpo-header-card">
        <div className="fpo-header-left">
          <div className="fpo-logo">🏢</div>
          <div>
            <h2 className="fpo-title">{FPO_INFO.name}</h2>
            <p className="fpo-subtitle">Reg No: {FPO_INFO.regNo} | Est. {new Date(FPO_INFO.established).getFullYear()}</p>
          </div>
        </div>
        <div className="fpo-header-stats">
          <div className="fpo-hstat"><span className="fpo-hstat-val">{FPO_INFO.totalMembers}</span><span>Members</span></div>
          <div className="fpo-hstat"><span className="fpo-hstat-val">{FPO_INFO.activeMembers}</span><span>Active</span></div>
          <div className="fpo-hstat"><span className="fpo-hstat-val">₹{(FPO_INFO.revenue / 100000).toFixed(1)}L</span><span>Revenue</span></div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="fpo-tabs">
        {TABS.map(t => (
          <button key={t.id} className={`fpo-tab ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
            {t.icon} {t.label}
          </button>
        ))}
        <button className="btn btn-outline fpo-export-btn" onClick={openOwnProfile}>👤 My Profile</button>
        <button className="btn btn-outline fpo-export-btn" onClick={exportCSV}>📥 Export CSV</button>
      </div>

      {/* Dashboard Tab */}
      {tab === 'dashboard' && (
        <div className="fpo-dashboard">
          {/* Performance vs District */}
          <div className="card fpo-perf-card">
            <h4>📊 FPO vs District Average</h4>
            <div className="fpo-perf-grid">
              {[
                { label: 'Yield (Q/acre)', fpo: FPO_PERF.yield, avg: DISTRICT_AVG.yield, unit: 'Q' },
                { label: 'Avg Income', fpo: FPO_PERF.income, avg: DISTRICT_AVG.income, unit: '₹', fmt: v => `₹${(v/1000).toFixed(0)}K` },
                { label: 'Tech Adoption', fpo: FPO_PERF.techAdoption, avg: DISTRICT_AVG.techAdoption, unit: '%' },
                { label: 'Scheme Access', fpo: FPO_PERF.schemeAccess, avg: DISTRICT_AVG.schemeAccess, unit: '%' },
              ].map(m => (
                <div key={m.label} className="fpo-perf-item">
                  <div className="fpo-perf-label">{m.label}</div>
                  <div className="fpo-perf-bars">
                    <div className="fpo-perf-bar-row">
                      <span className="fpo-perf-bar-label">FPO</span>
                      <div className="fpo-perf-bar-track">
                        <div className="fpo-perf-bar-fill green" style={{ width: `${(m.fpo / Math.max(m.fpo, m.avg)) * 100}%` }} />
                      </div>
                      <span className="fpo-perf-val">{m.fmt ? m.fmt(m.fpo) : `${m.fpo}${m.unit}`}</span>
                    </div>
                    <div className="fpo-perf-bar-row">
                      <span className="fpo-perf-bar-label">Avg</span>
                      <div className="fpo-perf-bar-track">
                        <div className="fpo-perf-bar-fill muted" style={{ width: `${(m.avg / Math.max(m.fpo, m.avg)) * 100}%` }} />
                      </div>
                      <span className="fpo-perf-val">{m.fmt ? m.fmt(m.avg) : `${m.avg}${m.unit}`}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Activity Heatmap */}
          <div className="card fpo-heatmap-card">
            <h4>🗺️ Village Activity Heatmap</h4>
            <div className="fpo-heatmap-grid">
              {HEATMAP_DATA.map(h => (
                <div key={h.village} className="fpo-heatmap-item" style={{ '--heat': h.activity / 100 }}>
                  <div className="fpo-heatmap-bar" style={{ height: `${h.activity}%`, background: `rgba(34,197,94,${0.3 + h.activity * 0.007})` }} />
                  <div className="fpo-heatmap-info">
                    <span className="fpo-heatmap-village">{h.village}</span>
                    <span className="fpo-heatmap-count">{h.members} members</span>
                    <span className="fpo-heatmap-score">{h.activity}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Members Tab */}
      {tab === 'members' && (
        <div className="fpo-members-section">
          <div className="fpo-members-toolbar">
            <input className="search-input" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="🔍 Search members by name or village..." style={{ flex: 1 }} />
            <span className="fpo-member-count">{filteredMembers.length} members</span>
          </div>

          <div className="fpo-members-table card">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Village</th>
                  <th>Acres</th>
                  <th>Crops</th>
                  <th>Contribution</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map(m => (
                  <tr key={m.id}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>👨‍🌾 {m.name}</td>
                    <td>📍 {m.village}</td>
                    <td>{m.acres} ac</td>
                    <td>{m.crops.map(c => <span key={c} className="badge badge-blue" style={{ marginRight: 4 }}>{c}</span>)}</td>
                    <td style={{ fontWeight: 600 }}>₹{m.contribution.toLocaleString()}</td>
                    <td><span className={`badge ${m.active ? 'badge-green' : 'badge-amber'}`}>{m.active ? 'Active' : 'Inactive'}</span></td>
                    <td>
                      <button className="action-btn" onClick={() => setSelectedMember(m)} title="View">👁️</button>
                      <button className="action-btn" style={{ marginLeft: 4 }} title="Open Profile" onClick={() => openMemberProfile(m)}>👤</button>
                      <button className="action-btn" style={{ marginLeft: 4 }} title="Call">📞</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Member Detail Modal */}
          {selectedMember && (
            <div className="fpo-modal-overlay" onClick={() => setSelectedMember(null)}>
              <div className="fpo-modal" onClick={e => e.stopPropagation()}>
                <div className="fpo-modal-header">
                  <h3>👨‍🌾 {selectedMember.name}</h3>
                  <button className="action-btn" onClick={() => setSelectedMember(null)}>✕</button>
                </div>
                <div className="fpo-modal-body">
                  <div className="fpo-modal-grid">
                    <div><span className="fpo-modal-label">Village</span><span>{selectedMember.village}</span></div>
                    <div><span className="fpo-modal-label">Farm Area</span><span>{selectedMember.acres} acres</span></div>
                    <div><span className="fpo-modal-label">Crops</span><span>{selectedMember.crops.join(', ')}</span></div>
                    <div><span className="fpo-modal-label">Phone</span><span>{selectedMember.phone}</span></div>
                    <div><span className="fpo-modal-label">Contribution</span><span>₹{selectedMember.contribution.toLocaleString()}</span></div>
                    <div><span className="fpo-modal-label">Status</span><span className={`badge ${selectedMember.active ? 'badge-green' : 'badge-amber'}`}>{selectedMember.active ? 'Active' : 'Inactive'}</span></div>
                  </div>
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={() => openMemberProfile(selectedMember)}>
                    👤 Open Member Profile
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Collective Bargaining Tab */}
      {tab === 'bargaining' && (
        <div className="fpo-bargaining-section">
          <div className="fpo-deals-grid">
            {COLLECTIVE_DEALS.map(d => (
              <div key={d.id} className="card fpo-deal-card">
                <div className="fpo-deal-header">
                  <span className="fpo-deal-crop">{d.crop}</span>
                  <span className={`badge ${d.status === 'completed' ? 'badge-green' : d.status === 'confirmed' ? 'badge-blue' : 'badge-amber'}`}>{d.status}</span>
                </div>
                <div className="fpo-deal-details">
                  <div className="fpo-deal-row"><span>Quantity</span><strong>{d.qty}</strong></div>
                  <div className="fpo-deal-row"><span>Members</span><strong>{d.members} farmers</strong></div>
                  <div className="fpo-deal-row"><span>Best Price</span><strong style={{ color: '#22c55e' }}>{d.bestPrice}</strong></div>
                  <div className="fpo-deal-row"><span>Mandi</span><strong>{d.mandi}</strong></div>
                </div>
                {d.status === 'negotiating' && (
                  <button className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>🤝 Join This Deal</button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Splitting Tab */}
      {tab === 'expenses' && (
        <div className="fpo-expenses-section">
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ marginBottom: 16 }}>💰 Shared Expenses</h4>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Total Cost</th>
                  <th>Members</th>
                  <th>Per Member</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {SHARED_EXPENSES.map((e, i) => (
                  <tr key={i}>
                    <td style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{e.item}</td>
                    <td>₹{e.total.toLocaleString()}</td>
                    <td>{e.members}</td>
                    <td style={{ fontWeight: 600, color: '#22c55e' }}>₹{e.perMember.toLocaleString()}</td>
                    <td>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="fpo-expense-summary">
              <div className="fpo-expense-total">
                <span>Total Shared</span>
                <strong>₹{SHARED_EXPENSES.reduce((s, e) => s + e.total, 0).toLocaleString()}</strong>
              </div>
              <div className="fpo-expense-total">
                <span>Avg Per Member</span>
                <strong>₹{Math.round(SHARED_EXPENSES.reduce((s, e) => s + e.perMember, 0) / SHARED_EXPENSES.length).toLocaleString()}</strong>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk SMS Tab */}
      {tab === 'sms' && (
        <div className="fpo-sms-section">
          <div className="card" style={{ padding: 24 }}>
            <h4 style={{ marginBottom: 16 }}>📱 Bulk SMS to Members</h4>
            <div className="fpo-sms-form">
              <div className="onb-field">
                <label>Recipients</label>
                <select value={smsRecipients} onChange={e => setSmsRecipients(e.target.value)} style={{ width: '100%', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  <option value="all">All Members ({FPO_INFO.totalMembers})</option>
                  <option value="active">Active Members ({FPO_INFO.activeMembers})</option>
                  <option value="paddy">Paddy Farmers</option>
                  <option value="cotton">Cotton Farmers</option>
                </select>
              </div>
              <div className="onb-field" style={{ marginTop: 12 }}>
                <label>Message</label>
                <textarea
                  value={smsMessage}
                  onChange={e => setSmsMessage(e.target.value)}
                  rows={4}
                  placeholder="Type your message here... (Max 160 characters)"
                  maxLength={160}
                  style={{ width: '100%', padding: '12px 14px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', resize: 'vertical', boxSizing: 'border-box' }}
                />
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4, textAlign: 'right' }}>
                  {smsMessage.length}/160 characters
                </div>
              </div>
              <div className="fpo-sms-templates" style={{ marginTop: 12 }}>
                <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 8, display: 'block' }}>Quick Templates:</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    'Meeting on [DATE] at [TIME]. All members please attend.',
                    'Cotton prices up! Best price at Guntur APMC. Sell now.',
                    'Govt scheme deadline approaching. Apply before [DATE].',
                    'Heavy rain alert for next 3 days. Protect your crops.',
                  ].map((t, i) => (
                    <button key={i} className="filter-btn" onClick={() => setSmsMessage(t)} style={{ fontSize: '0.72rem' }}>{t.slice(0, 40)}...</button>
                  ))}
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} onClick={handleBulkSMS} disabled={!smsMessage || smsSending}>
                {smsSending ? '⏳ Sending...' : smsSent ? '✅ Sent!' : `📤 Send to ${smsRecipients === 'all' ? FPO_INFO.totalMembers : FPO_INFO.activeMembers} Members`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
