import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView } from '../lib/services/analytics';

const PAGE_META = {
  '/': { title: 'RythuSphere —Smart Agriculture Platform', desc: 'India\'s #1 digital farming platform. Market prices, AI advisory, weather, and more for Andhra Pradesh farmers.' },
  '/dashboard': { title: 'Dashboard —RythuSphere', desc: 'Your personalized farming dashboard with real-time insights.' },
  '/market-prices': { title: 'Live Market Prices —RythuSphere', desc: 'Real-time mandi prices from APMC markets across Andhra Pradesh.' },
  '/weather': { title: 'Weather Forecast —RythuSphere', desc: 'Hyper-local weather forecasts and alerts for your farm.' },
  '/ai': { title: 'AI Farm Intelligence —RythuSphere', desc: 'AI-powered crop recommendations, pest detection, and farm advisory.' },
  '/marketplace': { title: 'Marketplace —RythuSphere', desc: 'Buy and sell farm produce directly. Farm to consumer marketplace.' },
  '/schemes': { title: 'Government Schemes —RythuSphere', desc: 'PM-KISAN, PMFBY, KCC and other schemes. Check eligibility and apply.' },
  '/crops': { title: 'Crop Tracking —RythuSphere', desc: 'Track your crops from sowing to harvest with smart calendar.' },
  '/soil': { title: 'Soil & Water —RythuSphere', desc: 'Soil health reports, water management, and recommendations.' },
  '/labour': { title: 'Labour Bookings —RythuSphere', desc: 'Find and book farm labour with PaySure escrow protection.' },
  '/transport': { title: 'Transport —RythuSphere', desc: 'Book transport for your produce. Live tracking available.' },
  '/equipment': { title: 'Equipment Rental —RythuSphere', desc: 'Rent farm equipment —tractors, harvesters, sprayers and more.' },
  '/feed': { title: 'Community Feed —RythuSphere', desc: 'Connect with farmers, share knowledge, and learn from the community.' },
  '/profile': { title: 'My Profile —RythuSphere', desc: 'Your farming profile, badges, and farm health score.' },
  '/subscription': { title: 'Subscription Plans —RythuSphere', desc: 'Upgrade your plan for premium features and priority support.' },
  '/knowledge': { title: 'Knowledge Hub —RythuSphere', desc: 'Farming tips, best practices, and expert articles.' },
  '/network': { title: 'Farmer Network —RythuSphere', desc: 'Connect with farmers and explore villages near you.' },
  '/suppliers': { title: 'Input Suppliers —RythuSphere', desc: 'Find seeds, fertilizers, and farm inputs from verified suppliers.' },
  '/cold-storage': { title: 'Cold Storage —RythuSphere', desc: 'Find and book cold storage facilities near you.' },
  '/brokers': { title: 'Brokers & Buyers —RythuSphere', desc: 'Connect with verified brokers and buyers for your produce.' },
  '/my-transport-machinery': { title: 'My Transport & Machinery —RythuSphere', desc: 'Manage your vehicles and farm machinery.' },
  '/settings': { title: 'Settings —RythuSphere', desc: 'App preferences, language, and account settings.' },
};

export default function SEOHead() {
  const { pathname } = useLocation();
  useEffect(() => {
    initAnalytics();
    const meta = PAGE_META[pathname] || { title: 'RythuSphere —Smart Agriculture Platform', desc: 'Digital farming platform for Andhra Pradesh.' };
    document.title = meta.title;
    let descTag = document.querySelector('meta[name="description"]');
    if (!descTag) { descTag = document.createElement('meta'); descTag.name = 'description'; document.head.appendChild(descTag); }
    descTag.content = meta.desc;
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) { ogTitle = document.createElement('meta'); ogTitle.setAttribute('property', 'og:title'); document.head.appendChild(ogTitle); }
    ogTitle.content = meta.title;
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) { ogDesc = document.createElement('meta'); ogDesc.setAttribute('property', 'og:description'); document.head.appendChild(ogDesc); }
    ogDesc.content = meta.desc;
    trackPageView(pathname, meta.title);
  }, [pathname]);
  return null;
}
