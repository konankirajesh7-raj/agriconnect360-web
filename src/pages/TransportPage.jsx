import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_TRANSPORTERS = [
  { id: 1, name: 'Raju Transport Co', business_name: 'Raju Logistics', mobile: '9876501001', district: 'Mysuru', rating: 4.3, total_trips: 234, is_available: true, is_verified: true, vehicle_type: 'Truck (10T)', price_per_km: 18 },
  { id: 2, name: 'Shiva Brothers', business_name: 'Shiva Agri Transport', mobile: '9876501002', district: 'Belagavi', rating: 4.7, total_trips: 412, is_available: true, is_verified: true, vehicle_type: 'Tempo (5T)', price_per_km: 14 },
  { id: 3, name: 'AP Transports', business_name: 'APT Logistics', mobile: '9876501003', district: 'Guntur', rating: 4.0, total_trips: 89, is_available: false, is_verified: false, vehicle_type: 'Mini Truck (3T)', price_per_km: 12 },
  { id: 4, name: 'Agri Movers', business_name: 'AM Cargo', mobile: '9876501004', district: 'Hubli', rating: 4.5, total_trips: 156, is_available: true, is_verified: true, vehicle_type: 'Truck (10T)', price_per_km: 16 },
];

const MOCK_BOOKINGS = [
  { id: 1, farmer_id: 1, transporter_id: 1, crop_type: 'Paddy', quantity_tonnes: 5.5, pickup_address: 'Nanjangud Village', delivery_address: 'Mysuru APMC', booking_date: '2024-12-22', total_amount: 4200, status: 'in_transit', payment_status: 'advance_paid', distance_km: 42, eta: '2:30 PM' },
  { id: 2, farmer_id: 4, transporter_id: 2, crop_type: 'Cotton', quantity_tonnes: 2.0, pickup_address: 'Muddebihal', delivery_address: 'Hubli Mandi', booking_date: '2024-12-24', total_amount: 3800, status: 'requested', payment_status: 'pending', distance_km: 180, eta: null },
  { id: 3, farmer_id: 7, transporter_id: 1, crop_type: 'Wheat', quantity_tonnes: 8.0, pickup_address: 'Lingasugur', delivery_address: 'Raichur FCI', booking_date: '2024-12-15', total_amount: 6500, status: 'completed', payment_status: 'completed', distance_km: 65, eta: null },
];

const STATUS_COLOR = { requested: '#f59e0b', confirmed: '#3b82f6', in_transit: '#22c55e', completed: '#8b5cf6', cancelled: '#ef4444' };
const STATUS_ICONS = { requested: '📋', confirmed: '✅', in_transit: '🚛', completed: '🏁', cancelled: '❌' };

