import React, { useState } from 'react';
import { useSupabaseQuery, useSupabaseMutation } from '../lib/hooks/useSupabaseQuery';

const MOCK_FIELDS = [
  { id: 1, farmer_id: 1, field_name: 'North Plot', area_acres: 2.5, soil_type: 'Black Cotton', irrigation_type: 'Borewell', survey_number: 'SY-101' },
  { id: 2, farmer_id: 1, field_name: 'South Plot', area_acres: 1.0, soil_type: 'Red Loamy', irrigation_type: 'Canal', survey_number: 'SY-102' },
  { id: 3, farmer_id: 2, field_name: 'Home Field', area_acres: 3.0, soil_type: 'Alluvial', irrigation_type: 'River', survey_number: 'SY-201' },
  { id: 4, farmer_id: 3, field_name: 'Dry Field', area_acres: 1.5, soil_type: 'Sandy Loam', irrigation_type: 'Rainfed', survey_number: 'SY-301' },
  { id: 5, farmer_id: 4, field_name: 'Irrigated Plot A', area_acres: 4.0, soil_type: 'Clay', irrigation_type: 'Drip', survey_number: 'SY-401' },
  { id: 6, farmer_id: 5, field_name: 'Fallow Ground', area_acres: 2.0, soil_type: 'Black Cotton', irrigation_type: 'Sprinkler', survey_number: 'SY-501' },
];

export default function FieldsPage() {
  const { data: fields, loading, isLive, refetch } = useSupabaseQuery(
    'fields',
    { select: '*', orderBy: { column: 'created_at', ascending: false }, limit: 200 },
    MOCK_FIELDS
  );
  const { insert, loading: saving } = useSupabaseMutation('fields');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ field_name: '', area_acres: '', soil_type: 'black', irrigation_type: 'canal', survey_number: '' });

  const totalAcres = fields.reduce((sum, f) => sum + (parseFloat(f.area_acres) || 0), 0);
  const soilTypes = [...new Set(fields.map(f => f.soil_type).filter(Boolean))];

  const handleAdd = async () => {
    if (!form.field_name || !form.area_acres) return;
    const result = await insert({ ...form, area_acres: parseFloat(form.area_acres) });
    if (result.success) {
      setShowAdd(false);
      setForm({ field_name: '', area_acres: '', soil_type: 'black', irrigation_type: 'canal', survey_number: '' });
      refetch();
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: 'var(--radius-sm)',
    border: '1px solid var(--border)', background: 'var(--bg-primary)',
    color: 'var(--text-primary)', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none',
  };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🌾 Fields Management</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>
            {isLive ? '🟢 Live from Supabase' : '🟡 Mock data (offline)'}
          </div>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAdd(true)} style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Field</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Fields', value: fields.length, icon: '🌾', color: '#22c55e' },
          { label: 'Total Acres', value: totalAcres.toFixed(1), icon: '📐', color: '#3b82f6' },
          { label: 'Soil Types', value: soilTypes.length, icon: '🧱', color: '#f59e0b' },
          { label: 'Avg Field Size', value: fields.length ? `${(totalAcres / fields.length).toFixed(1)} ac` : '—', icon: '📊', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading-state">⟳ Loading fields...</div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>Field Name</th><th>Area (Acres)</th><th>Soil Type</th><th>Irrigation</th><th>Survey No.</th></tr>
              </thead>
              <tbody>
                {fields.map(f => (
                  <tr key={f.id}>
                    <td style={{ fontWeight: 600 }}>{f.field_name}</td>
                    <td>{f.area_acres} acres</td>
                    <td><span className="badge badge-blue">{f.soil_type}</span></td>
                    <td>{f.irrigation_type}</td>
                    <td style={{ color: 'var(--text-muted)', fontFamily: 'monospace' }}>{f.survey_number || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {fields.length === 0 && <div className="empty-state">No fields found</div>}
          </div>
        )}
      </div>

      {/* Add Field Modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }} onClick={() => setShowAdd(false)}>
          <div className="card" style={{ width: 420, padding: '28px' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 20 }}>🌾 Add New Field</div>
            {[
              { label: 'Field Name *', key: 'field_name', placeholder: 'e.g. North Plot' },
              { label: 'Area (Acres) *', key: 'area_acres', placeholder: 'e.g. 2.5', type: 'number' },
              { label: 'Soil Type', key: 'soil_type', placeholder: 'e.g. Black Cotton' },
              { label: 'Irrigation Type', key: 'irrigation_type', placeholder: 'e.g. Canal, Drip' },
              { label: 'Survey Number', key: 'survey_number', placeholder: 'e.g. SY-101' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom: 14 }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: 4, fontWeight: 500 }}>{field.label}</label>
                <input style={inputStyle} type={field.type || 'text'} placeholder={field.placeholder} value={form[field.key]} onChange={e => setForm(p => ({ ...p, [field.key]: e.target.value }))} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button className="btn btn-primary" onClick={handleAdd} disabled={saving || !form.field_name} style={{ flex: 1 }}>
                {saving ? '🔄 Saving...' : '✅ Save Field'}
              </button>
              <button className="btn btn-outline" onClick={() => setShowAdd(false)} style={{ flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
