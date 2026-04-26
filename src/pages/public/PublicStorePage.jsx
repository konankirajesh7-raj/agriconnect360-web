import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { premiumDB } from '../../lib/supabase';

const DISTRICTS = ['Guntur', 'Krishna', 'Kurnool', 'Nellore', 'Visakhapatnam', 'Anantapur', 'Kadapa', 'Eluru'];

const FALLBACK_LISTINGS = [
  { id: 'public-1', produce_name: 'Grade A Tomato', district: 'Guntur', farmer_name: 'Ramesh Rao', price_per_kg: 28, grade: 'A', available_qty_kg: 600, season: 'Kharif', bulk_discount_pct: 8, delivery_tracking_id: 'TRK-98211' },
  { id: 'public-2', produce_name: 'Cotton (Long Staple)', district: 'Krishna', farmer_name: 'Lakshmi Devi', price_per_kg: 74, grade: 'A', available_qty_kg: 900, season: 'Kharif', bulk_discount_pct: 5, delivery_tracking_id: 'TRK-98212' },
  { id: 'public-3', produce_name: 'Groundnut', district: 'Kurnool', farmer_name: 'Satish Yadav', price_per_kg: 62, grade: 'B', available_qty_kg: 420, season: 'Rabi', bulk_discount_pct: 12, delivery_tracking_id: 'TRK-98213' },
  { id: 'public-4', produce_name: 'Onion', district: 'Nellore', farmer_name: 'Anita Kumari', price_per_kg: 24, grade: 'C', available_qty_kg: 1200, season: 'Rabi', bulk_discount_pct: 15, delivery_tracking_id: 'TRK-98214' },
];

export default function PublicStorePage() {
  const navigate = useNavigate();
  const [listings, setListings] = useState(FALLBACK_LISTINGS);
  const [district, setDistrict] = useState('Guntur');
  const [search, setSearch] = useState('');

  useEffect(() => {
    premiumDB.store.getListings().then(({ data, error }) => {
      if (!error && Array.isArray(data) && data.length) {
        setListings(data.map((item) => (item?.id ? item : { ...item, id: item?._id || `listing-${Math.random().toString(36).slice(2)}` })));
      }
    });
  }, []);

  const filteredListings = useMemo(() => {
    const q = search.trim().toLowerCase();
    const next = listings.filter((l) => {
      if (!q) return true;
      return (
        String(l.produce_name || '').toLowerCase().includes(q) ||
        String(l.farmer_name || '').toLowerCase().includes(q) ||
        String(l.district || '').toLowerCase().includes(q)
      );
    });
    next.sort((a, b) => {
      const aNear = a.district === district ? 1 : 0;
      const bNear = b.district === district ? 1 : 0;
      if (aNear !== bNear) return bNear - aNear;
      return Number(a.price_per_kg || 0) - Number(b.price_per_kg || 0);
    });
    return next;
  }, [listings, district, search]);

  const seasonalCalendar = [
    { season: 'Kharif', produce: 'Paddy, Cotton, Maize, Tomato', months: 'Jun - Oct' },
    { season: 'Rabi', produce: 'Wheat, Groundnut, Onion, Chilli', months: 'Nov - Mar' },
    { season: 'Zaid', produce: 'Vegetables, Watermelon, Short-cycle fodder', months: 'Apr - Jun' },
  ];

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
      <div className="card" style={{ padding: '18px 20px', marginBottom: 14 }}>
        <div style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: 4 }}>🛒 Farm-to-Consumer Direct Store</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>
          No login required. Order directly from farmers via WhatsApp and bypass middlemen.
        </div>
      </div>

      <div className="card" style={{ padding: '14px 16px', marginBottom: 14 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10 }}>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search produce, farmer, district..."
            style={{ padding: '9px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          />
          <select
            value={district}
            onChange={(e) => setDistrict(e.target.value)}
            style={{ padding: '9px 10px', borderRadius: 6, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)' }}
          >
            {DISTRICTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <button
            className="btn btn-outline"
            style={{ padding: '9px 12px', fontSize: '0.8rem' }}
            onClick={() => navigate('/premium?tab=store')}
          >
            🌾 Farmer listing console
          </button>
          <button
            className="btn btn-primary"
            style={{ padding: '9px 12px', fontSize: '0.8rem' }}
            onClick={() => window.open('https://wa.me/919876543210?text=Hi%20AgriConnect%20360%2C%20I%20want%20to%20place%20a%20bulk%20institutional%20order.', '_blank')}
          >
            🏢 Institutional bulk order
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Nearby-first listings ({district})</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
            {filteredListings.map((item) => (
              <div key={item.id || item._id} style={{ border: '1px solid var(--border)', borderRadius: 8, padding: 10, background: 'var(--bg-primary)' }}>
                <div style={{ fontWeight: 700, fontSize: '0.86rem' }}>{item.produce_name}</div>
                <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>{item.farmer_name} • {item.district}</div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
                  <span className="badge badge-info">Grade {item.grade || 'B'}</span>
                  <span className="badge badge-green">{item.season || 'Seasonal'}</span>
                </div>
                <div style={{ marginTop: 6, fontSize: '0.8rem' }}>₹{Number(item.price_per_kg || 0)}/kg • {Number(item.available_qty_kg || 0)} kg</div>
                <div style={{ fontSize: '0.72rem', color: '#34d399' }}>
                  Bulk discount: {Number(item.bulk_discount_pct || 0)}% for institutions
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '6px 9px', fontSize: '0.72rem' }}
                    onClick={() => window.open(`https://wa.me/919876543210?text=${encodeURIComponent(`ORDER ${item.produce_name} from ${item.farmer_name} in ${item.district}`)}`, '_blank')}
                  >
                    WhatsApp order
                  </button>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '6px 9px', fontSize: '0.72rem' }}
                    onClick={() => navigate(`/transport?tracking=${encodeURIComponent(item.delivery_tracking_id || '')}`)}
                  >
                    Track delivery
                  </button>
                </div>
              </div>
            ))}
          </div>
          {filteredListings.length === 0 && (
            <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No listings match your filters.</div>
          )}
        </div>

        <div className="card" style={{ padding: '14px 16px' }}>
          <div style={{ fontWeight: 700, marginBottom: 8 }}>📅 Seasonal Produce Calendar</div>
          {seasonalCalendar.map((row) => (
            <div key={row.season} style={{ borderBottom: '1px solid var(--border)', padding: '8px 0' }}>
              <div style={{ fontWeight: 700, fontSize: '0.82rem' }}>{row.season}</div>
              <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>{row.produce}</div>
              <div style={{ fontSize: '0.72rem', color: '#93c5fd' }}>{row.months}</div>
            </div>
          ))}
          <div style={{ marginTop: 12, fontSize: '0.74rem', color: 'var(--text-muted)' }}>
            Quality grading guide: <b>A</b> (export/high retail), <b>B</b> (standard), <b>C</b> (processing grade).
          </div>
        </div>
      </div>
    </div>
  );
}
