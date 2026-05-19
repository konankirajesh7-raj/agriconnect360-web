import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCommunityFeed, ROLE_COLORS, ROLE_ICONS, timeAgo } from '../lib/hooks/useCommunityFeed';
import PostUploadModal from '../components/PostUploadModal';
import { useLanguage } from '../lib/i18n/LanguageContext';

const RC = ROLE_COLORS, RI = ROLE_ICONS;

/* ── PostCard ── */
function PostCard({ post, feed }) {
  const [expanded, setExpanded] = useState(false);
  const [carouselIdx, setCarouselIdx] = useState(0);
  const [muted, setMuted] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const [likeAnim, setLikeAnim] = useState(false);
  const videoRef = useRef(null);
  const cardRef = useRef(null);
  const isLiked = feed.myLikes.has(post.id);
  const isSaved = feed.mySaves.has(post.id);
  const rc = RC[post.user_role] || '#22c55e';
  const isVideo = post.media_type === 'reel' || post.media_type === 'short_video';
  const isCarousel = post.media_type === 'carousel' && post.media_urls?.length > 1;
  const urls = post.media_urls || [];

  useEffect(() => {
    if (!isVideo || !videoRef.current || !cardRef.current) return;
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { videoRef.current?.play().catch(() => {}); feed.incrementViews(post.id); }
      else videoRef.current?.pause();
    }, { threshold: 0.8 });
    obs.observe(cardRef.current);
    return () => obs.disconnect();
  }, [isVideo]);

  const handleLike = () => {
    setLikeAnim(true); setTimeout(() => setLikeAnim(false), 400);
    feed.likePost(post.id);
  };
  const handleShare = () => {
    if (navigator.share) navigator.share({ title: post.caption, url: window.location.href });
    else navigator.clipboard?.writeText(window.location.href);
  };
  const handleWhatsApp = () => window.open(`https://wa.me/?text=${encodeURIComponent(post.caption + ' — RythuSphere')}`);

  return (
    <div ref={cardRef} style={{background:'rgba(10,25,10,0.75)',backdropFilter:'blur(12px)',border:`1px solid rgba(100,220,100,0.12)`,borderLeft:`4px solid ${rc}`,borderRadius:16,marginBottom:16,overflow:'hidden',animation:'fadeUp 0.4s ease'}}>
      {/* Header */}
      <div style={{display:'flex',alignItems:'center',padding:'14px 16px',gap:12}}>
        <div style={{width:42,height:42,borderRadius:'50%',border:`2.5px solid ${rc}`,background:'rgba(255,255,255,0.08)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.2rem',flexShrink:0}}>
          {RI[post.user_role] || '👤'}
        </div>
        <div style={{flex:1,minWidth:0}}>
          <div style={{display:'flex',alignItems:'center',gap:8}}>
            <span style={{fontWeight:700,color:'#fff',fontSize:'0.92rem'}}>{post.user_name}</span>
            <span style={{fontSize:'0.65rem',padding:'2px 8px',borderRadius:10,background:`${rc}22`,color:rc,fontWeight:600}}>{RI[post.user_role]} {post.user_role}</span>
          </div>
          <div style={{fontSize:'0.75rem',color:'#9ca3af'}}>{post.user_district}{post.user_mandal ? ` · ${post.user_mandal}` : ''}{post.user_village && post.user_village !== post.user_mandal ? ` · ${post.user_village}` : ''} · {timeAgo(post.created_at)}</div>
        </div>
        {post.status === 'featured' && <span style={{fontSize:'1.1rem'}} title="Featured">⭐</span>}
        <div style={{position:'relative'}}>
          <button onClick={() => setShowMenu(!showMenu)} style={{background:'none',border:'none',color:'#9ca3af',cursor:'pointer',fontSize:'1.2rem',padding:4}}>⋮</button>
          {showMenu && (
            <div style={{position:'absolute',right:0,top:28,background:'rgba(15,30,15,0.95)',border:'1px solid rgba(100,220,100,0.15)',borderRadius:10,padding:6,zIndex:50,minWidth:140}} onMouseLeave={() => setShowMenu(false)}>
              {[['🔖 Save','save'],['📤 Share','share'],['⚠️ Report','report']].map(([l,a]) => (
                <div key={a} onClick={() => { setShowMenu(false); a==='save'?feed.savePost(post.id):a==='share'?handleShare():feed.reportPost(post.id,'inappropriate'); }}
                  style={{padding:'8px 12px',fontSize:'0.82rem',color:'#e5e7eb',cursor:'pointer',borderRadius:6,transition:'background 0.15s'}}
                  onMouseEnter={e => e.target.style.background='rgba(34,197,94,0.1)'} onMouseLeave={e => e.target.style.background='transparent'}>{l}</div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sponsored label */}
      {post.is_promotion && <div style={{padding:'0 16px 8px'}}><span style={{fontSize:'0.7rem',color:rc,fontWeight:600,background:`${rc}15`,padding:'3px 10px',borderRadius:8}}>📢 Sponsored</span></div>}

      {/* Media */}
      <div style={{position:'relative',background:'#000',maxHeight:500,overflow:'hidden'}}>
        {isVideo ? (
          <div onClick={() => setMuted(!muted)} style={{cursor:'pointer',position:'relative'}}>
            <img src={urls[0]} alt="" style={{width:'100%',maxHeight:500,objectFit:'cover'}} onError={e => e.target.src='https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800'} />
            <div style={{position:'absolute',top:10,right:10,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:'0.7rem',padding:'3px 8px',borderRadius:6}}>
              🎬 {post.duration_seconds ? `${Math.floor(post.duration_seconds/60)}:${String(post.duration_seconds%60).padStart(2,'0')}` : 'Reel'}
            </div>
            <div style={{position:'absolute',bottom:10,left:10,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:'0.75rem',padding:'3px 8px',borderRadius:6}}>
              {muted ? '🔇' : '🔊'}
            </div>
          </div>
        ) : isCarousel ? (
          <div style={{position:'relative'}}>
            <img src={urls[carouselIdx]} alt="" style={{width:'100%',maxHeight:500,objectFit:'cover'}} onError={e => e.target.src='https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800'} />
            {carouselIdx > 0 && <button onClick={() => setCarouselIdx(i => i-1)} style={{position:'absolute',left:8,top:'50%',transform:'translateY(-50%)',width:32,height:32,borderRadius:'50%',background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',cursor:'pointer',fontSize:'1rem'}}>‹</button>}
            {carouselIdx < urls.length-1 && <button onClick={() => setCarouselIdx(i => i+1)} style={{position:'absolute',right:8,top:'50%',transform:'translateY(-50%)',width:32,height:32,borderRadius:'50%',background:'rgba(0,0,0,0.5)',color:'#fff',border:'none',cursor:'pointer',fontSize:'1rem'}}>›</button>}
            <div style={{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',display:'flex',gap:5}}>
              {urls.map((_,i) => <div key={i} style={{width:i===carouselIdx?16:6,height:6,borderRadius:3,background:i===carouselIdx?'#22c55e':'rgba(255,255,255,0.4)',transition:'all 0.3s'}} />)}
            </div>
          </div>
        ) : (
          <img src={urls[0]} alt="" style={{width:'100%',maxHeight:500,objectFit:'cover'}} onError={e => e.target.src='https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800'} />
        )}
        {/* Category badge */}
        <div style={{position:'absolute',bottom:10,left:10,background:'rgba(0,0,0,0.65)',color:'#fff',fontSize:'0.7rem',padding:'3px 8px',borderRadius:6}}>{post.category?.replace('_',' ')}</div>
      </div>

      {/* Actions */}
      <div style={{display:'flex',alignItems:'center',padding:'10px 16px',gap:16}}>
        <button onClick={handleLike} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.3rem',transform:likeAnim?'scale(1.4)':'scale(1)',transition:'transform 0.2s',filter:isLiked?'none':'grayscale(0.5)'}}>
          {isLiked ? '❤️' : '🤍'}
        </button>
        <button style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>💬</button>
        <button onClick={handleShare} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>📤</button>
        <div style={{flex:1}} />
        <button onClick={handleWhatsApp} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.1rem'}}>📱</button>
        <button onClick={() => feed.savePost(post.id)} style={{background:'none',border:'none',cursor:'pointer',fontSize:'1.2rem'}}>
          {isSaved ? '🔖' : '🏷️'}
        </button>
      </div>

      {/* Stats */}
      <div style={{padding:'0 16px 6px',display:'flex',gap:14,fontSize:'0.78rem',color:'#9ca3af'}}>
        <span><b style={{color:'#fff'}}>{(post.like_count||0).toLocaleString()}</b> likes</span>
        <span><b style={{color:'#fff'}}>{post.comment_count||0}</b> comments</span>
        <span>{(post.view_count||0).toLocaleString()} views</span>
      </div>

      {/* Caption */}
      <div style={{padding:'4px 16px 14px'}}>
        <span style={{fontWeight:700,color:'#fff',fontSize:'0.88rem',marginRight:6}}>{post.user_name}</span>
        <span style={{color:'#d1d5db',fontSize:'0.85rem'}}>
          {expanded || (post.caption||'').length <= 120 ? post.caption : (post.caption||'').slice(0,120) + '...'}
        </span>
        {(post.caption||'').length > 120 && !expanded && (
          <span onClick={() => setExpanded(true)} style={{color:'#9ca3af',cursor:'pointer',fontSize:'0.82rem',marginLeft:4}}>See more</span>
        )}
        {post.tags?.length > 0 && (
          <div style={{display:'flex',flexWrap:'wrap',gap:6,marginTop:8}}>
            {post.tags.map(t => <span key={t} style={{fontSize:'0.72rem',color:'#22c55e',background:'rgba(34,197,94,0.1)',padding:'2px 8px',borderRadius:8}}>#{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── HorizontalSection ── */
function HSection({ title, posts, feed }) {
  if (!posts?.length) return null;
  return (
    <div style={{marginBottom:20}}>
      <h3 style={{fontSize:'1rem',fontWeight:700,color:'#fff',padding:'0 4px',marginBottom:10}}>{title}</h3>
      <div style={{display:'flex',gap:12,overflowX:'auto',paddingBottom:8,scrollbarWidth:'none'}}>
        {posts.slice(0,8).map(p => (
          <div key={p.id} style={{minWidth:200,maxWidth:200,background:'rgba(10,25,10,0.7)',borderRadius:12,overflow:'hidden',border:'1px solid rgba(100,220,100,0.1)',flexShrink:0}}>
            <img src={p.thumbnail_url || p.media_urls?.[0]} alt="" style={{width:200,height:140,objectFit:'cover'}} onError={e => e.target.src='https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=400'} />
            <div style={{padding:'8px 10px'}}>
              <div style={{fontSize:'0.78rem',fontWeight:600,color:'#fff',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.user_name}</div>
              <div style={{fontSize:'0.7rem',color:'#9ca3af',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{(p.caption||'').slice(0,40)}</div>
              <div style={{fontSize:'0.68rem',color:'#6b7280',marginTop:4}}>❤️ {p.like_count||0} · 👁️ {p.view_count||0}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── ReelsTab ── */
function ReelsTab({ reels, feed }) {
  const [current, setCurrent] = useState(0);
  const containerRef = useRef(null);
  const items = reels.length > 0 ? reels : feed.allPosts.slice(0, 6); // fallback to all posts as "reels"

  useEffect(() => {
    const el = containerRef.current; if (!el) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) setCurrent(Number(e.target.dataset.idx)); });
    }, { root: el, threshold: 0.7 });
    el.querySelectorAll('.reel-item').forEach(c => obs.observe(c));
    return () => obs.disconnect();
  }, [items.length]);

  if (!items.length) return <div style={{textAlign:'center',padding:'80px 20px',color:'#9ca3af'}}>No reels yet. Be the first! 🎬</div>;

  return (
    <div ref={containerRef} style={{height:'calc(100vh - 120px)',overflowY:'auto',scrollSnapType:'y mandatory',scrollbarWidth:'none'}}>
      {items.map((p, idx) => {
        const rc = RC[p.user_role] || '#22c55e';
        const isLiked = feed.myLikes.has(p.id);
        return (
          <div key={p.id} data-idx={idx} className="reel-item" style={{height:'calc(100vh - 120px)',scrollSnapAlign:'start',position:'relative',background:'#000',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <img src={p.media_urls?.[0] || p.thumbnail_url} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e => e.target.src='https://images.pexels.com/photos/2165688/pexels-photo-2165688.jpeg?auto=compress&w=800'} />
            {/* Gradient overlay */}
            <div style={{position:'absolute',bottom:0,left:0,right:0,height:'50%',background:'linear-gradient(transparent,rgba(0,0,0,0.85))'}} />
            {/* Right controls */}
            <div style={{position:'absolute',right:12,bottom:120,display:'flex',flexDirection:'column',gap:20,alignItems:'center'}}>
              {[
                [isLiked?'❤️':'🤍', p.like_count||0, () => feed.likePost(p.id)],
                ['💬', p.comment_count||0, null],
                ['📤', p.share_count||0, null],
                [feed.mySaves.has(p.id)?'🔖':'🏷️', '', () => feed.savePost(p.id)],
                ['📱', '', () => window.open(`https://wa.me/?text=${encodeURIComponent(p.caption||'')}`)],
              ].map(([icon, count, fn], i) => (
                <div key={i} onClick={fn} style={{textAlign:'center',cursor:fn?'pointer':'default'}}>
                  <div style={{fontSize:'1.5rem'}}>{icon}</div>
                  {count !== '' && <div style={{fontSize:'0.7rem',color:'#fff',marginTop:2}}>{count}</div>}
                </div>
              ))}
            </div>
            {/* Bottom info */}
            <div style={{position:'absolute',bottom:20,left:16,right:80}}>
              <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:8}}>
                <div style={{width:36,height:36,borderRadius:'50%',border:`2px solid ${rc}`,background:'rgba(255,255,255,0.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem'}}>{RI[p.user_role]||'👤'}</div>
                <div>
                  <div style={{fontWeight:700,color:'#fff',fontSize:'0.9rem'}}>{p.user_name}</div>
                  <div style={{fontSize:'0.7rem',color:'#ccc'}}>{p.user_district} · <span style={{color:rc}}>{p.user_role}</span></div>
                </div>
              </div>
              <div style={{color:'#e5e7eb',fontSize:'0.82rem',lineHeight:1.4}}>{(p.caption||'').slice(0,150)}</div>
              {p.tags?.length > 0 && <div style={{display:'flex',gap:6,marginTop:6,flexWrap:'wrap'}}>{p.tags.slice(0,4).map(t => <span key={t} style={{fontSize:'0.68rem',color:'#22c55e',background:'rgba(34,197,94,0.15)',padding:'2px 6px',borderRadius:6}}>#{t}</span>)}</div>}
            </div>
            {/* Category */}
            <div style={{position:'absolute',top:12,left:12,background:'rgba(0,0,0,0.6)',color:'#fff',fontSize:'0.72rem',padding:'4px 10px',borderRadius:8}}>{p.category?.replace('_',' ')}</div>
            {/* Reel counter */}
            <div style={{position:'absolute',top:12,right:12,background:'rgba(0,0,0,0.5)',color:'#fff',fontSize:'0.7rem',padding:'3px 8px',borderRadius:6}}>{idx+1}/{items.length}</div>
          </div>
        );
      })}
    </div>
  );
}

/* ── SavedTab ── */
function SavedTab({ savedPosts, feed }) {
  if (!savedPosts?.length) return (
    <div style={{textAlign:'center',padding:'80px 20px'}}>
      <div style={{fontSize:'4rem',marginBottom:16}}>🔖</div>
      <div style={{color:'#fff',fontSize:'1.1rem',fontWeight:700,marginBottom:8}}>No saved posts yet</div>
      <div style={{color:'#9ca3af',fontSize:'0.9rem'}}>Save posts you find helpful!<br/>Tap 🔖 on any post to save it here.</div>
    </div>
  );
  return (
    <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:4,padding:'8px 0'}}>
      {savedPosts.map(p => (
        <div key={p.id} style={{position:'relative',aspectRatio:'1',borderRadius:8,overflow:'hidden',cursor:'pointer'}}>
          <img src={p.thumbnail_url || p.media_urls?.[0]} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} onError={e => e.target.src='https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=400'} />
          {(p.media_type==='reel'||p.media_type==='short_video') && <div style={{position:'absolute',top:6,right:6,fontSize:'0.8rem'}}>🎬</div>}
          <div style={{position:'absolute',bottom:0,left:0,right:0,background:'linear-gradient(transparent,rgba(0,0,0,0.7))',padding:'16px 6px 6px'}}>
            <div style={{fontSize:'0.65rem',color:'#fff'}}>❤️ {p.like_count||0}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Q&A Data ── */
const QA_INIT = [
  { id:1, q:'My paddy leaves are turning yellow. What should I do?', ans:'Yellow leaves in paddy can indicate nitrogen deficiency or bacterial leaf blight. Apply urea at 20kg/acre and monitor for 5 days.', user:'Venkat Rao', role:'farmer', loc:'Guntur', likes:234, coins:45, tags:['paddy','disease'], date:'2026-04-22' },
  { id:2, q:'What is the best time to apply Borax for cotton?', ans:'Apply Borax at 10kg/acre during square formation stage for best results.', user:'Expert Raju', role:'farmer', loc:'Vijayawada', likes:156, coins:32, tags:['cotton','soil'], date:'2026-04-18' },
  { id:3, q:'How to get PM-KISAN money if I did not receive last installment?', ans:'Visit your nearest CSC center or call PM-KISAN helpline 155261. Ensure Aadhaar is linked to your bank account.', user:'Krishna Babu', role:'farmer', loc:'Narasaraopet', likes:312, coins:50, tags:['schemes','govt'], date:'2026-04-15' },
  { id:4, q:'Can I use Neem oil to control aphids on my vegetables?', ans:'Yes! Mix 5ml Neem oil per liter water and spray early morning or evening. Repeat every 7 days.', user:'Lakshmi Devi', role:'farmer', loc:'Tirupati', likes:189, coins:28, tags:['pest','organic'], date:'2026-04-12' },
  { id:5, q:'Which paddy variety gives best yield in Guntur district?', ans:'BPT-5204 (Samba Mahsuri) and MTU-1010 are top performing in Guntur. BPT gives 25-28 quintals/acre.', user:'Suresh Reddy', role:'farmer', loc:'Guntur', likes:278, coins:55, tags:['paddy','seeds'], date:'2026-04-08' },
];

const COIN_REWARDS = { post: 10, video: 25, article: 20, question: 15, answer: 10 };

/* ── MAIN ── */
export default function CommunityFeed() {
  const feed = useCommunityFeed();
  const [tab, setTab] = useState('feed');
  const [showUpload, setShowUpload] = useState(false);
  const [scope, setScope] = useState('district');
  const [roleFilter, setRoleFilter] = useState('all');
  const [qaList, setQaList] = useState(QA_INIT);
  const [showAskQ, setShowAskQ] = useState(false);
  const [newQ, setNewQ] = useState('');
  const [coinAnim, setCoinAnim] = useState(null);
  const navigate = useNavigate();

  const earnCoins = (type) => {
    setCoinAnim(`+${COIN_REWARDS[type]} 🪙`);
    setTimeout(() => setCoinAnim(null), 2000);
  };

  const tabs = [
    { id:'feed', label:'📸 Feed', icon:'📸' },
    { id:'reels', label:'🎬 Reels', icon:'🎬' },
    { id:'qa', label:'❓ Q&A', icon:'❓' },
    { id:'saved', label:'🔖 Saved', icon:'🔖' },
  ];

  const SCOPES = [
    { id:'village', label:'🏘️ Village', icon:'🏘️' },
    { id:'mandal', label:'🏛️ Mandal', icon:'🏛️' },
    { id:'district', label:'📍 District', icon:'📍' },
    { id:'state', label:'🗺️ State', icon:'🗺️' },
  ];

  const ROLES = [
    { id:'all', label:'All', icon:'🌐' },
    { id:'farmer', label:'Farmer', icon:'👨‍🌾' },
    { id:'supplier', label:'Supplier', icon:'🏪' },
    { id:'factory', label:'Factory', icon:'🏭' },
    { id:'labour', label:'Labour', icon:'👷' },
    { id:'broker', label:'Broker', icon:'🤝' },
  ];

  // Filter posts based on scope and role
  const applyFilters = (posts) => posts.filter(p => {
    if (roleFilter !== 'all' && p.user_role !== roleFilter) return false;
    if (scope === 'village') return p.user_village === feed.village && feed.village;
    if (scope === 'mandal') return (p.user_mandal === feed.mandal || p.user_village === feed.mandal) && feed.mandal;
    if (scope === 'district') return p.user_district === feed.district || p.visibility === 'statewide';
    if (scope === 'state') return true;
    return true;
  });

  const filteredPosts = applyFilters(feed.allPosts);
  const filteredReels = applyFilters(feed.reels.length > 0 ? feed.reels : feed.allPosts);
  const filteredSaved = applyFilters(feed.savedPosts);

  const scopeLabel = scope === 'village' ? (feed.village || 'Your Village') :
    scope === 'mandal' ? `${feed.mandal || 'Your Mandal'} Mandal` :
    scope === 'district' ? `${feed.district} District` : 'All Andhra Pradesh';

  const pillStyle = (active, color = '#22c55e') => ({
    padding:'7px 14px', borderRadius:20,
    border:`1px solid ${active ? color : 'rgba(255,255,255,0.12)'}`,
    background: active ? `${color}18` : 'transparent',
    color: active ? color : '#9ca3af',
    cursor:'pointer', fontSize:'0.78rem', fontWeight: active ? 700 : 400,
    transition:'all 0.2s', whiteSpace:'nowrap',
  });

  return (
    <div style={{minHeight:'100vh',paddingBottom:80}}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:none; } }
        .feed-tabs::-webkit-scrollbar,.reel-item::-webkit-scrollbar,.scope-scroll::-webkit-scrollbar { display:none; }
      `}</style>

      {/* Header */}
      <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'16px 20px',borderBottom:'1px solid rgba(100,220,100,0.1)'}}>
        <h1 style={{fontSize:'1.3rem',fontWeight:800,color:'#fff',margin:0}}>🌾 Community Feed</h1>
        {coinAnim && <div style={{position:'fixed',top:80,right:20,zIndex:9999,background:'rgba(255,214,0,0.15)',border:'1px solid rgba(255,214,0,0.4)',color:'#FFD600',padding:'10px 20px',borderRadius:12,fontWeight:800,fontSize:'1.1rem',animation:'fadeUp 0.4s ease'}}>{coinAnim}</div>}
        <div style={{display:'flex',gap:6}}>
          <button onClick={() => setShowUpload(true)} style={{padding:'8px 14px',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.82rem',fontWeight:700,cursor:'pointer',display:'flex',alignItems:'center',gap:4}}>
            📸 Post <span style={{fontSize:'0.65rem',background:'rgba(255,255,255,0.2)',padding:'1px 6px',borderRadius:6}}>+{COIN_REWARDS.post}🪙</span>
          </button>
          {tab === 'qa' && <button onClick={() => setShowAskQ(true)} style={{padding:'8px 14px',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',border:'none',borderRadius:10,fontSize:'0.82rem',fontWeight:700,cursor:'pointer'}}>❓ Ask +{COIN_REWARDS.question}🪙</button>}
        </div>
      </div>

      {/* Tabs */}
      <div style={{display:'flex',borderBottom:'1px solid rgba(100,220,100,0.1)',padding:'0 20px'}}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{flex:1,padding:'12px 0',background:'none',border:'none',borderBottom:tab===t.id?'2px solid #22c55e':'2px solid transparent',color:tab===t.id?'#22c55e':'#9ca3af',fontWeight:tab===t.id?700:500,fontSize:'0.88rem',cursor:'pointer',transition:'all 0.2s'}}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Location Scope Filter */}
      <div style={{padding:'12px 16px 0',borderBottom:'1px solid rgba(100,220,100,0.06)'}}>
        <div style={{fontSize:'0.72rem',color:'#6b7280',marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>📍 Location Scope</div>
        <div className="scope-scroll" style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:10,scrollbarWidth:'none'}}>
          {SCOPES.map(s => (
            <button key={s.id} onClick={() => setScope(s.id)} style={pillStyle(scope === s.id)}>
              {s.icon} {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Role Filter */}
      <div style={{padding:'8px 16px 10px'}}>
        <div style={{fontSize:'0.72rem',color:'#6b7280',marginBottom:6,fontWeight:600,textTransform:'uppercase',letterSpacing:0.5}}>👤 Filter by Role</div>
        <div className="scope-scroll" style={{display:'flex',gap:8,overflowX:'auto',paddingBottom:4,scrollbarWidth:'none'}}>
          {ROLES.map(r => (
            <button key={r.id} onClick={() => setRoleFilter(r.id)}
              style={pillStyle(roleFilter === r.id, RC[r.id] || '#22c55e')}>
              {r.icon} {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Active filter label */}
      <div style={{padding:'4px 20px 8px',display:'flex',alignItems:'center',gap:8}}>
        <span style={{fontSize:'0.78rem',color:'#9ca3af'}}>Showing:</span>
        <span style={{fontSize:'0.82rem',color:'#22c55e',fontWeight:600}}>{scopeLabel}</span>
        {roleFilter !== 'all' && (
          <span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:8,background:`${RC[roleFilter]||'#22c55e'}22`,color:RC[roleFilter]||'#22c55e',fontWeight:600}}>
            {RI[roleFilter]||''} {roleFilter}
          </span>
        )}
        <span style={{fontSize:'0.75rem',color:'#6b7280',marginLeft:'auto'}}>{filteredPosts.length} posts</span>
      </div>

      {/* Loading */}
      {feed.loading && <div style={{textAlign:'center',padding:'40px',color:'#9ca3af'}}>Loading feed...</div>}

      {/* FEED TAB */}
      {tab === 'feed' && !feed.loading && (
        <div style={{maxWidth:680,margin:'0 auto',padding:'8px 12px'}}>
          {/* Horizontal sections only when scope is district or wider */}
          {scope !== 'village' && <HSection title="⭐ Featured Posts" posts={feed.featuredPosts.filter(p => roleFilter === 'all' || p.user_role === roleFilter)} feed={feed} />}
          {scope !== 'village' && <HSection title="📢 Promotions Near You" posts={feed.promotions.filter(p => roleFilter === 'all' || p.user_role === roleFilter)} feed={feed} />}
          {scope !== 'village' && <HSection title="🎬 Latest Reels" posts={feed.reels.filter(p => roleFilter === 'all' || p.user_role === roleFilter)} feed={feed} />}

          {/* Section header */}
          <h3 style={{fontSize:'1rem',fontWeight:700,color:'#fff',margin:'12px 4px 12px',display:'flex',alignItems:'center',gap:8}}>
            {scope === 'village' ? '🏘️' : scope === 'mandal' ? '🏛️' : scope === 'district' ? '📍' : '🗺️'} {scopeLabel}
            <span style={{fontSize:'0.75rem',fontWeight:400,color:'#6b7280'}}>({filteredPosts.length})</span>
          </h3>

          {filteredPosts.map(p => <PostCard key={p.id} post={p} feed={feed} />)}

          {filteredPosts.length === 0 && (
            <div style={{textAlign:'center',padding:'60px 20px',color:'#9ca3af'}}>
              <div style={{fontSize:'3rem',marginBottom:12}}>{scope === 'village' ? '🏘️' : '🌾'}</div>
              <div style={{fontSize:'1rem',fontWeight:600,color:'#fff',marginBottom:8}}>No posts from {scopeLabel}</div>
              <div style={{fontSize:'0.85rem'}}>
                {scope === 'village' ? 'Try expanding to District or State to see more posts!' : 'Be the first to share from your area!'}
              </div>
              {scope === 'village' && (
                <button onClick={() => setScope('district')} style={{marginTop:16,padding:'10px 20px',background:'rgba(34,197,94,0.15)',color:'#22c55e',border:'1px solid rgba(34,197,94,0.3)',borderRadius:10,cursor:'pointer',fontSize:'0.85rem',fontWeight:600}}>
                  📍 Show District Posts
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* REELS TAB */}
      {tab === 'reels' && <ReelsTab reels={filteredReels} feed={feed} />}

      {/* Q&A TAB */}
      {tab === 'qa' && (
        <div style={{maxWidth:680,margin:'0 auto',padding:'8px 12px'}}>
          <div style={{display:'flex',gap:8,marginBottom:14,flexWrap:'wrap'}}>
            {['All','paddy','cotton','pest','seeds','schemes','soil','organic'].map(tag => (
              <button key={tag} style={{padding:'4px 12px',borderRadius:14,border:'1px solid rgba(255,255,255,0.12)',background:'transparent',color:'var(--text-muted)',fontSize:'0.72rem',cursor:'pointer',fontWeight:600}}>{tag === 'All' ? '🔄' : '#'}{tag}</button>
            ))}
          </div>
          {qaList.map(q => (
            <div key={q.id} style={{background:'rgba(10,40,20,0.85)',border:'1px solid rgba(255,255,255,0.12)',borderLeft:'4px solid #f59e0b',borderRadius:12,padding:16,marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:'0.92rem',color:'#fff',marginBottom:8}}>❓ {q.q}</div>
              <div style={{background:'rgba(34,197,94,0.06)',borderRadius:8,padding:'10px 12px',marginBottom:8,borderLeft:'3px solid #22c55e'}}>
                <div style={{fontSize:'0.82rem',color:'var(--text-secondary)',lineHeight:1.5}}>💡 {q.ans}</div>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                <div style={{display:'flex',gap:8,alignItems:'center',fontSize:'0.75rem',color:'var(--text-muted)'}}>
                  <span>👨‍🌾 {q.user}</span>
                  <span>📍 {q.loc}</span>
                  <span>❤️ {q.likes}</span>
                  <span style={{color:'#FFD600'}}>🪙 +{q.coins}</span>
                </div>
                <div style={{display:'flex',gap:4}}>
                  {q.tags?.map(t => <span key={t} style={{fontSize:'0.65rem',color:'#22c55e',background:'rgba(34,197,94,0.1)',padding:'2px 6px',borderRadius:6}}>#{t}</span>)}
                </div>
              </div>
            </div>
          ))}

          {/* Ask Question Modal */}
          {showAskQ && (
            <div style={{position:'fixed',inset:0,zIndex:1000,background:'rgba(0,0,0,0.65)',display:'flex',alignItems:'center',justifyContent:'center',backdropFilter:'blur(4px)'}} onClick={() => setShowAskQ(false)}>
              <div style={{width:440,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:14,padding:24}} onClick={e => e.stopPropagation()}>
                <div style={{fontWeight:800,fontSize:'1rem',marginBottom:14}}>❓ Ask a Question <span style={{color:'#FFD600',fontSize:'0.78rem'}}>+{COIN_REWARDS.question}🪙</span></div>
                <textarea value={newQ} onChange={e => setNewQ(e.target.value)} placeholder="Type your farming question..." style={{width:'100%',height:100,padding:12,borderRadius:8,border:'1px solid var(--border)',background:'var(--bg-primary)',color:'var(--text-primary)',fontSize:'0.85rem',resize:'none',boxSizing:'border-box',marginBottom:12}} />
                <div style={{display:'flex',gap:8}}>
                  <button disabled={!newQ.trim()} onClick={() => { setQaList(prev => [{ id:Date.now(), q:newQ, ans:'Waiting for community answers...', user:'You', role:'farmer', loc:'Your Location', likes:0, coins:COIN_REWARDS.question, tags:[], date:new Date().toISOString().split('T')[0] }, ...prev]); setShowAskQ(false); setNewQ(''); earnCoins('question'); }} style={{flex:1,padding:10,borderRadius:8,border:'none',background:'linear-gradient(135deg,#f59e0b,#d97706)',color:'#fff',fontWeight:700,cursor:'pointer',opacity:newQ.trim()?1:0.5}}>✅ Post Question</button>
                  <button onClick={() => setShowAskQ(false)} style={{flex:1,padding:10,borderRadius:8,border:'1px solid var(--border)',background:'transparent',color:'var(--text-primary)',cursor:'pointer'}}>Cancel</button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SAVED TAB */}
      {tab === 'saved' && (
        <div style={{maxWidth:680,margin:'0 auto',padding:'16px 12px'}}>
          <SavedTab savedPosts={filteredSaved.length > 0 ? filteredSaved : feed.savedPosts} feed={feed} />
        </div>
      )}

      {/* Upload Modal */}
      {showUpload && <PostUploadModal onClose={() => setShowUpload(false)} onSuccess={feed.refetch} />}

      {/* FAB */}
      <button onClick={() => setShowUpload(true)} style={{position:'fixed',bottom:80,right:20,width:56,height:56,borderRadius:'50%',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#fff',border:'none',fontSize:'1.4rem',cursor:'pointer',boxShadow:'0 4px 20px rgba(34,197,94,0.4)',zIndex:100,display:'flex',alignItems:'center',justifyContent:'center'}}>
        📸
      </button>
    </div>
  );
}
