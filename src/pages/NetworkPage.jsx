import React, { useState, useEffect } from 'react';
import axios from 'axios';

const MOCK_CONNECTIONS = [
  { id: 1, requester_id: 1, receiver_id: 2, status: 'accepted', connected_at: '2024-11-10' },
  { id: 2, requester_id: 3, receiver_id: 4, status: 'pending', connected_at: null },
  { id: 3, requester_id: 5, receiver_id: 1, status: 'accepted', connected_at: '2024-10-20' },
];

const MOCK_GROUPS = [
  { _id: '1', name: 'Mysuru Paddy Farmers', type: 'cooperative', members: [{ farmer_id: 1 }, { farmer_id: 3 }, { farmer_id: 6 }], district: 'Mysuru', crop_focus: 'Paddy', is_public: true, post_count: 34 },
  { _id: '2', name: 'AP Cotton Growers', type: 'topic', members: [{ farmer_id: 2 }, { farmer_id: 4 }, { farmer_id: 7 }], district: 'Guntur', crop_focus: 'Cotton', is_public: true, post_count: 89 },
  { _id: '3', name: 'Belagavi Sugarcane SHG', type: 'self_help', members: [{ farmer_id: 2 }, { farmer_id: 5 }], district: 'Belagavi', crop_focus: 'Sugarcane', is_public: false, post_count: 12 },
];

// Community feed posts
const MOCK_POSTS = [
  { id: 1, author: 'Ramu Naik', avatar: '👨‍🌾', district: 'Mysuru', time: '2 hours ago', content: 'Got great results with BPT-5204 paddy this season! Yield was 12 quintal/acre. Anyone else try this variety?', likes: 34, comments: 12, image: '🌾', tags: ['Paddy', 'Seeds'] },
  { id: 2, author: 'Priya Devi', avatar: '👩‍🌾', district: 'Tumkur', time: '5 hours ago', content: 'Yellow sticky traps are working wonders for whitefly control in my cotton field. Much better than chemical sprays. Cost only ₹200/acre!', likes: 67, comments: 23, image: '🐛', tags: ['Cotton', 'IPM'] },
  { id: 3, author: 'Venkatesh R', avatar: '👨‍🌾', district: 'Dharwad', time: '1 day ago', content: 'Dharwad APMC cotton price hit ₹7100 today! Best time to sell if you have stock. Don\'t hold beyond Thursday — rain forecast.', likes: 89, comments: 31, image: null, tags: ['Market', 'Cotton'] },
  { id: 4, author: 'Manjula D', avatar: '👩‍🌾', district: 'Haveri', time: '2 days ago', content: 'Successfully applied for PM-KISAN through CSC center. Got first installment within 3 weeks. Here\'s my step-by-step guide...', likes: 112, comments: 45, image: null, tags: ['Schemes', 'PM-KISAN'] },
];

const TYPE_LABELS = { cooperative: { label: 'Cooperative', icon: '🤝', color: '#22c55e' }, self_help: { label: 'Self Help Group', icon: '👥', color: '#3b82f6' }, topic: { label: 'Topic Group', icon: '💬', color: '#f59e0b' }, district: { label: 'District', icon: '📍', color: '#8b5cf6' } };

