import React, { useState } from 'react';
import { useCommunityFeed, ROLE_COLORS, ROLE_ICONS, timeAgo } from '../lib/hooks/useCommunityFeed';

const STATUS_COLORS = { pending:'#f59e0b', approved:'#22c55e', featured:'#eab308', rejected:'#ef4444' };

export default function AdminFeedModeration() {
  const feed = useCommunityFeed();
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [rejectNote, setRejectNote] = useState('');
  const [promoPriority, setPromoPriority] = useState(5);

  const filtered = feed.allPosts.filter(p => filter === 'all' || p.status === filter);
  const counts = { pending: feed.allPosts.filter(p=>p.status==='pending').length, approved: feed.allPosts.filter(p=>p.status==='approved').length, featured: feed.allPosts.filter(p=>p.status==='featured').length, rejected: feed.allPosts.filter(p=>p.status==='rejected').length };

  const toggleSelect = (id) => setSelectedIds(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const bulkAction = async (status) => { for (const id of selectedIds) await feed.updatePostStatus(id, status); setSelectedIds(new Set()); };

  const S = {
    card: { background:'rgba(10,25,10,0.75)', border:'1px solid rgba(100,220,100,0.12)', borderRadius:12, overflow:'hidden', cursor:'pointer', position:'relative' },
    statCard: (c) => ({ flex:1, padding:'16px', borderRadius:12, background:'rgba(10,25,10,0.6)', border:`1px solid ${c}33`, textAlign:'center' }),
    badge: (s) => ({ fontSize:'0.68rem', padding:'2px 8px', borderRadius:8, background:`${STATUS_COLORS[s]}22`, color:STATUS_COLORS[s], fontWeight:600 }),
    btn: (c) => ({ padding:'8px 14px', background:`${c}22`, color:c, border:`1px solid ${c}44`, borderRadius:8, cursor:'pointer', fontSize:'0.8rem', fontWeight:600 }),
  };

  return (
    <div style={{padding:'20px',minHeight:'100vh'}}>
      <h1 style={{fontSize:'1.4rem',fontWeight:800,color:'#fff',marginBottom:20}}>📋 Feed Moderation</h1>

      {/* Stats */}
      <div style={{display:'flex',gap:12,marginBottom:20,flexWrap:'wrap'}}>
        {Object.entries(counts).map(([k,v]) => (
          <div key={k} style={S.statCard(STATUS_COLORS[k])}>
            <div style={{fontSize:'1.5rem',fontWeight:800,color:STATUS_COLORS[k]}}>{v}</div>
            <div style={{fontSize:'0.78rem',color:'#9ca3af',textTransform:'capitalize'}}>{k}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{display:'flex',gap:8,marginBottom:16,flexWrap:'wrap'}}>
        {['all','pending','approved','featured','rejected'].map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{padding:'8px 16px',borderRadius:20,border:`1px solid ${filter===f?'#22c55e':'rgba(255,255,255,0.12)'}`,background:filter===f?'rgba(34,197,94,0.15)':'transparent',color:filter===f?'#22c55e':'#9ca3af',cursor:'pointer',fontSize:'0.82rem',fontWeight:filter===f?700:400,textTransform:'capitalize'}}>
            {f} {f!=='all' ? `(${counts[f]||0})` : `(${feed.allPosts.length})`}
          </button>
        ))}
      </div>

      {/* Bulk actions */}
      {selectedIds.size > 0 && (
        <div style={{display:'flex',gap:8,marginBottom:16,padding:'12px 16px',background:'rgba(34,197,94,0.08)',borderRadius:12,alignItems:'center',flexWrap:'wrap'}}>
          <span style={{color:'#fff',fontSize:'0.85rem',fontWeight:600}}>{selectedIds.size} selected</span>
          <button onClick={() => bulkAction('approved')} style={S.btn('#22c55e')}>✅ Approve All</button>
          <button onClick={() => bulkAction('featured')} style={S.btn('#eab308')}>⭐ Feature All</button>
          <button onClick={() => bulkAction('rejected')} style={S.btn('#ef4444')}>❌ Reject All</button>
          <button onClick={async () => { for (const id of selectedIds) await feed.deletePost(id); setSelectedIds(new Set()); }} style={S.btn('#ef4444')}>🗑️ Delete</button>
          <button onClick={() => setSelectedIds(new Set())} style={{...S.btn('#9ca3af'),marginLeft:'auto'}}>Clear</button>
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:selected?'1fr 400px':'1fr',gap:20}}>
        {/* Grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))',gap:12,alignContent:'start'}}>
          {filtered.map(p => {
            const rc = ROLE_COLORS[p.user_role] || '#22c55e';
            return (
              <div key={p.id} style={{...S.card,border:selected?.id===p.id?'2px solid #22c55e':selectedIds.has(p.id)?'2px solid #3b82f6':S.card.border}} onClick={() => setSelected(p)}>
                <div style={{position:'relative'}}>
                  <img src={p.thumbnail_url||p.media_urls?.[0]} alt="" style={{width:'100%',height:160,objectFit:'cover'}} onError={e=>e.target.src='https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=400'} />
                  {(p.media_type==='reel'||p.media_type==='short_video') && <div style={{position:'absolute',top:8,right:8,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:'0.7rem',padding:'2px 6px',borderRadius:4}}>🎬</div>}
                  <input type="checkbox" checked={selectedIds.has(p.id)} onChange={(e) => { e.stopPropagation(); toggleSelect(p.id); }} onClick={e=>e.stopPropagation()} style={{position:'absolute',top:8,left:8,width:18,height:18,cursor:'pointer'}} />
                </div>
                <div style={{padding:'10px 12px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:6,marginBottom:4}}>
                    <span style={{fontWeight:600,color:'#fff',fontSize:'0.82rem',flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.user_name}</span>
                    <span style={{fontSize:'0.65rem',padding:'1px 6px',borderRadius:6,background:`${rc}22`,color:rc}}>{p.user_role}</span>
                  </div>
                  <div style={{fontSize:'0.72rem',color:'#9ca3af',marginBottom:6,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.user_district} · {(p.caption||'').slice(0,40)}</div>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={S.badge(p.status)}>{p.status}</span>
                    <span style={{fontSize:'0.68rem',color:'#6b7280'}}>{timeAgo(p.created_at)}</span>
                  </div>
                  <div style={{display:'flex',gap:4,marginTop:8}}>
                    <button onClick={e=>{e.stopPropagation();feed.updatePostStatus(p.id,'approved')}} style={{...S.btn('#22c55e'),padding:'4px 8px',fontSize:'0.7rem'}}>✅</button>
                    <button onClick={e=>{e.stopPropagation();feed.updatePostStatus(p.id,'featured')}} style={{...S.btn('#eab308'),padding:'4px 8px',fontSize:'0.7rem'}}>⭐</button>
                    <button onClick={e=>{e.stopPropagation();feed.updatePostStatus(p.id,'rejected')}} style={{...S.btn('#ef4444'),padding:'4px 8px',fontSize:'0.7rem'}}>❌</button>
                    <button onClick={e=>{e.stopPropagation();feed.deletePost(p.id)}} style={{...S.btn('#6b7280'),padding:'4px 8px',fontSize:'0.7rem'}}>🗑️</button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Detail Panel */}
        {selected && (
          <div style={{background:'rgba(10,25,10,0.8)',border:'1px solid rgba(100,220,100,0.15)',borderRadius:16,padding:20,position:'sticky',top:20,maxHeight:'calc(100vh - 40px)',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',marginBottom:16}}>
              <h3 style={{fontSize:'1rem',fontWeight:700,color:'#fff',margin:0}}>Post Details</h3>
              <button onClick={() => setSelected(null)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'1.1rem'}}>✕</button>
            </div>
            <img src={selected.media_urls?.[0]||selected.thumbnail_url} alt="" style={{width:'100%',borderRadius:12,marginBottom:16,maxHeight:300,objectFit:'cover'}} onError={e=>e.target.src='https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=600'} />
            <div style={{marginBottom:16}}>
              {[['User',selected.user_name],['Role',selected.user_role],['District',selected.user_district],['Village',selected.user_village||'—'],['Type',selected.media_type],['Category',selected.category],['Visibility',selected.visibility],['Status',selected.status],['Likes',selected.like_count],['Comments',selected.comment_count],['Views',selected.view_count],['Created',new Date(selected.created_at).toLocaleString()]].map(([k,v]) => (
                <div key={k} style={{display:'flex',justifyContent:'space-between',padding:'6px 0',borderBottom:'1px solid rgba(255,255,255,0.05)',fontSize:'0.82rem'}}>
                  <span style={{color:'#9ca3af'}}>{k}</span><span style={{color:'#fff',fontWeight:500}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{color:'#d1d5db',fontSize:'0.85rem',marginBottom:16,lineHeight:1.5}}>{selected.caption}</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              <button onClick={() => feed.updatePostStatus(selected.id,'approved').then(() => setSelected({...selected,status:'approved'}))} style={S.btn('#22c55e')}>✅ Approve</button>
              <div style={{display:'flex',gap:8,alignItems:'center'}}>
                <button onClick={() => feed.updatePostStatus(selected.id,'featured').then(() => setSelected({...selected,status:'featured'}))} style={{...S.btn('#eab308'),flex:1}}>⭐ Feature</button>
                <input type="range" min="1" max="10" value={promoPriority} onChange={e => setPromoPriority(e.target.value)} style={{flex:1}} />
                <span style={{color:'#eab308',fontSize:'0.8rem',fontWeight:600}}>{promoPriority}</span>
              </div>
              <div>
                <textarea value={rejectNote} onChange={e => setRejectNote(e.target.value)} placeholder="Rejection reason..." style={{width:'100%',padding:'10px 12px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:'#fff',fontSize:'0.85rem',resize:'none',height:60,outline:'none',marginBottom:6}} />
                <button onClick={() => feed.updatePostStatus(selected.id,'rejected',rejectNote).then(() => setSelected({...selected,status:'rejected'}))} style={S.btn('#ef4444')}>❌ Reject</button>
              </div>
              <button onClick={() => { feed.deletePost(selected.id); setSelected(null); }} style={S.btn('#ef4444')}>🗑️ Delete Post</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
