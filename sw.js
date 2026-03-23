const CACHE_NAME = 'vnm26-premium-cache-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './icon.png',
  './manifest.json',
  // On met en cache la base de Cesium pour le hors-ligne
  'https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Cesium.js',
  'https://cesium.com/downloads/cesiumjs/releases/1.114/Build/Cesium/Widgets/widgets.css'
];

// Installation : on met en cache les fichiers vitaux
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('📦 Mise en cache des assets Premium...');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
});

// Interception des requêtes réseau
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // Stratégie "Cache First" pour les tuiles de carte CartoDB (économie de data massive)
  if (requestUrl.hostname.includes('cartocdn.com')) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        if (cachedResponse) return cachedResponse;
        return fetch(event.request).then((networkResponse) => {
          return caches.open('vnm26-map-tiles').then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
    return;
  }

  // Stratégie "Stale-While-Revalidate" pour le reste de l'app
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, networkResponse.clone());
        });
        return networkResponse;
      }).catch(() => {
        // Fallback si vraiment aucun réseau
        console.log('🔴 Mode 100% Hors-Ligne activé');
      });
      return cachedResponse || fetchPromise;
    })
  );
});
