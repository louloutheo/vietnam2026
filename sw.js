const CACHE = 'vn-2026-v5';
self.addEventListener('install', e => {
    self.skipWaiting();
    e.waitUntil(caches.open(CACHE).then(c => c.addAll(['/vietnam2026/', '/vietnam2026/index.html', '/vietnam2026/manifest.json'])));
});
self.addEventListener('activate', e => {
    e.waitUntil(caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
    e.respondWith(fetch(e.request).catch(() => caches.match(e.request)));
});
