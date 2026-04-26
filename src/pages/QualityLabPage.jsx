import React, { useState } from 'react';

const REPORTS = [
  { id: 'QL-001', crop: 'Paddy', sample: 'North Field, Plot 1', date: '2026-04-20', grade: 'A', status: 'completed', params: { 'Moisture': '13.2%', 'Foreign Matter': '0.8%', 'Broken Grain': '3.1%', 'Discolored': '1.2%', 'Dehusked': '95.8%' } },
  { id: 'QL-002', crop: 'Cotton', sample: 'South Block Harvest', date: '2026-04-18', grade: 'B', status: 'completed', params: { 'Staple Length': '28.5 mm', 'Micronaire': '4.2', 'Strength': '29.8 g/tex', 'Uniformity': '82%', 'Moisture': '8.1%' } },
  { id: 'QL-003', crop: 'Groundnut', sample: 'Kharif 2026 Lot', date: '2026-04-22', grade: 'A', status: 'pending', params: { 'Moisture': '6.8%', 'Oil Content': '48.2%', 'Aflatoxin': 'Below 15ppb', 'Shelling': '72%', 'Kernel Size': 'Bold' } },
  { id: 'QL-004', crop: 'Chilli', sample: 'Teja Variety Batch', date: '2026-04-15', grade: 'Premium', status: 'completed', params: { 'Moisture': '10.5%', 'Scoville': '75,000 SHU', 'Color': 'Deep Red', 'Capsaicin': '0.82%', 'ASTA': '180' } },
];

const gradeStyle = { A: { bg: 'rgba(16,185,129,0.12)', c: '#34d399' }, B: { bg: 'rgba(245,158,11,0.12)', c: '#fbbf24' }, C: { bg: 'rgba(239,68,68,0.12)', c: '#f87171' }, Premium: { bg: 'rgba(139,92,246,0.12)', c: '#a78bfa' } };

export default function QualityLabPage() {
  const [selected, setSelected] = useState(null);

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🧪 Quality Lab</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Lab-grade quality reports and grading for your produce</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Total Reports</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{REPORTS.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Grade A+</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{REPORTS.filter(r => r.grade === 'A' || r.grade === 'Premium').length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Pending</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{REPORTS.filter(r => r.status === 'pending').length}</div>
          </div>
        </div>
      </div>

      {/* Report Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {REPORTS.map(r => {
          const gs = gradeStyle[r.grade] || gradeStyle.A;
          return (
            <div key={r.id} className="card" style={{ padding: 18, cursor: 'pointer', transition: 'transform 0.2s', borderTop: `3px solid ${gs.c}` }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}
              onClick={() => setSelected(selected === r.id ? null : r.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{r.crop}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{r.sample}</div>
                </div>
                <span style={{ fontSize: '0.68rem', padding: '4px 12px', borderRadius: 999, background: gs.bg, color: gs.c, fontWeight: 700, alignSelf: 'flex-start' }}>Grade {r.grade}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Report ID</span><span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{r.id}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Date</span><span>{r.date}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '6px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                <span style={{ color: 'var(--text-muted)' }}>Status</span>
                <span style={{ fontSize: '0.65rem', padding: '2px 10px', borderRadius: 999, background: r.status === 'completed' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', color: r.status === 'completed' ? '#34d399' : '#fbbf24', fontWeight: 600 }}>{r.status}</span>
              </div>

              {selected === r.id && (
                <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
                  <div style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--text-primary)', marginBottom: 8 }}>🔬 Lab Parameters</div>
                  {Object.entries(r.params).map(([k, v]) => (
                    <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', padding: '5px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>{k}</span>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                  <button style={{ width: '100%', marginTop: 12, padding: '10px 0', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' }}>📄 Download Certificate</button>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <button style={{ marginTop: 20, padding: '12px 28px', borderRadius: 12, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.88rem', cursor: 'pointer' }}>🧪 Request New Lab Test</button>
    </div>
  );
}
