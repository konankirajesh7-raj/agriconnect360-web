/**
 * AgriConnect 360 — Performance Utilities (Phase 15B)
 * Image optimization, caching, lazy loading, bundle analysis helpers
 */

/** 15B.3 — Image Optimization (WebP + Lazy Load) */
export function getOptimizedImageUrl(url, { width = 400, quality = 75, format = 'webp' } = {}) {
  if (!url) return '';
  if (url.includes('supabase.co/storage')) {
    const separator = url.includes('?') ? '&' : '?';
    return `${url}${separator}width=${width}&quality=${quality}&format=${format}`;
  }
  return url;
}

export function createImagePlaceholder(width = 400, height = 300) {
  return `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${width}' height='${height}'%3E%3Crect fill='%23161b22' width='${width}' height='${height}'/%3E%3Ctext x='50%25' y='50%25' fill='%23484f58' font-size='14' text-anchor='middle' dy='.3em'%3ELoading...%3C/text%3E%3C/svg%3E`;
}

/** 15B.4 — Database Query Optimization Indexes (SQL) */
export const RECOMMENDED_INDEXES = `
-- Phase 15B: Performance indexes for hot query paths
CREATE INDEX IF NOT EXISTS idx_farmers_auth_id ON farmers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_farmers_district ON farmers(district);
CREATE INDEX IF NOT EXISTS idx_farmers_state ON farmers(state);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_crops_farmer_id ON crops(farmer_id);
CREATE INDEX IF NOT EXISTS idx_crops_name ON crops(crop_name);
CREATE INDEX IF NOT EXISTS idx_expenses_farmer_date ON expenses(farmer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_sales_farmer_date ON sales(farmer_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_fields_farmer_id ON fields(farmer_id);
CREATE INDEX IF NOT EXISTS idx_market_prices_crop_date ON market_prices(crop_name, date DESC);
CREATE INDEX IF NOT EXISTS idx_knowledge_category ON knowledge_articles(category);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON disputes(status);
CREATE INDEX IF NOT EXISTS idx_equipment_available ON equipment(is_available);
`;

/** 15B.6 — In-Memory Cache (for market prices, weather) */
class MemoryCache {
  constructor(defaultTTL = 300000) {
    this.store = new Map();
    this.defaultTTL = defaultTTL;
  }

  set(key, value, ttl = this.defaultTTL) {
    this.store.set(key, { value, expiry: Date.now() + ttl, created: Date.now() });
    if (this.store.size > 500) this._evict();
  }

  get(key) {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) { this.store.delete(key); return null; }
    return entry.value;
  }

  has(key) { return this.get(key) !== null; }
  delete(key) { this.store.delete(key); }
  clear() { this.store.clear(); }
  size() { return this.store.size; }

  _evict() {
    const entries = [...this.store.entries()].sort((a, b) => a[1].created - b[1].created);
    const toRemove = Math.floor(entries.length * 0.25);
    entries.slice(0, toRemove).forEach(([key]) => this.store.delete(key));
  }

  getStats() {
    let expired = 0, active = 0;
    for (const [, entry] of this.store) { Date.now() > entry.expiry ? expired++ : active++; }
    return { total: this.store.size, active, expired };
  }
}

export const priceCache = new MemoryCache(300000);    // 5 min for prices
export const weatherCache = new MemoryCache(600000);  // 10 min for weather
export const generalCache = new MemoryCache(900000);  // 15 min general

/** 15B.7 — Code Splitting Helpers */
export function preloadRoute(importFn) {
  if (typeof importFn === 'function') importFn();
}

export function prefetchOnHover(importFn) {
  let loaded = false;
  return {
    onMouseEnter: () => { if (!loaded) { importFn(); loaded = true; } },
    onFocus: () => { if (!loaded) { importFn(); loaded = true; } },
  };
}

/** 15B.8 — Performance Monitoring */
export function measurePageLoad() {
  if (typeof window === 'undefined' || !window.performance) return null;
  const nav = performance.getEntriesByType('navigation')[0];
  if (!nav) return null;
  return {
    dns: Math.round(nav.domainLookupEnd - nav.domainLookupStart),
    tcp: Math.round(nav.connectEnd - nav.connectStart),
    ttfb: Math.round(nav.responseStart - nav.requestStart),
    download: Math.round(nav.responseEnd - nav.responseStart),
    domParse: Math.round(nav.domInteractive - nav.responseEnd),
    domReady: Math.round(nav.domContentLoadedEventEnd - nav.navigationStart),
    fullLoad: Math.round(nav.loadEventEnd - nav.navigationStart),
    transferSize: nav.transferSize || 0,
  };
}

export function reportWebVitals(onReport) {
  if (typeof window === 'undefined') return;
  try {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        onReport({ name: entry.name, value: entry.startTime || entry.duration, rating: entry.startTime < 2500 ? 'good' : entry.startTime < 4000 ? 'needs-improvement' : 'poor' });
      }
    });
    observer.observe({ type: 'largest-contentful-paint', buffered: true });
    observer.observe({ type: 'first-input', buffered: true });
    observer.observe({ type: 'layout-shift', buffered: true });
  } catch (e) { /* PerformanceObserver not supported */ }
}

export default { getOptimizedImageUrl, priceCache, weatherCache, generalCache, measurePageLoad, reportWebVitals, prefetchOnHover };
