import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_CROPS = [
  { _id: '1', farmer_id: 1, crop_type: 'Paddy', variety: 'BPT-5204', current_stage: 'vegetative', sowing_date: '2024-07-15', area_used_acres: 2.5, health_score: 85, season: 'Kharif', days_since_sow: 95, expected_harvest: '2024-12-10' },
  { _id: '2', farmer_id: 2, crop_type: 'Sugarcane', variety: 'Co-86032', current_stage: 'flowering', sowing_date: '2024-02-10', area_used_acres: 3.0, health_score: 92, season: 'Year-round', days_since_sow: 250, expected_harvest: '2025-02-10' },
  { _id: '3', farmer_id: 3, crop_type: 'Cotton', variety: 'NHH-44', current_stage: 'fruiting', sowing_date: '2024-06-20', area_used_acres: 1.5, health_score: 67, season: 'Kharif', days_since_sow: 120, expected_harvest: '2024-12-20' },
  { _id: '4', farmer_id: 4, crop_type: 'Wheat', variety: 'HD-2967', current_stage: 'maturation', sowing_date: '2024-11-05', area_used_acres: 4.0, health_score: 90, season: 'Rabi', days_since_sow: 60, expected_harvest: '2025-03-15' },
  { _id: '5', farmer_id: 5, crop_type: 'Maize', variety: 'Pioneer 30V92', current_stage: 'germination', sowing_date: '2024-06-25', area_used_acres: 2.0, health_score: 78, season: 'Kharif', days_since_sow: 15, expected_harvest: '2024-11-25' },
  { _id: '6', farmer_id: 1, crop_type: 'Groundnut', variety: 'TMV-2', current_stage: 'harvested', sowing_date: '2024-03-15', area_used_acres: 1.0, health_score: 95, season: 'Rabi', days_since_sow: 180, expected_harvest: '2024-08-15' },
  { _id: '7', farmer_id: 6, crop_type: 'Tomato', variety: 'Arka Rakshak', current_stage: 'fruiting', sowing_date: '2024-09-10', area_used_acres: 0.5, health_score: 73, season: 'Year-round', days_since_sow: 45, expected_harvest: '2024-12-10' },
];

const STAGE_COLORS = { sowing: '#f59e0b', germination: '#84cc16', vegetative: '#22c55e', flowering: '#f97316', fruiting: '#ef4444', maturation: '#8b5cf6', harvested: '#6b7280' };
const STAGE_ORDER = ['sowing', 'germination', 'vegetative', 'flowering', 'fruiting', 'maturation', 'harvested'];
const STAGE_ICONS = { sowing: '🌱', germination: '🌿', vegetative: '🌾', flowering: '🌸', fruiting: '🍅', maturation: '📦', harvested: '✅' };

// Crop Calendar tasks per stage (BharatAgri inspired)
const STAGE_TASKS = {
  sowing: ['Prepare field with rotavator', 'Apply basal fertilizer (DAP + MOP)', 'Treat seeds with fungicide', 'Sow seeds at proper spacing'],
  germination: ['Ensure adequate moisture', 'Monitor for seedling diseases', 'Gap filling if needed'],
  vegetative: ['Apply first split of Urea (25kg/acre)', 'Intercultivation for weed control', 'Monitor for pests (aphids, jassids)', 'Irrigate every 5-7 days'],
  flowering: ['Apply second split of Urea', 'Spray micronutrients (Boron, Zinc)', 'Monitor for bollworm in cotton', 'Reduce irrigation frequency'],
  fruiting: ['Apply potash for fruit development', 'Install pheromone traps', 'Monitor fruit quality', 'Plan harvest logistics'],
  maturation: ['Stop irrigation 15 days before harvest', 'Check grain moisture (14-16%)', 'Arrange harvester/labour', 'Check market prices for best rate'],
  harvested: ['Dry produce to safe moisture level', 'Grade and sort by quality', 'Transport to nearest APMC', 'Record sale and profit'],
};