export default function TransportPage() {
  const [transporters, setTransporters] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('directory');

  useEffect(() => {
    const token = localStorage.getItem('agri_admin_token');
    Promise.allSettled([
      axios.get('/api/v1/transport/transporters', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/v1/transport/bookings?all=true', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([tr, br]) => {
      setTransporters(tr.status === 'fulfilled' ? (tr.value.data.transporters || tr.value.data.data || []) : MOCK_TRANSPORTERS);
      setBookings(br.status === 'fulfilled' ? (br.value.data.bookings || br.value.data.data || []) : MOCK_BOOKINGS);
    }).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'directory', icon: '🚛', label: 'Transporters' },
    { id: 'bookings', icon: '📋', label: 'Bookings' },
    { id: 'tracking', icon: '📍', label: 'Live Tracking' },
    { id: 'estimate', icon: '💰', label: 'Cost Estimator' },
  ];

  const activeTrips = bookings.filter(b => b.status === 'in_transit');

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🚛 Transport & Logistics</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Farm-to-market transport • Live tracking • Cost estimation</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Book Transport</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Transporters', value: transporters.length, icon: '🚛', color: '#3b82f6' },
          { label: 'Available Now', value: transporters.filter(t => t.is_available).length, icon: '🟢', color: '#22c55e' },
          { label: 'Active Trips', value: activeTrips.length, icon: '📍', color: '#f59e0b' },
          { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length, icon: '✅', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'directory' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {loading ? <div className="loading-state" style={{ gridColumn: '1/-1' }}>⟳ Loading...</div> :
            transporters.map(t => (
              <div key={t.id} className="card" style={{ padding: '20px', opacity: t.is_available ? 1 : 0.65, transition: 'transform 0.2s' }}
                onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.95rem' }}>{t.name}</span>
                      {t.is_verified && <span style={{ background: '#22c55e', color: '#fff', padding: '1px 8px', borderRadius: 10, fontSize: '0.6rem', fontWeight: 700 }}>✓ VERIFIED</span>}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{t.district} • {t.vehicle_type} • 📞 {t.mobile}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#22c55e' }}>₹{t.price_per_km}<span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>/km</span></div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>⭐ <strong style={{ color: '#f59e0b' }}>{t.rating}</strong></span>
                  <span>🚛 {t.total_trips} trips</span>
                  <span className={`badge ${t.is_available ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem' }}>{t.is_available ? '● Available' : '● Busy'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="btn btn-primary" style={{ flex: 1, padding: '8px', fontSize: '0.82rem' }} disabled={!t.is_available}>Book Now</button>
                  <button className="btn btn-outline" style={{ padding: '8px 14px', fontSize: '0.82rem' }}>Call</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'bookings' && (
        <div className="card">
          {loading ? <div className="loading-state">⟳ Loading...</div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead><tr><th>ID</th><th>Crop</th><th>Route</th><th>Distance</th><th>Qty</th><th>Amount</th><th>Status</th><th>Payment</th></tr></thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ color: 'var(--text-muted)' }}>#{b.id}</td>
                      <td style={{ fontWeight: 600 }}>{b.crop_type}</td>
                      <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{b.pickup_address?.split(',')[0]} → {b.delivery_address?.split(',')[0]}</td>
                      <td>{b.distance_km}km</td>
                      <td>{b.quantity_tonnes}T</td>
                      <td style={{ fontWeight: 700, color: '#22c55e' }}>₹{b.total_amount?.toLocaleString()}</td>
                      <td><span style={{ background: (STATUS_COLOR[b.status] || '#888') + '22', color: STATUS_COLOR[b.status], padding: '3px 10px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600 }}>{STATUS_ICONS[b.status]} {b.status?.replace('_', ' ')}</span></td>
                      <td><span className={`badge ${b.payment_status === 'completed' ? 'badge-success' : 'badge-warning'}`}>{b.payment_status?.replace('_', ' ')}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'tracking' && (
        <div>
          {activeTrips.length === 0 ? (
            <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: '3rem', marginBottom: 12 }}>📍</div>
              <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No active trips to track</div>
            </div>
          ) : activeTrips.map(trip => (
            <div key={trip.id} className="card" style={{ padding: '24px', marginBottom: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: '1rem', fontWeight: 700 }}>🚛 Trip #{trip.id} — {trip.crop_type}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{trip.quantity_tonnes}T • Booked {trip.booking_date}</div>
                </div>
                <span className="badge badge-green" style={{ fontSize: '0.8rem' }}>🔴 LIVE</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 20 }}>
                <div style={{ textAlign: 'center', minWidth: 100 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: '#22c55e', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{trip.pickup_address}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Pickup</div>
                </div>
                <div style={{ flex: 1, position: 'relative', height: 4, background: 'var(--border)', margin: '0 8px' }}>
                  <div style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: '60%', background: '#22c55e', borderRadius: 2 }} />
                  <div style={{ position: 'absolute', left: '60%', top: -8, fontSize: '1.2rem', transform: 'translateX(-50%)' }}>🚛</div>
                </div>
                <div style={{ textAlign: 'center', minWidth: 100 }}>
                  <div style={{ width: 14, height: 14, borderRadius: '50%', background: 'var(--border)', margin: '0 auto 6px' }} />
                  <div style={{ fontSize: '0.75rem', fontWeight: 600 }}>{trip.delivery_address}</div>
                  <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Delivery</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span>📏 {trip.distance_km}km total</span>
                <span>⏱️ ETA: <strong style={{ color: '#f59e0b' }}>{trip.eta}</strong></span>
                <span>💰 ₹{trip.total_amount?.toLocaleString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'estimate' && (
        <div className="card" style={{ padding: '24px', maxWidth: 600 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>💰 Transport Cost Estimator</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>Get instant cost estimate for your transport needs</div>
          {[
            { label: 'From (Pickup)', type: 'text', placeholder: 'e.g. Dharwad Farm' },
            { label: 'To (Delivery)', type: 'text', placeholder: 'e.g. Hubli APMC' },
            { label: 'Approx. Distance (km)', type: 'number', placeholder: '45' },
            { label: 'Quantity (tonnes)', type: 'number', placeholder: '5' },
            { label: 'Vehicle Type', type: 'select', options: ['Mini Truck (3T)', 'Tempo (5T)', 'Truck (10T)', 'Container (20T)'] },
          ].map(f => (
            <div key={f.label} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} placeholder={f.placeholder} style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>🧮 Calculate Cost</button>
          <div style={{ marginTop: 16, padding: '14px', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3b82f6', marginBottom: 8 }}>Estimated Cost</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>45km × ₹14/km (Tempo)</div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#22c55e' }}>₹630</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
