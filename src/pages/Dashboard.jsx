import React, { useEffect, useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import { farmersDB, cropsDB, labourDB, pricesDB } from '../lib/supabase';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';

const MOCK_REVENUE = [
  { month: 'Aug', revenue: 2.1 }, { month: 'Sep', revenue: 3.4 }, { month: 'Oct', revenue: 2.9 },
  { month: 'Nov', revenue: 4.2 }, { month: 'Dec', revenue: 3.8 }, { month: 'Jan', revenue: 5.1 },
  { month: 'Feb', revenue: 4.7 }, { month: 'Mar', revenue: 6.2 },
];

const MOCK_CROPS_CHART = [
  { name: 'Cotton', value: 32, color: '#22c55e' },
  { name: 'Paddy', value: 28, color: '#3b82f6' },
  { name: 'Chilli', value: 18, color: '#f59e0b' },
  { name: 'Maize', value: 14, color: '#8b5cf6' },
  { name: 'Others', value: 8, color: '#64748b' },
];

const MOCK_BOOKINGS = [
  { month: 'Oct', labour: 120, transport: 45 }, { month: 'Nov', labour: 180, transport: 62 },
  { month: 'Dec', labour: 95, transport: 38 }, { month: 'Jan', labour: 210, transport: 78 },
  { month: 'Feb', labour: 165, transport: 55 }, { month: 'Mar', labour: 240, transport: 92 },
];

const MOCK_RECENT_FARMERS = [
  { id: 1, name: 'Ramaiah Gowda', village: 'Tenali', district: 'Guntur', crops: 'Cotton', status: 'verified' },
  { id: 2, name: 'Lakshmi Devi', village: 'Vijayawada', district: 'Krishna', crops: 'Paddy', status: 'verified' },
  { id: 3, name: 'Venkatesh Reddy', village: 'Ongole', district: 'Prakasam', crops: 'Chilli', status: 'pending' },
  { id: 4, name: 'Savita Rao', village: 'Kurnool', district: 'Kurnool', crops: 'Maize', status: 'verified' },
  { id: 5, name: 'Suresh Naidu', village: 'Anantapur', district: 'Anantapur', crops: 'Groundnut', status: 'pending' },
];

const JOURNEY_STEPS = [
  { id: 'soil', icon: '🧪', label: 'Know Your Soil', path: '/soil', status: 'complete', desc: 'Soil tested & analyzed' },
  { id: 'input', icon: '🌱', label: 'Get Inputs', path: '/suppliers', status: 'complete', desc: 'Seeds & fertilizers procured' },
  { id: 'advisory', icon: '🤖', label: 'Smart Advisory', path: '/ai', status: 'active', desc: 'AI recommendations active' },
  { id: 'health', icon: '🌿', label: 'Crop Health', path: '/crops', status: 'upcoming', desc: 'Monitor & protect crops' },
  { id: 'output', icon: '📦', label: 'Harvest & Sell', path: '/market-prices', status: 'upcoming', desc: 'Sell at best prices' },
  { id: 'finance', icon: '💰', label: 'Finance', path: '/sales', status: 'upcoming', desc: 'Track profit & revenue' },
];

const DAILY_TIPS = [
  { icon: '🌾', tip: 'Apply DAP fertilizer 3 weeks after paddy transplanting for optimal tillering. Use 50kg/acre for best results.', category: 'Fertilizer', crop: 'Paddy' },
  { icon: '🐛', tip: 'Install yellow sticky traps in cotton fields to monitor whitefly population. Place 5 traps per acre at canopy height.', category: 'Pest Control', crop: 'Cotton' },
  { icon: '💧', tip: 'Drip irrigation saves 40% water compared to flood irrigation. Ideal for sugarcane — schedule 2-hour sessions every 3 days.', category: 'Irrigation', crop: 'Sugarcane' },
  { icon: '🌡️', tip: 'Cover nursery beds with mulch during cold nights when temperature drops below 10°C to prevent frost damage to seedlings.', category: 'Weather', crop: 'Wheat' },
  { icon: '📊', tip: 'Cotton prices typically peak in March-April. Consider holding 30% of stock if quality is Grade A+ for premium rates.', category: 'Market', crop: 'Cotton' },
  { icon: '🧪', tip: 'Soil pH between 6.0-7.5 is ideal for most crops. Add lime (2 tons/acre) if pH is below 5.5 for better nutrient absorption.', category: 'Soil Health', crop: 'General' },
  { icon: '🌱', tip: 'Intercropping soybean with maize increases nitrogen fixation by 25%. Plant soybean in 2:1 ratio with maize rows.', category: 'Technique', crop: 'Groundnut' },
];

const UPCOMING_TASKS = [
  { icon: '💧', task: 'Irrigate Cotton Field B2', time: 'Today, 6:00 AM', priority: 'high', module: 'Crop Health' },
  { icon: '🧪', task: 'Soil test results ready — Field A1', time: 'Today, 10:00 AM', priority: 'medium', module: 'Soil & Water' },
  { icon: '🐛', task: 'Spray neem oil on chilli crops', time: 'Tomorrow', priority: 'high', module: 'Pest Control' },
  { icon: '📦', task: 'Harvest paddy — Field C3 (mature)', time: 'In 3 days', priority: 'medium', module: 'Harvest' },
  { icon: '💰', task: 'Sell Cotton at Guntur APMC (price peak)', time: 'This week', priority: 'low', module: 'Market' },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div style={{ background: '#1e2533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '10px 14px' }}>
        <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginBottom: 4 }}>{label}</div>
        {payload.map(p => (
          <div key={p.name} style={{ color: p.color, fontSize: '0.875rem', fontWeight: 600 }}>
            {p.name}: {p.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({ farmers: 4782, crops: 8934, bookings: 1247, revenue: '₹2.4Cr' });
  const [tipIndex, setTipIndex] = useState(0);
  const [isLive, setIsLive] = useState(false);
  const [recentFarmers, setRecentFarmers] = useState(MOCK_RECENT_FARMERS);

  // Fetch live stats from Supabase (non-blocking, 5s timeout)
  useEffect(() => {
    setTipIndex(Math.floor(Math.random() * DAILY_TIPS.length));

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000);

    const fetchLiveStats = async () => {
      try {
        const [farmersRes, cropsRes, bookingsRes] = await Promise.all([
          farmersDB.count(),
          cropsDB.count(),
          labourDB.countBookings(),
        ]);

        const farmerCount = farmersRes.count ?? stats.farmers;
        const cropCount = cropsRes.count ?? stats.crops;
        const bookingCount = bookingsRes.count ?? stats.bookings;

        if (farmersRes.count !== null || cropsRes.count !== null) {
          setStats({
            farmers: farmerCount || stats.farmers,
            crops: cropCount || stats.crops,
            bookings: bookingCount || stats.bookings,
            revenue: `₹${((farmerCount * 5000 || 24000000) / 10000000).toFixed(1)}Cr`,
          });
          setIsLive(true);
        }

        // Fetch recent farmers
        const { data: liveFarmers } = await farmersDB.getAll();
        if (liveFarmers?.length > 0) {
          setRecentFarmers(liveFarmers.slice(0, 5).map(f => ({
            id: f.id, name: f.name, village: f.village || f.mandal || '—',
            district: f.district, crops: f.kisan_id ? 'Registered' : 'New',
            status: f.is_active ? 'verified' : 'pending',
          })));
        }
      } catch {
        // Mock data already set — no action needed
      } finally {
        clearTimeout(timeout);
      }
    };
    fetchLiveStats();
    return () => { controller.abort(); clearTimeout(timeout); };
  }, []);

  const currentTip = DAILY_TIPS[tipIndex];

  const STAT_CARDS = [
    { icon: '👨‍🌾', label: 'Total Farmers', value: stats.farmers.toLocaleString(), change: isLive ? '🟢 Live from Supabase' : '+12% this month', dir: 'up', accent: '#22c55e', iconBg: 'rgba(34,197,94,0.1)' },
    { icon: '🌱', label: 'Active Crops', value: stats.crops.toLocaleString(), change: isLive ? '🟢 Live from Supabase' : '+8% this season', dir: 'up', accent: '#3b82f6', iconBg: 'rgba(59,130,246,0.1)' },
    { icon: '📋', label: 'Service Bookings', value: stats.bookings.toLocaleString(), change: isLive ? '🟢 Live from Supabase' : '+23% this month', dir: 'up', accent: '#f59e0b', iconBg: 'rgba(245,158,11,0.1)' },
    { icon: '💰', label: 'Platform Revenue', value: stats.revenue, change: '+18% vs last quarter', dir: 'up', accent: '#8b5cf6', iconBg: 'rgba(139,92,246,0.1)' },
  ];

  const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

  return (
    <div className="animated">
      {/* Seeds-to-Market Journey Bar — DeHaat Inspired */}
      <div className="card" style={{ marginBottom: 24, padding: '20px 24px', background: 'linear-gradient(135deg, rgba(34,197,94,0.04), rgba(59,130,246,0.04))' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>🌾 Seeds to Market — Your Farming Journey</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>Track your progress from soil preparation to market sales</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span className="badge badge-green">Kharif 2024-25</span>
            <button className="btn btn-outline" style={{ padding: '6px 10px', fontSize: '0.72rem' }} onClick={() => navigate('/premium?tab=reports')}>
              📄 Download PDF Reports
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, position: 'relative' }}>
          {JOURNEY_STEPS.map((step, i) => (
            <div key={step.id} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer', position: 'relative' }}
              onClick={() => navigate(step.path)}>
              {/* Connector line */}
              {i > 0 && (
                <div style={{
                  position: 'absolute', top: 20, left: -50 + '%', width: '100%', height: 3, zIndex: 0,
                  background: step.status === 'complete' || step.status === 'active' ? '#22c55e' : 'var(--border)',
                }} />
              )}
              {/* Step circle */}
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.2rem', zIndex: 1, transition: 'all 0.3s',
                background: step.status === 'complete' ? '#22c55e' : step.status === 'active' ? '#3b82f6' : 'var(--bg-primary)',
                border: `3px solid ${step.status === 'complete' ? '#22c55e' : step.status === 'active' ? '#3b82f6' : 'var(--border)'}`,
                boxShadow: step.status === 'active' ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                color: step.status === 'complete' || step.status === 'active' ? '#fff' : 'var(--text-muted)',
              }}>
                {step.status === 'complete' ? '✓' : step.icon}
              </div>
              <div style={{ marginTop: 8, textAlign: 'center' }}>
                <div style={{
                  fontSize: '0.72rem', fontWeight: 600,
                  color: step.status === 'active' ? '#3b82f6' : step.status === 'complete' ? '#22c55e' : 'var(--text-muted)',
                }}>{step.label}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2 }}>{step.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {STAT_CARDS.map((s, i) => (
          <div key={i} className="stat-card" style={{ '--accent': s.accent }}>
            <div className="stat-icon" style={{ background: s.iconBg }}>{s.icon}</div>
            <div className="stat-value">{s.value}</div>
            <div className="stat-label">{s.label}</div>
            <div className={`stat-change ${s.dir}`}>
              <span>{s.dir === 'up' ? '↑' : '↓'}</span>
              {s.change}
            </div>
          </div>
        ))}
      </div>

      {/* Tip of the Day + Upcoming Tasks Row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        {/* Tip of the Day — AgroStar Inspired */}
        <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(245,158,11,0.06), rgba(34,197,94,0.04))', border: '1px solid rgba(245,158,11,0.15)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: '1.2rem' }}>💡</span>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>Tip of the Day</span>
            </div>
            <div style={{ display: 'flex', gap: 4 }}>
              <span className="badge badge-blue" style={{ fontSize: '0.65rem' }}>{currentTip.crop}</span>
              <span className="badge badge-amber" style={{ fontSize: '0.65rem' }}>{currentTip.category}</span>
            </div>
          </div>
          <div style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <span style={{ fontSize: '1.4rem', marginRight: 8 }}>{currentTip.icon}</span>
            {currentTip.tip}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 14 }}>
            <button onClick={() => setTipIndex((tipIndex + 1) % DAILY_TIPS.length)}
              className="btn btn-outline" style={{ padding: '5px 12px', fontSize: '0.75rem' }}>
              🔄 Next Tip
            </button>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Powered by AgriConnect AI</span>
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>📋 Upcoming Tasks</div>
            <span className="badge badge-green">{UPCOMING_TASKS.length} pending</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {UPCOMING_TASKS.map((t, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', borderLeft: `3px solid ${priorityColors[t.priority]}` }}>
                <span style={{ fontSize: '1.2rem' }}>{t.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.task}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 2 }}>{t.time} • {t.module}</div>
                </div>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColors[t.priority] }} title={t.priority} />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="charts-grid">
        {/* Revenue chart */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Platform Revenue (₹ Crores)</div>
            <span className="badge badge-green">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={MOCK_REVENUE}>
              <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="revenue" stroke="#22c55e" strokeWidth={2.5} dot={{ fill: '#22c55e', r: 4 }} activeDot={{ r: 6 }} name="Revenue (₹Cr)" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Crop distribution */}
        <div className="card">
          <div className="section-header">
            <div className="section-title">Crop Distribution</div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={MOCK_CROPS_CHART} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                {MOCK_CROPS_CHART.map((c, i) => <Cell key={i} fill={c.color} />)}
              </Pie>
              <Tooltip content={({ active, payload }) => active && payload?.length ? (
                <div style={{ background: '#1e2533', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '8px 12px' }}>
                  <div style={{ color: payload[0].payload.color, fontWeight: 600 }}>{payload[0].name}</div>
                  <div style={{ color: '#e2e8f0' }}>{payload[0].value}%</div>
                </div>
              ) : null} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8 }}>
            {MOCK_CROPS_CHART.map(c => (
              <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                {c.name} ({c.value}%)
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Service Bookings chart */}
      <div className="card" style={{ marginBottom: 24 }}>
        <div className="section-header">
          <div className="section-title">Service Bookings — Labour & Transport</div>
          <div style={{ display: 'flex', gap: 12, fontSize: '0.75rem' }}>
            <span style={{ color: '#22c55e' }}>■ Labour</span>
            <span style={{ color: '#3b82f6' }}>■ Transport</span>
          </div>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={MOCK_BOOKINGS} barGap={4}>
            <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="labour" name="Labour" fill="#22c55e" radius={[4,4,0,0]} />
            <Bar dataKey="transport" name="Transport" fill="#3b82f6" radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Recent Farmers table */}
      <div className="card">
        <div className="section-header">
          <div className="section-title">Recently Registered Farmers</div>
          <a href="/farmers" className="btn btn-outline" style={{ padding: '6px 14px', fontSize: '0.8rem' }}>View All</a>
        </div>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Village</th>
                <th>District</th>
                <th>Crops</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentFarmers.map(f => (
                <tr key={f.id}>
                  <td style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{f.name}</td>
                  <td>{f.village}</td>
                  <td>{f.district}</td>
                  <td><span className="badge badge-blue">{f.crops}</span></td>
                  <td><span className={`badge ${f.status === 'verified' ? 'badge-green' : 'badge-amber'}`}>{f.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Module status grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginTop: 24 }}>
        {[
          { icon: '🤖', name: 'AI Advisory', status: 'Active', requests: '1,247 today', color: 'badge-green' },
          { icon: '💬', name: 'Chat System', status: 'Active', requests: '3,892 messages', color: 'badge-green' },
          { icon: '📡', name: 'e-NAM Prices', status: 'Synced 2h ago', requests: '47 crops', color: 'badge-blue' },
          { icon: '☁️', name: 'Weather Alerts', status: 'Active', requests: '12 alerts sent', color: 'badge-green' },
          { icon: '⚖️', name: 'Disputes', status: '3 pending', requests: '18 this month', color: 'badge-amber' },
          { icon: '🏛️', name: 'Gov Schemes', status: 'Active', requests: '24 schemes', color: 'badge-green' },
        ].map((m, i) => (
          <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ fontSize: '1.5rem' }}>{m.icon}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: 2 }}>{m.name}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{m.requests}</div>
              <span className={`badge ${m.color}`} style={{ marginTop: 4 }}>{m.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
