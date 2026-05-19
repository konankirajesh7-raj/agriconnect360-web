import React, { useState, useMemo } from 'react';
import { useAuth } from '../lib/hooks/useAuth';
import { useSupabaseQuery, useSupabaseMutation } from '../lib/hooks/useSupabaseQuery';
import { useLanguage } from '../lib/i18n/LanguageContext';

const SOIL_ICONS = { 'Black Cotton':'🟤', 'Red Loamy':'🔴', 'Alluvial':'🟡', 'Sandy Loam':'🟠', 'Clay':'⬛', 'Laterite':'🟫' };
const IRR_ICONS = { 'Borewell':'🔵', 'Canal':'🌊', 'River':'🏞️', 'Rainfed':'🌧️', 'Drip':'💧', 'Sprinkler':'🚿' };

const MOCK_FIELDS = [
  { id:1, farmer_id:1, field_name:'North Plot', area_acres:2.5, soil_type:'Black Cotton', irrigation_type:'Borewell', survey_number:'SY-101', current_crop:'Paddy', health:88 },
  { id:2, farmer_id:1, field_name:'South Plot', area_acres:1.0, soil_type:'Red Loamy', irrigation_type:'Canal', survey_number:'SY-102', current_crop:'Cotton', health:72 },
  { id:3, farmer_id:2, field_name:'Home Field', area_acres:3.0, soil_type:'Alluvial', irrigation_type:'River', survey_number:'SY-201', current_crop:'Sugarcane', health:95 },
  { id:4, farmer_id:3, field_name:'Dry Field', area_acres:1.5, soil_type:'Sandy Loam', irrigation_type:'Rainfed', survey_number:'SY-301', current_crop:'Groundnut', health:65 },
  { id:5, farmer_id:4, field_name:'Irrigated Plot A', area_acres:4.0, soil_type:'Clay', irrigation_type:'Drip', survey_number:'SY-401', current_crop:'Chilli', health:80 },
  { id:6, farmer_id:5, field_name:'Fallow Ground', area_acres:2.0, soil_type:'Black Cotton', irrigation_type:'Sprinkler', survey_number:'SY-501', current_crop:'—', health:50 },
];

