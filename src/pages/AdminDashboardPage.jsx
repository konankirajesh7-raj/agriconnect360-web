import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const TABS = [
  { id: 'users', icon: '👥', label: 'User Management' },
  { id: 'moderation', icon: '🛡️', label: 'Content Moderation' },
  { id: 'analytics', icon: '📊', label: 'Platform Analytics' },
  { id: 'config', icon: '⚙️', label: 'Configuration' },
  { id: 'support', icon: '🎧', label: 'Support Helpdesk' },
];

const DEMO_USERS = [
  { id: 1, name: 'Ramaiah Naidu', role: 'farmer', district: 'Guntur', status: 'Active', joined: '2025-06-15', verified: true },
  { id: 2, name: 'SV Cotton Industries', role: 'industrial', district: 'Guntur', status: 'Active', joined: '2025-08-20', verified: true },
  { id: 3, name: 'Krishna Agri Traders', role: 'broker', district: 'Krishna', status: 'Active', joined: '2025-09-10', verified: true },
  { id: 4, name: 'Sri Sai Agri Centre', role: 'supplier', district: 'Guntur', status: 'Active', joined: '2025-07-05', verified: false },
  { id: 5, name: 'AP Labour Union', role: 'labour', district: 'Prakasam', status: 'Active', joined: '2025-10-01', verified: true },
  { id: 6, name: 'Priya Reddy', role: 'farmer', district: 'Nellore', status: 'Inactive', joined: '2026-01-12', verified: false },
];

const DEMO_TICKETS = [
  { id: 'TK-001', subject: 'Cannot view market prices', user: 'Ramaiah Naidu', role: 'farmer', priority: 'High', status: 'Open', date: '2026-04-22' },
  { id: 'TK-002', subject: 'Payment not received', user: 'Lakshmi Devi', role: 'farmer', priority: 'Critical', status: 'In Progress', date: '2026-04-21' },
  { id: 'TK-003', subject: 'Product listing rejected', user: 'Sri Sai Agri', role: 'supplier', priority: 'Medium', status: 'Resolved', date: '2026-04-20' },
];

const ROLE_COLORS = {
  farmer: 'success', industrial: 'info', broker: 'warn', supplier: 'info', labour: 'warn', admin: 'danger', fpo: 'success',
};

