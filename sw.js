const CACHE_NAME = 'vn-cache-v17'; // Le "v17" force la mise à jour !
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    './icon.png'
];

// Installation : on sauvegarde les fichiers vitaux
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting(); // Force le nouveau SW à s'installer de suite
});

// Activation : on nettoie les vieilles versions corrompues (comme la carte noire)
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cache => {
                    if (cache !== CACHE_NAME) {
                        return caches.delete(cache);
                    }
                })
            );
        })
    );
    self.clients.claim(); // Force la prise de contrôle immédiate
});

// Stratégie "Network First" : Essaie internet d'abord, sinon prends le cache
self.addEventListener('fetch', event => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
