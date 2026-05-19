import React, { useState } from 'react';

const SENSORS = [
  { id: 'S001', name: 'North Field Soil Monitor', type: 'Soil', battery: 87, lastPing: '2 min ago', status: 'online', readings: { 'Moisture': '42%', 'Temperature': '28.5°C', 'pH': '6.8', 'Nitrogen': 'Medium', 'Phosphorus': 'Low', 'Potassium': 'High' } },
  { id: 'S002', name: 'Pump House Weather', type: 'Weather', battery: 64, lastPing: '5 min ago', status: 'online', readings: { 'Temperature': '36.2°C', 'Humidity': '58%', 'Rain': '0mm', 'Wind': '12 km/h', 'Pressure': '1012 hPa', 'UV Index': '7' } },
  { id: 'S003', name: 'Drip Line Flow Meter', type: 'Water', battery: 91, lastPing: '1 min ago', status: 'online', readings: { 'Flow Rate': '2.4 L/min', 'Total Usage': '14,500 L', 'Pressure': '1.8 bar', 'Leak': 'None', 'Valve': 'Open', 'Schedule': 'Auto' } },
  { id: 'S004', name: 'Pest Trap Camera', type: 'Pest', battery: 23, lastPing: '30 min ago', status: 'warning', readings: { 'Captures': '12', 'Dominant Pest': 'Aphids', 'Severity': 'Low', 'Last Capture': '28 min ago', 'AI Confidence': '94%', 'Action': 'Monitor' } },
  { id: 'S005', name: 'South Field Soil', type: 'Soil', battery: 0, lastPing: '2 days ago', status: 'offline', readings: { 'Moisture': '18%', 'Temperature': '31.2°C', 'pH': '7.1', 'Nitrogen': 'Low', 'Phosphorus': 'Medium', 'Potassium': 'Medium' } },
  { id: 'S006', name: 'Greenhouse Controller', type: 'Climate', battery: 100, lastPing: 'Just now', status: 'online', readings: { 'Temperature': '28°C', 'Humidity': '75%', 'CO₂': '420 ppm', 'Light': '850 lux', 'Fan': '60%', 'Mist': 'Active' } },
];

const statusStyle = { online: { bg: 'rgba(16,185,129,0.12)', color: '#34d399' }, warning: { bg: 'rgba(245,158,11,0.12)', color: '#fbbf24' }, offline: { bg: 'rgba(239,68,68,0.12)', color: '#f87171' } };
const batteryColor = b => b > 50 ? '#34d399' : b > 20 ? '#fbbf24' : '#f87171';
const badge = (bg, c) => ({ fontSize: '0.65rem', padding: '3px 10px', borderRadius: 999, background: bg, color: c, fontWeight: 600, display: 'inline-block' });

export default function IoTDashboardPage() {
  const [tab, setTab] = useState('sensors');
  const [expanded, setExpanded] = useState(null);

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">📡 IoT Dashboard</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Smart farming with real-time sensor data and automation</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Sensors</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{SENSORS.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Online</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{SENSORS.filter(s => s.status === 'online').length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Alerts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f87171' }}>{SENSORS.filter(s => s.status !== 'online').length}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card" style={{ padding: 12, marginBottom: 16, display: 'flex', gap: 6 }}>
        {[{ id: 'sensors', icon: '📡', label: 'Sensors' }, { id: 'automation', icon: '⚡', label: 'Automation' }, { id: 'alerts', icon: '🔔', label: 'Alerts' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 18px', borderRadius: 10, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            border: '1px solid', borderColor: tab === t.id ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)',
            background: tab === t.id ? 'rgba(16,185,129,0.15)' : 'transparent', color: tab === t.id ? '#34d399' : 'var(--text-secondary)',
          }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {tab === 'sensors' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 14 }}>
          {SENSORS.map(s => {
            const ss = statusStyle[s.status];
            return (
              <div key={s.id} className="card" style={{ padding: 18, cursor: 'pointer', borderLeft: `3px solid ${ss.color}`, transition: 'transform 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
                onClick={() => setExpanded(expanded === s.id ? null : s.id)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.92rem', color: 'var(--text-primary)' }}>{s.name}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>{s.type} • ID: {s.id}</div>
                  </div>
                  <span style={badge(ss.bg, ss.color)}>{s.status}</span>
                </div>
                <div style={{ display: 'flex', gap: 14, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                  <span>🔋 <span style={{ color: batteryColor(s.battery), fontWeight: 700 }}>{s.battery}%</span></span>
                  <span>📡 {s.lastPing}</span>
                </div>
                {expanded === s.id && (
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {Object.entries(s.readings).map(([k, v]) => (
                      <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                        <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === 'automation' && (
        <div>
          {[
            { name: 'Auto-Irrigate when moisture < 30%', trigger: 'Soil Moisture < 30%', action: 'Open Drip Valve', active: true },
            { name: 'Pest Alert when captures > 10', trigger: 'Pest Count > 10/day', action: 'SMS + Push Alert', active: true },
            { name: 'Greenhouse cooling at 32°C', trigger: 'Temperature > 32°C', action: 'Start Exhaust Fan', active: true },
            { name: 'Weather alert for heavy rain', trigger: 'Rain > 50mm forecast', action: 'WhatsApp + Task', active: false },
          ].map((r, i) => (
            <div key={i} className="card" style={{ padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{r.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 3 }}>If: <b style={{ color: 'var(--text-secondary)' }}>{r.trigger}</b> → Then: <b style={{ color: '#34d399' }}>{r.action}</b></div>
              </div>
              <span style={badge(r.active ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', r.active ? '#34d399' : '#fbbf24')}>{r.active ? '● Active' : '⏸ Paused'}</span>
            </div>
          ))}
        </div>
      )}

      {tab === 'alerts' && (
        <div>
          {[
            { time: '2 min ago', sensor: 'Pest Trap Camera', msg: 'Battery critically low (23%). Replace within 24h.', severity: 'warning' },
            { time: '2 days ago', sensor: 'South Field Soil', msg: 'Sensor offline. Check power/connectivity.', severity: 'critical' },
            { time: '1h ago', sensor: 'Drip Line Flow', msg: 'Flow rate exceeded threshold (2.4 L/min).', severity: 'info' },
          ].map((a, i) => (
            <div key={i} className="card" style={{ padding: 14, marginBottom: 10, borderLeft: `3px solid ${a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#3b82f6'}` }}>
              <div style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--text-primary)' }}>{a.sensor}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 3 }}>{a.msg}</div>
              <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 6 }}>{a.time}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
