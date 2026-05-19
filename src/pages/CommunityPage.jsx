import React, { useState } from 'react';
import { useLanguage } from '../lib/i18n/LanguageContext';

const INITIAL_POSTS = [
  { id: 1, type: 'question', crop: 'Paddy', author: 'Ravi Kumar', avatar: '👨‍🌾', village: 'Guntur', time: '2h ago', content: 'My paddy nursery is showing yellowing leaves. Anyone experienced this in Kharif season? Using NPK 20:20:20.', likes: 14, helpful: 6, bookmarked: false, replies: [
    { id: 'r1', author: 'Lakshmi Devi', avatar: '👩‍🌾', time: '1h ago', content: 'Could be iron deficiency. Try foliar spray of FeSO4 0.5%. Worked for me last season.', likes: 8 },
    { id: 'r2', author: 'Suresh Reddy', avatar: '👨‍🌾', time: '45m ago', content: 'Check water logging too. Yellowing can be caused by root rot in standing water.', likes: 5 },
  ]},
  { id: 2, type: 'tip', crop: 'Groundnut', author: 'Anitha Bai', avatar: '👩‍🌾', village: 'Anantapur', time: '5h ago', content: 'Successfully harvested 38Q/acre groundnut using drip irrigation + mulching. Happy to share my approach!', likes: 42, helpful: 18, bookmarked: false, replies: [
    { id: 'r3', author: 'Venkat Rao', avatar: '👨‍🌾', time: '3h ago', content: 'Amazing yield! What variety did you use? And which mulch material?', likes: 3 },
  ]},
  { id: 3, type: 'update', crop: 'Cotton', author: 'Krishna Murthy', avatar: '👨‍🌾', village: 'Kurnool', time: '1d ago', content: 'Cotton prices went up by ₹200 at Adoni APMC today. If anyone is holding stock, consider selling this week.', likes: 28, helpful: 12, bookmarked: false, replies: [] },
  { id: 4, type: 'update', crop: 'General', author: 'Padma Kumari', avatar: '👩‍🌾', village: 'Chittoor', time: '2d ago', content: 'PM-KISAN installment credited today! ₹2,000 received. Has everyone checked their bank accounts?', likes: 35, helpful: 8, bookmarked: false, replies: [] },
  { id: 5, type: 'question', crop: 'Cotton', author: 'Ramesh Goud', avatar: '👨‍🌾', village: 'Guntur', time: '3d ago', content: 'Best variety of cotton for Kharif in Guntur district? Looking for bollworm-resistant options.', likes: 19, helpful: 7, bookmarked: false, replies: [] },
  { id: 6, type: 'tip', crop: 'Paddy', author: 'Sita Lakshmi', avatar: '👩‍🌾', village: 'Krishna', time: '3d ago', content: '💡 Use neem oil spray for natural pest control — 5ml per litre, spray early morning. Chemical-free and effective!', likes: 56, helpful: 24, bookmarked: false, replies: [] },
];

const CROPS = ['All', 'Paddy', 'Cotton', 'Groundnut', 'General'];
const DISTRICTS = ['All', 'Guntur', 'Anantapur', 'Kurnool', 'Chittoor', 'Krishna'];
const TYPES = ['All', 'Questions ❓', 'Tips 💡', 'Updates 📢'];
const SORTS = ['Newest First', 'Trending', 'Most Helpful'];

const TYPE_BADGES = { question: { icon: '❓', label: 'Question', bg: '#3b82f620', color: '#60a5fa' }, tip: { icon: '💡', label: 'Tip', bg: '#f59e0b20', color: '#fbbf24' }, update: { icon: '📢', label: 'Update', bg: '#10b98120', color: '#34d399' } };

