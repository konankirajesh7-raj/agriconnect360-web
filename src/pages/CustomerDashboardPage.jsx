import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const G = { glass: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 } };
const ST = {
  delivered: { bg: 'rgba(34,197,94,0.1)', c: '#22c55e', t: '✅ Delivered' },
  in_transit: { bg: 'rgba(245,158,11,0.1)', c: '#f59e0b', t: '🚛 In Transit' },
  confirmed: { bg: 'rgba(59,130,246,0.1)', c: '#60a5fa', t: '📦 Confirmed' },
  pending: { bg: 'rgba(139,92,246,0.1)', c: '#a78bfa', t: '⏳ Pending' },
  active: { bg: 'rgba(34,197,94,0.1)', c: '#22c55e', t: '✅ Active' },
  sold: { bg: 'rgba(251,191,36,0.1)', c: '#fbbf24', t: '💰 Sold' },
};

function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ ...G.glass, padding: 40, borderRadius: 16, textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{sub}</div>
      {action && <button onClick={onAction} style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{action}</button>}
    </div>
  );
}

export default function CustomerDashboardPage() {
  const navigate = useNavigate();
  const { user, farmerProfile } = useAuth();
  const uid = user?.id;
  const [tab, setTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Real data
  const [listings, setListings] = useState([]);
  const [marketPrices, setMarketPrices] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [connections, setConnections] = useState([]);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const [listRes, priceRes, salesRes, expRes, profRes] = await Promise.allSettled([
        supabase.from('marketplace_listings').select('*').order('created_at', { ascending: false }).limit(50),
        supabase.from('market_prices').select('*').order('price_date', { ascending: false }).limit(30),
        supabase.from('sales').select('*').eq('farmer_id', uid).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('farmer_id', uid).order('expense_date', { ascending: false }),
        supabase.from('profiles').select('id,full_name,role,phone,district').limit(50),
      ]);
      if (cancelled) return;
      setListings(listRes.status === 'fulfilled' ? listRes.value?.data || [] : []);
      setMarketPrices(priceRes.status === 'fulfilled' ? priceRes.value?.data || [] : []);
      setSales(salesRes.status === 'fulfilled' ? salesRes.value?.data || [] : []);
      setExpenses(expRes.status === 'fulfilled' ? expRes.value?.data || [] : []);
      setConnections(profRes.status === 'fulfilled' ? (profRes.value?.data || []).filter(p => p.id !== uid) : []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  const totalSpent = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);
  const fmtCurrency = (v) => v >= 100000 ? '₹' + (v / 100000).toFixed(1) + 'L' : '₹' + v.toLocaleString('en-IN');

  const filteredListings = listings.filter(p => {
    if (search && !(p.title || p.crop || '').toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const farmerConns = connections.filter(c => c.role === 'farmer');
  const supplierConns = connections.filter(c => c.role === 'supplier');
  const otherConns = connections.filter(c => c.role !== 'farmer' && c.role !== 'supplier');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div className="animated" style={{ fontFamily: 'Inter,sans-serif' }}>
      {/* Hero Header */}
      <div style={{ background: 'linear-gradient(135deg,#7c3aed,#db2777,#f59e0b)', borderRadius: 16, padding: '26px 28px', marginBottom: 22, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 180, height: 180, background: 'radial-gradient(circle,rgba(255,255,255,0.12),transparent)', borderRadius: '50%' }} />
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff', margin: 0 }}>🛍️ Customer Dashboard</h1>
        <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '0.82rem', marginTop: 4 }}>Welcome, {farmerProfile?.name || 'Customer'} · Buy fresh from farmers</p>
        <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
          {[
            { v: String(expenses.length), l: 'My Orders', c: '#fbbf24', i: '📦' },
            { v: String(listings.length), l: 'Available', c: '#34d399', i: '🛒' },
            { v: fmtCurrency(totalSpent), l: 'Total Spent', c: '#c084fc', i: '💰' },
            { v: String(connections.length), l: 'Network', c: '#60a5fa', i: '🤝' },
          ].map(s => (
            <div key={s.l} style={{ background: 'rgba(255,255,255,0.12)', borderRadius: 10, padding: '10px 18px', textAlign: 'center', flex: '1', minWidth: 90 }}>
              <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.c }}>{s.v}</div>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.7)' }}>{s.i} {s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20, flexWrap: 'wrap' }}>
        {[['overview', '📊', 'Overview'], ['browse', '🛒', 'Browse'], ['orders', '📦', 'My Orders'], ['connections', '🤝', 'Network'], ['prices', '📈', 'Prices']].map(([id, icon, label]) => (
          <button key={id} onClick={() => setTab(id)} style={{ padding: '10px 20px', borderRadius: 24, border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 700, background: tab === id ? 'linear-gradient(135deg,#7c3aed,#db2777)' : 'rgba(255,255,255,0.05)', color: tab === id ? '#fff' : 'rgba(255,255,255,0.5)', boxShadow: tab === id ? '0 4px 14px rgba(124,58,237,0.35)' : 'none', transition: 'all 0.2s' }}>
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === 'overview' && (
        <>
          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: '#f1f5f9' }}>🔥 Available Products ({listings.length})</div>
          {listings.length === 0 ? (
            <EmptyState icon="🛒" title="No Products Available" sub="Marketplace listings will appear here." action="🛒 Visit Marketplace" onAction={() => navigate('/marketplace')} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(240px,1fr))', gap: 14, marginBottom: 24 }}>
              {listings.slice(0, 4).map(p => (
                <div key={p.id} style={{ ...G.glass, padding: 16, cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ fontSize: '1.8rem' }}>🌾</span>
                    <span style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '3px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 700 }}>₹{parseFloat(p.price || 0).toLocaleString('en-IN')}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>{p.title || p.crop || 'Product'}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)', marginTop: 2 }}>{p.description?.substring(0, 50) || 'Fresh from farm'}</div>
                </div>
              ))}
            </div>
          )}

          <div style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: 12, color: '#f1f5f9' }}>📦 Recent Purchases</div>
          {expenses.length === 0 ? (
            <div style={{ ...G.glass, padding: 20, borderRadius: 14, textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '0.82rem' }}>No purchases recorded yet. Track your spending in My Money.</div>
          ) : (
            <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
              {expenses.slice(0, 5).map((o, i) => (
                <div key={o.id || i} style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>{o.description || o.category || 'Purchase'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(o.expense_date || o.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#c084fc' }}>₹{parseFloat(o.amount || 0).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Browse Products */}
      {tab === 'browse' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="🔍 Search products..."
              style={{ flex: '1 1 180px', minWidth: 160, padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.06)', color: '#e2e8f0', fontSize: '0.85rem', boxSizing: 'border-box', outline: 'none' }} />
            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>({filteredListings.length} products)</span>
          </div>
          {filteredListings.length === 0 ? (
            <EmptyState icon="🛒" title="No Products Found" sub="Try a different search or check back later." action="🛒 Marketplace" onAction={() => navigate('/marketplace')} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
              {filteredListings.map(p => (
                <div key={p.id} style={{ ...G.glass, padding: 18, transition: 'all 0.2s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <div style={{ width: 48, height: 48, borderRadius: 12, background: 'rgba(124,58,237,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem' }}>🌾</div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontWeight: 800, color: '#22c55e', fontSize: '1.1rem' }}>₹{parseFloat(p.price || 0).toLocaleString('en-IN')}</div>
                      {p.quantity && <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>{p.quantity} {p.unit || 'units'}</div>}
                    </div>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '0.92rem', marginBottom: 4, color: '#f1f5f9' }}>{p.title || p.crop || 'Product'}</div>
                  <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.4)' }}>{p.description?.substring(0, 60) || ''}</div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={() => navigate('/marketplace')} style={{ flex: 1, padding: '8px', borderRadius: 10, border: 'none', background: 'linear-gradient(135deg,#22c55e,#16a34a)', color: '#fff', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>🛒 View Details</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* My Orders */}
      {tab === 'orders' && (
        <div>
          {expenses.length === 0 ? (
            <EmptyState icon="📦" title="No Orders Yet" sub="Your purchases will appear here when recorded in My Money." action="💰 My Money" onAction={() => navigate('/my-money')} />
          ) : (
            <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#f1f5f9' }}>📦 All Orders ({expenses.length})</div>
              {expenses.map((o, i) => (
                <div key={o.id || i} style={{ padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem', color: '#f1f5f9' }}>{o.description || o.category || 'Purchase'}</div>
                    <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>{new Date(o.expense_date || o.created_at).toLocaleDateString('en-IN')}</div>
                  </div>
                  <div style={{ fontWeight: 800, color: '#22c55e' }}>₹{parseFloat(o.amount || 0).toLocaleString('en-IN')}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Connections */}
      {tab === 'connections' && (
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14, fontSize: '1rem' }}>🤝 My Network ({connections.length})</div>
          {connections.length === 0 ? (
            <EmptyState icon="🤝" title="No Connections" sub="Platform users will appear here." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { title: '👨‍🌾 Farmers', items: farmerConns },
                { title: '🏪 Suppliers', items: supplierConns },
                { title: '🏭 Others', items: otherConns },
              ].filter(s => s.items.length > 0).map(sec => (
                <div key={sec.title} style={{ ...G.glass, padding: 18, borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.92rem' }}>{sec.title}</span>
                    <span style={{ fontSize: '0.72rem', color: '#c084fc', fontWeight: 600 }}>{sec.items.length}</span>
                  </div>
                  {sec.items.slice(0, 6).map(it => (
                    <div key={it.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f1f5f9' }}>{it.full_name || 'User'}</div>
                        <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.4)' }}>📍 {it.district || 'N/A'} · {it.role}</div>
                      </div>
                      {it.phone && <button onClick={() => window.open('tel:' + it.phone)} style={{ background: 'rgba(124,58,237,0.1)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 6, padding: '3px 8px', color: '#a78bfa', cursor: 'pointer', fontSize: '0.68rem' }}>📞</button>}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Price Trends */}
      {tab === 'prices' && (
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>📈 Market Prices</div>
          {marketPrices.length === 0 ? (
            <EmptyState icon="📈" title="No Price Data" sub="Market prices will appear here once available." action="📊 Market Prices" onAction={() => navigate('/market-prices')} />
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 14 }}>
                {marketPrices.slice(0, 12).map((p, i) => (
                  <div key={i} style={{ ...G.glass, padding: 16, borderRadius: 12 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 6, color: '#f1f5f9' }}>{p.crop || p.commodity}</div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#22c55e' }}>₹{parseFloat(p.modal_price || p.price || 0).toLocaleString('en-IN')}/Q</div>
                    <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>📍 {p.market || p.district || 'N/A'}</div>
                  </div>
                ))}
              </div>
              <button onClick={() => navigate('/market-prices')} style={{ marginTop: 16, background: 'linear-gradient(135deg,#7c3aed,#db2777)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>📊 Full Market Analysis →</button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
