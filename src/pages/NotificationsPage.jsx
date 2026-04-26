import React, { useState, useMemo } from 'react';

const INITIAL = [
  { id: 1, icon: '🌧️', title: 'Heavy Rain Alert — Guntur District', body: 'IMD predicts 65mm rainfall in next 48 hours. Delay spraying operations.', type: 'weather', time: '10 min ago', read: false, snoozed: false },
  { id: 2, icon: '💰', title: 'Cotton price up ₹200/Q at Adoni APMC', body: 'Current price: ₹7,200/Q. Consider selling if holding > 30Q.', type: 'market', time: '1 hour ago', read: false, snoozed: false },
  { id: 3, icon: '🌱', title: 'Crop Calendar: Apply fertilizer (Paddy Day 45)', body: 'Recommended: Urea 50kg/acre + DAP 25kg/acre for tillering stage.', type: 'crop', time: '3 hours ago', read: false, snoozed: false },
  { id: 4, icon: '🛡️', title: 'PMFBY claim approved — ₹42,000 credited', body: 'Claim ID: PMFBY-2026-AP-14521. Amount credited to linked SBI account.', type: 'finance', time: '1 day ago', read: true, snoozed: false },
  { id: 5, icon: '📋', title: 'Soil test results ready — North Field', body: 'pH: 6.8, N: Medium, P: Low, K: High. View detailed report.', type: 'crop', time: '2 days ago', read: true, snoozed: false },
  { id: 6, icon: '🏆', title: 'New badge earned: Week Warrior 🔥', body: 'You maintained a 7-day login streak! +50 AgriCoins bonus.', type: 'gamification', time: '3 days ago', read: true, snoozed: false },
  { id: 7, icon: '📱', title: 'Lakshmi Devi replied to your post', body: '"Try FeSO4 0.5% foliar spray for yellowing leaves."', type: 'social', time: '4 days ago', read: true, snoozed: false },
  { id: 8, icon: '🚜', title: 'Equipment maintenance due: Tractor', body: 'Mahindra 575 — next service at 500 hours. Current: 482 hours.', type: 'asset', time: '5 days ago', read: true, snoozed: false },
];

const CATEGORIES = ['all', 'weather', 'market', 'crop', 'finance', 'gamification', 'social', 'asset'];
const CAT_ICONS = { all: '📋', weather: '🌧️', market: '💰', crop: '🌱', finance: '🛡️', gamification: '🏆', social: '📱', asset: '🚜' };

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState(INITIAL);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [quietHours, setQuietHours] = useState(false);

  const filtered = useMemo(() => notifications.filter(n => !n.snoozed && (categoryFilter === 'all' || n.type === categoryFilter)), [notifications, categoryFilter]);
  const unread = notifications.filter(n => !n.read).length;

  function markRead(id) { setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n)); }
  function markAllRead() { setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }
  function snooze(id) { setNotifications(prev => prev.map(n => n.id === id ? { ...n, snoozed: true } : n)); }

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🔔 Notifications</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>{unread} unread • Categorized alerts</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Unread</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{unread}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{notifications.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Snoozed</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{notifications.filter(n => n.snoozed).length}</div>
          </div>
        </div>
      </div>

      {/* Category pills + actions */}
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
        {CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategoryFilter(c)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', border: '1px solid',
            borderColor: categoryFilter === c ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)',
            background: categoryFilter === c ? 'rgba(16,185,129,0.15)' : 'transparent',
            color: categoryFilter === c ? '#34d399' : 'var(--text-secondary)', transition: 'all 0.15s',
          }}>{CAT_ICONS[c]} {c === 'all' ? 'All' : c}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={markAllRead} style={{ padding: '6px 14px', borderRadius: 10, fontSize: '0.75rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', color: 'var(--text-secondary)', cursor: 'pointer' }}>✓ Mark all read</button>
          <label style={{ fontSize: '0.75rem', display: 'flex', gap: 5, alignItems: 'center', color: 'var(--text-secondary)' }}>
            <input type="checkbox" checked={quietHours} onChange={e => setQuietHours(e.target.checked)} style={{ accentColor: '#10b981' }} /> 🌙 Quiet
          </label>
        </div>
      </div>

      {/* Notification list */}
      {filtered.map(n => (
        <div key={n.id} onClick={() => markRead(n.id)} className="card" style={{
          padding: 16, marginBottom: 8, cursor: 'pointer', display: 'flex', gap: 14, alignItems: 'flex-start',
          borderLeft: n.read ? '3px solid transparent' : '3px solid #3b82f6',
          opacity: n.read ? 0.7 : 1, transition: 'all 0.2s',
        }}>
          <span style={{ fontSize: '1.5rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(255,255,255,0.04)', borderRadius: 10 }}>{n.icon}</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: n.read ? 400 : 700, fontSize: '0.88rem', color: 'var(--text-primary)', lineHeight: 1.3 }}>{n.title}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3, lineHeight: 1.4 }}>{n.body}</div>
            <div style={{ display: 'flex', gap: 10, marginTop: 6, alignItems: 'center', fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              <span>{n.time}</span>
              <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(59,130,246,0.12)', color: '#93c5fd' }}>{n.type}</span>
              <button onClick={e => { e.stopPropagation(); snooze(n.id); }} style={{ background: 'none', border: 'none', color: '#fbbf24', cursor: 'pointer', fontSize: '0.7rem' }}>😴 Snooze</button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
