
const CACHE_NAME = "vnm26-os-ultimate-v1";
const ASSETS = [
  "./","./index.html","./icon.png","./manifest.json",
  "./css/base.css","./css/theme.css","./css/layout.css","./css/windows.css","./css/components.css","./css/responsive.css",
  "./js/app.js","./js/config.js","./js/state.js","./js/storage.js","./js/utils.js",
  "./js/data/default-trip.js","./js/map/map-engine.js","./js/map/map-cesium.js",
  "./js/ui/windows.js","./js/ui/navigation.js","./js/ui/carousel.js","./js/ui/theme.js",
  "./js/features/planning.js","./js/features/budget.js","./js/features/survival.js",
  "./assets/icons/icon-192.png","./assets/icons/icon-512.png"
];
self.addEventListener("install", e => e.waitUntil(caches.open(CACHE_NAME).then(c => c.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener("activate", e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  e.respondWith(caches.match(e.request).then(cached => cached || fetch(e.request).then(resp => {
    if (!resp || resp.status !== 200 || resp.type === "opaque") return resp;
    const copy = resp.clone();
    caches.open(CACHE_NAME).then(c => c.put(e.request, copy));
    return resp;
  }).catch(()=>cached)));
});