const S = {
  input: { width: '100%', borderRadius: 10, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '9px 12px', outline: 'none', fontSize: '0.85rem' },
  sel: { borderRadius: 8, border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(8,12,20,0.65)', color: 'var(--text-primary)', padding: '7px 10px', fontSize: '0.78rem', outline: 'none', cursor: 'pointer' },
  actionBtn: { background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '7px 14px', color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', transition: 'all 0.15s' },
  pill: (active) => ({ padding: '6px 14px', borderRadius: 999, border: 'none', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', background: active ? 'var(--green-primary)' : 'rgba(255,255,255,0.06)', color: active ? '#fff' : 'var(--text-muted)', transition: 'all 0.15s' }),
};

export default function CommunityPage() {
  const { t, tx } = useLanguage();
  const [posts, setPosts] = useState(INITIAL_POSTS);
  const [newPost, setNewPost] = useState('');
  const [postType, setPostType] = useState('question');
  const [postCrop, setPostCrop] = useState('Paddy');
  const [expandedPost, setExpandedPost] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [followedAuthors, setFollowedAuthors] = useState([]);
  const [toast, setToast] = useState('');
  // Filters
  const [filterCrop, setFilterCrop] = useState('All');
  const [filterDistrict, setFilterDistrict] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [sortBy, setSortBy] = useState('Newest First');
  // Report
  const [reportPostId, setReportPostId] = useState(null);
  const [reportReason, setReportReason] = useState('Spam');
  const [menuPostId, setMenuPostId] = useState(null);

  function flash(m) { setToast(m); setTimeout(() => setToast(''), 2500); }

  function submitPost() {
    if (!newPost.trim()) return;
    setPosts(prev => [{ id: Date.now(), type: postType, crop: postCrop, author: 'You', avatar: '👤', village: 'Your Village', time: 'Just now', content: newPost, likes: 0, helpful: 0, bookmarked: false, replies: [] }, ...prev]);
    setNewPost('');
    flash('✅ Post published!');
  }
  function toggleLike(id) { setPosts(prev => prev.map(p => p.id === id ? { ...p, likes: p.likes + 1 } : p)); }
  function toggleHelpful(id) { setPosts(prev => prev.map(p => p.id === id ? { ...p, helpful: p.helpful + 1 } : p)); flash('👍 +30 AgriCoins earned by author!'); }
  function toggleBookmark(id) { setPosts(prev => prev.map(p => p.id === id ? { ...p, bookmarked: !p.bookmarked } : p)); flash('🔖 Bookmark toggled'); }
  function sharePost(p) { const text = `${p.author}: ${p.content.slice(0, 100)}... — RythuSphere`; window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank'); flash('📤 Shared via WhatsApp'); }
  function submitReply(id) {
    if (!replyText.trim()) return;
    setPosts(prev => prev.map(p => p.id === id ? { ...p, replies: [...p.replies, { id: `r-${Date.now()}`, author: 'You', avatar: '👤', time: 'Just now', content: replyText, likes: 0 }] } : p));
    setReplyText('');
    flash('💬 Reply posted!');
  }
  function toggleFollow(a) { setFollowedAuthors(prev => prev.includes(a) ? prev.filter(x => x !== a) : [...prev, a]); }
  function submitReport() { flash(`🚩 Report submitted: "${reportReason}" — Admin will review.`); setReportPostId(null); setMenuPostId(null); }

  // Filter & Sort
  let filtered = posts.filter(p => {
    if (filterCrop !== 'All' && p.crop !== filterCrop) return false;
    if (filterDistrict !== 'All' && p.village !== filterDistrict) return false;
    if (filterType === 'Questions ❓' && p.type !== 'question') return false;
    if (filterType === 'Tips 💡' && p.type !== 'tip') return false;
    if (filterType === 'Updates 📢' && p.type !== 'update') return false;
    return true;
  });
  if (sortBy === 'Trending') filtered.sort((a, b) => (b.likes + b.helpful) - (a.likes + a.helpful));
  if (sortBy === 'Most Helpful') filtered.sort((a, b) => b.helpful - a.helpful);

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
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
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
          <div style={{ textAlign: 'center', padding: 14, borderRadius: 12, background: 'rgba(139,92,246,0.08)', border: '1px solid rgba(139,92,246,0.15)' }}>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>Bookmarks</div>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#a78bfa' }}>{posts.filter(p => p.bookmarked).length}</div>
          </div>
        </div>
      </div>

      {/* New Post */}
      <div className="card" style={{ padding: 18, marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
          {Object.entries(TYPE_BADGES).map(([k, v]) => (
            <button key={k} onClick={() => setPostType(k)} style={S.pill(postType === k)}>{v.icon} {v.label}</button>
          ))}
          <select value={postCrop} onChange={e => setPostCrop(e.target.value)} style={S.sel}>
            {CROPS.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <textarea style={{ ...S.input, minHeight: 70, resize: 'vertical', fontFamily: 'inherit' }} value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="💡 Share a tip, ask a question, or post an update..." />
        <button onClick={submitPost} style={{ marginTop: 10, padding: '10px 24px', borderRadius: 10, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer' }}>📝 Post</button>
      </div>

      {/* Filters */}
      <div className="card" style={{ padding: '12px 18px', marginBottom: 16, display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>🔍 Filter:</span>
        <select value={filterCrop} onChange={e => setFilterCrop(e.target.value)} style={S.sel}>{CROPS.map(c => <option key={c}>{c}</option>)}</select>
        <select value={filterDistrict} onChange={e => setFilterDistrict(e.target.value)} style={S.sel}>{DISTRICTS.map(d => <option key={d}>{d}</option>)}</select>
        <div style={{ display: 'flex', gap: 4 }}>{TYPES.map(t => <button key={t} onClick={() => setFilterType(t)} style={S.pill(filterType === t)}>{t}</button>)}</div>
        <span style={{ marginLeft: 'auto', fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>Sort:</span>
        {SORTS.map(s => <button key={s} onClick={() => setSortBy(s)} style={S.pill(sortBy === s)}>{s}</button>)}
      </div>

      {/* Posts */}
      {filtered.length === 0 && <div className="card" style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)' }}>No posts match your filters.</div>}
      {filtered.map(p => {
        const badge = TYPE_BADGES[p.type] || TYPE_BADGES.update;
        return (
        <div key={p.id} className="card" style={{ padding: 18, marginBottom: 12, position: 'relative' }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <span style={{ fontSize: '1.6rem', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.04)', borderRadius: 12 }}>{p.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{p.author}</span>
                  <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, background: badge.bg, color: badge.color, fontWeight: 600 }}>{badge.icon} {badge.label}</span>
                  {p.crop !== 'General' && <span style={{ fontSize: '0.65rem', padding: '2px 8px', borderRadius: 999, background: 'rgba(139,92,246,0.1)', color: '#a78bfa', fontWeight: 600 }}>🌱 {p.crop}</span>}
                </div>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => toggleFollow(p.author)} style={{ fontSize: '0.68rem', padding: '3px 10px', borderRadius: 999, background: followedAuthors.includes(p.author) ? 'rgba(16,185,129,0.15)' : 'rgba(59,130,246,0.15)', color: followedAuthors.includes(p.author) ? '#34d399' : '#93c5fd', fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                    {followedAuthors.includes(p.author) ? '✓ Following' : '+ Follow'}
                  </button>
                  <button onClick={() => setMenuPostId(menuPostId === p.id ? null : p.id)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '1.1rem', padding: '2px 6px' }}>⋯</button>
                </div>
              </div>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: 2 }}>📍 {p.village} • {p.time}</div>
            </div>
          </div>
          {/* Context menu */}
          {menuPostId === p.id && (
            <div style={{ position: 'absolute', right: 16, top: 56, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 8, zIndex: 10, boxShadow: '0 8px 24px rgba(0,0,0,0.3)', minWidth: 160 }}>
              <button onClick={() => { sharePost(p); setMenuPostId(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', borderRadius: 6 }}>📤 Share via WhatsApp</button>
              <button onClick={() => { toggleBookmark(p.id); setMenuPostId(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', color: 'var(--text-primary)', fontSize: '0.82rem', cursor: 'pointer', borderRadius: 6 }}>{p.bookmarked ? '🔖 Remove Bookmark' : '🔖 Bookmark'}</button>
              <hr style={{ border: 'none', borderTop: '1px solid var(--border)', margin: '4px 0' }} />
              <button onClick={() => { setReportPostId(p.id); setMenuPostId(null); }} style={{ display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px', border: 'none', background: 'none', color: '#ef4444', fontSize: '0.82rem', cursor: 'pointer', borderRadius: 6 }}>🚩 Report Post</button>
            </div>
          )}
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 14, paddingLeft: 52 }}>{p.content}</p>
          <div style={{ display: 'flex', gap: 8, paddingLeft: 52 }}>
            <button onClick={() => toggleLike(p.id)} style={S.actionBtn}>👍 {p.likes}</button>
            <button onClick={() => toggleHelpful(p.id)} style={S.actionBtn}>✅ {p.helpful}</button>
            <button onClick={() => setExpandedPost(expandedPost === p.id ? null : p.id)} style={S.actionBtn}>💬 {p.replies.length}</button>
            <button onClick={() => toggleBookmark(p.id)} style={{ ...S.actionBtn, color: p.bookmarked ? '#f59e0b' : 'var(--text-secondary)' }}>{p.bookmarked ? '🔖' : '☆'}</button>
            <button onClick={() => sharePost(p)} style={S.actionBtn}>📤</button>
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
                <input style={{ ...S.input, flex: 1 }} value={replyText} onChange={e => setReplyText(e.target.value)} placeholder="Write a reply..." />
                <button onClick={() => submitReply(p.id)} style={{ padding: '9px 18px', borderRadius: 10, background: 'linear-gradient(135deg, #059669, #10b981)', color: '#fff', border: 'none', fontWeight: 700, fontSize: '0.78rem', cursor: 'pointer' }}>Reply</button>
              </div>
            </div>
          )}
        </div>
      );})}

      {/* Report Modal */}
      {reportPostId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 9998, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setReportPostId(null)}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 16, padding: 28, width: 380, maxWidth: '90vw' }}>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 16 }}>🚩 Report Post</div>
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'block', marginBottom: 4 }}>Reason</label>
              <select value={reportReason} onChange={e => setReportReason(e.target.value)} style={{ ...S.sel, width: '100%' }}>
                <option>Spam</option><option>Harassment</option><option>Misinformation</option><option>Inappropriate Content</option><option>Other</option>
              </select>
            </div>
            <button className="btn btn-primary" onClick={submitReport} style={{ width: '100%', padding: 12, fontSize: '0.9rem', background: '#ef4444' }}>🚩 Submit Report</button>
          </div>
        </div>
      )}

      {toast && <div style={{ position: 'fixed', bottom: 24, right: 24, background: 'linear-gradient(135deg,#1e293b,#0f172a)', border: '1px solid rgba(34,197,94,0.3)', borderRadius: 14, padding: '14px 24px', color: '#4ade80', fontWeight: 600, zIndex: 9999, boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>{toast}</div>}
    </div>
  );
}
