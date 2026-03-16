const CACHE = 'vn-2026-v6';
const APP_SHELL = [
  '/vietnam2026/',
  '/vietnam2026/index.html',
  '/vietnam2026/manifest.json',
  '/vietnam2026/icon.png'
];

self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(APP_SHELL))
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(key => key !== CACHE)
        .map(key => caches.delete(key))
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const req = event.request;
  const url = new URL(req.url);

  // On ne gère que GET
  if (req.method !== 'GET') return;

  // Ressources locales de l'app : network first, fallback cache
  if (url.origin === self.location.origin) {
    event.respondWith(
      fetch(req)
        .then(res => {
          const copy = res.clone();
          caches.open(CACHE).then(cache => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then(res => res || caches.match('/vietnam2026/index.html')))
    );
    return;
  }

  // Ressources externes : cache first si déjà vues, sinon réseau
  event.respondWith(
    caches.match(req).then(cached => {
      if (cached) return cached;
      return fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(cache => cache.put(req, copy));
        return res;
      });
    }).catch(() => caches.match('/vietnam2026/index.html'))
  );
});