export default function CropsPage() {
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stageFilter, setStageFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('tracking');
  const [selectedCrop, setSelectedCrop] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('agri_admin_token');
    axios.get('/api/v1/crops?all=true&limit=100', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setCrops(r.data.crops || r.data.data || MOCK_CROPS))
      .catch(() => setCrops(MOCK_CROPS))
      .finally(() => setLoading(false));
  }, []);

  const stages = ['all', ...STAGE_ORDER];
  const filtered = stageFilter === 'all' ? crops : crops.filter(c => c.current_stage === stageFilter);
  const stageCounts = STAGE_ORDER.reduce((acc, s) => { acc[s] = crops.filter(c => c.current_stage === s).length; return acc; }, {});

  const tabs = [
    { id: 'tracking', icon: '🌱', label: 'Crop Tracking' },
    { id: 'calendar', icon: '📅', label: 'Crop Calendar' },
    { id: 'timeline', icon: '📊', label: 'Growth Timeline' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🌱 Crop Lifecycle Management</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Track, manage, and optimize your crop journey from sowing to market</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Record Crop</button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{
              padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600,
              background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)',
              color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s',
            }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {activeTab === 'tracking' && (
        <>
          {/* Stage Distribution */}
          <div className="card" style={{ marginBottom: 20, padding: '20px 24px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Stage Distribution</div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              {STAGE_ORDER.map(s => (
                <div key={s} style={{ textAlign: 'center', minWidth: 70, cursor: 'pointer' }} onClick={() => setStageFilter(s)}>
                  <div style={{
                    width: 48, height: 48, borderRadius: '50%', background: STAGE_COLORS[s] + '22',
                    border: `2px solid ${stageFilter === s ? STAGE_COLORS[s] : 'transparent'}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 6px', fontSize: '1.1rem', fontWeight: 700, color: STAGE_COLORS[s],
                  }}>{stageCounts[s] || 0}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Filter + Table */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
            {stages.map(s => (
              <button key={s} onClick={() => setStageFilter(s)} className={`filter-btn${stageFilter === s ? ' active' : ''}`}
                style={{ textTransform: 'capitalize' }}>{s === 'all' ? 'All' : s}</button>
            ))}
          </div>

          <div className="card">
            {loading ? <div className="loading-state">⟳ Loading crops...</div> : (
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr><th>Farmer ID</th><th>Crop</th><th>Variety</th><th>Stage</th><th>Sown On</th><th>Area (Acres)</th><th>Health</th><th>Season</th><th>Actions</th></tr>
                  </thead>
                  <tbody>
                    {filtered.map(c => (
                      <tr key={c._id}>
                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{c.farmer_id}</td>
                        <td style={{ fontWeight: 600 }}>{c.crop_type}</td>
                        <td style={{ color: 'var(--text-muted)' }}>{c.variety || '—'}</td>
                        <td>
                          <span style={{
                            background: (STAGE_COLORS[c.current_stage] || '#888') + '22',
                            color: STAGE_COLORS[c.current_stage] || '#888',
                            padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize',
                          }}>{STAGE_ICONS[c.current_stage]} {c.current_stage}</span>
                        </td>
                        <td>{c.sowing_date ? new Date(c.sowing_date).toLocaleDateString('en-IN') : '—'}</td>
                        <td style={{ textAlign: 'center' }}>{c.area_used_acres}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 3, background: 'var(--bg-primary)', overflow: 'hidden', maxWidth: 80 }}>
                              <div style={{ height: '100%', borderRadius: 3, background: c.health_score >= 75 ? '#22c55e' : c.health_score >= 50 ? '#f59e0b' : '#ef4444', width: `${c.health_score}%` }} />
                            </div>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{c.health_score}%</span>
                          </div>
                        </td>
                        <td><span className="badge badge-info">{c.season}</span></td>
                        <td><button className="btn btn-outline" style={{ padding: '4px 10px', fontSize: '0.72rem' }} onClick={() => { setSelectedCrop(c); setActiveTab('calendar'); }}>📅 Calendar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'calendar' && (
        <div>
          <div className="card" style={{ marginBottom: 20, padding: '24px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>📅 Personalized Crop Calendar</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              {selectedCrop ? `${selectedCrop.crop_type} (${selectedCrop.variety}) — ${selectedCrop.season}` : 'Select a crop from the tracking table'}
            </div>

            {/* Stage Timeline */}
            <div style={{ display: 'flex', gap: 0, marginBottom: 24 }}>
              {STAGE_ORDER.map((s, i) => {
                const isCurrent = selectedCrop?.current_stage === s;
                const isPast = selectedCrop && STAGE_ORDER.indexOf(selectedCrop.current_stage) > i;
                return (
                  <div key={s} style={{ flex: 1, position: 'relative' }}>
                    {i > 0 && <div style={{ position: 'absolute', top: 16, left: -50 + '%', width: '100%', height: 3, background: isPast || isCurrent ? '#22c55e' : 'var(--border)', zIndex: 0 }} />}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{
                        width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1rem', zIndex: 1, background: isPast ? '#22c55e' : isCurrent ? '#3b82f6' : 'var(--bg-primary)',
                        border: `2px solid ${isPast ? '#22c55e' : isCurrent ? '#3b82f6' : 'var(--border)'}`,
                        color: isPast || isCurrent ? '#fff' : 'var(--text-muted)',
                        boxShadow: isCurrent ? '0 0 0 4px rgba(59,130,246,0.2)' : 'none',
                      }}>{isPast ? '✓' : STAGE_ICONS[s]}</div>
                      <div style={{ fontSize: '0.68rem', fontWeight: 600, marginTop: 6, textTransform: 'capitalize', color: isCurrent ? '#3b82f6' : isPast ? '#22c55e' : 'var(--text-muted)' }}>{s}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Stage Tasks */}
            {selectedCrop && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={{ padding: '16px', background: 'rgba(59,130,246,0.06)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(59,130,246,0.15)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#3b82f6', marginBottom: 12 }}>📋 Current Tasks — {selectedCrop.current_stage}</div>
                  {(STAGE_TASKS[selectedCrop.current_stage] || []).map((task, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start', marginBottom: 8 }}>
                      <input type="checkbox" style={{ marginTop: 3 }} />
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{task}</span>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>📊 Crop Stats</div>
                  {[
                    { label: 'Days since sowing', value: selectedCrop.days_since_sow || '—' },
                    { label: 'Health Score', value: `${selectedCrop.health_score}%` },
                    { label: 'Area', value: `${selectedCrop.area_used_acres} acres` },
                    { label: 'Expected Harvest', value: selectedCrop.expected_harvest || '—' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{s.label}</span>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{s.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {!selectedCrop && (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>📅</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>Select a crop to view its personalized calendar</div>
                <div style={{ fontSize: '0.8rem', marginTop: 4 }}>Go to Crop Tracking tab and click "Calendar" on any crop row</div>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'timeline' && (
        <div className="card" style={{ padding: '24px' }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>📊 All Crops — Growth Timeline</div>
          {crops.map(c => {
            const stageIdx = STAGE_ORDER.indexOf(c.current_stage);
            const progress = ((stageIdx + 1) / STAGE_ORDER.length) * 100;
            return (
              <div key={c._id} style={{ marginBottom: 16, padding: '14px 16px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>{c.crop_type}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginLeft: 8 }}>{c.variety} • {c.area_used_acres} acres</span>
                  </div>
                  <span style={{ background: (STAGE_COLORS[c.current_stage] || '#888') + '22', color: STAGE_COLORS[c.current_stage], padding: '2px 10px', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600, textTransform: 'capitalize' }}>
                    {STAGE_ICONS[c.current_stage]} {c.current_stage}
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--bg-card)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: '100%', borderRadius: 4, background: `linear-gradient(90deg, #22c55e, ${STAGE_COLORS[c.current_stage]})`, width: `${progress}%`, transition: 'width 0.8s' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4, fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  <span>Sown: {new Date(c.sowing_date).toLocaleDateString('en-IN')}</span>
                  <span>Health: {c.health_score}%</span>
                  <span>{Math.round(progress)}% complete</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
