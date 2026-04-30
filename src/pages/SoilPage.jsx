import React, { useState, useRef } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

const IRRIGATION_SCHEDULE = [
  { id: 1, field: 'Field A1', crop: 'Cotton', method: 'Drip', frequency: 'Every 2 days', duration: '45 min', nextRun: '2024-11-14 06:00', status: 'scheduled' },
  { id: 2, field: 'Field B2', crop: 'Paddy', method: 'Flood', frequency: 'Weekly', duration: '3 hours', nextRun: '2024-11-15 05:30', status: 'scheduled' },
  { id: 3, field: 'Field C1', crop: 'Soybean', method: 'Sprinkler', frequency: 'Every 3 days', duration: '30 min', nextRun: '2024-11-13 07:00', status: 'overdue' },
  { id: 4, field: 'Field D1', crop: 'Sugarcane', method: 'Furrow', frequency: 'Every 5 days', duration: '2 hours', nextRun: '2024-11-16 06:30', status: 'scheduled' },
];

const IRRIGATION_LOG = [
  { id: 1, field: 'Field A1', date: '2024-11-12', method: 'Drip', duration: '45 min', waterUsed: '2400 L', status: 'completed', notes: 'Normal cycle' },
  { id: 2, field: 'Field B2', date: '2024-11-10', method: 'Flood', duration: '3 hrs', waterUsed: '18000 L', status: 'completed', notes: 'Pre-harvest flooding' },
  { id: 3, field: 'Field C1', date: '2024-11-09', method: 'Sprinkler', duration: '30 min', waterUsed: '1800 L', status: 'partial', notes: 'Pump issue — stopped early' },
  { id: 4, field: 'Field A1', date: '2024-11-08', method: 'Drip', duration: '45 min', waterUsed: '2400 L', status: 'completed', notes: 'Normal cycle' },
  { id: 5, field: 'Field D1', date: '2024-11-07', method: 'Furrow', duration: '2 hrs', waterUsed: '12000 L', status: 'completed', notes: 'Sugarcane watering' },
  { id: 6, field: 'Field B2', date: '2024-11-03', method: 'Flood', duration: '2.5 hrs', waterUsed: '15000 L', status: 'completed', notes: 'Routine cycle' },
];

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

const HealthScoreGauge = ({ score }) => {
  const r = 80, cx = 100, cy = 100;
  const circum = Math.PI * r;
  const offset = circum - (score / 100) * circum;
  const color = score >= 75 ? '#22c55e' : score >= 50 ? '#f59e0b' : '#ef4444';
  const label = score >= 75 ? 'Excellent' : score >= 50 ? 'Moderate' : 'Poor';
  return (
    <div style={{ textAlign: 'center' }}>
      <svg width={200} height={120} viewBox="0 0 200 120">
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke="var(--border)" strokeWidth={14} strokeLinecap="round" />
        <path d={`M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`} fill="none" stroke={color} strokeWidth={14} strokeLinecap="round"
          strokeDasharray={circum} strokeDashoffset={circum - (score / 100) * circum}
          style={{ transition: 'stroke-dashoffset 1s ease' }} />
        <text x={cx} y={cy - 15} textAnchor="middle" fill={color} fontSize="28" fontWeight="800">{score}</text>
        <text x={cx} y={cy + 5} textAnchor="middle" fill="var(--text-muted)" fontSize="11">{label}</text>
      </svg>
    </div>
  );
};

