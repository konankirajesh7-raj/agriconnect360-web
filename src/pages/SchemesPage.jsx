import React, { useState } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';

const MOCK_SCHEMES = [
  { _id: '1', name: 'PM-KISAN', category: 'subsidy', description: 'Direct income support of ₹6000/year to farmer families in 3 installments', amount: 6000, ministry: 'Agriculture Ministry', state: 'Central', is_active: true, documents_required: ['Aadhaar', 'Land records', 'Bank account'], deadline: null, application_url: 'pmkisan.gov.in', beneficiaries: '11.8 Cr', eligibility: ['Small & marginal farmers', 'Valid Aadhaar', 'Own cultivable land'] },
  { _id: '2', name: 'Fasal Bima Yojana', category: 'insurance', description: 'Crop insurance with premium 2% for Kharif, 1.5% for Rabi. Covers natural calamity, pest, disease.', amount: null, ministry: 'Agriculture Ministry', state: 'Central', is_active: true, documents_required: ['Aadhaar', 'Land records', 'Loan details'], deadline: '2025-03-31', application_url: 'pmfby.gov.in', beneficiaries: '5.5 Cr', eligibility: ['All farmers (loanee & non-loanee)', 'Valid land records', 'Enrolled before deadline'] },
  { _id: '3', name: 'Kisan Credit Card', category: 'loan', description: 'Short-term credit up to ₹3L at 7% interest (4% with subsidy). For crop cultivation, post-harvest, and allied activities.', amount: 300000, ministry: 'Finance Ministry', state: 'Central', is_active: true, documents_required: ['Aadhaar', 'Land records', 'Photo'], deadline: null, application_url: 'kis.nabard.org', beneficiaries: '7.3 Cr', eligibility: ['Own or leased farmland', 'Age 18-75 years', 'No defaulting history'] },
  { _id: '4', name: 'YSR Rythu Bharosa', category: 'subsidy', description: 'AP state scheme: ₹13,500/year investment support to every farmer family. Paid in Kharif, Rabi, and summer seasons.', amount: 13500, ministry: 'AP Agriculture Dept', state: 'Andhra Pradesh', is_active: true, documents_required: ['Aadhaar', 'Land Pattadar Passbook', 'Bank Account'], deadline: null, application_url: 'ysrrythubharosa.ap.gov.in', beneficiaries: '51 L', eligibility: ['Andhra Pradesh resident', 'Own cultivable land', 'Not a govt employee'] },
  { _id: '5', name: 'Soil Health Card', category: 'other', description: 'Free soil testing with digital card showing NPK, pH, organic carbon + crop-wise fertilizer recommendations.', amount: null, ministry: 'Agriculture Ministry', state: 'Central', is_active: true, documents_required: ['Land records'], deadline: null, application_url: 'soilhealth.dac.gov.in', beneficiaries: '22 Cr', eligibility: ['Any farmer with cultivable land'] },
  { _id: '6', name: 'e-NAM', category: 'market', description: 'Online trading platform connecting 1000+ mandis. Sell at best national price via transparent auction.', amount: null, ministry: 'Agriculture Ministry', state: 'Central', is_active: true, documents_required: ['Aadhaar', 'Bank account'], deadline: null, application_url: 'enam.gov.in', beneficiaries: '1.7 Cr', eligibility: ['Any farmer or trader', 'Valid Aadhaar & bank account'] },
];

const CAT_LABELS = { subsidy: { label: 'Subsidy', color: '#22c55e', icon: '💵' }, insurance: { label: 'Insurance', color: '#3b82f6', icon: '🛡️' }, loan: { label: 'Loan', color: '#f59e0b', icon: '🏦' }, market: { label: 'Market', color: '#8b5cf6', icon: '🏪' }, other: { label: 'Other', color: '#6b7280', icon: '📋' } };

