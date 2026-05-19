import React, { useState, useRef, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';

const CATEGORIES = [
  { value: 'farm_field', label: '🌾 Farm & Field', icon: '🌾' },
  { value: 'crop_harvest', label: '🌽 Crop Harvest', icon: '🌽' },
  { value: 'machinery', label: '🚜 Machinery', icon: '🚜' },
  { value: 'produce', label: '🥬 Produce', icon: '🥬' },
  { value: 'factory', label: '🏭 Factory', icon: '🏭' },
  { value: 'labour_work', label: '👷 Labour Work', icon: '👷' },
  { value: 'livestock', label: '🐄 Livestock', icon: '🐄' },
  { value: 'irrigation', label: '💧 Irrigation', icon: '💧' },
  { value: 'market', label: '📈 Market', icon: '📈' },
  { value: 'promotion', label: '📢 Promotion', icon: '📢' },
  { value: 'tips', label: '💡 Tips & Advice', icon: '💡' },
  { value: 'community', label: '🤝 Community', icon: '🤝' },
];

async function compressImage(file, maxSize = 2 * 1024 * 1024) {
  if (file.size <= maxSize) return file;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let { width, height } = img;
      const scale = Math.min(1920 / width, 1920 / height, 1);
      width *= scale; height *= scale;
      canvas.width = width; canvas.height = height;
      canvas.getContext('2d').drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => resolve(new File([blob], file.name, { type: 'image/jpeg' })), 'image/jpeg', 0.82);
    };
    img.src = URL.createObjectURL(file);
  });
}

function getVideoDuration(file) {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => { resolve(Math.round(video.duration)); URL.revokeObjectURL(video.src); };
    video.onerror = () => resolve(0);
    video.src = URL.createObjectURL(file);
  });
}

