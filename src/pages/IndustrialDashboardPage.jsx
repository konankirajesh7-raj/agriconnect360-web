import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../lib/i18n/LanguageContext';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const G = { glass: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 } };

function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ ...G.glass, padding: 40, borderRadius: 16, textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{sub}</div>
      {action && <button onClick={onAction} style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>{action}</button>}
    </div>
  );
}

function StatCard({ icon, value, label, color }) {
  return (
    <div style={{ ...G.glass, padding: 16, borderRadius: 12 }}>
      <div style={{ fontSize: '1.4rem', marginBottom: 6 }}>{icon}</div>
      <div style={{ fontSize: '1.3rem', fontWeight: 800, color }}>{value}</div>
      <div style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)' }}>{label}</div>
    </div>
  );
}

const TABS = [
  { id: 'overview', icon: '📊', label: 'Overview' },
  { id: 'procurement', icon: '📦', label: 'Procurement' },
  { id: 'quality', icon: '🧪', label: 'Quality' },
  { id: 'connections', icon: '🤝', label: 'Connections' },
  { id: 'payments', icon: '💳', label: 'Payments' },
];

export default function IndustrialDashboardPage() {
  const { t, tx } = useLanguage();
  const navigate = useNavigate();
  const { user, farmerProfile } = useAuth();
  const uid = user?.id;
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Real data
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [listings, setListings] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const [salesRes, expRes, pricesRes, listRes, profilesRes] = await Promise.allSettled([
        supabase.from('sales').select('*').eq('farmer_id', uid).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('farmer_id', uid).order('expense_date', { ascending: false }),
        supabase.from('market_prices').select('*').order('price_date', { ascending: false }).limit(50),
        supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false }).limit(30),
        supabase.from('profiles').select('id,full_name,role,phone,district').limit(50),
      ]);
      if (cancelled) return;
      setSales(salesRes.status === 'fulfilled' ? salesRes.value?.data || [] : []);
      setExpenses(expRes.status === 'fulfilled' ? expRes.value?.data || [] : []);
      setMarketPrices(pricesRes.status === 'fulfilled' ? pricesRes.value?.data || [] : []);
      setListings(listRes.status === 'fulfilled' ? listRes.value?.data || [] : []);
      setConnections(profilesRes.status === 'fulfilled' ? (profilesRes.value?.data || []).filter(p => p.id !== uid) : []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  function flash(m) { setToast(m); setTimeout(() => setToast(''), 2500); }

  const totalSales = sales.reduce((s, r) => s + parseFloat(r.amount || r.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const fmtCurrency = (v) => v >= 100000 ? '₹' + (v / 100000).toFixed(1) + 'L' : '₹' + v.toLocaleString('en-IN');

  const farmerConnections = connections.filter(c => c.role === 'farmer');
  const brokerConnections = connections.filter(c => c.role === 'broker');
  const supplierConnections = connections.filter(c => c.role === 'supplier' || c.role === 'industrial');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading real data...</div>;

  return (
    <div style={{ fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#0c1a3e 0%,#0f172a 50%,#0a1628 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(59,130,246,0.3),transparent)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 8px 24px rgba(59,130,246,0.4)' }}>🏭</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Industrial Portal</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Welcome, {farmerProfile?.name || 'Industrial Buyer'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { l: 'Procurement', v: fmtCurrency(totalExpenses), c: '#60a5fa' },
                { l: 'Connections', v: String(connections.length), c: '#34d399' },
                { l: 'Listings', v: String(listings.length), c: '#f59e0b' },
                { l: 'Market Items', v: String(marketPrices.length), c: '#a78bfa' },
              ].map(m => (
                <div key={m.l} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{m.l}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: m.c }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600, transition: 'all 0.25s', background: tab === t.id ? 'linear-gradient(135deg,#3b82f6,#1d4ed8)' : 'transparent', color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: tab === t.id ? '0 4px 12px rgba(59,130,246,0.3)' : 'none' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            <StatCard icon="📦" value={String(sales.length)} label="Total Orders" color="#60a5fa" />
            <StatCard icon="💰" value={fmtCurrency(totalSales)} label="Revenue" color="#4ade80" />
            <StatCard icon="📉" value={fmtCurrency(totalExpenses)} label="Procurement Cost" color="#f59e0b" />
            <StatCard icon="👨‍🌾" value={String(farmerConnections.length)} label="Farmer Partners" color="#a78bfa" />
          </div>

          {/* Recent Transactions */}
          <div style={{ ...G.glass, padding: 18, borderRadius: 14, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Recent Activity</div>
            {sales.length === 0 && expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>No procurement activity yet. Record transactions in My Money.</div>
            ) : (
              [...sales.slice(0, 3).map(s => ({ ...s, _type: 'sale' })), ...expenses.slice(0, 3).map(e => ({ ...e, _type: 'expense' }))]
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 5)
                .map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: item._type === 'sale' ? '#4ade80' : '#f59e0b' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{item.description || item.crop || item.category || 'Transaction'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{new Date(item.sale_date || item.expense_date || item.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: item._type === 'sale' ? '#4ade80' : '#f59e0b' }}>
                      ₹{parseFloat(item.amount || item.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { icon: '💰', label: 'My Money', path: '/my-money', color: '#f59e0b' },
              { icon: '📊', label: 'Market Prices', path: '/market-prices', color: '#60a5fa' },
              { icon: '🛒', label: 'Marketplace', path: '/marketplace', color: '#4ade80' },
              { icon: '🤝', label: 'Network', path: '/network', color: '#a78bfa' },
            ].map(a => (
              <button key={a.path} onClick={() => navigate(a.path)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '14px 8px', ...G.glass, cursor: 'pointer', color: '#f1f5f9', fontSize: '0.75rem', fontWeight: 600 }}>
                <span style={{ fontSize: '1.5rem' }}>{a.icon}</span>
                {a.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Procurement */}
      {tab === 'procurement' && (
        <div>
          {marketPrices.length === 0 ? (
            <EmptyState icon="📦" title="No Market Data Available" sub="Market prices and procurement data will appear here." action="📊 Check Market Prices" onAction={() => navigate('/market-prices')} />
          ) : (
            <>
              <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden', marginBottom: 16 }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#f1f5f9' }}>📊 Available Crops — Market Prices</div>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    {['Crop', 'Market', 'Min Price', 'Modal Price', 'Max Price'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{h}</th>)}
                  </tr></thead>
                  <tbody>{marketPrices.slice(0, 12).map((p, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>{p.crop || p.commodity}</td>
                      <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>{p.market || p.district || 'N/A'}</td>
                      <td style={{ padding: '12px 16px', color: '#ef4444', fontSize: '0.82rem' }}>₹{parseFloat(p.min_price || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', fontWeight: 700, color: '#4ade80', fontSize: '0.85rem' }}>₹{parseFloat(p.modal_price || p.price || 0).toLocaleString('en-IN')}</td>
                      <td style={{ padding: '12px 16px', color: '#60a5fa', fontSize: '0.82rem' }}>₹{parseFloat(p.max_price || 0).toLocaleString('en-IN')}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
              <button onClick={() => navigate('/market-prices')} style={{ background: 'linear-gradient(135deg,#3b82f6,#1d4ed8)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>📊 Full Market Analysis →</button>
            </>
          )}
        </div>
      )}

      {/* Quality */}
      {tab === 'quality' && (
        <div>
          {listings.length === 0 ? (
            <EmptyState icon="🧪" title="No Quality Records" sub="Marketplace listings and quality inspections will appear here." action="🛒 Visit Marketplace" onAction={() => navigate('/marketplace')} />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
                <StatCard icon="🧪" value={String(listings.length)} label="Total Listings" color="#60a5fa" />
                <StatCard icon="✅" value={String(listings.filter(l => l.status === 'active').length)} label="Active" color="#4ade80" />
                <StatCard icon="📦" value={String(listings.filter(l => l.status === 'sold').length)} label="Sold" color="#f59e0b" />
              </div>
              {listings.slice(0, 8).map((l, i) => (
                <div key={l.id || i} style={{ ...G.glass, padding: 16, borderRadius: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(59,130,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>📦</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem' }}>{l.title || l.crop || 'Listing'}</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{l.description?.substring(0, 60) || 'No description'}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontWeight: 700, color: '#4ade80' }}>₹{parseFloat(l.price || 0).toLocaleString('en-IN')}</div>
                    <span style={{ background: l.status === 'active' ? 'rgba(34,197,94,0.15)' : 'rgba(251,191,36,0.15)', color: l.status === 'active' ? '#4ade80' : '#fbbf24', padding: '3px 10px', borderRadius: 20, fontSize: '0.68rem', fontWeight: 600 }}>{l.status || 'active'}</span>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {/* Connections */}
      {tab === 'connections' && (
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14, fontSize: '1rem' }}>🤝 Industry Network ({connections.length} users)</div>
          {connections.length === 0 ? (
            <EmptyState icon="🤝" title="No Connections Yet" sub="Users on the platform will appear here." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { title: '👨‍🌾 Farmer Suppliers', items: farmerConnections },
                { title: '🤝 Brokers', items: brokerConnections },
                { title: '🏭 Suppliers & Industries', items: supplierConnections },
              ].filter(sec => sec.items.length > 0).map(sec => (
                <div key={sec.title} style={{ ...G.glass, padding: 18, borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.92rem' }}>{sec.title}</span>
                    <span style={{ fontSize: '0.72rem', color: '#60a5fa', fontWeight: 600 }}>{sec.items.length} total</span>
                  </div>
                  {sec.items.slice(0, 6).map(it => (
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
            <StatCard icon="💰" value={fmtCurrency(totalSales)} label="Total Revenue" color="#4ade80" />
            <StatCard icon="📉" value={fmtCurrency(totalExpenses)} label="Procurement Cost" color="#f59e0b" />
            <StatCard icon="📊" value={String(sales.length + expenses.length)} label="Transactions" color="#60a5fa" />
          </div>
          {sales.length === 0 && expenses.length === 0 ? (
            <EmptyState icon="💳" title="No Payment Records" sub="Record your transactions in My Money." action="💰 Go to My Money" onAction={() => navigate('/my-money')} />
          ) : (
            <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#f1f5f9' }}>💳 Payment History</div>
              {[...sales.map(s => ({ ...s, _type: 'income', _date: s.sale_date || s.created_at })), ...expenses.map(e => ({ ...e, _type: 'expense', _date: e.expense_date || e.created_at }))]
                .sort((a, b) => new Date(b._date) - new Date(a._date))
                .slice(0, 15)
                .map((p, i) => (
                  <div key={i} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: p._type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(251,191,36,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{p._type === 'income' ? '💰' : '📦'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{p.description || p.crop || p.category || 'Transaction'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{new Date(p._date).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: p._type === 'income' ? '#4ade80' : '#f59e0b' }}>
                      ₹{parseFloat(p.amount || p.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 14, padding: '14px 24px', color: '#60a5fa', fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>{toast}</div>}
    </div>
  );
}
