// Bump on every release: a changed sw.js is how phones learn that a new version exists.
const CACHE = "smkfree-v111";
const ASSETS = [
  "./",
  "./index.html",
  "./install.html",
  "./legal.html",
  "./app.js",
  "./app-core.js",
  "./native.js",
  "./i18n.js",
  "./styles.css",
  "./ios.css",
  "./manifest.webmanifest",
  "./assets/icon.svg",
  "./assets/favicon-32x32.png",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/html2canvas.min.js",
  "./assets/qr-code.svg",
  "./assets/stickers/emoji_u1f331.svg",
  "./assets/stickers/emoji_u1f4aa.svg",
  "./assets/stickers/emoji_u2b50.svg",
  "./assets/stickers/emoji_u1fac1.svg",
  "./assets/stickers/emoji_u1f3c5.svg",
  "./assets/stickers/emoji_u1f3c6.svg",
  "./assets/stickers/emoji_u1f680.svg",
  "./assets/stickers/emoji_u1f48e.svg",
  "./assets/stickers/emoji_u1f308.svg",
  "./assets/stickers/emoji_u1f451.svg",
];

// Install: fetch every file fresh from the server (never from the browser's HTTP cache),
// then take over right away instead of waiting until every tab is closed.
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE)
      .then((c) => c.addAll(ASSETS.map((url) => new Request(url, { cache: "reload" }))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k.startsWith("smkfree-") && k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Pages, scripts and styles: network first, so a normal reload always shows the newest version.
// The cache only answers when offline. Images and other files: cache first (they rarely change).
function isAppCode(request, url) {
  return request.mode === "navigate" || /\.(html|js|css|webmanifest)$/.test(url.pathname) || url.pathname.endsWith("/");
}

self.addEventListener("fetch", (e) => {
  const request = e.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (isAppCode(request, url)) {
    e.respondWith(
      fetch(request, { cache: "no-cache" })
        .then((res) => {
          if (res.ok) {
            const copy = res.clone();
            caches.open(CACHE).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }).then((cached) => cached || caches.match("./index.html")))
    );
    return;
  }

  e.respondWith(
    caches.match(request).then((cached) => cached || fetch(request).then((res) => {
      if (res.ok) {
        const copy = res.clone();
        caches.open(CACHE).then((cache) => cache.put(request, copy));
      }
      return res;
    }))
  );
});
