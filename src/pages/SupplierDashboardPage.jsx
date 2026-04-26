import React, { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

const TABS = [
  { id: 'catalog', icon: '📦', label: 'Product Catalog' },
  { id: 'orders', icon: '🛒', label: 'Orders' },
  { id: 'inventory', icon: '📊', label: 'Inventory' },
  { id: 'outreach', icon: '📣', label: 'Farmer Outreach' },
  { id: 'payments', icon: '💳', label: 'Payments' },
  { id: 'profile', icon: '🏪', label: 'Shop Profile' },
];

const DEMO_PRODUCTS = [
  { id: 'P-001', name: 'Cotton Seeds (BT-2)', brand: 'Mahyco', price: 850, stock: 340, unit: 'pkt', category: 'Seeds' },
  { id: 'P-002', name: 'DAP 50kg', brand: 'IFFCO', price: 1350, stock: 120, unit: 'bag', category: 'Fertilizer' },
  { id: 'P-003', name: 'Neem Oil Spray 1L', brand: 'Organic India', price: 420, stock: 85, unit: 'bottle', category: 'Pesticide' },
  { id: 'P-004', name: 'Drip Irrigation Kit', brand: 'Jain Irrigation', price: 4500, stock: 18, unit: 'set', category: 'Equipment' },
  { id: 'P-005', name: 'Urea 45kg', brand: 'NFL', price: 266, stock: 450, unit: 'bag', category: 'Fertilizer' },
];

const DEMO_ORDERS = [
  { id: 'ORD-501', farmer: 'Ramaiah Naidu', items: 'DAP ×2, Urea ×3', total: 3498, status: 'Pending', date: '2026-04-23' },
  { id: 'ORD-502', farmer: 'Lakshmi Devi', items: 'Cotton Seeds ×5', total: 4250, status: 'Shipped', date: '2026-04-22' },
  { id: 'ORD-503', farmer: 'Suresh Kumar', items: 'Drip Kit ×1, Neem Oil ×3', total: 5760, status: 'Delivered', date: '2026-04-20' },
  { id: 'ORD-504', farmer: 'Priya Reddy', items: 'DAP ×1, Urea ×2', total: 1882, status: 'Pending', date: '2026-04-23' },
];

export default function SupplierDashboardPage() {
  const { farmerProfile } = useAuth();
  const [activeTab, setActiveTab] = useState('catalog');

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">🏪 Supplier Dashboard</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
          Product catalog, order management, inventory tracking & farmer outreach
        </div>
      </div>

      <div className="prem-tab-row">
        {TABS.map(t => (
          <button key={t.id} className={`prem-tab-btn${activeTab === t.id ? ' active' : ''}`} onClick={() => setActiveTab(t.id)}>
            <span className="prem-tab-icon">{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Product Catalog */}
      {activeTab === 'catalog' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📦 Product Catalog</div>
          <div className="role-section-desc">Manage your products, pricing tiers, and stock levels</div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>ID</th><th>Product</th><th>Brand</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {DEMO_PRODUCTS.map(p => (
                  <tr key={p.id}>
                    <td><code>{p.id}</code></td>
                    <td><b>{p.name}</b></td>
                    <td>{p.brand}</td>
                    <td><span className="role-badge info">{p.category}</span></td>
                    <td>₹{p.price.toLocaleString('en-IN')}/{p.unit}</td>
                    <td><span className={p.stock < 50 ? 'role-badge danger' : p.stock < 100 ? 'role-badge warn' : ''}>{p.stock} {p.unit}s</span></td>
                    <td><span className={`role-badge ${p.stock > 0 ? 'success' : 'danger'}`}>{p.stock > 0 ? 'In Stock' : 'Out'}</span></td>
                    <td><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }}>Edit</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button className="btn btn-primary" style={{ marginTop: 12, padding: '9px 18px', fontSize: '0.82rem' }}>➕ Add Product</button>
        </div>
      )}

      {/* Orders */}
      {activeTab === 'orders' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🛒 Order Management</div>
          <div className="role-section-desc">Incoming farmer orders, accept/reject, and delivery scheduling</div>

          <div className="role-summary-bar" style={{ marginBottom: 16 }}>
            <div className="role-summary-item"><div className="label">Total Orders</div><div className="value">{DEMO_ORDERS.length}</div></div>
            <div className="role-summary-item"><div className="label">Pending</div><div className="value" style={{ color: '#fbbf24' }}>{DEMO_ORDERS.filter(o => o.status === 'Pending').length}</div></div>
            <div className="role-summary-item"><div className="label">Revenue (MTD)</div><div className="value">₹{DEMO_ORDERS.reduce((s, o) => s + o.total, 0).toLocaleString('en-IN')}</div></div>
          </div>

          <div className="role-table-wrap">
            <table className="role-table">
              <thead>
                <tr><th>Order ID</th><th>Farmer</th><th>Items</th><th>Total</th><th>Status</th><th>Date</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {DEMO_ORDERS.map(o => (
                  <tr key={o.id}>
                    <td><code>{o.id}</code></td>
                    <td><b>{o.farmer}</b></td>
                    <td>{o.items}</td>
                    <td>₹{o.total.toLocaleString('en-IN')}</td>
                    <td><span className={`role-badge ${o.status === 'Delivered' ? 'success' : o.status === 'Shipped' ? 'info' : 'warn'}`}>{o.status}</span></td>
                    <td>{o.date}</td>
                    <td style={{ display: 'flex', gap: 4 }}>
                      {o.status === 'Pending' && <>
                        <button className="btn btn-primary" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Accept</button>
                        <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Reject</button>
                      </>}
                      {o.status !== 'Pending' && <button className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.7rem' }}>Track</button>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inventory */}
      {activeTab === 'inventory' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📊 Inventory Dashboard</div>
          <div className="role-section-desc">Real-time stock levels, low stock alerts, and reorder suggestions</div>

          <div className="role-grid-3">
            {DEMO_PRODUCTS.map(p => (
              <div key={p.id} className={`role-card ${p.stock < 50 ? 'danger-border' : ''}`}>
                <div className="role-card-header">
                  <span className="role-card-title">{p.name}</span>
                  {p.stock < 50 && <span className="role-badge danger">⚠️ Low</span>}
                </div>
                <div className="role-stat-row"><span>Stock</span><b>{p.stock} {p.unit}s</b></div>
                <div className="role-stat-row"><span>Value</span><b>₹{(p.stock * p.price).toLocaleString('en-IN')}</b></div>
                <div className="role-progress-bar">
                  <div className={`fill ${p.stock < 50 ? 'danger' : p.stock < 100 ? 'warn' : 'ok'}`} style={{ width: `${Math.min((p.stock / 500) * 100, 100)}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="role-summary-bar" style={{ marginTop: 14 }}>
            <div className="role-summary-item"><div className="label">Total SKUs</div><div className="value">{DEMO_PRODUCTS.length}</div></div>
            <div className="role-summary-item"><div className="label">Inventory Value</div><div className="value">₹{DEMO_PRODUCTS.reduce((s, p) => s + p.stock * p.price, 0).toLocaleString('en-IN')}</div></div>
            <div className="role-summary-item"><div className="label">Low Stock Items</div><div className="value" style={{ color: '#ef4444' }}>{DEMO_PRODUCTS.filter(p => p.stock < 50).length}</div></div>
          </div>
        </div>
      )}

      {/* Farmer Outreach */}
      {activeTab === 'outreach' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">📣 Farmer Outreach</div>
          <div className="role-section-desc">Send product offers, seasonal campaigns, and discount coupons</div>

          <div className="role-grid-2">
            <div className="role-panel">
              <div className="panel-title">📱 Send SMS Campaign</div>
              <div className="role-field-group"><label>Target Crop</label>
                <select className="role-select"><option>All Farmers</option><option>Cotton Farmers</option><option>Paddy Farmers</option><option>Groundnut Farmers</option></select>
              </div>
              <div className="role-field-group"><label>Message</label>
                <textarea className="role-input" rows={3} defaultValue="🌱 Monsoon Sale! 20% off on DAP & Urea. Order now on AgriConnect 360. Limited stock!" />
              </div>
              <button className="btn btn-primary" style={{ marginTop: 8, padding: '9px 18px', fontSize: '0.82rem', width: '100%' }}>📤 Send to 847 Farmers</button>
            </div>
            <div className="role-panel">
              <div className="panel-title">🎟️ Create Discount Coupon</div>
              <div className="role-field-group"><label>Coupon Code</label><input className="role-input" defaultValue="MONSOON2026" /></div>
              <div className="role-field-group"><label>Discount %</label><input className="role-input" type="number" defaultValue={20} /></div>
              <div className="role-field-group"><label>Valid Until</label><input className="role-input" type="date" defaultValue="2026-07-31" /></div>
              <button className="btn btn-outline" style={{ marginTop: 8, padding: '9px 18px', fontSize: '0.82rem', width: '100%' }}>🎟️ Create Coupon</button>
            </div>
          </div>
        </div>
      )}

      {/* Payments */}
      {activeTab === 'payments' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">💳 Payment & Invoicing</div>
          <div className="role-section-desc">Track farmer payments, auto-generate GST invoices, credit ledger</div>

          <div className="role-grid-3">
            <div className="role-metric-card">
              <div className="metric-icon">💰</div>
              <div className="metric-value">₹2.45L</div>
              <div className="metric-label">Revenue (This Month)</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">📄</div>
              <div className="metric-value">23</div>
              <div className="metric-label">GST Invoices Generated</div>
            </div>
            <div className="role-metric-card">
              <div className="metric-icon">⏳</div>
              <div className="metric-value">₹38,200</div>
              <div className="metric-label">Outstanding Credit</div>
            </div>
          </div>
        </div>
      )}

      {/* Shop Profile */}
      {activeTab === 'profile' && (
        <div className="card" style={{ padding: 22 }}>
          <div className="role-section-title">🏪 Shop Profile</div>
          <div className="role-section-desc">Public shop information visible to farmers</div>

          <div className="role-grid-2">
            <div className="role-panel">
              <div className="panel-title">Shop Details</div>
              <div className="role-field-group"><label>Shop Name</label><input className="role-input" defaultValue="Sri Sai Agri Centre" /></div>
              <div className="role-field-group"><label>Location</label><input className="role-input" defaultValue="Main Road, Guntur" /></div>
              <div className="role-field-group"><label>Phone</label><input className="role-input" defaultValue="+91 98765 43210" /></div>
              <div className="role-field-group"><label>Business Hours</label><input className="role-input" defaultValue="8:00 AM - 7:00 PM" /></div>
            </div>
            <div className="role-panel">
              <div className="panel-title">Categories & Brands</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {['Seeds', 'Fertilizers', 'Pesticides', 'Equipment', 'Organic'].map(c => <span key={c} className="role-badge info">{c}</span>)}
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {['Mahyco', 'IFFCO', 'NFL', 'Jain Irrigation', 'Bayer'].map(b => <span key={b} className="role-badge success">{b}</span>)}
              </div>
              <div className="role-stat-row"><span>Delivery Radius</span><b>25 km</b></div>
              <div className="role-stat-row"><span>Farmer Rating</span><b>⭐ 4.5 (234 reviews)</b></div>
              <button className="btn btn-primary" style={{ marginTop: 12, padding: '9px 18px', fontSize: '0.82rem', width: '100%' }}>💾 Save Profile</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
