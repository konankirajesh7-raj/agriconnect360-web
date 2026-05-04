/**
 * Analytics Service for RythuSphere
 * Supports Google Analytics (GA4) with privacy-first defaults
 */

const GA_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

let initialized = false;

export function initAnalytics() {
  if (initialized || !GA_ID) return;
  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_ID}`;
  document.head.appendChild(script);
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;
  gtag('js', new Date());
  gtag('config', GA_ID, { anonymize_ip: true, send_page_view: false });
  initialized = true;
}

export function trackPageView(path, title) {
  if (!window.gtag) return;
  window.gtag('event', 'page_view', { page_path: path, page_title: title });
}

export function trackEvent(eventName, params = {}) {
  if (!window.gtag) return;
  window.gtag('event', eventName, params);
}

// Pre-built events
export const analytics = {
  signup: (method) => trackEvent('sign_up', { method }),
  login: (method) => trackEvent('login', { method }),
  subscribe: (plan, price) => trackEvent('purchase', { currency: 'INR', value: price, items: [{ item_name: plan }] }),
  search: (query) => trackEvent('search', { search_term: query }),
  viewItem: (item) => trackEvent('view_item', { items: [{ item_name: item }] }),
  addListing: (type) => trackEvent('add_listing', { listing_type: type }),
  pageView: trackPageView,
};

export default analytics;
