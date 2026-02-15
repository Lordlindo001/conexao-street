const CACHE = "cs-v1";
const CORE = [
  "./",
  "./index.html",
  "./products.html",
  "./checkout.html",
  "./member.html",
  "./offline.html",
  "./styles.css",
  "./app.js",
  "./ui.js",
  "./products.js",
  "./checkout.js",
  "./checkout-orders.js",
  "./member.js",
  "./effects.js",
  "./enhance.js",
  "./products.json",
  "./manifest.json",
  "./favicon.png",
  "./apple-touch-icon.png",
  "./img/og.jpg",
  "./img/offline.jpg",
  "./img/placeholder.jpg"
];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(CORE)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => k !== CACHE && caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  const url = new URL(req.url);

  // Only handle same-origin GET
  if (req.method !== "GET" || url.origin !== location.origin) return;

  // Network-first for JSON (fresh)
  if (url.pathname.endsWith("products.json")) {
    e.respondWith(
      fetch(req).then(res => {
        const copy = res.clone();
        caches.open(CACHE).then(c => c.put(req, copy));
        return res;
      }).catch(() => caches.match(req))
    );
    return;
  }

  // Cache-first for everything else, fallback offline
  e.respondWith(
    caches.match(req).then((cached) => cached || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match("./offline.html")))
  );
});
