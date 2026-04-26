import React, { useState, useMemo } from 'react';

const TODAY = new Date().toISOString().slice(0, 10);
const INITIAL = [
  { id: 1, title: 'Apply Urea — Paddy Field (Day 45)', type: 'Fertilizer', crop: 'Paddy', due: TODAY, status: 'pending', priority: 'high', auto: true },
  { id: 2, title: 'Check drip lines — North Block', type: 'Irrigation', crop: 'Groundnut', due: TODAY, status: 'pending', priority: 'medium', auto: true },
  { id: 3, title: 'Spray Imidacloprid for aphids', type: 'Pest Mgmt', crop: 'Cotton', due: '2026-04-25', status: 'pending', priority: 'high', auto: true },
  { id: 4, title: 'Harvest Chilli — Red stage', type: 'Harvest', crop: 'Chilli', due: '2026-04-26', status: 'pending', priority: 'medium', auto: true },
  { id: 5, title: 'KCC interest payment due', type: 'Finance', crop: '-', due: '2026-04-30', status: 'pending', priority: 'high', auto: false },
  { id: 6, title: 'Soil test — South Field', type: 'Soil', crop: 'Paddy', due: '2026-05-01', status: 'pending', priority: 'low', auto: false },
  { id: 7, title: 'Tractor maintenance (500h service)', type: 'Equipment', crop: '-', due: '2026-05-05', status: 'pending', priority: 'medium', auto: false },
  { id: 8, title: 'PMFBY enrollment deadline', type: 'Insurance', crop: 'Paddy', due: '2026-05-15', status: 'pending', priority: 'high', auto: false },
  { id: 9, title: 'Weeding complete — Groundnut plot', type: 'Weeding', crop: 'Groundnut', due: '2026-04-18', status: 'done', priority: 'medium', auto: true },
  { id: 10, title: 'Applied basal dose fertilizer', type: 'Fertilizer', crop: 'Paddy', due: '2026-04-10', status: 'done', priority: 'high', auto: true },
];

const priorityColors = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };
const priorityBg = { high: 'rgba(239,68,68,0.1)', medium: 'rgba(245,158,11,0.1)', low: 'rgba(16,185,129,0.1)' };
const badge = (bg, c) => ({ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, background: bg, color: c, fontWeight: 600 });

export default function TaskManagerPage() {
  const [tasks, setTasks] = useState(INITIAL);
  const [filter, setFilter] = useState('all');
  const [newTitle, setNewTitle] = useState('');

  const overdue = tasks.filter(t => t.status === 'pending' && t.due < TODAY).length;
  const todayCount = tasks.filter(t => t.due === TODAY && t.status === 'pending').length;

  const filtered = useMemo(() => {
    let items = tasks;
    if (filter === 'pending') items = items.filter(t => t.status === 'pending');
    if (filter === 'done') items = items.filter(t => t.status === 'done');
    if (filter === 'overdue') items = items.filter(t => t.status === 'pending' && t.due < TODAY);
    if (filter === 'today') items = items.filter(t => t.due === TODAY);
    return items.sort((a, b) => a.due.localeCompare(b.due));
  }, [tasks, filter]);

  function toggleDone(id) { setTasks(prev => prev.map(t => t.id === id ? { ...t, status: t.status === 'done' ? 'pending' : 'done' } : t)); }
  function addTask() {
    if (!newTitle.trim()) return;
    setTasks(prev => [...prev, { id: Date.now(), title: newTitle, type: 'Custom', crop: '-', due: TODAY, status: 'pending', priority: 'medium', auto: false }]);
    setNewTitle('');
  }

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">📋 Task Manager</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Crop calendar tasks + custom reminders</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Today</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#60a5fa' }}>{todayCount}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Overdue</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#f87171' }}>{overdue}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Pending</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#fbbf24' }}>{tasks.filter(t => t.status === 'pending').length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Done</div>
            <div style={{ fontSize: '1.3rem', fontWeight: 800, color: '#34d399' }}>{tasks.filter(t => t.status === 'done').length}</div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="card" style={{ padding: 12, marginBottom: 16, display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {['all', 'today', 'pending', 'overdue', 'done'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding: '6px 14px', borderRadius: 999, fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s',
            border: '1px solid', borderColor: filter === f ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.1)',
            background: filter === f ? 'rgba(16,185,129,0.15)' : 'transparent', color: filter === f ? '#34d399' : 'var(--text-secondary)',
          }}>{f.charAt(0).toUpperCase() + f.slice(1)}</button>
        ))}
      </div>

      {/* Add task */}
      <div className="card" style={{ padding: 14, marginBottom: 16, display: 'flex', gap: 10 }}>
        <input style={{ flex: 1, borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '10px 14px', outline: 'none', fontSize: '0.85rem' }} value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="✏️ Add a custom task..." onKeyDown={e => e.key === 'Enter' && addTask()} />
        <button onClick={addTask} style={{ padding: '10px 22px', borderRadius: 10, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>+ Add</button>
      </div>

      {/* Task list */}
      {filtered.map(t => (
        <div key={t.id} className="card" style={{
          padding: 14, marginBottom: 8, display: 'flex', gap: 12, alignItems: 'center',
          opacity: t.status === 'done' ? 0.55 : 1, borderLeft: `3px solid ${priorityColors[t.priority]}`,
          transition: 'all 0.2s',
        }}>
          <input type="checkbox" checked={t.status === 'done'} onChange={() => toggleDone(t.id)} style={{ width: 20, height: 20, accentColor: '#10b981', flexShrink: 0, cursor: 'pointer' }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.88rem', textDecoration: t.status === 'done' ? 'line-through' : 'none', color: 'var(--text-primary)', lineHeight: 1.3 }}>{t.title}</div>
            <div style={{ display: 'flex', gap: 6, marginTop: 6, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={badge('rgba(59,130,246,0.12)', '#93c5fd')}>{t.type}</span>
              {t.crop !== '-' && <span style={badge('rgba(16,185,129,0.12)', '#6ee7b7')}>{t.crop}</span>}
              {t.auto && <span style={badge('rgba(245,158,11,0.12)', '#fbbf24')}>⚡ Auto</span>}
              <span style={{ fontSize: '0.72rem', color: t.due < TODAY && t.status === 'pending' ? '#ef4444' : 'var(--text-muted)' }}>📅 {t.due}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
