import React, { useState, useRef, useEffect } from 'react';

const CATEGORIES = [
  { key:'ui_bug', emoji:'🖥️', label:'UI Bug' },
  { key:'functionality', emoji:'⚙️', label:'Functionality' },
  { key:'performance', emoji:'🐌', label:'Performance' },
  { key:'crash', emoji:'💥', label:'Crash' },
  { key:'data_error', emoji:'📊', label:'Data Error' },
  { key:'api_error', emoji:'🔌', label:'API Error' },
  { key:'design', emoji:'🎨', label:'Design' },
  { key:'translation', emoji:'🌐', label:'Translation' },
  { key:'mobile', emoji:'📱', label:'Mobile' },
  { key:'other', emoji:'🔧', label:'Other' },
];

const SEVERITIES = [
  { key:'critical', emoji:'🔴', label:'Critical', desc:'App broken', color:'#FF1744' },
  { key:'high', emoji:'🟠', label:'High', desc:'Major issue', color:'#FF6D00' },
  { key:'medium', emoji:'🟡', label:'Medium', desc:'Annoyance', color:'#FFD600' },
  { key:'low', emoji:'🟢', label:'Low', desc:'Minor', color:'#4CAF50' },
];

const glass = { background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)', borderRadius:14, backdropFilter:'blur(12px)' };
const inputStyle = { ...glass, width:'100%', padding:'12px 16px', color:'#fff', fontSize:14, outline:'none', fontFamily:'Inter,sans-serif', resize:'vertical' };

