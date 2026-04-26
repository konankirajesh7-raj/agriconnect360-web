import React, { useState } from 'react';
import { useSupabaseQuery } from '../lib/hooks/useSupabaseQuery';

const MOCK_QA = [
  { _id: '1', question: 'My paddy leaves are turning yellow. What should I do?', farmer_id: 1, category: 'disease', answered_by: 'ai', answer: 'Yellow leaves in paddy can indicate nitrogen deficiency or bacterial leaf blight. Apply urea at 20kg/acre and monitor for 5 days.', upvotes: 45, views: 234, is_published: true, createdAt: '2024-12-10' },
  { _id: '2', question: 'What is the best time to apply Borax for cotton?', farmer_id: 3, category: 'soil', answered_by: 'expert', answer: 'Apply Borax at 10kg/acre during square formation stage for best results.', upvotes: 32, views: 156, is_published: true, createdAt: '2024-12-12' },
  { _id: '3', question: 'How to get PM-KISAN money if I did not receive last installment?', farmer_id: 5, category: 'scheme', answered_by: null, answer: null, upvotes: 0, views: 45, is_published: true, createdAt: '2024-12-15' },
  { _id: '4', question: 'Can I use Neem oil to control aphids on my vegetables?', farmer_id: 6, category: 'pest', answered_by: 'community', answer: 'Yes, Neem oil 3ml/L water spray is effective against aphids. Spray in the evening.', upvotes: 28, views: 189, is_published: true, createdAt: '2024-12-18' },
];

const CAT_COLORS = { pest: '#ef4444', disease: '#f97316', soil: '#22c55e', market: '#3b82f6', scheme: '#8b5cf6', equipment: '#f59e0b', general: '#6b7280' };
const ANSWERED_LABELS = { ai: { label: '🤖 AI', color: '#8b5cf6' }, expert: { label: '👨‍🏫 Expert', color: '#22c55e' }, community: { label: '👥 Community', color: '#3b82f6' } };

export default function QAPage() {
  const { data: questions, loading, isLive } = useSupabaseQuery('qa_questions', { orderBy: { column: 'created_at', ascending: false }, limit: 200 }, MOCK_QA);
  const [filter, setFilter] = useState('all');

  const unanswered = questions.filter(q => !q.answered_by);
  const filtered = filter === 'unanswered' ? unanswered : filter === 'ai' ? questions.filter(q => q.answered_by === 'ai') : questions;

  return (
    <div className="animated">
      <div className="section-header">
        <div className="section-title">❓ Q&A Forum Moderation</div>
        <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '6px 14px' }}>
          {unanswered.length} Pending Answers
        </span>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          { label: 'Total Questions', value: questions.length, icon: '❓', color: '#3b82f6' },
          { label: 'Unanswered', value: unanswered.length, icon: '⏳', color: '#ef4444' },
          { label: 'AI Answered', value: questions.filter(q => q.answered_by === 'ai').length, icon: '🤖', color: '#8b5cf6' },
          { label: 'Expert Answered', value: questions.filter(q => q.answered_by === 'expert').length, icon: '👨‍🏫', color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {[['all', 'All Questions'], ['unanswered', '⏳ Unanswered'], ['ai', '🤖 AI Answered']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)} className={`filter-btn${filter === val ? ' active' : ''}`}>{label}</button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {loading ? <div className="loading-state card">⟳ Loading questions...</div> : filtered.map(q => {
          const ans = ANSWERED_LABELS[q.answered_by];
          return (
            <div key={q._id} className="card" style={{ padding: '16px 20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, marginBottom: 8 }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', flex: 1 }}>❓ {q.question}</div>
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  {q.category && <span style={{ background: (CAT_COLORS[q.category] || '#888') + '22', color: CAT_COLORS[q.category] || '#888', padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600, textTransform: 'capitalize' }}>{q.category}</span>}
                  {ans ? <span style={{ background: ans.color + '22', color: ans.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{ans.label}</span>
                    : <span className="badge badge-warning">⏳ Unanswered</span>}
                </div>
              </div>
              {q.answer && (
                <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '10px 14px', color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: 8, lineHeight: 1.6 }}>
                  💬 {q.answer}
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  By Farmer #{q.farmer_id} · 👁 {q.views} · 👍 {q.upvotes}
                </span>
                <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
                  {!q.answered_by && <button className="btn btn-primary" style={{ fontSize: '0.78rem', padding: '5px 12px' }}>🤖 AI Answer</button>}
                  <button className="action-btn">✏️</button>
                  <button className="action-btn" style={{ color: '#ef4444' }}>🗑</button>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state card">No questions in this category</div>}
      </div>
    </div>
  );
}
