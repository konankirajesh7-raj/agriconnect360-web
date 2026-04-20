/**
 * Service Worker — AgriConnect 360 PWA
 * Phase 10A: Offline caching, background sync, cache-first for Weather/Prices
 */

const CACHE_NAME = 'agri360-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.svg',
];

const API_CACHE = 'agri360-api-v1';
const API_CACHE_DURATION = 4 * 60 * 60 * 1000; // 4 hours

// ── Install: Pre-cache app shell ────────────────────────────────────────────
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('🌾 Service Worker: Caching app shell');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// ── Activate: Clean old caches ──────────────────────────────────────────────
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME && name !== API_CACHE)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// ── Fetch: Network-first for API, Cache-first for static ────────────────────
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // API requests (Supabase, Weather, Prices) → Stale-while-revalidate
  if (url.hostname.includes('supabase.co') ||
      url.hostname.includes('open-meteo.com') ||
      url.hostname.includes('data.gov.in') ||
      url.pathname.startsWith('/api/')) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }

  // Static assets → Cache first
  if (url.pathname.match(/\.(js|css|png|jpg|svg|woff2|ico)$/)) {
    event.respondWith(cacheFirst(event.request));
    return;
  }

  // HTML pages → Network first, fallback to cache
  event.respondWith(networkFirst(event.request));
});

// ── Cache Strategies ────────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached || offlineFallback();
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(API_CACHE);
  const cached = await cache.match(request);

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => cached);

  return cached || fetchPromise;
}

function offlineFallback() {
  return new Response(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>AgriConnect 360 — Offline</title>
      <style>
        body { background: #0a1628; color: #e0e7f1; font-family: Inter, sans-serif;
               display: flex; align-items: center; justify-content: center;
               height: 100vh; margin: 0; text-align: center; }
        .offline { max-width: 400px; padding: 32px; }
        h1 { font-size: 2rem; margin-bottom: 8px; }
        p { color: #8b9dc3; font-size: 1rem; line-height: 1.6; }
        .icon { font-size: 4rem; margin-bottom: 16px; }
        .retry { margin-top: 20px; padding: 12px 32px; background: #10b981;
                 color: white; border: none; border-radius: 8px; font-size: 1rem;
                 cursor: pointer; }
      </style>
    </head>
    <body>
      <div class="offline">
        <div class="icon">📡</div>
        <h1>You're Offline</h1>
        <p>No internet connection. Your data is saved locally and will sync when you're back online.</p>
        <button class="retry" onclick="location.reload()">🔄 Try Again</button>
      </div>
    </body>
    </html>
  `, { headers: { 'Content-Type': 'text/html' } });
}

// ── Background Sync: Process queued submissions ─────────────────────────────
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-offline-queue') {
    event.waitUntil(processOfflineQueue());
  }
  if (event.tag === 'sync-prices') {
    event.waitUntil(refreshPrices());
  }
});

async function processOfflineQueue() {
  console.log('🔄 Background sync: Processing offline queue...');
  // The actual queue processing is handled by offlineQueue.js in the main thread
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'PROCESS_OFFLINE_QUEUE' });
  });
}

async function refreshPrices() {
  console.log('💰 Background sync: Refreshing market prices...');
  const clients = await self.clients.matchAll();
  clients.forEach(client => {
    client.postMessage({ type: 'REFRESH_PRICES' });
  });
}

// ── Periodic Background Sync (every 4h for prices) ─────────────────────────
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'refresh-prices') {
    event.waitUntil(refreshPrices());
  }
});

// ── Push Notifications ──────────────────────────────────────────────────────
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New update from AgriConnect 360',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
    actions: [
      { action: 'view', title: '👀 View' },
      { action: 'dismiss', title: '❌ Dismiss' },
    ],
  };
  event.waitUntil(
    self.registration.showNotification(data.title || '🌾 AgriConnect 360', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  if (event.action === 'view' || !event.action) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});
