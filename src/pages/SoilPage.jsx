import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_SOIL = [
  { id: 1, field_id: 1, farmer_id: 1, soil_type: 'Black Cotton', nitrogen_level: 42, phosphorus_level: 18, potassium_level: 240, ph_level: 7.2, organic_carbon: 0.72, test_date: '2024-09-10', lab_name: 'Mysuru Soil Lab', field_name: 'Field A1' },
  { id: 2, field_id: 3, farmer_id: 2, soil_type: 'Alluvial', nitrogen_level: 58, phosphorus_level: 28, potassium_level: 310, ph_level: 6.8, organic_carbon: 1.1, test_date: '2024-08-25', lab_name: 'KSDA Lab', field_name: 'Field B2' },
  { id: 3, field_id: 4, farmer_id: 3, soil_type: 'Sandy Loam', nitrogen_level: 30, phosphorus_level: 12, potassium_level: 185, ph_level: 5.9, organic_carbon: 0.45, test_date: '2024-10-01', lab_name: 'KVK Dharwad', field_name: 'Field C1' },
];

const NDVI_DATA = [
  { date: 'Oct 1', value: 0.72, health: 'Good' },
  { date: 'Oct 8', value: 0.68, health: 'Good' },
  { date: 'Oct 15', value: 0.75, health: 'Good' },
  { date: 'Oct 22', value: 0.61, health: 'Moderate' },
  { date: 'Oct 29', value: 0.55, health: 'Stress' },
  { date: 'Nov 5', value: 0.63, health: 'Moderate' },
  { date: 'Nov 12', value: 0.70, health: 'Good' },
];

const SOIL_TESTING_STEPS = [
  { step: 1, icon: '📱', title: 'Request Test', desc: 'Submit soil sample request via app or nearest DeHaat centre', status: 'complete' },
  { step: 2, icon: '🧪', title: 'Lab Analysis', desc: 'Professional lab tests NPK, pH, organic carbon, micronutrients', status: 'complete' },
  { step: 3, icon: '📋', title: 'Digital Health Card', desc: 'Get your personalized digital soil health card with recommendations', status: 'active' },
];