export default function NetworkPage() {
  const [connections, setConnections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('feed');

  useEffect(() => {
    const token = localStorage.getItem('agri_admin_token');
    Promise.allSettled([
      axios.get('/api/v1/network/connections?all=true', { headers: { Authorization: `Bearer ${token}` } }),
      axios.get('/api/v1/network/groups', { headers: { Authorization: `Bearer ${token}` } }),
    ]).then(([cr, gr]) => {
      setConnections(cr.status === 'fulfilled' ? (cr.value.data.connections || cr.value.data.data || []) : MOCK_CONNECTIONS);
      setGroups(gr.status === 'fulfilled' ? (gr.value.data.groups || gr.value.data.data || []) : MOCK_GROUPS);
    }).finally(() => setLoading(false));
  }, []);

  const tabs = [
    { id: 'feed', icon: '📱', label: 'Community Feed' },
    { id: 'groups', icon: '👥', label: 'Groups' },
    { id: 'connections', icon: '🔗', label: 'Connections' },
  ];

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">🤝 Farmer Network & Community</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Connect, share knowledge & learn from fellow farmers</div>
        </div>
        <button className="btn btn-primary" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>+ Create Post</button>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          { label: 'Connections', value: connections.filter(c => c.status === 'accepted').length, icon: '🔗', color: '#3b82f6' },
          { label: 'Pending', value: connections.filter(c => c.status === 'pending').length, icon: '⏳', color: '#f59e0b' },
          { label: 'Groups Joined', value: groups.length, icon: '👥', color: '#22c55e' },
          { label: 'Posts Today', value: MOCK_POSTS.filter(p => p.time.includes('hour')).length, icon: '📝', color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
            <div className="stat-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            style={{ padding: '10px 18px', borderRadius: 'var(--radius-sm)', cursor: 'pointer', border: 'none', fontSize: '0.82rem', fontWeight: 600, background: activeTab === t.id ? 'var(--text-primary)' : 'var(--bg-card)', color: activeTab === t.id ? '#fff' : 'var(--text-muted)', transition: 'all 0.2s' }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'feed' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
          <div>
            {/* Post Composer */}
            <div className="card" style={{ padding: '16px', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem' }}>👨‍🌾</div>
                <input placeholder="Share farming tip, ask question, or post update..." style={{ flex: 1, padding: '10px 14px', borderRadius: 20, border: '1px solid var(--border)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: '0.85rem' }} />
                <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.82rem' }}>Post</button>
              </div>
            </div>

            {/* Feed Posts */}
            {MOCK_POSTS.map(post => (
              <div key={post.id} className="card" style={{ padding: '18px', marginBottom: 12 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
                  <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>{post.avatar}</div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{post.author}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{post.district} • {post.time}</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 12 }}>{post.content}</div>
                {post.image && (
                  <div style={{ background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', padding: '24px', textAlign: 'center', fontSize: '3rem', marginBottom: 12 }}>{post.image}</div>
                )}
                <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
                  {post.tags.map(t => <span key={t} className="badge badge-blue" style={{ fontSize: '0.68rem' }}>{t}</span>)}
                </div>
                <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border)', paddingTop: 10 }}>
                  <span style={{ cursor: 'pointer' }}>❤️ {post.likes}</span>
                  <span style={{ cursor: 'pointer' }}>💬 {post.comments}</span>
                  <span style={{ cursor: 'pointer' }}>🔗 Share</span>
                </div>
              </div>
            ))}
          </div>

          {/* Sidebar */}
          <div>
            <div className="card" style={{ padding: '16px', marginBottom: 12 }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>🔥 Trending Topics</div>
              {['Cotton Prices Rising', 'Rabi Season Prep', 'PM-KISAN Update', 'Organic Farming Tips', 'Water Conservation'].map((t, i) => (
                <div key={t} style={{ padding: '6px 0', fontSize: '0.78rem', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', gap: 6 }}>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>#{i + 1}</span> {t}
                </div>
              ))}
            </div>
            <div className="card" style={{ padding: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: 12 }}>👥 Suggested Groups</div>
              {groups.map(g => {
                const meta = TYPE_LABELS[g.type] || { label: g.type, icon: '📋', color: '#888' };
                return (
                  <div key={g._id} style={{ padding: '10px', background: 'var(--bg-primary)', borderRadius: 'var(--radius-sm)', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.82rem' }}>{g.name}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: 6 }}>{meta.icon} {meta.label} • {g.members?.length} members</div>
                    <button className="btn btn-outline" style={{ fontSize: '0.72rem', padding: '4px 12px' }}>Join</button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'groups' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
          {groups.map(g => {
            const meta = TYPE_LABELS[g.type] || { label: g.type, icon: '📋', color: '#888' };
            return (
              <div key={g._id} className="card" style={{ padding: '20px', transition: 'transform 0.2s' }}
                onMouseEnter={ev => { ev.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={ev => { ev.currentTarget.style.transform = ''; }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ background: meta.color + '22', color: meta.color, padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{meta.icon} {meta.label}</span>
                  {g.is_public ? <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>Public</span> : <span className="badge badge-warning" style={{ fontSize: '0.65rem' }}>Private</span>}
                </div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{g.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: 12 }}>📍 {g.district} • 🌾 {g.crop_focus}</div>
                <div style={{ display: 'flex', gap: 16, marginBottom: 12, fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                  <span>👥 {g.members?.length} members</span>
                  <span>💬 {g.post_count} posts</span>
                </div>
                <button className="btn btn-primary" style={{ width: '100%', padding: '8px', fontSize: '0.82rem' }}>Join Group</button>
              </div>
            );
          })}
        </div>
      )}

      {activeTab === 'connections' && (
        <div className="card" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 16 }}>Connection Requests</div>
          {connections.map(c => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>👨‍🌾</div>
                <div>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Farmer #{c.requester_id} → #{c.receiver_id}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{c.connected_at ? `Connected ${new Date(c.connected_at).toLocaleDateString('en-IN')}` : 'Pending approval'}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {c.status === 'pending' && <button className="btn btn-primary" style={{ padding: '6px 14px', fontSize: '0.78rem' }}>Accept</button>}
                <span className={`badge ${c.status === 'accepted' ? 'badge-success' : 'badge-warning'}`}>{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
