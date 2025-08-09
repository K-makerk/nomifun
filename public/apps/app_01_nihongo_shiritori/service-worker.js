const CACHE_NAME = "gesture-app-v1";
const ASSETS = [
  "./index.html",
  "./style.css",
  "./script.js",
  "./manifest.webmanifest",
  "/images/logo.png",
  "/images/qrcode.png"
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((c) => c.addAll(ASSETS)));
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches.match(e.request).then((res) => res || fetch(e.request).then((net) => {
      const copy = net.clone();
      caches.open(CACHE_NAME).then((c) => c.put(e.request, copy));
      return net;
    }).catch(() => caches.match("./index.html")))
  );
});