import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/hooks/useAuth';
import { supabase } from '../lib/supabase';

const G = { glass: { background: 'rgba(255,255,255,0.03)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16 } };
const inp = { width: '100%', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 9, padding: '9px 12px', color: '#e2e8f0', boxSizing: 'border-box', outline: 'none' };
const TABS = [
  { id: 'catalog', icon: '📦', label: 'Catalog' },
  { id: 'orders', icon: '🛒', label: 'Orders' },
  { id: 'connections', icon: '🤝', label: 'Network' },
  { id: 'payments', icon: '💳', label: 'Payments' },
];
const CAT_COLORS = { Seeds: '#22c55e', Fertilizer: '#3b82f6', Pesticide: '#f59e0b', Equipment: '#8b5cf6', Organic: '#10b981' };

function EmptyState({ icon, title, sub, action, onAction }) {
  return (
    <div style={{ ...G.glass, padding: 40, borderRadius: 16, textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>{icon}</div>
      <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 6 }}>{title}</div>
      <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)', marginBottom: 16 }}>{sub}</div>
      {action && <button onClick={onAction} style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: '10px 20px', color: '#fff', cursor: 'pointer', fontWeight: 600 }}>{action}</button>}
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

export default function SupplierDashboardPage() {
  const navigate = useNavigate();
  const { user, farmerProfile } = useAuth();
  const uid = user?.id;
  const [tab, setTab] = useState('catalog');
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [loading, setLoading] = useState(true);

  // Real data state
  const [listings, setListings] = useState([]);
  const [sales, setSales] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [connections, setConnections] = useState([]);

  // Local product management (persisted in localStorage per user)
  const storageKey = `supplier_products_${uid}`;
  const [products, setProducts] = useState(() => {
    try { return JSON.parse(localStorage.getItem(storageKey) || '[]'); } catch { return []; }
  });
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProd, setNewProd] = useState({ name: '', brand: '', price: '', stock: '', unit: 'kg', cat: 'Fertilizer' });

  useEffect(() => {
    if (uid) localStorage.setItem(storageKey, JSON.stringify(products));
  }, [products, uid, storageKey]);

  useEffect(() => {
    if (!uid) { setLoading(false); return; }
    let cancelled = false;
    (async () => {
      const [listRes, salesRes, expRes, profRes] = await Promise.allSettled([
        supabase.from('marketplace_listings').select('*').eq('farmer_id', uid).order('created_at', { ascending: false }),
        supabase.from('sales').select('*').eq('farmer_id', uid).order('sale_date', { ascending: false }),
        supabase.from('expenses').select('*').eq('farmer_id', uid).order('expense_date', { ascending: false }),
        supabase.from('profiles').select('id,full_name,role,phone,district').limit(50),
      ]);
      if (cancelled) return;
      setListings(listRes.status === 'fulfilled' ? listRes.value?.data || [] : []);
      setSales(salesRes.status === 'fulfilled' ? salesRes.value?.data || [] : []);
      setExpenses(expRes.status === 'fulfilled' ? expRes.value?.data || [] : []);
      setConnections(profRes.status === 'fulfilled' ? (profRes.value?.data || []).filter(p => p.id !== uid) : []);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [uid]);

  function flash(m) { setToast(m); setTimeout(() => setToast(''), 2500); }
  const fmtCurrency = (v) => v >= 100000 ? '₹' + (v / 100000).toFixed(1) + 'L' : '₹' + v.toLocaleString('en-IN');
  const totalSales = sales.reduce((s, r) => s + parseFloat(r.amount || r.total_amount || 0), 0);
  const totalExpenses = expenses.reduce((s, r) => s + parseFloat(r.amount || 0), 0);

  function addProduct() {
    if (!newProd.name || !newProd.price) return;
    const id = 'P-' + Date.now().toString(36);
    setProducts(prev => [...prev, { ...newProd, id, price: +newProd.price, stock: +newProd.stock || 0, color: CAT_COLORS[newProd.cat] || '#8b5cf6' }]);
    setShowAddProduct(false);
    setNewProd({ name: '', brand: '', price: '', stock: '', unit: 'kg', cat: 'Fertilizer' });
    flash('✅ Product added');
  }

  const farmerConns = connections.filter(c => c.role === 'farmer');
  const otherConns = connections.filter(c => c.role !== 'farmer');

  if (loading) return <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.4)' }}>Loading...</div>;

  return (
    <div style={{ fontFamily: 'Inter,sans-serif' }}>
      {/* Header */}
      <div style={{ background: 'linear-gradient(135deg,#1e0533 0%,#0f172a 50%,#0c1a2e 100%)', borderRadius: 20, padding: '28px 32px', marginBottom: 24, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'radial-gradient(circle,rgba(139,92,246,0.3),transparent)', pointerEvents: 'none' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', position: 'relative' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 14, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem', boxShadow: '0 8px 24px rgba(139,92,246,0.4)' }}>🏪</div>
              <div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fff' }}>Supplier Portal</div>
                <div style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.5)' }}>Welcome, {farmerProfile?.name || 'Supplier'}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {[
                { l: 'Products', v: String(products.length + listings.length), c: '#8b5cf6' },
                { l: 'Revenue', v: fmtCurrency(totalSales), c: '#4ade80' },
                { l: 'Expenses', v: fmtCurrency(totalExpenses), c: '#f59e0b' },
                { l: 'Network', v: String(connections.length), c: '#60a5fa' },
              ].map(m => (
                <div key={m.l} style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 10, padding: '8px 14px', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontSize: '0.62rem', color: 'rgba(255,255,255,0.4)', marginBottom: 2 }}>{m.l}</div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 700, color: m.c }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <button onClick={() => setShowAddProduct(true)} style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: '10px 16px', color: '#fff', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, boxShadow: '0 4px 15px rgba(139,92,246,0.4)' }}>➕ Add Product</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, background: 'rgba(255,255,255,0.03)', borderRadius: 12, padding: 4, border: '1px solid rgba(255,255,255,0.06)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: '9px 6px', borderRadius: 9, border: 'none', cursor: 'pointer', fontSize: '0.76rem', fontWeight: 600, transition: 'all 0.25s', background: tab === t.id ? 'linear-gradient(135deg,#8b5cf6,#6d28d9)' : 'transparent', color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.45)', boxShadow: tab === t.id ? '0 4px 12px rgba(139,92,246,0.3)' : 'none' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Catalog */}
      {tab === 'catalog' && (
        <div>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder='🔍 Search products...' style={{ ...inp, flex: 1 }} />
          </div>
          {products.length === 0 && listings.length === 0 ? (
            <EmptyState icon="📦" title="No Products Yet" sub="Add your first product to start selling on the platform." action="➕ Add Product" onAction={() => setShowAddProduct(true)} />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(210px,1fr))', gap: 14 }}>
              {[...products, ...listings.map(l => ({ id: l.id, name: l.title || l.crop, brand: '', price: l.price || 0, stock: l.quantity || 0, unit: l.unit || 'kg', cat: l.category || 'Other', color: '#8b5cf6', _fromDB: true }))].filter(p => !search || p.name?.toLowerCase().includes(search.toLowerCase())).map(p => (
                <div key={p.id} style={{ ...G.glass, padding: 18, borderRadius: 14, transition: 'all 0.3s', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 30px rgba(0,0,0,0.3)' }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                    <span style={{ background: (p.color || '#8b5cf6') + '22', color: p.color || '#8b5cf6', padding: '3px 8px', borderRadius: 6, fontSize: '0.65rem', fontWeight: 700 }}>{p.cat}</span>
                    {p._fromDB && <span style={{ fontSize: '0.6rem', color: '#4ade80' }}>🔗 DB</span>}
                  </div>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 3 }}>{p.name}</div>
                  {p.brand && <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)', marginBottom: 10 }}>{p.brand}</div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 800, color: p.color || '#8b5cf6' }}>₹{parseFloat(p.price || 0).toLocaleString('en-IN')}</span>
                    <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.35)' }}>{p.stock} {p.unit}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders - from real sales data */}
      {tab === 'orders' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 16 }}>
            <StatCard icon="🛒" value={String(sales.length)} label="Total Orders" color="#8b5cf6" />
            <StatCard icon="💰" value={fmtCurrency(totalSales)} label="Revenue" color="#4ade80" />
            <StatCard icon="📉" value={fmtCurrency(totalExpenses)} label="Costs" color="#f59e0b" />
          </div>
          {sales.length === 0 ? (
            <EmptyState icon="🛒" title="No Orders Yet" sub="Orders will appear here when you record sales in My Money." action="💰 Go to My Money" onAction={() => navigate('/my-money')} />
          ) : (
            sales.map((s, i) => (
              <div key={s.id || i} style={{ ...G.glass, padding: 16, borderRadius: 12, marginBottom: 10, display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'rgba(139,92,246,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>🛒</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem' }}>{s.crop || s.description || 'Sale'}</div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{s.buyer || ''} · {new Date(s.sale_date || s.created_at).toLocaleDateString('en-IN')}</div>
                </div>
                <div style={{ fontWeight: 700, color: '#4ade80' }}>₹{parseFloat(s.amount || s.total_amount || 0).toLocaleString('en-IN')}</div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Connections - real profiles */}
      {tab === 'connections' && (
        <div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 14 }}>🤝 Business Network ({connections.length} users)</div>
          {connections.length === 0 ? (
            <EmptyState icon="🤝" title="Building Network" sub="Platform users will appear here as your network grows." />
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              {[
                { title: '👨‍🌾 Farmer Customers', items: farmerConns },
                { title: '🏭 Other Users', items: otherConns },
              ].filter(s => s.items.length > 0).map(sec => (
                <div key={sec.title} style={{ ...G.glass, padding: 18, borderRadius: 14 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.92rem' }}>{sec.title}</span>
                    <span style={{ fontSize: '0.72rem', color: '#a78bfa', fontWeight: 600 }}>{sec.items.length}</span>
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
            <StatCard icon="📊" value={String(sales.length + expenses.length)} label="Transactions" color="#a78bfa" />
          </div>
          {sales.length === 0 && expenses.length === 0 ? (
            <EmptyState icon="💳" title="No Transactions" sub="Record income and expenses in My Money." action="💰 My Money" onAction={() => navigate('/my-money')} />
          ) : (
            <div style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#f1f5f9' }}>💳 Transaction History</div>
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

      {/* Add Product Modal */}
      {showAddProduct && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 998, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowAddProduct(false)}>
          <div onClick={e => e.stopPropagation()} style={{ background: '#1a1f2e', borderRadius: 16, padding: 24, width: 420, maxHeight: '80vh', overflow: 'auto', border: '1px solid rgba(255,255,255,0.1)' }}>
            <h3 style={{ color: '#f1f5f9', margin: '0 0 16px' }}>➕ Add Product</h3>
            {[{ k: 'name', l: 'Product Name', ph: 'DAP Fertilizer' }, { k: 'brand', l: 'Brand', ph: 'IFFCO' }, { k: 'price', l: 'Price (₹)', ph: '1350', t: 'number' }, { k: 'stock', l: 'Stock', ph: '100', t: 'number' }].map(f => (
              <div key={f.k} style={{ marginBottom: 10 }}>
                <label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>{f.l}</label>
                <input type={f.t || 'text'} placeholder={f.ph} value={newProd[f.k]} onChange={e => setNewProd(p => ({ ...p, [f.k]: e.target.value }))} style={{ ...inp }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
              <div style={{ flex: 1 }}><label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Category</label><select value={newProd.cat} onChange={e => setNewProd(p => ({ ...p, cat: e.target.value }))} style={{ ...inp }}><option>Fertilizer</option><option>Seeds</option><option>Pesticide</option><option>Equipment</option><option>Organic</option></select></div>
              <div style={{ flex: 1 }}><label style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 4 }}>Unit</label><select value={newProd.unit} onChange={e => setNewProd(p => ({ ...p, unit: e.target.value }))} style={{ ...inp }}><option>kg</option><option>bag</option><option>bottle</option><option>L</option><option>pkt</option><option>set</option></select></div>
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
              <button onClick={addProduct} style={{ flex: 1, background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', borderRadius: 10, padding: 12, color: '#fff', cursor: 'pointer', fontWeight: 700 }}>💾 Save</button>
              <button onClick={() => setShowAddProduct(false)} style={{ flex: 1, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: 12, color: '#fff', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'rgba(16,185,129,0.95)', color: '#fff', padding: '12px 20px', borderRadius: 12, fontSize: '0.85rem', fontWeight: 600, zIndex: 999, boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}>{toast}</div>}
    </div>
  );
}
