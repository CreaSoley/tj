const CACHE_NAME = 'taijitsu-cache-v8';

const urlsToCache = [
  // HTML
  'index.html',
  'home.html',
  'banner.html',
  'loading.html',
  'offline.html',
  'uv1.html',
  'uv2.html',
  'uv3.html',
  'uv4.html',
  'uv5.html',
  'uv6.html',

  // CSS
  'style.css',
  'banner.css',

  // JS
  'encart12.js',
  'encart2.js',
  'encart56.js',

  // Images / GIF
  'kata2.gif',
  'atemi5.gif',
  'cle5.gif',
  'projection5.gif',
  'load.png',
  'offline.png',
  'logopwa2.png',
  'icon-192.png',
  'icon-512.png',
  'logo-192.png',
  'assets/logopwa.png',

  // Polices
  'fredoka.ttf',
  'shanghai.ttf',
  'Spicy Sale.ttf',
  'SuperMeatball.ttf',

  // Sons
  'bbp.mp3',
  'beep.mp3',
  'bip.mp3',
  'ding.mp3',
  'notif.mp3',
  'silence.mp3',
  'top.mp3',

  // Données
  'kihon_maj2025.json',
  'kihon_simples.json',
  'tjkihon.json',

  // PWA
  'manifest.json'
];

// INSTALLATION
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      Promise.all(
        urlsToCache.map((url) =>
          cache.add(url).catch((err) => {
            console.warn(`⚠️ Cache impossible : ${url}`, err);
          })
        )
      )
    ).then(() => self.skipWaiting())
  );
});

// ACTIVATION
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

// FETCH
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      return fetch(event.request).catch(() => caches.match('offline.html'));
    })
  );
});