export default function SoilPage() {
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('health-card');
  const [selectedTest, setSelectedTest] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('agri_admin_token');
    axios.get('/api/v1/soil/tests?all=true', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setTests(r.data.tests || r.data.data || MOCK_SOIL))
      .catch(() => setTests(MOCK_SOIL))
      .finally(() => setLoading(false));
  }, []);

  const selected = tests[selectedTest] || tests[0];

  const getNutrientStatus = (nutrient, value) => {
    const thresholds = { nitrogen_level: [40, 60], phosphorus_level: [15, 25], potassium_level: [200, 300] };
    const t = thresholds[nutrient];
    if (!t) return { label: 'Normal', color: '#22c55e' };
    if (value < t[0]) return { label: 'Low', color: '#ef4444' };
    if (value > t[1]) return { label: 'High', color: '#3b82f6' };
    return { label: 'Optimal', color: '#22c55e' };
  };

  const NutrientGauge = ({ label, value, max, unit, nutrient }) => {
    const status = getNutrientStatus(nutrient, value);
    const pct = Math.min(100, (value / max) * 100);
    return (
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
          <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: status.color }}>{value} {unit}</span>
            <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 12, background: status.color + '18', color: status.color, fontWeight: 600 }}>{status.label}</span>
          </div>
        </div>
        <div style={{ height: 10, background: 'var(--bg-primary)', borderRadius: 5, overflow: 'hidden' }}>
          <div style={{ height: '100%', background: `linear-gradient(90deg, ${status.color}, ${status.color}aa)`, borderRadius: 5, width: `${pct}%`, transition: 'width 0.8s ease' }} />
        </div>
      </div>
    );
  };

  const tabs = [
    { id: 'health-card', icon: '📋', label: 'Soil Health Card' },
    { id: 'satellite', icon: '🛰️', label: 'Satellite NDVI' },
    { id: 'tests', icon: '🧪', label: 'All Tests' },
    { id: 'recommendations', icon: '💡', label: 'Recommendations' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🧪 Soil & Water Management</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Digital Soil Health Cards • Satellite NDVI Monitoring • Smart Recommendations</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Request Soil Test</button>
      </div>

      {/* Soil Testing Steps — DeHaat Inspired */}
      <div className="card" style={{ marginBottom: 20, padding: '20px 24px' }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 16 }}>📋 Soil Testing Journey</div>
        <div style={{ display: 'flex', gap: 0 }}>
          {SOIL_TESTING_STEPS.map((s, i) => (
            <div key={s.step} style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem',
                  background: s.status === 'complete' ? '#22c55e' : s.status === 'active' ? '#3b82f6' : 'var(--bg-primary)',
                  border: `3px solid ${s.status === 'complete' ? '#22c55e' : s.status === 'active' ? '#3b82f6' : 'var(--border)'}`,
                  color: s.status !== 'upcoming' ? '#fff' : 'var(--text-muted)',
                  boxShadow: s.status === 'active' ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                }}>{s.status === 'complete' ? '✓' : s.icon}</div>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, marginTop: 8, color: s.status === 'active' ? '#3b82f6' : 'var(--text-primary)' }}>{s.title}</div>
                <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: 2, maxWidth: 180 }}>{s.desc}</div>
              </div>
              {i < SOIL_TESTING_STEPS.length - 1 && (
                <div style={{ width: 60, height: 3, background: s.status === 'complete' ? '#22c55e' : 'var(--border)', flexShrink: 0 }} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600,
              background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)',
              transition: 'all 0.2s',
            }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === 'health-card' && selected && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Digital Soil Health Card</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{selected.field_name || `Field #${selected.field_id}`} • {selected.soil_type} • Tested {selected.test_date}</div>
              </div>
              <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '0.75rem' }}>🖨️ Print</button>
            </div>
            <NutrientGauge label="Nitrogen (N)" value={selected.nitrogen_level} max={100} unit="kg/ha" nutrient="nitrogen_level" />
            <NutrientGauge label="Phosphorus (P)" value={selected.phosphorus_level} max={60} unit="kg/ha" nutrient="phosphorus_level" />
            <NutrientGauge label="Potassium (K)" value={selected.potassium_level} max={400} unit="kg/ha" nutrient="potassium_level" />
            <NutrientGauge label="Organic Carbon" value={selected.organic_carbon} max={3} unit="%" nutrient="organic_carbon" />
            
            <div style={{ marginTop: 16, padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', display: 'flex', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Soil pH</div>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: selected.ph_level >= 6 && selected.ph_level <= 7.5 ? '#22c55e' : '#f59e0b' }}>{selected.ph_level}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {selected.ph_level < 6 ? '⚠️ Acidic — Add lime' : selected.ph_level > 7.5 ? '⚠️ Alkaline — Add sulfur' : '✅ Optimal range'}
                </div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>Soil Type</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{selected.soil_type}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Lab: {selected.lab_name}</div>
              </div>
            </div>
          </div>

          <div>
            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, marginBottom: 12 }}>Select Field</div>
              {tests.map((t, i) => (
                <div key={t.id} onClick={() => setSelectedTest(i)}
                  style={{ padding: '10px 12px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', marginBottom: 6, background: i === selectedTest ? 'rgba(59,130,246,0.1)' : 'var(--bg-primary)', border: `1px solid ${i === selectedTest ? '#3b82f6' : 'transparent'}` }}>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{t.field_name || `Field #${t.field_id}`}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{t.soil_type} • pH {t.ph_level}</div>
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: '16px', background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#22c55e', marginBottom: 8 }}>🌱 AI Recommendation</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
                Based on your soil profile, plant <strong>Cotton or Soybean</strong> this Kharif season. Apply 50kg Urea + 25kg DAP per acre before sowing.
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'satellite' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 700 }}>🛰️ Satellite NDVI Crop Health</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Farmonaut-style vegetation index monitoring</div>
            </div>
            <span className="badge badge-green">Updated 2 hours ago</span>
          </div>
          
          {/* NDVI Color Legend */}
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, padding: '12px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
            {[
              { color: '#d32f2f', label: 'Barren (0-0.2)' }, { color: '#ff9800', label: 'Stress (0.2-0.4)' },
              { color: '#fdd835', label: 'Moderate (0.4-0.6)' }, { color: '#66bb6a', label: 'Good (0.6-0.8)' },
              { color: '#1b5e20', label: 'Dense (0.8-1.0)' },
            ].map(l => (
              <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <div style={{ width: 16, height: 16, borderRadius: 3, background: l.color }} />
                {l.label}
              </div>
            ))}
          </div>

          {/* Mock Satellite View */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 20 }}>
            <div style={{
              height: 320, borderRadius: 'var(--radius)', position: 'relative', overflow: 'hidden',
              background: 'linear-gradient(135deg, #1b5e20 0%, #66bb6a 25%, #fdd835 45%, #66bb6a 60%, #1b5e20 75%, #ff9800 90%)',
            }}>
              <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ background: 'rgba(0,0,0,0.7)', borderRadius: 12, padding: '16px 24px', textAlign: 'center' }}>
                  <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>🛰️</div>
                  <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.9rem' }}>Satellite View — Field A1</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>NDVI Health Index: 0.72 (Good)</div>
                  <div style={{ color: '#94a3b8', fontSize: '0.7rem', marginTop: 4 }}>15.36°N, 75.12°E • Dharwad</div>
                </div>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: 12 }}>📊 NDVI Timeline</div>
              {NDVI_DATA.map((d, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', width: 50 }}>{d.date}</span>
                  <div style={{ flex: 1, height: 8, background: 'var(--bg-primary)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', borderRadius: 4, width: `${d.value * 100}%`,
                      background: d.value > 0.6 ? '#22c55e' : d.value > 0.4 ? '#f59e0b' : '#ef4444', transition: 'width 0.5s' }} />
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, width: 35, color: d.value > 0.6 ? '#22c55e' : '#f59e0b' }}>{d.value}</span>
                </div>
              ))}
              <div className="card" style={{ marginTop: 16, padding: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)' }}>
                <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#f59e0b' }}>⚠️ Stress detected Oct 22-29</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 4 }}>NDVI dropped to 0.55. Likely cause: water stress or pest infestation. Recommend field inspection.</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'tests' && (
        <div className="card">
          {loading ? <div className="loading-state">⟳ Loading soil tests...</div> : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr><th>Field</th><th>Farmer</th><th>Soil Type</th><th>N</th><th>P</th><th>K</th><th>pH</th><th>Organic C%</th><th>Test Date</th><th>Lab</th></tr>
                </thead>
                <tbody>
                  {tests.map(t => (
                    <tr key={t.id}>
                      <td>{t.field_name || `#${t.field_id}`}</td>
                      <td>#{t.farmer_id}</td>
                      <td style={{ fontWeight: 600 }}>{t.soil_type}</td>
                      <td style={{ color: t.nitrogen_level < 40 ? '#ef4444' : '#22c55e' }}>{t.nitrogen_level}</td>
                      <td style={{ color: t.phosphorus_level < 15 ? '#ef4444' : '#22c55e' }}>{t.phosphorus_level}</td>
                      <td style={{ color: t.potassium_level < 200 ? '#ef4444' : '#22c55e' }}>{t.potassium_level}</td>
                      <td style={{ color: t.ph_level < 6 || t.ph_level > 8 ? '#f59e0b' : '#22c55e' }}>{t.ph_level}</td>
                      <td>{t.organic_carbon}%</td>
                      <td>{t.test_date}</td>
                      <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{t.lab_name}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'recommendations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
          {[
            { icon: '🌾', title: 'Best Crops for Your Soil', desc: 'Cotton, Soybean, Groundnut — suited for Black Cotton soil with pH 7.2', action: 'View Crop Calendar', color: '#22c55e' },
            { icon: '💊', title: 'Fertilizer Plan', desc: 'Apply 50kg Urea + 25kg DAP + 20kg MOP per acre. Split urea in 3 doses.', action: 'Download Plan', color: '#3b82f6' },
            { icon: '💧', title: 'Irrigation Advisory', desc: 'Your soil has medium water retention. Use drip irrigation with 45-min intervals.', action: 'Set Reminder', color: '#00897b' },
            { icon: '🔬', title: 'Micronutrient Deficiency', desc: 'Zinc and Boron levels may be low. Apply ZnSO4 @ 25kg/ha as basal dose.', action: 'Buy Inputs', color: '#f59e0b' },
          ].map((r, i) => (
            <div key={i} className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: r.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>{r.icon}</div>
                <div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: 'var(--text-primary)' }}>{r.title}</div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.6 }}>{r.desc}</div>
                </div>
              </div>
              <button className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}>{r.action}</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
