// Globetrotter offline support: keeps a copy of both editions (World and USA) on the device.
const CACHE = "globetrotter-v2";
const CORE = ["./", "./usa/", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", e => {
  e.waitUntil((async () => {
    for (const k of await caches.keys()) if (k !== CACHE) await caches.delete(k);
    await self.clients.claim();
    for (const c of await self.clients.matchAll()) c.postMessage("cached");
  })());
});

function timeout(ms) { return new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)); }
// "/globetrotter/usa/index.html" and "/globetrotter/usa/" are the same page
function pageKey(u) { const url = new URL(u); url.search = ""; url.hash = ""; url.pathname = url.pathname.replace(/index\.html$/, ""); return url.href; }

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Pages: network first, with a short timeout so slow plane Wi-Fi falls back to the saved copy.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE), key = pageKey(req.url);
      try {
        const res = await Promise.race([fetch(req), timeout(4000)]);
        if (res && res.ok) { cache.put(key, res.clone()); return res; }
        throw new Error("bad response");
      } catch (err) {
        return (await cache.match(key)) || (await cache.match(new URL("./", self.registration.scope).href)) || Response.error();
      }
    })());
    return;
  }

  if (url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { cache.put(req, res.clone()); return res; }).catch(() => hit);
      return hit || net;
    })());
    return;
  }

  if (url.origin === self.location.origin) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      if (res.ok) caches.open(CACHE).then(c => c.put(req, res.clone()));
      return res;
    })));
  }
});
