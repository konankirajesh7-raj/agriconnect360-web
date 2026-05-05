import { useState } from 'react';
import { useAuth } from '../lib/hooks/useAuth';

const ROLE_LABELS = {
  farmer: 'Farm Products & Services',
  customer: 'Products & Deals',
  industrial: 'Industrial Solutions',
  broker: 'Trading Services',
  supplier: 'Wholesale Supplies',
  labour: 'Skilled Services',
  fpo: 'FPO Products',
};

const DEMO_ADS = [
  { id: 1, title: 'Premium Organic Mangoes - Direct from Chittoor Farms', by: 'Raju Farms', status: 'active', views: 1240, date: 'Apr 28', type: 'image' },
  { id: 2, title: 'Guntur Cold Storage - 50% Off First Month', by: 'AP Cold Chain Ltd', status: 'active', views: 890, date: 'Apr 25', type: 'video' },
  { id: 3, title: 'Organic Fertilizers - Farm to Field Delivery', by: 'GreenGrow Suppliers', status: 'pending', views: 0, date: 'Apr 30', type: 'image' },
];

export default function AdvertisePage() {
  const { farmerProfile } = useAuth();
  const role = farmerProfile?.role || 'farmer';
  const [tab, setTab] = useState('create');
  const [myAds, setMyAds] = useState(DEMO_ADS);
  const [form, setForm] = useState({ title: '', description: '', media: null, mediaPreview: '', duration: '7' });
  const [payStep, setPayStep] = useState(0); // 0=form, 1=payment, 2=success
  const [toast, setToast] = useState('');
  const [processing, setProcessing] = useState(false);

  const handleMedia = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setForm(p => ({ ...p, media: f }));
    const reader = new FileReader();
    reader.onload = (ev) => setForm(p => ({ ...p, mediaPreview: ev.target.result }));
    reader.readAsDataURL(f);
  };

  const submitAd = async () => {
    if (!form.title || !form.media) { setToast('⚠️ Please add title and media'); setTimeout(() => setToast(''), 2500); return; }
    setPayStep(1);
  };

  const processPayment = async () => {
    setProcessing(true);
    // Simulate payment
    await new Promise(r => setTimeout(r, 2000));
    const newAd = { id: Date.now(), title: form.title, by: farmerProfile?.name || 'You', status: 'pending', views: 0, date: new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }), type: form.media?.type?.includes('video') ? 'video' : 'image' };
    setMyAds(p => [newAd, ...p]);
    setPayStep(2);
    setProcessing(false);
    setForm({ title: '', description: '', media: null, mediaPreview: '', duration: '7' });
    setTimeout(() => { setPayStep(0); setTab('my'); }, 3000);
  };

  const G = { glass: { background: 'rgba(255,255,255,0.04)', backdropFilter: 'blur(16px)', border: '1px solid rgba(255,255,255,0.08)' } };
  const inp = { width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.06)', color: '#f1f5f9', fontSize: '0.88rem', outline: 'none' };

  return (
    <div className="animated" style={{ padding: '20px 24px', maxWidth: 900, margin: '0 auto' }}>
      {toast && <div style={{ position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fbbf24', padding: '10px 24px', borderRadius: 12, zIndex: 9999, fontWeight: 600, border: '1px solid rgba(251,191,36,0.3)' }}>{toast}</div>}

      {/* Header */}
      <div style={{ ...G.glass, borderRadius: 16, padding: '24px 28px', marginBottom: 20, background: 'linear-gradient(135deg, rgba(251,191,36,0.12), rgba(245,158,11,0.08))' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: '2rem' }}>📱</div>
          <div>
            <h2 style={{ margin: 0, color: '#f1f5f9', fontSize: '1.3rem' }}>Advertise on RythuSphere</h2>
            <p style={{ margin: '4px 0 0', color: 'rgba(255,255,255,0.5)', fontSize: '0.82rem' }}>Promote your {ROLE_LABELS[role] || 'business'} ⬢ Reach thousands of users ⬢ ₹50 per ad</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {[{ id: 'create', icon: '~"', label: 'Create Ad' }, { id: 'my', icon: '📋', label: 'My Ads' }, { id: 'browse', icon: 'x', label: 'Active Ads' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{ padding: '10px 20px', borderRadius: 12, border: tab === t.id ? '2px solid #f59e0b' : '1px solid rgba(255,255,255,0.1)', background: tab === t.id ? 'rgba(245,158,11,0.15)' : 'rgba(255,255,255,0.03)', color: tab === t.id ? '#fbbf24' : 'rgba(255,255,255,0.5)', cursor: 'pointer', fontWeight: 600, fontSize: '0.82rem' }}>{t.icon} {t.label}</button>
        ))}
      </div>

      {/* Create Ad */}
      {tab === 'create' && payStep === 0 && (
        <div style={{ ...G.glass, borderRadius: 16, padding: 24 }}>
          <div style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 18, fontSize: '1rem' }}>📱 Create Advertisement</div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Ad Title *</label>
            <input value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Fresh Organic Mangoes from Chittoor" style={inp} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Description</label>
            <textarea value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Describe your product/service..." rows={3} style={{ ...inp, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Upload Image or Video *</label>
            <div style={{ ...G.glass, borderRadius: 12, padding: 20, textAlign: 'center', border: '2px dashed rgba(255,255,255,0.15)', cursor: 'pointer', position: 'relative' }}>
              <input type="file" accept="image/*,video/*" onChange={handleMedia} style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }} />
              {form.mediaPreview ? (
                form.media?.type?.includes('video') ?
                  <video src={form.mediaPreview} style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8 }} controls /> :
                  <img src={form.mediaPreview} alt="preview" style={{ maxWidth: '100%', maxHeight: 200, borderRadius: 8, objectFit: 'cover' }} />
              ) : (
                <div>
                  <div style={{ fontSize: '2.5rem', marginBottom: 8 }}>📱</div>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>Click to upload image or video</div>
                  <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: '0.72rem', marginTop: 4 }}>Supports JPG, PNG, MP4 (max 10MB)</div>
                </div>
              )}
            </div>
          </div>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.5)', display: 'block', marginBottom: 6 }}>Ad Duration</label>
            <select value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} style={inp}>
              <option value="7">7 Days - ₹50</option>
              <option value="15">15 Days - ₹90</option>
              <option value="30">30 Days - ₹150</option>
            </select>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <button onClick={submitAd} style={{ padding: '12px 32px', borderRadius: 12, border: 'none', background: 'linear-gradient(135deg, #f59e0b, #d97706)', color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.92rem' }}>💳 Proceed to Pay ₹{form.duration === '7' ? '50' : form.duration === '15' ? '90' : '150'}</button>
            <span style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)' }}>Ad will be reviewed by admin before publishing</span>
          </div>
        </div>
      )}

      {/* Payment Step */}
      {tab === 'create' && payStep === 1 && (
        <div style={{ ...G.glass, borderRadius: 16, padding: 32, textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: 12 }}>💳</div>
          <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '1.2rem', marginBottom: 8 }}>Payment: ₹{form.duration === '7' ? '50' : form.duration === '15' ? '90' : '150'}</div>
          <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem', marginBottom: 24 }}>Ad: {form.title}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, maxWidth: 400, margin: '0 auto 24px' }}>
            {[{ icon: '📱', label: 'UPI / GPay' }, { icon: '👤', label: 'Net Banking' }, { icon: '💳', label: 'Card' }].map(m => (
              <div key={m.label} style={{ ...G.glass, padding: 16, borderRadius: 12, textAlign: 'center', cursor: 'pointer', border: '1px solid rgba(245,158,11,0.3)' }}>
                <div style={{ fontSize: '1.5rem' }}>{m.icon}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{m.label}</div>
              </div>
            ))}
          </div>
          <button onClick={processPayment} disabled={processing} style={{ padding: '14px 40px', borderRadius: 14, border: 'none', background: processing ? '#475569' : 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#fff', fontWeight: 700, cursor: processing ? 'default' : 'pointer', fontSize: '0.95rem' }}>
            {processing ? '⏳ Processing Payment...' : '✅ Pay & Submit Ad'}
          </button>
          <div style={{ marginTop: 12 }}><button onClick={() => setPayStep(0)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer', fontSize: '0.8rem' }}>⬅ Go Back</button></div>
        </div>
      )}

      {/* Success */}
      {tab === 'create' && payStep === 2 && (
        <div style={{ ...G.glass, borderRadius: 16, padding: 40, textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: 12 }}>🟢</div>
          <div style={{ fontWeight: 700, color: '#4ade80', fontSize: '1.3rem', marginBottom: 8 }}>Ad Submitted Successfully!</div>
          <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.88rem' }}>Your ad is under admin review. It will be live within 24 hours.</div>
          <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.75rem', marginTop: 8 }}>Payment of ₹{form.duration === '7' ? '50' : form.duration === '15' ? '90' : '150'} received ✅</div>
        </div>
      )}

      {/* My Ads */}
      {tab === 'my' && (
        <div style={{ ...G.glass, borderRadius: 16, overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)', fontWeight: 700, color: '#f1f5f9' }}>📋 My Advertisements ({myAds.length})</div>
          {myAds.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>No ads yet. Create your first ad!</div>}
          {myAds.map(ad => (
            <div key={ad.id} style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 42, height: 42, borderRadius: 10, background: ad.status === 'active' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                {ad.type === 'video' ? 'x}' : 'x️'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.88rem', color: '#f1f5f9', fontWeight: 600 }}>{ad.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.35)', marginTop: 3 }}>{ad.date} ⬢ {ad.views} views</div>
              </div>
              <span style={{ padding: '4px 12px', borderRadius: 20, fontSize: '0.72rem', fontWeight: 600, background: ad.status === 'active' ? 'rgba(74,222,128,0.15)' : 'rgba(251,191,36,0.15)', color: ad.status === 'active' ? '#4ade80' : '#fbbf24' }}>
                {ad.status === 'active' ? ' Live' : '⏳ Pending'}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Browse Active Ads */}
      {tab === 'browse' && (
        <div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {myAds.filter(a => a.status === 'active').map(ad => (
              <div key={ad.id} style={{ ...G.glass, borderRadius: 14, overflow: 'hidden' }}>
                <div style={{ height: 140, background: 'linear-gradient(135deg, rgba(245,158,11,0.2), rgba(251,191,36,0.1))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  {ad.type === 'video' ? 'x}' : 'x️'}
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.92rem', marginBottom: 6 }}>{ad.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.4)' }}>by {ad.by} ⬢ {ad.views} views</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
