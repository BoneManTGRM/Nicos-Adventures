const LEGACY_CACHE_MARKER = "nicos-world-static-v22";
const CACHE = "nicos-world-static-v65-moonpaw-world-map";
const FISHING_DOCUMENT = "/games/starfall-anglers/";
const GAME_DOCUMENTS = [FISHING_DOCUMENT, "/games/timberline-hunt/", "/games/luma-lagoon/", "/games/skullwing/", "/games/mascaras-del-volcan/", "/games/moonpaw/"];
const OFFLINE_ASSET_MANIFEST = "/offline-assets.json";
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
  "/asset-recovery.js",
  "/dinosaur-art.js",
  NICO_ART,
  ...APPROVED_NICO_ART,
  ...DRAG_NICO_ART,
];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const response = await fetch(OFFLINE_ASSET_MANIFEST, { cache: "no-store" });
    if (!response.ok) throw new Error("Golden Adventure offline manifest unavailable");
    const manifest = await response.json();
    if (!Array.isArray(manifest.assets)) throw new Error("Golden Adventure offline manifest is invalid");
    const cache = await caches.open(CACHE);
    await cache.addAll([...new Set([...SHELL, OFFLINE_ASSET_MANIFEST, ...manifest.assets])]);
  })());
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

// Cloudflare redirects /index.html to /. A cached followed redirect cannot be
// returned directly to a navigation whose redirect mode is manual.
async function offlineDocument(path = "/index.html") {
  const cached = await caches.match(path);
  if (!cached || !cached.ok || !/text\/html\b/i.test(cached.headers.get("content-type") || "")) return Response.error();
  if (!cached.redirected) return cached;
  const headers = new Headers(cached.headers);
  // Cache bodies are decoded. Keep all privacy/security headers, not wire sizes.
  headers.delete("content-encoding");
  headers.delete("content-length");
  return new Response(await cached.arrayBuffer(), { status: cached.status, statusText: cached.statusText, headers });
}

// Safari uses byte ranges even for short inline videos. Build a range from
// the complete precached movie, never replacing it with a partial response.
async function fishingClip(request, path) {
  const cached = await caches.match(path);
  if (!cached || cached.status !== 200) return fetch(request);
  const range = request.headers.get("Range");
  if (!range) return cached;
  const match = /^bytes=(\d*)-(\d*)$/i.exec(range);
  if (!match || (!match[1] && !match[2])) return cached;
  const body = await cached.arrayBuffer();
  const size = body.byteLength;
  const start = match[1] ? Number(match[1]) : Math.max(0, size - Number(match[2]));
  const end = match[1] && match[2] ? Math.min(size - 1, Number(match[2])) : size - 1;
  if (start > end || start >= size) {
    return new Response(null, {status: 416, headers: {"Content-Range": `bytes */${size}`, "Accept-Ranges": "bytes"}});
  }
  return new Response(body.slice(start, end + 1), {status: 206, headers: {
    "Content-Type": "video/mp4", "Accept-Ranges": "bytes",
    "Content-Range": `bytes ${start}-${end}/${size}`, "Content-Length": String(end - start + 1),
  }});
}

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);

  if (url.origin === self.location.origin && url.pathname.startsWith(FISHING_DOCUMENT+"clips/") && url.pathname.endsWith(".mp4")) {
    event.respondWith(fishingClip(event.request, url.pathname));
    return;
  }

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
    const gameDocument = url.origin === self.location.origin && GAME_DOCUMENTS.find(
      path => [path, path.slice(0, -1), path + "index.html"].includes(url.pathname)
    );
    event.respondWith(
      fetch(event.request, { cache: "no-store" })
        .then(async (response) => {
          // Only canonical HTML entries have the no-transform privacy policy.
          // An arbitrary SPA fallback must not replace that protected offline shell.
          const canonicalShell = url.origin === self.location.origin
            && ["/", "/index.html"].includes(url.pathname);
          if (response.ok && canonicalShell && /text\/html\b/i.test(response.headers.get("content-type") || "")) {
            const copy = response.clone();
            const cache = await caches.open(CACHE);
            await cache.put("/index.html", copy);
          }
          return response;
        })
        .catch(() => offlineDocument(gameDocument || "/index.html"))
    );
    return;
  }

  if (url.origin !== self.location.origin) return;

  event.respondWith(
    fetch(event.request, { cache: "no-store" })
      .then(async (response) => {
        if (response.ok && response.type === "basic") {
          const copy = response.clone();
          // A full or unavailable Cache Storage must not discard a successful
          // network response (particularly styles, scripts and artwork on iOS).
          try {
            const cache = await caches.open(CACHE);
            await cache.put(event.request, copy);
          } catch { /* Serve the response even when offline storage is unavailable. */ }
        }
        return response;
      })
      .catch(async () => (await caches.match(event.request, { ignoreSearch: true, ignoreVary: true })) || Response.error())
  );
});

void LEGACY_CACHE_MARKER;
