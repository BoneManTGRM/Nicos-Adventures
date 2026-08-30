const LEGACY_CACHE_MARKER = "nicos-world-static-v19";
const CACHE = "nicos-world-static-v20";
const NICO_ART = "/assets/nico/nico-guide-art.b64";
const APPROVED_NICO_ART = [
  "/assets/nico/approved/character.part1.b64",
  "/assets/nico/approved/character.part2.b64",
  "/assets/nico/approved/character.part3.b64",
  "/assets/nico/approved/outfits.part1.b64",
  "/assets/nico/approved/outfits.part2.b64",
  "/assets/nico/approved/outfits.part3.b64",
  "/assets/nico/approved/outfits.part4.b64",
  "/assets/nico/approved/outfits.part5.b64",
];
const DRAG_NICO_ART = [
  "/assets/nico/drag/nico-base.webp.b64",
  "/assets/nico/drag/outfits.webp.b64",
  "/assets/nico/drag/about.webp.b64",
];
const SHELL = [
  "/",
  "/index.html",
  "/manifest.webmanifest",
  "/wildlife-director.js",
  "/asset-recovery.js",
  "/dinosaur-art.js",
  NICO_ART,
  ...APPROVED_NICO_ART,
  ...DRAG_NICO_ART,
];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener("message", (event) => {
  if (event.data === "SKIP_WAITING") self.skipWaiting();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin && url.pathname.endsWith("/assets/nico/nico-fullbody.b64")) {
    event.respondWith(
      Promise.all(APPROVED_NICO_ART.slice(0, 3).map(async (path) => {
        const response = await fetch(path, { cache: "no-store" }).catch(() => caches.match(path));
        if (!response) throw new Error("Approved Nico art unavailable");
        return response.text();
      })).then((chunks) => new Response(chunks.join(""), {
        headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" },
      })).catch(async () => (await caches.match(NICO_ART)) || Response.error())
    );
    return;
  }

  if (event.request.mode === "navigate") {
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(async (response) => {
          if (response.ok) {
            const copy = response.clone();
            const cache = await caches.open(CACHE);
            await cache.put("/index.html", copy);
          }
          return response;
        })
        .catch(async () => (await caches.match("/index.html")) || Response.error())
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(async (response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          const cache = await caches.open(CACHE);
          await cache.put(event.request, copy);
        }
        return response;
      })
      .catch(async () => (await caches.match(event.request)) || Response.error())
  );
});

void LEGACY_CACHE_MARKER;
