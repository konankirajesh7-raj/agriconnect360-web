import React, { useState } from 'react';

export default function DownloadPage() {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = () => {
    setDownloading(true);
    setTimeout(() => setDownloading(false), 3000);
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #0a1628 0%, #1a2744 50%, #0f2027 100%)',
      padding: '20px', fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <div style={{
        maxWidth: 420, width: '100%', textAlign: 'center',
        background: 'rgba(255,255,255,0.04)', borderRadius: 24,
        border: '1px solid rgba(255,255,255,0.08)', padding: '40px 28px',
        backdropFilter: 'blur(20px)',
      }}>
        {/* App Icon */}
        <div style={{
          width: 96, height: 96, borderRadius: 24, margin: '0 auto 20px',
          background: 'linear-gradient(135deg, #10b981, #059669)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 32px rgba(16,185,129,0.3)',
        }}>
          <span style={{ fontSize: '2.5rem' }}>🌾</span>
        </div>

        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, color: '#fff', margin: '0 0 4px', letterSpacing: '-0.02em' }}>
          RythuSphere
        </h1>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: '0 0 24px' }}>
          Smart Farming Platform for Andhra Pradesh
        </p>

        {/* Version Info */}
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 16, marginBottom: 24,
          fontSize: '0.72rem', color: '#64748b',
        }}>
          <span>v1.0.0</span>
          <span>⬢</span>
          <span>1.3 MB</span>
          <span>⬢</span>
          <span>Android 5.0+</span>
        </div>

        {/* Download Button */}
        <a
          href="/RythuSphere.apk"
          download
          onClick={handleDownload}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12,
            width: '100%', padding: '16px 24px', borderRadius: 16,
            background: 'linear-gradient(135deg, #10b981, #059669)',
            color: '#fff', fontWeight: 700, fontSize: '1.1rem',
            textDecoration: 'none', border: 'none', cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(16,185,129,0.3)',
            transition: 'all 0.2s', boxSizing: 'border-box',
          }}
        >
          {downloading ? (
            <span>⏳ Downloading...</span>
          ) : (
            <>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7 10 12 15 17 10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              Download APK —Free
            </>
          )}
        </a>

        {/* OR Separator */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 12, margin: '20px 0',
          color: '#475569', fontSize: '0.75rem',
        }}>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
          <span>OR</span>
          <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.1)' }} />
        </div>

        {/* PWA Install Option */}
        <a
          href="/"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            width: '100%', padding: '12px 24px', borderRadius: 12,
            background: 'rgba(255,255,255,0.06)', color: '#94a3b8',
            fontWeight: 600, fontSize: '0.85rem', textDecoration: 'none',
            border: '1px solid rgba(255,255,255,0.1)', boxSizing: 'border-box',
            transition: 'all 0.2s',
          }}
        >
          🌾 Open in Browser (No Download)
        </a>

        {/* Installation Instructions */}
        <div style={{
          marginTop: 28, textAlign: 'left',
          background: 'rgba(255,255,255,0.03)', borderRadius: 16,
          padding: '16px 20px', border: '1px solid rgba(255,255,255,0.06)',
        }}>
          <div style={{ fontSize: '0.78rem', fontWeight: 700, color: '#e2e8f0', marginBottom: 12 }}>
            📋 Installation Steps:
          </div>
          {[
            'Tap "Download APK" above',
            'Open the downloaded file',
            'If prompted, allow "Install from unknown sources"',
            'Tap "Install" and open the app!',
          ].map((step, i) => (
            <div key={i} style={{
              display: 'flex', gap: 10, alignItems: 'flex-start', padding: '6px 0',
              fontSize: '0.75rem', color: '#94a3b8', lineHeight: 1.5,
            }}>
              <span style={{
                width: 20, height: 20, borderRadius: '50%', flexShrink: 0,
                background: 'rgba(16,185,129,0.15)', color: '#10b981',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '0.65rem', fontWeight: 700,
              }}>{i + 1}</span>
              <span>{step}</span>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8,
          marginTop: 20,
        }}>
          {[
            { icon: '📱', label: 'Works Offline' },
            { icon: 'x', label: 'Secure' },
            { icon: '⚠', label: 'Super Fast' },
          ].map(f => (
            <div key={f.label} style={{
              padding: '10px 6px', borderRadius: 10,
              background: 'rgba(255,255,255,0.03)', textAlign: 'center',
              border: '1px solid rgba(255,255,255,0.05)',
            }}>
              <div style={{ fontSize: '1.2rem' }}>{f.icon}</div>
              <div style={{ fontSize: '0.6rem', color: '#64748b', marginTop: 4 }}>{f.label}</div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <p style={{ fontSize: '0.65rem', color: '#475569', marginTop: 24, lineHeight: 1.6 }}>
          By downloading, you agree to our Terms of Service.<br />
          Free forever. No ads. No data selling.
        </p>
      </div>
    </div>
  );
}
