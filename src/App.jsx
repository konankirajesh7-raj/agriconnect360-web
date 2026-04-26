import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './lib/hooks/useAuth';
import { triggerHaptic } from './lib/hooks/useMobile';
import { isOnboardingComplete } from './lib/phase11Persistence';
import { CookieConsentBanner } from './lib/consent.jsx';
import { GAMIFICATION_EVENT, getCoins, getStreakInfo, recordLogin } from './lib/services/gamificationService';

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
const PremiumUpgradesPage = lazy(() => import('./pages/PremiumUpgradesPage'));
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const FPOPage = lazy(() => import('./pages/FPOPage'));
const PublicLayout = lazy(() => import('./layouts/PublicLayout'));
const HomePage = lazy(() => import('./pages/public/HomePage'));
const FeaturesPage = lazy(() => import('./pages/public/FeaturesPage'));
const AboutPage = lazy(() => import('./pages/public/AboutPage'));
const PricingPage = lazy(() => import('./pages/public/PricingPage'));
const ContactPublicPage = lazy(() => import('./pages/public/ContactPublicPage'));
const PublicStorePage = lazy(() => import('./pages/public/PublicStorePage'));
const PublicPricesPage = lazy(() => import('./pages/public/PublicPricesPage'));
const PublicWeatherPage = lazy(() => import('./pages/public/PublicWeatherPage'));
const BlogPage = lazy(() => import('./pages/public/BlogPage'));
const FinancialServicesPage = lazy(() => import('./pages/FinancialServicesPage'));
const GamificationPage = lazy(() => import('./pages/GamificationPage'));
const IndustrialDashboardPage = lazy(() => import('./pages/IndustrialDashboardPage'));
const BrokerDashboardPage = lazy(() => import('./pages/BrokerDashboardPage'));
const SupplierDashboardPage = lazy(() => import('./pages/SupplierDashboardPage'));
const LabourDashboardPage = lazy(() => import('./pages/LabourDashboardPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const MarketplacePage = lazy(() => import('./pages/MarketplacePage'));
const CommunityPage = lazy(() => import('./pages/CommunityPage'));
const NotificationsPage = lazy(() => import('./pages/NotificationsPage'));
const TaskManagerPage = lazy(() => import('./pages/TaskManagerPage'));
const IoTDashboardPage = lazy(() => import('./pages/IoTDashboardPage'));
const F2CStorePage = lazy(() => import('./pages/F2CStorePage'));
const QualityLabPage = lazy(() => import('./pages/QualityLabPage'));
const AgriTourismPage = lazy(() => import('./pages/AgriTourismPage'));

/** Dynamic sidebar navigation based on user role */
function getNavSections(role) {
  const FARMER_NAV = [
    { label: 'Overview', items: [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Farmers', items: [
      { path: '/farmers', icon: '👨‍🌾', label: 'Farmers', badge: '5K' },
      { path: '/fields', icon: '🌾', label: 'Fields' },
      { path: '/crops', icon: '🌱', label: 'Crop Tracking' },
      { path: '/network', icon: '🤝', label: 'Network' },
    ]},
    { label: 'Finance', items: [
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
      { path: '/sales', icon: '🧾', label: 'Sales & Profit' },
      { path: '/expenses', icon: '💳', label: 'Expenses' },
      { path: '/wallet', icon: '💳', label: 'Wallet' },
      { path: '/insurance', icon: '🛡️', label: 'Insurance' },
      { path: '/financial-services', icon: '💼', label: 'Financial Services', highlight: true },
    ]},
    { label: 'Services', items: [
      { path: '/labour', icon: '👷', label: 'Labour Bookings' },
      { path: '/transport', icon: '🚛', label: 'Transport' },
      { path: '/suppliers', icon: '🏪', label: 'Suppliers' },
      { path: '/equipment', icon: '🚜', label: 'Equipment' },
    ]},
    { label: 'Knowledge', items: [
      { path: '/soil', icon: '🧪', label: 'Soil & Water' },
      { path: '/schemes', icon: '🏛️', label: 'Gov Schemes' },
      { path: '/knowledge', icon: '📚', label: 'Knowledge' },
      { path: '/qa', icon: '❓', label: 'Q&A Forum' },
    ]},
    { label: 'Tools', items: [
      { path: '/marketplace', icon: '🏪', label: 'Marketplace', highlight: true },
      { path: '/community', icon: '💬', label: 'Community', highlight: true },
      { path: '/notifications', icon: '🔔', label: 'Notifications', highlight: true },
      { path: '/tasks', icon: '📋', label: 'Task Manager', highlight: true },
    ]},
    { label: 'More', items: [
      { path: '/disputes', icon: '⚖️', label: 'Disputes' },
      { path: '/drones', icon: '🛸', label: 'Drone Reports' },
      { path: '/contact', icon: '📞', label: 'Expert Connect' },
      { path: '/ai', icon: '🤖', label: 'AI Advisory', highlight: true },
      { path: '/premium', icon: '💎', label: 'Premium', highlight: true },
      { path: '/gamification', icon: '🎮', label: 'Rewards', highlight: true },
      { path: '/iot', icon: '📡', label: 'IoT Sensors', highlight: true },
      { path: '/f2c-store', icon: '🛒', label: 'F2C Store', highlight: true },
      { path: '/quality-lab', icon: '🧪', label: 'Quality Lab', highlight: true },
      { path: '/agri-tourism', icon: '🌿', label: 'AgriTourism', highlight: true },
      { path: '/fpo', icon: '🏢', label: 'FPO Mode' },
      { path: '/profile', icon: '👤', label: 'My Profile' },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ]},
  ];

  if (role === 'industrial') return [
    { label: 'Industrial', items: [
      { path: '/industrial-dashboard', icon: '🏭', label: 'Dashboard', highlight: true },
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Account', items: [
      { path: '/profile', icon: '👤', label: 'Profile' },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ]},
  ];

  if (role === 'broker') return [
    { label: 'Broker', items: [
      { path: '/broker-dashboard', icon: '🤝', label: 'Dashboard', highlight: true },
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
      { path: '/transport', icon: '🚛', label: 'Transport' },
    ]},
    { label: 'Account', items: [
      { path: '/profile', icon: '👤', label: 'Profile' },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ]},
  ];

  if (role === 'supplier') return [
    { label: 'Supplier', items: [
      { path: '/supplier-dashboard', icon: '🏪', label: 'Dashboard', highlight: true },
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Account', items: [
      { path: '/profile', icon: '👤', label: 'Profile' },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ]},
  ];

  if (role === 'labour') return [
    { label: 'Labour', items: [
      { path: '/labour-dashboard', icon: '👷', label: 'Dashboard', highlight: true },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Account', items: [
      { path: '/profile', icon: '👤', label: 'Profile' },
      { path: '/settings', icon: '⚙️', label: 'Settings' },
    ]},
  ];

  if (role === 'admin') {
    return [
      ...FARMER_NAV.slice(0, -1),
      { label: 'Admin', items: [
        { path: '/admin', icon: '🛡️', label: 'Admin Panel', highlight: true },
        { path: '/industrial-dashboard', icon: '🏭', label: 'Industrial View' },
        { path: '/broker-dashboard', icon: '🤝', label: 'Broker View' },
        { path: '/supplier-dashboard', icon: '🏪', label: 'Supplier View' },
        { path: '/labour-dashboard', icon: '👷', label: 'Labour View' },
        ...FARMER_NAV[FARMER_NAV.length - 1].items,
      ]},
    ];
  }

  return FARMER_NAV;
}

// Keep static ref for search index
const NAV_SECTIONS = getNavSections('admin');

// Public routes that bypass admin layout
const PUBLIC_PREFIXES = ['/', '/home', '/features', '/about', '/pricing', '/contact-us', '/store', '/login', '/landing', '/onboarding', '/market', '/public-weather', '/blog'];

// Loading skeleton for Suspense fallback
function PageSkeleton() {
  return (
    <div style={{ padding: '28px 32px', animation: 'skFadeIn 0.25s ease' }}>
      <style>{`
        @keyframes skFadeIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }
        @keyframes skShimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .sk { background: linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%);
              background-size: 600px 100%; animation: skShimmer 1.4s infinite; border-radius: 10px; }
      `}</style>
      <div className="sk" style={{ height: 26, width: 180, marginBottom: 24 }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14, marginBottom: 20 }}>
        {[1,2,3,4].map(i => <div key={i} className="sk" style={{ height: 110 }} />)}
      </div>
      <div className="sk" style={{ height: 220, marginBottom: 14 }} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div className="sk" style={{ height: 160 }} />
        <div className="sk" style={{ height: 160 }} />
      </div>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading, farmerProfile } = useAuth();
  const location = useLocation();
  if (loading) return <PageSkeleton />;
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  if (!isOnboardingComplete(farmerProfile)) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Role-guarded route — redirects to / if user doesn't have required role */
function RoleRoute({ roles, children }) {
  const { farmerProfile, isAdmin, isDemoMode, loading } = useAuth();
  if (loading) return <PageSkeleton />;
  const userRole = farmerProfile?.role || 'farmer';
  // Demo mode users and admins can access all role dashboards
  if (!roles.includes(userRole) && !isAdmin && !isDemoMode) return <Navigate to="/" replace />;
  return children;
}

/** Smart dashboard router — sends user to their role-specific dashboard */
function RoleDashboard() {
  const { farmerProfile } = useAuth();
  const role = farmerProfile?.role || 'farmer';
  const ROLE_DASHBOARDS = {
    industrial: IndustrialDashboardPage,
    broker: BrokerDashboardPage,
    supplier: SupplierDashboardPage,
    labour: LabourDashboardPage,
  };
  const DashComponent = ROLE_DASHBOARDS[role] || Dashboard;
  return <DashComponent />;
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
  { type: 'feature', label: 'Premium Upgrades', icon: '💎', path: '/premium' },
  { type: 'feature', label: 'Direct Farm Store', icon: '🛒', path: '/store' },
  { type: 'feature', label: 'WhatsApp Bot', icon: '💬', path: '/premium?tab=whatsapp' },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHighlight, setSearchHighlight] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);
  const [gamHeader, setGamHeader] = useState({ coins: 0, streak: 0 });

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

  const { signOut: authSignOut, farmerProfile, userRole, isAuthenticated } = useAuth();
  const dynamicNav = getNavSections(userRole || 'farmer');
  const handleLogout = async () => {
    await authSignOut();
    window.location.href = '/';
  };

  const isPublic = PUBLIC_PREFIXES.some(p => {
    if (p === '/') return location.pathname === '/';
    return location.pathname === p || location.pathname.startsWith(p + '/');
  });

  useEffect(() => {
    if (isPublic || !isAuthenticated) return undefined;
    const syncGamificationHeader = () => {
      const streakInfo = getStreakInfo();
      setGamHeader({ coins: getCoins(), streak: streakInfo.currentStreak || 0 });
    };
    recordLogin();
    syncGamificationHeader();
    window.addEventListener(GAMIFICATION_EVENT, syncGamificationHeader);
    window.addEventListener('storage', syncGamificationHeader);
    return () => {
      window.removeEventListener(GAMIFICATION_EVENT, syncGamificationHeader);
      window.removeEventListener('storage', syncGamificationHeader);
    };
  }, [isPublic, isAuthenticated]);

  // Public website pages — render with PublicLayout (no admin sidebar)
  if (isPublic) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact-us" element={<ContactPublicPage />} />
            <Route path="/store" element={<PublicStorePage />} />
            <Route path="/market" element={<PublicPricesPage />} />
            <Route path="/public-weather" element={<PublicWeatherPage />} />
            <Route path="/blog" element={<BlogPage />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="app-layout">
      {/* Mobile sidebar overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <nav className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌾</div>
          <div>
            <div className="sidebar-logo-text">Agri Connect 360</div>
            <div className="sidebar-logo-sub">{{
              admin: 'Admin Dashboard',
              industrial: 'Industrial Portal',
              broker: 'Broker Portal',
              supplier: 'Supplier Portal',
              labour: 'Labour Portal',
              fpo: 'FPO Dashboard',
            }[userRole] || 'Farmer Dashboard'}</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {dynamicNav.map(section => (
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
                  onClick={() => { setSidebarOpen(false); triggerHaptic(); }}
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
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dynamicNav.flatMap(s => s.items).length} modules active</div>
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
          <div className="gam-header-chips">
            <button className="gam-header-chip streak" onClick={() => navigate('/gamification')} title="Open Rewards">
              🔥 {gamHeader.streak}
            </button>
            <button className="gam-header-chip coins" onClick={() => navigate('/gamification')} title="Open Rewards">
              🪙 {Number(gamHeader.coins || 0).toLocaleString('en-IN')}
            </button>
          </div>
          <button className="header-btn" onClick={() => { setSearchOpen(true); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            🔍 <span className="header-search-text">Search</span> <kbd className="header-search-kbd" style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', color: 'var(--text-muted)', border: '1px solid var(--border)', marginLeft: 4 }}>Ctrl+K</kbd>
          </button>
          <button className="header-btn" onClick={() => setNotifOpen(v => !v)} style={{ position: 'relative' }}>
            🔔 <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
          </button>
          {notifOpen && (
            <div style={{ position: 'absolute', top: 48, right: 10, width: 'min(360px, calc(100vw - 24px))', background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: '0 10px 40px rgba(0,0,0,0.3)', zIndex: 500, overflow: 'hidden' }}>
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
          <a href="/features" className="btn btn-outline header-api-docs" style={{ padding: '7px 14px', fontSize: '0.8rem' }}>📚 API Docs</a>
          <button className="header-btn" onClick={handleLogout}>👤 Logout</button>
        </div>
      </header>

      {/* Main */}
      <main className="main-content">
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
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
            <Route path="/financial-services" element={<ProtectedRoute><FinancialServicesPage /></ProtectedRoute>} />
            <Route path="/gamification" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
            <Route path="/drones" element={<ProtectedRoute><DronePage /></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
            <Route path="/community" element={<ProtectedRoute><CommunityPage /></ProtectedRoute>} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TaskManagerPage /></ProtectedRoute>} />
            <Route path="/iot" element={<ProtectedRoute><IoTDashboardPage /></ProtectedRoute>} />
            <Route path="/f2c-store" element={<ProtectedRoute><F2CStorePage /></ProtectedRoute>} />
            <Route path="/quality-lab" element={<ProtectedRoute><QualityLabPage /></ProtectedRoute>} />
            <Route path="/agri-tourism" element={<ProtectedRoute><AgriTourismPage /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><ContactPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/fpo" element={<ProtectedRoute><FPOPage /></ProtectedRoute>} />
            <Route path="/premium" element={<ProtectedRoute><PremiumUpgradesPage /></ProtectedRoute>} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            {/* Phase 13 — Role-Based Dashboard Routes */}
            <Route path="/industrial-dashboard" element={<ProtectedRoute><RoleRoute roles={['industrial']}><IndustrialDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/broker-dashboard" element={<ProtectedRoute><RoleRoute roles={['broker']}><BrokerDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/supplier-dashboard" element={<ProtectedRoute><RoleRoute roles={['supplier']}><SupplierDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/labour-dashboard" element={<ProtectedRoute><RoleRoute roles={['labour']}><LabourDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/admin" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/landing" element={<LandingPage />} />
            {/* Public Website Routes — Phase 6 & 7 */}
            <Route element={<PublicLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/home" element={<HomePage />} />
              <Route path="/features" element={<FeaturesPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/pricing" element={<PricingPage />} />
              <Route path="/contact-us" element={<ContactPublicPage />} />
              <Route path="/store" element={<PublicStorePage />} />
              <Route path="/market" element={<PublicPricesPage />} />
              <Route path="/public-weather" element={<PublicWeatherPage />} />
              <Route path="/blog" element={<BlogPage />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {/* Bottom Navigation — Mobile */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {[
            { path: '/dashboard', icon: '🏠', label: 'Home' },
            { path: '/weather', icon: '🌤️', label: 'Weather' },
            { path: '/market-prices', icon: '💰', label: 'Prices' },
            { path: '/ai', icon: '🤖', label: 'AI' },
            { path: '/settings', icon: '👤', label: 'Profile' },
          ].map(tab => (
            <NavLink
              key={tab.path}
              to={tab.path}
              end={tab.path === '/'}
              className={({ isActive }) => `bottom-nav-item${isActive ? ' active' : ''}`}
              onClick={() => triggerHaptic()}
            >
              <span className="bnav-icon">{tab.icon}</span>
              {tab.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* FAB Menu — Mobile */}
      <div className={`fab-menu${fabOpen ? ' open' : ''}`}>
        <div className="fab-menu-item" onClick={() => { navigate('/expenses'); setFabOpen(false); triggerHaptic(); }}>💸 Add Expense</div>
        <div className="fab-menu-item" onClick={() => { navigate('/ai'); setFabOpen(false); triggerHaptic(); }}>🤖 Ask AI</div>
        <div className="fab-menu-item" onClick={() => { navigate('/market-prices'); setFabOpen(false); triggerHaptic(); }}>📊 Check Prices</div>
      </div>
      <button className="fab" onClick={() => { setFabOpen(!fabOpen); triggerHaptic(); }}>
        {fabOpen ? '✕' : '⚡'}
      </button>
      <CookieConsentBanner />
    </div>
  );
}
