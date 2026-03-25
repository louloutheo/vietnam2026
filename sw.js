/**
 * sw.js — Service Worker OS Ultimate
 *
 * Stratégies de cache :
 *   - App shell (HTML/CSS/JS)  → Cache First (offline total)
 *   - Tuiles Mapbox            → Cache First avec fallback réseau
 *   - APIs météo/taux          → Network First avec fallback cache
 */

const CACHE_VERSION = 'os-ultimate-v1';
const CACHE_TILES   = 'os-tiles-v1';

// Assets de l'app à pré-cacher à l'installation
const APP_SHELL = [
    '/',
    '/index.html',
    '/style.css',
    '/js/main.js',
    '/js/map-engine.js',
    '/js/solar.js',
    '/js/voyage-data.js',
    '/js/ui-windows.js',
    '/js/planning.js',
    '/js/budget.js',
    '/js/survie.js',
    '/manifest.json',
    '/icon.png',
    // Black Marble — mise en cache dès le premier chargement
    'https://eoimages.gsfc.nasa.gov/images/imagerecords/144000/144898/BlackMarble_2016_01deg_geo.jpg',
];

// ─── INSTALLATION ───────────────────────────────────────────────────────────

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then((cache) => {
            // On cache silencieusement — les erreurs individuelles n'arrêtent pas tout
            return Promise.allSettled(
                APP_SHELL.map(url => cache.add(url).catch(e => console.warn('[SW] Skip cache:', url)))
            );
        })
    );
    self.skipWaiting();
});

// ─── ACTIVATION ─────────────────────────────────────────────────────────────

self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys
                    .filter(k => k !== CACHE_VERSION && k !== CACHE_TILES)
                    .map(k => caches.delete(k))
            )
        )
    );
    self.clients.claim();
});

// ─── FETCH INTERCEPTOR ──────────────────────────────────────────────────────

self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // ── Tuiles Mapbox → Cache First ──
    if (isTileRequest(url)) {
        event.respondWith(cacheFirstStrategy(event.request, CACHE_TILES));
        return;
    }

    // ── APIs réseau (météo, taux de change, traduction) → Network First ──
    if (isApiRequest(url)) {
        event.respondWith(networkFirstStrategy(event.request));
        return;
    }

    // ── App Shell → Cache First ──
    event.respondWith(cacheFirstStrategy(event.request, CACHE_VERSION));
});

// ─── STRATÉGIES ─────────────────────────────────────────────────────────────

/**
 * Cache First : sert depuis le cache, sinon réseau (et met en cache)
 */
async function cacheFirstStrategy(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cached = await cache.match(request);
    if (cached) return cached;

    try {
        const response = await fetch(request);
        if (response.ok) {
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        return new Response('Offline', { status: 503 });
    }
}

/**
 * Network First : essaie le réseau, fallback cache si offline
 */
async function networkFirstStrategy(request) {
    try {
        const response = await fetch(request);
        if (response.ok) {
            const cache = await caches.open(CACHE_VERSION);
            cache.put(request, response.clone());
        }
        return response;
    } catch {
        const cache = await caches.open(CACHE_VERSION);
        const cached = await cache.match(request);
        return cached || new Response(JSON.stringify({ error: 'offline' }), {
            headers: { 'Content-Type': 'application/json' },
            status: 503,
        });
    }
}

// ─── HELPERS ────────────────────────────────────────────────────────────────

function isTileRequest(url) {
    return (
        url.hostname.includes('mapbox.com') ||
        url.hostname.includes('tiles.mapbox.com') ||
        url.pathname.includes('/v4/') ||
        url.pathname.includes('/styles/v1/')
    );
}

function isApiRequest(url) {
    return (
        url.hostname.includes('api.exchangerate-api.com') ||
        url.hostname.includes('api.open-meteo.com') ||
        url.hostname.includes('api.mymemory.translated.net')
    );
}
