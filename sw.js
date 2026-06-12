// Ardali site Service Worker — v1
// Network-first for HTML pages (always fresh), cache-first for assets (fast)

const CACHE = 'ardali-v1';
const HTML = /\.html(\?.*)?$|\/articles\/?$/;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);

  // Always fetch fresh HTML from the network
  if (HTML.test(url.pathname) || url.pathname === '/') {
    e.respondWith(
      fetch(e.request, { cache: 'no-store' })
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, clone));
          return res;
        })
        .catch(() => caches.match(e.request))
    );
    return;
  }

  // Cache-first for images, fonts, scripts
  e.respondWith(
    caches.match(e.request)
      .then(cached => cached || fetch(e.request).then(res => {
        const clone = res.clone();
        caches.open(CACHE).then(c => c.put(e.request, clone));
        return res;
      }))
  );
});
