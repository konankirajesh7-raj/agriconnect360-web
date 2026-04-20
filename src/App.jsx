import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './lib/hooks/useAuth';

// Critical path — eagerly loaded
import Dashboard from './pages/Dashboard';
import LoginPage from './pages/LoginPage';

// Lazy-loaded pages (code splitting for performance)
const FarmersPage = lazy(() => import('./pages/FarmersPage'));
const FieldsPage = lazy(() => import('./pages/FieldsPage'));
const CropsPage = lazy(() => import('./pages/CropsPage'));
const MarketPricesPage = lazy(() => import('./pages/MarketPricesPage'));
const SalesPage = lazy(() => import('./pages/SalesPage'));
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'));
const SoilPage = lazy(() => import('./pages/SoilPage'));
const LabourPage = lazy(() => import('./pages/LabourPage'));
const TransportPage = lazy(() => import('./pages/TransportPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const EquipmentPage = lazy(() => import('./pages/EquipmentPage'));
const DisputesPage = lazy(() => import('./pages/DisputesPage'));
const SchemesPage = lazy(() => import('./pages/SchemesPage'));
const KnowledgePage = lazy(() => import('./pages/KnowledgePage'));
const QAPage = lazy(() => import('./pages/QAPage'));
const NetworkPage = lazy(() => import('./pages/NetworkPage'));
const WeatherPage = lazy(() => import('./pages/WeatherPage'));
const AIPage = lazy(() => import('./pages/AIPage'));
const WalletPage = lazy(() => import('./pages/WalletPage'));
const InsurancePage = lazy(() => import('./pages/InsurancePage'));
const DronePage = lazy(() => import('./pages/DronePage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const HomePage = lazy(() => import('./pages/public/HomePage'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const ContactPublicPage = lazy(() => import('./pages/public/ContactPublicPage'));

const NAV_SECTIONS = [
  {
    label: 'Overview',
    items: [
      { path: '/', icon: '📊', label: 'Dashboard' },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ],
  },
  {
    label: 'Farmers',
    items: [
      { path: '/farmers', icon: '👨‍🌾', label: 'Farmers', badge: '5K' },
      { path: '/fields', icon: '🌾', label: 'Fields' },
      { path: '/crops', icon: '🌱', label: 'Crop Tracking' },
      { path: '/network', icon: '🤝', label: 'Network' },
    ],
  },
  {
    label: 'Finance',
    items: [
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
      { path: '/sales', icon: '🧾', label: 'Sales & Profit' },
      { path: '/expenses', icon: '💳', label: 'Expenses' },
      { path: '/wallet', icon: '💳', label: 'Wallet' },
      { path: '/insurance', icon: '🛡️', label: 'Insurance' },
    ],
  },
  {
    label: 'Services',
    items: [
      { path: '/labour', icon: '👷', label: 'Labour Bookings' },
      { path: '/transport', icon: '🚛', label: 'Transport' },
      { path: '/suppliers', icon: '🏪', label: 'Suppliers' },
      { path: '/equipment', icon: '🚜', label: 'Equipment' },
    ],
  },
  {
    label: 'Knowledge',
    items: [
      { path: '/soil', icon: '🧪', label: 'Soil & Water' },
      { path: '/schemes', icon: '🏛️', label: 'Gov Schemes' },
      { path: '/knowledge', icon: '📚', label: 'Knowledge' },
      { path: '/qa', icon: '❓', label: 'Q&A Forum' },
    ],
  },
  {
    label: 'Admin',
    items: [
      { path: '/disputes', icon: '⚖️', label: 'Disputes' },
      { path: '/drones', icon: '🛸', label: 'Drone Reports' },
      { path: '/contact', icon: '📞', label: 'Expert Connect' },
      { path: '/ai', icon: '🤖', label: 'AI Advisory', highlight: true },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ],
  },
];

// Public routes that bypass admin layout
const PUBLIC_PREFIXES = ['/home', '/features', '/about', '/pricing', '/contact-us', '/login', '/landing'];

// Loading skeleton for Suspense fallback
function PageSkeleton() {
  return (
    <div style={{ padding: '32px', animation: 'fadeIn 0.3s ease' }}>
      <div style={{ height: 28, width: 200, background: 'var(--bg-card)', borderRadius: 8, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16, marginBottom: 24 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ height: 120, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
      <div style={{ height: 300, background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', animation: 'pulse 1.5s infinite' }} />
      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
      `}</style>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
}

// Global search data
const SEARCH_INDEX = [
  ...NAV_SECTIONS.flatMap(s => s.items).map(i => ({ type: 'page', label: i.label, icon: i.icon, path: i.path })),
  { type: 'feature', label: 'Pan-India Price Heatmap', icon: '🗺️', path: '/market-prices' },
  { type: 'feature', label: 'Best Mandi Finder', icon: '🏆', path: '/market-prices' },
  { type: 'feature', label: 'PaySure Escrow', icon: '🔒', path: '/labour' },
  { type: 'feature', label: 'Live Transport Tracking', icon: '📍', path: '/transport' },
  { type: 'feature', label: 'Input Store', icon: '🛒', path: '/suppliers' },
  { type: 'feature', label: 'Profit Calculator', icon: '💰', path: '/sales' },
  { type: 'feature', label: 'Budget Tracker', icon: '🎯', path: '/expenses' },
  { type: 'feature', label: 'Eligibility Checker', icon: '✅', path: '/schemes' },
  { type: 'feature', label: 'Community Feed', icon: '📱', path: '/network' },
  { type: 'feature', label: 'Soil Health Card', icon: '📋', path: '/soil' },
  { type: 'feature', label: 'Crop Calendar', icon: '📅', path: '/crops' },
  { type: 'feature', label: 'Equipment Marketplace', icon: '🚜', path: '/equipment' },
  { type: 'feature', label: 'AI Crop Recommender', icon: '🤖', path: '/ai' },
  { type: 'feature', label: 'Pest & Disease Detector', icon: '🐛', path: '/ai' },
  { type: 'crop', label: 'Cotton', icon: '🌿', path: '/crops' },
  { type: 'crop', label: 'Paddy', icon: '🌾', path: '/crops' },
  { type: 'crop', label: 'Wheat', icon: '🌾', path: '/crops' },
  { type: 'crop', label: 'Sugarcane', icon: '🌿', path: '/crops' },
  { type: 'scheme', label: 'PM-KISAN', icon: '🏛️', path: '/schemes' },
  { type: 'scheme', label: 'Fasal Bima Yojana', icon: '🛡️', path: '/schemes' },
  { type: 'scheme', label: 'Kisan Credit Card', icon: '🏦', path: '/schemes' },
];

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHighlight, setSearchHighlight] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);

  const NOTIFICATIONS = [
    { id: 1, icon: '🌧️', title: 'Heavy Rain Alert — Hubli', time: '10 min ago', type: 'warning', read: false },
    { id: 2, icon: '💰', title: 'Cotton price up ₹200/Q at Dharwad APMC', time: '1 hour ago', type: 'success', read: false },
    { id: 3, icon: '🌱', title: 'Crop calendar: Apply fertilizer (Paddy Day 45)', time: '3 hours ago', type: 'info', read: false },
    { id: 4, icon: '🛡️', title: 'PMFBY claim approved — ₹42,000 credited', time: '1 day ago', type: 'success', read: true },
    { id: 5, icon: '📋', title: 'Soil test results ready — North Field', time: '2 days ago', type: 'info', read: true },
  ];

  const allItems = NAV_SECTIONS.flatMap(s => s.items);
  const currentPage = allItems.find(n => n.path === location.pathname);
  const isLogin = location.pathname === '/login';

  const searchResults = searchQuery.length > 0
    ? SEARCH_INDEX.filter(i => i.label.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 10)
    : SEARCH_INDEX.filter(i => i.type === 'page').slice(0, 8);

  // Ctrl+K global shortcut
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') { e.preventDefault(); setSearchOpen(true); setSearchQuery(''); }
      if (e.key === 'Escape') setSearchOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSearchSelect = useCallback((item) => {
    setSearchOpen(false);
    setSearchQuery('');
    navigate(item.path);
  }, [navigate]);

  const { signOut: authSignOut, farmerProfile } = useAuth();
  const handleLogout = async () => {
    await authSignOut();
    navigate('/login');
  };

  const isPublic = PUBLIC_PREFIXES.some(p => location.pathname === p || location.pathname.startsWith(p + '/'));

  // Public website pages — render with PublicLayout (no admin sidebar)
  if (isPublic) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route element={<PublicLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact-us" element={<ContactPublicPage />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <nav className={`sidebar${sidebarOpen ? '' : ' collapsed'}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌾</div>
          <div>
            <div className="sidebar-logo-text">Agri Connect 360</div>
            <div className="sidebar-logo-sub">Admin Dashboard</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {NAV_SECTIONS.map(section => (
            <div key={section.label}>
              <div className="nav-section-label">{section.label}</div>
              {section.items.map(item => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  className={({ isActive }) =>
                    `nav-item${isActive ? ' active' : ''}${item.highlight ? ' nav-ai' : ''}`
                  }
                >
                  <span className="icon">{item.icon}</span>
                  {item.label}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                  {item.highlight && <span className="nav-badge nav-badge-ai">NEW</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* System status */}
        <div style={{ padding: '16px', borderTop: '1px solid var(--border)', margin: '8px 0 0' }}>
          <div style={{ background: 'var(--green-glow)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: '1px solid rgba(34,197,94,0.2)' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green-primary)', marginBottom: 4 }}>🟢 System Operational</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>22 modules active</div>
          </div>
        </div>
      </nav>

      {/* Search Overlay */}
      {searchOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: '15vh', backdropFilter: 'blur(4px)' }}
          onClick={() => setSearchOpen(false)}>
          <div style={{ width: 560, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border)', boxShadow: '0 20px 60px rgba(0,0,0,0.4)', overflow: 'hidden' }}
            onClick={e => e.stopPropagation()}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: '1.1rem' }}>🔍</span>
              <input autoFocus value={searchQuery} onChange={e => { setSearchQuery(e.target.value); setSearchHighlight(0); }}
                onKeyDown={e => {
                  if (e.key === 'ArrowDown') { e.preventDefault(); setSearchHighlight(h => Math.min(h + 1, searchResults.length - 1)); }
                  if (e.key === 'ArrowUp') { e.preventDefault(); setSearchHighlight(h => Math.max(h - 1, 0)); }
                  if (e.key === 'Enter' && searchResults[searchHighlight]) { handleSearchSelect(searchResults[searchHighlight]); }
                }}
                placeholder="Search pages, features, crops, schemes..."
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', color: 'var(--text-primary)', fontSize: '1rem' }} />
              <kbd style={{ background: 'var(--bg-primary)', padding: '3px 8px', borderRadius: 4, fontSize: '0.7rem', color: 'var(--text-muted)', border: '1px solid var(--border)' }}>ESC</kbd>
            </div>
            <div style={{ maxHeight: 400, overflowY: 'auto', padding: '8px' }}>
              {searchResults.length === 0 ? (
                <div style={{ padding: '30px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>No results found</div>
              ) : searchResults.map((item, i) => (
                <div key={`${item.type}-${item.label}`} onClick={() => handleSearchSelect(item)}
                  style={{
                    padding: '10px 14px', borderRadius: 8, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10,
                    background: i === searchHighlight ? 'rgba(59,130,246,0.12)' : 'transparent',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={() => setSearchHighlight(i)}>
                  <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-primary)' }}>{item.label}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'capitalize' }}>{item.type}</div>
                  </div>
                  {i === searchHighlight && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>↵ Enter</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button className="header-btn" onClick={() => setSidebarOpen(v => !v)}>☰</button>
          <div className="header-title">{currentPage?.icon} {currentPage?.label || 'Dashboard'}</div>
        </div>
        <div className="header-right">
          <button className="header-btn" onClick={() => { setSearchOpen(true); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            🔍 Search <kbd style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', color: 'var(--text-muted)', border: '1px solid var(--border)', marginLeft: 4 }}>Ctrl+K</kbd>
          </button>
          <button className="header-btn" onClick={() => setNotifOpen(v => !v)} style={{ position: 'relative' }}>
            🔔 <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          </button>
          {notifOpen && (
            <div style={{ position: 'absolute', top: 48, right: 120, width: 360, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', zIndex: 500, overflow: 'hidden' }}>
              <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 700, fontSize: '0.88rem' }}>🔔 Notifications</span>
                <span style={{ fontSize: '0.7rem', color: '#3b82f6', cursor: 'pointer' }}>Mark all read</span>
              </div>
              {NOTIFICATIONS.map(n => (
                <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid var(--border)', background: n.read ? 'transparent' : 'rgba(59,130,246,0.04)', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
                  <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>{n.icon}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.82rem', fontWeight: n.read ? 400 : 600, color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: 2 }}>{n.time}</div>
                  </div>
                  {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginTop: 6, flexShrink: 0 }} />}
                </div>
              ))}
              <div style={{ padding: '10px', textAlign: 'center' }}>
                <span style={{ fontSize: '0.78rem', color: '#3b82f6', cursor: 'pointer', fontWeight: 600 }}>View All Notifications →</span>
              </div>
            </div>
          )}
          <a href="http://localhost:3000/api-docs" target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>📚 API Docs</a>
          <button className="header-btn" onClick={handleLogout}>👤 Logout</button>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/farmers" element={<ProtectedRoute><FarmersPage /></ProtectedRoute>} />
          <Route path="/fields" element={<ProtectedRoute><FieldsPage /></ProtectedRoute>} />
          <Route path="/crops" element={<ProtectedRoute><CropsPage /></ProtectedRoute>} />
          <Route path="/market-prices" element={<ProtectedRoute><MarketPricesPage /></ProtectedRoute>} />
          <Route path="/sales" element={<ProtectedRoute><SalesPage /></ProtectedRoute>} />
          <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
          <Route path="/soil" element={<ProtectedRoute><SoilPage /></ProtectedRoute>} />
          <Route path="/labour" element={<ProtectedRoute><LabourPage /></ProtectedRoute>} />
          <Route path="/transport" element={<ProtectedRoute><TransportPage /></ProtectedRoute>} />
          <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
          <Route path="/equipment" element={<ProtectedRoute><EquipmentPage /></ProtectedRoute>} />
          <Route path="/disputes" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
          <Route path="/schemes" element={<ProtectedRoute><SchemesPage /></ProtectedRoute>} />
          <Route path="/knowledge" element={<ProtectedRoute><KnowledgePage /></ProtectedRoute>} />
          <Route path="/qa" element={<ProtectedRoute><QAPage /></ProtectedRoute>} />
          <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
          <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
          <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
          <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
          <Route path="/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
          <Route path="/drones" element={<ProtectedRoute><DronePage /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />
          {/* Public Website Routes — Phase 6 & 7 */}
          <Route element={<PublicLayout />}>
            <Route path="/home" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact-us" element={<ContactPublicPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Suspense>
      </main>
    </div>
  );
}