export default function AdminDashboardPage() {
  const { isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('users');
  const [filterRole, setFilterRole] = useState('All');
  const [userCount, setUserCount] = useState(null);

  useEffect(() => {
    supabase.from('profiles').select('id', { count: 'exact', head: true }).then(({ count }) => {
      if (count != null) setUserCount(count);
    });
  }, []);

  const filteredUsers = filterRole === 'All' ? DEMO_USERS : DEMO_USERS.filter(u => u.role === filterRole);

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">🛡️ Admin Dashboard</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Platform management — users, moderation, analytics, configuration & support
        </div>
      </div>

      <div className="prem-tab-row">
        {TABS.map(t => (
          <button key={t.id} className={`prem-tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="prem-tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* User Management */}
      {activeTab === 'users' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">👥 User Management</div>
          <div className="role-section-desc">View, verify, and manage all platform users across roles</div>

          <div className="role-filter-bar">
            <select className="role-select" value={filterRole} onChange={e => setFilterRole(e.target.value)}>
              <option>All</option>
              <option value="farmer">Farmer</option>
              <option value="industrial">Industrial</option>
              <option value="broker">Broker</option>
              <option value="supplier">Supplier</option>
              <option value="labour">Labour</option>
            </select>
            <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
              {userCount != null ? `${userCount} total users in database` : 'Loading...'}
            </span>
            <button className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '0.78rem', marginLeft: 'auto' }}>📥 Export CSV</button>
          </div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>#</th><th>Name</th><th>Role</th><th>District</th><th>Status</th><th>Verified</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u.id}>
                    <td>{u.id}</td>
                    <td><b>{u.name}</b></td>
                    <td><span className={`role-badge ${ROLE_COLORS[u.role] || 'info'}`}>{u.role}</span></td>
                    <td>{u.district}</td>
                    <td><span className={`role-badge ${u.status === 'Active' ? 'success' : 'danger'}`}>{u.status}</span></td>
                    <td>{u.verified ? '✅' : '❌'}</td>
                    <td>{u.joined}</td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      {!u.verified && <button className="btn btn-primary" style={{ padding: '3px 8px', fontSize: '0.68rem' }}>Verify</button>}
                      <button className="btn btn-outline" style={{ padding: '3px 8px', fontSize: '0.68rem' }}>{u.status === 'Active' ? 'Suspend' : 'Activate'}</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Content Moderation */}
      {activeTab === 'moderation' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🛡️ Content Moderation</div>
          <div className="role-section-desc">Review community posts, Q&A, and supplier product listings</div>

          <div className="role-grid-3">
            <div className="role-metric-card">
              <div className="metric-icon">📝</div>
              <div className="metric-value">12</div>
              <div className="metric-label">Posts Pending Review</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">❓</div>
              <div className="metric-value">5</div>
              <div className="metric-label">Q&A Flagged</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">📦</div>
              <div className="metric-value">3</div>
              <div className="metric-label">Product Listings to Approve</div>
            </div>
          </div>

          <div className="role-grid-2" style={{ marginTop: 14 }}>
            <div className="role-panel">
              <div className="panel-title">Recent Flagged Content</div>
              {[
                { user: 'Anonymous', content: 'Spam: Buy cheap seeds at...', type: 'Community Post', action: 'Delete' },
                { user: 'User #342', content: 'Offensive language in Q&A response', type: 'Q&A Answer', action: 'Review' },
                { user: 'Supplier #12', content: 'Misleading product description', type: 'Product Listing', action: 'Review' },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <div>
                    <div><b>{item.type}</b> — {item.content}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>by {item.user}</div>
                  </div>
                  <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.7rem' }}>{item.action}</button>
                </div>
              ))}
            </div>
            <div className="role-panel">
              <div className="panel-title">Dispute Resolution</div>
              <div className="role-stat-row"><span>Open Disputes</span><b>7</b></div>
              <div className="role-stat-row"><span>Avg Resolution Time</span><b>3.2 days</b></div>
              <div className="role-stat-row"><span>Resolved This Month</span><b>23</b></div>
              <button className="btn btn-outline" style={{ marginTop: 10, padding: '8px 14px', fontSize: '0.78rem', width: '100%' }}>View All Disputes →</button>
            </div>
          </div>
        </div>
      )}

      {/* Platform Analytics */}
      {activeTab === 'analytics' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📊 Platform Analytics</div>
          <div className="role-section-desc">Users, engagement, revenue, and feature usage</div>

          <div className="role-grid-3">
            <div className="role-metric-card">
              <div className="metric-icon">👥</div>
              <div className="metric-value">{userCount || '5,000+'}</div>
              <div className="metric-label">Total Registered Users</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-value">1,247</div>
              <div className="metric-label">Daily Active Users</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">🔄</div>
              <div className="metric-value">68%</div>
              <div className="metric-label">7-Day Retention</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">₹12.4L</div>
              <div className="metric-label">Revenue (MTD)</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">🌤️</div>
              <div className="metric-value">Weather</div>
              <div className="metric-label">Most Used Feature</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">🗺️</div>
              <div className="metric-value">13</div>
              <div className="metric-label">Districts Active</div>
            </div>
          </div>

          <div className="role-grid-2" style={{ marginTop: 14 }}>
            <div className="role-panel">
              <div className="panel-title">Users by Role</div>
              {[
                { role: 'Farmers', count: 4823, pct: 89 },
                { role: 'Suppliers', count: 234, pct: 4 },
                { role: 'Brokers', count: 178, pct: 3 },
                { role: 'Industrial', count: 89, pct: 2 },
                { role: 'Labour Assoc.', count: 67, pct: 1 },
                { role: 'Admin/FPO', count: 12, pct: 1 },
              ].map(r => (
                <div key={r.role} style={{ marginBottom: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: 3 }}>
                    <span>{r.role}</span><b>{r.count} ({r.pct}%)</b>
                  </div>
                  <div className="role-progress-bar"><div className="fill ok" style={{ width: `${r.pct}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="role-panel">
              <div className="panel-title">Top Features (This Month)</div>
              {[
                { feature: 'Weather Forecast', hits: 12450 },
                { feature: 'Market Prices', hits: 9870 },
                { feature: 'AI Advisory', hits: 6230 },
                { feature: 'Crop Tracking', hits: 5100 },
                { feature: 'Expense Tracker', hits: 4320 },
              ].map(f => (
                <div key={f.feature} className="role-stat-row">
                  <span>{f.feature}</span><b>{f.hits.toLocaleString('en-IN')} hits</b>
                </div>
              ))}
              <button className="btn btn-outline" style={{ marginTop: 10, padding: '8px 14px', fontSize: '0.78rem', width: '100%' }}>📥 Export Analytics Report</button>
            </div>
          </div>
        </div>
      )}

      {/* Configuration */}
      {activeTab === 'config' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">⚙️ System Configuration</div>
          <div className="role-section-desc">Manage master data, pricing, notifications, and feature flags</div>

          <div className="role-grid-2">
            <div className="role-panel">
              <div className="panel-title">Feature Flags</div>
              {[
                { name: 'Premium Module', enabled: true },
                { name: 'Drone Reports', enabled: true },
                { name: 'WhatsApp Bot', enabled: false },
                { name: 'IoT Integration', enabled: true },
                { name: 'F2C Store', enabled: true },
              ].map(f => (
                <div key={f.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)', fontSize: '0.82rem' }}>
                  <span>{f.name}</span>
                  <span className={`role-badge ${f.enabled ? 'success' : 'danger'}`}>{f.enabled ? 'Enabled' : 'Disabled'}</span>
                </div>
              ))}
            </div>
            <div className="role-panel">
              <div className="panel-title">Pricing Configuration</div>
              <div className="role-field-group"><label>Premium Monthly (₹)</label><input className="role-input" type="number" defaultValue={99} /></div>
              <div className="role-field-group"><label>Premium Yearly (₹)</label><input className="role-input" type="number" defaultValue={999} /></div>
              <div className="role-field-group"><label>Broker Commission (%)</label><input className="role-input" type="number" defaultValue={3} /></div>
              <div className="role-field-group"><label>Labour Commission (%)</label><input className="role-input" type="number" defaultValue={15} /></div>
              <button className="btn btn-primary" style={{ marginTop: 8, padding: '9px 18px', fontSize: '0.82rem', width: '100%' }}>💾 Save Configuration</button>
            </div>
          </div>
        </div>
      )}

      {/* Support */}
      {activeTab === 'support' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🎧 Support Helpdesk</div>
          <div className="role-section-desc">View and manage support tickets from all users</div>

          <div className="role-summary-bar" style={{ marginBottom: 16 }}>
            <div className="role-summary-item"><div className="label">Open Tickets</div><div className="value" style={{ color: '#ef4444' }}>{DEMO_TICKETS.filter(t => t.status === 'Open').length}</div></div>
            <div className="role-summary-item"><div className="label">In Progress</div><div className="value" style={{ color: '#fbbf24' }}>{DEMO_TICKETS.filter(t => t.status === 'In Progress').length}</div></div>
            <div className="role-summary-item"><div className="label">Resolved</div><div className="value" style={{ color: '#34d399' }}>{DEMO_TICKETS.filter(t => t.status === 'Resolved').length}</div></div>
          </div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>ID</th><th>Subject</th><th>User</th><th>Role</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr>
              </thead>
              <tbody>
                {DEMO_TICKETS.map(t => (
                  <tr key={t.id}>
                    <td><code>{t.id}</code></td>
                    <td><b>{t.subject}</b></td>
                    <td>{t.user}</td>
                    <td><span className={`role-badge ${ROLE_COLORS[t.role] || 'info'}`}>{t.role}</span></td>
                    <td><span className={`role-badge ${t.priority === 'Critical' ? 'danger' : t.priority === 'High' ? 'warn' : 'info'}`}>{t.priority}</span></td>
                    <td><span className={`role-badge ${t.status === 'Resolved' ? 'success' : t.status === 'In Progress' ? 'warn' : 'danger'}`}>{t.status}</span></td>
                    <td>{t.date}</td>
                    <td><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>{t.status === 'Open' ? 'Assign' : 'View'}</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 12, padding: '9px 18px', fontSize: '0.82rem' }}>📢 Send Broadcast Message</button>
        </div>
      )}
    </div>
  );
}
