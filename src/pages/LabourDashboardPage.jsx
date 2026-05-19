import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const G = { glass: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 } };
const inp = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '9px 12px', color: '#e2e8f0', boxSizing: 'border-box', outline: 'none' };
const TABS = [
  { id: 'workers', icon: '👷', label: 'Workers' },
  { id: 'bookings', icon: '📋', label: 'Bookings' },
  { id: 'connections', icon: '🤝', label: 'Network' },
  { id: 'payments', icon: '💳', label: 'Payments' },
];

function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ ...G.glass, padding: 40, borderRadius: 16, textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{sub}</div>
      {action && <button onClick={onAction} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{action}</button>}
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ ...G.glass, padding: 16, borderRadius: 12, textAlign: 'center' }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{label}</div>
    </div>
  );
}

export default function LabourDashboardPage() {
  const navigate = useNavigate();
  const { user, farmerProfile } = useAuth();
  const uid = user?.id;
  const [tab, setTab] = useState('workers');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [wForm, setWForm] = useState({ name: '', phone: '', age: '', skills: '', wage: '', upi: '' });

  // Real data
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [connections, setConnections] = useState([]);
  const [labourBookings, setLabourBookings] = useState([]);

  // Local workers (persisted per user)
  const storageKey = `labour_workers_${uid}`;
  const [workers, setWorkers] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });

  useEffect(() => {
    if (uid) localStorage.setItem(storageKey, JSON.stringify(workers));
  }, [workers, uid, storageKey]);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const [salesRes, expRes, profRes, bookRes] = await Promise.allSettled([
        supabase.from('sales').select('*').eq('farmer_id', uid).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('farmer_id', uid).order('expense_date', { ascending: false }),
        supabase.from('profiles').select('id,full_name,role,phone,district').limit(50),
        supabase.from('labour_bookings').select('*').eq('farmer_id', uid).order('created_at', { ascending: false }),
      ]);
      if (cancelled) return;
      setSales(salesRes.status === 'fulfilled' ? salesRes.value?.data || [] : []);
      setExpenses(expRes.status === 'fulfilled' ? expRes.value?.data || [] : []);
      setConnections(profRes.status === 'fulfilled' ? (profRes.value?.data || []).filter(p => p.id !== uid) : []);
      setLabourBookings(bookRes.status === 'fulfilled' ? bookRes.value?.data || [] : []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  function flash(m) { setToast(m); setTimeout(() => setToast(''), 2500); }
  const fmtCurrency = (v) => v >= 100000 ? '₹' + (v / 100000).toFixed(1) + 'L' : '₹' + v.toLocaleString('en-IN');
  const totalSales = sales.reduce((s, r) => s + parseFloat(r.amount || r.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  function addWorker() {
    if (!wForm.name) return;
    setWorkers(p => [...p, {
      id: Date.now().toString(36),
      name: wForm.name, phone: wForm.phone, age: +wForm.age || 0,
      skills: wForm.skills.split(',').map(s => s.trim()).filter(Boolean),
      wage: +wForm.wage || 0, upi: wForm.upi, status: 'Available'
    }]);
    setShowAddWorker(false);
    setWForm({ name: '', phone: '', age: '', skills: '', wage: '', upi: '' });
    flash('✅ ' + wForm.name + ' added!');
  }

  const farmerConns = connections.filter(c => c.role === 'farmer');
  const otherConns = connections.filter(c => c.role !== 'farmer');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a0000 0%,#0f172a 50%,#120000 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(239,68,68,0.3),transparent)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#ef4444,#dc2626)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 8px 24px rgba(239,68,68,0.4)' }}>👷</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Farm Workers Portal</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Welcome, {farmerProfile?.name || 'Association'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { l: 'Workers', v: String(workers.length), c: '#f87171' },
                { l: 'Revenue', v: fmtCurrency(totalSales), c: '#4ade80' },
                { l: 'Bookings', v: String(labourBookings.length), c: '#fbbf24' },
                { l: 'Network', v: String(connections.length), c: '#a78bfa' },
              ].map(m => (
                <div key={m.l} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{m.l}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: m.c }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => { setShowAddWorker(!showAddWorker); setTab('workers'); }} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 4px 15px rgba(239,68,68,0.4)' }}>+ Add Worker</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600, transition: 'all 0.25s', background: tab === t.id ? 'linear-gradient(135deg,#ef4444,#dc2626)' : 'transparent', color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: tab === t.id ? '0 4px 12px rgba(239,68,68,0.3)' : 'none' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Workers */}
      {tab === 'workers' && (
        <div>
          {showAddWorker && (
            <div style={{ ...G.glass, padding: 20, borderRadius: 14, marginBottom: 16 }}>
              <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>+ Add Worker</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 12 }}>
                {[{ l: 'Name', k: 'name', ph: 'Worker name' }, { l: 'Mobile', k: 'phone', ph: '9XXXXXXXXX' }, { l: 'Age', k: 'age', ph: '30', t: 'number' }, { l: 'Skills (comma)', k: 'skills', ph: 'Harvesting, Weeding' }, { l: 'Wage/day', k: 'wage', ph: '400', t: 'number' }, { l: 'UPI ID', k: 'upi', ph: 'name@paytm' }].map(f =>
                  <div key={f.k}><label style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>{f.l}</label><input type={f.t || 'text'} placeholder={f.ph} value={wForm[f.k]} onChange={e => setWForm(p => ({ ...p, [f.k]: e.target.value }))} style={{ ...inp }} /></div>
                )}
              </div>
              <button onClick={addWorker} style={{ background: 'linear-gradient(135deg,#ef4444,#dc2626)', border: 'none', borderRadius: 8, padding: '8px 18px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>💾 Save Worker</button>
            </div>
          )}
          {workers.length === 0 ? (
            <EmptyState icon="👷" title="No Workers Registered" sub="Add your first worker to start managing your team." action="+ Add Worker" onAction={() => setShowAddWorker(true)} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
              {workers.map(w => (
                <div key={w.id || w.name} style={{ ...G.glass, padding: 18, borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <div><span style={{ fontWeight: 700, color: '#f1f5f9' }}>{w.name}</span>{w.age > 0 && <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>Age {w.age}</span>}</div>
                    <span style={{ background: w.status === 'Available' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: w.status === 'Available' ? '#4ade80' : '#fbbf24', padding: '2px 8px', borderRadius: 20, fontSize: '0.62rem', fontWeight: 600 }}>{w.status}</span>
                  </div>
                  {w.skills?.length > 0 && <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 8 }}>{w.skills.map(s => <span key={s} style={{ background: 'rgba(239,68,68,0.12)', color: '#f87171', padding: '2px 8px', borderRadius: 20, fontSize: '0.62rem' }}>{s}</span>)}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    <span>₹{w.wage}/day</span>
                    {w.phone && <span>📱 {w.phone}</span>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                    <button onClick={() => setWorkers(p => p.map(x => x.id === w.id ? { ...x, status: x.status === 'Available' ? 'Busy' : 'Available' } : x))} style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', fontSize: '0.68rem' }}>
                      {w.status === 'Available' ? '🔒 Set Busy' : '✅ Set Available'}
                    </button>
                    <button onClick={() => { setWorkers(p => p.filter(x => x.id !== w.id)); flash('Removed ' + w.name); }} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 10px', color: '#ef4444', cursor: 'pointer', fontSize: '0.68rem' }}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Bookings */}
      {tab === 'bookings' && (
        <div>
          {labourBookings.length === 0 ? (
            <EmptyState icon="📋" title="No Bookings Yet" sub="Labour bookings from farmers will appear here." />
          ) : (
            labourBookings.map((b, i) => (
              <div key={b.id || i} style={{ ...G.glass, padding: 18, borderRadius: 14, marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                  <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.95rem' }}>{b.task || b.description || 'Labour Booking'}</span>
                  <span style={{ background: b.status === 'confirmed' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: b.status === 'confirmed' ? '#4ade80' : '#fbbf24', padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600 }}>{b.status || 'pending'}</span>
                </div>
                <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>
                  📅 {new Date(b.booking_date || b.created_at).toLocaleDateString('en-IN')} · {b.workers_needed || 1} workers needed
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Connections - real profiles */}
      {tab === 'connections' && (
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>🤝 Farm Workers Network ({connections.length} users)</div>
          {connections.length === 0 ? (
            <EmptyState icon="🤝" title="Building Network" sub="Platform users will appear here as your network grows." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { title: '👨‍🌾 Farmers (Employers)', items: farmerConns },
                { title: '🏭 Other Users', items: otherConns },
              ].filter(s => s.items.length > 0).map(sec => (
                <div key={sec.title} style={{ ...G.glass, padding: 18, borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.92rem' }}>{sec.title}</span>
                    <span style={{ fontSize: '0.72rem', color: '#f87171', fontWeight: 600 }}>{sec.items.length}</span>
                  </div>
                  {sec.items.slice(0, 8).map(it => (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{it.full_name || 'User'}</div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>📍 {it.district || 'N/A'} · {it.role}</div>
                      </div>
                      {it.phone && <button onClick={() => window.open('tel:' + it.phone)} style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)', borderRadius: 6, padding: '3px 8px', color: '#4ade80', cursor: 'pointer', fontSize: '0.68rem' }}>📞</button>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Payments */}
      {tab === 'payments' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 14, marginBottom: 20 }}>
            <StatCard icon="💰" value={fmtCurrency(totalSales)} label="Revenue" color="#4ade80" />
            <StatCard icon="📉" value={fmtCurrency(totalExpenses)} label="Expenses" color="#f59e0b" />
            <StatCard icon="👷" value={String(workers.length)} label="Workers" color="#f87171" />
          </div>
          {sales.length === 0 && expenses.length === 0 ? (
            <EmptyState icon="💳" title="No Payment Records" sub="Record income and expenses in My Money." action="💰 My Money" onAction={() => navigate('/my-money')} />
          ) : (
            <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#f1f5f9' }}>💳 Payment History</div>
              {[...sales.map(s => ({ ...s, _type: 'income', _date: s.sale_date || s.created_at })), ...expenses.map(e => ({ ...e, _type: 'expense', _date: e.expense_date || e.created_at }))]
                .sort((a, b) => new Date(b._date) - new Date(a._date)).slice(0, 15).map((p, i) => (
                  <div key={i} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: p._type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{p._type === 'income' ? '💰' : '📉'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{p.description || p.crop || p.category || 'Transaction'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{new Date(p._date).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: p._type === 'income' ? '#4ade80' : '#f59e0b' }}>
                      {p._type === 'income' ? '+' : '-'}₹{parseFloat(p.amount || p.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '14px 24px', color: '#f87171', fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>{toast}</div>}
    </div>
  );
}