export default function FieldsPage() {
  const { t, tx } = useLanguage();
  const { user } = useAuth();
  const uid = user?.id;

  const fieldFilters = useMemo(() => uid ? [{ column: 'farmer_id', op: 'eq', value: uid }] : [], [uid]);
  const myMockFields = useMemo(() => MOCK_FIELDS.filter(f => f.farmer_id === 1), []);

  const { data: fields, loading, isLive, refetch } = useSupabaseQuery('fields', { select:'*', filters: fieldFilters, orderBy:{ column:'created_at', ascending:false }, limit:200, enabled: !!uid }, myMockFields);
  const { insert, loading: saving } = useSupabaseMutation('fields');
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ field_name:'', area_acres:'', soil_type:'Black Cotton', irrigation_type:'Canal', survey_number:'', current_crop:'' });
  const [selected, setSelected] = useState(null);

  const totalAcres = fields.reduce((s,f) => s+(parseFloat(f.area_acres)||0), 0);
  const soilTypes = [...new Set(fields.map(f => f.soil_type).filter(Boolean))];

  const handleAdd = async () => {
    if (!form.field_name || !form.area_acres) return;
    const result = await insert({ ...form, area_acres: parseFloat(form.area_acres) });
    if (result.success) { setShowAdd(false); setForm({ field_name:'', area_acres:'', soil_type:'Black Cotton', irrigation_type:'Canal', survey_number:'', current_crop:'' }); refetch(); }
  };

  const inp = { width:'100%', padding:'10px 14px', borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-primary)', color:'var(--text-primary)', fontSize:'0.88rem', boxSizing:'border-box', outline:'none' };

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🌾 My Fields</div>
          <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginTop:2 }}>{isLive ? '🟢 Live' : '🟡 Offline'} • {fields.length} fields • {totalAcres.toFixed(1)} acres</div>
        </div>
        <button onClick={() => setShowAdd(true)} style={{ padding:'8px 16px', borderRadius:10, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, fontSize:'0.85rem', cursor:'pointer' }}>+ Add Field</button>
      </div>

      {/* Stats Row */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:10, marginBottom:20 }}>
        {[
          { l:'Total Fields', v:fields.length, i:'🌾', c:'#22c55e' },
          { l:'Total Acres', v:totalAcres.toFixed(1), i:'📐', c:'#3b82f6' },
          { l:'Soil Types', v:soilTypes.length, i:'🧱', c:'#f59e0b' },
          { l:'Avg Health', v:fields.length ? Math.round(fields.reduce((s,f)=>s+(f.health||70),0)/fields.length)+'%' : '—', i:'💚', c:'#8b5cf6' },
        ].map(s => (
          <div key={s.l} style={{ background:'var(--bg-card)', border:'1px solid var(--border)', borderRadius:12, padding:14, textAlign:'center' }}>
            <div style={{ fontSize:'1.4rem', marginBottom:4 }}>{s.i}</div>
            <div style={{ fontSize:'1.4rem', fontWeight:800, color:s.c }}>{s.v}</div>
            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{s.l}</div>
          </div>
        ))}
      </div>

      {/* Field Cards */}
      {loading ? <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)' }}>⟳ Loading...</div> : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(300px, 1fr))', gap:14 }}>
          {fields.map(f => (
            <div key={f.id} className="card" style={{ padding:0, overflow:'hidden', cursor:'pointer', transition:'transform 0.2s', borderLeft:`4px solid ${(f.health||70)>=80?'#22c55e':(f.health||70)>=60?'#f59e0b':'#ef4444'}` }}
              onClick={() => setSelected(selected?.id === f.id ? null : f)}>
              <div style={{ padding:'16px 18px' }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:10 }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'0.95rem' }}>{f.field_name}</div>
                    <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>📋 {f.survey_number || 'No survey'}</div>
                  </div>
                  <span style={{ fontSize:'1.4rem', fontWeight:800, color:(f.health||70)>=80?'#22c55e':(f.health||70)>=60?'#f59e0b':'#ef4444' }}>{f.health||70}%</span>
                </div>

                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginBottom:10 }}>
                  <div style={{ background:'var(--bg-primary)', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Area</div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem' }}>📐 {f.area_acres} ac</div>
                  </div>
                  <div style={{ background:'var(--bg-primary)', borderRadius:8, padding:'8px 10px' }}>
                    <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>Current Crop</div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem' }}>🌱 {f.current_crop || '—'}</div>
                  </div>
                </div>

                <div style={{ display:'flex', gap:8, marginBottom:8 }}>
                  <span style={{ padding:'3px 10px', borderRadius:10, fontSize:'0.72rem', fontWeight:600, background:'rgba(139,69,19,0.1)', color:'#8b4513' }}>{SOIL_ICONS[f.soil_type]||'🟤'} {f.soil_type}</span>
                  <span style={{ padding:'3px 10px', borderRadius:10, fontSize:'0.72rem', fontWeight:600, background:'rgba(59,130,246,0.1)', color:'#3b82f6' }}>{IRR_ICONS[f.irrigation_type]||'💧'} {f.irrigation_type}</span>
                </div>

                {/* Health Bar */}
                <div style={{ height:6, background:'var(--bg-primary)', borderRadius:3, overflow:'hidden' }}>
                  <div style={{ height:'100%', borderRadius:3, width:`${f.health||70}%`, background:(f.health||70)>=80?'#22c55e':(f.health||70)>=60?'#f59e0b':'#ef4444', transition:'width 0.5s' }} />
                </div>
              </div>

              {/* Expanded detail */}
              {selected?.id === f.id && (
                <div style={{ borderTop:'1px solid var(--border)', padding:'14px 18px', background:'var(--bg-primary)' }}>
                  <div style={{ fontWeight:700, fontSize:'0.82rem', marginBottom:8 }}>📊 Quick Actions</div>
                  <div style={{ display:'flex', gap:8 }}>
                    <button style={{ flex:1, padding:8, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:'0.78rem', cursor:'pointer' }}>🧪 Soil Test</button>
                    <button style={{ flex:1, padding:8, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:'0.78rem', cursor:'pointer' }}>💧 Irrigate</button>
                    <button style={{ flex:1, padding:8, borderRadius:8, border:'1px solid var(--border)', background:'var(--bg-card)', color:'var(--text-primary)', fontSize:'0.78rem', cursor:'pointer' }}>🌾 Harvest</button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {fields.length === 0 && <div style={{ textAlign:'center', padding:40, color:'var(--text-muted)', gridColumn:'1/-1' }}><div style={{ fontSize:'2rem', marginBottom:8 }}>🌾</div>No fields added yet</div>}
        </div>
      )}

      {/* Add Modal */}
      {showAdd && (
        <div style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', backdropFilter:'blur(4px)' }} onClick={() => setShowAdd(false)}>
          <div className="card" style={{ width:440, padding:24 }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight:800, fontSize:'1rem', marginBottom:16 }}>🌾 Add New Field</div>
            {[
              { label:'Field Name *', key:'field_name', placeholder:'e.g. North Plot' },
              { label:'Area (Acres) *', key:'area_acres', placeholder:'e.g. 2.5', type:'number' },
              { label:'Current Crop', key:'current_crop', placeholder:'e.g. Paddy' },
              { label:'Survey Number', key:'survey_number', placeholder:'e.g. SY-101' },
            ].map(field => (
              <div key={field.key} style={{ marginBottom:12 }}>
                <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 }}>{field.label}</label>
                <input style={inp} type={field.type||'text'} placeholder={field.placeholder} value={form[field.key]} onChange={e => setForm(p => ({...p, [field.key]:e.target.value}))} />
              </div>
            ))}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:12 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 }}>Soil Type</label>
                <select style={inp} value={form.soil_type} onChange={e => setForm(p => ({...p, soil_type:e.target.value}))}>
                  {['Black Cotton','Red Loamy','Alluvial','Sandy Loam','Clay','Laterite'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:4, fontWeight:600 }}>Irrigation</label>
                <select style={inp} value={form.irrigation_type} onChange={e => setForm(p => ({...p, irrigation_type:e.target.value}))}>
                  {['Borewell','Canal','River','Rainfed','Drip','Sprinkler'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <button onClick={handleAdd} disabled={saving||!form.field_name} style={{ flex:1, padding:10, borderRadius:8, border:'none', background:'linear-gradient(135deg,#22c55e,#16a34a)', color:'#fff', fontWeight:700, cursor:'pointer', opacity:form.field_name?1:0.5 }}>{saving ? '⟳ Saving...' : '✅ Save Field'}</button>
              <button onClick={() => setShowAdd(false)} style={{ flex:1, padding:10, borderRadius:8, border:'1px solid var(--border)', background:'transparent', color:'var(--text-primary)', cursor:'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
