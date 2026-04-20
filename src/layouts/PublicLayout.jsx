import React, { useState, useEffect } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';

const NAV_LINKS = [
  { to: '/features', label: 'Features' },
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
    <div style={{ minHeight: '100vh', background: '#0d1117', color: '#e2e8f0' }}>

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
              <div style={{ fontSize: '0.62rem', color: '#22c55e', fontWeight: 600 }}>Andhra Pradesh</div>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, '@media (max-width: 768px)': { display: 'none' } }}>
            {NAV_LINKS.map(link => (
              <NavLink key={link.to} to={link.to} style={({ isActive }) => ({
                padding: '8px 14px', borderRadius: 8, textDecoration: 'none',
                fontSize: '0.88rem', fontWeight: 600, transition: 'all 0.2s',
                color: isActive ? '#22c55e' : '#94a3b8',
                background: isActive ? 'rgba(34,197,94,0.08)' : 'transparent',
              })}
              onMouseEnter={e => { if (!e.currentTarget.className.includes('active')) { e.currentTarget.style.color = '#e2e8f0'; } }}
              onMouseLeave={e => { if (!e.currentTarget.className.includes('active')) { e.currentTarget.style.color = '#94a3b8'; } }}>
                {link.label}
              </NavLink>
            ))}
          </div>

          {/* CTA Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Link to="/login" style={{
              padding: '8px 16px', borderRadius: 8, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 600, color: '#94a3b8',
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.color = '#e2e8f0'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; }}
            onMouseLeave={e => { e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              Login
            </Link>
            <Link to="/login" style={{
              padding: '9px 18px', borderRadius: 8, textDecoration: 'none',
              fontSize: '0.85rem', fontWeight: 700, color: '#000',
              background: 'linear-gradient(135deg, #22c55e, #16a34a)',
              boxShadow: '0 2px 12px rgba(34,197,94,0.25)',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(34,197,94,0.35)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 2px 12px rgba(34,197,94,0.25)'; }}>
              🌾 Get Started
            </Link>
            {/* Mobile hamburger */}
            <button onClick={() => setMobileOpen(!mobileOpen)} style={{
              display: 'none', '@media (max-width: 768px)': { display: 'block' },
              background: 'none', border: '1px solid rgba(255,255,255,0.1)',
              color: '#94a3b8', padding: '8px 12px', borderRadius: 8, cursor: 'pointer', fontSize: '1rem',
            }}>☰</button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div style={{ background: 'rgba(13,17,23,0.98)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '16px 24px' }}>
            {NAV_LINKS.map(link => (
              <Link key={link.to} to={link.to} style={{ display: 'block', padding: '12px 0', color: '#94a3b8', textDecoration: 'none', fontSize: '0.95rem', fontWeight: 600, borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
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
      <footer style={{
        background: 'rgba(255,255,255,0.01)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        padding: '60px 40px 32px',
      }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr', gap: 40, marginBottom: 48 }}>

            {/* Brand */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <div style={{ width: 34, height: 34, background: 'linear-gradient(135deg, #22c55e, #16a34a)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>🌾</div>
                <div>
                  <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.98rem' }}>AgriConnect 360</div>
                  <div style={{ fontSize: '0.6rem', color: '#22c55e' }}>Andhra Pradesh</div>
                </div>
              </div>
              <p style={{ fontSize: '0.8rem', color: '#475569', lineHeight: 1.7, marginBottom: 20 }}>
                India's most comprehensive agricultural platform built specifically for Andhra Pradesh farmers. 24 AI-powered modules, Telugu-first design.
              </p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['తెలుగు', 'हिन्दी', 'English'].map(l => (
                  <span key={l} style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.2)', color: '#22c55e', padding: '3px 10px', borderRadius: 20, fontSize: '0.7rem', fontWeight: 600 }}>{l}</span>
                ))}
              </div>
            </div>

            {/* Platform */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Platform</div>
              {['Features', 'Pricing', 'About Us', 'Blog', 'API Docs'].map(l => (
                <Link key={l} to={l === 'Features' ? '/features' : l === 'Pricing' ? '/pricing' : l === 'About Us' ? '/about' : '#'}
                  style={{ display: 'block', padding: '5px 0', fontSize: '0.82rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#22c55e'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>{l}</Link>
              ))}
            </div>

            {/* Modules */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Modules</div>
              {['Weather AI', 'Market Prices', 'Crop Advisory', 'Soil Health', 'Gov Schemes', 'Insurance'].map(l => (
                <div key={l} style={{ padding: '5px 0', fontSize: '0.82rem', color: '#475569' }}>{l}</div>
              ))}
            </div>

            {/* Support */}
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 16 }}>Support</div>
              {['Help Center', 'Contact Us', 'Privacy Policy', 'Terms of Service', 'Sitemap'].map(l => (
                <Link key={l} to={l === 'Contact Us' ? '/contact-us' : '#'}
                  style={{ display: 'block', padding: '5px 0', fontSize: '0.82rem', color: '#475569', textDecoration: 'none', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.target.style.color = '#22c55e'}
                  onMouseLeave={e => e.target.style.color = '#475569'}>{l}</Link>
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
                <div style={{ marginTop: 8, fontSize: '0.72rem', color: '#374151' }}>Mon–Sun, 6 AM – 9 PM</div>
              </div>
            </div>
          </div>

          {/* Bottom bar */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.04)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ fontSize: '0.78rem', color: '#374151' }}>
              © 2026 AgriConnect 360 — Built with 💚 for Andhra Pradesh Farmers
            </div>
            <div style={{ display: 'flex', gap: 20 }}>
              {['Privacy', 'Terms', 'Sitemap'].map(l => (
                <a key={l} href="#" style={{ fontSize: '0.75rem', color: '#374151', textDecoration: 'none' }}>{l}</a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
