import React, { useState, useEffect, useCallback } from 'react';

/**
 * DownloadAppPrompt — Premium PWA Install Prompt Component
 * 
 * Variants:
 *   - "fab"    → Floating action button (bottom-left)
 *   - "button" → Inline navbar button
 *   - "hero"   → Large hero-section download CTA card
 * 
 * How it works:
 *   - Chrome/Edge: Uses native `beforeinstallprompt` for one-tap install
 *   - Safari/iOS:  Shows step-by-step "Add to Home Screen" instructions
 *   - Other:       Shows Chrome/Edge install instructions
 */

// SVG Download Icon — reusable
const DownloadIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const PhoneIcon = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
    <line x1="12" y1="18" x2="12.01" y2="18" />
  </svg>
);

function getPlatform() {
  const ua = navigator.userAgent || '';
  if (/iPad|iPhone|iPod/.test(ua) && !window.MSStream) return 'ios';
  if (/android/i.test(ua)) return 'android';
  if (/macintosh|mac os x/i.test(ua)) return 'mac';
  return 'other';
}

function isStandalone() {
  return window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;
}

let deferredPrompt = null;

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    window.dispatchEvent(new Event('pwa-prompt-ready'));
  });
}

export function useInstallPrompt() {
  const [canInstall, setCanInstall] = useState(!!deferredPrompt);
  const [platform] = useState(getPlatform);
  const [isInstalled, setIsInstalled] = useState(isStandalone);

  useEffect(() => {
    const onReady = () => setCanInstall(true);
    const onInstalled = () => setIsInstalled(true);
    window.addEventListener('pwa-prompt-ready', onReady);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('pwa-prompt-ready', onReady);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  const triggerInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    deferredPrompt.prompt();
    const result = await deferredPrompt.userChoice;
    deferredPrompt = null;
    setCanInstall(false);
    return result.outcome === 'accepted';
  }, []);

  return { canInstall, platform, isInstalled, triggerInstall };
}

export default function DownloadAppPrompt({ variant = 'fab' }) {
  const { canInstall, platform, isInstalled, triggerInstall } = useInstallPrompt();
  const [showModal, setShowModal] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  if (isInstalled || dismissed) return null;

  const handleClick = async () => {
    if (canInstall) {
      const accepted = await triggerInstall();
      if (accepted) setDismissed(true);
    } else {
      setShowModal(true);
    }
  };

  const modal = showModal ? (
    <InstallModal
      platform={platform}
      onClose={() => setShowModal(false)}
      canInstall={canInstall}
      triggerInstall={triggerInstall}
    />
  ) : null;

  // ── FAB variant ──
  if (variant === 'fab') {
    return (
      <>
        <button className="download-app-fab" onClick={handleClick} id="download-app-btn">
          <span className="dl-icon">
            <DownloadIcon size={16} />
          </span>
          <span className="dl-text">Download App</span>
        </button>
        {modal}
      </>
    );
  }

  // ── Hero variant (large CTA card) ──
  if (variant === 'hero') {
    return (
      <>
        <div className="download-hero-card" onClick={handleClick} role="button" tabIndex={0}
          onKeyDown={e => e.key === 'Enter' && handleClick()}>
          <div className="dhc-icon">
            <DownloadIcon size={24} />
          </div>
          <div className="dhc-text">
            <div className="dhc-title">📲 Download RythuSphere</div>
            <div className="dhc-sub">Install free • Works offline • No app store needed</div>
          </div>
          <div className="dhc-arrow">→</div>
        </div>
        {modal}
      </>
    );
  }

  // ── Button variant (inline navbar) ──
  return (
    <>
      <button className="pub-download-btn" onClick={handleClick} id="download-app-inline">
        <span className="dl-badge">
          <DownloadIcon size={13} />
        </span>
        <span>Get App</span>
      </button>
      {modal}
    </>
  );
}

function InstallModal({ platform, onClose, canInstall, triggerInstall }) {
  const handleInstall = async () => {
    if (canInstall) {
      await triggerInstall();
      onClose();
    }
  };

  return (
    <div className="install-modal-overlay" onClick={onClose}>
      <div className="install-modal" onClick={e => e.stopPropagation()}>
        <div className="install-modal-icon">
          <PhoneIcon size={32} />
        </div>
        <h3>Install RythuSphere</h3>
        <p>
          Get the full app experience — works offline, fast loading, 
          push notifications, and home screen access.
        </p>

        {canInstall ? (
          <>
            <button className="install-modal-btn primary" onClick={handleInstall}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <DownloadIcon size={18} /> Install Now — Free
              </span>
            </button>
            <button className="install-modal-btn secondary" onClick={onClose}>
              Maybe Later
            </button>
            <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: 8 }}>
              ✅ No app store needed • Works offline • 2MB only
            </div>
          </>
        ) : platform === 'ios' ? (
          <>
            <div className="install-steps">
              <div className="install-step">
                <div className="install-step-num">1</div>
                <div>Tap the <strong style={{ color: '#e2e8f0' }}>Share</strong> button <span style={{ fontSize: '1.1rem' }}>⬆️</span> at the bottom of Safari</div>
              </div>
              <div className="install-step">
                <div className="install-step-num">2</div>
                <div>Scroll down and tap <strong style={{ color: '#e2e8f0' }}>Add to Home Screen</strong> <span style={{ fontSize: '1.1rem' }}>➕</span></div>
              </div>
              <div className="install-step">
                <div className="install-step-num">3</div>
                <div>Tap <strong style={{ color: '#e2e8f0' }}>Add</strong> in the top right corner</div>
              </div>
            </div>
            <button className="install-modal-btn secondary" onClick={onClose}>
              Got it!
            </button>
          </>
        ) : (
          <>
            <div className="install-steps">
              <div className="install-step">
                <div className="install-step-num">1</div>
                <div>Open this site in <strong style={{ color: '#e2e8f0' }}>Chrome</strong> or <strong style={{ color: '#e2e8f0' }}>Edge</strong></div>
              </div>
              <div className="install-step">
                <div className="install-step-num">2</div>
                <div>Tap <strong style={{ color: '#e2e8f0' }}>⋮ Menu</strong> (three dots top right)</div>
              </div>
              <div className="install-step">
                <div className="install-step-num">3</div>
                <div>Tap <strong style={{ color: '#e2e8f0' }}>Install app</strong> or <strong style={{ color: '#e2e8f0' }}>Add to Home screen</strong></div>
              </div>
            </div>
            <button className="install-modal-btn secondary" onClick={onClose}>
              Got it!
            </button>
          </>
        )}

        <div style={{ marginTop: 16, display: 'flex', justifyContent: 'center', gap: 16, fontSize: '0.72rem', color: '#475569' }}>
          <span>🔒 Secure</span>
          <span>📴 Works Offline</span>
          <span>⚡ Super Fast</span>
        </div>
      </div>
    </div>
  );
}
