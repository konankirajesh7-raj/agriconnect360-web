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
      {action && <button onClick={onAction} style={{ background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>{action}</button>}
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
  { id: 'deals', icon: '🤝', label: 'My Deals' },
  { id: 'network', icon: '🌐', label: 'Network' },
  { id: 'payments', icon: '💳', label: 'Payments' },
  { id: 'prices', icon: '💰', label: 'Market Intel' },
];

export default function BrokerDashboardPage() {
  const { t, tx } = useLanguage();
  const navigate = useNavigate();
  const { user, farmerProfile } = useAuth();
  const uid = user?.id;
  const [tab, setTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState('');

  // Real data state
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const [salesRes, expRes, pricesRes, dispRes, profilesRes] = await Promise.allSettled([
        supabase.from('sales').select('*').eq('farmer_id', uid).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('farmer_id', uid).order('expense_date', { ascending: false }),
        supabase.from('market_prices').select('*').order('price_date', { ascending: false }).limit(50),
        supabase.from('disputes').select('*').eq('farmer_id', uid),
        supabase.from('profiles').select('id,full_name,role,phone,district,created_at').limit(50),
      ]);
      if (cancelled) return;
      setSales(salesRes.status === 'fulfilled' ? salesRes.value?.data || [] : []);
      setExpenses(expRes.status === 'fulfilled' ? expRes.value?.data || [] : []);
      setMarketPrices(pricesRes.status === 'fulfilled' ? pricesRes.value?.data || [] : []);
      setDisputes(dispRes.status === 'fulfilled' ? dispRes.value?.data || [] : []);
      setConnections(profilesRes.status === 'fulfilled' ? (profilesRes.value?.data || []).filter(p => p.id !== uid) : []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  function flash(m) { setToast(m); setTimeout(() => setToast(''), 2500); }

  const totalSales = sales.reduce((s, r) => s + parseFloat(r.amount || r.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const profit = totalSales - totalExpenses;
  const fmtCurrency = (v) => v >= 100000 ? '₹' + (v / 100000).toFixed(1) + 'L' : '₹' + v.toLocaleString('en-IN');

  // Group market prices by crop
  const pricesByCrop = {};
  marketPrices.forEach(p => {
    const crop = p.crop || p.commodity || 'Unknown';
    if (!pricesByCrop[crop]) pricesByCrop[crop] = [];
    pricesByCrop[crop].push(p);
  });
  const topCrops = Object.entries(pricesByCrop).slice(0, 8);

  const farmerConnections = connections.filter(c => c.role === 'farmer');
  const otherConnections = connections.filter(c => c.role !== 'farmer');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading real data...</div>;

  return (
    <div style={{ fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1a1200 0%,#0f172a 50%,#120d00 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -50, right: -50, width: 220, height: 220, borderRadius: '50%', background: 'radial-gradient(circle,rgba(245,158,11,0.3),transparent)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#f59e0b,#d97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 8px 24px rgba(245,158,11,0.4)' }}>🤝</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Broker Portal</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Welcome, {farmerProfile?.name || 'Broker'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { l: 'Total Deals', v: String(sales.length), c: '#fbbf24' },
                { l: 'Revenue', v: fmtCurrency(totalSales), c: '#4ade80' },
                { l: 'Connections', v: String(connections.length), c: '#60a5fa' },
                { l: 'Profit', v: fmtCurrency(profit), c: profit >= 0 ? '#4ade80' : '#ef4444' },
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
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600, transition: 'all 0.25s', background: tab === t.id ? 'linear-gradient(135deg,#f59e0b,#d97706)' : 'transparent', color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: tab === t.id ? '0 4px 12px rgba(245,158,11,0.3)' : 'none' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 16 }}>
            <StatCard icon="🤝" value={String(sales.length)} label="Total Deals" color="#fbbf24" />
            <StatCard icon="💰" value={fmtCurrency(totalSales)} label="Total Revenue" color="#4ade80" />
            <StatCard icon="📉" value={fmtCurrency(totalExpenses)} label="Expenses" color="#ef4444" />
            <StatCard icon="📈" value={fmtCurrency(profit)} label="Net Profit" color={profit >= 0 ? '#4ade80' : '#ef4444'} />
          </div>

          {/* Recent Activity */}
          <div style={{ ...G.glass, padding: 18, borderRadius: 14, marginBottom: 16 }}>
            <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 12 }}>📋 Recent Transactions</div>
            {sales.length === 0 && expenses.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 20, color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>No transactions yet. Start recording your deals in My Money.</div>
            ) : (
              [...sales.slice(0, 3).map(s => ({ ...s, _type: 'sale' })), ...expenses.slice(0, 3).map(e => ({ ...e, _type: 'expense' }))]
                .sort((a, b) => new Date(b.created_at || b.sale_date || b.expense_date) - new Date(a.created_at || a.sale_date || a.expense_date))
                .slice(0, 5)
                .map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div style={{ width: 8, height: 8, borderRadius: 4, background: item._type === 'sale' ? '#4ade80' : '#ef4444' }} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f1f5f9' }}>{item.description || item.crop || item.category || 'Transaction'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{new Date(item.sale_date || item.expense_date || item.created_at).toLocaleDateString('en-IN')}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: item._type === 'sale' ? '#4ade80' : '#ef4444' }}>
                      {item._type === 'sale' ? '+' : '-'}₹{parseFloat(item.amount || item.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Quick Actions */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 10 }}>
            {[
              { icon: '💰', label: 'My Money', path: '/my-money', color: '#fbbf24' },
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

      {/* Deals Tab */}
      {tab === 'deals' && (
        <div>
          {sales.length === 0 ? (
            <EmptyState icon="🤝" title="No Deals Recorded" sub="Your sales and deals will appear here when you record them in My Money." action="➕ Record a Deal" onAction={() => navigate('/my-money')} />
          ) : (
            sales.map((d, i) => (
              <div key={d.id || i} style={{ ...G.glass, padding: 16, borderRadius: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(245,158,11,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🤝</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem' }}>{d.crop || d.description || 'Deal'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>
                    {d.buyer || ''} · {d.quantity ? d.quantity + ' Q' : ''} · {new Date(d.sale_date || d.created_at).toLocaleDateString('en-IN')}
                  </div>
                </div>
                <div style={{ fontWeight: 700, color: '#fbbf24' }}>₹{parseFloat(d.amount || d.total_amount || 0).toLocaleString('en-IN')}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Network Tab */}
      {tab === 'network' && (
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14, fontSize: '1rem' }}>🌐 Platform Network ({connections.length} users)</div>
          {connections.length === 0 ? (
            <EmptyState icon="🌐" title="Building Network" sub="Other users on the platform will appear here." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { title: '👨‍🌾 Farmers', items: farmerConnections },
                { title: '🏭 Other Roles', items: otherConnections },
              ].filter(sec => sec.items.length > 0).map(sec => (
                <div key={sec.title} style={{ ...G.glass, padding: 18, borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.92rem' }}>{sec.title}</span>
                    <span style={{ fontSize: '0.72rem', color: '#fbbf24', fontWeight: 600 }}>{sec.items.length} total</span>
                  </div>
                  {sec.items.slice(0, 6).map(it => (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{it.full_name || 'User'}</div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>📍 {it.district || 'N/A'} · {it.role || 'farmer'}</div>
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

      {/* Payments Tab */}
      {tab === 'payments' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            <StatCard icon="💰" value={fmtCurrency(totalSales)} label="Total Income" color="#4ade80" />
            <StatCard icon="📉" value={fmtCurrency(totalExpenses)} label="Total Expenses" color="#ef4444" />
            <StatCard icon="📊" value={String(sales.length + expenses.length)} label="Transactions" color="#60a5fa" />
          </div>
          {sales.length === 0 && expenses.length === 0 ? (
            <EmptyState icon="💳" title="No Payment Records" sub="Record your income and expenses in My Money to see them here." action="💰 Go to My Money" onAction={() => navigate('/my-money')} />
          ) : (
            <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#f1f5f9' }}>💳 All Transactions</div>
              {[...sales.map(s => ({ ...s, _type: 'income', _date: s.sale_date || s.created_at })), ...expenses.map(e => ({ ...e, _type: 'expense', _date: e.expense_date || e.created_at }))]
                .sort((a, b) => new Date(b._date) - new Date(a._date))
                .slice(0, 15)
                .map((p, i) => (
                  <div key={i} style={{ padding: '12px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: p._type === 'income' ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>{p._type === 'income' ? '💰' : '📉'}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{p.description || p.crop || p.category || 'Transaction'}</div>
                      <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)' }}>{new Date(p._date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: p._type === 'income' ? '#4ade80' : '#ef4444' }}>
                      {p._type === 'income' ? '+' : '-'}₹{parseFloat(p.amount || p.total_amount || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Market Intel Tab */}
      {tab === 'prices' && (
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14, fontSize: '1rem' }}>📊 Live Market Prices</div>
          {marketPrices.length === 0 ? (
            <EmptyState icon="📊" title="No Market Data" sub="Market prices will appear here once available." action="📊 View Market Prices" onAction={() => navigate('/market-prices')} />
          ) : (
            <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead><tr style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                  {['Crop', 'Market', 'Price (₹/Q)', 'Date'].map(h => <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{h}</th>)}
                </tr></thead>
                <tbody>{marketPrices.slice(0, 15).map((p, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '12px 16px', fontWeight: 600, color: '#f1f5f9', fontSize: '0.85rem' }}>{p.crop || p.commodity}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>{p.market || p.district || 'N/A'}</td>
                    <td style={{ padding: '12px 16px', fontWeight: 700, color: '#4ade80', fontSize: '0.85rem' }}>₹{parseFloat(p.modal_price || p.price || 0).toLocaleString('en-IN')}</td>
                    <td style={{ padding: '12px 16px', color: 'rgba(255,255,255,0.4)', fontSize: '0.78rem' }}>{p.price_date ? new Date(p.price_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'N/A'}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          )}
          <button onClick={() => navigate('/market-prices')} style={{ marginTop: 12, background: 'rgba(245,158,11,0.12)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 10, padding: '10px 20px', color: '#fbbf24', cursor: 'pointer', fontWeight: 600 }}>📊 Full Market Analysis →</button>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, padding: '14px 24px', color: '#4ade80', fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>{toast}</div>}
    </div>
  );
}
