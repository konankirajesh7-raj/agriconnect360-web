import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../lib/hooks/useAuth';

/**
 * AdPopup — Shows location-targeted approved ads as popups/banners.
 * Displays one ad at a time, rotates every 15s, respects dismiss.
 * Filters by user's district for local/district ads, shows all state ads.
 */
export default function AdPopup() {
  const { user, farmerProfile } = useAuth();
  const [ads, setAds] = useState([]);
  const [current, setCurrent] = useState(0);
  const [dismissed, setDismissed] = useState([]);
  const [minimized, setMinimized] = useState(false);
  const userDistrict = farmerProfile?.district || 'Guntur';

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase.from('ads').select('*').eq('status', 'approved').order('created_at', { ascending: false }).limit(20);
        if (data?.length) {
          // Filter by location
          const visible = data.filter(ad => {
            if (ad.reach === 'state') return true;
            if (ad.reach === 'district' && ad.district === userDistrict) return true;
            if (ad.reach === 'local') return ad.district === userDistrict;
            return false;
          });
          setAds(visible);
          // Track view
          if (visible.length > 0) {
            supabase.from('ads').update({ views: (visible[0].views || 0) + 1 }).eq('id', visible[0].id).then(() => {});
          }
        }
      } catch {}
    })();
  }, [userDistrict]);

  // Rotate ads every 15s
  useEffect(() => {
    if (ads.length <= 1) return;
    const t = setInterval(() => {
      setCurrent(c => {
        let next = (c + 1) % ads.length;
        while (dismissed.includes(ads[next]?.id) && next !== c) next = (next + 1) % ads.length;
        return next;
      });
    }, 15000);
    return () => clearInterval(t);
  }, [ads, dismissed]);

  const visibleAds = ads.filter(a => !dismissed.includes(a.id));
  if (visibleAds.length === 0) return null;

  const ad = ads[current % ads.length];
  if (!ad || dismissed.includes(ad.id)) return null;

  const reachColors = { local: '#fbbf24', district: '#60a5fa', state: '#c4b5fd' };
  const reachLabels = { local: '📍 Local', district: '🏘️ District', state: '🗺️ AP Wide' };

  if (minimized) {
    return (
      <div onClick={() => setMinimized(false)} style={{
        position: 'fixed', bottom: 20, right: 20, zIndex: 999,
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, #f59e0b, #d97706)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        cursor: 'pointer', boxShadow: '0 4px 20px rgba(245,158,11,0.4)',
        animation: 'adPulse 2s ease-in-out infinite',
        fontSize: '1.2rem',
      }}>
        📢
        <style>{`@keyframes adPulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}`}</style>
        {visibleAds.length > 1 && <div style={{
          position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, borderRadius: 9,
          background: '#ef4444', color: '#fff', fontSize: '0.6rem', fontWeight: 700,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>{visibleAds.length}</div>}
      </div>
    );
  }

  return (
    <div style={{
      position: 'fixed', bottom: 20, right: 20, zIndex: 999,
      width: 340, maxWidth: 'calc(100vw - 40px)',
      background: 'rgba(15, 23, 42, 0.95)', backdropFilter: 'blur(20px)',
      borderRadius: 16, border: '1px solid rgba(245,158,11,0.25)',
      boxShadow: '0 8px 40px rgba(0,0,0,0.5)',
      animation: 'adSlide 0.3s ease',
      overflow: 'hidden',
    }}>
      <style>{`@keyframes adSlide{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}`}</style>
      
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 14px', borderBottom: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(245,158,11,0.06)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#fbbf24' }}>📢 Sponsored</span>
          <span style={{
            fontSize: '0.6rem', padding: '1px 6px', borderRadius: 6,
            background: `${reachColors[ad.reach]}20`, color: reachColors[ad.reach],
          }}>{reachLabels[ad.reach] || '📍'}</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => setMinimized(true)} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer', fontSize: '0.7rem', padding: '2px 4px',
          }}>➖</button>
          <button onClick={() => setDismissed(p => [...p, ad.id])} style={{
            background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)',
            cursor: 'pointer', fontSize: '0.7rem', padding: '2px 4px',
          }}>✕</button>
        </div>
      </div>

      {/* Media */}
      {ad.media_url && !ad.media_url.startsWith('data:') && (
        <div style={{ height: 120, overflow: 'hidden' }}>
          {ad.media_type === 'video' ? (
            <video src={ad.media_url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted autoPlay loop />
          ) : (
            <img src={ad.media_url} alt={ad.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          )}
        </div>
      )}

      {/* Content */}
      <div style={{ padding: '12px 14px' }}>
        <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: '0.88rem', marginBottom: 4, lineHeight: 1.3 }}>{ad.title}</div>
        <div style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.45)', marginBottom: 8, lineHeight: 1.4 }}>
          {ad.description?.substring(0, 100)}{ad.description?.length > 100 ? '...' : ''}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.25)' }}>
            by {ad.advertiser_name || 'Advertiser'} • {ad.district}
          </span>
          <span style={{
            padding: '2px 8px', borderRadius: 6, fontSize: '0.62rem',
            background: 'rgba(139,92,246,0.12)', color: '#c4b5fd',
          }}>{ad.role}</span>
        </div>
      </div>

      {/* Navigation dots */}
      {visibleAds.length > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 4,
          padding: '0 14px 10px',
        }}>
          {visibleAds.slice(0, 5).map((_, i) => (
            <div key={i} style={{
              width: current % visibleAds.length === i ? 16 : 5, height: 5,
              borderRadius: 3, background: current % visibleAds.length === i ? '#f59e0b' : 'rgba(255,255,255,0.15)',
              transition: 'all 0.3s',
            }} />
          ))}
          {visibleAds.length > 5 && <span style={{ fontSize: '0.55rem', color: 'rgba(255,255,255,0.2)' }}>+{visibleAds.length - 5}</span>}
        </div>
      )}
    </div>
  );
}
