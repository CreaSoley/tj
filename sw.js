const CACHE_NAME = "sensei-v5";

const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "/home.html",
  "/offline.html",
  "/loading.html",

  // UV pages
  "/uv1.html",
  "/uv2.html",
  "/uv3.html",
  "/uv4.html",
  "/uv5.html",
  "/uv6.html",

  // Banner
  "/banner.html",
  "/banner.css",

  // Styles
  "/style.css",

  // JSON
  "/kihon_enchainements_simples.json",
  "/kihon_simples.json",

  // Scripts
  "/encart1.js",
  "/encart2.js",
  "/encart56.js",

  // Media
  "/bbp.mp3",
  "/beep.mp3",
  "/bip.mp3",
  "/ding.mp3",
  "/notif.mp3",
  "/silence.mp3",
  "/top.mp3",

  // Images / gifs
  "/atemi5.gif",
  "/cle5.gif",
  "/projection5.gif",
  "/kata2.gif",

  // Icons
  "/icon-192.png",
  "/icon-512.png",
  "/logo-192.png",
  "/logopwa2.png",
  "/load.png",

  // Fonts
  "/Spicy Sale.ttf",
  "/SuperMeatball.ttf",
  "/fredoka.ttf",
  "/shanghai.ttf",

  // Assets folder
  "/assets/logopwa.png",

  // Manifest
  "/manifest.json"
];

// INSTALLATION
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(FILES_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// ACTIVATION
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    )
  );
  self.clients.claim();
});

// FETCH
self.addEventListener("fetch", event => {
  if (event.request.mode === "navigate") {
    // Navigation → Offline fallback
    event.respondWith(
      fetch(event.request).catch(() => caches.match("/offline.html"))
    );
  } else {
    // Cache first
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
