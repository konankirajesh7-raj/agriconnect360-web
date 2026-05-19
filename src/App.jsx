import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { Routes, Route, NavLink, useLocation, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from './lib/hooks/useAuth';
import { supabase } from './lib/supabase';
import { triggerHaptic } from './lib/hooks/useMobile';
import { isOnboardingComplete } from './lib/phase11Persistence';
import { CookieConsentBanner } from './lib/consent.jsx';
// Gamification removed
import ErrorBoundary from './components/ErrorBoundary';
import DownloadAppPrompt from './components/DownloadAppPrompt';

const FarmBackground3D = lazy(() => import('./components/FarmBackground3D'));
import BugReportButton from './components/BugReportButton';
import VoiceAgent from './components/VoiceAgent';
import OfflineBanner from './components/OfflineBanner';
import AdPopup from './components/AdPopup';
import BugReportModal from './components/BugReportModal';
import { useBugReports } from './lib/hooks/useBugReports';
import { LanguageProvider, useLanguage } from './lib/i18n/LanguageContext';
import LocationBar from './components/LocationBar';
import LanguageSwitcher from './components/LanguageSwitcher';

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
const MyMoneyPage = lazy(() => import('./pages/MyMoneyPage'));
// SoilPage removed
const LabourPage = lazy(() => import('./pages/LabourPage'));
const TransportPage = lazy(() => import('./pages/TransportPage'));
const MyTransportMachineryPage = lazy(() => import('./pages/MyTransportMachineryPage'));
const SuppliersPage = lazy(() => import('./pages/SuppliersPage'));
const EquipmentPage = lazy(() => import('./pages/EquipmentPage'));
const DisputesPage = lazy(() => import('./pages/DisputesPage'));
// SchemesPage removed — route redirects to dashboard
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
// PremiumUpgradesPage removed
const LandingPage = lazy(() => import('./pages/LandingPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
// FPOPage removed
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
// FinancialServicesPage removed
// GamificationPage removed
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
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
const ColdStoragePage = lazy(() => import('./pages/ColdStoragePage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const CommunityFeed = lazy(() => import('./pages/CommunityFeed'));
const AdminFeedModeration = lazy(() => import('./pages/AdminFeedModeration'));
const BugTracker = lazy(() => import('./pages/BugTracker'));
const AdminBugDashboard = lazy(() => import('./pages/AdminBugDashboard'));
const VillageExplorer = lazy(() => import('./pages/VillageExplorer'));
const CustomerDashboardPage = lazy(() => import('./pages/CustomerDashboardPage'));
const PaymentPage = lazy(() => import('./pages/PaymentPage'));

/** Dynamic sidebar navigation based on user role */
function getNavSections(role) {
  const FARMER_NAV = [
    { label: 'Overview', items: [
      { path: '/dashboard', icon: '📊', label: 'Dashboard' },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'My Farm', items: [
      { path: '/my-farm', icon: '🌾', label: 'My Farm' },
    ]},
    { label: 'Finance', items: [
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
      { path: '/my-money', icon: '💰', label: 'My Money' },
    ]},
    { label: 'Services', items: [
      { path: '/labour', icon: '👷', label: 'Farm Workers' },
      { path: '/transport', icon: '🚛', label: 'Transport' },
      { path: '/suppliers', icon: '🏪', label: 'Suppliers' },
      { path: '/equipment', icon: '🚜', label: 'Equipment' },
      { path: '/my-transport', icon: '🔧', label: 'My T&M' },
      { path: '/cold-storage', icon: '❄️', label: 'Cold Storage' },
    ]},
    { label: 'Knowledge', items: [
      { path: '/knowledge', icon: '📚', label: 'Knowledge' },
    ]},
    { label: 'Community', items: [
      { path: '/feed', icon: '🎬', label: 'Community Feed', highlight: true },
      { path: '/network', icon: '🤝', label: 'Farmer Network' },
      { path: '/marketplace', icon: '🛒', label: 'Marketplace', highlight: true },
    ]},
    { label: 'Local', items: [
      { path: '/villages', icon: '🏘️', label: 'Villages' },
    ]},
    { label: 'More', items: [
      { path: '/disputes', icon: '⚖️', label: 'Disputes & Support' },
      { path: '/drones', icon: '🛸', label: 'Drone Reports' },
      { path: '/ai', icon: '🤖', label: 'AI Advisory', highlight: true },
      { path: '/agri-tourism', icon: '🌿', label: 'AgriTourism', highlight: true },
    ]},
  ];

  if (role === 'customer') return [
    { label: 'Overview', items: [
      { path: '/customer-dashboard', icon: '🛍️', label: 'Dashboard', highlight: true },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Shopping', items: [
      { path: '/marketplace', icon: '🛒', label: 'Browse Products' },
      { path: '/market-prices', icon: '💰', label: 'Price Compare' },
      { path: '/suppliers', icon: '🏪', label: 'Shops & Stores' },
    ]},
    { label: 'Community', items: [
      { path: '/network', icon: '🤝', label: 'Connections' },
      { path: '/feed', icon: '🎬', label: 'Community Feed' },
      { path: '/disputes', icon: '⚖️', label: 'Disputes & Support' },
    ]},
    { label: 'More', items: [
      { path: '/my-money', icon: '💰', label: 'My Spending' },
      { path: '/ai', icon: '🤖', label: 'AI Helper' },
      { path: '/tasks', icon: '📋', label: 'Tasks' },
      { path: '/agri-tourism', icon: '🌿', label: 'AgriTourism' },
    ]},
  ];

  if (role === 'industrial') return [
    { label: 'Overview', items: [
      { path: '/industrial-dashboard', icon: '🏭', label: 'Dashboard', highlight: true },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Procurement', items: [
      { path: '/marketplace', icon: '🛒', label: 'Buy from Farmers' },
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
    ]},
    { label: 'Operations', items: [
      { path: '/transport', icon: '🚛', label: 'Transport' },
      { path: '/cold-storage', icon: '❄️', label: 'Cold Storage' },
      { path: '/equipment', icon: '🚜', label: 'Equipment' },
      { path: '/labour', icon: '👷', label: 'Farm Workers' },
      { path: '/my-transport', icon: '🔧', label: 'My T&M' },
    ]},
    { label: 'Network', items: [
      { path: '/network', icon: '🤝', label: 'Connections' },
      { path: '/suppliers', icon: '🏪', label: 'Suppliers' },
      { path: '/feed', icon: '🎬', label: 'Community' },
      { path: '/disputes', icon: '⚖️', label: 'Disputes & Support' },
    ]},
    { label: 'More', items: [
      { path: '/my-money', icon: '💰', label: 'Business Finance' },
      { path: '/ai', icon: '🤖', label: 'AI Advisory' },
      { path: '/tasks', icon: '📋', label: 'Tasks' },
      { path: '/villages', icon: '🏘️', label: 'Villages' },
      { path: '/agri-tourism', icon: '🌿', label: 'AgriTourism' },
      { path: '/knowledge', icon: '📚', label: 'Knowledge' },
    ]},
  ];

  if (role === 'broker') return [
    { label: 'Overview', items: [
      { path: '/broker-dashboard', icon: '🤝', label: 'Dashboard', highlight: true },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Market Intel', items: [
      { path: '/market-prices', icon: '💰', label: 'Price Intelligence' },
      { path: '/marketplace', icon: '🛒', label: 'Marketplace' },
    ]},
    { label: 'Operations', items: [
      { path: '/transport', icon: '🚛', label: 'Transport Bookings' },
      { path: '/labour', icon: '👷', label: 'Farm Workers' },
      { path: '/cold-storage', icon: '❄️', label: 'Cold Storage' },
      { path: '/equipment', icon: '🚜', label: 'Equipment' },
      { path: '/my-transport', icon: '🔧', label: 'My T&M' },
    ]},
    { label: 'Network', items: [
      { path: '/network', icon: '🤝', label: 'All Connections' },
      { path: '/suppliers', icon: '🏪', label: 'Suppliers' },
      { path: '/villages', icon: '🏘️', label: 'Villages & Farmers' },
      { path: '/feed', icon: '🎬', label: 'Community' },
      { path: '/disputes', icon: '⚖️', label: 'Disputes & Support' },
    ]},
    { label: 'More', items: [
      { path: '/my-money', icon: '💰', label: 'Trade Finance' },
      { path: '/ai', icon: '🤖', label: 'AI Advisory' },
      { path: '/tasks', icon: '📋', label: 'Tasks' },
      { path: '/knowledge', icon: '📚', label: 'Knowledge' },
      { path: '/agri-tourism', icon: '🌿', label: 'AgriTourism' },
    ]},
  ];

  if (role === 'supplier') return [
    { label: 'Overview', items: [
      { path: '/supplier-dashboard', icon: '🏪', label: 'Dashboard', highlight: true },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Business', items: [
      { path: '/marketplace', icon: '🛒', label: 'Marketplace' },
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
    ]},
    { label: 'Operations', items: [
      { path: '/transport', icon: '🚛', label: 'Transport' },
      { path: '/cold-storage', icon: '❄️', label: 'Cold Storage' },
      { path: '/equipment', icon: '🚜', label: 'Equipment' },
      { path: '/labour', icon: '👷', label: 'Farm Workers' },
      { path: '/my-transport', icon: '🔧', label: 'My T&M' },
    ]},
    { label: 'Network', items: [
      { path: '/network', icon: '🤝', label: 'All Connections' },
      { path: '/suppliers', icon: '🏪', label: 'Other Suppliers' },
      { path: '/villages', icon: '🏘️', label: 'Villages' },
      { path: '/feed', icon: '🎬', label: 'Community' },
      { path: '/disputes', icon: '⚖️', label: 'Disputes & Support' },
    ]},
    { label: 'More', items: [
      { path: '/my-money', icon: '💰', label: 'Shop Finances' },
      { path: '/ai', icon: '🤖', label: 'AI Advisory' },
      { path: '/tasks', icon: '📋', label: 'Tasks' },
      { path: '/knowledge', icon: '📚', label: 'Knowledge' },
      { path: '/drones', icon: '🛸', label: 'Drone Reports' },
      { path: '/agri-tourism', icon: '🌿', label: 'AgriTourism' },
    ]},
  ];

  if (role === 'labour') return [
    { label: 'Overview', items: [
      { path: '/labour-dashboard', icon: '👷', label: 'Dashboard', highlight: true },
      { path: '/weather', icon: '🌤️', label: 'Weather' },
    ]},
    { label: 'Work', items: [
      { path: '/labour', icon: '📋', label: 'Job Bookings' },
      { path: '/equipment', icon: '🚜', label: 'Equipment Rental' },
      { path: '/my-transport', icon: '🔧', label: 'My T&M' },
      { path: '/market-prices', icon: '💰', label: 'Market Prices' },
    ]},
    { label: 'Network', items: [
      { path: '/network', icon: '🤝', label: 'All Connections' },
      { path: '/villages', icon: '🏘️', label: 'Villages' },
      { path: '/feed', icon: '🎬', label: 'Community' },
      { path: '/transport', icon: '🚛', label: 'Transport' },
      { path: '/disputes', icon: '⚖️', label: 'Disputes & Support' },
    ]},
    { label: 'More', items: [
      { path: '/my-money', icon: '💰', label: 'My Earnings' },
      { path: '/ai', icon: '🤖', label: 'AI Helper' },
      { path: '/tasks', icon: '📋', label: 'Tasks' },
      { path: '/knowledge', icon: '📚', label: 'Knowledge' },
      { path: '/agri-tourism', icon: '🌿', label: 'AgriTourism' },
    ]},
  ];

  if (role === 'admin') {
    return [
      { label: 'Admin', items: [
        { path: '/admin', icon: '🛡️', label: 'Admin Panel', highlight: true },
        { path: '/admin/bugs', icon: '🐛', label: 'Bug Dashboard', highlight: true },
        { path: '/admin/feed', icon: '📝', label: 'Feed Moderation' },
      ]},
      { label: 'Monitor', items: [
        { path: '/market-prices', icon: '💰', label: 'Market Prices' },
        { path: '/cold-storage', icon: '❄️', label: 'Cold Storage' },
        { path: '/disputes', icon: '⚖️', label: 'Disputes & Support' },
        { path: '/weather', icon: '🌤️', label: 'Weather' },
      ]},
      { label: 'Role Views', items: [
        { path: '/dashboard', icon: '🌾', label: 'Farmer View' },
        { path: '/customer-dashboard', icon: '🛍️', label: 'Customer View' },
        { path: '/industrial-dashboard', icon: '🏭', label: 'Industrial View' },
        { path: '/broker-dashboard', icon: '🤝', label: 'Broker View' },
        { path: '/supplier-dashboard', icon: '🏪', label: 'Supplier View' },
        { path: '/labour-dashboard', icon: '👷', label: 'Labour View' },
      ]},
    ];
  }

  return FARMER_NAV;
}

// Keep static ref for search index
const NAV_SECTIONS = getNavSections('admin');

// Public routes that bypass admin layout
const PUBLIC_PREFIXES = ['/', '/home', '/features', '/about', '/pricing', '/contact-us', '/store', '/login', '/landing', '/onboarding', '/subscription', '/blog'];

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
  const { isAuthenticated, loading, farmerProfile, isAdmin, user } = useAuth();
  const location = useLocation();
  const [subChecked, setSubChecked] = useState(false);
  const [hasSubscription, setHasSubscription] = useState(false);

  useEffect(() => {
    if (!user?.id || isAdmin) { setSubChecked(true); setHasSubscription(true); return; }
    let cancelled = false;
    (async () => {
      try {
        const { data, error } = await supabase
          .from('subscription_payments')
          .select('id,status,plan_id,payment_method')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10);

        if (!cancelled) {
          if (error) throw error; // Fall to offline catch

          // DB is authoritative — coupon/trial must exist in subscription_payments
          const hasVerified = data?.some(p => p.status === 'verified');
          const hasPending = data?.some(p => p.status === 'pending');
          const hasCouponInDB = data?.some(p => p.payment_method === 'coupon' && p.status === 'verified');

          if (hasVerified || hasCouponInDB) {
            setHasSubscription(true);
            localStorage.setItem('agri360_payments', 'verified');
          } else if (hasPending) {
            setHasSubscription(true); // Allow access while payment is under review
            localStorage.setItem('agri360_payments', 'pending');
          } else {
            setHasSubscription(false);
            localStorage.removeItem('agri360_payments');
          }
          setSubChecked(true);
        }
      } catch {
        // Offline fallback ONLY — do not use localStorage as primary auth
        if (!cancelled) {
          const cached = localStorage.getItem('agri360_payments');
          // Only grant access if we have a previously DB-verified cached value
          setHasSubscription(cached === 'verified' || cached === 'pending');
          setSubChecked(true);
        }
      }
    })();
    return () => { cancelled = true; };
  }, [user?.id, isAdmin]);

  if (loading || !subChecked) return <PageSkeleton />;

  // Layer 1: Auth check with localStorage fallback (handles async session load race)
  if (!isAuthenticated) {
    const hasLocalToken = Object.keys(localStorage).some(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    const hasAdminToken = !!localStorage.getItem('agri_admin_token');
    if (!hasLocalToken && !hasAdminToken) {
      return <Navigate to="/login" state={{ from: location.pathname }} replace />;
    }
  }

  // Layer 2: Onboarding guard
  const onboardingDone = localStorage.getItem('agri360_onboarding_complete') === 'true'
    || localStorage.getItem('rythusphere_onboarding_complete') === 'true'
    || localStorage.getItem('rythusphere_onboarding_complete') === 'skipped'
    || isOnboardingComplete(farmerProfile);
  if (!onboardingDone) {
    return <Navigate to="/onboarding" replace state={{ from: location.pathname }} />;
  }

  // Layer 3: Subscription guard — admin bypasses, DB is source of truth
  if (!isAdmin && !hasSubscription) {
    return <Navigate to="/subscription" replace />;
  }

  return children;
}

/** Role-guarded route — redirects if user doesn't have required role */
function RoleRoute({ roles, children }) {
  const { farmerProfile, isAdmin, loading, userRole } = useAuth();
  if (loading) return <PageSkeleton />;
  // Use DB-backed role from useAuth (farmerProfile.role), never trust localStorage
  const effectiveRole = userRole || 'farmer';
  // Admin always has access to all dashboards (verified via Supabase profile, not localStorage)
  if (!roles.includes(effectiveRole) && !isAdmin) {
    const ROLE_DASHBOARDS_MAP = { customer:'/customer-dashboard', industrial:'/industrial-dashboard', broker:'/broker-dashboard', supplier:'/supplier-dashboard', labour:'/labour-dashboard', admin:'/admin', farmer:'/dashboard' };
    return <Navigate to={ROLE_DASHBOARDS_MAP[effectiveRole] || '/dashboard'} replace />;
  }
  return children;
}

/** Bug Report FAB — floating button visible on every page */
function BugReportFAB() {
  const [bugModalOpen, setBugModalOpen] = React.useState(false);
  const { submitBug, myBugs } = useBugReports();
  const openCount = myBugs.filter(b => b.status !== 'resolved' && b.status !== 'wont_fix').length;
  return (
    <>
      <BugReportButton onClick={() => setBugModalOpen(true)} openBugCount={openCount} />
      <BugReportModal open={bugModalOpen} onClose={() => setBugModalOpen(false)} onSubmit={submitBug} />
    </>
  );
}

/** Smart dashboard router — sends user to their role-specific dashboard */
function RoleDashboard() {
  const { farmerProfile } = useAuth();
  const role = farmerProfile?.role || localStorage.getItem('rythu_user_role') || 'farmer';
  const ROLE_DASHBOARDS = {
    customer: CustomerDashboardPage,
    industrial: IndustrialDashboardPage,
    broker: BrokerDashboardPage,
    supplier: SupplierDashboardPage,
    labour: LabourDashboardPage,
  };
  // If non-farmer role has a dedicated dashboard, redirect to it
  if (role !== 'farmer' && ROLE_DASHBOARDS[role]) {
    const DashComponent = ROLE_DASHBOARDS[role];
    return <DashComponent />;
  }
  return <Dashboard />;
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
  { type: 'feature', label: 'Eligibility Checker', icon: '✅', path: '/knowledge' },
  { type: 'feature', label: 'Community Feed', icon: '📱', path: '/network' },
  { type: 'feature', label: 'Crop Calendar', icon: '📅', path: '/crops' },
  { type: 'feature', label: 'Equipment Marketplace', icon: '🚜', path: '/equipment' },
  { type: 'feature', label: 'AI Crop Recommender', icon: '🤖', path: '/ai' },
  { type: 'feature', label: 'Pest & Disease Detector', icon: '🐛', path: '/ai' },

  { type: 'feature', label: 'Direct Farm Store', icon: '🛒', path: '/store' },
  { type: 'feature', label: 'WhatsApp Bot', icon: '💬', path: '/ai' },
  { type: 'crop', label: 'Cotton', icon: '🌿', path: '/crops' },
  { type: 'crop', label: 'Paddy', icon: '🌾', path: '/crops' },
  { type: 'crop', label: 'Wheat', icon: '🌾', path: '/crops' },
  { type: 'crop', label: 'Sugarcane', icon: '🌿', path: '/crops' },
  { type: 'scheme', label: 'PM-KISAN', icon: '🏛️', path: '/knowledge' },
  { type: 'scheme', label: 'Fasal Bima Yojana', icon: '🛡️', path: '/knowledge' },
  { type: 'scheme', label: 'Kisan Credit Card', icon: '🏦', path: '/knowledge' },
];

/** Notification dropdown using position:fixed to escape grid row clipping */
function NotifDropdown({ open, setOpen, tl, items }) {
  const btnRef = React.useRef(null);
  const dropRef = React.useRef(null);
  const [pos, setPos] = React.useState({ top: 0, right: 0 });

  React.useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 6, right: window.innerWidth - r.right });
    }
  }, [open]);

  React.useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target) && !btnRef.current?.contains(e.target)) setOpen(false); };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, setOpen]);

  return (
    <>
      <button ref={btnRef} className="header-btn" onClick={() => setOpen(v => !v)} style={{ position: 'relative' }}>
        🔔 <span style={{ position: 'absolute', top: 4, right: 4, width: 8, height: 8, borderRadius: '50%', background: '#ef4444' }} />
      </button>
      {open && (
        <div ref={dropRef} style={{
          position: 'fixed', top: pos.top, right: pos.right,
          width: 'min(360px, calc(100vw - 24px))',
          background: 'rgba(13,75,31,0.98)', border: '1px solid rgba(76,175,80,0.3)',
          borderRadius: 12, boxShadow: '0 12px 48px rgba(0,0,0,0.6)', zIndex: 99999,
          backdropFilter: 'blur(20px)',
        }}>
          <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(76,175,80,0.2)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: '0.88rem', color: '#e8f5e9' }}>🔔 {tl('notifications')}</span>
            <span style={{ fontSize: '14px', color: '#81c784', cursor: 'pointer', padding: '4px' }} onClick={() => setOpen(false)}>✕</span>
          </div>
          {items.map(n => (
            <div key={n.id} style={{ padding: '10px 16px', borderBottom: '1px solid rgba(76,175,80,0.1)', background: n.read ? 'transparent' : 'rgba(59,130,246,0.06)', cursor: 'pointer', display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', flexShrink: 0, marginTop: 2 }}>{n.icon}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: n.read ? 400 : 600, color: '#e8f5e9' }}>{n.title}</div>
                <div style={{ fontSize: '0.68rem', color: '#81c784', marginTop: 2 }}>{n.time}</div>
              </div>
              {!n.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginTop: 6, flexShrink: 0 }} />}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default function App() {
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchHighlight, setSearchHighlight] = useState(0);
  const [notifOpen, setNotifOpen] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);


  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [syncMsg, setSyncMsg] = useState('');

  useEffect(() => {
    const goOff = () => setIsOffline(true);
    const goOn = () => { setIsOffline(false); setSyncMsg('Syncing...'); setTimeout(() => setSyncMsg(''), 2500); };
    window.addEventListener('offline', goOff);
    window.addEventListener('online', goOn);
    return () => { window.removeEventListener('offline', goOff); window.removeEventListener('online', goOn); };
  }, []);

  // Real notifications are loaded per-user from Supabase in NotificationsPage
  const NOTIFICATIONS = [];

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
  const { navT, t: tl, lang } = useLanguage();
  const dynamicNav = getNavSections(userRole || 'farmer');
  const handleLogout = async () => {
    await authSignOut();
    window.location.href = '/';
  };

  const isPublic = PUBLIC_PREFIXES.some(p => {
    if (p === '/') return location.pathname === '/';
    return location.pathname === p || location.pathname.startsWith(p + '/');
  });



  // Public website pages — render with PublicLayout (no admin sidebar)
  if (isPublic) {
    return (
      <Suspense fallback={<PageSkeleton />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/landing" element={<LandingPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/subscription" element={<PaymentPage />} />
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/features" element={<FeaturesPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/contact-us" element={<ContactPublicPage />} />
            <Route path="/store" element={<PublicStorePage />} />
            <Route path="/market" element={<Navigate to="/login" replace />} />
            <Route path="/public-weather" element={<Navigate to="/login" replace />} />
            <Route path="/blog" element={<BlogPage />} />
          </Route>
        </Routes>
      </Suspense>
    );
  }

  return (
    <div className="app-layout">
      <a href="#main-content" className="skip-link">Skip to main content</a>
      {/* Mobile sidebar overlay */}
      <div className={`sidebar-overlay${sidebarOpen ? ' visible' : ''}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar */}
      <nav className={`sidebar${sidebarOpen ? ' open' : ''}`}>
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">🌾</div>
          <div>
            <div className="sidebar-logo-text">{tl('appName')}</div>
            <div className="sidebar-logo-sub">{{
              admin: tl('adminDashboard'),
              industrial: tl('industrialPortal'),
              broker: tl('brokerPortal'),
              supplier: tl('supplierPortal'),
              labour: tl('labourPortal'),
            }[userRole] || tl('farmerDashboard')}</div>
          </div>
        </div>

        <div className="sidebar-nav">
          {dynamicNav.map(section => (
            <div key={section.label}>
              <div className="nav-section-label">{navT(section.label)}</div>
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
                  {navT(item.label)}
                  {item.badge && <span className="nav-badge">{item.badge}</span>}
                  {item.highlight && <span className="nav-badge nav-badge-ai">NEW</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* System status + Logout */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)', margin: '8px 0 0' }}>
          <div style={{ background: 'var(--green-glow)', borderRadius: 'var(--radius-sm)', padding: '10px 12px', border: '1px solid rgba(34,197,94,0.2)', marginBottom: 10 }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--green-primary)', marginBottom: 4 }}>🟢 {tl('systemOperational')}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{dynamicNav.flatMap(s => s.items).length} {tl('modulesActive')}</div>
          </div>
          <button onClick={() => navigate('/profile')} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            👤 {tl('myProfile') || 'My Profile'}
          </button>
          <button onClick={() => navigate('/settings')} style={{ width: '100%', padding: '8px 12px', background: 'rgba(255,255,255,0.06)', border: '1px solid var(--border)', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.78rem', cursor: 'pointer', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
            ⚙️ {tl('settings') || 'Settings'}
          </button>
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px 12px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.78rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            🚪 {tl('logout')}
          </button>
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
          <div className="header-title">{currentPage?.icon} {navT(currentPage?.label || 'Dashboard')}</div>
        </div>
        <div className="header-right">

          <button className="header-btn" onClick={() => { setSearchOpen(true); setSearchQuery(''); }} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            🔍 <span className="header-search-text">Search</span> <kbd className="header-search-kbd" style={{ background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: 4, fontSize: '0.65rem', color: 'var(--text-muted)', border: '1px solid var(--border)', marginLeft: 4 }}>Ctrl+K</kbd>
          </button>
          <NotifDropdown open={notifOpen} setOpen={setNotifOpen} tl={tl} items={NOTIFICATIONS} />

          <LanguageSwitcher compact />
          <DownloadAppPrompt variant="button" />
        </div>
      </header>

      {/* Main */}
      {/* Vibrant 3D Farming Background — skip on slow connections to save ~500KB */}
      {(() => { const c = navigator?.connection; const slow = c && (c.effectiveType === '2g' || c.effectiveType === 'slow-2g' || c.effectiveType === '3g' || c.saveData); return !slow; })() && <Suspense fallback={null}><FarmBackground3D /></Suspense>}

      <main className="main-content" id="main-content" role="main" aria-label="Main content">
        <LocationBar />
        <div aria-live="assertive" aria-atomic="true">
          {syncMsg && <div style={{background:'linear-gradient(90deg,#16a34a,#15803d)',color:'#fff',padding:'10px 20px',textAlign:'center',fontWeight:600,fontSize:'0.85rem',borderRadius:0,position:'sticky',top:0,zIndex:999}} role="status">🔄 {syncMsg}</div>}
        </div>
        <Suspense fallback={<PageSkeleton />}>
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><RoleDashboard /></ProtectedRoute>} />
            <Route path="/farmers" element={<ProtectedRoute><FarmersPage /></ProtectedRoute>} />
            <Route path="/my-farm" element={<ProtectedRoute><RoleRoute roles={['farmer']}><CropsPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/fields" element={<Navigate to="/my-farm" replace />} />
            <Route path="/crops" element={<Navigate to="/my-farm" replace />} />
            <Route path="/market-prices" element={<ProtectedRoute><MarketPricesPage /></ProtectedRoute>} />
            <Route path="/my-money" element={<ProtectedRoute><MyMoneyPage /></ProtectedRoute>} />
            <Route path="/sales" element={<Navigate to="/my-money" replace />} />
            <Route path="/expenses" element={<Navigate to="/my-money" replace />} />
            <Route path="/soil" element={<Navigate to="/dashboard" replace />} />
            <Route path="/labour" element={<ProtectedRoute><RoleRoute roles={['farmer','broker','supplier','industrial','labour']}><LabourPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/transport" element={<ProtectedRoute><RoleRoute roles={['farmer','broker','supplier','industrial','labour']}><TransportPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/my-transport" element={<ProtectedRoute><RoleRoute roles={['farmer','broker','supplier','industrial','labour']}><MyTransportMachineryPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/suppliers" element={<ProtectedRoute><SuppliersPage /></ProtectedRoute>} />
            <Route path="/equipment" element={<ProtectedRoute><RoleRoute roles={['farmer','broker','supplier','industrial','labour']}><EquipmentPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/disputes" element={<ProtectedRoute><DisputesPage /></ProtectedRoute>} />
            <Route path="/schemes" element={<Navigate to="/dashboard" replace />} />
            <Route path="/knowledge" element={<ProtectedRoute><RoleRoute roles={['farmer','broker','supplier','industrial','labour']}><KnowledgePage /></RoleRoute></ProtectedRoute>} />
            <Route path="/qa" element={<ProtectedRoute><QAPage /></ProtectedRoute>} />
            <Route path="/network" element={<ProtectedRoute><NetworkPage /></ProtectedRoute>} />
            <Route path="/weather" element={<ProtectedRoute><WeatherPage /></ProtectedRoute>} />
            <Route path="/ai" element={<ProtectedRoute><AIPage /></ProtectedRoute>} />
            <Route path="/wallet" element={<ProtectedRoute><WalletPage /></ProtectedRoute>} />
            <Route path="/insurance" element={<ProtectedRoute><InsurancePage /></ProtectedRoute>} />
            <Route path="/financial-services" element={<Navigate to="/dashboard" replace />} />
            <Route path="/gamification" element={<Navigate to="/dashboard" replace />} />
            <Route path="/drones" element={<ProtectedRoute><RoleRoute roles={['farmer','supplier']}><DronePage /></RoleRoute></ProtectedRoute>} />
            <Route path="/marketplace" element={<ProtectedRoute><MarketplacePage /></ProtectedRoute>} />
            <Route path="/community" element={<Navigate to="/feed" replace />} />
            <Route path="/notifications" element={<ProtectedRoute><NotificationsPage /></ProtectedRoute>} />
            <Route path="/tasks" element={<ProtectedRoute><TaskManagerPage /></ProtectedRoute>} />
            <Route path="/iot" element={<ProtectedRoute><IoTDashboardPage /></ProtectedRoute>} />
            <Route path="/f2c-store" element={<ProtectedRoute><F2CStorePage /></ProtectedRoute>} />
            <Route path="/quality-lab" element={<ProtectedRoute><QualityLabPage /></ProtectedRoute>} />
            <Route path="/agri-tourism" element={<ProtectedRoute><AgriTourismPage /></ProtectedRoute>} />
            <Route path="/cold-storage" element={<ProtectedRoute><RoleRoute roles={['farmer','broker','supplier','industrial']}><ColdStoragePage /></RoleRoute></ProtectedRoute>} />
            <Route path="/reports" element={<Navigate to="/my-money" replace />} />
            <Route path="/feed" element={<ProtectedRoute><CommunityFeed /></ProtectedRoute>} />
            <Route path="/admin/feed" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminFeedModeration /></RoleRoute></ProtectedRoute>} />
            <Route path="/villages" element={<ProtectedRoute><RoleRoute roles={['farmer','broker','supplier','industrial','labour']}><VillageExplorer /></RoleRoute></ProtectedRoute>} />
            <Route path="/bug-tracker" element={<ProtectedRoute><BugTracker /></ProtectedRoute>} />
            <Route path="/admin/bugs" element={<ProtectedRoute><RoleRoute roles={['admin']}><AdminBugDashboard /></RoleRoute></ProtectedRoute>} />
            <Route path="/contact" element={<Navigate to="/disputes" replace />} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/fpo" element={<Navigate to="/dashboard" replace />} />
            <Route path="/premium" element={<Navigate to="/dashboard" replace />} />
            <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
            {/* Phase 13 — Role-Based Dashboard Routes */}
            <Route path="/customer-dashboard" element={<ProtectedRoute><RoleRoute roles={['customer','admin']}><CustomerDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/industrial-dashboard" element={<ProtectedRoute><RoleRoute roles={['industrial','admin']}><IndustrialDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/broker-dashboard" element={<ProtectedRoute><RoleRoute roles={['broker','admin']}><BrokerDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/supplier-dashboard" element={<ProtectedRoute><RoleRoute roles={['supplier','admin']}><SupplierDashboardPage /></RoleRoute></ProtectedRoute>} />
            <Route path="/labour-dashboard" element={<ProtectedRoute><RoleRoute roles={['labour','admin']}><LabourDashboardPage /></RoleRoute></ProtectedRoute>} />
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
            <Route path="*" element={<NotFoundPage />} />

          </Routes>
        </Suspense>
      </main>

      {/* Bottom Navigation — Mobile, role-aware */}
      <nav className="bottom-nav">
        <div className="bottom-nav-items">
          {((() => {
            const role = userRole || 'farmer';
            if (role === 'customer') return [
              { path: '/customer-dashboard', icon: '🏠', label: 'Home' },
              { path: '/marketplace', icon: '🛒', label: 'Shop' },
              { path: '/market-prices', icon: '💰', label: 'Prices' },
              { path: '/ai', icon: '🤖', label: 'AI' },
              { path: '/settings', icon: '👤', label: 'Profile' },
            ];
            if (role === 'industrial') return [
              { path: '/industrial-dashboard', icon: '🏭', label: 'Home' },
              { path: '/market-prices', icon: '💰', label: 'Prices' },
              { path: '/transport', icon: '🚛', label: 'Transport' },
              { path: '/ai', icon: '🤖', label: 'AI' },
              { path: '/settings', icon: '👤', label: 'Profile' },
            ];
            if (role === 'broker') return [
              { path: '/broker-dashboard', icon: '🏠', label: 'Home' },
              { path: '/market-prices', icon: '💰', label: 'Prices' },
              { path: '/marketplace', icon: '🛒', label: 'Trade' },
              { path: '/ai', icon: '🤖', label: 'AI' },
              { path: '/settings', icon: '👤', label: 'Profile' },
            ];
            if (role === 'supplier') return [
              { path: '/supplier-dashboard', icon: '🏠', label: 'Home' },
              { path: '/marketplace', icon: '🛒', label: 'Listings' },
              { path: '/market-prices', icon: '💰', label: 'Prices' },
              { path: '/ai', icon: '🤖', label: 'AI' },
              { path: '/settings', icon: '👤', label: 'Profile' },
            ];
            if (role === 'labour') return [
              { path: '/labour-dashboard', icon: '🏠', label: 'Home' },
              { path: '/labour', icon: '👷', label: 'Jobs' },
              { path: '/weather', icon: '🌤️', label: 'Weather' },
              { path: '/ai', icon: '🤖', label: 'AI' },
              { path: '/settings', icon: '👤', label: 'Profile' },
            ];
            if (role === 'admin') return [
              { path: '/admin', icon: '🛡️', label: 'Admin' },
              { path: '/admin/payments', icon: '💳', label: 'Payments' },
              { path: '/admin/bugs', icon: '🐛', label: 'Bugs' },
              { path: '/admin/feed', icon: '📢', label: 'Feed' },
              { path: '/settings', icon: '👤', label: 'Profile' },
            ];
            // Default: farmer
            return [
              { path: '/dashboard', icon: '🏠', label: 'Home' },
              { path: '/weather', icon: '🌤️', label: 'Weather' },
              { path: '/market-prices', icon: '💰', label: 'Prices' },
              { path: '/ai', icon: '🤖', label: 'AI' },
              { path: '/settings', icon: '👤', label: 'Profile' },
            ];
          })()).map(tab => (
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
      <DownloadAppPrompt variant="fab" />
      <BugReportFAB />
      <VoiceAgent />

      <OfflineBanner />
      <AdPopup />
      <CookieConsentBanner />
    </div>
  );
}
