import React, { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

const TABS = [
  { id: 'workers', icon: '👷', label: 'Workers' },
  { id: 'bookings', icon: '📋', label: 'Bookings' },
  { id: 'dispatch', icon: '🚀', label: 'Dispatch' },
  { id: 'payments', icon: '💰', label: 'Payments' },
  { id: 'analytics', icon: '📊', label: 'Analytics' },
];

const DEMO_WORKERS = [
  { id: 'W-01', name: 'Ramu K', skills: ['Plowing', 'Harvesting'], wage: 500, status: 'Available', phone: '97654xxxxx' },
  { id: 'W-02', name: 'Subbamma L', skills: ['Weeding', 'Transplanting'], wage: 400, status: 'On Job', phone: '98765xxxxx' },
  { id: 'W-03', name: 'Venkat N', skills: ['Spraying', 'Harvesting'], wage: 550, status: 'Available', phone: '99876xxxxx' },
  { id: 'W-04', name: 'Padma D', skills: ['Weeding', 'Harvesting'], wage: 400, status: 'On Leave', phone: '97123xxxxx' },
  { id: 'W-05', name: 'Krishna R', skills: ['Plowing', 'Spraying', 'Harvesting'], wage: 600, status: 'Available', phone: '98234xxxxx' },
];

const DEMO_BOOKINGS = [
  { id: 'BK-301', farmer: 'Ramaiah Naidu', task: 'Cotton Harvesting', workers_needed: 8, date: '2026-04-25', location: 'Guntur', status: 'Confirmed' },
  { id: 'BK-302', farmer: 'Lakshmi Devi', task: 'Paddy Transplanting', workers_needed: 12, date: '2026-04-26', location: 'Krishna', status: 'Pending' },
  { id: 'BK-303', farmer: 'Venkatesh R', task: 'Pesticide Spraying', workers_needed: 4, date: '2026-04-27', location: 'Kurnool', status: 'Completed' },
];

const DEMO_PAYMENTS_DATA = [
  { booking: 'BK-303', farmer: 'Venkatesh R', workers: 4, days: 2, rate: 500, commission: 15, farmer_paid: true, workers_paid: true },
  { booking: 'BK-301', farmer: 'Ramaiah Naidu', workers: 8, days: 3, rate: 500, commission: 15, farmer_paid: false, workers_paid: false },
];

export default function LabourDashboardPage() {
  const { farmerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('workers');

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">👷 Labour Association Dashboard</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Worker management, job bookings, dispatch & payment tracking
        </div>
      </div>

      <div className="prem-tab-row">
        {TABS.map(t => (
          <button key={t.id} className={`prem-tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="prem-tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Workers */}
      {activeTab === 'workers' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">👷 Worker Registry</div>
          <div className="role-section-desc">Manage worker profiles, skills, availability, and wage rates</div>

          <div className="role-grid-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))' }}>
            {DEMO_WORKERS.map(w => (
              <div key={w.id} className="role-card">
                <div className="role-card-header">
                  <span className="role-card-title">{w.name}</span>
                  <span className={`role-badge ${w.status === 'Available' ? 'success' : w.status === 'On Job' ? 'warn' : 'info'}`}>{w.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 6 }}>
                  {w.skills.map(s => <span key={s} className="role-badge info" style={{ fontSize: '0.68rem' }}>{s}</span>)}
                </div>
                <div className="role-stat-row"><span>Daily Wage</span><b>₹{w.wage}</b></div>
                <div className="role-stat-row"><span>Phone</span><b>{w.phone}</b></div>
              </div>
            ))}
          </div>

          <div className="role-summary-bar" style={{ marginTop: 14 }}>
            <div className="role-summary-item"><div className="label">Total Workers</div><div className="value">{DEMO_WORKERS.length}</div></div>
            <div className="role-summary-item"><div className="label">Available</div><div className="value" style={{ color: '#34d399' }}>{DEMO_WORKERS.filter(w => w.status === 'Available').length}</div></div>
            <div className="role-summary-item"><div className="label">On Job</div><div className="value" style={{ color: '#fbbf24' }}>{DEMO_WORKERS.filter(w => w.status === 'On Job').length}</div></div>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 12, padding: '9px 18px', fontSize: '0.82rem' }}>➕ Register Worker</button>
        </div>
      )}

      {/* Bookings */}
      {activeTab === 'bookings' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📋 Booking Management</div>
          <div className="role-section-desc">View and manage incoming labour requests from farmers</div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>Booking</th><th>Farmer</th><th>Task</th><th>Workers</th><th>Date</th><th>Location</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {DEMO_BOOKINGS.map(b => (
                  <tr key={b.id}>
                    <td><code>{b.id}</code></td>
                    <td><b>{b.farmer}</b></td>
                    <td>{b.task}</td>
                    <td>{b.workers_needed}</td>
                    <td>{b.date}</td>
                    <td>{b.location}</td>
                    <td><span className={`role-badge ${b.status === 'Completed' ? 'success' : b.status === 'Confirmed' ? 'info' : 'warn'}`}>{b.status}</span></td>
                    <td>
                      {b.status === 'Pending' && <button className="btn btn-primary" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Accept</button>}
                      {b.status === 'Confirmed' && <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Dispatch</button>}
                      {b.status === 'Completed' && <button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Receipt</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dispatch */}
      {activeTab === 'dispatch' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🚀 Worker Dispatch</div>
          <div className="role-section-desc">Assign workers, send SMS confirmations, and track attendance</div>

          <div className="role-grid-2">
            {DEMO_BOOKINGS.filter(b => b.status !== 'Completed').map(b => (
              <div key={b.id} className="role-card">
                <div className="role-card-header">
                  <span className="role-card-title">{b.task}</span>
                  <span className={`role-badge ${b.status === 'Confirmed' ? 'info' : 'warn'}`}>{b.status}</span>
                </div>
                <div className="role-stat-row"><span>Farmer</span><b>{b.farmer}</b></div>
                <div className="role-stat-row"><span>Workers Needed</span><b>{b.workers_needed}</b></div>
                <div className="role-stat-row"><span>Date</span><b>{b.date}</b></div>
                <div className="role-stat-row"><span>Location</span><b>{b.location}</b></div>
                <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                  <button className="btn btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem', flex: 1 }}>👷 Assign Workers</button>
                  <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.78rem', flex: 1 }}>📱 Send SMS</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payments */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">💰 Payment Tracking</div>
          <div className="role-section-desc">Calculate wages, deduct commission, and track payouts</div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>Booking</th><th>Farmer</th><th>Workers</th><th>Days</th><th>Gross</th><th>Commission</th><th>Net</th><th>Farmer Paid</th><th>Workers Paid</th></tr>
              </thead>
              <tbody>
                {DEMO_PAYMENTS_DATA.map(p => {
                  const gross = p.workers * p.days * p.rate;
                  const comm = Math.round(gross * p.commission / 100);
                  return (
                    <tr key={p.booking}>
                      <td><code>{p.booking}</code></td>
                      <td>{p.farmer}</td>
                      <td>{p.workers}</td>
                      <td>{p.days}</td>
                      <td>₹{gross.toLocaleString('en-IN')}</td>
                      <td style={{ color: '#34d399' }}>₹{comm.toLocaleString('en-IN')}</td>
                      <td><b>₹{(gross - comm).toLocaleString('en-IN')}</b></td>
                      <td><span className={`role-badge ${p.farmer_paid ? 'success' : 'warn'}`}>{p.farmer_paid ? 'Yes' : 'Pending'}</span></td>
                      <td><span className={`role-badge ${p.workers_paid ? 'success' : 'warn'}`}>{p.workers_paid ? 'Paid' : 'Due'}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Analytics */}
      {activeTab === 'analytics' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📊 Association Analytics</div>
          <div className="role-section-desc">Performance metrics for your labour association</div>

          <div className="role-grid-3">
            <div className="role-metric-card">
              <div className="metric-icon">📋</div>
              <div className="metric-value">156</div>
              <div className="metric-label">Total Jobs Completed</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">₹4.2L</div>
              <div className="metric-label">Commission Earned (FY)</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">📈</div>
              <div className="metric-value">78%</div>
              <div className="metric-label">Worker Utilization</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">⭐</div>
              <div className="metric-value">4.6</div>
              <div className="metric-label">Farmer Satisfaction</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">⏱️</div>
              <div className="metric-value">96%</div>
              <div className="metric-label">On-Time Dispatch</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">👷</div>
              <div className="metric-value">{DEMO_WORKERS.length}</div>
              <div className="metric-label">Registered Workers</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
