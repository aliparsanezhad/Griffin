// GriffinSwap PWA Service Worker - Anti-Censorship & Offline Resilience
const CACHE_NAME = 'griffinswap-v7';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/mascot/griffi-avatar.jpg',
  '/mascot/griffi-wave.jpg',
  '/mascot/griffi-flower.jpg',
  '/mascot/griffi-egg.jpg',
  '/mascot/griffi-hero.jpg',
  '/mascot/griffi-hero-banner.jpg',
  '/mascot/griffi-vault.jpg',
  '/mascot/griffi-security.jpg',
  '/mascot/griffi-navigator.jpg',
  '/mascot/griffi-analyst.jpg',
  '/mascot/griffi-trader.jpg',
  '/mascot/griffi-inspector.jpg',
  '/mascot/griffi-guardian.jpg',
  '/mascot/griffi-celebration.jpg',
  '/mascot/griffi-telegram.jpg',
  '/mascot/griffi-phishing-shield.jpg',
];

// Install: Cache critical static assets
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.warn('Pre-cache partial failure, continuing:', err);
      });
    })
  );
});

// Activate: Clean up old caches and take control
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: Stale-While-Revalidate for local assets; Network-First for API
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // For API or live oracle endpoints: Network first, fallback to cached or offline response
  if (url.pathname.startsWith('/api') || url.hostname.includes('nobitex') || url.hostname.includes('wallex')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Return offline rate JSON if offline
            return new Response(
              JSON.stringify({
                usdt_irt: 92850,
                change_24h: '+0.4%',
                source: 'offline-cache',
                timestamp: Date.now(),
              }),
              { headers: { 'Content-Type': 'application/json' } }
            );
          });
        })
    );
    return;
  }

  // For static app shell and images: Stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
