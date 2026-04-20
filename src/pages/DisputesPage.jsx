import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_DISPUTES = [
  { id: 1, complainant_id: 1, respondent_type: 'supplier', category: 'Payment', description: 'Supplier delivered inferior quality seeds but charged premium price', status: 'under_review', created_at: '2024-12-10', evidence_urls: ['doc1.pdf'] },
  { id: 2, complainant_id: 3, respondent_type: 'transporter', category: 'Damage', description: 'Transported cotton got damaged due to leaking vehicle', status: 'filed', created_at: '2024-12-15', evidence_urls: [] },
  { id: 3, complainant_id: 5, respondent_type: 'labour', category: 'Contract', description: 'Labour association did not complete work as agreed', status: 'resolved', created_at: '2024-11-20', resolution: 'Partial refund of ₹3000 issued', evidence_urls: ['photo1.jpg'] },
  { id: 4, complainant_id: 7, respondent_type: 'farmer', category: 'Land', description: 'Dispute over irrigation rights for common canal', status: 'filed', created_at: '2024-12-18', evidence_urls: [] },
];

const STATUS_PIPELINE = ['filed', 'under_review', 'mediation', 'resolved', 'closed'];
const STATUS_COLOR = { filed: '#ef4444', under_review: '#f59e0b', mediation: '#3b82f6', resolved: '#22c55e', closed: '#6b7280' };

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('agri_admin_token');
    axios.get('/api/v1/disputes?all=true', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => setDisputes(r.data.disputes || r.data.data || []))
      .catch(() => setDisputes(MOCK_DISPUTES))
      .finally(() => setLoading(false));
  }, []);

  const filtered = statusFilter === 'all' ? disputes : disputes.filter(d => d.status === statusFilter);

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">⚖️ Dispute Resolution</div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ File Dispute</button>
      </div>

      {/* Pipeline */}
      <div className="card" style={{ padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
          {STATUS_PIPELINE.map((s, i) => {
            const count = disputes.filter(d => d.status === s).length;
            return (
              <React.Fragment key={s}>
                <div onClick={() => setStatusFilter(statusFilter === s ? 'all' : s)} style={{ textAlign: 'center', cursor: 'pointer', flex: 1 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', background: STATUS_COLOR[s] + '22',
                    border: `2px solid ${STATUS_COLOR[s]}`, display: 'flex', alignItems: 'center',
                    justifyContent: 'center', margin: '0 auto 6px', fontWeight: 700, color: STATUS_COLOR[s], fontSize: '1rem',
                  }}>{count}</div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{s.replace('_', ' ')}</div>
                </div>
                {i < STATUS_PIPELINE.length - 1 && (
                  <div style={{ flex: 0.3, height: 2, background: 'var(--border)' }} />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {['all', ...STATUS_PIPELINE].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className={`filter-btn${statusFilter === s ? ' active' : ''}`} style={{ textTransform: 'capitalize' }}>
            {s === 'all' ? 'All' : s.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="card">
        {loading ? <div className="loading-state">⟳ Loading disputes...</div> : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>Complainant</th><th>Against</th><th>Category</th><th>Description</th><th>Status</th><th>Evidence</th><th>Filed</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.map(d => (
                  <tr key={d.id}>
                    <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>#{d.id}</td>
                    <td>Farmer #{d.complainant_id}</td>
                    <td style={{ textTransform: 'capitalize' }}>{d.respondent_type}</td>
                    <td><span className="badge badge-warning">{d.category}</span></td>
                    <td style={{ maxWidth: 200, fontSize: '0.82rem', color: 'var(--text-muted)' }}>{d.description?.substring(0, 60)}...</td>
                    <td>
                      <span style={{ background: (STATUS_COLOR[d.status] || '#888') + '22', color: STATUS_COLOR[d.status] || '#888', padding: '3px 10px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600, textTransform: 'capitalize' }}>
                        {d.status?.replace('_', ' ')}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>{d.evidence_urls?.length || 0} 📎</td>
                    <td style={{ fontSize: '0.8rem' }}>{d.created_at ? new Date(d.created_at).toLocaleDateString('en-IN') : '—'}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="action-btn">👁</button>
                        {d.status === 'filed' && <button className="action-btn" style={{ color: '#f59e0b' }}>🔍</button>}
                        {d.status === 'under_review' && <button className="action-btn" style={{ color: '#22c55e' }}>✅</button>}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <div className="empty-state">No disputes in this category</div>}
          </div>
        )}
      </div>
    </div>
  );
}
