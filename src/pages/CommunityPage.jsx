import React, { useState } from 'react';

const INITIAL_POSTS = [
  { id: 1, author: 'Ravi Kumar', avatar: '👨‍🌾', village: 'Guntur', time: '2h ago', content: 'My paddy nursery is showing yellowing leaves. Anyone experienced this in Kharif season? Using NPK 20:20:20.', likes: 14, helpful: 6, replies: [
    { id: 'r1', author: 'Lakshmi Devi', avatar: '👩‍🌾', time: '1h ago', content: 'Could be iron deficiency. Try foliar spray of FeSO4 0.5%. Worked for me last season.', likes: 8 },
    { id: 'r2', author: 'Suresh Reddy', avatar: '👨‍🌾', time: '45m ago', content: 'Check water logging too. Yellowing can be caused by root rot in standing water.', likes: 5 },
  ]},
  { id: 2, author: 'Anitha Bai', avatar: '👩‍🌾', village: 'Anantapur', time: '5h ago', content: 'Successfully harvested 38Q/acre groundnut using drip irrigation + mulching. Happy to share my approach!', likes: 42, helpful: 18, replies: [
    { id: 'r3', author: 'Venkat Rao', avatar: '👨‍🌾', time: '3h ago', content: 'Amazing yield! What variety did you use? And which mulch material?', likes: 3 },
  ]},
  { id: 3, author: 'Krishna Murthy', avatar: '👨‍🌾', village: 'Kurnool', time: '1d ago', content: 'Cotton prices went up by ₹200 at Adoni APMC today. If anyone is holding stock, consider selling this week.', likes: 28, helpful: 12, replies: [] },
  { id: 4, author: 'Padma Kumari', avatar: '👩‍🌾', village: 'Chittoor', time: '2d ago', content: 'PM-KISAN installment credited today! ₹2,000 received. Has everyone checked their bank accounts?', likes: 35, helpful: 8, replies: [] },
];

const styles = {
  input: { width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '9px 12px', outline: 'none', fontSize: '0.85rem' },
  badge: (bg, c) => ({ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 999, background: bg, color: c, fontWeight: 600, border: 'none', cursor: 'pointer' }),
  actionBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 14px', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' },
};

export default function CommunityPage() {
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [expandedPost, setExpandedPost] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [followedAuthors, setFollowedAuthors] = useState([]);

  function submitPost() {
    if (!newPost.trim()) return;
    setPosts(prev => [{ id: Date.now(), author: 'You', avatar: '👤', village: 'Your Village', time: 'Just now', content: newPost, likes: 0, helpful: 0, replies: [] }, ...prev]);
    setNewPost('');
  }
  function toggleLike(postId) { setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: p.likes + 1 } : p)); }
  function toggleHelpful(postId) { setPosts(prev => prev.map(p => p.id === postId ? { ...p, helpful: p.helpful + 1 } : p)); }
  function submitReply(postId) {
    if (!replyText.trim()) return;
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, replies: [...p.replies, { id: `r-${Date.now()}`, author: 'You', avatar: '👤', time: 'Just now', content: replyText, likes: 0 }] } : p));
    setReplyText('');
  }
  function toggleFollow(a) { setFollowedAuthors(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]); }

  return (
    <div className="animated">
      <div className="section-header">
        <div>
          <div className="section-title">💬 Community Forum</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2 }}>Share knowledge, ask questions, connect with fellow farmers</div>
        </div>
      </div>

      {/* Stats */}
      <div className="card" style={{ padding: 20, marginBottom: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Posts</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#60a5fa' }}>{posts.length}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Replies</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#34d399' }}>{posts.reduce((s, p) => s + p.replies.length, 0)}</div>
          </div>
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Following</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#fbbf24' }}>{followedAuthors.length}</div>
          </div>
        </div>
      </div>

      {/* New Post */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <textarea style={{ ...styles.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="💡 Share a tip, ask a question, or post an update..." />
        <button onClick={submitPost} style={{ marginTop: 10, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>📝 Post</button>
      </div>

      {/* Posts */}
      {posts.map(p => (
        <div key={p.id} className="card" style={{ padding: 18, marginBottom: 12 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '1.6rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>{p.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.author}</span>
                <button onClick={() => toggleFollow(p.author)} style={styles.badge(followedAuthors.includes(p.author) ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', followedAuthors.includes(p.author) ? '#34d399' : '#93c5fd')}>
                  {followedAuthors.includes(p.author) ? '✓ Following' : '+ Follow'}
                </button>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {p.village} • {p.time}</div>
            </div>
          </div>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14, paddingLeft: 52 }}>{p.content}</p>
          <div style={{ display: 'flex', gap: 8, paddingLeft: 52 }}>
            <button onClick={() => toggleLike(p.id)} style={styles.actionBtn}>👍 {p.likes}</button>
            <button onClick={() => toggleHelpful(p.id)} style={styles.actionBtn}>✅ {p.helpful}</button>
            <button onClick={() => setExpandedPost(expandedPost === p.id ? null : p.id)} style={styles.actionBtn}>💬 {p.replies.length}</button>
          </div>

          {expandedPost === p.id && (
            <div style={{ marginTop: 14, marginLeft: 52, paddingLeft: 16, borderLeft: '2px solid rgba(16,185,129,0.2)' }}>
              {p.replies.map(r => (
                <div key={r.id} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: '0.78rem', display: 'flex', gap: 6, alignItems: 'center' }}>
                    <span style={{ fontSize: '1rem' }}>{r.avatar}</span>
                    <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{r.author}</span>
                    <span style={{ color: 'var(--text-muted)' }}>• {r.time}</span>
                  </div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', margin: '4px 0 0 28px', lineHeight: 1.5 }}>{r.content}</p>
                </div>
              ))}
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <input style={{ ...styles.input, flex: 1 }} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." />
                <button onClick={() => submitReply(p.id)} style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Reply</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