export default function SoilPage() {
  const { data: tests, loading, isLive } = useSupabaseQuery('soil_tests', { orderBy: { column: 'test_date', ascending: false }, limit: 200 }, MOCK_SOIL);
  const [activeTab, setActiveTab] = useState('health-card');
  const [selectedTest, setSelectedTest] = useState(0);
  const [showTestForm, setShowTestForm] = useState(false);
  const [testForm, setTestForm] = useState({ fieldName: '', soilType: 'Black Cotton', nitrogen: '', phosphorus: '', potassium: '', ph: '', organicCarbon: '', labName: '' });
  const [uploadedReports, setUploadedReports] = useState([]);
  const [irrigSubTab, setIrrigSubTab] = useState('schedule');
  const [schedules, setSchedules] = useState(IRRIGATION_SCHEDULE);
  const [logs, setLogs] = useState(IRRIGATION_LOG);
  const [showAddSchedule, setShowAddSchedule] = useState(false);
  const [showAddLog, setShowAddLog] = useState(false);
  const [schedForm, setSchedForm] = useState({ field: 'Field A1', crop: 'Paddy', method: 'Drip', frequency: 'Every 3 days', duration: '2 hours' });
  const [logForm, setLogForm] = useState({ field: 'Field A1', date: new Date().toISOString().split('T')[0], duration: '1.5 hrs', volume: '500', method: 'Drip', notes: '' });
  const fileInputRef = useRef(null);

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

  const computeHealthScore = (t) => {
    if (!t) return 0;
    let s = 0;
    if (t.nitrogen_level >= 40 && t.nitrogen_level <= 60) s += 25; else if (t.nitrogen_level >= 30) s += 15; else s += 5;
    if (t.phosphorus_level >= 15 && t.phosphorus_level <= 25) s += 25; else if (t.phosphorus_level >= 10) s += 15; else s += 5;
    if (t.potassium_level >= 200 && t.potassium_level <= 300) s += 25; else if (t.potassium_level >= 150) s += 15; else s += 5;
    if (t.ph_level >= 6 && t.ph_level <= 7.5) s += 25; else if (t.ph_level >= 5.5) s += 15; else s += 5;
    return Math.min(100, s);
  };

  const handleTestSubmit = () => {
    if (!testForm.fieldName) return alert('Please enter field name');
    alert(`Soil test for "${testForm.fieldName}" submitted successfully!`);
    setShowTestForm(false);
    setTestForm({ fieldName: '', soilType: 'Black Cotton', nitrogen: '', phosphorus: '', potassium: '', ph: '', organicCarbon: '', labName: '' });
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadedReports(prev => [...prev, { name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', date: new Date().toLocaleDateString('en-IN'), status: 'Processing' }]);
    setTimeout(() => {
      setUploadedReports(prev => prev.map((r, i) => i === prev.length - 1 ? { ...r, status: 'Analyzed' } : r));
    }, 2000);
  };

  const tabs = [
    { id: 'health-card', icon: '📋', label: 'Soil Health Card' },
    { id: 'soil-form', icon: '📝', label: 'New Test' },
    { id: 'satellite', icon: '🛰️', label: 'Satellite NDVI' },
    { id: 'tests', icon: '🧪', label: 'All Tests' },
    { id: 'upload', icon: '📤', label: 'Upload Report' },
    { id: 'irrigation', icon: '💧', label: 'Irrigation' },
    { id: 'recommendations', icon: '💡', label: 'Recommendations' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🧪 Soil & Water Management</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Digital Soil Health Cards • Satellite NDVI Monitoring • Smart Recommendations</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }} onClick={() => setActiveTab('soil-form')}>+ Request Soil Test</button>
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
        <>
        <div className="card" style={{ padding: 20, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 24, background: 'linear-gradient(135deg, rgba(34,197,94,0.04), rgba(59,130,246,0.04))' }}>
          <HealthScoreGauge score={computeHealthScore(selected)} />
          <div>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--text-primary)' }}>Overall Soil Health Score</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 4 }}>{selected.field_name} • Based on NPK + pH analysis</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
              {[{ l: 'N', v: selected.nitrogen_level, c: selected.nitrogen_level >= 40 ? '#22c55e' : '#ef4444' }, { l: 'P', v: selected.phosphorus_level, c: selected.phosphorus_level >= 15 ? '#22c55e' : '#ef4444' }, { l: 'K', v: selected.potassium_level, c: selected.potassium_level >= 200 ? '#22c55e' : '#ef4444' }, { l: 'pH', v: selected.ph_level, c: selected.ph_level >= 6 && selected.ph_level <= 7.5 ? '#22c55e' : '#f59e0b' }].map(n => (
                <span key={n.l} style={{ padding: '4px 10px', borderRadius: 8, fontSize: '0.75rem', fontWeight: 600, background: n.c + '15', color: n.c }}>{n.l}: {n.v}</span>
              ))}
            </div>
          </div>
        </div>
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
      </>
      )}

      {activeTab === 'soil-form' && (
        <div className="card" style={{ padding: 24, maxWidth: 700 }}>
          <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>📝 Submit New Soil Test</div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>Enter lab results or request a new test</div>
          {[
            { label: 'Field Name *', key: 'fieldName', type: 'text', placeholder: 'e.g. Field A1' },
            { label: 'Soil Type', key: 'soilType', type: 'select', options: ['Black Cotton', 'Alluvial', 'Sandy Loam', 'Red Soil', 'Laterite', 'Clay'] },
            { label: 'Nitrogen (kg/ha)', key: 'nitrogen', type: 'number', placeholder: '42' },
            { label: 'Phosphorus (kg/ha)', key: 'phosphorus', type: 'number', placeholder: '18' },
            { label: 'Potassium (kg/ha)', key: 'potassium', type: 'number', placeholder: '240' },
            { label: 'pH Level', key: 'ph', type: 'number', placeholder: '7.2' },
            { label: 'Organic Carbon (%)', key: 'organicCarbon', type: 'number', placeholder: '0.72' },
            { label: 'Lab Name', key: 'labName', type: 'text', placeholder: 'e.g. KVK Dharwad' },
          ].map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 5 }}>{f.label}</label>
              {f.type === 'select' ? (
                <select value={testForm[f.key]} onChange={e => setTestForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem' }}>
                  {f.options.map(o => <option key={o}>{o}</option>)}
                </select>
              ) : (
                <input type={f.type} value={testForm[f.key]} placeholder={f.placeholder}
                  onChange={e => setTestForm(p => ({ ...p, [f.key]: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.88rem', boxSizing: 'border-box' }} />
              )}
            </div>
          ))}
          <button className="btn btn-primary" style={{ width: '100%', padding: 12, fontSize: '0.95rem', marginTop: 8 }} onClick={handleTestSubmit}>🧪 Submit Soil Test</button>
        </div>
      )}

      {activeTab === 'upload' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>📤 Upload Soil Report</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>Upload PDF/image of lab soil test report for AI analysis</div>
            <div onClick={() => fileInputRef.current?.click()}
              style={{ border: '2px dashed var(--border)', borderRadius: 'var(--radius)', padding: '40px 20px', textAlign: 'center', cursor: 'pointer', transition: 'border-color 0.2s', background: 'var(--bg-primary)' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📁</div>
              <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>Click to upload report</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>PDF, JPG, PNG — Max 10MB</div>
            </div>
            <input ref={fileInputRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleFileUpload} />
          </div>
          <div className="card" style={{ padding: 24 }}>
            <div style={{ fontSize: '0.88rem', fontWeight: 700, marginBottom: 16 }}>📋 Uploaded Reports</div>
            {uploadedReports.length === 0 ? (
              <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 8 }}>📂</div>
                <div style={{ fontSize: '0.82rem' }}>No reports uploaded yet</div>
              </div>
            ) : uploadedReports.map((r, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary)' }}>{r.name}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{r.size} • {r.date}</div>
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: r.status === 'Analyzed' ? '#22c55e22' : '#f59e0b22', color: r.status === 'Analyzed' ? '#22c55e' : '#f59e0b' }}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'irrigation' && (
        <div>
          {/* Water Usage Analytics */}
          <div className="grid-4" style={{ marginBottom: 20 }}>
            {[
              { label: 'Total Water Used', value: logs.reduce((a, l) => a + parseInt(l.waterUsed), 0).toLocaleString() + ' L', icon: '💧', color: '#3b82f6' },
              { label: 'Est. Cost', value: '₹' + (logs.reduce((a, l) => a + parseInt(l.waterUsed), 0) * 0.05).toFixed(0), icon: '💰', color: '#22c55e' },
              { label: 'Active Schedules', value: schedules.length, icon: '📅', color: '#f59e0b' },
              { label: 'Efficiency', value: schedules.filter(s => s.method === 'Drip').length > 0 ? 'High (Drip)' : 'Medium', icon: '📊', color: '#8b5cf6' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                <div className="stat-value" style={{ color: s.color, fontSize: '1.1rem' }}>{s.value}</div>
                <div className="stat-label">{s.label}</div>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 8, marginBottom: 16, justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 8 }}>
              {[{ id: 'schedule', label: '📅 Schedule' }, { id: 'log', label: '📜 Log' }].map(t => (
                <button key={t.id} onClick={() => setIrrigSubTab(t.id)}
                  style={{ padding: '8px 16px', borderRadius: 'var(--radius-sm)', border: 'none', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600, background: irrigSubTab === t.id ? '#3b82f6' : 'var(--bg-card)', color: irrigSubTab === t.id ? '#fff' : 'var(--text-muted)' }}>{t.label}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => { setShowAddSchedule(true); setShowAddLog(false); }}>+ Add Schedule</button>
              <button className="btn btn-outline" style={{ fontSize: '0.82rem', padding: '8px 14px' }} onClick={() => { setShowAddLog(true); setShowAddSchedule(false); }}>+ Log Irrigation</button>
            </div>
          </div>

          {/* Add Schedule Form */}
          {showAddSchedule && (
            <div className="card" style={{ padding: 20, marginBottom: 16, border: '1px solid #3b82f644' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>📅 Add Irrigation Schedule</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Field', key: 'field', type: 'select', options: ['Field A1', 'Field B2', 'Field C1', 'Field D1'] },
                  { label: 'Crop', key: 'crop', type: 'select', options: ['Paddy', 'Cotton', 'Soybean', 'Sugarcane', 'Maize', 'Vegetables'] },
                  { label: 'Method', key: 'method', type: 'select', options: ['Drip', 'Flood', 'Sprinkler', 'Furrow'] },
                  { label: 'Frequency', key: 'frequency', type: 'select', options: ['Daily', 'Every 2 days', 'Every 3 days', 'Every 5 days', 'Weekly'] },
                  { label: 'Duration', key: 'duration', type: 'select', options: ['30 min', '45 min', '1 hour', '1.5 hours', '2 hours', '3 hours'] },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</label>
                    <select value={schedForm[f.key]} onChange={e => setSchedForm(p => ({ ...p, [f.key]: e.target.value }))}
                      style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                      {f.options.map(o => <option key={o}>{o}</option>)}
                    </select>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => {
                  const nextDate = new Date(); nextDate.setDate(nextDate.getDate() + 1);
                  setSchedules(prev => [...prev, { id: Date.now(), ...schedForm, nextRun: nextDate.toISOString().slice(0, 16).replace('T', ' '), status: 'scheduled' }]);
                  setShowAddSchedule(false);
                  alert('Schedule saved! Next irrigation: ' + nextDate.toLocaleDateString('en-IN'));
                }}>✓ Save Schedule</button>
                <button className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => setShowAddSchedule(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Add Log Form */}
          {showAddLog && (
            <div className="card" style={{ padding: 20, marginBottom: 16, border: '1px solid #22c55e44' }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: 14 }}>📜 Log Irrigation</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                {[
                  { label: 'Field', key: 'field', type: 'select', options: ['Field A1', 'Field B2', 'Field C1', 'Field D1'] },
                  { label: 'Date', key: 'date', type: 'date' },
                  { label: 'Method', key: 'method', type: 'select', options: ['Drip', 'Flood', 'Sprinkler', 'Furrow'] },
                  { label: 'Duration', key: 'duration', type: 'select', options: ['30 min', '45 min', '1 hour', '1.5 hrs', '2 hrs', '3 hrs'] },
                  { label: 'Volume (litres)', key: 'volume', type: 'number' },
                  { label: 'Notes', key: 'notes', type: 'text' },
                ].map(f => (
                  <div key={f.key}>
                    <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 4 }}>{f.label}</label>
                    {f.type === 'select' ? (
                      <select value={logForm[f.key]} onChange={e => setLogForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }}>
                        {f.options.map(o => <option key={o}>{o}</option>)}
                      </select>
                    ) : (
                      <input type={f.type} value={logForm[f.key]} onChange={e => setLogForm(p => ({ ...p, [f.key]: e.target.value }))}
                        style={{ width: '100%', padding: '8px 10px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem', boxSizing: 'border-box' }} />
                    )}
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => {
                  setLogs(prev => [{ id: Date.now(), ...logForm, waterUsed: logForm.volume + ' L', status: 'completed' }, ...prev]);
                  setShowAddLog(false);
                  alert('Irrigation log added! Water usage chart updated.');
                }}>✓ Save Log</button>
                <button className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }} onClick={() => setShowAddLog(false)}>Cancel</button>
              </div>
            </div>
          )}

          {irrigSubTab === 'schedule' && (
            <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Field</th><th>Crop</th><th>Method</th><th>Frequency</th><th>Duration</th><th>Next Run</th><th>Status</th></tr></thead>
                  <tbody>
                    {schedules.map(s => (
                      <tr key={s.id}>
                        <td style={{ fontWeight: 600 }}>{s.field}</td><td>{s.crop}</td><td>{s.method}</td><td>{s.frequency}</td><td>{s.duration}</td>
                        <td>{s.nextRun}</td>
                        <td><span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: s.status === 'overdue' ? '#ef444422' : '#22c55e22', color: s.status === 'overdue' ? '#ef4444' : '#22c55e' }}>{s.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {irrigSubTab === 'log' && (
            <div className="card">
              <div className="table-wrap">
                <table className="data-table">
                  <thead><tr><th>Date</th><th>Field</th><th>Method</th><th>Duration</th><th>Water Used</th><th>Status</th><th>Notes</th></tr></thead>
                  <tbody>
                    {logs.map(l => (
                      <tr key={l.id}>
                        <td>{l.date}</td><td style={{ fontWeight: 600 }}>{l.field}</td><td>{l.method}</td><td>{l.duration}</td><td>{l.waterUsed}</td>
                        <td><span style={{ padding: '3px 10px', borderRadius: 12, fontSize: '0.7rem', fontWeight: 600, background: l.status === 'completed' ? '#22c55e22' : '#f59e0b22', color: l.status === 'completed' ? '#22c55e' : '#f59e0b' }}>{l.status}</span></td>
                        <td style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{l.notes}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
