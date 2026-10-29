// Globetrotter offline support: keeps a copy of all three editions (World, USA, Earth) on the device.
// Pages open instantly from the saved copy, and a fresh copy is fetched in the background for next time.
// The app checks version.json and offers "tap to update" when a newer version is online.
const CACHE = "globetrotter-v4";
const CORE = ["./", "./usa/", "./earth/", "./map-hi.json", "./manifest.webmanifest", "./icon-180.png", "./icon-192.png", "./icon-512.png"];

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

// "/globetrotter/usa/index.html" and "/globetrotter/usa/" are the same page
function pageKey(u) { const url = new URL(u); url.search = ""; url.hash = ""; url.pathname = url.pathname.replace(/index\.html$/, ""); return url.href; }

self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.pathname.endsWith("/version.json") || url.searchParams.has("fresh")) return;   // always straight from the network

  // Pages: serve the saved copy right away, refresh it in the background.
  if (req.mode === "navigate") {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE), key = pageKey(req.url);
      const hit = await cache.match(key);
      const net = fetch(req, {cache: "no-store"}).then(res => { if (res.ok) cache.put(key, res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      try { return await net; }
      catch (err) { return (await cache.match(new URL("./", self.registration.scope).href)) || Response.error(); }
    })());
    return;
  }

  // Everything else (fonts, the detailed map, icons): saved copy first, refreshed in the background.
  if (url.origin === self.location.origin || url.hostname === "fonts.googleapis.com" || url.hostname === "fonts.gstatic.com") {
    e.respondWith((async () => {
      const cache = await caches.open(CACHE);
      const hit = await cache.match(req);
      const net = fetch(req).then(res => { if (res.ok || res.type === "opaque") cache.put(req, res.clone()); return res; });
      if (hit) { e.waitUntil(net.catch(() => {})); return hit; }
      return net;
    })());
  }
});
