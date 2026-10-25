// Caché offline de Bombi Fixer (mvo3jd2j). Sirve la app desde caché y la actualiza en segundo plano.
const CACHE = 'serie-mvo3jd2j';
const SHELL = ['./', './index.html', './manifest.webmanifest', './icon.svg', './icon-192.png', './icon-512.png', './icon-maskable-192.png', './icon-maskable-512.png', './apple-touch-icon.png', './favicon-32.png'];
self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  // Solo la propia app (y sus fuentes tipográficas).
  const own = url.origin === self.location.origin;
  const fonts = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname);
  if (e.request.method !== 'GET' || (!own && !fonts)) return;
  e.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const key = own && e.request.mode === 'navigate' ? './index.html' : e.request;
      const cached = await cache.match(key);
      const network = fetch(e.request)
        .then((res) => { if (res.ok || res.type === 'opaque') cache.put(key, res.clone()); return res; })
        .catch(() => cached);
      return cached || network;
    }),
  );
});
