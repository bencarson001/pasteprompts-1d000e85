// Paste Prompts service worker — safe offline shell.
//
// v2: the previous version cached *every* GET response cache-first, including
// failed/404 responses for hashed JS chunks. After a redeploy that produced a
// permanent black screen (an HTML error body served as a JS module). This
// version never caches non-OK responses and always goes to the network first
// for documents, scripts and styles.
const CACHE = "pp-cache-v2";
const APP_SHELL = ["/offline.html"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((c) => c.addAll(APP_SHELL)).catch(() => {}));
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data === "pp-purge") {
    event.waitUntil(caches.keys().then((keys) => Promise.all(keys.map((k) => caches.delete(k)))));
  }
});

function isCacheableAsset(request) {
  const dest = request.destination;
  return dest === "image" || dest === "font";
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (url.origin !== self.location.origin) return;

  // Documents: network-first, offline page as last resort. Never cache HTML —
  // a stale document can reference asset hashes that no longer exist.
  if (request.mode === "navigate") {
    event.respondWith(fetch(request).catch(() => caches.match("/offline.html")));
    return;
  }

  // Scripts, styles and everything else dynamic: always network. Falling back
  // to a stale cached chunk is what caused blank screens after deploys.
  if (!isCacheableAsset(request)) return;

  // Images and fonts only: cache-first, and only store successful responses.
  event.respondWith(
    caches.match(request).then(
      (cached) =>
        cached ||
        fetch(request)
          .then((res) => {
            if (res && res.ok && res.type === "basic") {
              const copy = res.clone();
              caches.open(CACHE).then((c) => c.put(request, copy)).catch(() => {});
            }
            return res;
          })
          .catch(() => cached),
    ),
  );
});
