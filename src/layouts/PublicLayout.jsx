import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

/* ── Responsive CSS that inline styles can't handle ── */
const responsiveCSS = `
  .pub-nav-links { display: flex; align-items: center; gap: 6px; }
  .pub-hamburger { display: none !important; }
  .pub-cta-desktop { display: flex; }
  .pub-footer-grid { grid-template-columns: 2fr 1fr 1fr 1fr 1fr; }
  .pub-page-root { overflow-x: hidden; }
  @media (max-width: 768px) {
    .pub-nav-links { display: none !important; }
    .pub-hamburger { display: flex !important; align-items: center; justify-content: center; }
    .pub-cta-desktop { display: none !important; }
    .pub-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 24px !important; }
    .pub-footer-bottom { flex-direction: column; text-align: center; }
    .pub-footer-wrap { padding: 40px 20px 24px !important; }
  }
  @media (max-width: 480px) {
    .pub-footer-grid { grid-template-columns: 1fr !important; }
  }
`;

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
  { to: '/market', label: 'Market Prices' },
  { to: '/public-weather', label: 'Weather' },
  { to: '/pricing', label: 'Pricing' },
  { to: '/about', label: 'About' },
  { to: '/contact-us', label: 'Contact' },
];

export default function PublicLayout() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler);
    return () => window.removeEventListener('scroll', handler);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="pub-page-root" style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0' }}>
      <style>{responsiveCSS}</style>

      {/* ── STICKY NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? 'rgba(13,17,23,0.97)' : 'rgba(13,17,23,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
        transition: 'all 0.3s',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 32px', height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 38, height: 38,
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.3rem', boxShadow: '0 0 20px rgba(34,197,94,0.25)',
            }}>🌾</div>
            <div>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#e2e8f0', lineHeight: 1 }}>AgriConnect 360</div>
              <div style={{ fontSize: '0.75rem', color: '#22c55e', fontWeight: 600 }}>Andhra Pradesh</div>
            </div>
          </Link>

          {/* Desktop Nav — hidden on mobile via className */}
          <div className="pub-nav-links">
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
                padding: '10px 16px', borderRadius: 8, textDecoration: 'none',
                fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s',
                minHeight: 44, display: 'flex', alignItems: 'center',
                color: isActive ? '#22c55e' : '#94a3b8',
                background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
              })}
              onMouseEnter={e => { if (!e.currentTarget.className.includes('active')) { e.currentTarget.style.color = '#e2e8f0'; } }}
              onMouseLeave={e => { if (!e.currentTarget.className.includes('active')) { e.currentTarget.style.color = '#94a3b8'; } }}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* CTA Buttons — desktop */}
          <div className="pub-cta-desktop" style={{ alignItems: 'center', gap: 10 }}>
            <Link to="/login" style={{
              padding: '10px 18px', borderRadius: 8, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s', minHeight: 44, display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              Login
            </Link>
            <Link to="/login" style={{
              padding: '10px 20px', borderRadius: 8, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 700, color: '#000',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 2px 12px rgba(34,197,94,0.25)',
              transition: 'all 0.2s', minHeight: 44, display: 'flex', alignItems: 'center',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(34,197,94,0.25)'; }}>
              🌾 Get Started
            </Link>
          </div>
          {/* Mobile hamburger — visible only on mobile */}
          <button className="pub-hamburger" onClick={() => setMobileOpen(!mobileOpen)} style={{
            background: 'none', border: '1px solid rgba(255,255,255,0.15)',
            color: '#e2e8f0', width: 44, height: 44, borderRadius: 8, cursor: 'pointer',
            fontSize: '1.2rem',
          }}>{mobileOpen ? '✕' : '☰'}</button>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ background: 'rgba(13,17,23,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px' }}>
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to} style={{ display: 'block', padding: '14px 0', color: '#94a3b8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)', minHeight: 44 }}>
                {link.label}
              </Link>
            ))}
            <div style={{ paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '11px', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#94a3b8', textDecoration: 'none', fontWeight: 600 }}>Login</Link>
              <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '11px', background: '#22c55e', borderRadius: 8, color: '#000', textDecoration: 'none', fontWeight: 700 }}>🌾 Get Started Free</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Page Content — with top padding for fixed navbar */}
      <div style={{ paddingTop: 64 }}>
        <Outlet />
      </div>

      {/* ── FOOTER ── */}
      <footer className="pub-footer-wrap" style={{
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '60px 40px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="pub-footer-grid" style={{ display: 'grid', gap: 40, marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🌾</div>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.98rem' }}>AgriConnect 360</div>
                  <div style={{ fontSize: '0.75rem', color: '#22c55e' }}>Andhra Pradesh</div>
                </div>
              </div>
              <p style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
                India's most comprehensive agricultural platform built specifically for Andhra Pradesh farmers. 24 AI-powered modules, Telugu-first design.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['తెలుగు', 'हिन्दी', 'English'].map(l => (
                  <span key={l} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', padding: '4px 12px', borderRadius: 20, fontSize: '0.75rem', fontWeight: 600 }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Platform</div>
              {[
                { label: 'Features', to: '/features' },
                { label: 'Pricing', to: '/pricing' },
                { label: 'About Us', to: '/about' },
                { label: 'Blog', to: '/blog' },
                { label: 'Contact', to: '/contact-us' },
              ].map(l => (
                <Link key={l.label} to={l.to}
                  style={{ display: 'block', padding: '8px 0', fontSize: '0.82rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s', minHeight: 36 }}
                  onMouseEnter={e => e.target.style.color = '#22c55e'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>{l.label}</Link>
              ))}
            </div>

            {/* Modules */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Modules</div>
              {[
                { label: 'Weather AI', to: '/public-weather' },
                { label: 'Market Prices', to: '/market' },
                { label: 'Crop Advisory', to: '/features' },
                { label: 'Soil Health', to: '/features' },
                { label: 'Gov Schemes', to: '/features' },
                { label: 'Insurance', to: '/features' },
              ].map(l => (
                <Link key={l.label} to={l.to}
                  style={{ display: 'block', padding: '8px 0', fontSize: '0.82rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s', minHeight: 36 }}
                  onMouseEnter={e => e.target.style.color = '#22c55e'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>{l.label}</Link>
              ))}
            </div>

            {/* Support */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Support</div>
              {[
                { label: 'Help Center', href: '/contact-us', isRouter: true },
                { label: 'Contact Us', href: '/contact-us', isRouter: true },
                { label: 'Privacy Policy', href: '/privacy-policy.html', isRouter: false },
                { label: 'Terms of Service', href: '/terms-of-service.html', isRouter: false },
                { label: 'Sitemap', href: '/sitemap.xml', isRouter: false },
              ].map(l => (
                l.isRouter ? (
                  <Link key={l.label} to={l.href}
                    style={{ display: 'block', padding: '8px 0', fontSize: '0.82rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s', minHeight: 36 }}
                    onMouseEnter={e => e.target.style.color = '#22c55e'}
                    onMouseLeave={e => e.target.style.color = '#475569'}>{l.label}</Link>
                ) : (
                  <a key={l.label} href={l.href}
                    style={{ display: 'block', padding: '8px 0', fontSize: '0.82rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s', minHeight: 36 }}
                    onMouseEnter={e => e.target.style.color = '#22c55e'}
                    onMouseLeave={e => e.target.style.color = '#475569'}>{l.label}</a>
                )
              ))}
            </div>

            {/* Contact */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Contact</div>
              <div style={{ fontSize: '0.82rem', color: '#475569', lineHeight: 1.9 }}>
                <div>📞 1800-425-3434</div>
                <div>💬 +91 94400 12345</div>
                <div>📧 support@agriconnect360.in</div>
                <div style={{ marginTop: 8 }}>📍 Guntur, AP 522001</div>
                <div style={{ marginTop: 8, fontSize: '0.78rem', color: '#374151' }}>Mon–Sun, 6 AM – 9 PM</div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pub-footer-bottom" style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '0.78rem', color: '#374151' }}>
              © 2026 AgriConnect 360 — Built with 💚 for Andhra Pradesh Farmers
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {[
                { label: 'Privacy', href: '/privacy-policy.html' },
                { label: 'Terms', href: '/terms-of-service.html' },
                { label: 'Sitemap', href: '/sitemap.xml' },
              ].map(l => (
                <a key={l.label} href={l.href} style={{ fontSize: '0.75rem', color: '#374151', textDecoration: 'none', padding: '8px 4px', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{l.label}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