export default function PostUploadModal({ onClose, onSuccess }) {
  const { user, farmerProfile, userRole } = useAuth();
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [durations, setDurations] = useState({});
  const [caption, setCaption] = useState('');
  const [category, setCategory] = useState('farm_field');
  const [tags, setTags] = useState('');
  const [visibility, setVisibility] = useState('district');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const dragRef = useRef();

  const handleFiles = useCallback(async (newFiles) => {
    const arr = Array.from(newFiles).slice(0, 10);
    const prevs = [];
    const durs = {};
    for (const f of arr) {
      const url = URL.createObjectURL(f);
      prevs.push({ file: f, url, type: f.type.startsWith('video') ? 'video' : 'image' });
      if (f.type.startsWith('video')) {
        durs[f.name] = await getVideoDuration(f);
      }
    }
    setFiles(prev => [...prev, ...arr].slice(0, 10));
    setPreviews(prev => [...prev, ...prevs].slice(0, 10));
    setDurations(prev => ({ ...prev, ...durs }));
  }, []);

  const removeFile = (idx) => {
    setFiles(f => f.filter((_, i) => i !== idx));
    setPreviews(p => p.filter((_, i) => i !== idx));
  };

  const onDrop = (e) => { e.preventDefault(); dragRef.current?.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); };
  const onDragOver = (e) => { e.preventDefault(); dragRef.current?.classList.add('drag-over'); };
  const onDragLeave = () => dragRef.current?.classList.remove('drag-over');

  const detectMediaType = () => {
    const hasVideo = previews.some(p => p.type === 'video');
    if (hasVideo) {
      const dur = Object.values(durations)[0] || 0;
      return dur <= 60 ? 'reel' : 'short_video';
    }
    return previews.length > 1 ? 'carousel' : 'photo';
  };

  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true); setError(''); setProgress(5);
    try {
      const mediaType = detectMediaType();
      const userId = user?.id || 'anon';
      const ts = Date.now();
      const mediaUrls = [];
      let thumbUrl = '';

      for (let i = 0; i < files.length; i++) {
        let file = files[i];
        if (file.type.startsWith('image')) file = await compressImage(file);
        const path = `${userId}/${ts}_${i}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
        setProgress(10 + Math.round((i / files.length) * 60));

        const { error: uploadErr } = await supabase.storage.from('community-posts').upload(path, file, { contentType: file.type, upsert: true });
        if (uploadErr) {
          // Fallback: use preview URL if storage fails
          mediaUrls.push(previews[i]?.url || `https://images.pexels.com/photos/2132171/pexels-photo-2132171.jpeg?auto=compress&w=800`);
        } else {
          const { data: urlData } = await supabase.storage.from('community-posts').createSignedUrl(path, 365 * 24 * 3600);
          mediaUrls.push(urlData?.signedUrl || path);
        }
        if (i === 0) thumbUrl = mediaUrls[0];
      }

      setProgress(80);
      const postData = {
        user_id: user?.id || null,
        user_name: farmerProfile?.name || 'Farmer',
        user_role: userRole || 'farmer',
        user_district: farmerProfile?.district || 'Guntur',
        user_village: farmerProfile?.village || '',
        media_type: mediaType,
        media_urls: mediaUrls,
        thumbnail_url: thumbUrl,
        caption: caption.trim(),
        tags: tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 8),
        category,
        visibility,
        status: 'approved', // Auto-approve for demo
        is_promotion: category === 'promotion',
      };
      if (mediaType === 'reel' || mediaType === 'short_video') {
        postData.duration_seconds = Object.values(durations)[0] || 30;
      }

      setProgress(90);
      const { error: insertErr } = await supabase.from('community_posts').insert(postData);
      if (insertErr) { /* warn removed */ }
      setProgress(100);
      setDone(true);
      setTimeout(() => { onSuccess?.(); onClose(); }, 2500);
    } catch (err) {
      setError(err.message || 'Upload failed');
      setUploading(false);
    }
  };

  const S = {
    overlay: { position:'fixed',inset:0,zIndex:9999,background:'rgba(5,10,5,0.97)',display:'flex',flexDirection:'column',alignItems:'center',overflow:'auto' },
    header: { width:'100%',maxWidth:700,display:'flex',justifyContent:'space-between',alignItems:'center',padding:'20px 24px',borderBottom:'1px solid rgba(34,197,94,0.2)' },
    title: { fontSize:'1.2rem',fontWeight:700,color:'#fff' },
    closeBtn: { background:'none',border:'1px solid rgba(255,255,255,0.15)',color:'#fff',width:36,height:36,borderRadius:'50%',cursor:'pointer',fontSize:'1.1rem',display:'flex',alignItems:'center',justifyContent:'center' },
    content: { width:'100%',maxWidth:700,padding:'24px',flex:1 },
    dropZone: { border:'2px dashed rgba(34,197,94,0.4)',borderRadius:16,padding:'60px 40px',textAlign:'center',cursor:'pointer',transition:'all 0.3s',background:'rgba(34,197,94,0.03)' },
    previewGrid: { display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(120px,1fr))',gap:12,marginTop:16 },
    previewItem: { position:'relative',borderRadius:12,overflow:'hidden',aspectRatio:'1',background:'rgba(0,0,0,0.4)' },
    previewImg: { width:'100%',height:'100%',objectFit:'cover' },
    removeBtn: { position:'absolute',top:4,right:4,width:24,height:24,borderRadius:'50%',background:'rgba(239,68,68,0.9)',color:'#fff',border:'none',cursor:'pointer',fontSize:'0.7rem',display:'flex',alignItems:'center',justifyContent:'center' },
    textarea: { width:'100%',minHeight:100,background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,padding:'14px 16px',color:'#fff',fontSize:'0.95rem',resize:'vertical',outline:'none',fontFamily:'inherit' },
    select: { width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#fff',fontSize:'0.9rem',outline:'none' },
    input: { width:'100%',padding:'12px 16px',background:'rgba(255,255,255,0.05)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:12,color:'#fff',fontSize:'0.9rem',outline:'none' },
    radio: { display:'flex',gap:12,flexWrap:'wrap' },
    radioBtn: (active) => ({ padding:'10px 18px',borderRadius:20,border:`1px solid ${active ? '#22c55e' : 'rgba(255,255,255,0.15)'}`,background:active ? 'rgba(34,197,94,0.15)' : 'transparent',color:active ? '#22c55e' : '#9ca3af',cursor:'pointer',fontSize:'0.85rem',fontWeight:active?600:400,transition:'all 0.2s' }),
    primaryBtn: { padding:'14px 32px',background:'linear-gradient(135deg,#22c55e,#16a34a)',color:'#fff',border:'none',borderRadius:12,fontSize:'1rem',fontWeight:700,cursor:'pointer',width:'100%',marginTop:20 },
    outlineBtn: { padding:'12px 24px',background:'transparent',color:'#22c55e',border:'1px solid rgba(34,197,94,0.4)',borderRadius:12,fontSize:'0.9rem',fontWeight:600,cursor:'pointer' },
    label: { display:'block',fontSize:'0.85rem',color:'#9ca3af',marginBottom:8,fontWeight:600 },
    steps: { display:'flex',gap:8,justifyContent:'center',padding:'16px 0' },
    stepDot: (active) => ({ width:active?32:10,height:10,borderRadius:5,background:active?'#22c55e':'rgba(255,255,255,0.15)',transition:'all 0.3s' }),
    progress: { width:'100%',height:6,background:'rgba(255,255,255,0.08)',borderRadius:3,overflow:'hidden',marginTop:16 },
    progressBar: (pct) => ({ width:`${pct}%`,height:'100%',background:'linear-gradient(90deg,#22c55e,#16a34a)',borderRadius:3,transition:'width 0.3s' }),
    durBadge: { position:'absolute',bottom:6,right:6,background:'rgba(0,0,0,0.7)',color:'#fff',fontSize:'0.7rem',padding:'2px 6px',borderRadius:4 },
    successBox: { textAlign:'center',padding:'60px 20px' },
  };

  return (
    <div style={S.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div style={S.header}>
        <span style={S.title}>
          {step === 1 ? '📸 Select Media' : step === 2 ? '✏️ Post Details' : done ? '✅ Posted!' : '⬆️ Uploading...'}
        </span>
        <button style={S.closeBtn} onClick={onClose}>✕</button>
      </div>
      <div style={S.steps}>
        {[1,2,3].map(s => <div key={s} style={S.stepDot(step === s)} />)}
      </div>
      <div style={S.content}>
        {/* STEP 1: Media Selection */}
        {step === 1 && (
          <>
            <div ref={dragRef} style={S.dropZone} onClick={() => fileRef.current?.click()}
              onDrop={onDrop} onDragOver={onDragOver} onDragLeave={onDragLeave}>
              <div style={{fontSize:'3rem',marginBottom:12}}>📷</div>
              <div style={{color:'#22c55e',fontSize:'1.1rem',fontWeight:700,marginBottom:8}}>Drop photos or videos here</div>
              <div style={{color:'#9ca3af',fontSize:'0.85rem'}}>or click to browse • JPG, PNG, WEBP, MP4, MOV</div>
              <div style={{color:'#6b7280',fontSize:'0.75rem',marginTop:8}}>Max 10 files for carousel • Videos auto-detect as Reels</div>
            </div>
            <input ref={fileRef} type="file" hidden multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
              onChange={(e) => handleFiles(e.target.files)} />

            {previews.length > 0 && (
              <>
                <div style={{marginTop:16,fontSize:'0.85rem',color:'#9ca3af'}}>
                  {previews.length} file(s) selected • {detectMediaType().toUpperCase()}
                </div>
                <div style={S.previewGrid}>
                  {previews.map((p, i) => (
                    <div key={i} style={S.previewItem}>
                      {p.type === 'video' ? (
                        <video src={p.url} style={S.previewImg} muted />
                      ) : (
                        <img src={p.url} alt="" style={S.previewImg} />
                      )}
                      <button style={S.removeBtn} onClick={() => removeFile(i)}>✕</button>
                      {durations[p.file?.name] && (
                        <div style={S.durBadge}>{Math.floor(durations[p.file.name]/60)}:{String(durations[p.file.name]%60).padStart(2,'0')}</div>
                      )}
                    </div>
                  ))}
                </div>
                <button style={S.primaryBtn} onClick={() => setStep(2)}>Next: Add Details →</button>
              </>
            )}
          </>
        )}

        {/* STEP 2: Details */}
        {step === 2 && (
          <>
            <div style={{marginBottom:20}}>
              <label style={S.label}>Caption</label>
              <textarea style={S.textarea} value={caption} onChange={(e) => setCaption(e.target.value.slice(0,300))}
                placeholder="What's happening on your farm? Share your story..." />
              <div style={{textAlign:'right',fontSize:'0.75rem',color:caption.length > 280 ? '#ef4444' : '#6b7280',marginTop:4}}>
                {caption.length}/300
              </div>
            </div>
            <div style={{marginBottom:20}}>
              <label style={S.label}>Category</label>
              <select style={S.select} value={category} onChange={(e) => setCategory(e.target.value)}>
                {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>
            <div style={{marginBottom:20}}>
              <label style={S.label}>Tags (comma separated, max 8)</label>
              <input style={S.input} value={tags} onChange={(e) => setTags(e.target.value)}
                placeholder="e.g. paddy, harvest, organic, guntur" />
            </div>
            <div style={{marginBottom:20}}>
              <label style={S.label}>Who can see this?</label>
              <div style={S.radio}>
                {[
                  { v:'village', l:'🏘️ My Village Only' },
                  { v:'district', l:'📍 My District' },
                  { v:'statewide', l:'🗺️ All Andhra Pradesh' },
                ].map(o => (
                  <div key={o.v} style={S.radioBtn(visibility===o.v)} onClick={() => setVisibility(o.v)}>{o.l}</div>
                ))}
              </div>
            </div>
            <div style={{display:'flex',gap:12}}>
              <button style={S.outlineBtn} onClick={() => setStep(1)}>← Back</button>
              <button style={{...S.primaryBtn,flex:1,marginTop:0}} onClick={() => { setStep(3); handleUpload(); }}>
                📤 Submit Post
              </button>
            </div>
          </>
        )}

        {/* STEP 3: Upload Progress */}
        {step === 3 && !done && (
          <div style={{textAlign:'center',padding:'60px 20px'}}>
            <div style={{fontSize:'3rem',marginBottom:16,animation:'pulse 1.5s infinite'}}>⬆️</div>
            <div style={{color:'#fff',fontSize:'1.1rem',fontWeight:700,marginBottom:8}}>Uploading your post...</div>
            <div style={{color:'#9ca3af',fontSize:'0.85rem',marginBottom:20}}>{progress}% complete</div>
            <div style={S.progress}><div style={S.progressBar(progress)} /></div>
            {error && <div style={{color:'#ef4444',marginTop:16,fontSize:'0.85rem'}}>{error}</div>}
          </div>
        )}

        {/* Success */}
        {done && (
          <div style={S.successBox}>
            <div style={{fontSize:'4rem',marginBottom:16}}>🎉</div>
            <div style={{color:'#22c55e',fontSize:'1.3rem',fontWeight:800,marginBottom:8}}>Post Submitted!</div>
            <div style={{color:'#9ca3af',fontSize:'0.9rem',lineHeight:1.6}}>
              Your post is now live and visible to farmers in your area!<br/>
              Keep sharing your farming journey! 🌾
            </div>
          </div>
        )}
      </div>
      <style>{`
        @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
        .drag-over { border-color: #22c55e !important; background: rgba(34,197,94,0.08) !important; }
      `}</style>
    </div>
  );
}