export default function SchemesPage() {
  const { data: schemes, loading, isLive } = useSupabaseQuery('schemes', { orderBy: { column: 'name', ascending: true }, limit: 200 }, MOCK_SCHEMES);
  const [catFilter, setCatFilter] = useState('all');
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedScheme, setSelectedScheme] = useState(null);

  const categories = [...new Set(schemes.map(s => s.category))];
  const filtered = catFilter === 'all' ? schemes : schemes.filter(s => s.category === catFilter);

  const tabs = [
    { id: 'browse', icon: '📋', label: 'Browse Schemes' },
    { id: 'eligibility', icon: '✅', label: 'Eligibility Checker' },
    { id: 'applied', icon: '📂', label: 'My Applications' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🏛️ Government Schemes & Subsidies</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Discover, check eligibility & apply for Central + State schemes</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Add Scheme</button>
      </div>

      {/* Stats */}
      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Total Schemes', value: schemes.length, icon: '🏛️', color: '#3b82f6' },
          { label: 'Central', value: schemes.filter(s => s.state === 'Central').length, icon: '🇮🇳', color: '#22c55e' },
          { label: 'State', value: schemes.filter(s => s.state !== 'Central').length, icon: '📍', color: '#f59e0b' },
          { label: 'Expiring Soon', value: schemes.filter(s => s.deadline && new Date(s.deadline) < new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)).length, icon: '⏰', color: '#ef4444' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'browse' && (
        <>
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
            {['all', ...categories].map(c => {
              const meta = CAT_LABELS[c] || { label: c, color: '#888', icon: '📋' };
              return <button key={c} onClick={() => setCatFilter(c)} className={`filter-btn${catFilter === c ? ' active' : ''}`}>{c === 'all' ? '📋 All' : `${meta.icon} ${meta.label}`}</button>;
            })}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 }}>
            {loading ? <div className="loading-state">⟳ Loading schemes...</div> : filtered.map(s => {
              const meta = CAT_LABELS[s.category] || { label: s.category, color: '#888', icon: '📋' };
              const isExpiring = s.deadline && new Date(s.deadline) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
              return (
                <div key={s._id} className="card" style={{ padding: '20px', borderLeft: `3px solid ${meta.color}`, transition: 'transform 0.2s' }}
                  onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-primary)' }}>{s.name}</div>
                    <span style={{ background: meta.color + '22', color: meta.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, whiteSpace: 'nowrap' }}>{meta.icon} {meta.label}</span>
                  </div>
                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>{s.description}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                    {s.amount && <span className="badge badge-success">₹{s.amount.toLocaleString()}</span>}
                    <span className="badge badge-info">{s.state}</span>
                    {s.beneficiaries && <span className="badge badge-blue">{s.beneficiaries} farmers</span>}
                    {isExpiring && <span className="badge badge-warning">⚠️ Deadline: {new Date(s.deadline).toLocaleDateString('en-IN')}</span>}
                    {!s.deadline && <span className="badge badge-info">Always Open</span>}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 12 }}>📄 Docs: {s.documents_required?.join(', ')}</div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <a href={`https://${s.application_url}`} target="_blank" rel="noopener noreferrer"
                      className="btn btn-primary" style={{ flex: 1, fontSize: '0.8rem', padding: '8px 14px', textAlign: 'center', textDecoration: 'none' }}>🔗 Apply Now</a>
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '8px 14px' }}
                      onClick={() => { setSelectedScheme(s); setActiveTab('eligibility'); }}>✅ Check Eligibility</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {activeTab === 'eligibility' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 }}>
          <div className="card" style={{ padding: '24px' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 4 }}>✅ Eligibility Checker</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 20 }}>Answer a few questions to find schemes you qualify for</div>
            {[
              { label: 'State', type: 'select', options: ['Andhra Pradesh', 'Telangana', 'Karnataka', 'Tamil Nadu', 'Maharashtra'] },
              { label: 'Land Holding (acres)', type: 'number', placeholder: '2.5' },
              { label: 'Farmer Category', type: 'select', options: ['Small (< 2 ha)', 'Marginal (< 1 ha)', 'Medium (2-10 ha)', 'Large (> 10 ha)'] },
              { label: 'Annual Income (₹)', type: 'number', placeholder: '200000' },
              { label: 'Primary Crop', type: 'select', options: ['Cotton', 'Paddy', 'Wheat', 'Sugarcane', 'Maize', 'Soybean', 'Vegetables'] },
              { label: 'Irrigation Type', type: 'select', options: ['Rainfed', 'Canal', 'Borewell', 'Drip/Sprinkler'] },
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
            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '0.95rem' }}>🔍 Check My Eligibility</button>
          </div>

          <div>
            <div className="card" style={{ padding: '20px', marginBottom: 12, background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(59,130,246,0.04))' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#22c55e', marginBottom: 12 }}>🎉 You may qualify for {schemes.length} schemes!</div>
              {schemes.slice(0, 4).map(s => (
                <div key={s._id} style={{ padding: '10px 12px', background: 'var(--bg-card)', borderRadius: 'var(--radius-sm)', marginBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{s.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{s.state} • {CAT_LABELS[s.category]?.label}</div>
                  </div>
                  {s.amount && <span style={{ fontWeight: 700, color: '#22c55e', fontSize: '0.85rem' }}>₹{s.amount.toLocaleString()}</span>}
                </div>
              ))}
            </div>

            {selectedScheme && (
              <div className="card" style={{ padding: '20px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>📋 {selectedScheme.name} — Eligibility</div>
                {selectedScheme.eligibility?.map((e, i) => (
                  <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
                    <span style={{ color: '#22c55e', fontSize: '1rem' }}>✓</span>
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{e}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'applied' && (
        <div className="card" style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>📂</div>
          <div style={{ fontSize: '0.95rem', fontWeight: 600 }}>No applications tracked yet</div>
          <div style={{ fontSize: '0.82rem', marginTop: 4 }}>Apply for a scheme and track your application status here</div>
        </div>
      )}
    </div>
  );
}