export default function BugReportModal({ open, onClose, onSubmit }) {
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState('');
  const [severity, setSeverity] = useState('medium');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [steps, setSteps] = useState('');
  const [expected, setExpected] = useState('');
  const [actual, setActual] = useState('');
  const [files, setFiles] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef();
  const currentPage = typeof window !== 'undefined' ? window.location.pathname : '/';

  // Reset on open
  useEffect(() => {
    if (open) { setStep(1); setCategory(''); setSeverity('medium'); setTitle(''); setDescription(''); setSteps(''); setExpected(''); setActual(''); setFiles([]); setPreviews([]); setDeviceInfo(null); setSubmitting(false); setSubmitted(false); setError(''); }
  }, [open]);

  const captureDeviceInfo = () => {
    setDeviceInfo({
      browser: navigator.userAgent.match(/(?:Chrome|Firefox|Safari|Edge|Opera)\/[\d.]+/)?.[0] || navigator.userAgent.slice(-40),
      screen: `${screen.width}×${screen.height}`,
      url: window.location.href,
      platform: navigator.platform,
      language: navigator.language,
      online: navigator.onLine ? 'Online' : 'Offline',
    });
  };

  const handleFiles = (e) => {
    const newFiles = Array.from(e.target.files).slice(0, 5 - files.length);
    const allFiles = [...files, ...newFiles].slice(0, 5);
    setFiles(allFiles);
    const newPreviews = allFiles.map(f => ({
      name: f.name,
      size: (f.size / 1024 / 1024).toFixed(2) + ' MB',
      type: f.type,
      url: URL.createObjectURL(f),
      isVideo: f.type.startsWith('video'),
    }));
    setPreviews(newPreviews);
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    setSubmitting(true); setError('');
    try {
      const bugData = {
        category, severity, title, description,
        steps_to_reproduce: steps, expected_behavior: expected, actual_behavior: actual,
        page_url: currentPage,
        page_name: currentPage.replace(/\//g, ' ').trim() || 'Dashboard',
        device_info: deviceInfo ? `${deviceInfo.platform} / ${deviceInfo.browser}` : navigator.userAgent,
        browser_info: deviceInfo?.browser || '',
        platform: /mobile|android|iphone/i.test(navigator.userAgent) ? 'mobile' : 'web',
      };
      const result = await onSubmit(bugData, files);
      if (result?.success) setSubmitted(true);
      else setError('Failed to submit. Please try again.');
    } catch (e) { setError(e.message || 'Submission failed'); }
    setSubmitting(false);
  };

  if (!open) return null;

  const canNext1 = category && title.trim();
  const canNext2 = description.trim();

  return (
    <div style={{ position:'fixed', inset:0, zIndex:10000, background:'rgba(5,5,15,0.97)', backdropFilter:'blur(20px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width:'100%', maxWidth:680, maxHeight:'90vh', overflowY:'auto', background:'rgba(20,25,20,0.6)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:24, padding:0 }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ padding:'20px 28px', borderBottom:'1px solid rgba(255,255,255,0.08)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <h2 style={{ color:'#fff', fontSize:20, fontWeight:700, margin:0 }}>🐛 Report a Bug</h2>
            {!submitted && <p style={{ color:'rgba(255,255,255,0.5)', fontSize:12, margin:'4px 0 0' }}>Step {step} of 3 • Reporting from: <span style={{ color:'#40C4FF' }}>{currentPage}</span></p>}
          </div>
          <button onClick={onClose} style={{ background:'rgba(255,255,255,0.08)', border:'none', color:'rgba(255,255,255,0.6)', width:36, height:36, borderRadius:'50%', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>

        {/* Progress */}
        {!submitted && (
          <div style={{ display:'flex', gap:8, padding:'16px 28px', justifyContent:'center' }}>
            {[1,2,3].map(s => (
              <div key={s} style={{ display:'flex', alignItems:'center', gap:8 }}>
                <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, background: s <= step ? 'linear-gradient(135deg,#FF1744,#FF6D00)' : 'rgba(255,255,255,0.08)', color: s <= step ? '#fff' : 'rgba(255,255,255,0.3)', border: `1px solid ${s <= step ? 'rgba(255,23,68,0.5)' : 'rgba(255,255,255,0.1)'}`, transition:'all 0.3s' }}>{s}</div>
                {s < 3 && <div style={{ width:40, height:2, background: s < step ? '#FF1744' : 'rgba(255,255,255,0.1)', borderRadius:1, transition:'all 0.3s' }} />}
              </div>
            ))}
          </div>
        )}

        <div style={{ padding:'8px 28px 28px' }}>
          {/* STEP 1 */}
          {step === 1 && !submitted && (
            <div>
              <h3 style={{ color:'#fff', fontSize:16, fontWeight:600, marginBottom:16 }}>What type of problem?</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(130px,1fr))', gap:10, marginBottom:24 }}>
                {CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => setCategory(c.key)} style={{
                    ...glass, padding:'16px 10px', textAlign:'center', cursor:'pointer', color:'#fff',
                    border: category === c.key ? '2px solid #FF1744' : '1px solid rgba(255,255,255,0.12)',
                    background: category === c.key ? 'rgba(255,23,68,0.15)' : 'rgba(255,255,255,0.04)',
                    boxShadow: category === c.key ? '0 0 20px rgba(255,23,68,0.25)' : 'none',
                    transition:'all 0.2s', transform: category === c.key ? 'scale(1.05)' : 'scale(1)',
                  }}>
                    <div style={{ fontSize:28, marginBottom:6 }}>{c.emoji}</div>
                    <div style={{ fontSize:11, fontWeight:600, opacity:0.85 }}>{c.label}</div>
                  </button>
                ))}
              </div>

              <input value={title} onChange={e => setTitle(e.target.value)} placeholder="Bug title in one line..." style={{ ...inputStyle, marginBottom:16, fontSize:15, fontWeight:500 }} />

              <h3 style={{ color:'#fff', fontSize:14, fontWeight:600, marginBottom:10 }}>Severity</h3>
              <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
                {SEVERITIES.map(s => (
                  <button key={s.key} onClick={() => setSeverity(s.key)} style={{
                    ...glass, padding:'8px 16px', cursor:'pointer', display:'flex', alignItems:'center', gap:8,
                    border: severity === s.key ? `2px solid ${s.color}` : '1px solid rgba(255,255,255,0.12)',
                    background: severity === s.key ? `${s.color}22` : 'rgba(255,255,255,0.04)',
                    boxShadow: severity === s.key ? `0 0 15px ${s.color}40` : 'none',
                    color:'#fff', fontSize:13, fontWeight:600, transition:'all 0.2s',
                  }}>
                    {s.emoji} {s.label} <span style={{ fontSize:10, opacity:0.6 }}>({s.desc})</span>
                  </button>
                ))}
              </div>

              <button disabled={!canNext1} onClick={() => setStep(2)} style={{
                width:'100%', padding:'14px', borderRadius:14, border:'none', cursor: canNext1 ? 'pointer' : 'not-allowed',
                background: canNext1 ? 'linear-gradient(135deg,#00e676,#00c853)' : 'rgba(255,255,255,0.06)',
                color: canNext1 ? '#000' : 'rgba(255,255,255,0.3)', fontWeight:700, fontSize:15, transition:'all 0.3s',
              }}>Next → Describe & Upload</button>
            </div>
          )}

          {/* STEP 2 */}
          {step === 2 && !submitted && (
            <div>
              <h3 style={{ color:'#fff', fontSize:16, fontWeight:600, marginBottom:14 }}>Describe the problem</h3>
              <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe what went wrong..." rows={4} style={{ ...inputStyle, marginBottom:12 }} />
              <textarea value={steps} onChange={e => setSteps(e.target.value)} placeholder="Steps to reproduce (optional):&#10;1. Go to...&#10;2. Click...&#10;3. See error..." rows={3} style={{ ...inputStyle, marginBottom:12 }} />

              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginBottom:16 }}>
                <div>
                  <label style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600, marginBottom:4, display:'block' }}>Expected behavior</label>
                  <textarea value={expected} onChange={e => setExpected(e.target.value)} placeholder="What should happen..." rows={2} style={inputStyle} />
                </div>
                <div>
                  <label style={{ color:'rgba(255,255,255,0.5)', fontSize:11, fontWeight:600, marginBottom:4, display:'block' }}>Actual behavior</label>
                  <textarea value={actual} onChange={e => setActual(e.target.value)} placeholder="What actually happened..." rows={2} style={inputStyle} />
                </div>
              </div>

              {/* Media Upload */}
              <div onClick={() => fileRef.current?.click()} style={{
                ...glass, padding:28, textAlign:'center', cursor:'pointer', marginBottom:14,
                border:'2px dashed rgba(255,255,255,0.15)', borderRadius:16,
                background: files.length ? 'rgba(0,230,118,0.04)' : 'rgba(255,255,255,0.02)',
              }}>
                <input ref={fileRef} type="file" multiple accept="image/*,video/*" onChange={handleFiles} style={{ display:'none' }} />
                <div style={{ fontSize:32, marginBottom:6 }}>📸 🎥</div>
                <div style={{ color:'rgba(255,255,255,0.7)', fontSize:13 }}>Drag screenshots or screen recordings here</div>
                <div style={{ color:'rgba(255,255,255,0.4)', fontSize:11 }}>JPG PNG GIF MP4 WebM • Up to 50MB • Max 5 files</div>
              </div>

              {previews.length > 0 && (
                <div style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:14 }}>
                  {previews.map((p, i) => (
                    <div key={i} style={{ position:'relative', width:100, borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.1)' }}>
                      {p.isVideo ? (
                        <div style={{ width:100, height:70, background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:24 }}>▶️</div>
                      ) : (
                        <img src={p.url} alt="" style={{ width:100, height:70, objectFit:'cover' }} />
                      )}
                      <button onClick={(e) => { e.stopPropagation(); removeFile(i); }} style={{ position:'absolute', top:2, right:2, width:20, height:20, borderRadius:'50%', background:'rgba(255,0,0,0.8)', border:'none', color:'#fff', fontSize:10, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
                      <div style={{ padding:'4px 6px', fontSize:9, color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{p.name} ({p.size})</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Device Info */}
              <button onClick={captureDeviceInfo} style={{ ...glass, padding:'10px 16px', cursor:'pointer', color:'rgba(255,255,255,0.7)', fontSize:12, fontWeight:600, marginBottom:10, width:'100%', textAlign:'left' }}>
                📋 {deviceInfo ? '✅ Device info captured' : 'Auto-capture device info'}
              </button>
              {deviceInfo && (
                <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginBottom:14, lineHeight:1.6 }}>
                  {Object.entries(deviceInfo).map(([k,v]) => <div key={k}>• {k}: {v}</div>)}
                </div>
              )}

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setStep(1)} style={{ ...glass, flex:1, padding:'13px', cursor:'pointer', color:'rgba(255,255,255,0.7)', fontWeight:600, fontSize:14 }}>← Back</button>
                <button disabled={!canNext2} onClick={() => { if (!deviceInfo) captureDeviceInfo(); setStep(3); }} style={{
                  flex:2, padding:'13px', borderRadius:14, border:'none', cursor: canNext2 ? 'pointer' : 'not-allowed',
                  background: canNext2 ? 'linear-gradient(135deg,#00e676,#00c853)' : 'rgba(255,255,255,0.06)',
                  color: canNext2 ? '#000' : 'rgba(255,255,255,0.3)', fontWeight:700, fontSize:14,
                }}>Next → Review & Submit</button>
              </div>
            </div>
          )}

          {/* STEP 3 */}
          {step === 3 && !submitted && (
            <div>
              <h3 style={{ color:'#fff', fontSize:16, fontWeight:600, marginBottom:14 }}>Review your bug report</h3>
              <div style={{ ...glass, padding:20, marginBottom:20, borderRadius:16 }}>
                <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:14 }}>
                  <span style={{ fontSize:28 }}>{CATEGORIES.find(c => c.key === category)?.emoji || '🔧'}</span>
                  <div>
                    <div style={{ color:'#fff', fontWeight:700, fontSize:15 }}>{title}</div>
                    <div style={{ display:'flex', gap:8, marginTop:4 }}>
                      <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background: SEVERITIES.find(s => s.key === severity)?.color + '30', color: SEVERITIES.find(s => s.key === severity)?.color, fontWeight:700 }}>{severity.toUpperCase()}</span>
                      <span style={{ fontSize:10, padding:'3px 10px', borderRadius:20, background:'rgba(64,196,255,0.15)', color:'#40C4FF' }}>{CATEGORIES.find(c => c.key === category)?.label}</span>
                    </div>
                  </div>
                </div>
                <p style={{ color:'rgba(255,255,255,0.65)', fontSize:13, marginBottom:10, lineHeight:1.5 }}>{description.slice(0, 200)}{description.length > 200 ? '...' : ''}</p>
                {files.length > 0 && <div style={{ color:'rgba(255,255,255,0.4)', fontSize:12 }}>📎 {files.length} file{files.length>1?'s':''} attached</div>}
                {deviceInfo && <div style={{ color:'rgba(255,255,255,0.3)', fontSize:11, marginTop:6 }}>🖥️ {deviceInfo.platform} / {deviceInfo.browser}</div>}
              </div>

              {error && <div style={{ background:'rgba(255,82,82,0.15)', border:'1px solid rgba(255,82,82,0.3)', borderRadius:12, padding:'12px 16px', marginBottom:14, color:'#FF5252', fontSize:13 }}>❌ {error}</div>}

              <div style={{ display:'flex', gap:10 }}>
                <button onClick={() => setStep(2)} style={{ ...glass, flex:1, padding:'14px', cursor:'pointer', color:'rgba(255,255,255,0.7)', fontWeight:600, fontSize:14 }}>← Back</button>
                <button onClick={handleSubmit} disabled={submitting} style={{
                  flex:2, padding:'16px', borderRadius:16, border:'none', cursor:'pointer',
                  background: 'linear-gradient(135deg,#FF1744,#FF6D00)',
                  color:'#fff', fontWeight:700, fontSize:16,
                  boxShadow:'0 6px 25px rgba(255,23,68,0.4)',
                  opacity: submitting ? 0.6 : 1,
                }}>
                  {submitting ? '⏳ Submitting...' : '🚀 Submit Bug Report'}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS */}
          {submitted && (
            <div style={{ textAlign:'center', padding:'30px 0' }}>
              <div style={{ fontSize:64, marginBottom:12 }}>✅</div>
              <h3 style={{ color:'#00e676', fontSize:20, fontWeight:700, marginBottom:8 }}>Bug Reported!</h3>
              <p style={{ color:'rgba(255,255,255,0.6)', fontSize:14, marginBottom:24, maxWidth:340, margin:'0 auto 24px' }}>Developer will see this immediately. You'll get notified when it's fixed.</p>
              <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
                <button onClick={() => { setSubmitted(false); setStep(1); setCategory(''); setTitle(''); setDescription(''); setFiles([]); setPreviews([]); }} style={{ ...glass, padding:'12px 24px', cursor:'pointer', color:'#40C4FF', fontWeight:600, fontSize:13 }}>Report Another</button>
                <button onClick={onClose} style={{ padding:'12px 24px', borderRadius:14, border:'none', cursor:'pointer', background:'linear-gradient(135deg,#00e676,#00c853)', color:'#000', fontWeight:700, fontSize:13 }}>Close</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
